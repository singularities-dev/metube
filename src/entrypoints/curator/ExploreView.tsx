import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { openMeTubeDB } from '@/lib/db';
import {
  EMPTY_CONTEXT, LESSER_SEEN_MAX_VIEWS, POPULAR_MIN_VIEWS, discoveryQuery, gatherPool, moodQuery, rankFeed, searchIntoPool,
  unchartedQuery, unknownChannelVideos, type ChannelScope, type Pool, type Popularity,
} from '@/lib/feed';
import { TIME_PRESETS, timeWindow, todayValue, type TimePreset } from '@/lib/timerange';
import type { SearchOptions } from '@/lib/api/client';
import { activateMood, effectiveMood, localiseMoods, moodPath, quickMoods, type MoodState } from '@/lib/moods';
import type { Prefs } from '@/lib/prefs';
import { normaliseTag, type TagPrefs } from '@/lib/tags';
import { CATEGORIES, type VideoMeta } from '@/lib/api/types';
import { client, store } from '@/lib/services';
import { allFeedback, dismissVideo, getFeedback, rateVideo, restoreFeedback, type Dismissal, type Feedback, type Rating } from '@/lib/feedback';
import { buildModel, learnedMoodTags, moodChannels, moodSuggestions, topTags, type PreferenceModel } from '@/lib/model';
import { searchTerms, suggestableTerms } from '@/lib/engagement';
import { loadImpressions, recordOpened, recordShown } from '@/lib/impressions';
import { isOnYouTube, listSubscriptions, restoreSubscription, subscribe as subscribeTo, unsubscribe as unsubscribeFrom } from '@/lib/subscriptions';
import type { MessageKey, Translate } from '@/lib/i18n/catalogs';
import { ErrorText, moodName, T, unchartedTopicLabels, unchartedTopicName, useI18n } from './i18n';
import { MoodPicker } from './MoodPicker';
import { MoodEditor } from './MoodEditor';
import { SkeletonGrid } from './SkeletonGrid';
import { VideoGrid } from './VideoGrid';
import { PlayerModal } from './PlayerModal';
import { MinusIcon, PlusIcon, RefreshIcon, SearchIcon, SparkIcon } from './Icons';

interface Props {
  prefs: Prefs;
  tags: TagPrefs;
  moods: { state: MoodState; update: (s: MoodState) => void };
  hasKey: boolean | undefined;
  dataVersion: number;
  onGoToSettings: () => void;
  onFeedbackChange: () => void;
  updatePrefs: (p: Partial<Prefs>) => void;
}

type Busy = 'pool' | 'fresh' | 'mood' | 'discover' | 'search' | null;

const SCOPES: { id: ChannelScope; label: MessageKey; hint: MessageKey }[] = [
  { id: 'all', label: 'explore.scope.all.label', hint: 'explore.scope.all.hint' },
  { id: 'known', label: 'explore.scope.known.label', hint: 'explore.scope.known.hint' },
  { id: 'new', label: 'explore.scope.new.label', hint: 'explore.scope.new.hint' },
  { id: 'uncharted', label: 'explore.scope.uncharted.label', hint: 'explore.scope.uncharted.hint' },
];
/** `views` is the threshold, shown in the language's short form (10K, 10 k, 1 Mio.). */
const POPULARITY: { id: Popularity; label: MessageKey; views?: number }[] = [
  { id: 'any', label: 'explore.views.any' },
  { id: 'lesser', label: 'explore.views.lesser', views: LESSER_SEEN_MAX_VIEWS },
  { id: 'popular', label: 'explore.views.popular', views: POPULAR_MIN_VIEWS },
];
/** Below this many videos from new channels, "New to me" runs a discovery search. */
const MIN_NEW_VIDEOS = 12;
/** With filters on and fewer matches than this, offer a YouTube search. */
const FEW_MATCHES = 8;
/** Text worded when shown, so a message on screen follows a change of language. */
type Wording = (t: Translate) => string;
interface Toast { message: Wording; undo?: () => Promise<void> }

export function ExploreView({ prefs, tags, moods, hasKey, dataVersion, onGoToSettings, onFeedbackChange, updatePrefs }: Props) {
  const { t, fmt, locale } = useI18n();
  const [pool, setPool] = useState<Pool>();
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<{ cause: unknown }>();
  const [note, setNote] = useState<{ message: Wording }>();
  const [only, setOnly] = useState<string[]>([]);
  const [hide, setHide] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [timePreset, setTimePreset] = useState<TimePreset>('any');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [popularity, setPopularity] = useState<Popularity>('any');
  const [shown, setShown] = useState(prefs.pageSize);
  const [editingMood, setEditingMood] = useState(false);
  const [model, setModel] = useState<PreferenceModel>();
  // Snapshot of impressions taken at load time, so recording new ones doesn't reshuffle the page.
  const [rankImpressions, setRankImpressions] = useState<Map<string, number>>(new Map());
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [fresh, setFresh] = useState(false);
  const [keep, setKeep] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Toast>();
  const [loadStamp, setLoadStamp] = useState(0);
  const toastTimer = useRef<number | undefined>(undefined);
  // Each Fresh feed steps "New to me" on to the next interest.
  const [freshStep, setFreshStep] = useState(0);
  const [searchInterests, setSearchInterests] = useState<string[]>([]);
  const scope = prefs.channelScope;

  const window_ = timeWindow(timePreset, customRange);
  // Starter moods' tags in the UI language (until the user edits them), so what's shown,
  // matched, given as a reason and searched for all agree. Changes are saved to moods.state.
  const localMoods = useMemo(() => localiseMoods(moods.state.moods, locale), [moods.state.moods, locale]);
  const mood = effectiveMood(localMoods, moods.state.activeId);
  const path = moodPath(localMoods, moods.state.activeId);
  const activeMood = path.at(-1);
  const query = activeMood ? moodQuery(mood.include, activeMood.include) : '';
  const pathIds = path.map((m) => m.id).join('/');

  const moodChannelMap = useMemo(
    () => (model && path.length ? moodChannels(model, path.map((m) => m.id)) : new Map<string, number>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, pathIds],
  );
  const learnedChannels = [...moodChannelMap.keys()].slice(0, 10).map((id) => ({ channelId: id, title: model?.channelTitles.get(id) ?? id }));
  // Anything that changes which videos a mood needs fetched.
  const moodKey = `${query}|${learnedChannels.map((c) => c.channelId).join(',')}`;

  const reloadModel = useCallback(async () => {
    setModel(buildModel(await allFeedback(await openMeTubeDB())));
  }, []);
  useEffect(() => void reloadModel(), [reloadModel, dataVersion]);

  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());
  const reloadSubscriptions = useCallback(async () => {
    setSubscribed(new Set((await listSubscriptions(await openMeTubeDB())).map((s) => s.channelId)));
  }, []);
  useEffect(() => void reloadSubscriptions(), [reloadSubscriptions, dataVersion]);

  const snapshotImpressions = useCallback(async () => {
    const imp = await loadImpressions(store);
    setRankImpressions(new Map(Object.entries(imp.shown)));
    setOpened(new Set(Object.keys(imp.opened)));
  }, []);

  useEffect(() => {
    (async () => {
      const db = await openMeTubeDB();
      setSearchInterests(suggestableTerms(searchTerms(await db.getAll('searches'))).slice(0, 15).map((s) => s.term));
    })();
  }, [dataVersion]);

  /**
   * Builds the candidate pool: your channels (plus the mood's learned channels),
   * the mood's search, and a discovery search when "New to me" needs one.
   * Normal uses caches where they're current; fresh re-fetches and rotates harder.
   */
  const build = useCallback(async (mode: 'normal' | 'fresh' = 'normal', cause: 'load' | 'mood' | 'scope' = 'load') => {
    setBusy(mode === 'fresh' ? 'fresh' : cause === 'mood' ? 'mood' : cause === 'scope' ? 'discover' : 'pool');
    setError(undefined);
    try {
      await snapshotImpressions();
      const db = await openMeTubeDB();
      const step = mode === 'fresh' ? freshStep + 1 : freshStep;
      if (mode === 'fresh') setFreshStep(step);
      let p = await gatherPool(db, client, {
        channels: prefs.poolChannels,
        uploadsPerChannel: prefs.uploadsPerChannel,
        force: mode === 'fresh',
        extraChannels: learnedChannels.map((c) => ({ channelId: c.channelId, channelTitle: c.title })),
        hideShorts: prefs.hideShorts,
      });
      let units = p.apiCallsMade;
      // Uncharted sets moods aside, so it doesn't spend units on the mood's search.
      if (scope !== 'uncharted' && query && prefs.moodFetch) {
        const r = await searchIntoPool(db, client, p, query, { kind: 'mood', force: mode === 'fresh' });
        p = r.pool;
        units += r.unitsUsed;
      }
      let discovered = '';
      if (scope === 'new') {
        if (mode === 'fresh' || unknownChannelVideos(p, model) < MIN_NEW_VIDEOS) {
          const interests = [...tags.liked, ...(model ? topTags(model.tags, 10).liked.map(([tag]) => tag) : []), ...searchInterests];
          discovered = discoveryQuery(interests, step);
          const r = await searchIntoPool(db, client, p, discovered, { kind: 'discover', discoverFor: 'new', force: mode === 'fresh' });
          p = r.pool;
          units += r.unitsUsed;
        } else {
          p = { ...p, discoverFor: 'new' };
        }
      } else if (scope === 'uncharted') {
        // Avoid anything you already like, watch, search for or have blocked. The topics
        // are English, so a starter mood's shipped English tags count as well as the shown ones;
        // their labels in every UI language are compared too, so your own words count in any of them.
        const avoid = [
          ...tags.liked, ...tags.blocked, ...searchInterests,
          ...(model ? topTags(model.tags, 30).liked.map(([tag]) => tag) : []),
          ...localMoods.flatMap((m) => m.include),
          ...moods.state.moods.flatMap((m) => m.include),
        ];
        discovered = unchartedQuery(avoid, step, Date.now(), unchartedTopicLabels);
        const r = await searchIntoPool(db, client, p, discovered, { kind: 'discover', discoverFor: 'uncharted', force: mode === 'fresh' });
        p = r.pool;
        units += r.unitsUsed;
      }
      setPool(p);
      setFresh(mode === 'fresh');
      setKeep(new Set());
      setLoadStamp((n) => n + 1);
      const count = p.channelsChecked;
      const topic = discovered;
      const charting = scope === 'uncharted';
      const shownMood = cause === 'mood' && !charting ? activeMood : undefined;
      // Uncharted charts the topic it searched, one of MeTube's own (shown translated);
      // New to me explores one of the user's interests (shown as it is).
      const lead: Wording = (t) => {
        const shown = charting ? unchartedTopicName(topic, t) : topic;
        if (mode === 'fresh') {
          if (!topic) return t('explore.note.fresh', { count });
          return t(charting ? 'explore.note.fresh.charting' : 'explore.note.fresh.exploring', { count, topic: shown });
        }
        if (shownMood) {
          const mood = moodName(shownMood, t);
          return topic ? t('explore.note.mood.exploring', { mood, topic: shown }) : t('explore.note.mood', { mood });
        }
        if (units) return topic ? t(charting ? 'explore.note.updated.charting' : 'explore.note.updated.exploring', { topic: shown }) : t('explore.note.updated');
        return topic ? t(charting ? 'explore.note.upToDate.charting' : 'explore.note.upToDate.exploring', { topic: shown }) : t('explore.note.upToDate');
      };
      setNote({ message: (t) => `${lead(t)} ${t('common.unitsUsed', { count: units })}` });
    } catch (e) {
      setError({ cause: e });
    } finally {
      setBusy(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.poolChannels, prefs.uploadsPerChannel, prefs.hideShorts, prefs.moodFetch, query, moodKey, scope, model, tags.liked, tags.blocked, searchInterests, freshStep, snapshotImpressions, moods.state.moods, localMoods]);

  const load = build;

  // Initial load, and after imports or settings changes. Mood changes are handled below.
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    if (hasKey) void loadRef.current('normal');
  }, [hasKey, dataVersion, prefs.poolChannels, prefs.uploadsPerChannel, prefs.hideShorts]);

  // Changing mood fetches what it needs (its search, its channels), cached; then re-ranks.
  const lastMoodKey = useRef(moodKey);
  useEffect(() => {
    if (!pool || moodKey === lastMoodKey.current) return;
    lastMoodKey.current = moodKey;
    void loadRef.current('normal', 'mood');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodKey]);

  // Switching to "New to me" or Uncharted runs its discovery search once (cached after that).
  useEffect(() => {
    if (!pool || busy) return;
    if ((scope === 'new' || scope === 'uncharted') && pool.discoverFor !== scope) void loadRef.current('normal', 'scope');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, pool]);

  useEffect(
    () => setShown(prefs.pageSize),
    [prefs.pageSize, only, hide, category, moods.state.activeId, timePreset, customRange, popularity, scope],
  );

  const moodLearned = useMemo(
    () => (model && path.length ? learnedMoodTags(model, path.map((m) => m.id)) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, moods.state.activeId, moods.state.moods],
  );

  const items = useMemo(() => {
    if (!pool) return [];
    const watched = opened.size ? new Set([...pool.watched, ...opened]) : pool.watched;
    return rankFeed({ ...pool, watched }, {
      ...EMPTY_CONTEXT,
      likedTags: tags.liked,
      blockedTags: tags.blocked,
      moodInclude: mood.include,
      moodExclude: mood.exclude,
      onlyTags: only,
      hideTags: hide,
      categoryId: category,
      hideShorts: prefs.hideShorts,
      hideWatched: prefs.hideWatched,
      perChannelCap: prefs.perChannelCap,
      model,
      moodLearned,
      impressions: rankImpressions,
      fresh,
      keep,
      moodIntensity: activeMood?.intensity,
      moodChannels: moodChannelMap,
      channelScope: scope,
      publishedAfter: window_.after,
      publishedBefore: window_.before,
      popularity,
    });
    // mood arrays are rebuilt each render; key them by content instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, tags, mood.include.join('|'), mood.exclude.join('|'), only, hide, category, prefs.hideShorts, prefs.hideWatched, prefs.perChannelCap, model, moodLearned, rankImpressions, fresh, keep, opened, activeMood?.intensity, moodChannelMap, scope, window_.after, window_.before, popularity]);

  // Count what the first page showed, once per load (used for rotation next time).
  useEffect(() => {
    if (!loadStamp || !items.length) return;
    void recordShown(store, items.slice(0, prefs.pageSize).map((i) => i.video.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStamp]);

  /** Toasts with Undo stay long enough to reach by keyboard, and never close while hovered or focused. */
  const toastHeld = useRef(false);
  function scheduleToastClose(next: Toast | undefined) {
    window.clearTimeout(toastTimer.current);
    if (!next) return;
    toastTimer.current = window.setTimeout(() => {
      if (toastHeld.current) scheduleToastClose(next);
      else setToast(undefined);
    }, next.undo ? 20_000 : 6000);
  }
  function showToast(next: Toast) {
    setToast(next);
    scheduleToastClose(next);
  }

  async function afterFeedback(prev: Feedback | undefined, v: VideoMeta, message: Wording) {
    await reloadModel();
    onFeedbackChange();
    showToast({
      message,
      undo: async () => {
        await restoreFeedback(await openMeTubeDB(), v.id, prev);
        setKeep((k) => new Set([...k, v.id]));
        await reloadModel();
        onFeedbackChange();
        setToast(undefined);
      },
    });
  }

  async function rate(v: VideoMeta, r: Rating | null) {
    const db = await openMeTubeDB();
    const prev = await getFeedback(db, v.id);
    await rateVideo(db, v, r, moods.state.activeId);
    // Keep the tile in place for now so the rating is visible; it hides on the next refresh.
    setKeep((k) => new Set([...k, v.id]));
    const mood = activeMood;
    await afterFeedback(prev, v, (t) => {
      if (r === null) return t('explore.toast.ratingRemoved');
      const rating = t(`rating.${r}.short`);
      return mood ? t('explore.toast.ratedForMood', { rating, mood: moodName(mood, t) }) : t('explore.toast.rated', { rating });
    });
  }

  async function dismiss(v: VideoMeta, reason: Dismissal) {
    const db = await openMeTubeDB();
    const prev = await getFeedback(db, v.id);
    await dismissVideo(db, v, reason, moods.state.activeId);
    setKeep((k) => { const n = new Set(k); n.delete(v.id); return n; });
    await afterFeedback(prev, v, (t) => (reason === 'hide-channel'
      ? t('explore.toast.channelHidden', { channel: v.channelTitle })
      : t(`explore.toast.removed.${reason}`)));
  }

  async function toggleSubscription(v: VideoMeta, on: boolean) {
    const db = await openMeTubeDB();
    const prev = await db.get('subscriptions', v.channelId);
    if (on) await subscribeTo(db, v.channelId, v.channelTitle);
    else await unsubscribeFrom(db, v.channelId);
    await reloadSubscriptions();
    onFeedbackChange();
    const syncToo = !!prev && isOnYouTube(prev);
    showToast({
      message: (t) => (on
        ? t('explore.toast.subscribed', { channel: v.channelTitle })
        : t(syncToo ? 'explore.toast.unsubscribedSync' : 'explore.toast.unsubscribed', { channel: v.channelTitle })),
      undo: async () => {
        await restoreSubscription(await openMeTubeDB(), v.channelId, prev);
        await reloadSubscriptions();
        onFeedbackChange();
        setToast(undefined);
      },
    });
  }

  async function opened_(v: VideoMeta) {
    await recordOpened(store, v.id);
  }

  const [playing, setPlaying] = useState<VideoMeta | null>(null);
  function play(v: VideoMeta) {
    setPlaying(v);
    void opened_(v);
  }

  function addFilter(kind: 'only' | 'hide') {
    const tag = normaliseTag(draft);
    if (!tag) return;
    if (kind === 'only') { setOnly((l) => (l.includes(tag) ? l : [...l, tag])); setHide((l) => l.filter((x) => x !== tag)); }
    else { setHide((l) => (l.includes(tag) ? l : [...l, tag])); setOnly((l) => l.filter((x) => x !== tag)); }
    setDraft('');
  }

  /** The search follows the When, Views and category filters, so results fit them. */
  const searchOptions: SearchOptions = {
    publishedAfter: window_.after,
    publishedBefore: window_.before,
    order: popularity === 'popular' ? 'viewCount' : popularity === 'lesser' ? 'date' : 'relevance',
    categoryId: category,
  };

  /**
   * Searches YouTube for the typed text (or the Only filters) and shows the
   * results: typed text becomes an Only filter, and results count as matching
   * the search even when their titles word it differently. `query` searches
   * exactly that instead, leaving any typed text alone (the "Search YouTube
   * for …" link names its query, so it must search that one).
   */
  async function search(query?: string) {
    const typed = query ? '' : normaliseTag(draft);
    const q = query || typed || only.join(' ');
    if (!q || !pool) return;
    setBusy('search');
    setError(undefined);
    try {
      const r = await searchIntoPool(await openMeTubeDB(), client, pool, q, { kind: 'search', search: searchOptions });
      setPool(r.pool);
      if (typed) {
        setOnly((l) => (l.includes(typed) ? l : [...l, typed]));
        setHide((l) => l.filter((x) => x !== typed));
        setDraft('');
      }
      const used = r.unitsUsed;
      setNote({
        message: (t) => `${t('explore.note.searchAdded', { query: q })} ${used ? t('common.unitsUsed', { count: used }) : t('explore.note.fromLibrary')}`,
      });
    } catch (e) {
      setError({ cause: e });
    } finally {
      setBusy(null);
    }
  }

  function clearFilters() {
    setOnly([]);
    setHide([]);
    setCategory(null);
    setTimePreset('any');
    setCustomRange({ from: '', to: '' });
    setPopularity('any');
  }

  if (hasKey === false) {
    return (
      <section className="view">
        <header className="view-head"><h1>{t('app.nav.explore')}</h1></header>
        <div className="empty-state">
          <h2>{t('explore.noKey.title')}</h2>
          <p>{t('explore.noKey.body')}</p>
          <button className="button" onClick={onGoToSettings}>{t('explore.noKey.openSettings')}</button>
        </div>
      </section>
    );
  }

  const filtersOn = only.length + hide.length > 0 || category !== null || timePreset !== 'any' || popularity !== 'any';
  const quick = quickMoods(moods.state.moods, moods.state.activeId, 4);
  const hasInterests = tags.liked.length > 0 || searchInterests.length > 0 || (model ? topTags(model.tags, 1).liked.length > 0 : false);
  const suggestions = model && activeMood ? moodSuggestions(model, path.map((m) => m.id), [...activeMood.include, ...activeMood.exclude]) : [];
  const busyText: Record<Exclude<Busy, null>, string> = {
    pool: t('explore.busy.pool'),
    fresh: t('explore.busy.fresh'),
    // No mood (just cleared or deleted), or one Uncharted sets aside: the reload only updates the feed.
    mood: activeMood && scope !== 'uncharted' ? t('explore.busy.mood', { mood: moodName(activeMood, t) }) : t('explore.busy.pool'),
    discover: t(scope === 'uncharted' ? 'explore.busy.uncharted' : 'explore.busy.new'),
    search: t('explore.busy.search'),
  };
  const scopeHint = SCOPES.find((s) => s.id === scope)?.hint;
  const searchTerm = normaliseTag(draft) || only.join(' ');
  // Filters narrowed the feed to a handful: offer to look further on YouTube.
  const fewMatches = !!pool && !busy && filtersOn && only.length > 0 && items.length < FEW_MATCHES;
  const today = todayValue();
  const guard = (fn: () => void) => () => { if (!busy) fn(); };

  return (
    <section className="view" aria-labelledby="explore-title">
      <h1 id="explore-title" className="sr-only">{t('app.nav.explore')}</h1>
      <header className="view-head">
        <MoodPicker state={moods.state} onChange={moods.update} />
        {quick.length > 0 && (
          <div className="quick-moods" role="group" aria-label={t('explore.quickMoods')}>
            {quick.map((m) => (
              <button key={m.id} className="quick-mood" onClick={() => moods.update(activateMood(moods.state, m.id))} aria-label={t('explore.switchTo', { mood: moodName(m, t) })}>
                {moodName(m, t)}
              </button>
            ))}
          </div>
        )}
        {activeMood && (
          <button className="link-button" onClick={() => setEditingMood((v) => !v)} aria-expanded={editingMood} aria-controls="mood-editor">
            {editingMood ? t('common.done') : t('explore.editMood')}
          </button>
        )}
        <div className="head-actions">
          {/* aria-disabled keeps focus on the button while the feed is busy (disabled would drop it). */}
          <button
            className="chip-button"
            onClick={guard(() => load('fresh'))}
            aria-disabled={!!busy}
            aria-describedby="fresh-hint"
          >
            <SparkIcon width={16} height={16} /> {t('explore.freshFeed')}
          </button>
          <span id="fresh-hint" className="sr-only">{t('explore.freshFeed.hint')}</span>
          <button className="icon-button" onClick={guard(() => load('normal'))} aria-disabled={!!busy} aria-label={t('explore.refresh')} title={t('explore.refresh.title')}>
            <RefreshIcon className={busy === 'pool' || busy === 'mood' ? 'spin' : undefined} />
          </button>
        </div>
      </header>

      {activeMood && editingMood && (
        <div id="mood-editor">
          <MoodEditor
            key={activeMood.id}
            mood={activeMood}
            state={moods.state}
            update={moods.update}
            suggestions={suggestions}
            learnedChannels={learnedChannels}
            query={query}
            searchOff={!prefs.moodFetch ? 'setting' : scope === 'uncharted' ? 'uncharted' : undefined}
            autoMoods={prefs.autoMoods}
            onDeleted={() => setEditingMood(false)}
          />
        </div>
      )}

      <div className="toolbar glass" role="search" aria-label={t('explore.filter.region')}>
        <div className="filter-field">
          <SearchIcon className="filter-icon" />
          <input
            className="bare"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addFilter(e.shiftKey ? 'hide' : 'only'); }
            }}
            placeholder={t('explore.filter.placeholder')}
            aria-label={t('explore.filter.placeholder')}
            aria-describedby="filter-hint"
          />
          <button className="chip-button" onClick={() => addFilter('only')} disabled={!draft.trim()} aria-label={draft.trim() ? t('explore.filter.only.label', { tag: draft.trim() }) : t('explore.filter.only')}>
            <PlusIcon width={16} height={16} /> {t('explore.filter.only')}
          </button>
          <button className="chip-button" onClick={() => addFilter('hide')} disabled={!draft.trim()} aria-label={draft.trim() ? t('explore.filter.hide.label', { tag: draft.trim() }) : t('explore.filter.hide')}>
            <MinusIcon width={16} height={16} /> {t('explore.filter.hide')}
          </button>
          <button
            className="chip-button accent"
            onClick={guard(() => search())}
            aria-disabled={!!busy || !searchTerm}
            disabled={!searchTerm}
            aria-describedby="search-hint"
          >
            {busy === 'search' ? t('explore.search.busy') : t('explore.search')}
          </button>
        </div>
        <p id="filter-hint" className="hint filter-hint">
          {t('explore.filter.hint')} <span id="search-hint">{t('explore.search.hint')}</span>
        </p>

        {(only.length > 0 || hide.length > 0) && (
          <ul className="chips active-filters" aria-label={t('explore.filter.active')}>
            {only.map((tag) => (
              <li key={`o-${tag}`} className="chip" data-tone="like">
                <span className="chip-kind">{t('explore.filter.chip.only')}</span>{tag}
                <button aria-label={t('explore.filter.removeOnly', { tag })} onClick={() => setOnly((l) => l.filter((x) => x !== tag))}>×</button>
              </li>
            ))}
            {hide.map((tag) => (
              <li key={`h-${tag}`} className="chip" data-tone="block">
                <span className="chip-kind">{t('explore.filter.chip.hide')}</span>{tag}
                <button aria-label={t('explore.filter.removeHide', { tag })} onClick={() => setHide((l) => l.filter((x) => x !== tag))}>×</button>
              </li>
            ))}
          </ul>
        )}

        <div className="toolbar-row">
          <div className="segmented scope" role="group" aria-label={t('explore.scope.group')} aria-describedby="scope-hint">
            {SCOPES.map((sc) => (
              <button key={sc.id} aria-pressed={scope === sc.id} onClick={() => updatePrefs({ channelScope: sc.id })}>
                {t(sc.label)}
              </button>
            ))}
          </div>
          <label className="select-field">
            <select aria-label={t('explore.time.label')} value={timePreset} onChange={(e) => setTimePreset(e.target.value as TimePreset)}>
              {TIME_PRESETS.map((p) => <option key={p} value={p}>{t(`explore.time.${p}`)}</option>)}
            </select>
          </label>
          {timePreset === 'custom' && (
            <fieldset className="date-range">
              <legend className="sr-only">{t('explore.time.customRange')}</legend>
              <label className="select-field">
                <span className="select-label">{t('explore.time.from')}</span>
                <input type="date" aria-label={t('explore.time.from')} max={customRange.to || today} value={customRange.from} onChange={(e) => setCustomRange((r) => ({ ...r, from: e.target.value }))} />
              </label>
              <label className="select-field">
                <span className="select-label">{t('explore.time.to')}</span>
                <input type="date" aria-label={t('explore.time.to')} min={customRange.from || undefined} max={today} value={customRange.to} onChange={(e) => setCustomRange((r) => ({ ...r, to: e.target.value }))} />
              </label>
            </fieldset>
          )}
          <label className="select-field">
            <select aria-label={t('explore.views.label')} value={popularity} onChange={(e) => setPopularity(e.target.value as Popularity)}>
              {POPULARITY.map((p) => <option key={p.id} value={p.id}>{t(p.label, p.views ? { views: fmt.compact(p.views) } : undefined)}</option>)}
            </select>
          </label>
        </div>
        <p id="scope-hint" className="hint scope-hint">
          {scopeHint && t(scopeHint)}
          {scope === 'uncharted' && activeMood ? ` ${t('explore.scope.uncharted.moodPaused', { mood: moodName(activeMood, t) })}` : ''}
        </p>
        <div className="categories" role="group" aria-label={t('explore.category.group')}>
          <button aria-pressed={category === null} className="pill" onClick={() => setCategory(null)}>{t('explore.category.all')}</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} aria-pressed={category === c.id} className="pill" onClick={() => setCategory(category === c.id ? null : c.id)}>
              {t(`category.${c.id}` as MessageKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="feed-progress" data-active={busy ? true : undefined} aria-hidden />
      <div className="status-row">
        <p className="status-line" role="status">
          {error ? <span className="error"><ErrorText error={error.cause} /></span> : busy ? busyText[busy] : note?.message(t)}
          {pool && !busy && !error && filtersOn ? ` ${t('explore.matches', { count: items.length })}` : ''}
        </p>
        {fewMatches && (
          <button className="link-button" onClick={guard(() => search(only.join(' ')))}>{t('explore.searchFor', { query: only.join(' ') })}</button>
        )}
        {filtersOn && <button className="link-button" onClick={clearFilters}>{t('explore.clearFilters')}</button>}
      </div>

      {pool && !items.length && !busy && (
        <div className="empty-state">
          <h2>{t('explore.empty.title')}</h2>
          <p>
            {t(scope === 'new' && !hasInterests
              ? 'explore.empty.newNoInterests'
              : scope === 'new'
              ? 'explore.empty.new'
              : scope === 'uncharted'
              ? 'explore.empty.uncharted'
              : filtersOn || activeMood
              ? 'explore.empty.filtered'
              : 'explore.empty.noChannels')}
          </p>
        </div>
      )}

      <h2 className="sr-only">{t('explore.videos')}</h2>
      {busy && busy !== 'search' && (!pool || !items.length) ? (
        <SkeletonGrid count={Math.min(prefs.pageSize, 12)} />
      ) : (
        <div className="feed" aria-busy={busy ? true : undefined} data-refreshing={busy && busy !== 'search' ? true : undefined}>
          <VideoGrid items={items.slice(0, shown)} ratings={model?.ratings ?? new Map()} onRate={rate} onDismiss={dismiss} onOpen={opened_} onPlay={play} playInline={prefs.playInline} subscribed={subscribed} onSubscribe={toggleSubscription} />
        </div>
      )}

      {items.length > shown && (
        <div className="more">
          <button className="button secondary" onClick={() => setShown((n) => n + prefs.pageSize)}>
            {t('common.showMore', { count: Math.min(prefs.pageSize, items.length - shown) })}
          </button>
        </div>
      )}
      <p className="attribution">
        <T k="explore.attribution" components={{ link: <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" /> }} />
      </p>
      {playing && (
        <PlayerModal
          video={playing}
          rating={model?.ratings.get(playing.id) as Rating | undefined}
          onRate={rate}
          onDismiss={dismiss}
          onClose={() => setPlaying(null)}
          subscribed={subscribed.has(playing.channelId)}
          onSubscribe={toggleSubscription}
        />
      )}

      {/* Always mounted, so screen readers announce each new message. */}
      <div
        className="toast-region"
        role="status"
        onMouseEnter={() => { toastHeld.current = true; }}
        onMouseLeave={() => { toastHeld.current = false; }}
        onFocus={() => { toastHeld.current = true; }}
        onBlur={() => { toastHeld.current = false; }}
      >
        {toast && (
          <div className="toast glass">
            <span>{toast.message(t)}</span>
            {toast.undo && <button className="link-button" onClick={toast.undo}>{t('common.undo')}</button>}
            <button className="icon-button small" aria-label={t('common.dismissMessage')} onClick={() => setToast(undefined)}>×</button>
          </div>
        )}
      </div>
    </section>
  );
}

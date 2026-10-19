import { useEffect, useRef, useState } from 'react';
import { loadAll, openMeTubeDB } from '@/lib/db';
import { channelEngagement, type ChannelEngagement } from '@/lib/engagement';
import { allFeedback, clearDismissal, rateVideo, removeRating, unhideChannel, RATINGS, type Feedback, type Rating } from '@/lib/feedback';
import { desiredYtRating, isPending, markSynced } from '@/lib/sync';
import { buildModel, topTags } from '@/lib/model';
import { getVideos } from '@/lib/cache';
import { hourLabel, watchesByHour, watchesByMonth, type MonthCount } from '@/lib/activity';
import type { MoodState } from '@/lib/moods';
import type { VideoMeta } from '@/lib/api/types';
import { BarChart, type Bar } from './BarChart';
import { RATING_ICONS } from './VideoGrid';
import { isOnYouTube, pendingSubscriptionChanges, subscribe, unsubscribe } from '@/lib/subscriptions';
import type { Subscription } from '@/lib/takeout/types';
import { BellFilledIcon, BellIcon } from './Icons';
import { moodLabelT, T, useI18n } from './i18n';
import type { MessageKey, Translate } from '@/lib/i18n/catalogs';
import type { Format } from '@/lib/i18n/format';
import type { Locale, Params } from '@/lib/i18n';

interface Data {
  watches: number;
  searches: number;
  firstWatch: number | null;
  months: MonthCount[];
  hours: number[];
  channels: ChannelEngagement[];
  feedback: Feedback[];
  videos: Map<string, VideoMeta>;
  learnedLiked: [string, number][];
  learnedDisliked: [string, number][];
  /** Every subscription row, including pending unsubscribes. */
  subscriptions: Subscription[];
}

/** Long subscription lists show this many at a time. */
const SUBS_PAGE = 40;

function subSource(s: Subscription, t: Translate, fmt: Format): string {
  if (s.source === 'metube') return s.subscribedAt ? t('activity.subs.source.metubeOn', { date: fmt.date(s.subscribedAt) }) : t('activity.subs.source.metube');
  if (s.source === 'youtube') return t('activity.subs.source.youtube');
  return t('activity.subs.source.takeout');
}

export function ActivityView({ version, moods, onFeedbackChange }: { version: number; moods: MoodState; onFeedbackChange: () => void }) {
  const { t, fmt, locale } = useI18n();
  const [d, setD] = useState<Data>();
  const [onlyPending, setOnlyPending] = useState(false);
  // Tagged with its language: after a switch it's dropped rather than read out again in the wrong language.
  const [status, setStatus] = useState<{ locale: Locale; text: string }>();
  const [subQuery, setSubQuery] = useState('');
  const [subsShown, setSubsShown] = useState(SUBS_PAGE);

  useEffect(() => {
    (async () => {
      const db = await openMeTubeDB();
      const all = await loadAll(db);
      const feedback = (await allFeedback(db)).sort((a, b) => b.at - a.at);
      const model = buildModel(feedback);
      const { liked, disliked } = topTags(model.tags, 14);
      setD({
        watches: all.watches.filter((w) => !w.isAd).length,
        searches: all.searches.length,
        firstWatch: all.watches.length ? all.watches.reduce((m, w) => Math.min(m, w.time), Infinity) : null,
        months: watchesByMonth(all.watches),
        hours: watchesByHour(all.watches),
        // Watched channels only: subscriptions you haven't watched have their own list.
        channels: channelEngagement(all.watches, all.subscriptions).filter((c) => c.watches > 0).slice(0, 10),
        feedback,
        videos: await getVideos(db, feedback.map((f) => f.videoId)),
        learnedLiked: liked,
        learnedDisliked: disliked,
        subscriptions: await db.getAll('subscriptions'),
      });
    })();
  }, [version]);

  // Where keyboard focus goes once the data reloads after an action (see act).
  const pendingFocus = useRef<(() => void) | null>(null);
  useEffect(() => {
    pendingFocus.current?.();
    pendingFocus.current = null;
  }, [d]);

  if (!d) return null;

  // Bars are labelled at render so they follow the chosen language.
  // Quarterly ticks; January carries the year so the axis is anchored.
  const monthBars: Bar[] = d.months.map((m) => ({
    key: m.key,
    value: m.count,
    label: fmt.monthYear(m.year, m.month),
    tick: m.month === 0 ? String(m.year) : m.month % 3 === 0 || d.months.length <= 8 ? fmt.month(m.month) : undefined,
  }));
  const hourBars: Bar[] = d.hours.map((v, h) => ({ key: String(h), value: v, label: hourLabel(h), tick: h % 6 === 0 ? hourLabel(h) : undefined }));
  const videoCount = (n: number) => t('common.videos', { count: n });

  const rated = d.feedback.filter((f) => f.rating !== null && !f.dismissed);
  // Ratings YouTube doesn't reflect yet, including removed ratings whose like is still there.
  const pendingYt = d.feedback.filter((f) => !f.dismissed && isPending(f));
  const undoOnly = pendingYt.filter((f) => f.rating === null);
  const ratingList = onlyPending ? pendingYt.filter((f) => f.rating !== null) : rated;
  const removed = d.feedback.filter((f) => f.dismissed && f.dismissed !== 'hide-channel');
  const hiddenChannels = [...new Map(d.feedback.filter((f) => f.dismissed === 'hide-channel').map((f) => [f.channelId, f])).values()];
  const ratingCounts = RATINGS.map((r) => ({ ...r, count: rated.filter((f) => f.rating === r.value).length }));
  const maxChannel = Math.max(1, ...d.channels.map((c) => c.watches));
  // A–Z in the chosen language's alphabetical order, so it follows a language switch.
  const collator = new Intl.Collator(locale);
  const subs = d.subscriptions.filter((s) => !s.removed).sort((a, b) => collator.compare(a.channelTitle, b.channelTitle));
  const subbed = new Set(subs.map((s) => s.channelId));
  const pendingSubs = pendingSubscriptionChanges(d.subscriptions);
  const unsubPending = d.subscriptions.filter((s) => s.removed).sort((a, b) => collator.compare(a.channelTitle, b.channelTitle));
  const q = subQuery.trim().toLowerCase();
  const subsMatching = q ? subs.filter((s) => s.channelTitle.toLowerCase().includes(q)) : subs;
  const toggleSub = (channelId: string, channelTitle: string, on: boolean) =>
    act(
      async () => { const db = await openMeTubeDB(); if (on) await subscribe(db, channelId, channelTitle); else await unsubscribe(db, channelId); },
      on ? t('activity.status.subscribed', { channel: channelTitle }) : t('activity.status.unsubscribed', { channel: channelTitle }),
    );
  const titleOf = (f: Feedback) => d.videos.get(f.videoId)?.title;
  /**
   * For accessible names and announcements: names the video, which tells apart
   * the otherwise identical buttons in each row. Without its title (not cached),
   * the second message names its channel instead.
   */
  const aboutVideo = (f: Feedback, withTitle: MessageKey, withChannel: MessageKey, params: Params = {}) => {
    const title = titleOf(f);
    return title ? t(withTitle, { ...params, title }) : t(withChannel, { ...params, channel: f.channelTitle });
  };
  const ratingShort = (r: Rating) => t(`rating.${r}.short` as const);
  const markDoneLabel = (f: Feedback) => aboutVideo(f, 'activity.markDone.label', 'activity.markDone.labelNoTitle');
  const markDoneStatus = (f: Feedback) => aboutVideo(f, 'activity.markDone.status', 'activity.markDone.statusNoTitle');
  const subsHint = [
    subs.length ? t('activity.subs.count', { count: subs.length }) : t('activity.subs.none'),
    pendingSubs.length ? t('activity.subs.pending', { count: pendingSubs.length }) : subs.length ? t('activity.subs.boost') : '',
  ].filter(Boolean).join(' ');

  /**
   * Runs a change, then announces it. The button (and often its row) goes away
   * when the data reloads, so focus moves to the same row if it's still there,
   * else the next or previous row, else the section heading.
   */
  async function act(fn: () => Promise<void>, done: string) {
    const from = document.activeElement as HTMLElement | null;
    const row = from?.closest('li');
    const rows = [row, row?.nextElementSibling, row?.previousElementSibling];
    const heading = from?.closest('section')?.querySelector<HTMLElement>('h2');
    pendingFocus.current = () => {
      if (from?.isConnected) return;
      const target = rows.find((r) => r?.isConnected)?.querySelector<HTMLElement>('button, a, select') ?? heading;
      if (target === heading && heading) heading.tabIndex = -1;
      target?.focus();
    };
    await fn();
    onFeedbackChange();
    setStatus({ locale, text: done });
  }

  return (
    <div className="activity">
      <p className="sr-only" role="status">{status?.locale === locale ? status.text : ''}</p>
      <section className="panel glass">
        <h2>{t('activity.glance.heading')}</h2>
        <dl className="stats">
          <div><dt>{t('activity.glance.watched')}</dt><dd>{fmt.number(d.watches)}</dd></div>
          <div><dt>{t('activity.glance.searches')}</dt><dd>{fmt.number(d.searches)}</dd></div>
          <div><dt>{t('activity.glance.rated')}</dt><dd>{fmt.number(rated.length)}</dd></div>
          <div><dt>{t('activity.glance.removed')}</dt><dd>{fmt.number(removed.length)}</dd></div>
        </dl>
        {d.firstWatch && <p className="hint">{t('activity.glance.since', { date: fmt.date(d.firstWatch) })}</p>}
      </section>

      {d.months.length > 1 && (
        <section className="panel glass">
          <h2>{t('activity.months.heading')}</h2>
          <BarChart bars={monthBars} formatValue={videoCount} valueHeading={t('activity.chart.valueHeading')} caption={t('activity.months.caption')} />
        </section>
      )}

      {d.watches > 0 && (
        <section className="panel glass">
          <h2>{t('activity.hours.heading')}</h2>
          <p className="hint">{t('activity.hours.hint')}</p>
          <BarChart bars={hourBars} formatValue={videoCount} valueHeading={t('activity.chart.valueHeading')} height={120} caption={t('activity.hours.caption')} />
        </section>
      )}

      {d.channels.length > 0 && (
        <section className="panel glass">
          <h2>{t('activity.channels.heading')}</h2>
          <ol className="rank-list">
            {d.channels.map((c) => (
              <li key={c.channelId}>
                <span className="rank-name">{c.channelTitle}</span>
                <span className="rank-bar" aria-hidden><span style={{ width: `${(c.watches / maxChannel) * 100}%` }} /></span>
                <span className="rank-value">{fmt.number(c.watches)}</span>
                <button
                  className="icon-button small"
                  aria-pressed={subbed.has(c.channelId)}
                  aria-label={t('activity.channels.subscribeLabel', { channel: c.channelTitle })}
                  title={subbed.has(c.channelId) ? t('activity.channels.subscribedTitle') : t('activity.channels.subscribeTitle')}
                  onClick={() => toggleSub(c.channelId, c.channelTitle, !subbed.has(c.channelId))}
                >
                  {subbed.has(c.channelId) ? <BellFilledIcon width={16} height={16} /> : <BellIcon width={16} height={16} />}
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="panel glass">
        <h2>{t('activity.subs.heading')}</h2>
        <p className="hint">{subsHint}</p>
        {subs.length > 12 && (
          <label className="select-field sub-find">
            <span className="select-label">{t('activity.subs.find')}</span>
            <input type="search" value={subQuery} onChange={(e) => { setSubQuery(e.target.value); setSubsShown(SUBS_PAGE); }} placeholder={t('activity.subs.findPlaceholder')} />
          </label>
        )}
        {subsMatching.length > 0 && (
          <ul className="feedback-list">
            {subsMatching.slice(0, subsShown).map((s) => (
              <li key={s.channelId}>
                <span className="fb-main">
                  <a href={`https://www.youtube.com/channel/${s.channelId}`} target="_blank" rel="noopener noreferrer">{s.channelTitle}</a>
                  <span className="fb-sub">{isOnYouTube(s) ? subSource(s, t, fmt) : t('activity.subs.notOnYouTube', { source: subSource(s, t, fmt) })}</span>
                </span>
                <button className="button secondary small" aria-label={t('activity.subs.unsubscribeLabel', { channel: s.channelTitle })} onClick={() => toggleSub(s.channelId, s.channelTitle, false)}>
                  {t('activity.subs.unsubscribe')}
                </button>
              </li>
            ))}
          </ul>
        )}
        {q && !subsMatching.length && <p className="hint">{t('activity.subs.noMatch', { query: subQuery.trim() })}</p>}
        {subsMatching.length > subsShown && (
          <button className="link-button" onClick={() => setSubsShown((n) => n + SUBS_PAGE)}>
            {t('common.showMore', { count: Math.min(SUBS_PAGE, subsMatching.length - subsShown) })}
          </button>
        )}
        {unsubPending.length > 0 && (
          <>
            <h3>{t('activity.subs.unsubPending.heading')}</h3>
            <ul className="feedback-list">
              {unsubPending.map((s) => (
                <li key={s.channelId}>
                  <span className="fb-main"><span>{s.channelTitle}</span><span className="fb-sub">{t('activity.subs.unsubPending.note')}</span></span>
                  <button className="button secondary small" aria-label={t('activity.subs.keepLabel', { channel: s.channelTitle })} onClick={() => toggleSub(s.channelId, s.channelTitle, true)}>
                    {t('activity.subs.keep')}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="panel glass">
        <h2>{t('activity.ratings.heading')}</h2>
        <ul className="rating-counts">
          {ratingCounts.map((r) => {
            const Icon = RATING_ICONS[r.value];
            return (
              <li key={r.value} data-rating={r.value}>
                <Icon width={18} height={18} />
                {/* The visible label form; screen readers get a whole sentence instead. */}
                <span className="rating-pair" aria-hidden>
                  <T
                    k="activity.ratings.count"
                    params={{ count: r.count, rating: ratingShort(r.value) }}
                    components={{ n: <span className="rating-count" />, r: <span className="rating-name" /> }}
                  />
                </span>
                <span className="sr-only">{t('activity.ratings.countSpoken', { count: r.count, rating: ratingShort(r.value) })}</span>
              </li>
            );
          })}
        </ul>
        {rated.length > 0 && (
          <div className="list-filter">
            <div className="segmented" role="group" aria-label={t('activity.ratings.filter')}>
              <button aria-pressed={!onlyPending} onClick={() => setOnlyPending(false)}>{t('activity.ratings.filterAll')}</button>
              <button aria-pressed={onlyPending} onClick={() => setOnlyPending(true)}>{t('activity.ratings.filterPending', { count: pendingYt.length })}</button>
            </div>
            {pendingYt.length > 0 && <span className="hint">{t('activity.ratings.pendingHint')}</span>}
          </div>
        )}
        {rated.length === 0 && !undoOnly.length ? (
          <p className="hint">{t('activity.ratings.empty')}</p>
        ) : (
          <ul className="feedback-list">
            {ratingList.slice(0, 80).map((f) => {
              const Icon = RATING_ICONS[f.rating as Rating];
              const want = desiredYtRating(f);
              const pending = isPending(f);
              // What to do on YouTube. A Neutral rating wants nothing there, so a like or dislike already sent must go.
              const ytTodo = !pending ? null
                : want === 'like' ? t('activity.yt.like')
                : want === 'dislike' ? t('activity.yt.dislike')
                : f.ytSynced === 'dislike' ? t('activity.yt.removeDislike') : t('activity.yt.removeLike');
              return (
                <li key={f.videoId}>
                  <span className="fb-icon" data-rating={f.rating}><Icon width={16} height={16} /></span>
                  <span className="fb-main">
                    <a href={`https://www.youtube.com/watch?v=${f.videoId}`} target="_blank" rel="noopener noreferrer">{titleOf(f) ?? t('activity.openOnYouTube')}</a>
                    <span className="fb-sub">
                      {f.moodId && moods.moods.some((m) => m.id === f.moodId)
                        ? t('activity.ratings.metaMood', { channel: f.channelTitle, date: fmt.date(f.at), mood: moodLabelT(moods.moods, f.moodId, t) })
                        : t('activity.ratings.meta', { channel: f.channelTitle, date: fmt.date(f.at) })}
                    </span>
                  </span>
                  {ytTodo ? (
                    <span className="yt-state pending">
                      <a href={`https://www.youtube.com/watch?v=${f.videoId}`} target="_blank" rel="noopener noreferrer">{ytTodo}</a>
                      <button
                        className="button secondary small"
                        aria-label={markDoneLabel(f)}
                        onClick={() => act(async () => { await markSynced(await openMeTubeDB(), f.videoId); }, markDoneStatus(f))}
                      >
                        {t('activity.markDone')}
                      </button>
                    </span>
                  ) : want !== 'none' && (
                    <span className="yt-state done">{want === 'like' ? t('activity.yt.liked') : t('activity.yt.disliked')}</span>
                  )}
                  <select
                    className="fb-select"
                    aria-label={aboutVideo(f, 'activity.ratings.change', 'activity.ratings.changeNoTitle')}
                    value={String(f.rating)}
                    onChange={(e) => {
                      const next = e.target.value === 'none' ? null : (Number(e.target.value) as Rating);
                      const done = next === null
                        ? aboutVideo(f, 'activity.ratings.removed', 'activity.ratings.removedNoTitle')
                        : aboutVideo(f, 'activity.ratings.rated', 'activity.ratings.ratedNoTitle', { rating: ratingShort(next) });
                      act(async () => {
                        const v = d.videos.get(f.videoId);
                        const db = await openMeTubeDB();
                        if (next === null) await removeRating(db, f.videoId);
                        else if (v) await rateVideo(db, v, next, f.moodId);
                        else await db.put('feedback', { ...f, rating: next });
                      }, done);
                    }}
                  >
                    {RATINGS.map((r) => <option key={r.value} value={r.value}>{ratingShort(r.value)}</option>)}
                    <option value="none">{t('activity.ratings.remove')}</option>
                  </select>
                </li>
              );
            })}
            {undoOnly.map((f) => (
              <li key={f.videoId}>
                <span className="fb-main">
                  <a href={`https://www.youtube.com/watch?v=${f.videoId}`} target="_blank" rel="noopener noreferrer">{titleOf(f) ?? t('activity.openOnYouTube')}</a>
                  <span className="fb-sub">{f.ytSynced === 'dislike' ? t('activity.undo.stillDislike') : t('activity.undo.stillLike')}</span>
                </span>
                <span className="yt-state pending">
                  <a href={`https://www.youtube.com/watch?v=${f.videoId}`} target="_blank" rel="noopener noreferrer">
                    {f.ytSynced === 'dislike' ? t('activity.yt.removeDislike') : t('activity.yt.removeLike')}
                  </a>
                  <button
                    className="button secondary small"
                    aria-label={markDoneLabel(f)}
                    onClick={() => act(async () => { await markSynced(await openMeTubeDB(), f.videoId); }, markDoneStatus(f))}
                  >
                    {t('activity.markDone')}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(d.learnedLiked.length > 0 || d.learnedDisliked.length > 0) && (
        <section className="panel glass">
          <h2>{t('activity.learned.heading')}</h2>
          <p className="hint">{t('activity.learned.hint')}</p>
          <div className="tag-columns plain">
            <div>
              <h3>{t('activity.learned.enjoy')}</h3>
              <ul className="chips">{d.learnedLiked.map(([tag]) => <li key={tag} className="chip" data-tone="like">{tag}</li>)}</ul>
            </div>
            <div>
              <h3>{t('activity.learned.skip')}</h3>
              <ul className="chips">{d.learnedDisliked.map(([tag]) => <li key={tag} className="chip" data-tone="block">{tag}</li>)}</ul>
            </div>
          </div>
        </section>
      )}

      {(removed.length > 0 || hiddenChannels.length > 0) && (
        <section className="panel glass">
          <h2>{t('activity.removed.heading')}</h2>
          {hiddenChannels.length > 0 && (
            <>
              <h3>{t('activity.removed.channels')}</h3>
              <ul className="feedback-list">
                {hiddenChannels.map((f) => (
                  <li key={f.channelId}>
                    <span className="fb-main"><span>{f.channelTitle}</span><span className="fb-sub">{t('activity.removed.hiddenOn', { date: fmt.date(f.at) })}</span></span>
                    <button
                      className="button secondary small"
                      aria-label={t('activity.removed.showAgainLabel', { channel: f.channelTitle })}
                      onClick={() => act(async () => unhideChannel(await openMeTubeDB(), f.channelId), t('activity.removed.showingAgain', { channel: f.channelTitle }))}
                    >
                      {t('activity.removed.showAgain')}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {removed.length > 0 && (
            <>
              <h3>{t('activity.removed.videos')}</h3>
              <ul className="feedback-list">
                {removed.slice(0, 50).map((f) => (
                  <li key={f.videoId}>
                    <span className="fb-main">
                      <a href={`https://www.youtube.com/watch?v=${f.videoId}`} target="_blank" rel="noopener noreferrer">{titleOf(f) ?? t('activity.openOnYouTube')}</a>
                      <span className="fb-sub">
                        {f.dismissed && t('activity.removed.meta', { reason: t(`dismiss.${f.dismissed}.label` as const), channel: f.channelTitle, date: fmt.date(f.at) })}
                      </span>
                    </span>
                    <button
                      className="button secondary small"
                      aria-label={aboutVideo(f, 'activity.removed.restore.label', 'activity.removed.restore.labelNoTitle')}
                      onClick={() => act(async () => clearDismissal(await openMeTubeDB(), f.videoId), aboutVideo(f, 'activity.removed.restore.status', 'activity.removed.restore.statusNoTitle'))}
                    >
                      {t('activity.removed.restore')}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  );
}

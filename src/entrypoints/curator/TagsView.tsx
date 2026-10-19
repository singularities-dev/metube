import { useEffect, useId, useRef, useState } from 'react';
import { loadAll, openMeTubeDB } from '@/lib/db';
import { searchTerms, suggestableTerms } from '@/lib/engagement';
import { MAX_CACHE_AGE } from '@/lib/cache';
import { setTagState, topVideoTags, type TagPrefs } from '@/lib/tags';
import type { MessageKey } from '@/lib/i18n/catalogs';
import { TagInput } from './TagInput';
import { MinusIcon, PlusIcon } from './Icons';
import { ActivityView } from './ActivityView';
import { useI18n } from './i18n';
import type { MoodState } from '@/lib/moods';

interface Suggestion {
  tag: string;
  count: number;
}

/** `detail` is a plural message explaining a count ({count}), shown on hover and read with the tag. */
function SuggestionList({ items, tags, onChange, empty, detail }: {
  items: Suggestion[];
  tags: TagPrefs;
  onChange: (next: TagPrefs) => void;
  empty: string;
  detail: MessageKey;
}) {
  const { t, fmt } = useI18n();
  const visible = items.filter((s) => !tags.liked.includes(s.tag) && !tags.blocked.includes(s.tag));
  if (!visible.length) return <p className="hint">{empty}</p>;
  return (
    <ul className="suggestions">
      {visible.map((s) => {
        const text = t(detail, { count: s.count });
        return (
          <li key={s.tag} className="suggestion" title={text}>
            <span className="suggestion-tag">{s.tag}</span>
            <span className="suggestion-count" aria-hidden>{fmt.number(s.count)}</span>
            <span className="sr-only">{text}</span>
            <button className="icon-button small" aria-label={t('tags.like', { tag: s.tag })} title={t('tags.like.title')} onClick={() => onChange(setTagState(tags, s.tag, 'liked'))}>
              <PlusIcon width={16} height={16} />
            </button>
            <button className="icon-button small" aria-label={t('tags.block', { tag: s.tag })} title={t('tags.block.title')} onClick={() => onChange(setTagState(tags, s.tag, 'blocked'))}>
              <MinusIcon width={16} height={16} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type Tab = 'tags' | 'activity';

const TABS: { id: Tab; label: MessageKey }[] = [
  { id: 'tags', label: 'tags.tab.tags' },
  { id: 'activity', label: 'tags.tab.activity' },
];

export function TagsView({ tagsApi, dataVersion, moods, onFeedbackChange }: {
  tagsApi: { tags: TagPrefs; update: (next: TagPrefs) => void };
  dataVersion: number;
  moods: MoodState;
  onFeedbackChange: () => void;
}) {
  const { t } = useI18n();
  const { tags, update } = tagsApi;
  const [tab, setTab] = useState<Tab>(() => (sessionStorage.getItem('tags-tab') === 'activity' ? 'activity' : 'tags'));
  const pick = (id: Tab) => { setTab(id); sessionStorage.setItem('tags-tab', id); };
  const tabsId = useId();
  const panelId = `${tabsId}-panel`;
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});

  // APG tabs: arrows wrap, Home/End jump; selection follows focus.
  function onTabKey(e: React.KeyboardEvent) {
    const i = TABS.findIndex((x) => x.id === tab);
    const n = TABS.length;
    const moves: Record<string, number> = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 };
    const next = TABS[moves[e.key] ?? -1];
    if (!next) return;
    e.preventDefault();
    pick(next.id);
    tabRefs.current[next.id]?.focus();
  }
  const [fromSearches, setFromSearches] = useState<Suggestion[]>([]);
  const [fromVideos, setFromVideos] = useState<Suggestion[]>([]);

  useEffect(() => {
    (async () => {
      const db = await openMeTubeDB();
      const all = await loadAll(db);
      setFromSearches(
        suggestableTerms(searchTerms(all.searches))
          .slice(0, 40)
          .map((s) => ({ tag: s.term, count: s.count })),
      );
      const now = Date.now();
      const videos = (await db.getAll('videos')).filter((v) => now - v.fetchedAt < MAX_CACHE_AGE);
      setFromVideos(topVideoTags(videos, 40).map((s) => ({ tag: s.tag, count: s.count })));
    })();
  }, [dataVersion]);

  return (
    <section className="view narrow">
      <header className="view-head">
        <h1>{tab === 'tags' ? t('tags.title') : t('tags.activityTitle')}</h1>
        <div className="segmented head-tabs" role="tablist" aria-label={t('tags.tabs')} onKeyDown={onTabKey}>
          {TABS.map((tb) => (
            <button
              key={tb.id}
              ref={(el) => { tabRefs.current[tb.id] = el; }}
              id={`${tabsId}-${tb.id}`}
              role="tab"
              aria-selected={tab === tb.id}
              aria-controls={panelId}
              tabIndex={tab === tb.id ? 0 : -1}
              onClick={() => pick(tb.id)}
            >
              {t(tb.label)}
            </button>
          ))}
        </div>
      </header>
      <div role="tabpanel" id={panelId} aria-labelledby={`${tabsId}-${tab}`} tabIndex={0}>
      {tab === 'activity' ? (
        <ActivityView version={dataVersion} moods={moods} onFeedbackChange={onFeedbackChange} />
      ) : (
      <>
      <p className="lede">{t('tags.lede')}</p>

      <div className="tag-columns">
        <section className="panel glass">
          <h2>{t('tags.liked')}</h2>
          <TagInput tone="like" label={t('tags.liked')} placeholder={t('tags.liked.placeholder')} tags={tags.liked}
            onChange={(liked) => update({ ...tags, liked })} />
        </section>
        <section className="panel glass">
          <h2>{t('tags.blocked')}</h2>
          <TagInput tone="block" label={t('tags.blocked')} placeholder={t('tags.blocked.placeholder')} tags={tags.blocked}
            onChange={(blocked) => update({ ...tags, blocked })} />
        </section>
      </div>

      <section className="panel glass">
        <h2>{t('tags.fromSearches')}</h2>
        <p className="hint">{t('tags.fromSearches.hint')}</p>
        <SuggestionList items={fromSearches} tags={tags} onChange={update} empty={t('tags.fromSearches.empty')} detail="tags.fromSearches.detail" />
      </section>

      <section className="panel glass">
        <h2>{t('tags.fromVideos')}</h2>
        <p className="hint">{t('tags.fromVideos.hint')}</p>
        <SuggestionList items={fromVideos} tags={tags} onChange={update} empty={t('tags.fromVideos.empty')} detail="tags.fromVideos.detail" />
      </section>
      </>
      )}
      </div>
    </section>
  );
}

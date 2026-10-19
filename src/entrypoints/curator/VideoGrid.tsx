import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import type { FeedItem, Reason } from '@/lib/feed';
import type { VideoMeta } from '@/lib/api/types';
import { INLINE_PLAYER } from '@/lib/features';
import { DISMISSALS, RATINGS, type Dismissal, type Rating } from '@/lib/feedback';
import type { Translate } from '@/lib/i18n/catalogs';
import type { Format } from '@/lib/i18n/format';
import { BellFilledIcon, BellIcon, CloseIcon, ExternalIcon, PlayIcon, HateIcon, HeartIcon, LoveIcon, NeutralIcon, ThumbDownIcon, ThumbUpIcon } from './Icons';
import { unchartedTopicName, useI18n } from './i18n';

export const RATING_ICONS: Record<Rating, ComponentType<SVGProps<SVGSVGElement>>> = {
  2: LoveIcon, 1: ThumbUpIcon, 0: NeutralIcon, [-1]: ThumbDownIcon, [-2]: HateIcon,
} as Record<Rating, ComponentType<SVGProps<SVGSVGElement>>>;

/** The visible length badge ("3:45"). Screen readers get fmt.duration's words instead. */
function duration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** One reason a video is in the feed, in the UI's language; the user's tags stay as they are. */
function reasonText(r: Reason, t: Translate, fmt: Format): string {
  switch (r.code) {
    case 'uncharted': return r.topic ? t('reason.unchartedTopic', { topic: unchartedTopicName(r.topic, t) }) : t('reason.uncharted');
    case 'moodTags': return t('reason.moodTags', { tags: fmt.list(r.tags ?? []) });
    case 'likedTags': return t('reason.likedTags', { tags: fmt.list(r.tags ?? []) });
    default: return t(`reason.${r.code}`);
  }
}

/** What the title link's name adds after the title: a comma and the details, or just the new-tab note. */
function linkDetails(spoken: string | null, rated: string | undefined, t: Translate): string {
  if (spoken && rated) return `, ${t('tile.link.durationRated', { duration: spoken, rating: rated })}`;
  if (rated) return `, ${t('tile.link.rated', { rating: rated })}`;
  if (spoken) return `, ${t('tile.link.duration', { duration: spoken })}`;
  return ` ${t('tile.link.newTab')}`;
}

interface Props {
  items: FeedItem[];
  ratings: Map<string, number>;
  onRate: (v: VideoMeta, r: Rating | null) => void;
  onDismiss: (v: VideoMeta, reason: Dismissal) => void;
  onOpen: (v: VideoMeta) => void;
  /** Play in MeTube's player. */
  onPlay: (v: VideoMeta) => void;
  /** What a click on the thumbnail or title does. */
  playInline: boolean;
  /** Channels you're subscribed to. */
  subscribed: Set<string>;
  onSubscribe: (v: VideoMeta, subscribe: boolean) => void;
}

type MenuKind = 'rate' | 'dismiss' | 'watch';
type OpenMenu = { id: string; kind: MenuKind } | null;

/** Plain clicks follow the setting; Ctrl/Cmd/middle-click still open a tab. */
const plainClick = (e: React.MouseEvent) => e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;

const panelId = (id: string, kind: MenuKind) => `tile-${kind}-${id}`;
const triggerSelector = (id: string, kind: MenuKind) => `[aria-controls="${panelId(id, kind)}"]`;

/**
 * Flat tiles: the thumbnail carries the weight. Actions appear on hover or focus.
 * Rate and Remove are disclosures: opening one moves focus into it, and closing
 * it (Escape, a choice, or tabbing away) returns focus to its button.
 */
export function VideoGrid({ items, ratings, onRate, onDismiss, onOpen, onPlay, playInline, subscribed, onSubscribe }: Props) {
  const { t, fmt } = useI18n();
  const follow = (v: VideoMeta) => (e: React.MouseEvent) => {
    if (INLINE_PLAYER && playInline && plainClick(e)) { e.preventDefault(); onPlay(v); } else onOpen(v);
  };
  const [menu, setMenu] = useState<OpenMenu>(null);
  const root = useRef<HTMLUListElement>(null);

  const focusTrigger = (m: NonNullable<OpenMenu>) =>
    window.requestAnimationFrame(() => root.current?.querySelector<HTMLElement>(triggerSelector(m.id, m.kind))?.focus());

  /** Closes the open panel; returns focus to its button unless the user clicked elsewhere. */
  const close = (restoreFocus: boolean) => {
    if (!menu) return;
    if (restoreFocus) focusTrigger(menu);
    setMenu(null);
  };

  // Move focus into a panel when it opens.
  useEffect(() => {
    if (!menu) return;
    const panel = document.getElementById(panelId(menu.id, menu.kind));
    (panel?.querySelector<HTMLElement>('[aria-pressed="true"]') ?? panel?.querySelector<HTMLElement>('button, a'))?.focus();
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const outside = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.('.tile-menu, .tile-action')) setMenu(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', esc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  /** Tabbing out of a panel closes it. */
  const onPanelBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && !e.currentTarget.contains(next)) setMenu(null);
  };

  /** A removed tile disappears: put focus on the next video (or the previous one at the end). */
  const focusNeighbour = (id: string) => {
    const li = root.current?.querySelector<HTMLElement>(`[data-video="${CSS.escape(id)}"]`);
    const target = (li?.nextElementSibling ?? li?.previousElementSibling)?.querySelector<HTMLElement>('.tile-link');
    target?.focus();
  };

  const toggle = (id: string, kind: MenuKind) => setMenu(menu?.id === id && menu.kind === kind ? null : { id, kind });

  return (
    <ul className="grid" ref={root}>
      {items.map(({ video: v, reasons }) => {
        const rating = ratings.get(v.id) as Rating | undefined;
        const ratedShort = rating !== undefined ? t(`rating.${rating}.short`) : undefined;
        const RatedIcon = rating !== undefined ? RATING_ICONS[rating] : null;
        const open = menu?.id === v.id ? menu.kind : null;
        const isSub = subscribed.has(v.channelId);
        // The text is compact ("1.2M"); the plural form follows that compact number.
        const views = v.viewCount !== null && v.viewCount !== undefined ? t('tile.views', { count: fmt.compactPluralCount(v.viewCount), value: fmt.compact(v.viewCount) }) : null;
        const likes = v.likeCount ? t('tile.likes', { count: fmt.compactPluralCount(v.likeCount), value: fmt.compact(v.likeCount) }) : null;
        const dur = v.durationSec > 0 ? duration(v.durationSec) : null;
        const spoken = v.durationSec > 0 ? fmt.duration(v.durationSec) : null;
        const age = fmt.ago(v.publishedAt);
        return (
          <li key={v.id} className="tile" data-video={v.id} data-menu-open={open || undefined}>
            <div className="thumb-wrap">
              <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={follow(v)} tabIndex={-1} aria-hidden>
                <div className="thumb">
                  {v.thumbnail ? <img src={v.thumbnail} alt="" loading="lazy" /> : <div className="thumb-empty" />}
                  {dur && <span className="duration">{dur}</span>}
                </div>
              </a>
              {RatedIcon && (
                <span className="rated-badge" data-rating={rating} title={ratedShort} aria-hidden>
                  <RatedIcon width={16} height={16} />
                </span>
              )}
              <div className="tile-actions">
                {INLINE_PLAYER && <button
                  className="tile-action"
                  aria-label={t('tile.watch.label', { title: v.title })}
                  aria-expanded={open === 'watch'}
                  aria-controls={panelId(v.id, 'watch')}
                  title={t('tile.watch.tooltip')}
                  onClick={() => toggle(v.id, 'watch')}
                >
                  <PlayIcon width={18} height={18} />
                </button>}
                <button
                  className="tile-action"
                  aria-pressed={isSub}
                  aria-label={t('tile.subscribe.label', { channel: v.channelTitle })}
                  title={isSub ? t('tile.subscribe.tooltipOn') : t('tile.subscribe.tooltipOff')}
                  onClick={() => onSubscribe(v, !isSub)}
                >
                  {isSub ? <BellFilledIcon width={18} height={18} /> : <BellIcon width={18} height={18} />}
                </button>
                <button
                  className="tile-action"
                  aria-label={t('tile.rate.label', { title: v.title })}
                  aria-expanded={open === 'rate'}
                  aria-controls={panelId(v.id, 'rate')}
                  title={t('tile.rate.tooltip')}
                  onClick={() => toggle(v.id, 'rate')}
                >
                  <HeartIcon width={18} height={18} />
                </button>
                <button
                  className="tile-action"
                  aria-label={t('tile.remove.label', { title: v.title })}
                  aria-expanded={open === 'dismiss'}
                  aria-controls={panelId(v.id, 'dismiss')}
                  title={t('tile.remove.tooltip')}
                  onClick={() => toggle(v.id, 'dismiss')}
                >
                  <CloseIcon width={18} height={18} />
                </button>
              </div>

              {open === 'rate' && (
                <div id={panelId(v.id, 'rate')} className="tile-menu glass rating-menu" role="group" aria-label={t('tile.rate.label', { title: v.title })} onBlur={onPanelBlur}>
                  {RATINGS.map((r) => {
                    const Icon = RATING_ICONS[r.value];
                    // The name starts with the visible word, so voice control can use it (WCAG 2.5.3).
                    const label = t(`rating.${r.value}.short`);
                    return (
                      <button
                        key={r.value}
                        aria-pressed={rating === r.value}
                        data-rating={r.value}
                        aria-label={rating === r.value ? t('rating.removeHint', { label }) : label}
                        title={t(`rating.${r.value}.label`)}
                        onClick={() => { onRate(v, rating === r.value ? null : r.value); close(true); }}
                      >
                        <Icon width={20} height={20} />
                        <span aria-hidden>{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {INLINE_PLAYER && open === 'watch' && (
                <div id={panelId(v.id, 'watch')} className="tile-menu glass watch-menu" role="group" aria-label={t('tile.watch.label', { title: v.title })} onBlur={onPanelBlur}>
                  <button onClick={() => { onPlay(v); setMenu(null); }}>
                    <PlayIcon width={18} height={18} /><span className="menu-label">{t('tile.playHere')}</span>
                  </button>
                  <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={() => { onOpen(v); close(true); }}>
                    <ExternalIcon width={18} height={18} /><span className="menu-label">{t('tile.openInNewTab')}</span>
                  </a>
                </div>
              )}
              {open === 'dismiss' && (
                <div id={panelId(v.id, 'dismiss')} className="tile-menu glass dismiss-menu" role="group" aria-label={t('tile.remove.label', { title: v.title })} onBlur={onPanelBlur}>
                  {DISMISSALS.map((d) => (
                    <button key={d.value} onClick={() => { focusNeighbour(v.id); setMenu(null); onDismiss(v, d.value); }}>
                      <span className="menu-label">{t(`dismiss.${d.value}.label`)}</span>
                      <span className="menu-hint">{t(`dismiss.${d.value}.hint`)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={follow(v)} className="tile-link">
              <h3 className="tile-title">{v.title}</h3>
              <span className="sr-only">{linkDetails(spoken, ratedShort, t)}</span>
            </a>
            <p className="tile-meta">
              {/* Screen readers get one sentence, so the age can't read as when you subscribed. */}
              <span aria-hidden>{v.channelTitle}</span>
              {isSub && <span className="tile-sub" title={t('tile.subscribed')} aria-hidden><BellFilledIcon width={12} height={12} /></span>}
              <span className="tile-age" aria-hidden>{age}</span>
              <span className="sr-only">{t(isSub ? 'tile.meta.subscribed' : 'tile.meta', { channel: v.channelTitle, age })}</span>
            </p>
            {views && likes ? (
              <p className="tile-stats">
                {/* The separator is for the eye; screen readers hear a list, with a pause and a conjunction. */}
                <span aria-hidden>{t('tile.stats', { views, likes })}</span>
                <span className="sr-only">{fmt.list([views, likes])}</span>
              </p>
            ) : (views || likes) && <p className="tile-stats">{views || likes}</p>}
            {reasons.length > 0 && <p className="tile-why">{fmt.capitalise(reasons.map((r) => reasonText(r, t, fmt)).join(t('reason.separator')))}</p>}
          </li>
        );
      })}
    </ul>
  );
}

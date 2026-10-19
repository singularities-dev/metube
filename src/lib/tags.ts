/**
 * The user's own tag lists, plus matching against videos.
 *
 * Tag lists are user-created data (kept long-term). Tags seen on API videos are
 * only offered as suggestions from the 30-day cache; a tag becomes the user's
 * own only when they choose to like or block it.
 */
import type { KeyValueStore } from './quota.ts';
import type { VideoMeta } from './api/types.ts';

export interface TagPrefs {
  /** Boosted in every feed. */
  liked: string[];
  /** Hidden from every feed. */
  blocked: string[];
}

const KEY = 'tags';

/** Lower-case, collapse whitespace, strip a leading '#'. */
export function normaliseTag(t: string): string {
  return t.toLowerCase().trim().replace(/^#/, '').replace(/\s+/g, ' ').trim();
}

function uniq(list: string[]): string[] {
  return [...new Set(list.map(normaliseTag).filter(Boolean))];
}

export async function loadTags(store: KeyValueStore): Promise<TagPrefs> {
  const raw = (await store.get<Partial<TagPrefs>>(KEY)) ?? {};
  return { liked: uniq(raw.liked ?? []), blocked: uniq(raw.blocked ?? []) };
}

export async function saveTags(store: KeyValueStore, tags: TagPrefs): Promise<TagPrefs> {
  const blocked = uniq(tags.blocked);
  // A tag can't be both liked and blocked: the newest choice wins (blocked is applied last here).
  const liked = uniq(tags.liked).filter((t) => !blocked.includes(t));
  const next = { liked, blocked };
  await store.set(KEY, next);
  return next;
}

/** Moves a tag to liked/blocked, or removes it from both. */
export function setTagState(tags: TagPrefs, tag: string, state: 'liked' | 'blocked' | 'none'): TagPrefs {
  const t = normaliseTag(tag);
  const liked = tags.liked.filter((x) => x !== t);
  const blocked = tags.blocked.filter((x) => x !== t);
  if (state === 'liked') liked.push(t);
  if (state === 'blocked') blocked.push(t);
  return { liked, blocked };
}

/** Letters and digits only: "Sci-Fi", "sci fi" and "scifi" all become "scifi". */
const compact = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * A few common spellings people use interchangeably, keyed by compact form.
 * Kept small on purpose: these widen what a tag matches, never narrow it.
 */
const ALIASES: Record<string, string[]> = {
  scifi: ['science fiction'],
  sciencefiction: ['sci-fi'],
  f1: ['formula 1', 'formula one'],
  formula1: ['f1'],
  formulaone: ['f1'],
  diy: ['do it yourself'],
  doityourself: ['diy'],
  ai: ['artificial intelligence'],
  artificialintelligence: ['ai'],
  lofi: ['lo-fi'],
};

export interface VideoText {
  tags: Set<string>;
  /** Tags in compact form, so "sci fi" and "sci-fi" tags match a "scifi" filter. */
  compactTags: Set<string>;
  text: string;
}

/** Searchable text of a video: its tags plus title, lower-cased. */
export function videoText(v: Pick<VideoMeta, 'tags' | 'title'>): VideoText {
  const tags = new Set(v.tags.map(normaliseTag));
  return {
    tags,
    compactTags: new Set([...tags].map(compact)),
    text: ` ${[...tags].join(' | ')} | ${v.title.toLowerCase()} `,
  };
}

const patterns = new Map<string, RegExp>();

const SEP = '[\\s\\-_‐‑]';
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Whole-word pattern where spaces, hyphens and underscores between words are
 * interchangeable or absent. Words of four or more letters may also be split
 * by one ("scifi" finds "sci fi"); shorter ones stay strict to avoid noise.
 */
function wordPattern(t: string): RegExp {
  let re = patterns.get(t);
  if (!re) {
    const parts = t.split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((p) =>
      [...p].length >= 4 ? [...p].map(escapeRe).join(`${SEP}?`) : escapeRe(p),
    );
    re = new RegExp(`(^|[^\\p{L}\\p{N}])${parts.join(`${SEP}*`)}($|[^\\p{L}\\p{N}])`, 'u');
    patterns.set(t, re);
  }
  return re;
}

function matchesOne(video: VideoText, t: string): boolean {
  if (video.tags.has(t)) return true;
  const c = compact(t);
  if (!c) return false;
  if (video.compactTags.has(c)) return true;
  return wordPattern(t).test(video.text);
}

/**
 * A tag matches if the video carries it, or if it appears as whole words in the
 * title/tags ("female vocals" matches "EDM with Female Vocals"). Spacing and
 * hyphens don't matter ("scifi" matches "Sci-Fi"), and a few common aliases
 * count ("sci-fi" matches "science fiction").
 */
export function matchesTag(video: VideoText, tag: string): boolean {
  const t = normaliseTag(tag);
  if (!t) return false;
  if (matchesOne(video, t)) return true;
  return (ALIASES[compact(t)] ?? []).some((a) => matchesOne(video, a));
}

/** Most common tags across cached videos, for suggestions. */
export function topVideoTags(videos: VideoMeta[], limit = 60): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of videos) for (const t of new Set(v.tags.map(normaliseTag))) if (t) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

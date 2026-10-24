/**
 * The curated feed, in two halves:
 *
 * 1. gatherPool: spends API quota to collect candidates (recent uploads of the
 *    user's most engaged channels, plus any explicit searches). Cached.
 * 2. rankFeed: pure and instant. Applies the user's tags, active mood, quick
 *    filters and category, so changing any of them re-sorts without API calls.
 */
import type { SearchOptions, YouTubeClient } from './api/client.ts';
import type { VideoMeta } from './api/types.ts';
import { MAX_CACHE_AGE, getUploads, getVideos, lacksLongForm, purgeExpired, putUploads, putVideos, uploadsKey } from './cache.ts';
import type { MeTubeDatabase } from './db.ts';
import { loadAll } from './db.ts';
import { channelEngagement, isStopword, type ChannelEngagement } from './engagement.ts';
import { matchesTag, normaliseTag, videoText } from './tags.ts';
import { affinityFactor, topTags, type PreferenceModel } from './model.ts';

const DAY = 86_400_000;
/** Shorts can run up to 3 minutes. */
export const SHORTS_MAX_SEC = 180;
/** Without the video's shape, only this short counts, so short regular videos stay. */
const SHAPELESS_SHORTS_MAX_SEC = 60;
/** Vertical or square, with a little room for rounded embed sizes. */
const SHORTS_MAX_ASPECT = 1.05;
const SHORTS_TAG = /#shorts\b/i;

/** A Short: up to 3 minutes and vertical or tagged #shorts; up to a minute when the shape is unknown. */
export function isShort(v: Pick<VideoMeta, 'durationSec' | 'aspect' | 'title' | 'tags'>): boolean {
  if (v.durationSec <= 0 || v.durationSec > SHORTS_MAX_SEC) return false;
  if (SHORTS_TAG.test(v.title) || v.tags.some((t) => /^#?shorts$/i.test(t.trim()))) return true;
  return v.aspect === undefined ? v.durationSec <= SHAPELESS_SHORTS_MAX_SEC : v.aspect <= SHORTS_MAX_ASPECT;
}

export interface PoolOptions {
  channels: number;
  uploadsPerChannel: number;
  /** Ignore cached upload lists and re-fetch every channel ("Fresh feed"). */
  force?: boolean;
  /** Channels to include beyond the top engaged ones (e.g. the active mood's channels). */
  extraChannels?: { channelId: string; channelTitle: string }[];
  /** Fetch channels' uploads without Shorts, where YouTube offers that list. */
  hideShorts?: boolean;
}

/**
 * Everything, channels you know, channels new to you, or "Uncharted": topics and
 * channels outside your history and likes, with only your dislikes still applied.
 */
export type ChannelScope = 'all' | 'known' | 'new' | 'uncharted';

/** View-count bands for the popularity filter. */
export type Popularity = 'any' | 'lesser' | 'popular';
export const LESSER_SEEN_MAX_VIEWS = 10_000;
export const POPULAR_MIN_VIEWS = 1_000_000;

export function matchesPopularity(views: number | null | undefined, p: Popularity): boolean {
  if (p === 'any') return true;
  // Hidden view counts can't be placed in a band.
  if (views === null || views === undefined) return false;
  return p === 'lesser' ? views < LESSER_SEEN_MAX_VIEWS : views >= POPULAR_MIN_VIEWS;
}

export interface Pool {
  videos: VideoMeta[];
  engagement: ChannelEngagement[];
  watched: Set<string>;
  /** Video IDs that came from the user's own searches (ranked even for unknown channels). */
  searchHits: Set<string>;
  /** Video IDs fetched for the active mood. */
  moodHits?: Set<string>;
  /** Video IDs from YouTube's popular list for the chosen category. */
  categoryHits?: Set<string>;
  /** Video IDs from a discovery search, for "New to me". */
  discoverHits?: Set<string>;
  /** The interest the last discovery search used. */
  discoverQuery?: string;
  /** Which scope that discovery search was for (missing means "new"). */
  discoverFor?: 'new' | 'uncharted';
  /** Cached videos this load didn't fetch: the library built up by earlier loads and searches. */
  library?: Set<string>;
  /** videoId → the searches (normalised) that returned it, from this load and the cache. */
  queries?: Map<string, string[]>;
  channelsChecked: number;
  apiCallsMade: number;
  errors: string[];
}

export interface RankContext {
  likedTags: string[];
  blockedTags: string[];
  /** Active mood's tags (inherited through its branch). */
  moodInclude: string[];
  moodExclude: string[];
  /** Quick filter chips in Explore: show only / never show. */
  onlyTags: string[];
  hideTags: string[];
  categoryId: string | null;
  hideShorts: boolean;
  hideWatched: boolean;
  perChannelCap: number;
  freshnessHalfLifeDays?: number;
  /** Learned from ratings and dismissals. */
  model?: PreferenceModel;
  /** Tags the active mood has learned from feedback given while it was on. */
  moodLearned?: Map<string, number>;
  /** How often each video has been shown without being opened; drives rotation. */
  impressions?: Map<string, number>;
  /** Stronger rotation for "Fresh feed". */
  fresh?: boolean;
  /** Videos to keep visible even if now hidden (e.g. just rated in this session). */
  keep?: Set<string>;
  /** 0 gentle nudge … 1 only videos that fit the mood. */
  moodIntensity?: number;
  /** Channels the active mood has learned you like. */
  moodChannels?: Map<string, number>;
  /** Everything, only channels you know, only channels new to you, or Uncharted. */
  channelScope?: ChannelScope;
  /** Only videos published in this window (epoch ms, after inclusive, before exclusive). */
  publishedAfter?: number;
  publishedBefore?: number;
  popularity?: Popularity;
}

export const EMPTY_CONTEXT: RankContext = {
  likedTags: [], blockedTags: [], moodInclude: [], moodExclude: [], onlyTags: [], hideTags: [],
  categoryId: null, hideShorts: true, hideWatched: true, perChannelCap: 3,
};

/** Why a video is in the feed. The UI words these in the user's language. */
export type ReasonCode =
  | 'uncharted' | 'moodTags' | 'moodChannel' | 'likedTags' | 'moodLearned' | 'moodSearch' | 'search'
  | 'newToYou' | 'ratedChannel' | 'ratedSimilar' | 'rewatch' | 'subscribed' | 'popular' | 'library' | 'new';

export interface Reason {
  code: ReasonCode;
  /** Uncharted: the topic searched (one of UNCHARTED_TOPICS). The UI shows its translated label. */
  topic?: string;
  /**
   * moodTags and likedTags: the tags that matched (up to two), as they are (not
   * translated): the user's own, or a starter mood's tags in the UI language.
   */
  tags?: string[];
}

export interface FeedItem {
  video: VideoMeta;
  score: number;
  /** Plain-language reasons, so ranking is never a black box. */
  reasons: Reason[];
}

const FATAL = new Set(['quota', 'no-key', 'invalid-key', 'key-restricted', 'api-disabled']);
function isFatal(e: unknown): boolean {
  const err = e as { kind?: string; message?: string };
  return FATAL.has(err.kind ?? '') || /Quota/.test(err.message ?? '');
}

/** A channel you already know: watched, subscribed, or rated well. */
export function knownChannels(engagement: ChannelEngagement[], model?: PreferenceModel): Set<string> {
  const known = new Set(engagement.map((c) => c.channelId));
  for (const [c, v] of model?.channels ?? []) if (v > 0) known.add(c);
  return known;
}

/** Learned tag weights at or past this count as a taste (Uncharted avoids or filters them). */
const LEARNED_TASTE = 1;

/** True when a search for this tag returned the video: YouTube judged it relevant. */
const searchedFor = (queries: string[], tag: string) => queries.some((q) => ` ${q} `.includes(` ${tag} `));

export function rankFeed(
  pool: Pick<Pool, 'videos' | 'engagement' | 'watched' | 'searchHits' | 'moodHits' | 'discoverHits' | 'discoverFor' | 'library' | 'queries' | 'categoryHits'>,
  ctx: RankContext,
  now = Date.now(),
): FeedItem[] {
  const byChannel = new Map(pool.engagement.map((c) => [c.channelId, c]));
  const maxScore = Math.max(1, pool.engagement[0]?.score ?? 1);
  const halfLife = ctx.freshnessHalfLifeDays ?? 7;
  const scope = ctx.channelScope ?? 'all';
  // Uncharted sets your likes and moods aside; only what you've ruled out still applies.
  const uncharted = scope === 'uncharted';
  const learned = ctx.model ? topTags(ctx.model.tags, 50) : { liked: [], disliked: [] };
  const neverShow = uncharted
    ? [...ctx.blockedTags, ...ctx.hideTags, ...learned.disliked.filter(([, w]) => w <= -LEARNED_TASTE).map(([t]) => t)]
    : [...ctx.blockedTags, ...ctx.moodExclude, ...ctx.hideTags];
  const familiar = uncharted ? [...ctx.likedTags, ...learned.liked.filter(([, w]) => w >= LEARNED_TASTE).map(([t]) => t)] : [];
  const known = scope === 'all' ? null : knownChannels(pool.engagement, ctx.model);
  const intensity = ctx.moodIntensity ?? 0.5;
  const moodOn = !uncharted && (ctx.moodInclude.length > 0 || (ctx.moodLearned?.size ?? 0) > 0 || (ctx.moodChannels?.size ?? 0) > 0);
  const popularity = ctx.popularity ?? 'any';
  const filtering = ctx.onlyTags.length > 0 || !!ctx.categoryId || ctx.publishedAfter !== undefined || ctx.publishedBefore !== undefined || popularity !== 'any';
  const discoverFor = pool.discoverFor ?? 'new';

  const scored: FeedItem[] = [];
  for (const v of pool.videos) {
    if (v.isLive) continue;
    const keep = ctx.keep?.has(v.id) ?? false;
    const rated = ctx.model?.ratings.has(v.id) ?? false;
    if (!keep && ctx.model?.hiddenVideos.has(v.id)) continue;
    if (ctx.model?.hiddenChannels.has(v.channelId)) continue;
    if (!keep && ctx.hideWatched && (pool.watched.has(v.id) || rated)) continue;
    if (ctx.hideShorts && isShort(v)) continue;
    if (ctx.categoryId && v.categoryId !== ctx.categoryId) continue;
    if (ctx.publishedAfter !== undefined && v.publishedAt < ctx.publishedAfter) continue;
    if (ctx.publishedBefore !== undefined && v.publishedAt >= ctx.publishedBefore) continue;
    if (!matchesPopularity(v.viewCount, popularity)) continue;

    // "Known" keeps only channels you know; "New to me" and Uncharted only the others.
    if (known && (scope === 'known') !== known.has(v.channelId)) continue;

    const ch = byChannel.get(v.channelId);
    const queries = pool.queries?.get(v.id) ?? [];
    const fromMood = !uncharted && (pool.moodHits?.has(v.id) ?? false);
    const fromDiscover = discoverFor === (uncharted ? 'uncharted' : 'new') && (pool.discoverHits?.has(v.id) ?? false);
    const moodChannel = uncharted ? 0 : ctx.moodChannels?.get(v.channelId) ?? 0;
    const fromSearch = pool.searchHits.has(v.id) || fromMood || fromDiscover;
    // YouTube's popular list for the chosen category (only while that category is chosen).
    const fromCategory = !!ctx.categoryId && !fromSearch && (pool.categoryHits?.has(v.id) ?? false);
    const inLibrary = (pool.library?.has(v.id) ?? false) && !fromSearch && !moodChannel;
    let fromLibrary: boolean;
    if (uncharted) {
      // Today's topic plus earlier Uncharted finds still in the 30-day cache.
      fromLibrary = inLibrary && queries.some(isUnchartedTopic);
      if (!fromSearch && !fromLibrary) continue;
    } else {
      // Earlier searches' results (cached, no units) join in for "New to me" or while filtering.
      fromLibrary = inLibrary && !ch && (filtering || scope === 'new') && queries.length > 0 && !queries.every(isUnchartedTopic);
      if (!ch && !fromSearch && !moodChannel && !fromLibrary && !fromCategory) continue;
    }

    const text = videoText(v);
    if (neverShow.some((t) => matchesTag(text, t))) continue;
    if (familiar.some((t) => matchesTag(text, t))) continue;
    if (ctx.onlyTags.length && !ctx.onlyTags.every((t) => matchesTag(text, t) || searchedFor(queries, normaliseTag(t)))) continue;

    const reasons: Reason[] = [];
    // Square root flattens the curve so a few heavily watched channels don't drown the rest.
    let weight = ch ? Math.sqrt(ch.score / maxScore) : 0.35;
    if (uncharted) {
      weight = 0.5;
      const topic = queries.find(isUnchartedTopic);
      reasons.push(topic ? { code: 'uncharted', topic } : { code: 'uncharted' });
    } else {
      // The channel name is already on the tile, so only distinctive signals get a reason.
      if (ch?.rewatchedVideos) reasons.push({ code: 'rewatch' });
      else if (ch?.subscribed && !ch.watches) reasons.push({ code: 'subscribed' });
      if (fromSearch) {
        weight = Math.max(weight, fromDiscover && !fromMood ? 0.45 : 0.5);
        reasons.push({ code: fromMood ? 'moodSearch' : fromDiscover ? 'newToYou' : 'search' });
      }
      if (moodChannel) {
        weight = Math.max(weight, 0.55);
        reasons.push({ code: 'moodChannel' });
      }
      if (fromCategory) {
        weight = Math.max(weight, 0.4);
        reasons.push({ code: 'popular' });
      } else if (fromLibrary) {
        weight = Math.max(weight, 0.4);
        reasons.push({ code: 'library' });
      }
    }

    const ageDays = Math.max(0, (now - v.publishedAt) / DAY);
    const freshness = Math.pow(0.5, ageDays / halfLife);
    if (ageDays < 2) reasons.push({ code: 'new' });

    const liked = uncharted ? [] : ctx.likedTags.filter((t) => matchesTag(text, t));
    const moodHits = uncharted ? [] : ctx.moodInclude.filter((t) => matchesTag(text, t));
    if (liked.length) reasons.push({ code: 'likedTags', tags: liked.slice(0, 2) });
    if (moodHits.length) reasons.push({ code: 'moodTags', tags: moodHits.slice(0, 2) });

    // What feedback has taught us. Uncharted keeps only the negative side.
    const tags = [...text.tags];
    const m = ctx.model;
    const cap = (x: number) => (uncharted ? Math.min(0, x) : x);
    const channelAff = cap(m?.channels.get(v.channelId) ?? 0);
    const tagAff = cap(m ? tags.reduce((sum, t) => sum + (m.tags.get(t) ?? 0), 0) : 0);
    const catAff = cap(m?.categories.get(v.categoryId) ?? 0);
    const moodLearned = !uncharted && ctx.moodLearned ? tags.reduce((sum, t) => sum + (ctx.moodLearned!.get(t) ?? 0), 0) : 0;
    if (channelAff > 0.8) reasons.push({ code: 'ratedChannel' });
    else if (tagAff > 0.6) reasons.push({ code: 'ratedSimilar' });
    if (moodLearned > 0.4 && !moodHits.length) reasons.push({ code: 'moodLearned' });

    // Tags and mood multiply, each capped so one signal can't dominate.
    const tagBoost = 1 + Math.min(liked.length, 3) * 0.35;
    // With a mood on, matching videos rise and non-matching ones sink, but stay reachable.
    const moodMatch = moodHits.length > 0 || moodLearned > 0.4 || fromMood || moodChannel > 0;
    // Intensity: at 1 only matching videos remain; at 0 the mood barely nudges.
    if (moodOn && !moodMatch && intensity >= 0.95) continue;
    const signals = moodHits.length + (moodLearned > 0.4 ? 1 : 0) + (fromMood ? 1 : 0) + (moodChannel ? 1 : 0);
    const moodFactor = moodOn
      ? (moodMatch ? 1 + Math.min(signals, 3) * 0.6 * (0.5 + intensity) : 1 - 0.9 * intensity)
      : 1;
    const learnedFactor = affinityFactor(channelAff, 0.35) * affinityFactor(tagAff, 0.5) * affinityFactor(catAff, 0.5, 0.6, 1.5) * affinityFactor(moodLearned, 0.5, 0.6, 2);
    // Rotation: videos shown repeatedly without being opened gradually step aside.
    const shown = Math.min(ctx.impressions?.get(v.id) ?? 0, 10);
    const rotation = Math.pow(ctx.fresh ? 0.6 : 0.92, shown);

    const score = weight * (0.3 + 0.7 * freshness) * tagBoost * moodFactor * learnedFactor * rotation;
    // Show the two strongest reasons; more turns into noise under every tile.
    scored.push({ video: v, score, reasons: prioritise(reasons).slice(0, 2) });
  }
  scored.sort((a, b) => b.score - a.score);
  return capPerChannel(scored, ctx.perChannelCap);
}

/** Most specific first: the two shown under a tile are the first two in this order. */
const REASON_ORDER: ReasonCode[] = ['uncharted', 'moodTags', 'moodChannel', 'likedTags', 'moodLearned', 'moodSearch', 'search', 'newToYou', 'ratedChannel', 'ratedSimilar', 'rewatch', 'subscribed', 'popular', 'library', 'new'];

/** Orders reasons by how much they explain, most specific first. */
export function prioritise(reasons: Reason[]): Reason[] {
  return [...reasons].sort((a, b) => REASON_ORDER.indexOf(a.code) - REASON_ORDER.indexOf(b.code));
}

/** Keeps the best N per channel at the front; the overflow follows, still in score order. */
export function capPerChannel(items: FeedItem[], cap: number): FeedItem[] {
  if (cap <= 0) return items;
  const counts = new Map<string, number>();
  const head: FeedItem[] = [];
  const tail: FeedItem[] = [];
  for (const it of items) {
    const n = counts.get(it.video.channelId) ?? 0;
    (n < cap ? head : tail).push(it);
    counts.set(it.video.channelId, n + 1);
  }
  return head.concat(tail);
}

/** Runs async tasks with a small concurrency limit (be gentle with the API). */
async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) await fn(items[i++] as T);
  });
  await Promise.all(workers);
}

/** Fetches details for IDs not in the cache (1 unit per 50). */
async function hydrate(db: MeTubeDatabase, client: YouTubeClient, ids: string[], now: number): Promise<{ videos: Map<string, VideoMeta>; calls: number }> {
  const cached = await getVideos(db, ids, now);
  const missing = [...new Set(ids.filter((id) => !cached.has(id)))];
  if (!missing.length) return { videos: cached, calls: 0 };
  const fresh = await client.videos(missing);
  await putVideos(db, fresh);
  for (const v of fresh) cached.set(v.id, v);
  return { videos: cached, calls: Math.ceil(missing.length / 50) };
}

/** Search terms for a mood: its own tags first, then inherited ones, at most three. */
export function moodQuery(include: string[], leafInclude: string[]): string {
  const ordered = [...new Set([...leafInclude, ...include].map(normaliseTag).filter(Boolean))];
  return ordered.slice(0, 3).join(' ');
}

/** How long a search's results are reused before searching again (101 units each time). */
export const MOOD_SEARCH_TTL = 12 * 3_600_000;

/** How long a category's popular list is reused before asking again (1 unit each time). */
export const CATEGORY_TTL = 6 * 3_600_000;

/**
 * Adds YouTube's popular videos for a category to the pool, so choosing a
 * category shows that category even when your channels have little in it.
 * Cached per category and region; 1 unit when not cached.
 */
export async function categoryIntoPool(
  db: MeTubeDatabase,
  client: YouTubeClient,
  current: Pool,
  categoryId: string,
  regionCode: string,
  now = Date.now(),
): Promise<{ pool: Pool; unitsUsed: number }> {
  const key = `cat:${categoryId}|${regionCode}`;
  const row = await db.get('uploads', key);
  let ids: string[];
  let units = 0;
  if (row && now - row.fetchedAt < CATEGORY_TTL) {
    ids = row.videoIds;
  } else {
    const videos = await client.popular(categoryId, regionCode);
    units = 1;
    await putVideos(db, videos);
    ids = videos.map((v) => v.id);
    await putUploads(db, { channelId: key, videoIds: ids, fetchedAt: now });
  }
  const { videos, calls } = await hydrate(db, client, ids, now);
  const merged = new Map(current.videos.map((v) => [v.id, v]));
  for (const v of videos.values()) merged.set(v.id, v);
  return {
    pool: { ...current, videos: [...merged.values()], categoryHits: new Set(ids), apiCallsMade: current.apiCallsMade + (units ? 1 : 0) + calls },
    unitsUsed: units + calls,
  };
}

/** Cache key for a search. Settings that change its results are part of it. */
export function searchKey(query: string, o: SearchOptions = {}): string {
  const extra = [o.publishedAfter, o.publishedBefore, o.order && o.order !== 'relevance' ? o.order : undefined, o.categoryId ?? undefined];
  return extra.every((x) => x === undefined) ? `q:${query}` : `q:${query}|${extra.map((x) => x ?? '').join('|')}`;
}

/** One search, reused from the cache while it's current. */
async function cachedSearch(
  db: MeTubeDatabase,
  client: YouTubeClient,
  query: string,
  opts: { force?: boolean; search?: SearchOptions },
  now: number,
): Promise<{ ids: string[]; units: number }> {
  const key = searchKey(query, opts.search);
  const row = await db.get('uploads', key);
  if (!opts.force && row && now - row.fetchedAt < MOOD_SEARCH_TTL) return { ids: row.videoIds, units: 0 };
  const ids = await client.search(query, 25, opts.search);
  await putUploads(db, { channelId: key, videoIds: ids, fetchedAt: now, query });
  return { ids, units: 100 };
}

export interface SearchIntoPoolOptions {
  /** What the results are for: your own search, the active mood, or a discovery search. */
  kind: 'search' | 'mood' | 'discover';
  /** For discovery: "New to me" or Uncharted. */
  discoverFor?: 'new' | 'uncharted';
  /** Search again even if a cached result is current. */
  force?: boolean;
  search?: SearchOptions;
}

/**
 * Searches (cached per query and settings for 12 hours) and merges the results
 * into the pool: 100 units for the search when it isn't cached, plus 1 per 50
 * videos not already in the library.
 */
export async function searchIntoPool(
  db: MeTubeDatabase,
  client: YouTubeClient,
  current: Pool,
  rawQuery: string,
  opts: SearchIntoPoolOptions,
  now = Date.now(),
): Promise<{ pool: Pool; unitsUsed: number }> {
  const query = normaliseTag(rawQuery);
  if (!query) {
    if (opts.kind === 'mood') return { pool: { ...current, moodHits: new Set() }, unitsUsed: 0 };
    if (opts.kind === 'discover') return { pool: { ...current, discoverHits: new Set(), discoverQuery: undefined, discoverFor: opts.discoverFor ?? 'new' }, unitsUsed: 0 };
    return { pool: current, unitsUsed: 0 };
  }
  const { ids, units: searchUnits } = await cachedSearch(db, client, query, opts, now);
  const { videos, calls } = await hydrate(db, client, ids, now);
  const merged = new Map(current.videos.map((v) => [v.id, v]));
  for (const v of videos.values()) merged.set(v.id, v);
  const queries = new Map(current.queries ?? []);
  for (const id of ids) {
    const list = queries.get(id) ?? [];
    if (!list.includes(query)) queries.set(id, [...list, query]);
  }
  const hits: Partial<Pool> =
    opts.kind === 'search' ? { searchHits: new Set([...current.searchHits, ...ids]) }
    : opts.kind === 'mood' ? { moodHits: new Set(ids) }
    : { discoverHits: new Set(ids), discoverQuery: query, discoverFor: opts.discoverFor ?? 'new' };
  return {
    pool: {
      ...current,
      ...hits,
      videos: [...merged.values()],
      queries,
      apiCallsMade: current.apiCallsMade + (searchUnits ? 1 : 0) + calls,
    },
    unitsUsed: searchUnits + calls,
  };
}

/** Subscriptions this recent always have their uploads checked (see gatherPool). */
const RECENT_SUBSCRIPTION = 30 * DAY;

export async function gatherPool(
  db: MeTubeDatabase,
  client: YouTubeClient,
  opts: PoolOptions,
  now = Date.now(),
): Promise<Pool> {
  await purgeExpired(db, now);
  const all = await loadAll(db);
  const engagement = channelEngagement(all.watches, all.subscriptions, now);
  const watched = new Set(all.watches.map((w) => w.videoId));
  const top = engagement.slice(0, opts.channels);
  // Channels you subscribed to in MeTube or recently are fetched even outside your
  // top channels, so a new subscription's uploads show up on the next load.
  const freshSubs = all.subscriptions
    .filter((sub) => sub.source === 'metube' || (sub.subscribedAt !== undefined && now - sub.subscribedAt < RECENT_SUBSCRIPTION))
    .map((sub) => engagement.find((c) => c.channelId === sub.channelId))
    .filter((c): c is ChannelEngagement => !!c && !top.includes(c));
  top.push(...freshSubs);
  for (const extra of opts.extraChannels ?? []) {
    if (!top.some((c) => c.channelId === extra.channelId)) {
      top.push({ channelId: extra.channelId, channelTitle: extra.channelTitle, watches: 0, uniqueVideos: 0, rewatchedVideos: 0, firstWatched: 0, lastWatched: 0, subscribed: false, score: 0 });
    }
  }

  const errors: string[] = [];
  let apiCallsMade = 0;
  const ids: string[] = [];

  const longFormOnly = opts.hideShorts ?? false;
  await pool(top, 4, async (ch) => {
    const key = uploadsKey(ch.channelId, longFormOnly);
    let uploads = opts.force ? undefined : await getUploads(db, key, now);
    if (!uploads) {
      try {
        let noLongForm = longFormOnly && (await lacksLongForm(db, ch.channelId, now));
        let videoIds: string[] | undefined;
        if (longFormOnly && !noLongForm) {
          try {
            videoIds = await client.recentUploads(ch.channelId, opts.uploadsPerChannel, { longFormOnly: true });
          } catch (e) {
            if ((e as { kind?: string }).kind !== 'not-found') throw e;
            // No long-form list for this channel: use all its uploads, and remember that.
            noLongForm = true;
          }
          apiCallsMade++;
        }
        if (!videoIds) {
          videoIds = await client.recentUploads(ch.channelId, opts.uploadsPerChannel);
          apiCallsMade++;
        }
        uploads = { channelId: key, videoIds, fetchedAt: now, ...(noLongForm ? { noLongForm } : {}) };
        await putUploads(db, uploads);
      } catch (e) {
        if (isFatal(e)) throw e;
        errors.push(`${ch.channelTitle}: ${(e as Error).message ?? e}`);
        return;
      }
    }
    for (const id of uploads.videoIds) ids.push(id);
  });

  const { videos, calls } = await hydrate(db, client, ids, now);
  apiCallsMade += calls;

  // The library: everything fetched in the last 30 days (YouTube's limit for keeping
  // API data), so filters, "New to me" and Uncharted can draw on earlier loads and
  // searches without spending units.
  const [cached, rows] = await Promise.all([db.getAll('videos'), db.getAll('uploads')]);
  const library = new Set<string>();
  for (const v of cached) {
    if (!videos.has(v.id) && now - v.fetchedAt < MAX_CACHE_AGE) {
      videos.set(v.id, v);
      library.add(v.id);
    }
  }
  const queries = new Map<string, string[]>();
  for (const r of rows) {
    if (!r.channelId.startsWith('q:') || now - r.fetchedAt >= MAX_CACHE_AGE) continue;
    const q = normaliseTag(r.query ?? r.channelId.slice(2));
    for (const id of r.videoIds) {
      const list = queries.get(id) ?? [];
      if (!list.includes(q)) queries.set(id, [...list, q]);
    }
  }

  return {
    videos: [...videos.values()],
    engagement,
    watched,
    searchHits: new Set(),
    library,
    queries,
    channelsChecked: top.length,
    apiCallsMade,
    errors,
  };
}

/**
 * One interest to explore for "New to me": cycles daily through your liked
 * tags, learned tastes and frequent searches, and steps on with each Fresh feed.
 */
export function discoveryQuery(interests: string[], step = 0, now = Date.now()): string {
  const list = [...new Set(interests.map(normaliseTag).filter(Boolean))];
  if (!list.length) return '';
  const day = Math.floor(now / DAY);
  return list[(day + step) % list.length]!;
}

/**
 * Starting points for Uncharted: deliberately broad and varied, so at least
 * some sit well outside anyone's usual viewing. Topics close to your interests
 * are skipped (see unchartedQuery). `query` is what's searched on YouTube (and
 * keys the search cache), so it stays as it is; `id` names the label the UI
 * shows in the user's language (uncharted.topic.<id>).
 */
const UNCHARTED = [
  { id: 'pottery', query: 'pottery' },
  { id: 'beekeeping', query: 'beekeeping' },
  { id: 'origami', query: 'origami' },
  { id: 'birdwatching', query: 'birdwatching' },
  { id: 'blacksmithing', query: 'blacksmithing' },
  { id: 'calligraphy', query: 'calligraphy' },
  { id: 'bonsai', query: 'bonsai' },
  { id: 'sailing', query: 'sailing' },
  { id: 'mountaineering', query: 'mountaineering' },
  { id: 'caveExploring', query: 'cave exploring' },
  { id: 'architectureTour', query: 'architecture tour' },
  { id: 'urbanPlanning', query: 'urban planning' },
  { id: 'linguistics', query: 'linguistics' },
  { id: 'philosophyLecture', query: 'philosophy lecture' },
  { id: 'opera', query: 'opera' },
  { id: 'jazzImprovisation', query: 'jazz improvisation' },
  { id: 'folkDance', query: 'folk dance' },
  { id: 'throatSinging', query: 'throat singing' },
  { id: 'streetFood', query: 'street food' },
  { id: 'fermentation', query: 'fermentation' },
  { id: 'teaCeremony', query: 'tea ceremony' },
  { id: 'glassblowing', query: 'glassblowing' },
  { id: 'woodcarving', query: 'woodcarving' },
  { id: 'knitting', query: 'knitting' },
  { id: 'chessEndgames', query: 'chess endgames' },
  { id: 'magicTricks', query: 'magic tricks' },
  { id: 'juggling', query: 'juggling' },
  { id: 'parkour', query: 'parkour' },
  { id: 'skateboarding', query: 'skateboarding' },
  { id: 'surfing', query: 'surfing' },
  { id: 'rockClimbing', query: 'rock climbing' },
  { id: 'gardening', query: 'gardening' },
  { id: 'mushroomForaging', query: 'mushroom foraging' },
  { id: 'marineBiology', query: 'marine biology' },
  { id: 'paleontology', query: 'paleontology' },
  { id: 'archaeology', query: 'archaeology' },
  { id: 'poetryReading', query: 'poetry reading' },
  { id: 'signLanguage', query: 'sign language' },
  { id: 'modelRailway', query: 'model railway' },
  { id: 'clockRepair', query: 'clock repair' },
  { id: 'bookbinding', query: 'bookbinding' },
  { id: 'stopMotionAnimation', query: 'stop motion animation' },
  { id: 'puppetry', query: 'puppetry' },
  { id: 'falconry', query: 'falconry' },
  { id: 'freediving', query: 'freediving' },
  { id: 'competitiveCooking', query: 'competitive cooking' },
  { id: 'ballet', query: 'ballet' },
  { id: 'beatboxing', query: 'beatboxing' },
  { id: 'tinyHouses', query: 'tiny houses' },
  { id: 'shipbuilding', query: 'shipbuilding' },
  { id: 'cartography', query: 'cartography' },
  { id: 'sheepdogTrials', query: 'sheepdog trials' },
  { id: 'lacrosse', query: 'lacrosse' },
  { id: 'curling', query: 'curling' },
  { id: 'sumo', query: 'sumo' },
  { id: 'kiteMaking', query: 'kite making' },
] as const;

export type UnchartedTopicId = (typeof UNCHARTED)[number]['id'];
export const UNCHARTED_TOPICS: string[] = UNCHARTED.map((x) => normaliseTag(x.query));
const UNCHARTED_IDS = new Map<string, UnchartedTopicId>(UNCHARTED.map((x) => [normaliseTag(x.query), x.id]));
export const isUnchartedTopic = (q: string) => UNCHARTED_IDS.has(q);
/** The label id of one of MeTube's Uncharted topics; undefined for anything else (such as the user's own tags). */
export const unchartedTopicId = (q: string): UnchartedTopicId | undefined => UNCHARTED_IDS.get(normaliseTag(q));

const WORD_BREAK = /[^\p{L}\p{N}]+/u;

/**
 * Today's Uncharted topic: one that shares no word with anything you like,
 * watch, search or have blocked. Rotates daily and steps on with each Fresh feed.
 * The search is English, but you see the topic's label and may like, tag and
 * search in any language, so labels(topic) gives its labels (in every language,
 * as tags and searches mix them) to compare as well. Function words ("des",
 * "del") don't count as shared.
 */
export function unchartedQuery(avoid: string[], step = 0, now = Date.now(), labels: (topic: string) => string[] = () => []): string {
  const words = new Set(avoid.flatMap((a) => normaliseTag(a).split(WORD_BREAK)).filter((w) => w.length > 2 && !isStopword(w)));
  const open = UNCHARTED_TOPICS.filter((t) => {
    // normaliseTag is for matching only; the labels shown come from the catalogue.
    const names = [t, ...labels(t).map(normaliseTag)];
    const text = videoText({ title: t, tags: names });
    return !names.some((n) => n.split(WORD_BREAK).some((w) => words.has(w))) && !avoid.some((a) => matchesTag(text, a));
  });
  const list = open.length ? open : UNCHARTED_TOPICS;
  return list[(Math.floor(now / DAY) + step) % list.length]!;
}

/** How many videos from channels new to you the pool holds, not counting the library. */
export function unknownChannelVideos(pool: Pick<Pool, 'videos' | 'engagement' | 'library'>, model?: PreferenceModel): number {
  const known = knownChannels(pool.engagement, model);
  return pool.videos.filter((v) => !known.has(v.channelId) && !pool.library?.has(v.id)).length;
}

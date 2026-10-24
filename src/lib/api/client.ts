/**
 * Minimal YouTube Data API v3 client.
 *
 * Every call goes through the quota tracker: checked before sending, recorded
 * after (failed calls still cost quota). `fetch` is injectable so tests run
 * against recorded fixtures without network access or a key.
 */
import { QuotaTracker, type Endpoint } from '../quota.ts';
import type { ApiErrorBody, PlaylistItemsResponse, SearchResponse, SubscriptionsResponse, VideoCategoriesResponse, VideoMeta, VideosResponse } from './types.ts';

export const API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * `duplicate`: YouTube already has it (e.g. already subscribed).
 * `refused`: YouTube won't do it right now (e.g. too many recent subscriptions).
 * `key-restricted`: the key's application or API restrictions block MeTube.
 */
export type ApiErrorKind = 'no-key' | 'invalid-key' | 'key-restricted' | 'quota' | 'api-disabled' | 'not-found' | 'network' | 'auth' | 'duplicate' | 'refused' | 'other';

export class YouTubeApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  constructor(kind: ApiErrorKind, message: string, status = 0) {
    super(message);
    this.name = 'YouTubeApiError';
    this.kind = kind;
    this.status = status;
  }
}

type Fetch = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export interface ClientOptions {
  getKey: () => Promise<string | undefined>;
  quota: QuotaTracker;
  fetch?: Fetch;
  now?: () => number;
}

/** Narrows a search (all optional; none changes its 100-unit cost). */
export interface SearchOptions {
  regionCode?: string;
  /** Epoch ms. */
  publishedAfter?: number;
  publishedBefore?: number;
  order?: 'relevance' | 'viewCount' | 'date';
  categoryId?: string | null;
}

export class YouTubeClient {
  private readonly opts: Required<ClientOptions>;

  constructor(opts: ClientOptions) {
    this.opts = {
      fetch: (url, init) => fetch(url, init),
      now: () => Date.now(),
      ...opts,
    };
  }

  private async call<T>(endpoint: Endpoint, path: string, params: Record<string, string>): Promise<T> {
    const key = (await this.opts.getKey())?.trim();
    if (!key) throw new YouTubeApiError('no-key', 'Add your YouTube Data API key in Settings.');
    await this.opts.quota.assertAffordable(endpoint);

    const url = `${API_BASE}/${path}?${new URLSearchParams({ ...params, key })}`;
    let res: Awaited<ReturnType<Fetch>>;
    try {
      res = await this.opts.fetch(url);
    } catch (e) {
      // Nothing reached Google, so no quota was spent.
      throw new YouTubeApiError('network', `Network error: ${e instanceof Error ? e.message : e}`);
    }
    await this.opts.quota.record(endpoint);

    const body = await res.json().catch(() => ({}));
    if (res.ok) return body as T;

    const err = (body as ApiErrorBody).error;
    const reason = err?.errors?.[0]?.reason ?? '';
    const message = err?.message ?? `HTTP ${res.status}`;
    if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
      await this.opts.quota.markExhausted();
      throw new YouTubeApiError('quota', 'Daily API quota used up. It resets at midnight Pacific time.', res.status);
    }
    if (reason === 'keyInvalid' || (reason === 'badRequest' && /key/i.test(message))) {
      throw new YouTubeApiError('invalid-key', 'That API key was rejected. Check it in Settings.', res.status);
    }
    if (reason === 'accessNotConfigured' || reason === 'SERVICE_DISABLED' || /has not been used|is disabled/i.test(message)) {
      throw new YouTubeApiError('api-disabled', 'Enable "YouTube Data API v3" for this key\'s Google Cloud project.', res.status);
    }
    // A website (referrer) restriction, or an API restriction without YouTube.
    // Key-only reads have no other 403 "forbidden": private playlists say playlistItemsNotAccessible.
    if (res.status === 403 && (reason === 'forbidden' || /are blocked/i.test(message))) {
      throw new YouTubeApiError('key-restricted', message, res.status);
    }
    if (res.status === 404 || reason === 'playlistNotFound') {
      throw new YouTubeApiError('not-found', message, res.status);
    }
    throw new YouTubeApiError('other', message, res.status);
  }

  /** Cheapest useful call (1 unit), used by the Settings "Test key" button. */
  async testKey(regionCode = localRegion()): Promise<number> {
    const r = await this.call<VideoCategoriesResponse>('videoCategories.list', 'videoCategories', { part: 'snippet', regionCode });
    return r.items.length;
  }

  async categories(regionCode = localRegion()): Promise<Record<string, string>> {
    const r = await this.call<VideoCategoriesResponse>('videoCategories.list', 'videoCategories', { part: 'snippet', regionCode });
    return Object.fromEntries(r.items.map((c) => [c.id, c.snippet.title]));
  }

  /**
   * Latest upload IDs for a channel via its uploads playlist (1 unit).
   * `longFormOnly` reads the playlist without Shorts, which throws `not-found`
   * for channels that don't have one.
   */
  async recentUploads(channelId: string, max = 10, opts: { longFormOnly?: boolean } = {}): Promise<string[]> {
    const r = await this.call<PlaylistItemsResponse>('playlistItems.list', 'playlistItems', {
      part: 'contentDetails',
      playlistId: uploadsPlaylistId(channelId, opts.longFormOnly),
      maxResults: String(Math.min(50, max)),
    });
    return r.items.map((i) => i.contentDetails.videoId);
  }

  /** Video IDs matching a query. Expensive: 100 units per call, so only on explicit user action. */
  async search(query: string, max = 25, opts: SearchOptions = {}): Promise<string[]> {
    const params: Record<string, string> = {
      part: 'id',
      type: 'video',
      q: query,
      maxResults: String(Math.min(50, max)),
      safeSearch: 'moderate',
    };
    if (opts.regionCode) params.regionCode = opts.regionCode;
    if (opts.publishedAfter !== undefined) params.publishedAfter = new Date(opts.publishedAfter).toISOString();
    if (opts.publishedBefore !== undefined) params.publishedBefore = new Date(opts.publishedBefore).toISOString();
    if (opts.order && opts.order !== 'relevance') params.order = opts.order;
    if (opts.categoryId) params.videoCategoryId = opts.categoryId;
    const r = await this.call<SearchResponse>('search.list', 'search', params);
    return r.items.map((i) => i.id.videoId).filter((id): id is string => !!id);
  }

  /**
   * A call made as the signed-in user (OAuth access token, no API key): checked
   * against and counted in the quota like any other call.
   */
  private async authed<T>(endpoint: Endpoint, url: string, accessToken: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    await this.opts.quota.assertAffordable(endpoint);
    let res: Awaited<ReturnType<Fetch>>;
    try {
      res = await this.opts.fetch(url, {
        method: init.method ?? 'GET',
        headers: { Authorization: `Bearer ${accessToken}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
        ...(init.body ? { body: JSON.stringify(init.body) } : {}),
      });
    } catch (e) {
      throw new YouTubeApiError('network', `Network error: ${e instanceof Error ? e.message : e}`);
    }
    await this.opts.quota.record(endpoint);
    if (res.status === 204) return undefined as T;
    const body = await res.json().catch(() => ({}));
    if (res.ok) return body as T;
    const err = (body as ApiErrorBody).error;
    const reason = err?.errors?.[0]?.reason ?? '';
    const message = err?.message ?? `HTTP ${res.status}`;
    if (res.status === 401 || reason === 'authError') throw new YouTubeApiError('auth', 'Your YouTube sign-in has expired. Sign in again to keep syncing.', res.status);
    if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') {
      await this.opts.quota.markExhausted();
      throw new YouTubeApiError('quota', 'Daily API quota used up. Syncing continues tomorrow.', res.status);
    }
    if (reason === 'subscriptionDuplicate') throw new YouTubeApiError('duplicate', message, res.status);
    if (res.status === 404 || /notfound/i.test(reason)) throw new YouTubeApiError('not-found', message, res.status);
    if (reason === 'subscriptionForbidden' || reason === 'tooManySubscriptions' || reason === 'rateLimitExceeded') {
      throw new YouTubeApiError('refused', `YouTube declined for now: ${message}`, res.status);
    }
    if (reason === 'insufficientPermissions' || res.status === 403) throw new YouTubeApiError('auth', `YouTube refused the request: ${message}`, res.status);
    throw new YouTubeApiError('other', message, res.status);
  }

  /**
   * Likes, dislikes or clears your rating of a video on YouTube (50 units).
   * Needs an OAuth access token for the user; an API key can't write.
   */
  async rate(videoId: string, rating: 'like' | 'dislike' | 'none', accessToken: string): Promise<void> {
    await this.authed<void>('videos.rate', `${API_BASE}/videos/rate?${new URLSearchParams({ id: videoId, rating })}`, accessToken, { method: 'POST' });
  }

  /** Your YouTube subscriptions, 50 per page (1 unit per page). */
  async mySubscriptions(accessToken: string): Promise<YouTubeSubscription[]> {
    const out: YouTubeSubscription[] = [];
    let pageToken: string | undefined;
    do {
      const params = new URLSearchParams({ part: 'snippet', mine: 'true', maxResults: '50', ...(pageToken ? { pageToken } : {}) });
      const r = await this.authed<SubscriptionsResponse>('subscriptions.list', `${API_BASE}/subscriptions?${params}`, accessToken);
      for (const i of r.items) out.push(toSubscription(i));
      pageToken = r.nextPageToken;
    } while (pageToken);
    return out;
  }

  /** Your subscription to one channel, if you have one (1 unit). */
  async findSubscription(channelId: string, accessToken: string): Promise<YouTubeSubscription | null> {
    const params = new URLSearchParams({ part: 'snippet', mine: 'true', forChannelId: channelId, maxResults: '1' });
    const r = await this.authed<SubscriptionsResponse>('subscriptions.list', `${API_BASE}/subscriptions?${params}`, accessToken);
    return r.items[0] ? toSubscription(r.items[0]) : null;
  }

  /** Subscribes you to a channel on YouTube (50 units). Returns the new subscription's ID. */
  async subscribe(channelId: string, accessToken: string): Promise<string> {
    const r = await this.authed<{ id: string }>('subscriptions.insert', `${API_BASE}/subscriptions?part=snippet`, accessToken, {
      method: 'POST',
      body: { snippet: { resourceId: { kind: 'youtube#channel', channelId } } },
    });
    return r.id;
  }

  /** Removes a subscription on YouTube by its subscription ID (50 units). */
  async unsubscribe(subscriptionId: string, accessToken: string): Promise<void> {
    await this.authed<void>('subscriptions.delete', `${API_BASE}/subscriptions?${new URLSearchParams({ id: subscriptionId })}`, accessToken, { method: 'DELETE' });
  }

  /**
   * Full metadata for up to 50 videos per call (1 unit per call, whatever the parts).
   * The player part with maxHeight adds the embed size, which tells vertical Shorts apart.
   */
  /**
   * YouTube's most popular videos in a category for a region, with full
   * details (1 unit for up to 50). Some categories have no chart; YouTube
   * answers not-found for those.
   */
  async popular(categoryId: string, regionCode = localRegion(), max = 50): Promise<VideoMeta[]> {
    const r = await this.call<VideosResponse>('videos.list', 'videos', {
      part: 'snippet,contentDetails,statistics,player',
      chart: 'mostPopular',
      videoCategoryId: categoryId,
      regionCode,
      maxResults: String(Math.min(50, max)),
      maxHeight: '720',
    });
    const fetchedAt = this.opts.now();
    return r.items.map((v) => toVideoMeta(v, fetchedAt));
  }

  async videos(ids: string[]): Promise<VideoMeta[]> {
    const out: VideoMeta[] = [];
    const unique = [...new Set(ids)];
    for (let i = 0; i < unique.length; i += 50) {
      const r = await this.call<VideosResponse>('videos.list', 'videos', {
        part: 'snippet,contentDetails,statistics,player',
        id: unique.slice(i, i + 50).join(','),
        maxResults: '50',
        maxHeight: '720',
      });
      const fetchedAt = this.opts.now();
      for (const v of r.items) out.push(toVideoMeta(v, fetchedAt));
    }
    return out;
  }
}

/** Two-letter region from the browser's language ("en-ZA" → "ZA"), or "US" when it has none. */
export function localRegion(locale: string | undefined = globalThis.navigator?.language): string {
  try {
    const region = locale ? new Intl.Locale(locale).maximize().region : undefined;
    return region && /^[A-Z]{2}$/.test(region) ? region : 'US';
  } catch {
    return 'US';
  }
}

export interface YouTubeSubscription {
  /** The subscription's own ID (for unsubscribing), not the channel's. */
  id: string;
  channelId: string;
  channelTitle: string;
  subscribedAt: number | null;
}

function toSubscription(i: SubscriptionsResponse['items'][number]): YouTubeSubscription {
  const t = i.snippet.publishedAt ? Date.parse(i.snippet.publishedAt) : NaN;
  return { id: i.id, channelId: i.snippet.resourceId.channelId, channelTitle: i.snippet.title, subscribedAt: Number.isNaN(t) ? null : t };
}

/**
 * A channel's uploads playlist ID is its channel ID with the "UC" prefix
 * swapped for "UU". Using it directly saves a channels.list call per channel.
 * "UULF" is the same list without Shorts or live streams (undocumented).
 */
export function uploadsPlaylistId(channelId: string, longFormOnly = false): string {
  return channelId.startsWith('UC') ? `${longFormOnly ? 'UULF' : 'UU'}${channelId.slice(2)}` : channelId;
}

/** ISO 8601 duration ("PT1H2M3S", "P1DT2H") to seconds. */
export function parseDuration(iso: string): number {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(iso);
  if (!m) return 0;
  const [d, h, min, s] = m.slice(1).map((x) => Number(x ?? 0)) as [number, number, number, number];
  return d * 86_400 + h * 3_600 + min * 60 + s;
}

/** Player width / height, or undefined when YouTube didn't say. */
function embedAspect(player: VideosResponse['items'][number]['player']): number | undefined {
  const w = Number(player?.embedWidth);
  const h = Number(player?.embedHeight);
  return w > 0 && h > 0 ? w / h : undefined;
}

export function toVideoMeta(v: VideosResponse['items'][number], fetchedAt: number): VideoMeta {
  const t = v.snippet.thumbnails;
  const views = v.statistics?.viewCount;
  const likes = v.statistics?.likeCount;
  const aspect = embedAspect(v.player);
  return {
    id: v.id,
    channelId: v.snippet.channelId,
    channelTitle: v.snippet.channelTitle,
    title: v.snippet.title,
    description: v.snippet.description,
    tags: v.snippet.tags ?? [],
    categoryId: v.snippet.categoryId,
    publishedAt: Date.parse(v.snippet.publishedAt),
    durationSec: parseDuration(v.contentDetails.duration),
    ...(aspect !== undefined ? { aspect } : {}),
    isLive: v.snippet.liveBroadcastContent === 'live' || v.snippet.liveBroadcastContent === 'upcoming',
    thumbnail: (t.medium ?? t.high ?? t.default)?.url ?? null,
    viewCount: views ? Number(views) : null,
    likeCount: likes ? Number(likes) : null,
    fetchedAt,
  };
}

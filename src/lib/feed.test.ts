import 'fake-indexeddb/auto';
import { describe, expect, test } from 'vitest';
import { openMeTubeDB, saveImport } from './db.ts';
import { getVideos, purgeExpired, putVideos } from './cache.ts';
import { EMPTY_CONTEXT, UNCHARTED_TOPICS, capPerChannel, gatherPool, isShort, rankFeed, searchIntoPool, unchartedQuery, unchartedTopicId, type RankContext } from './feed.ts';
import { buildModel } from './model.ts';
import type { Feedback } from './feedback.ts';
import { subscribe } from './subscriptions.ts';
import { MemoryStore, QuotaTracker } from './quota.ts';
import { YouTubeClient } from './api/client.ts';
import type { VideoMeta } from './api/types.ts';
import type { ChannelEngagement } from './engagement.ts';
import { LOCALES } from './i18n/index.ts';
import { translator } from './i18n/catalogs.ts';

const NOW = Date.parse('2026-10-17T12:00:00Z');
const DAY = 86_400_000;

const vid = (id: string, channelId: string, ageDays: number, extra: Partial<VideoMeta> = {}): VideoMeta => ({
  id, channelId, channelTitle: channelId, title: id, description: '', tags: [], categoryId: '17',
  publishedAt: NOW - ageDays * DAY, durationSec: 600, isLive: false, thumbnail: null, viewCount: null,
  fetchedAt: NOW, ...extra,
});
const eng = (channelId: string, score: number): ChannelEngagement => ({
  channelId, channelTitle: channelId, watches: 5, uniqueVideos: 5, rewatchedVideos: 0,
  firstWatched: 0, lastWatched: 0, subscribed: false, score,
});
const rank = (videos: VideoMeta[], ctx: Partial<RankContext> = {}, extra: { watched?: string[]; search?: string[] } = {}) =>
  rankFeed(
    {
      videos,
      engagement: [eng('UCtop', 100), eng('UClow', 25)],
      watched: new Set(extra.watched ?? []),
      searchHits: new Set(extra.search ?? []),
    },
    { ...EMPTY_CONTEXT, ...ctx },
    NOW,
  ).map((i) => i.video.id);

describe('isShort', () => {
  const v = (durationSec: number, aspect?: number, extra: Partial<VideoMeta> = {}) => vid('x', 'UCtop', 0, { durationSec, aspect, ...extra });
  const VERTICAL = 9 / 16;
  const WIDE = 16 / 9;
  test('vertical or square up to 3 minutes', () => {
    expect(isShort(v(150, VERTICAL))).toBe(true);
    expect(isShort(v(180, 1))).toBe(true);
    expect(isShort(v(150, WIDE))).toBe(false);
    expect(isShort(v(40, WIDE))).toBe(false);
    expect(isShort(v(600, VERTICAL))).toBe(false);
  });
  test('unknown shape falls back to a minute', () => {
    expect(isShort(v(50))).toBe(true);
    expect(isShort(v(90))).toBe(false);
  });
  test('#shorts in the title or tags, up to 3 minutes', () => {
    expect(isShort(v(120, undefined, { tags: ['Shorts'] }))).toBe(true);
    expect(isShort(v(120, WIDE, { title: 'Big jump #shorts' }))).toBe(true);
    expect(isShort(v(400, undefined, { tags: ['#shorts'] }))).toBe(false);
    expect(isShort(v(120, undefined, { title: '#shortstack recipe' }))).toBe(false);
  });
  test('no duration (live, premieres) is not a Short', () => {
    expect(isShort(v(0, VERTICAL))).toBe(false);
  });
});

describe('rankFeed', () => {
  test('engagement and freshness; filters watched, shorts, live and unknown channels', () => {
    // UClow has a quarter of UCtop's engagement: its new upload should beat UCtop's
    // two-month-old one, but not UCtop's new one.
    expect(
      rank(
        [
          vid('fresh-top', 'UCtop', 1),
          vid('old-top', 'UCtop', 60),
          vid('fresh-low', 'UClow', 1),
          vid('watched', 'UCtop', 0),
          vid('short', 'UCtop', 0, { durationSec: 40 }),
          vid('vertical-short', 'UCtop', 0, { durationSec: 150, aspect: 9 / 16 }),
          vid('live', 'UCtop', 0, { isLive: true }),
          vid('stranger', 'UCunknown', 0),
        ],
        {},
        { watched: ['watched'] },
      ),
    ).toEqual(['fresh-top', 'fresh-low', 'old-top']);
  });

  test('settings can show shorts and watched videos', () => {
    expect(rank([vid('short', 'UCtop', 0, { durationSec: 40 }), vid('w', 'UCtop', 0)], { hideShorts: false, hideWatched: false }, { watched: ['w'] })).toHaveLength(2);
  });

  test('blocked tags, mood excludes and hide chips remove videos', () => {
    const vids = [vid('news', 'UCtop', 0, { tags: ['Breaking News'] }), vid('asmr', 'UCtop', 0, { title: 'Rain ASMR' }), vid('ok', 'UCtop', 0)];
    expect(rank(vids, { blockedTags: ['breaking news'], moodExclude: ['asmr'] })).toEqual(['ok']);
    expect(rank(vids, { hideTags: ['news'] })).toEqual(['asmr', 'ok']);
  });

  test('only-chips require every tag', () => {
    const vids = [
      vid('both', 'UCtop', 1, { title: 'EDM mix female vocals' }),
      vid('one', 'UCtop', 0, { title: 'EDM mix' }),
    ];
    expect(rank(vids, { onlyTags: ['edm', 'female vocals'] })).toEqual(['both']);
  });

  test('liked tags and mood lift matching videos above fresher ones', () => {
    const vids = [vid('plain', 'UCtop', 0), vid('synth', 'UCtop', 3, { tags: ['synthwave'] })];
    expect(rank(vids)).toEqual(['plain', 'synth']);
    expect(rank(vids, { likedTags: ['synthwave'] })[0]).toBe('synth');
    expect(rank(vids, { moodInclude: ['synthwave'] })[0]).toBe('synth');
  });

  test('category filter and search hits from unknown channels', () => {
    const vids = [vid('music', 'UCnew', 0, { categoryId: '10' }), vid('sport', 'UCtop', 0)];
    expect(rank(vids, {}, { search: ['music'] })).toEqual(['sport', 'music']);
    expect(rank(vids, { categoryId: '10' }, { search: ['music'] })).toEqual(['music']);
  });

  test('reasons explain the ranking', () => {
    const [item] = rankFeed(
      { videos: [vid('x', 'UCtop', 0, { tags: ['f1'] })], engagement: [eng('UCtop', 10)], watched: new Set(), searchHits: new Set() },
      { ...EMPTY_CONTEXT, likedTags: ['f1'], moodInclude: ['f1'] },
      NOW,
    );
    expect(item?.reasons).toEqual([{ code: 'moodTags', tags: ['f1'] }, { code: 'likedTags', tags: ['f1'] }]);
  });

  test('per-channel cap moves the overflow after other channels', () => {
    const ranked = [vid('a1', 'A', 0), vid('a2', 'A', 0), vid('a3', 'A', 0), vid('b1', 'B', 0)].map((video, i) => ({ video, score: 10 - i, reasons: [] }));
    expect(capPerChannel(ranked, 2).map((i) => i.video.id)).toEqual(['a1', 'a2', 'b1', 'a3']);
  });
});

describe('time, popularity and Uncharted', () => {
  test('time range keeps videos published inside it', () => {
    const vids = [vid('today', 'UCtop', 0), vid('lastweek', 'UCtop', 5), vid('lastyear', 'UCtop', 200)];
    expect(rank(vids, { publishedAfter: NOW - 7 * DAY })).toEqual(['today', 'lastweek']);
    expect(rank(vids, { publishedAfter: NOW - 365 * DAY, publishedBefore: NOW - 30 * DAY })).toEqual(['lastyear']);
  });

  test('popularity bands use view counts; hidden counts drop out', () => {
    const vids = [vid('gem', 'UCtop', 0, { viewCount: 900 }), vid('hit', 'UCtop', 1, { viewCount: 4_000_000 }), vid('mid', 'UCtop', 2, { viewCount: 50_000 }), vid('hidden', 'UCtop', 3)];
    expect(rank(vids, { popularity: 'lesser' })).toEqual(['gem']);
    expect(rank(vids, { popularity: 'popular' })).toEqual(['hit']);
    expect(rank(vids, { popularity: 'any' })).toHaveLength(4);
  });

  test('Uncharted: only unknown channels from Uncharted searches, likes ignored, dislikes still out', () => {
    const topic = UNCHARTED_TOPICS[0]!;
    const pool = {
      videos: [
        vid('far', 'UCfar', 0, { tags: ['clay'] }),
        vid('liked-tag', 'UCfar2', 0, { tags: ['synthwave'] }),
        vid('blocked', 'UCfar3', 0, { tags: ['prank'] }),
        vid('known', 'UCtop', 0),
        vid('old-search', 'UCelse', 0),
        vid('old-far', 'UCfar4', 1),
      ],
      engagement: [eng('UCtop', 100)],
      watched: new Set<string>(),
      searchHits: new Set<string>(),
      discoverHits: new Set(['far', 'liked-tag', 'blocked', 'known']),
      discoverFor: 'uncharted' as const,
      library: new Set(['old-search', 'old-far']),
      queries: new Map([['far', [topic]], ['old-search', ['synthwave']], ['old-far', [topic]]]),
    };
    const ctx = { ...EMPTY_CONTEXT, channelScope: 'uncharted' as const, likedTags: ['synthwave'], blockedTags: ['prank'], moodInclude: ['clay'] };
    const items = rankFeed(pool, ctx, NOW);
    expect(items.map((i) => i.video.id)).toEqual(['far', 'old-far']);
    expect(items[0]?.reasons[0]).toEqual({ code: 'uncharted', topic });
    // Outside Uncharted, its finds don't leak into the other scopes.
    expect(rankFeed(pool, { ...ctx, channelScope: 'new' }, NOW).map((i) => i.video.id)).toEqual(['old-search']);
  });

  test('Uncharted filters strongly disliked learned tags', () => {
    const fb = (videoId: string): Feedback => ({ videoId, channelId: 'UCx', channelTitle: 'x', categoryId: '1', tags: ['reaction'], rating: -2, dismissed: null, moodId: null, at: NOW });
    const model = buildModel([fb('a'), fb('b')], NOW);
    const pool = {
      videos: [vid('react', 'UCfar', 0, { tags: ['reaction'] }), vid('calm', 'UCfar2', 0)],
      engagement: [], watched: new Set<string>(), searchHits: new Set(['react', 'calm']),
    };
    expect(rankFeed(pool, { ...EMPTY_CONTEXT, channelScope: 'uncharted', model }, NOW).map((i) => i.video.id)).toEqual(['calm']);
  });

  test('uncharted topics avoid your interests', () => {
    const all = new Set(UNCHARTED_TOPICS.map((_, i) => unchartedQuery([], i, 0)));
    expect(all.size).toBe(UNCHARTED_TOPICS.length);
    for (let i = 0; i < UNCHARTED_TOPICS.length; i++) {
      const q = unchartedQuery(['pottery', 'rock climbing', 'surfing'], i, 0);
      expect(['pottery', 'rock climbing', 'surfing']).not.toContain(q);
    }
    // "rock" shares a word with "rock climbing".
    expect(UNCHARTED_TOPICS.map((_, i) => unchartedQuery(['rock music'], i, 0))).not.toContain('rock climbing');
  });

  test('uncharted topics avoid your interests in any language, by their labels', () => {
    const labels = (topic: string) => {
      const id = unchartedTopicId(topic);
      return id ? LOCALES.map((l) => translator(l.id)(`uncharted.topic.${id}`)) : [];
    };
    const dayOf = (topic: string) => UNCHARTED_TOPICS.indexOf(topic) * DAY;
    for (const [avoid, topic] of [[['tricot'], 'knitting'], [['tricot facile'], 'knitting'], [['töpfern'], 'pottery'], [['keramik', 'Töpfern'], 'pottery'], [['surf'], 'surfing'], [['jardinería'], 'gardening'], [['jardinage'], 'gardening']] as const) {
      expect(unchartedQuery([], 0, dayOf(topic))).toBe(topic);
      expect(unchartedQuery([...avoid], 0, dayOf(topic), labels), avoid.join()).not.toBe(topic);
      expect(UNCHARTED_TOPICS.map((_, i) => unchartedQuery([...avoid], i, 0, labels)), avoid.join()).not.toContain(topic);
    }
    // Function words don't count: birdwatching ("observation des oiseaux") doesn't close sign language ("langue des signes").
    const seen = UNCHARTED_TOPICS.map((_, i) => unchartedQuery(['observation des oiseaux'], i, 0, labels));
    expect(seen).not.toContain('birdwatching');
    expect(seen).toContain('sign language');
  });
});

describe('cache', () => {
  test('expired metadata is never served and gets purged', async () => {
    const db = await openMeTubeDB('cache-' + Math.random());
    await putVideos(db, [vid('new', 'A', 0), vid('stale', 'A', 0, { fetchedAt: NOW - 31 * DAY })]);
    expect([...(await getVideos(db, ['new', 'stale'], NOW)).keys()]).toEqual(['new']);
    expect(await purgeExpired(db, NOW)).toBe(1);
  });
});

function mockClient(calls: string[]) {
  const quota = new QuotaTracker(new MemoryStore(), () => new Date(NOW));
  const client = new YouTubeClient({
    getKey: async () => 'k',
    quota,
    now: () => NOW,
    fetch: async (url) => {
      const u = new URL(url);
      calls.push(u.pathname.split('/').pop()!);
      if (u.pathname.endsWith('playlistItems')) {
        return { ok: true, status: 200, json: async () => ({ items: ['seen', 'v1', 'v2'].map((videoId) => ({ contentDetails: { videoId } })) }) };
      }
      if (u.pathname.endsWith('search')) {
        return { ok: true, status: 200, json: async () => ({ items: [{ id: { kind: 'youtube#video', videoId: 's1' } }] }) };
      }
      const ids = u.searchParams.get('id')!.split(',');
      return {
        ok: true, status: 200,
        json: async () => ({
          items: ids.map((id, i) => ({
            id,
            snippet: { publishedAt: new Date(NOW - i * DAY).toISOString(), channelId: id === 's1' ? 'UCother' : 'UCa', channelTitle: 'A', title: id, description: '', categoryId: '17', thumbnails: {} },
            contentDetails: { duration: 'PT10M' },
          })),
        }),
      };
    },
  });
  return { client, quota };
}

describe('gatherPool + search', () => {
  test('few calls, cached second run, search merges at 101 units', async () => {
    const db = await openMeTubeDB('feed-' + Math.random());
    await saveImport(db, {
      files: [], skipped: 0, searches: [], playlistItems: [],
      subscriptions: [{ channelId: 'UCa', channelTitle: 'A' }],
      watches: [{ videoId: 'seen', title: 't', channelId: 'UCa', channelTitle: 'A', time: NOW - DAY, isAd: false }],
    });
    const calls: string[] = [];
    const { client, quota } = mockClient(calls);
    const opts = { channels: 30, uploadsPerChannel: 8 };

    const first = await gatherPool(db, client, opts, NOW);
    expect(rankFeed(first, EMPTY_CONTEXT, NOW).map((i) => i.video.id)).toEqual(['v1', 'v2']);
    expect(first.apiCallsMade).toBe(2);

    const second = await gatherPool(db, client, opts, NOW + 60_000);
    expect(second.apiCallsMade).toBe(0);
    expect(calls).toEqual(['playlistItems', 'videos']);

    const searched = await searchIntoPool(db, client, second, 'anything', { kind: 'search' }, NOW);
    expect(searched.unitsUsed).toBe(101);
    expect(rankFeed(searched.pool, EMPTY_CONTEXT, NOW).map((i) => i.video.id)).toContain('s1');
    expect((await quota.state()).used).toBe(2 + 100 + 1);

    // The same search within 12 hours comes from the cache.
    const again = await searchIntoPool(db, client, second, 'Anything', { kind: 'search' }, NOW + 3_600_000);
    expect(again.unitsUsed).toBe(0);

    // A later load keeps earlier search results in the library, with the query that found them.
    const third = await gatherPool(db, client, opts, NOW + 7 * 3_600_000);
    expect(third.library?.has('s1')).toBe(true);
    expect(third.queries?.get('s1')).toEqual(['anything']);
    // Not in the plain feed, but there while filtering, and the search counts as a tag match.
    expect(rankFeed(third, EMPTY_CONTEXT, NOW).map((i) => i.video.id)).not.toContain('s1');
    expect(rankFeed(third, { ...EMPTY_CONTEXT, onlyTags: ['anything'] }, NOW).map((i) => i.video.id)).toEqual(['s1']);
  });

  test('a fatal error stops the other channel fetches', async () => {
    const db = await openMeTubeDB('fatal-' + Math.random());
    await saveImport(db, {
      files: [], skipped: 0, searches: [], playlistItems: [], watches: [],
      subscriptions: Array.from({ length: 20 }, (_, i) => ({ channelId: `UC${i}`, channelTitle: `C${i}` })),
    });
    let calls = 0;
    const client = new YouTubeClient({
      getKey: async () => 'k',
      quota: new QuotaTracker(new MemoryStore(), () => new Date(NOW)),
      now: () => NOW,
      fetch: async () => {
        calls++;
        return { ok: false, status: 400, json: async () => ({ error: { code: 400, message: 'API key not valid', errors: [{ reason: 'keyInvalid' }] } }) };
      },
    });
    await expect(gatherPool(db, client, { channels: 30, uploadsPerChannel: 8 }, NOW)).rejects.toMatchObject({ kind: 'invalid-key' });
    await new Promise((r) => setTimeout(r, 20));
    // Every worker hits the same error on its next call, so at most one call per worker (4), not one per channel (20).
    expect(calls).toBeLessThanOrEqual(4);
  });

  test('a MeTube subscription outside your top channels is still fetched, and counts as known', async () => {
    const db = await openMeTubeDB('subfeed-' + Math.random());
    await saveImport(db, {
      files: [], skipped: 0, searches: [], playlistItems: [], subscriptions: [],
      watches: [0, 1, 2, 3, 4, 5].map((i) => ({ videoId: `w${i}`, title: 't', channelId: 'UCa', channelTitle: 'A', time: NOW - DAY, isAd: false })),
    });
    await subscribe(db, 'UCnewsub', 'New sub', NOW);
    const fetched: string[] = [];
    const client = new YouTubeClient({
      getKey: async () => 'k', quota: new QuotaTracker(new MemoryStore(), () => new Date(NOW)), now: () => NOW,
      fetch: async (url) => {
        const u = new URL(url);
        if (u.pathname.endsWith('playlistItems')) {
          fetched.push(u.searchParams.get('playlistId')!);
          return { ok: true, status: 200, json: async () => ({ items: [] }) };
        }
        return { ok: true, status: 200, json: async () => ({ items: [] }) };
      },
    });
    // Only one top channel, yet the new subscription is checked too.
    const pool = await gatherPool(db, client, { channels: 1, uploadsPerChannel: 8 }, NOW);
    expect(fetched.sort()).toEqual(['UUa', 'UUnewsub']);
    expect(pool.engagement.find((c) => c.channelId === 'UCnewsub')?.subscribed).toBe(true);
  });

  /** Two channels: UCa has a long-form playlist, UCb doesn't (404). Records each playlist asked for. */
  async function longFormSetup() {
    const db = await openMeTubeDB('longform-' + Math.random());
    await saveImport(db, {
      files: [], skipped: 0, searches: [], playlistItems: [], watches: [],
      subscriptions: [{ channelId: 'UCa', channelTitle: 'A' }, { channelId: 'UCb', channelTitle: 'B' }],
    });
    const fetched: string[] = [];
    const client = new YouTubeClient({
      getKey: async () => 'k', quota: new QuotaTracker(new MemoryStore(), () => new Date(NOW)), now: () => NOW,
      fetch: async (url) => {
        const u = new URL(url);
        if (!u.pathname.endsWith('playlistItems')) return { ok: true, status: 200, json: async () => ({ items: [] }) };
        const id = u.searchParams.get('playlistId')!;
        fetched.push(id);
        if (id === 'UULFb') return { ok: false, status: 404, json: async () => ({ error: { code: 404, message: 'not found', errors: [{ reason: 'playlistNotFound' }] } }) };
        return { ok: true, status: 200, json: async () => ({ items: [{ contentDetails: { videoId: `${id}-1` } }] }) };
      },
    });
    return { db, client, fetched };
  }

  test('Hide Shorts reads the long-form uploads list, cached apart from the full one', async () => {
    const { db, client, fetched } = await longFormSetup();
    const opts = { channels: 30, uploadsPerChannel: 8 };
    await gatherPool(db, client, { ...opts, hideShorts: true }, NOW);
    expect(fetched.filter((p) => p.endsWith('a'))).toEqual(['UULFa']);
    expect((await db.get('uploads', 'lf:UCa'))?.videoIds).toEqual(['UULFa-1']);

    // Turning the setting off doesn't reuse the long-form list.
    fetched.length = 0;
    await gatherPool(db, client, opts, NOW + 60_000);
    expect(fetched.sort()).toEqual(['UUa', 'UUb']);
    expect((await db.get('uploads', 'UCa'))?.videoIds).toEqual(['UUa-1']);
  });

  test('no long-form list: falls back to all uploads once, and remembers it', async () => {
    const { db, client, fetched } = await longFormSetup();
    const opts = { channels: 30, uploadsPerChannel: 8, hideShorts: true };
    const first = await gatherPool(db, client, opts, NOW);
    expect(fetched.filter((p) => p.endsWith('b'))).toEqual(['UULFb', 'UUb']);
    expect(first.errors).toEqual([]);
    // Both of UCb's calls cost a unit, plus UCa's list and one videos call.
    expect(first.apiCallsMade).toBe(4);
    expect(await db.get('uploads', 'lf:UCb')).toMatchObject({ videoIds: ['UUb-1'], noLongForm: true });

    // Once the cached list is stale, UCb goes straight to its full uploads list.
    fetched.length = 0;
    await gatherPool(db, client, opts, NOW + 7 * 3_600_000);
    expect(fetched.sort()).toEqual(['UULFa', 'UUb']);
    expect((await db.get('uploads', 'lf:UCb'))?.noLongForm).toBe(true);
  });
});

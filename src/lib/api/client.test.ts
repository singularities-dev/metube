import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { MemoryStore, QuotaTracker } from '../quota.ts';
import { YouTubeApiError, YouTubeClient, localRegion, parseDuration, uploadsPlaylistId } from './client.ts';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`../../../fixtures/api/${name}.json`, import.meta.url), 'utf8'));

function setup(responses: Record<string, { status?: number; body: unknown }>, key: string | null = 'test-key') {
  const quota = new QuotaTracker(new MemoryStore(), () => new Date('2026-10-17T12:00:00Z'));
  const urls: string[] = [];
  const client = new YouTubeClient({
    getKey: async () => key ?? undefined,
    quota,
    now: () => 1_000,
    fetch: async (url) => {
      urls.push(url);
      const path = new URL(url).pathname.split('/').pop()!;
      const r = responses[path] ?? { status: 404, body: { error: { code: 404, message: 'nope' } } };
      const status = r.status ?? 200;
      return { ok: status < 400, status, json: async () => r.body };
    },
  });
  return { client, quota, urls };
}

describe('helpers', () => {
  test('uploads playlist id', () => {
    expect(uploadsPlaylistId('UCabc')).toBe('UUabc');
    expect(uploadsPlaylistId('UCabc', true)).toBe('UULFabc');
    expect(uploadsPlaylistId('odd', true)).toBe('odd');
  });
  test('durations', () => {
    expect(parseDuration('PT12M30S')).toBe(750);
    expect(parseDuration('PT1H')).toBe(3600);
    expect(parseDuration('P1DT2H3M4S')).toBe(93_784);
    expect(parseDuration('P0D')).toBe(0);
  });
  test('region from the browser language', () => {
    expect(localRegion('en-ZA')).toBe('ZA');
    expect(localRegion('de')).toBe('DE');
    expect(localRegion('es-419')).toBe('US');
    expect(localRegion('not a locale')).toBe('US');
    expect(localRegion(undefined)).toBe('US');
  });
});

describe('YouTubeClient', () => {
  test('recentUploads uses the uploads playlist and costs 1 unit', async () => {
    const { client, quota, urls } = setup({ playlistItems: { body: fixture('playlistItems') } });
    const ids = await client.recentUploads('UCchannelAAAAAAAAAAAAAAA', 3);
    expect(ids).toEqual(['vidAAAAAAA1', 'vidAAAAAAA2', 'vidAAAAAAA3']);
    expect(urls[0]).toContain('playlistId=UUchannelAAAAAAAAAAAAAAA');
    expect((await quota.state()).used).toBe(1);
  });

  test('recentUploads without Shorts uses the long-form playlist; a missing one is not-found', async () => {
    const { client, urls } = setup({ playlistItems: { body: fixture('playlistItems') } });
    await client.recentUploads('UCchannelAAAAAAAAAAAAAAA', 3, { longFormOnly: true });
    expect(new URL(urls[0]!).searchParams.get('playlistId')).toBe('UULFchannelAAAAAAAAAAAAAAA');
    const missing = setup({ playlistItems: { status: 404, body: { error: { code: 404, message: 'not found', errors: [{ reason: 'playlistNotFound' }] } } } });
    await expect(missing.client.recentUploads('UCx', 3, { longFormOnly: true })).rejects.toMatchObject({ kind: 'not-found' });
  });

  test('videos normalises metadata and batches by 50', async () => {
    const { client, quota, urls } = setup({ videos: { body: fixture('videos') } });
    const ids = Array.from({ length: 60 }, (_, i) => `id${i}`);
    const vids = await client.videos(ids);
    expect(urls).toHaveLength(2);
    expect((await quota.state()).used).toBe(2);
    // The player part is free within the same call and gives the shape.
    const p = new URL(urls[0]!).searchParams;
    expect(p.get('part')).toBe('snippet,contentDetails,statistics,player');
    expect(p.get('maxHeight')).toBe('720');
    const [a, b, c] = vids;
    expect(a).toMatchObject({
      id: 'vidAAAAAAA1', durationSec: 750, tags: ['cycling', 'highlights', 'tour'], viewCount: 154_321, likeCount: 4_200,
      thumbnail: 'https://i.ytimg.com/vi/vidAAAAAAA1/mqdefault.jpg', isLive: false, fetchedAt: 1_000,
    });
    expect(a!.aspect).toBeCloseTo(16 / 9);
    expect(b).toMatchObject({ durationSec: 45, tags: [], viewCount: null, thumbnail: 'https://i.ytimg.com/vi/vidAAAAAAA2/hqdefault.jpg' });
    expect(b!.aspect).toBeCloseTo(9 / 16);
    expect(c).toMatchObject({ isLive: true, thumbnail: null });
    // No embed size: shape unknown.
    expect(c).not.toHaveProperty('aspect');
  });

  test('no key: fails before spending quota', async () => {
    const { client, quota, urls } = setup({}, null);
    await expect(client.testKey()).rejects.toMatchObject({ kind: 'no-key' });
    expect(urls).toHaveLength(0);
    expect((await quota.state()).used).toBe(0);
  });

  test('quotaExceeded marks the day as spent', async () => {
    const { client, quota } = setup({ videoCategories: { status: 403, body: fixture('error-quotaExceeded') } });
    await expect(client.testKey()).rejects.toMatchObject({ kind: 'quota' });
    expect(await quota.remaining()).toBe(0);
  });

  test('invalid key is reported clearly', async () => {
    const { client } = setup({ videoCategories: { status: 400, body: fixture('error-keyInvalid') } });
    const err = await client.testKey().catch((e) => e);
    expect(err).toBeInstanceOf(YouTubeApiError);
    expect(err.kind).toBe('invalid-key');
  });

  test('a key restricted to websites or other APIs is reported as such', async () => {
    const referer = { error: { code: 403, message: 'Requests from referer <empty> are blocked.', errors: [{ reason: 'forbidden' }] } };
    const { client } = setup({ videoCategories: { status: 403, body: referer } });
    await expect(client.testKey()).rejects.toMatchObject({ kind: 'key-restricted', status: 403 });
    const api = { error: { code: 403, message: 'Requests to this API youtube.googleapis.com method youtube.api.v3.V3DataVideoCategoryService.List are blocked.', errors: [{ reason: 'forbidden' }] } };
    await expect(setup({ videoCategories: { status: 403, body: api } }).client.testKey()).rejects.toMatchObject({ kind: 'key-restricted' });
  });

  test('local quota guard blocks calls before sending', async () => {
    const { client, quota, urls } = setup({ videoCategories: { body: fixture('videoCategories') } });
    await quota.markExhausted();
    await expect(client.testKey()).rejects.toThrow(/Quota/);
    expect(urls).toHaveLength(0);
  });

  test('search passes date range, order and category', async () => {
    const { client, urls } = setup({ search: { body: { items: [{ id: { kind: 'youtube#video', videoId: 'x' } }, { id: { kind: 'youtube#channel' } }] } } });
    expect(await client.search('sci fi', 25, { publishedAfter: Date.UTC(2026, 0, 1), publishedBefore: Date.UTC(2026, 1, 1), order: 'viewCount', categoryId: '1' })).toEqual(['x']);
    const p = new URL(urls[0]!).searchParams;
    expect(p.get('publishedAfter')).toBe('2026-01-01T00:00:00.000Z');
    expect(p.get('publishedBefore')).toBe('2026-02-01T00:00:00.000Z');
    expect(p.get('order')).toBe('viewCount');
    expect(p.get('videoCategoryId')).toBe('1');
    await client.search('plain');
    const q = new URL(urls[1]!).searchParams;
    expect(['publishedAfter', 'order', 'videoCategoryId'].map((k) => q.get(k))).toEqual([null, null, null]);
  });

  test('categories map', async () => {
    const { client } = setup({ videoCategories: { body: fixture('videoCategories') } });
    expect(await client.categories()).toEqual({ '10': 'Music', '17': 'Sports', '20': 'Gaming' });
  });
});

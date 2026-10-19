import 'fake-indexeddb/auto';
import { describe, expect, test } from 'vitest';
import { openMeTubeDB } from './db.ts';
import { allFeedback, dismissVideo, rateVideo, restoreFeedback, getFeedback, unhideChannel } from './feedback.ts';
import { buildModel, learnedMoodTags, moodSuggestions, topTags } from './model.ts';
import { EMPTY_CONTEXT, moodQuery, rankFeed, searchIntoPool } from './feed.ts';
import { MemoryStore, QuotaTracker } from './quota.ts';
import { YouTubeClient } from './api/client.ts';
import type { VideoMeta } from './api/types.ts';
import type { ChannelEngagement } from './engagement.ts';

const NOW = Date.parse('2026-10-17T12:00:00Z');
const DAY = 86_400_000;
const vid = (id: string, channelId: string, tags: string[] = [], extra: Partial<VideoMeta> = {}): VideoMeta => ({
  id, channelId, channelTitle: channelId, title: id, description: '', tags, categoryId: '10',
  publishedAt: NOW - DAY, durationSec: 600, isLive: false, thumbnail: null, viewCount: null, fetchedAt: NOW, ...extra,
});
const eng = (channelId: string, score: number): ChannelEngagement => ({
  channelId, channelTitle: channelId, watches: 5, uniqueVideos: 5, rewatchedVideos: 0, firstWatched: 0, lastWatched: 0, subscribed: false, score,
});

describe('feedback store', () => {
  test('rating, dismissal, undo and unhide', async () => {
    const db = await openMeTubeDB('fb-' + Math.random());
    const v = vid('a', 'UCx', ['Synthwave', 'synthwave', 'Mix']);
    const rated = await rateVideo(db, v, 2, 'focus', NOW);
    expect(rated).toMatchObject({ rating: 2, dismissed: null, tags: ['synthwave', 'mix'], moodId: 'focus' });

    const before = await getFeedback(db, 'a');
    await dismissVideo(db, v, 'hide-channel', null, NOW);
    expect((await getFeedback(db, 'a'))?.dismissed).toBe('hide-channel');
    await restoreFeedback(db, 'a', before);
    expect((await getFeedback(db, 'a'))?.dismissed).toBeNull();

    await dismissVideo(db, vid('b', 'UCx'), 'hide-channel', null, NOW);
    await unhideChannel(db, 'UCx');
    expect(await getFeedback(db, 'b')).toBeUndefined();
    expect(await allFeedback(db)).toHaveLength(1);
  });
});

describe('model', () => {
  const fb = (videoId: string, channelId: string, tags: string[], rating: number | null, dismissed: string | null = null, moodId: string | null = null, at = NOW) =>
    ({ videoId, channelId, channelTitle: channelId, categoryId: '10', tags, rating, dismissed, moodId, at }) as never;

  test('learns channels, tags, moods; hides what should stay hidden', () => {
    const m = buildModel([
      fb('1', 'UCgood', ['synthwave', 'mix'], 2, null, 'focus'),
      fb('2', 'UCbad', ['reaction'], -2),
      fb('3', 'UCgood', ['synthwave'], null, 'already-watched'),
      fb('4', 'UCmeh', ['news'], null, 'not-interested'),
      fb('5', 'UCgone', [], null, 'hide-channel'),
    ], NOW);
    expect(m.channels.get('UCgood')).toBeGreaterThan(1.9);
    expect(m.tags.get('synthwave')!).toBeGreaterThan(0);
    expect(m.tags.get('reaction')!).toBeLessThan(0);
    expect(m.hiddenVideos).toEqual(new Set(['2', '3', '4', '5']));
    expect(m.hiddenChannels).toEqual(new Set(['UCgone']));
    expect(m.ratings.get('1')).toBe(2);
    expect(topTags(m.tags).liked[0]?.[0]).toBe('synthwave');
    expect(learnedMoodTags(m, ['focus']).get('synthwave')).toBeGreaterThan(1);
    expect(moodSuggestions(m, ['focus'], ['mix'])).toEqual(['synthwave']);
  });

  test('old feedback fades', () => {
    const fresh = buildModel([fb('1', 'UC', [], 2, null, null, NOW)], NOW).channels.get('UC')!;
    const old = buildModel([fb('1', 'UC', [], 2, null, null, NOW - 365 * DAY)], NOW).channels.get('UC')!;
    expect(old / fresh).toBeCloseTo(0.5);
  });
});

describe('ranking with feedback', () => {
  const pool = (videos: VideoMeta[], extra = {}) => ({
    videos, engagement: [eng('UCa', 10), eng('UCb', 10)], watched: new Set<string>(), searchHits: new Set<string>(), ...extra,
  });
  const fb = (videoId: string, channelId: string, tags: string[], rating: number | null, dismissed: string | null = null) =>
    ({ videoId, channelId, channelTitle: channelId, categoryId: '10', tags, rating, dismissed, moodId: null, at: NOW }) as never;

  test('loved tags and channels rise; dismissed and hidden channels vanish', () => {
    const videos = [vid('plain', 'UCa'), vid('synth', 'UCb', ['synthwave']), vid('gone', 'UCa')];
    const model = buildModel([fb('old', 'UCx', ['synthwave'], 2), fb('gone', 'UCa', [], null, 'not-interested')], NOW);
    const ids = rankFeed(pool(videos), { ...EMPTY_CONTEXT, model }, NOW).map((i) => i.video.id);
    expect(ids).toEqual(['synth', 'plain']);

    const hidden = buildModel([fb('x', 'UCb', [], null, 'hide-channel')], NOW);
    expect(rankFeed(pool(videos), { ...EMPTY_CONTEXT, model: hidden }, NOW).map((i) => i.video.id)).not.toContain('synth');
  });

  test('rated videos count as seen unless kept for this session', () => {
    const model = buildModel([fb('a', 'UCa', [], 1)], NOW);
    const videos = [vid('a', 'UCa')];
    expect(rankFeed(pool(videos), { ...EMPTY_CONTEXT, model }, NOW)).toHaveLength(0);
    expect(rankFeed(pool(videos), { ...EMPTY_CONTEXT, model, keep: new Set(['a']) }, NOW)).toHaveLength(1);
  });

  test('impressions rotate stale videos down, harder in fresh mode', () => {
    const videos = [vid('seen', 'UCa'), vid('new', 'UCb', [], { publishedAt: NOW - 7 * DAY })];
    const impressions = new Map([['seen', 3]]);
    expect(rankFeed(pool(videos), { ...EMPTY_CONTEXT, impressions }, NOW)[0]?.video.id).toBe('seen');
    expect(rankFeed(pool(videos), { ...EMPTY_CONTEXT, impressions, fresh: true }, NOW)[0]?.video.id).toBe('new');
  });

  test('mood hits from unknown channels are included and favoured', () => {
    const videos = [vid('chan', 'UCa'), vid('moodhit', 'UCnew')];
    const ids = rankFeed(pool(videos, { moodHits: new Set(['moodhit']) }), { ...EMPTY_CONTEXT, moodInclude: ['edm'] }, NOW).map((i) => i.video.id);
    expect(ids).toEqual(['moodhit', 'chan']);
  });
});

describe('mood fetching', () => {
  test('query prefers the leaf mood and caps at three terms', () => {
    expect(moodQuery(['synthwave', 'mix', 'edm', 'female vocals'], ['edm', 'female vocals'])).toBe('edm female vocals synthwave');
  });

  test('mood search is cached for 12 hours', async () => {
    const db = await openMeTubeDB('mood-' + Math.random());
    const calls: string[] = [];
    const quota = new QuotaTracker(new MemoryStore(), () => new Date(NOW));
    const client = new YouTubeClient({
      getKey: async () => 'k', quota, now: () => NOW,
      fetch: async (url) => {
        const u = new URL(url);
        calls.push(u.pathname.split('/').pop()!);
        if (u.pathname.endsWith('search')) return { ok: true, status: 200, json: async () => ({ items: [{ id: { kind: 'v', videoId: 'm1' } }] }) };
        return { ok: true, status: 200, json: async () => ({ items: [{ id: 'm1', snippet: { publishedAt: new Date(NOW).toISOString(), channelId: 'UCz', channelTitle: 'Z', title: 'm1', description: '', categoryId: '10', thumbnails: {} }, contentDetails: { duration: 'PT5M' } }] }) };
      },
    });
    const empty = { videos: [], engagement: [], watched: new Set<string>(), searchHits: new Set<string>(), channelsChecked: 0, apiCallsMade: 0, errors: [] };
    const first = await searchIntoPool(db, client, empty, 'edm', { kind: 'mood' }, NOW);
    expect(first.unitsUsed).toBe(101);
    expect(first.pool.moodHits).toEqual(new Set(['m1']));
    const second = await searchIntoPool(db, client, empty, 'edm', { kind: 'mood' }, NOW + 3_600_000);
    expect(second.unitsUsed).toBe(0);
    const forced = await searchIntoPool(db, client, empty, 'edm', { kind: 'mood', force: true }, NOW + 3_600_000);
    expect(forced.unitsUsed).toBe(100);
    expect(calls).toEqual(['search', 'videos', 'search']);
  });
});

import { describe, expect, test } from 'vitest';
import { SEED_MOODS, activateMood, describeWindow, normaliseMood, quickMoods, scheduledMood, windowStart, type Mood } from './moods.ts';
import { buildModel, moodChannels } from './model.ts';
import { EMPTY_CONTEXT, discoveryQuery, knownChannels, rankFeed, unknownChannelVideos } from './feed.ts';
import type { VideoMeta } from './api/types.ts';
import type { ChannelEngagement } from './engagement.ts';

const NOW = new Date(2026, 9, 17, 12, 0).getTime(); // Sat 17 Oct 2026, 12:00 local
const DAY = 86_400_000;
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m); // October 2026, local time
const mood = (id: string, extra: Partial<Mood> = {}): Mood => normaliseMood({ id, name: id, parentId: null, include: [], exclude: [], createdAt: 0, ...extra });

describe('schedules', () => {
  const weekdayMornings = { days: [1, 2, 3, 4, 5], from: '07:00', to: '12:00' };
  const nights = { days: [5, 6], from: '21:00', to: '02:00' }; // Fri, Sat nights

  test('day windows', () => {
    expect(windowStart(weekdayMornings, at(19, 8))).toBe('2026-10-19@07:00'); // Monday
    expect(windowStart(weekdayMornings, at(19, 12))).toBeNull(); // end is exclusive
    expect(windowStart(weekdayMornings, at(18, 8))).toBeNull(); // Sunday
  });

  test('overnight windows belong to the day they started', () => {
    expect(windowStart(nights, at(16, 22))).toBe('2026-10-16@21:00'); // Fri 22:00
    expect(windowStart(nights, at(18, 1, 30))).toBe('2026-10-17@21:00'); // Sun 01:30, Saturday's window
    expect(windowStart(nights, at(19, 1, 30))).toBeNull(); // Mon 01:30: Sunday has no window
  });

  test('scheduled mood picks the deepest match and gives a stable window key', () => {
    const moods = [
      mood('focus', { schedule: [weekdayMornings] }),
      mood('deep', { parentId: 'focus', schedule: [{ days: [1], from: '09:00', to: '10:00' }] }),
    ];
    expect(scheduledMood(moods, at(19, 9, 30))?.mood.id).toBe('deep');
    expect(scheduledMood(moods, at(19, 8))?.windowKey).toBe('focus|2026-10-19@07:00');
    expect(scheduledMood(moods, at(19, 8, 59))?.windowKey).toBe('focus|2026-10-19@07:00');
    expect(scheduledMood(moods, at(19, 13))).toBeNull();
  });

  test('normalise drops broken windows and clamps intensity', () => {
    const m = mood('x', { intensity: 7, schedule: [{ days: [9, 1, 1], from: '07:00', to: '09:00' }, { days: [1], from: '25:00', to: '09:00' }, { days: [], from: '07:00', to: '09:00' }] });
    expect(m.intensity).toBe(1);
    expect(m.schedule).toEqual([{ days: [1], from: '07:00', to: '09:00' }]);
    expect(describeWindow({ days: [1, 2, 3, 4, 5], from: '07:00', to: '12:00' })).toBe('Weekdays 07:00–12:00');
    expect(describeWindow({ days: [5, 6], from: '21:00', to: '02:00' })).toBe('Fri, Sat 21:00–02:00');
  });
});

describe('quick switch', () => {
  test('falls back to top-level moods, then favours frequent recent use', () => {
    let state = { moods: SEED_MOODS.map(normaliseMood), activeId: null as string | null };
    expect(quickMoods(state.moods, null, 3, NOW).map((m) => m.id)).toEqual(['energetic', 'chill', 'focus']);
    state = activateMood(state, 'gaming-music', NOW - 30 * DAY);
    state = activateMood(state, 'gaming-music', NOW - 30 * DAY);
    state = activateMood(state, 'learn', NOW);
    expect(state.activeId).toBe('learn');
    expect(quickMoods(state.moods, 'learn', 2, NOW).map((m) => m.id)).toEqual(['gaming-music', 'energetic']);
    expect(quickMoods(state.moods, null, 1, NOW).map((m) => m.id)).toEqual(['learn']);
  });
});

const vid = (id: string, channelId: string, extra: Partial<VideoMeta> = {}): VideoMeta => ({
  id, channelId, channelTitle: channelId, title: id, description: '', tags: [], categoryId: '10',
  publishedAt: NOW - DAY, durationSec: 600, isLive: false, thumbnail: null, viewCount: null, fetchedAt: NOW, ...extra,
});
const eng = (channelId: string, score: number): ChannelEngagement => ({
  channelId, channelTitle: channelId, watches: 5, uniqueVideos: 5, rewatchedVideos: 0, firstWatched: 0, lastWatched: 0, subscribed: false, score,
});
const fb = (videoId: string, channelId: string, rating: number, moodId: string | null) =>
  ({ videoId, channelId, channelTitle: channelId, categoryId: '10', tags: [], rating, dismissed: null, moodId, at: NOW }) as never;

describe('mood channels', () => {
  test('channels rated well in a mood are learned, ancestors count half', () => {
    const model = buildModel([fb('1', 'UCa', 2, 'focus'), fb('2', 'UCb', 2, 'gaming'), fb('3', 'UCc', 1, 'chill')], NOW);
    expect([...moodChannels(model, ['gaming']).keys()]).toEqual(['UCb']);
    expect([...moodChannels(model, ['focus', 'gaming']).keys()]).toEqual(['UCb', 'UCa']); // UCa: 2 × 0.5
    expect(model.channelTitles.get('UCa')).toBe('UCa');
  });

  test('a mood channel brings its videos in even if you never watched it', () => {
    const pool = { videos: [vid('known', 'UCknown'), vid('mc', 'UCmood')], engagement: [eng('UCknown', 10)], watched: new Set<string>(), searchHits: new Set<string>() };
    const ids = rankFeed(pool, { ...EMPTY_CONTEXT, moodChannels: new Map([['UCmood', 2]]) }, NOW).map((i) => i.video.id);
    expect(ids).toEqual(['mc', 'known']);
  });
});

describe('intensity', () => {
  const pool = { videos: [vid('match', 'UCa', { tags: ['edm'], publishedAt: NOW - 7 * DAY }), vid('other', 'UCb', { publishedAt: NOW })], engagement: [eng('UCa', 10), eng('UCb', 10)], watched: new Set<string>(), searchHits: new Set<string>() };
  const ids = (intensity: number) => rankFeed(pool, { ...EMPTY_CONTEXT, moodInclude: ['edm'], moodIntensity: intensity }, NOW).map((i) => i.video.id);
  test('gentle keeps everything and barely reorders; full shows only matches', () => {
    expect(ids(0)).toEqual(['other', 'match']);
    expect(ids(0.5)).toEqual(['match', 'other']);
    expect(ids(1)).toEqual(['match']);
  });
});

describe('channel scope', () => {
  const pool = {
    videos: [vid('k', 'UCknown'), vid('rated', 'UCrated'), vid('n', 'UCnew')],
    engagement: [eng('UCknown', 10)],
    watched: new Set<string>(),
    searchHits: new Set<string>(),
    discoverHits: new Set(['rated', 'n']),
  };
  const model = buildModel([fb('x', 'UCrated', 1, null)], NOW);

  test('known includes rated channels; new excludes them', () => {
    expect(knownChannels(pool.engagement, model)).toEqual(new Set(['UCknown', 'UCrated']));
    const scope = (s: 'all' | 'known' | 'new') => rankFeed(pool, { ...EMPTY_CONTEXT, model, channelScope: s }, NOW).map((i) => i.video.id).sort();
    expect(scope('all')).toEqual(['k', 'n', 'rated']);
    expect(scope('known')).toEqual(['k', 'rated']);
    expect(scope('new')).toEqual(['n']);
    expect(unknownChannelVideos(pool, model)).toBe(1);
  });

  test('discovery cycles one interest a day and steps with fresh feeds', () => {
    const list = ['Synthwave', 'synthwave', 'f1', 'sumo'];
    const day0 = Math.floor(NOW / DAY);
    const q0 = discoveryQuery(list, 0, NOW);
    expect(['synthwave', 'f1', 'sumo']).toContain(q0);
    expect(discoveryQuery(list, 1, NOW)).not.toBe(q0);
    expect(discoveryQuery(list, 0, (day0 + 3) * DAY + 1)).toBe(q0);
    expect(discoveryQuery([], 0, NOW)).toBe('');
  });
});

describe('starter moods', () => {
  test('every branch has an existing parent and ids are unique', async () => {
    const { SEED_MOODS } = await import('./moods.ts');
    const ids = new Set(SEED_MOODS.map((m) => m.id));
    expect(ids.size).toBe(SEED_MOODS.length);
    for (const m of SEED_MOODS) if (m.parentId) expect(ids.has(m.parentId)).toBe(true);
    for (const m of SEED_MOODS) for (const t of [...m.include, ...m.exclude]) expect(t).toBe(t.toLowerCase());
    expect(SEED_MOODS.filter((m) => !m.parentId).length).toBeGreaterThanOrEqual(8);
  });

  test('upgrade adds only new seeds, keeps edits and deletions, skips orphans, is idempotent', async () => {
    const { upgradeSeeds, SEED_VERSION, SEED_MOODS, normaliseMood: norm } = await import('./moods.ts');
    // A version-1 user who renamed Focus, deleted Chill, and made their own mood.
    const v1 = SEED_MOODS.filter((m) => ['energetic', 'focus', 'gaming-music', 'learn'].includes(m.id)).map(norm);
    v1[1] = { ...v1[1]!, name: 'Deep focus' };
    const mine = mood('mine');
    const before = { moods: [...v1, mine], activeId: 'mine' };

    const after = upgradeSeeds(before);
    expect(after.seedVersion).toBe(SEED_VERSION);
    expect(after.activeId).toBe('mine');
    expect(after.moods.find((m) => m.id === 'focus')?.name).toBe('Deep focus');
    expect(after.moods.some((m) => m.id === 'mine')).toBe(true);
    expect(after.moods.some((m) => m.id === 'gaming')).toBe(true); // new root
    expect(after.moods.some((m) => m.id === 'focus-coding')).toBe(true); // new branch, parent kept
    expect(after.moods.some((m) => m.id === 'chill')).toBe(false); // deleted v1 seed stays deleted
    expect(after.moods.some((m) => m.id === 'chill-lofi')).toBe(false); // orphan skipped

    expect(upgradeSeeds(after)).toBe(after);
    const deletedNew = { ...after, moods: after.moods.filter((m) => m.id !== 'gaming' && m.parentId !== 'gaming') };
    expect(upgradeSeeds(deletedNew).moods.some((m) => m.id === 'gaming')).toBe(false);
  });

  test('starter tags follow the UI language until the user edits that list', async () => {
    const { SEED_MOODS, SEED_TAGS, localiseMoods, seedTags, updateMood } = await import('./moods.ts');
    const { LOCALISED_SEED_TAGS } = await import('./i18n/seedTags.ts');
    const cooking = SEED_MOODS.find((m) => m.id === 'make-cooking')!;
    expect(seedTags(cooking, 'fr').include).toEqual(LOCALISED_SEED_TAGS.fr!['make-cooking']!.include);
    expect(seedTags(cooking, 'en-GB')).toEqual({ include: cooking.include, exclude: cooking.exclude });

    // Include and exclude are checked separately; an edited list is the user's.
    const energetic = SEED_MOODS.find((m) => m.id === 'energetic')!;
    const edited = updateMood({ moods: [energetic], activeId: null }, 'energetic', { include: ['f1'] }).moods[0]!;
    expect(seedTags(edited, 'de')).toEqual({ include: ['f1'], exclude: LOCALISED_SEED_TAGS.de!.energetic!.exclude });
    expect(seedTags(mood('mine', { include: SEED_TAGS.energetic!.include }), 'es').include).toEqual(SEED_TAGS.energetic!.include);

    const mine = mood('mine', { include: ['jazz'] });
    const [a, b] = localiseMoods([mine, energetic], 'es');
    expect(a).toBe(mine);
    expect(b!.include).toEqual(LOCALISED_SEED_TAGS.es!.energetic!.include);
  });

  test('every language has normalised tags for every starter mood, with a Never show list where English has one', async () => {
    const { SEED_TAGS } = await import('./moods.ts');
    const { normaliseTag } = await import('./tags.ts');
    const { LOCALISED_SEED_TAGS } = await import('./i18n/seedTags.ts');
    for (const [locale, lists] of Object.entries(LOCALISED_SEED_TAGS)) {
      expect(Object.keys(lists!).sort(), locale).toEqual(Object.keys(SEED_TAGS).sort());
      for (const [id, seed] of Object.entries(SEED_TAGS)) {
        const local = lists![id]!;
        expect(local.include.length, `${locale} ${id}`).toBeGreaterThan(0);
        expect((local.exclude ?? []).length > 0, `${locale} ${id} exclude`).toBe(seed.exclude.length > 0);
        for (const tag of [...local.include, ...(local.exclude ?? [])]) expect(normaliseTag(tag), `${locale} ${id}`).toBe(tag);
        expect(new Set(local.include).size, `${locale} ${id} duplicates`).toBe(local.include.length);
      }
    }
  });

  test('helpers keep the seed version so deletions survive reloads', async () => {
    const { activateMood: act, createMood, deleteMood, SEED_VERSION } = await import('./moods.ts');
    const state = { moods: [mood('a')], activeId: null, seedVersion: SEED_VERSION };
    expect(act(state, 'a').seedVersion).toBe(SEED_VERSION);
    expect(createMood(state, 'b', null).state.seedVersion).toBe(SEED_VERSION);
    expect(deleteMood(state, 'a').seedVersion).toBe(SEED_VERSION);
  });
});

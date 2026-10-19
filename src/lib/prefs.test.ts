import { describe, expect, test } from 'vitest';
import { MemoryStore } from './quota.ts';
import { DEFAULT_PREFS, loadPrefs, normalisePrefs, savePrefs } from './prefs.ts';
import { loadTags, matchesTag, normaliseTag, saveTags, setTagState, topVideoTags, videoText } from './tags.ts';
import { SEED_MOODS, createMood, deleteMood, effectiveMood, loadMoods, moodLabel, normaliseMood, saveMoods, searchMoods, updateMood, SEED_VERSION } from './moods.ts';
import type { VideoMeta } from './api/types.ts';

describe('prefs', () => {
  test('defaults and validation', async () => {
    const store = new MemoryStore();
    expect(await loadPrefs(store)).toEqual(DEFAULT_PREFS);
    expect(normalisePrefs({ theme: 'neon', pageSize: 9999, hideShorts: 'yes' })).toMatchObject({ theme: 'system', pageSize: 200, hideShorts: true });
    const saved = await savePrefs(store, { pageSize: 48, theme: 'dark' });
    expect(saved).toMatchObject({ pageSize: 48, theme: 'dark', poolChannels: 30 });
    expect(await loadPrefs(store)).toEqual(saved);
  });
});

const video = (title: string, tags: string[] = []) => videoText({ title, tags } as Pick<VideoMeta, 'title' | 'tags'>);

describe('tags', () => {
  test('normalise and persist without overlap', async () => {
    expect(normaliseTag('  #Deep   House ')).toBe('deep house');
    const store = new MemoryStore();
    const saved = await saveTags(store, { liked: ['EDM', 'edm', 'News'], blocked: ['news'] });
    expect(saved).toEqual({ liked: ['edm'], blocked: ['news'] });
    expect(await loadTags(store)).toEqual(saved);
  });

  test('setTagState moves a tag between lists', () => {
    let t = { liked: ['a'], blocked: [] as string[] };
    t = setTagState(t, 'a', 'blocked');
    expect(t).toEqual({ liked: [], blocked: ['a'] });
    expect(setTagState(t, 'a', 'none')).toEqual({ liked: [], blocked: [] });
  });

  test('matching uses tags and whole words in titles', () => {
    const v = video('Gaming Mix: EDM with Female Vocals', ['Electronic']);
    expect(matchesTag(v, 'female vocals')).toBe(true);
    expect(matchesTag(v, 'electronic')).toBe(true);
    expect(matchesTag(v, 'edm')).toBe(true);
    expect(matchesTag(v, 'male vocals')).toBe(false);
    expect(matchesTag(v, 'mi')).toBe(false);
    expect(matchesTag(video('Tour de France — Stage 5'), 'tour de france')).toBe(true);
  });

  test('spacing, hyphens and common aliases don’t matter', () => {
    for (const title of ['Best Sci-Fi of 2026', 'best sci fi films', 'SCIFI short', 'A science fiction classic']) {
      expect(matchesTag(video(title), 'scifi')).toBe(true);
      expect(matchesTag(video(title), 'sci-fi')).toBe(true);
    }
    expect(matchesTag(video('Untitled', ['Sci Fi']), 'scifi')).toBe(true);
    expect(matchesTag(video('Formula 1 highlights'), 'f1')).toBe(true);
    expect(matchesTag(video('Transcifixion'), 'scifi')).toBe(false);
    expect(matchesTag(video('Science of fiction writing'), 'scifi')).toBe(false);
  });

  test('top video tags ignore singletons', () => {
    const vids = [{ tags: ['F1', 'race'] }, { tags: ['f1'] }, { tags: ['solo'] }] as VideoMeta[];
    expect(topVideoTags(vids)).toEqual([{ tag: 'f1', count: 2 }]);
  });
});

describe('moods', () => {
  test('seeds load when nothing is saved', async () => {
    expect((await loadMoods(new MemoryStore())).moods).toEqual(SEED_MOODS.map(normaliseMood));
  });

  test('branches inherit tags and labels show the path', () => {
    expect(moodLabel(SEED_MOODS, 'gaming-music')).toBe('Focus › Gaming music');
    const eff = effectiveMood(SEED_MOODS, 'gaming-music');
    expect(eff.include).toEqual(expect.arrayContaining(['synthwave', 'edm', 'female vocals']));
    expect(eff.exclude).toContain('reaction');
  });

  test('create, update, search, delete branch, persist', async () => {
    let state = { moods: SEED_MOODS, activeId: null as string | null };
    const created = createMood(state, ' Racing ', 'energetic', 1000);
    state = created.state;
    expect(state.activeId).toBe(created.mood.id);
    state = updateMood(state, created.mood.id, { include: ['F1', 'motogp', 'f1'] });
    expect(state.moods.find((m) => m.id === created.mood.id)?.include).toEqual(['f1', 'motogp']);
    expect(searchMoods(state.moods, 'energetic').map((m) => m.name)).toEqual(['Energetic', 'Hype music', 'Motorsport', 'Racing', 'Workout']);

    const store = new MemoryStore();
    await saveMoods(store, state);
    expect(await loadMoods(store)).toEqual({ ...state, moods: state.moods.map(normaliseMood), seedVersion: SEED_VERSION });

    state = deleteMood(state, 'energetic');
    expect(state.moods.some((m) => m.name === 'Racing')).toBe(false);
    expect(state.activeId).toBeNull();
  });

  test('cycles in saved data do not hang', () => {
    const looped = [
      { ...SEED_MOODS[0]!, id: 'a', parentId: 'b' },
      { ...SEED_MOODS[0]!, id: 'b', parentId: 'a' },
    ];
    expect(effectiveMood(looped, 'a').include.length).toBeGreaterThan(0);
  });
});

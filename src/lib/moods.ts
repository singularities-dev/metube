/**
 * Moods: named, branching sets of tag preferences.
 *
 * A mood can have a parent ("Energetic › Gaming › EDM female vocals"). A branch
 * inherits its ancestors' tags and adds its own, so a narrow mood refines a
 * broad one. Moods are user data, saved locally.
 */
import type { KeyValueStore } from './quota.ts';
import { normaliseTag } from './tags.ts';
import type { Locale } from './i18n/index.ts';
import { LOCALISED_SEED_TAGS } from './i18n/seedTags.ts';

export interface Mood {
  id: string;
  name: string;
  parentId: string | null;
  /** Soft boosts: videos matching these rank higher. */
  include: string[];
  /** Hard filter: videos matching these are hidden while the mood is on. */
  exclude: string[];
  createdAt: number;
  /**
   * How strongly the mood steers the feed: 0 is a gentle nudge, 1 shows only
   * videos that fit the mood. Default 0.5.
   */
  intensity?: number;
  /** Times of day this mood switches on by itself. */
  schedule?: MoodWindow[];
  /** Usage, for the quick-switch chips. */
  uses?: number;
  lastUsedAt?: number;
}

/** A weekly time window, e.g. weekdays 07:00–12:00. "to" before "from" runs past midnight. */
export interface MoodWindow {
  /** 0 = Sunday … 6 = Saturday. */
  days: number[];
  from: string; // HH:MM
  to: string; // HH:MM
}

export const DEFAULT_INTENSITY = 0.5;

export interface MoodState {
  moods: Mood[];
  activeId: string | null;
  /** Which set of starter moods this user has received (see SEED_MOODS). */
  seedVersion?: number;
}

const KEY = 'moods';

type Seed = Omit<Mood, 'createdAt'> & { since: number };
const seed = (since: number, id: string, name: string, parentId: string | null, include: string[], exclude: string[] = []): Seed =>
  ({ since, id, name, parentId, include, exclude });

/**
 * Starter moods, grouped into branches so a broad mood can be narrowed down.
 * Users edit or delete them freely. `since` is the seed version that added
 * each one: existing users receive only seeds newer than they've had, so a
 * default they deleted never comes back.
 */
const SEEDS: Seed[] = [
  // Version 1: the original five.
  seed(1, 'energetic', 'Energetic', null, ['highlights', 'race', 'hype', 'action'], ['asmr', 'sleep']),
  seed(1, 'chill', 'Chill', null, ['chill', 'lofi', 'ambient', 'relaxing'], ['breaking news', 'rage']),
  seed(1, 'focus', 'Focus', null, ['deep house', 'synthwave', 'instrumental', 'mix'], ['reaction']),
  seed(1, 'gaming-music', 'Gaming music', 'focus', ['edm', 'female vocals']),
  seed(1, 'learn', 'Learn something', null, ['explained', 'documentary', 'tutorial', 'lore'], ['shorts']),

  // Version 2: more roots, and branches under each.
  seed(2, 'energetic-workout', 'Workout', 'energetic', ['workout', 'gym', 'training', 'motivation']),
  seed(2, 'energetic-motorsport', 'Motorsport', 'energetic', ['f1', 'motogp', 'onboard', 'qualifying']),
  seed(2, 'energetic-hype-music', 'Hype music', 'energetic', ['drum and bass', 'phonk', 'hardstyle', 'edm']),

  seed(2, 'chill-lofi', 'Lofi & ambient', 'chill', ['lofi', 'chillhop', 'ambient']),
  seed(2, 'chill-cozy-games', 'Cozy games', 'chill', ['cozy', 'relaxing gameplay', 'farming', 'stardew']),
  seed(2, 'chill-nature', 'Nature & travel', 'chill', ['nature', 'scenic', 'walk', 'travel'], ['vlog drama']),

  seed(2, 'focus-deep-work', 'Deep work', 'focus', ['study music', 'concentration', 'piano', 'no vocals'], ['vocals']),
  seed(2, 'focus-coding', 'Coding', 'focus', ['programming', 'live coding', 'coding music']),

  seed(2, 'learn-science', 'Science & space', 'learn', ['science', 'space', 'physics', 'astronomy']),
  seed(2, 'learn-tech', 'Tech & software', 'learn', ['programming', 'software', 'linux', 'javascript']),
  seed(2, 'learn-history', 'History & lore', 'learn', ['history', 'lore', 'ancient', 'war documentary']),
  seed(2, 'learn-how-it-works', 'How things work', 'learn', ['how it works', 'engineering', 'teardown', 'explained']),

  seed(2, 'gaming', 'Gaming', null, ['gameplay', 'game review', "let's play", 'gaming'], ['shorts']),
  seed(2, 'gaming-lore', 'Lore & story', 'gaming', ['lore', 'story explained', 'analysis']),
  seed(2, 'gaming-strategy', 'Strategy', 'gaming', ['strategy', 'rts', '4x', 'grand strategy']),
  seed(2, 'gaming-speedruns', 'Speedruns & esports', 'gaming', ['speedrun', 'esports', 'tournament', 'world record']),
  seed(2, 'gaming-indie', 'Indie & gamedev', 'gaming', ['indie game', 'devlog', 'gamedev', 'godot']),

  seed(2, 'laugh', 'Make me laugh', null, ['comedy', 'funny', 'sketch', 'stand-up'], ['prank', 'cringe']),
  seed(2, 'laugh-standup', 'Stand-up', 'laugh', ['stand-up', 'comedian', 'comedy special']),
  seed(2, 'laugh-late-night', 'Late-night shows', 'laugh', ['late show', 'monologue', 'talk show']),
  seed(2, 'laugh-animals', 'Animals', 'laugh', ['animals', 'cute', 'dogs', 'cats']),

  seed(2, 'news', 'News & world', null, ['news', 'analysis', 'explained'], ['rage', 'drama', 'reaction']),
  seed(2, 'news-deep-dives', 'Deep dives', 'news', ['analysis', 'documentary', 'investigation']),
  seed(2, 'news-catch-up', 'Quick catch-up', 'news', ['week in review', 'briefing', 'summary', 'headlines']),
  seed(2, 'news-business', 'Business & money', 'news', ['economy', 'markets', 'business']),

  seed(2, 'wind-down', 'Wind down', null, ['calm', 'sleep', 'meditation', 'relaxing'], ['breaking news', 'hype', 'horror', 'rage']),
  seed(2, 'wind-down-sleep-sounds', 'Sleep sounds', 'wind-down', ['rain sounds', 'white noise', 'sleep music']),
  seed(2, 'wind-down-stories', 'Calm stories', 'wind-down', ['bedtime story', 'sleep story', 'audiobook']),
  seed(2, 'wind-down-asmr', 'ASMR', 'wind-down', ['asmr', 'tingles']),

  seed(2, 'make', 'Make & fix', null, ['diy', 'build', 'how to', 'restoration']),
  seed(2, 'make-workshop', 'Workshop & repair', 'make', ['repair', 'restoration', 'engine', 'motorcycle', 'tools']),
  seed(2, 'make-cooking', 'Cooking', 'make', ['recipe', 'cooking', 'baking']),
  seed(2, 'make-home', 'Home & garden', 'make', ['home improvement', 'woodworking', 'garden']),
];

export const SEED_VERSION = Math.max(...SEEDS.map((s) => s.since));

const toMood = ({ since: _since, ...m }: Seed): Mood => ({ ...m, createdAt: 0 });

/** Starter mood names by ID, so the UI can translate them while they're unchanged. */
export const SEED_NAMES: Record<string, string> = Object.fromEntries(SEEDS.map((s) => [s.id, s.name]));

/** Starter mood tags by ID, as shipped (English), so the UI language's own can replace them while they're unchanged. */
export const SEED_TAGS: Record<string, { include: string[]; exclude: string[] }> = Object.fromEntries(
  SEEDS.map((s) => [s.id, { include: s.include, exclude: s.exclude }]),
);

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * A mood's tags in the UI language. A starter mood's tags are MeTube's own
 * words, so a list still exactly as shipped is replaced by the language's own
 * (i18n/seedTags.ts); include and exclude are checked separately. A list the
 * user has edited is theirs and stays as it is, like a renamed starter mood.
 * Display, matching, ranking reasons and the mood's YouTube search all use
 * this, so they agree and follow the UI language. Nothing is stored.
 */
export function seedTags(m: Pick<Mood, 'id' | 'include' | 'exclude'>, locale: Locale): { include: string[]; exclude: string[] } {
  const seed = SEED_TAGS[m.id];
  const local = LOCALISED_SEED_TAGS[locale]?.[m.id];
  if (!seed || !local) return { include: m.include, exclude: m.exclude };
  return {
    include: sameList(m.include, seed.include) ? local.include : m.include,
    exclude: sameList(m.exclude, seed.exclude) ? local.exclude ?? m.exclude : m.exclude,
  };
}

/** Every mood with its tags in the UI language (see seedTags). Moods that don't change are the same objects. */
export function localiseMoods(moods: Mood[], locale: Locale): Mood[] {
  return moods.map((m) => {
    const tags = seedTags(m, locale);
    return tags.include === m.include && tags.exclude === m.exclude ? m : { ...m, ...tags };
  });
}

/** All starter moods (for a brand-new user). */
export const SEED_MOODS: Mood[] = SEEDS.map(toMood);

/**
 * Adds starter moods newer than the user's seed version. Never re-adds a seed
 * from a version they already had (so deletions stick), never duplicates an
 * id, and skips a branch whose parent no longer exists.
 */
export function upgradeSeeds(state: MoodState): MoodState {
  const have = state.seedVersion ?? 1;
  if (have >= SEED_VERSION) return state;
  const moods = [...state.moods];
  const ids = new Set(moods.map((m) => m.id));
  for (const s of SEEDS) {
    if (s.since <= have || ids.has(s.id)) continue;
    if (s.parentId && !ids.has(s.parentId)) continue;
    moods.push(normaliseMood(toMood(s)));
    ids.add(s.id);
  }
  return { ...state, moods, seedVersion: SEED_VERSION };
}

export async function loadMoods(store: KeyValueStore): Promise<MoodState> {
  const raw = await store.get<Partial<MoodState>>(KEY);
  if (!raw?.moods) return { moods: SEED_MOODS.map(normaliseMood), activeId: null, seedVersion: SEED_VERSION };
  const moods = raw.moods.filter((m) => m && typeof m.id === 'string' && typeof m.name === 'string').map(normaliseMood);
  const activeId = moods.some((m) => m.id === raw.activeId) ? raw.activeId ?? null : null;
  const state: MoodState = { moods, activeId, seedVersion: raw.seedVersion ?? 1 };
  const upgraded = upgradeSeeds(state);
  if (upgraded !== state) await store.set(KEY, upgraded);
  return upgraded;
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Fills defaults and drops malformed schedule entries, so old or hand-edited data can't break anything. */
export function normaliseMood(m: Mood): Mood {
  const intensity = typeof m.intensity === 'number' && Number.isFinite(m.intensity) ? Math.min(1, Math.max(0, m.intensity)) : DEFAULT_INTENSITY;
  const schedule = (Array.isArray(m.schedule) ? m.schedule : [])
    .filter((w) => w && TIME.test(w.from) && TIME.test(w.to) && Array.isArray(w.days))
    .map((w) => ({ ...w, days: [...new Set(w.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort() }))
    .filter((w) => w.days.length && w.from !== w.to);
  return {
    ...m,
    include: Array.isArray(m.include) ? m.include : [],
    exclude: Array.isArray(m.exclude) ? m.exclude : [],
    intensity,
    schedule,
    uses: typeof m.uses === 'number' ? m.uses : 0,
    lastUsedAt: typeof m.lastUsedAt === 'number' ? m.lastUsedAt : 0,
  };
}

export async function saveMoods(store: KeyValueStore, state: MoodState): Promise<void> {
  await store.set(KEY, state);
}

/** Root-to-mood chain, guarding against cycles from hand-edited data. */
export function moodPath(moods: Mood[], id: string | null): Mood[] {
  const byId = new Map(moods.map((m) => [m.id, m]));
  const path: Mood[] = [];
  const seen = new Set<string>();
  let cur = id ? byId.get(id) : undefined;
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    path.unshift(cur);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return path;
}

export function moodLabel(moods: Mood[], id: string): string {
  return moodPath(moods, id).map((m) => m.name).join(' › ');
}

/** Tags in effect for a mood: its own plus every ancestor's. */
export function effectiveMood(moods: Mood[], id: string | null): { include: string[]; exclude: string[] } {
  const include = new Set<string>();
  const exclude = new Set<string>();
  for (const m of moodPath(moods, id)) {
    m.include.forEach((t) => include.add(normaliseTag(t)));
    m.exclude.forEach((t) => exclude.add(normaliseTag(t)));
  }
  for (const t of exclude) include.delete(t);
  return { include: [...include], exclude: [...exclude] };
}

export function createMood(state: MoodState, name: string, parentId: string | null, now = Date.now()): { state: MoodState; mood: Mood } {
  const mood: Mood = {
    id: `m${now.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    parentId,
    include: [],
    exclude: [],
    createdAt: now,
  };
  return { state: { ...state, moods: [...state.moods, mood], activeId: mood.id }, mood };
}

export function updateMood(state: MoodState, id: string, patch: Partial<Pick<Mood, 'name' | 'include' | 'exclude' | 'intensity' | 'schedule'>>): MoodState {
  return {
    ...state,
    moods: state.moods.map((m) =>
      m.id === id
        ? {
            ...m,
            ...patch,
            include: patch.include ? [...new Set(patch.include.map(normaliseTag).filter(Boolean))] : m.include,
            exclude: patch.exclude ? [...new Set(patch.exclude.map(normaliseTag).filter(Boolean))] : m.exclude,
          }
        : m,
    ),
  };
}

/** Deletes a mood and its whole branch. */
export function deleteMood(state: MoodState, id: string): MoodState {
  const doomed = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const m of state.moods) if (m.parentId && doomed.has(m.parentId) && !doomed.has(m.id)) { doomed.add(m.id); grew = true; }
  }
  return {
    ...state,
    moods: state.moods.filter((m) => !doomed.has(m.id)),
    activeId: state.activeId && doomed.has(state.activeId) ? null : state.activeId,
  };
}

/** Case-insensitive search over full paths, for the mood picker. */
export function searchMoods(moods: Mood[], query: string): Mood[] {
  const q = query.toLowerCase().trim();
  const withLabel = moods.map((m) => ({ m, label: moodLabel(moods, m.id).toLowerCase() }));
  return withLabel
    .filter(({ label }) => !q || label.includes(q))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(({ m }) => m);
}

/** Turns a mood on (or off with null), counting the use for quick-switch. */
export function activateMood(state: MoodState, id: string | null, now = Date.now()): MoodState {
  if (id === null) return { ...state, activeId: null };
  return {
    ...state,
    activeId: id,
    moods: state.moods.map((m) => (m.id === id ? { ...m, uses: (m.uses ?? 0) + 1, lastUsedAt: now } : m)),
  };
}

const DAY = 86_400_000;

/**
 * Moods for the quick-switch chips: most used, weighted toward recent use
 * (two-week half-life). Before anything is used, the top-level moods.
 */
export function quickMoods(moods: Mood[], activeId: string | null, n = 4, now = Date.now()): Mood[] {
  const others = moods.filter((m) => m.id !== activeId);
  const used = others
    .filter((m) => (m.uses ?? 0) > 0)
    .map((m) => ({ m, score: (m.uses ?? 0) * Math.pow(0.5, Math.max(0, now - (m.lastUsedAt ?? 0)) / (14 * DAY)) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.m);
  if (used.length >= n) return used.slice(0, n);
  const fill = others.filter((m) => !m.parentId && !used.includes(m));
  return [...used, ...fill].slice(0, n);
}

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/**
 * If the window covers this moment, returns when that window started (as a
 * local date key plus start time), otherwise null. Overnight windows such as
 * 21:00–02:00 belong to the day they started.
 */
export function windowStart(w: MoodWindow, at: Date): string | null {
  const t = at.getHours() * 60 + at.getMinutes();
  const from = minutes(w.from);
  const to = minutes(w.to);
  const day = at.getDay();
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}@${w.from}`;
  if (from < to) return w.days.includes(day) && t >= from && t < to ? key(at) : null;
  // Overnight: the evening part today, or the after-midnight tail of yesterday's window.
  if (w.days.includes(day) && t >= from) return key(at);
  const yesterday = new Date(at.getFullYear(), at.getMonth(), at.getDate() - 1);
  if (w.days.includes(yesterday.getDay()) && t < to) return key(yesterday);
  return null;
}

/**
 * The mood scheduled for this moment, if any. When windows overlap, the most
 * specific (deepest branch) wins, then the most recently created.
 * windowKey identifies this occurrence so the switch happens once per window.
 */
export function scheduledMood(moods: Mood[], at: Date): { mood: Mood; windowKey: string } | null {
  let best: { mood: Mood; windowKey: string; depth: number } | null = null;
  for (const m of moods) {
    for (const w of m.schedule ?? []) {
      const start = windowStart(w, at);
      if (!start) continue;
      const depth = moodPath(moods, m.id).length;
      if (!best || depth > best.depth || (depth === best.depth && m.createdAt > best.mood.createdAt)) {
        best = { mood: m, windowKey: `${m.id}|${start}`, depth };
      }
    }
  }
  return best ? { mood: best.mood, windowKey: best.windowKey } : null;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "Weekdays 07:00–12:00", "Every day 21:00–02:00", "Sat, Sun 10:00–14:00". */
export function describeWindow(w: MoodWindow): string {
  const d = [...w.days].sort().join(',');
  const days = d === '0,1,2,3,4,5,6' ? 'Every day' : d === '1,2,3,4,5' ? 'Weekdays' : d === '0,6' ? 'Weekends' : w.days.map((x) => DAY_NAMES[x]).join(', ');
  return `${days} ${w.from}–${w.to}`;
}

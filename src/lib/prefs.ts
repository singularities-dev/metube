/** User settings with defaults. Missing or unknown values fall back safely. */
import type { KeyValueStore } from './quota.ts';
import { isLocale, type Locale } from './i18n/index.ts';

export type Theme = 'system' | 'light' | 'dark';

export interface Prefs {
  theme: Theme;
  /** Videos shown per page in Explore ("list length"). */
  pageSize: number;
  /** How many top-engagement channels feed the candidate pool. */
  poolChannels: number;
  uploadsPerChannel: number;
  hideShorts: boolean;
  hideWatched: boolean;
  /** Max videos per channel at the top of the feed (0 = no cap). */
  perChannelCap: number;
  navCollapsed: boolean;
  /** Search for new videos when the mood changes (101 units, cached 12h per mood). */
  moodFetch: boolean;
  /** Explore: everything, channels you know, channels new to you, or Uncharted. */
  channelScope: 'all' | 'known' | 'new' | 'uncharted';
  /** Let scheduled moods switch on by themselves. */
  autoMoods: boolean;
  /** Most ratings sent to YouTube per sync (50 units each). */
  syncCap: number;
  /** Clicking a video plays it in MeTube's player instead of a new YouTube tab. */
  playInline: boolean;
  /** UI language; 'auto' follows the browser until one is picked. */
  language: 'auto' | Locale;
}

export const DEFAULT_PREFS: Prefs = {
  theme: 'system',
  pageSize: 24,
  poolChannels: 30,
  uploadsPerChannel: 8,
  hideShorts: true,
  hideWatched: true,
  perChannelCap: 3,
  navCollapsed: false,
  moodFetch: true,
  channelScope: 'all',
  autoMoods: true,
  syncCap: 40,
  playInline: true,
  language: 'auto',
};

export const PAGE_SIZES = [12, 24, 48, 96] as const;

const KEY = 'prefs';

const clampInt = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;

/** Validates whatever is in storage, so a bad or old value can never break the app. */
export function normalisePrefs(raw: unknown): Prefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Prefs, unknown>>;
  const d = DEFAULT_PREFS;
  return {
    theme: r.theme === 'light' || r.theme === 'dark' || r.theme === 'system' ? r.theme : d.theme,
    pageSize: clampInt(r.pageSize, 6, 200, d.pageSize),
    poolChannels: clampInt(r.poolChannels, 5, 100, d.poolChannels),
    uploadsPerChannel: clampInt(r.uploadsPerChannel, 1, 50, d.uploadsPerChannel),
    hideShorts: typeof r.hideShorts === 'boolean' ? r.hideShorts : d.hideShorts,
    hideWatched: typeof r.hideWatched === 'boolean' ? r.hideWatched : d.hideWatched,
    perChannelCap: clampInt(r.perChannelCap, 0, 20, d.perChannelCap),
    navCollapsed: typeof r.navCollapsed === 'boolean' ? r.navCollapsed : d.navCollapsed,
    moodFetch: typeof r.moodFetch === 'boolean' ? r.moodFetch : d.moodFetch,
    channelScope: r.channelScope === 'known' || r.channelScope === 'new' || r.channelScope === 'uncharted' || r.channelScope === 'all' ? r.channelScope : d.channelScope,
    autoMoods: typeof r.autoMoods === 'boolean' ? r.autoMoods : d.autoMoods,
    syncCap: clampInt(r.syncCap, 5, 150, d.syncCap),
    playInline: typeof r.playInline === 'boolean' ? r.playInline : d.playInline,
    language: r.language === 'auto' || isLocale(r.language) ? r.language : d.language,
  };
}

export async function loadPrefs(store: KeyValueStore): Promise<Prefs> {
  return normalisePrefs(await store.get(KEY));
}

export async function savePrefs(store: KeyValueStore, patch: Partial<Prefs>): Promise<Prefs> {
  const next = normalisePrefs({ ...(await loadPrefs(store)), ...patch });
  await store.set(KEY, next);
  return next;
}

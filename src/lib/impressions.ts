/**
 * Which videos the feed has shown, and which the user opened.
 *
 * Shown-but-never-opened videos step aside over time (rotation), so the feed
 * doesn't keep leading with the same tiles. Opened videos count as watched.
 */
import type { KeyValueStore } from './quota.ts';

export interface Impressions {
  /** videoId → times shown on the first page without being opened. */
  shown: Record<string, number>;
  /** videoId → when the user opened it from MeTube. */
  opened: Record<string, number>;
}

const KEY = 'impressions';
const MAX_ENTRIES = 3000;

export async function loadImpressions(store: KeyValueStore): Promise<Impressions> {
  const raw = await store.get<Partial<Impressions>>(KEY);
  return { shown: raw?.shown ?? {}, opened: raw?.opened ?? {} };
}

/** Keeps the newest entries so storage stays small. */
function trim<T>(rec: Record<string, T>): Record<string, T> {
  const keys = Object.keys(rec);
  if (keys.length <= MAX_ENTRIES) return rec;
  return Object.fromEntries(keys.slice(keys.length - MAX_ENTRIES).map((k) => [k, rec[k] as T]));
}

export async function recordShown(store: KeyValueStore, ids: string[]): Promise<void> {
  const cur = await loadImpressions(store);
  for (const id of ids) {
    if (cur.opened[id]) continue;
    // Re-insert so the newest stays at the end (insertion order drives trimming).
    const n = (cur.shown[id] ?? 0) + 1;
    delete cur.shown[id];
    cur.shown[id] = n;
  }
  await store.set(KEY, { shown: trim(cur.shown), opened: cur.opened });
}

export async function recordOpened(store: KeyValueStore, id: string, now = Date.now()): Promise<void> {
  const cur = await loadImpressions(store);
  delete cur.shown[id];
  cur.opened[id] = now;
  await store.set(KEY, { shown: cur.shown, opened: trim(cur.opened) });
}

export async function clearImpressions(store: KeyValueStore): Promise<void> {
  await store.set(KEY, { shown: {}, opened: {} });
}

/**
 * IndexedDB store for imported history and cached API metadata.
 *
 * Imported Takeout data is the user's own data and is kept long-term. API
 * metadata (`videos`, `uploads`) follows YouTube's rule: refreshed or deleted
 * within 30 days of fetching (see cache.ts).
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PlaylistItem, SearchEvent, Subscription, WatchEvent } from './takeout/types.ts';
import type { VideoMeta } from './api/types.ts';
import type { Feedback } from './feedback.ts';

export interface ChannelUploads {
  /** A channel ID, `lf:` + a channel ID for its uploads without Shorts, or `q:…` for a cached search. */
  channelId: string;
  videoIds: string[];
  fetchedAt: number;
  /** On `lf:` rows: the channel has no long-form playlist, so these are all its uploads. */
  noLongForm?: boolean;
  /** The search text, for `q:` rows (older rows keep it only in the key). */
  query?: string;
}

export interface ImportRecord {
  id?: number;
  importedAt: number;
  files: string[];
  watches: number;
  searches: number;
  subscriptions: number;
  playlistItems: number;
  skipped: number;
}

interface MeTubeDB extends DBSchema {
  watches: {
    key: string; // `${videoId}@${time}` dedupes re-imports
    value: WatchEvent;
    indexes: { byVideo: string; byChannel: string; byTime: number };
  };
  searches: {
    key: string; // `${time}|${query}`
    value: SearchEvent;
    indexes: { byTime: number };
  };
  subscriptions: { key: string; value: Subscription };
  playlistItems: {
    key: [string, string];
    value: PlaylistItem;
    indexes: { byPlaylist: string };
  };
  imports: { key: number; value: ImportRecord };
  videos: { key: string; value: VideoMeta; indexes: { byFetched: number; byChannel: string } };
  uploads: { key: string; value: ChannelUploads; indexes: { byFetched: number } };
  feedback: { key: string; value: Feedback; indexes: { byAt: number; byChannel: string } };
}

export type MeTubeDatabase = IDBPDatabase<MeTubeDB>;

export const DB_NAME = 'metube';

export function openMeTubeDB(name = DB_NAME): Promise<MeTubeDatabase> {
  return openDB<MeTubeDB>(name, 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const w = db.createObjectStore('watches');
        w.createIndex('byVideo', 'videoId');
        w.createIndex('byChannel', 'channelId');
        w.createIndex('byTime', 'time');
        const s = db.createObjectStore('searches');
        s.createIndex('byTime', 'time');
        db.createObjectStore('subscriptions', { keyPath: 'channelId' });
        const p = db.createObjectStore('playlistItems', { keyPath: ['playlistTitle', 'videoId'] });
        p.createIndex('byPlaylist', 'playlistTitle');
        db.createObjectStore('imports', { keyPath: 'id', autoIncrement: true });
      }
      if (oldVersion < 2) {
        const v = db.createObjectStore('videos', { keyPath: 'id' });
        v.createIndex('byFetched', 'fetchedAt');
        v.createIndex('byChannel', 'channelId');
        const u = db.createObjectStore('uploads', { keyPath: 'channelId' });
        u.createIndex('byFetched', 'fetchedAt');
      }
      if (oldVersion < 3) {
        const f = db.createObjectStore('feedback', { keyPath: 'videoId' });
        f.createIndex('byAt', 'at');
        f.createIndex('byChannel', 'channelId');
      }
    },
  });
}

export interface ImportBatch {
  files: string[];
  watches: WatchEvent[];
  searches: SearchEvent[];
  subscriptions: Subscription[];
  playlistItems: PlaylistItem[];
  skipped: number;
}

/**
 * Writes a batch in one transaction. Keys make re-importing the same export
 * idempotent. A subscriptions file is a snapshot of YouTube at export time:
 * it replaces earlier Takeout rows, but keeps subscriptions made in MeTube or
 * read from YouTube by a sync, and your pending unsubscribes.
 */
export async function saveImport(db: MeTubeDatabase, batch: ImportBatch, now = Date.now()): Promise<ImportRecord> {
  const tx = db.transaction(['watches', 'searches', 'subscriptions', 'playlistItems', 'imports'], 'readwrite');
  const watches = tx.objectStore('watches');
  for (const w of batch.watches) watches.put(w, `${w.videoId}@${w.time}`);
  const searches = tx.objectStore('searches');
  for (const s of batch.searches) searches.put(s, `${s.time}|${s.query}`);
  if (batch.subscriptions.length) {
    const subs = tx.objectStore('subscriptions');
    const existing = new Map((await subs.getAll()).map((s) => [s.channelId, s]));
    const inFile = new Set(batch.subscriptions.map((s) => s.channelId));
    // Earlier Takeout rows missing from this export were unsubscribed on YouTube since.
    for (const s of existing.values()) {
      if ((s.source ?? 'takeout') === 'takeout' && !inFile.has(s.channelId)) subs.delete(s.channelId);
    }
    for (const s of batch.subscriptions) {
      const prev = existing.get(s.channelId);
      subs.put(prev ? { ...prev, channelTitle: s.channelTitle || prev.channelTitle } : { ...s, source: 'takeout' });
    }
  }
  const playlists = tx.objectStore('playlistItems');
  for (const p of batch.playlistItems) playlists.put(p);

  const record: ImportRecord = {
    importedAt: now,
    files: batch.files,
    watches: batch.watches.length,
    searches: batch.searches.length,
    subscriptions: batch.subscriptions.length,
    playlistItems: batch.playlistItems.length,
    skipped: batch.skipped,
  };
  const id = await tx.objectStore('imports').add(record);
  await tx.done;
  return { ...record, id };
}

/** Everything imported or made locally. Subscriptions exclude ones you've unsubscribed from. */
export async function loadAll(db: MeTubeDatabase) {
  const [watches, searches, subscriptions, playlistItems, imports] = await Promise.all([
    db.getAll('watches'),
    db.getAll('searches'),
    db.getAll('subscriptions'),
    db.getAll('playlistItems'),
    db.getAll('imports'),
  ]);
  return { watches, searches, subscriptions: subscriptions.filter((s) => !s.removed), playlistItems, imports };
}

/**
 * Lets the user wipe imported data from settings. Subscriptions made in MeTube
 * or read from YouTube by a sync aren't imported, so they stay.
 */
export async function clearImportedData(db: MeTubeDatabase): Promise<void> {
  const tx = db.transaction(['watches', 'searches', 'subscriptions', 'playlistItems', 'imports'], 'readwrite');
  const subs = tx.objectStore('subscriptions');
  // Pending unsubscribes stay too, so a later sync still removes them on YouTube.
  for (const s of await subs.getAll()) if ((s.source ?? 'takeout') === 'takeout' && !s.removed) subs.delete(s.channelId);
  await Promise.all((['watches', 'searches', 'playlistItems', 'imports'] as const).map((n) => tx.objectStore(n).clear()));
  await tx.done;
}

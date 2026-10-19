/**
 * API metadata cache with YouTube's 30-day storage rule built in: anything
 * fetched more than 30 days ago is deleted, never served.
 */
import type { MeTubeDatabase, ChannelUploads } from './db.ts';
import type { VideoMeta } from './api/types.ts';

const DAY = 86_400_000;
/** Hard limit from the YouTube API Services policies. */
export const MAX_CACHE_AGE = 30 * DAY;
/** How long a channel's upload list is treated as current before re-checking (1 unit per channel). */
export const UPLOADS_TTL = 6 * 3_600_000;

export async function purgeExpired(db: MeTubeDatabase, now = Date.now()): Promise<number> {
  const cutoff = IDBKeyRange.upperBound(now - MAX_CACHE_AGE, true);
  let removed = 0;
  const tx = db.transaction(['videos', 'uploads'], 'readwrite');
  for (const store of ['videos', 'uploads'] as const) {
    let cursor = await tx.objectStore(store).index('byFetched').openCursor(cutoff);
    while (cursor) {
      await cursor.delete();
      removed++;
      cursor = await cursor.continue();
    }
  }
  await tx.done;
  return removed;
}

export async function getVideos(db: MeTubeDatabase, ids: string[], now = Date.now()): Promise<Map<string, VideoMeta>> {
  const tx = db.transaction('videos');
  const found = await Promise.all(ids.map((id) => tx.store.get(id)));
  await tx.done;
  const out = new Map<string, VideoMeta>();
  for (const v of found) if (v && now - v.fetchedAt < MAX_CACHE_AGE) out.set(v.id, v);
  return out;
}

export async function putVideos(db: MeTubeDatabase, videos: VideoMeta[]): Promise<void> {
  const tx = db.transaction('videos', 'readwrite');
  for (const v of videos) tx.store.put(v);
  await tx.done;
}

/** Cache key for a channel's upload list; the list without Shorts is kept apart. */
export function uploadsKey(channelId: string, longFormOnly = false): string {
  return longFormOnly ? `lf:${channelId}` : channelId;
}

/** True when an earlier load found no long-form playlist for the channel (remembered while the row lasts). */
export async function lacksLongForm(db: MeTubeDatabase, channelId: string, now = Date.now()): Promise<boolean> {
  const u = await db.get('uploads', uploadsKey(channelId, true));
  return !!u?.noLongForm && now - u.fetchedAt < MAX_CACHE_AGE;
}

export async function getUploads(db: MeTubeDatabase, key: string, now = Date.now()): Promise<ChannelUploads | undefined> {
  const u = await db.get('uploads', key);
  return u && now - u.fetchedAt < UPLOADS_TTL ? u : undefined;
}

export async function putUploads(db: MeTubeDatabase, u: ChannelUploads): Promise<void> {
  await db.put('uploads', u);
}

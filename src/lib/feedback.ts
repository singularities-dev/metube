/**
 * Explicit feedback on videos: 5-point ratings and dismissals.
 *
 * Records are the user's own data and are kept long-term. They hold IDs plus
 * the tags the user's judgement applied to (that is the preference signal),
 * never titles or other display metadata, which stay in the 30-day cache.
 */
import type { VideoMeta } from './api/types.ts';
import type { MeTubeDatabase } from './db.ts';
import { normaliseTag } from './tags.ts';

export type Rating = 2 | 1 | 0 | -1 | -2;
export type Dismissal = 'not-interested' | 'already-watched' | 'hide-channel';

export const RATINGS: { value: Rating; label: string; short: string }[] = [
  { value: 2, label: 'Love it', short: 'Love' },
  { value: 1, label: 'Like it', short: 'Like' },
  { value: 0, label: 'It’s fine', short: 'Neutral' },
  { value: -1, label: 'Not for me', short: 'Dislike' },
  { value: -2, label: 'Hate it', short: 'Hate' },
];

export const DISMISSALS: { value: Dismissal; label: string; hint: string }[] = [
  { value: 'not-interested', label: 'Not interested', hint: 'Show fewer like this' },
  { value: 'already-watched', label: 'Already watched', hint: 'Hide it, no change to your taste' },
  { value: 'hide-channel', label: 'Don’t show this channel', hint: 'Hide everything from it' },
];

export interface Feedback {
  videoId: string;
  channelId: string;
  /** Kept so the activity view can name the channel without an API call. */
  channelTitle: string;
  categoryId: string;
  /** Normalised tags the judgement applies to: the learning signal. */
  tags: string[];
  rating: Rating | null;
  dismissed: Dismissal | null;
  /** Mood active when the user gave this feedback, for mood-specific learning. */
  moodId: string | null;
  at: number;
  /** What YouTube currently has from us, if we know: set by Sync or by "Mark done". */
  ytSynced?: 'like' | 'dislike' | 'none';
  ytSyncedAt?: number;
}

export function feedbackFromVideo(v: VideoMeta, moodId: string | null, now = Date.now()): Feedback {
  return {
    videoId: v.id,
    channelId: v.channelId,
    channelTitle: v.channelTitle,
    categoryId: v.categoryId,
    tags: [...new Set(v.tags.map(normaliseTag).filter(Boolean))].slice(0, 30),
    rating: null,
    dismissed: null,
    moodId,
    at: now,
  };
}

export async function getFeedback(db: MeTubeDatabase, videoId: string): Promise<Feedback | undefined> {
  return db.get('feedback', videoId);
}

export async function allFeedback(db: MeTubeDatabase): Promise<Feedback[]> {
  return db.getAll('feedback');
}

/** Rates a video. Rating also clears an earlier dismissal: the newer judgement wins. */
export async function rateVideo(db: MeTubeDatabase, v: VideoMeta, rating: Rating | null, moodId: string | null, now = Date.now()): Promise<Feedback> {
  const prev = await getFeedback(db, v.id);
  const next: Feedback = { ...(prev ?? feedbackFromVideo(v, moodId, now)), rating, dismissed: null, moodId, at: now };
  await db.put('feedback', next);
  return next;
}

export async function dismissVideo(db: MeTubeDatabase, v: VideoMeta, reason: Dismissal, moodId: string | null, now = Date.now()): Promise<Feedback> {
  const prev = await getFeedback(db, v.id);
  const next: Feedback = { ...(prev ?? feedbackFromVideo(v, moodId, now)), dismissed: reason, moodId, at: now };
  await db.put('feedback', next);
  return next;
}

/** Restores whatever was there before (used by Undo). */
export async function restoreFeedback(db: MeTubeDatabase, videoId: string, previous: Feedback | undefined): Promise<void> {
  if (previous) await db.put('feedback', previous);
  else await db.delete('feedback', videoId);
}

/** True when YouTube still holds a like/dislike we put there, so the record must outlive the rating. */
const onYouTube = (f: Feedback) => f.ytSynced === 'like' || f.ytSynced === 'dislike';

export async function clearDismissal(db: MeTubeDatabase, videoId: string): Promise<void> {
  const prev = await getFeedback(db, videoId);
  if (!prev) return;
  if (prev.rating === null && !onYouTube(prev)) await db.delete('feedback', videoId);
  else await db.put('feedback', { ...prev, dismissed: null });
}

/**
 * Removes a rating. If YouTube still has the like/dislike from an earlier sync,
 * the record stays (rating cleared) so syncing can undo it there too.
 */
export async function removeRating(db: MeTubeDatabase, videoId: string): Promise<void> {
  const prev = await getFeedback(db, videoId);
  if (!prev) return;
  if (!onYouTube(prev) && !prev.dismissed) await db.delete('feedback', videoId);
  else await db.put('feedback', { ...prev, rating: null });
}

/** Un-hides a channel: clears every hide-channel dismissal for it. */
export async function unhideChannel(db: MeTubeDatabase, channelId: string): Promise<void> {
  const rows = await db.getAllFromIndex('feedback', 'byChannel', channelId);
  for (const r of rows) if (r.dismissed === 'hide-channel') await clearDismissal(db, r.videoId);
}

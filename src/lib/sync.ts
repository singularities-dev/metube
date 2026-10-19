/**
 * Keeping YouTube's like/dislike in step with MeTube ratings.
 *
 * Love/Like → like, Dislike/Hate → dislike, Neutral or no rating → none.
 * A rating is "pending" when YouTube doesn't reflect it yet. Two ways to settle it:
 * - Basic: the user likes it on YouTube themselves and marks it done.
 * - Sync: a batch of videos.rate calls with a short-lived OAuth token (50 units each).
 */
import type { YouTubeClient } from './api/client.ts';
import type { MeTubeDatabase } from './db.ts';
import type { Feedback } from './feedback.ts';
import { ENDPOINT_COST, QuotaExceededLocallyError } from './quota.ts';

export type YtRating = 'like' | 'dislike' | 'none';

export function desiredYtRating(f: Pick<Feedback, 'rating' | 'dismissed'>): YtRating {
  // A dismissal says nothing YouTube should know about.
  if (f.rating === null || f.rating === 0) return 'none';
  return f.rating > 0 ? 'like' : 'dislike';
}

/** Needs action on YouTube. Ratings that never reached YouTube and are now neutral need nothing. */
export function isPending(f: Feedback): boolean {
  return desiredYtRating(f) !== (f.ytSynced ?? 'none');
}

/** Oldest first, so a capped batch works through the backlog in order. */
export function pendingSync(feedback: Feedback[]): Feedback[] {
  return feedback.filter(isPending).sort((a, b) => a.at - b.at);
}

/** Basic mode: the user did it on YouTube themselves. */
export async function markSynced(db: MeTubeDatabase, videoId: string, now = Date.now()): Promise<Feedback | undefined> {
  const f = await db.get('feedback', videoId);
  if (!f) return undefined;
  const next = { ...f, ytSynced: desiredYtRating(f), ytSyncedAt: now };
  await db.put('feedback', next);
  return next;
}

export const DEFAULT_SYNC_CAP = 40;
export const RATE_COST = ENDPOINT_COST['videos.rate'];

export interface SyncResult {
  synced: number;
  /** Videos YouTube no longer has; marked so they stop showing as pending. */
  gone: number;
  remaining: number;
  unitsUsed: number;
  /** Why the run stopped early, if it did. */
  stoppedBecause?: 'auth' | 'quota' | 'cap' | 'budget' | 'refused' | 'error';
  /** What was thrown when it stopped on an error, for the UI to word in the user's language. */
  cause?: unknown;
}

/**
 * Sends pending ratings to YouTube, oldest first. Stops at the cap, when the
 * day's remaining quota would drop below `reserveUnits` (so the feed keeps
 * working), or on an auth/quota error. Each success is saved immediately, so a
 * stopped run loses nothing.
 */
export async function syncRatings(
  db: MeTubeDatabase,
  client: YouTubeClient,
  accessToken: string,
  opts: { cap?: number; remainingUnits: number; reserveUnits?: number; now?: () => number },
): Promise<SyncResult> {
  const cap = opts.cap ?? DEFAULT_SYNC_CAP;
  const reserve = opts.reserveUnits ?? 1000;
  const now = opts.now ?? (() => Date.now());
  const pending = pendingSync(await db.getAll('feedback'));
  const result: SyncResult = { synced: 0, gone: 0, remaining: pending.length, unitsUsed: 0 };
  let budget = opts.remainingUnits - reserve;

  for (const f of pending) {
    if (result.synced + result.gone >= cap) { result.stoppedBecause = 'cap'; break; }
    if (budget < RATE_COST) { result.stoppedBecause = 'budget'; break; }
    const target = desiredYtRating(f);
    try {
      await client.rate(f.videoId, target, accessToken);
      result.synced++;
    } catch (e) {
      const err = e as { kind?: string };
      if (err.kind === 'not-found') {
        result.gone++;
      } else {
        // The local quota guard refused the call before sending it.
        const blockedLocally = e instanceof QuotaExceededLocallyError;
        result.stoppedBecause =
          err.kind === 'auth' ? 'auth'
          : err.kind === 'quota' || blockedLocally ? 'quota'
          : err.kind === 'refused' ? 'refused'
          : 'error';
        result.cause = e;
        // Failed calls still cost quota, but only if they reached Google.
        if (!blockedLocally && err.kind !== 'network') result.unitsUsed += RATE_COST;
        break;
      }
    }
    result.unitsUsed += RATE_COST;
    budget -= RATE_COST;
    await db.put('feedback', { ...f, ytSynced: target, ytSyncedAt: now() });
    result.remaining--;
  }
  return result;
}

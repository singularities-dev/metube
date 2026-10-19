/**
 * Channel subscriptions: yours to make in MeTube, optionally kept in step with YouTube.
 *
 * Subscribing in MeTube works without signing in; the channel joins your feed
 * like any other subscription. A sync (with the same short-lived sign-in as
 * rating sync) reads your real subscriptions from YouTube (1 unit per 50) and
 * sends changes made in MeTube (50 units each).
 *
 * YouTube is the source of truth when reading, except for changes made in
 * MeTube that haven't been sent yet.
 */
import type { YouTubeClient, YouTubeSubscription } from './api/client.ts';
import type { MeTubeDatabase } from './db.ts';
import { ENDPOINT_COST, QuotaExceededLocallyError } from './quota.ts';
import type { Subscription } from './takeout/types.ts';

/**
 * Whether YouTube has this subscription. Takeout rows came from YouTube, and
 * synced rows say so; MeTube-made ones don't until a sync sends them.
 */
export function isOnYouTube(s: Subscription): boolean {
  return s.onYouTube ?? (s.source ?? 'takeout') !== 'metube';
}

export type SubscriptionChange = { kind: 'subscribe' | 'unsubscribe'; sub: Subscription };

/** Changes YouTube doesn't reflect yet, oldest first. */
export function pendingSubscriptionChanges(subs: Subscription[]): SubscriptionChange[] {
  const out: SubscriptionChange[] = [];
  for (const s of subs) {
    if (!s.removed && !isOnYouTube(s)) out.push({ kind: 'subscribe', sub: s });
    else if (s.removed && isOnYouTube(s)) out.push({ kind: 'unsubscribe', sub: s });
  }
  const at = (c: SubscriptionChange) => (c.kind === 'subscribe' ? c.sub.subscribedAt : c.sub.removedAt) ?? 0;
  return out.sort((a, b) => at(a) - at(b));
}

/** Subscriptions you have (in MeTube's view), A–Z. */
export async function listSubscriptions(db: MeTubeDatabase): Promise<Subscription[]> {
  return (await db.getAll('subscriptions')).filter((s) => !s.removed).sort((a, b) => a.channelTitle.localeCompare(b.channelTitle));
}

export async function subscribe(db: MeTubeDatabase, channelId: string, channelTitle: string, now = Date.now()): Promise<Subscription> {
  const prev = await db.get('subscriptions', channelId);
  // Re-subscribing undoes a pending unsubscribe.
  const next: Subscription = prev
    ? { ...prev, removed: false, removedAt: undefined }
    : { channelId, channelTitle, source: 'metube', subscribedAt: now, onYouTube: false };
  await db.put('subscriptions', next);
  return next;
}

/** Unsubscribes. If YouTube has the subscription, it's kept as pending until a sync removes it there. */
export async function unsubscribe(db: MeTubeDatabase, channelId: string, now = Date.now()): Promise<void> {
  const prev = await db.get('subscriptions', channelId);
  if (!prev) return;
  if (isOnYouTube(prev)) await db.put('subscriptions', { ...prev, removed: true, removedAt: now });
  else await db.delete('subscriptions', channelId);
}

/** Puts back exactly what was there before (used by Undo). */
export async function restoreSubscription(db: MeTubeDatabase, channelId: string, previous: Subscription | undefined): Promise<void> {
  if (previous) await db.put('subscriptions', previous);
  else await db.delete('subscriptions', channelId);
}

export interface PullResult {
  /** Subscriptions YouTube has that MeTube didn't. */
  added: number;
  /** Subscriptions MeTube had that YouTube no longer does. */
  removed: number;
  total: number;
  unitsUsed: number;
}

/** Merges YouTube's list into MeTube's (see the module comment for who wins). */
export function mergeFromYouTube(local: Subscription[], remote: YouTubeSubscription[]): { put: Subscription[]; remove: string[]; added: number } {
  const byId = new Map(remote.map((r) => [r.channelId, r]));
  const put: Subscription[] = [];
  const remove: string[] = [];
  let added = 0;
  for (const s of local) {
    const r = byId.get(s.channelId);
    byId.delete(s.channelId);
    if (r) {
      // Still there: record that and its ID. A pending unsubscribe stays pending.
      put.push({ ...s, channelTitle: r.channelTitle || s.channelTitle, onYouTube: true, ytSubscriptionId: r.id });
    } else if (!s.removed && !isOnYouTube(s)) {
      // Made in MeTube and not sent yet: keep it pending.
    } else {
      // Unsubscribed on YouTube, or a pending unsubscribe YouTube no longer needs.
      remove.push(s.channelId);
    }
  }
  for (const r of byId.values()) {
    put.push({ channelId: r.channelId, channelTitle: r.channelTitle, source: 'youtube', onYouTube: true, ytSubscriptionId: r.id, ...(r.subscribedAt ? { subscribedAt: r.subscribedAt } : {}) });
    added++;
  }
  return { put, remove, added };
}

/** Reads your subscriptions from YouTube and merges them in (1 unit per 50). */
export async function pullSubscriptions(db: MeTubeDatabase, client: YouTubeClient, accessToken: string): Promise<PullResult> {
  const remote = await client.mySubscriptions(accessToken);
  const local = await db.getAll('subscriptions');
  const { put, remove, added } = mergeFromYouTube(local, remote);
  const tx = db.transaction('subscriptions', 'readwrite');
  for (const s of put) tx.store.put(s);
  for (const id of remove) tx.store.delete(id);
  await tx.done;
  return { added, removed: remove.length, total: remote.length, unitsUsed: Math.max(1, Math.ceil(remote.length / 50)) };
}

export const SUBSCRIBE_COST = ENDPOINT_COST['subscriptions.insert'];
export const UNSUBSCRIBE_COST = ENDPOINT_COST['subscriptions.delete'];

export interface PushResult {
  subscribed: number;
  unsubscribed: number;
  /** Channels YouTube no longer has; dropped so they stop showing as pending. */
  gone: number;
  remaining: number;
  unitsUsed: number;
  stoppedBecause?: 'auth' | 'quota' | 'cap' | 'budget' | 'refused' | 'error';
  /** What was thrown when it stopped on an error, for the UI to word in the user's language. */
  cause?: unknown;
}

/**
 * Sends pending subscribes and unsubscribes to YouTube, oldest first. Stops at
 * the cap, when the day's remaining quota would drop below `reserveUnits`, or
 * when YouTube refuses (sign-in, quota, too many recent subscriptions). Each
 * success is saved at once, so a stopped run loses nothing.
 */
export async function pushSubscriptions(
  db: MeTubeDatabase,
  client: YouTubeClient,
  accessToken: string,
  opts: { cap?: number; remainingUnits: number; reserveUnits?: number },
): Promise<PushResult> {
  const cap = opts.cap ?? 40;
  let budget = opts.remainingUnits - (opts.reserveUnits ?? 1000);
  const pending = pendingSubscriptionChanges(await db.getAll('subscriptions'));
  const result: PushResult = { subscribed: 0, unsubscribed: 0, gone: 0, remaining: pending.length, unitsUsed: 0 };
  const spend = (units: number) => { result.unitsUsed += units; budget -= units; };

  for (const { kind, sub } of pending) {
    if (result.subscribed + result.unsubscribed + result.gone >= cap) { result.stoppedBecause = 'cap'; break; }
    // An unsubscribe may first need a 1-unit lookup of its subscription ID.
    const cost = kind === 'subscribe' ? SUBSCRIBE_COST : UNSUBSCRIBE_COST + (sub.ytSubscriptionId ? 0 : 1);
    if (budget < cost) { result.stoppedBecause = 'budget'; break; }
    // What the call in flight costs, so a failure is counted right.
    let callCost = 0;
    try {
      if (kind === 'subscribe') {
        callCost = SUBSCRIBE_COST;
        let id: string | undefined;
        try {
          id = await client.subscribe(sub.channelId, accessToken);
        } catch (e) {
          // Already subscribed on YouTube: nothing left to do.
          if ((e as { kind?: string }).kind !== 'duplicate') throw e;
        }
        spend(callCost);
        await db.put('subscriptions', { ...sub, onYouTube: true, ...(id ? { ytSubscriptionId: id } : {}) });
        result.subscribed++;
      } else {
        let id = sub.ytSubscriptionId;
        if (!id) {
          callCost = 1;
          id = (await client.findSubscription(sub.channelId, accessToken))?.id;
          spend(callCost);
        }
        if (id) {
          callCost = UNSUBSCRIBE_COST;
          try {
            await client.unsubscribe(id, accessToken);
          } catch (e) {
            // Already gone on YouTube counts as done.
            if ((e as { kind?: string }).kind !== 'not-found') throw e;
          }
          spend(callCost);
        }
        await db.delete('subscriptions', sub.channelId);
        result.unsubscribed++;
      }
      result.remaining--;
    } catch (e) {
      const err = e as { kind?: string };
      const blockedLocally = e instanceof QuotaExceededLocallyError;
      // Calls that reached Google cost quota even when they fail.
      if (!blockedLocally && err.kind !== 'network') spend(callCost);
      if (err.kind === 'not-found' && kind === 'subscribe') {
        // The channel no longer exists.
        await db.delete('subscriptions', sub.channelId);
        result.gone++;
        result.remaining--;
        continue;
      }
      result.stoppedBecause =
        err.kind === 'auth' ? 'auth'
        : err.kind === 'quota' || blockedLocally ? 'quota'
        : err.kind === 'refused' ? 'refused'
        : 'error';
      result.cause = e;
      break;
    }
  }
  return result;
}

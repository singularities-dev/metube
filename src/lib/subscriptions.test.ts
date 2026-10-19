import 'fake-indexeddb/auto';
import { describe, expect, test } from 'vitest';
import { clearImportedData, loadAll, openMeTubeDB, saveImport } from './db.ts';
import { MemoryStore, QuotaTracker } from './quota.ts';
import { YouTubeClient } from './api/client.ts';
import {
  isOnYouTube, listSubscriptions, mergeFromYouTube, pendingSubscriptionChanges, pullSubscriptions, pushSubscriptions,
  restoreSubscription, subscribe, unsubscribe,
} from './subscriptions.ts';
import type { Subscription } from './takeout/types.ts';

const NOW = Date.parse('2026-10-19T12:00:00Z');
const db = () => openMeTubeDB('subs-' + Math.random());
const takeout = (channelId: string): Subscription => ({ channelId, channelTitle: channelId });
const importSubs = (d: Awaited<ReturnType<typeof db>>, subs: Subscription[]) =>
  saveImport(d, { files: ['subscriptions.csv'], watches: [], searches: [], playlistItems: [], skipped: 0, subscriptions: subs }, NOW);

type Reply = { status: number; body?: unknown };
function client(reply: (url: URL, init?: { method?: string; body?: string }) => Reply) {
  const quota = new QuotaTracker(new MemoryStore(), () => new Date(NOW));
  const calls: { method: string; path: string; params: URLSearchParams; body?: unknown; auth?: string }[] = [];
  const c = new YouTubeClient({
    getKey: async () => 'k', quota, now: () => NOW,
    fetch: async (url, init) => {
      const u = new URL(url);
      calls.push({ method: init?.method ?? 'GET', path: u.pathname.split('/').pop()!, params: u.searchParams, body: init?.body ? JSON.parse(init.body) : undefined, auth: init?.headers?.Authorization });
      const r = reply(u, init);
      return { ok: r.status < 400, status: r.status, json: async () => r.body ?? {} };
    },
  });
  return { c, quota, calls };
}
const yt = (reason: string, status = 400) => ({ status, body: { error: { code: status, message: reason, errors: [{ reason }] } } });

describe('local subscriptions', () => {
  test('subscribe, unsubscribe and undo; only YouTube-held ones leave a pending unsubscribe', async () => {
    const d = await db();
    await importSubs(d, [takeout('UCyt')]);
    await subscribe(d, 'UCnew', 'New', NOW);
    // A–Z by title: "New" before "UCyt".
    expect((await listSubscriptions(d)).map((s) => s.channelId)).toEqual(['UCnew', 'UCyt']);
    expect(pendingSubscriptionChanges(await d.getAll('subscriptions')).map((c) => [c.kind, c.sub.channelId])).toEqual([['subscribe', 'UCnew']]);

    // Never reached YouTube: simply gone.
    const before = await d.get('subscriptions', 'UCnew');
    await unsubscribe(d, 'UCnew', NOW);
    expect(await d.get('subscriptions', 'UCnew')).toBeUndefined();
    await restoreSubscription(d, 'UCnew', before);
    expect(await d.get('subscriptions', 'UCnew')).toEqual(before);

    // YouTube has it: kept as a pending unsubscribe, hidden from the feed's data.
    await unsubscribe(d, 'UCyt', NOW + 1);
    expect(pendingSubscriptionChanges(await d.getAll('subscriptions')).map((c) => [c.kind, c.sub.channelId])).toEqual([
      ['subscribe', 'UCnew'], ['unsubscribe', 'UCyt'],
    ]);
    expect((await loadAll(d)).subscriptions.map((s) => s.channelId)).toEqual(['UCnew']);
    // Re-subscribing cancels it.
    await subscribe(d, 'UCyt', 'UCyt', NOW + 2);
    expect(pendingSubscriptionChanges(await d.getAll('subscriptions')).map((c) => c.sub.channelId)).toEqual(['UCnew']);
  });

  test('a Takeout import merges instead of wiping, and clearing imports keeps your own', async () => {
    const d = await db();
    await importSubs(d, [takeout('UCa'), takeout('UCb')]);
    await subscribe(d, 'UCmine', 'Mine', NOW);
    await unsubscribe(d, 'UCb', NOW);
    // A newer export without UCa: you unsubscribed on YouTube since.
    await importSubs(d, [takeout('UCb'), takeout('UCc')]);
    const all = new Map((await d.getAll('subscriptions')).map((s) => [s.channelId, s]));
    expect([...all.keys()].sort()).toEqual(['UCb', 'UCc', 'UCmine']);
    expect(all.get('UCb')?.removed).toBe(true);
    expect(all.get('UCmine')?.source).toBe('metube');

    await clearImportedData(d);
    expect((await d.getAll('subscriptions')).map((s) => s.channelId).sort()).toEqual(['UCb', 'UCmine']);
  });

  test('where a subscription lives', () => {
    expect(isOnYouTube(takeout('x'))).toBe(true);
    expect(isOnYouTube({ ...takeout('x'), source: 'metube' })).toBe(false);
    expect(isOnYouTube({ ...takeout('x'), source: 'metube', onYouTube: true })).toBe(true);
  });
});

describe('merging YouTube’s list', () => {
  test('YouTube wins, except for changes not sent yet', () => {
    const local: Subscription[] = [
      { ...takeout('UCkeep') },
      { ...takeout('UCgoneOnYt') },
      { channelId: 'UCpendingSub', channelTitle: 'p', source: 'metube', onYouTube: false },
      { ...takeout('UCpendingUnsub'), removed: true },
      { ...takeout('UCunsubDone'), removed: true },
    ];
    const remote = [
      { id: 's1', channelId: 'UCkeep', channelTitle: 'Keep', subscribedAt: null },
      { id: 's2', channelId: 'UCpendingUnsub', channelTitle: 'P', subscribedAt: null },
      { id: 's3', channelId: 'UCfresh', channelTitle: 'Fresh', subscribedAt: NOW },
    ];
    const { put, remove, added } = mergeFromYouTube(local, remote);
    expect(added).toBe(1);
    expect(remove.sort()).toEqual(['UCgoneOnYt', 'UCunsubDone']);
    const byId = new Map(put.map((s) => [s.channelId, s]));
    expect(byId.get('UCkeep')).toMatchObject({ onYouTube: true, ytSubscriptionId: 's1', channelTitle: 'Keep' });
    expect(byId.get('UCpendingUnsub')).toMatchObject({ removed: true, ytSubscriptionId: 's2' });
    expect(byId.get('UCfresh')).toMatchObject({ source: 'youtube', onYouTube: true, subscribedAt: NOW });
    expect(byId.has('UCpendingSub')).toBe(false);
  });

  test('pull reads every page with the sign-in, 1 unit each', async () => {
    const d = await db();
    const { c, quota, calls } = client((u) => {
      const page = u.searchParams.get('pageToken');
      const items = (page ? ['UCb'] : ['UCa']).map((id) => ({ id: `s-${id}`, snippet: { title: id, resourceId: { channelId: id } } }));
      return { status: 200, body: { items, ...(page ? {} : { nextPageToken: 'p2' }) } };
    });
    const r = await pullSubscriptions(d, c, 'tok');
    expect(r).toMatchObject({ added: 2, total: 2 });
    expect(calls.map((x) => [x.path, x.params.get('mine'), x.auth])).toEqual([['subscriptions', 'true', 'Bearer tok'], ['subscriptions', 'true', 'Bearer tok']]);
    expect(calls[0]!.params.get('key')).toBeNull();
    expect((await quota.state()).used).toBe(2);
    expect((await listSubscriptions(d)).map((s) => s.ytSubscriptionId)).toEqual(['s-UCa', 's-UCb']);
  });
});

describe('pushSubscriptions', () => {
  test('subscribes and unsubscribes oldest first, recording IDs and quota', async () => {
    const d = await db();
    await importSubs(d, [takeout('UCold')]);
    await subscribe(d, 'UCnew', 'New', NOW);
    await unsubscribe(d, 'UCold', NOW + 1);
    const { c, quota, calls } = client((u, init) => {
      if (init?.method === 'POST') return { status: 200, body: { id: 'sub-new' } };
      if (init?.method === 'DELETE') return { status: 204 };
      return { status: 200, body: { items: [{ id: 'sub-old', snippet: { title: 'Old', resourceId: { channelId: 'UCold' } } }] } };
    });
    const r = await pushSubscriptions(d, c, 'tok', { remainingUnits: 10_000 });
    expect(r).toMatchObject({ subscribed: 1, unsubscribed: 1, remaining: 0, unitsUsed: 101 });
    expect(calls.map((x) => `${x.method} ${x.params.get('forChannelId') ?? x.params.get('id') ?? ''}`)).toEqual(['POST ', 'GET UCold', 'DELETE sub-old']);
    expect(calls[0]!.body).toEqual({ snippet: { resourceId: { kind: 'youtube#channel', channelId: 'UCnew' } } });
    expect((await quota.state()).used).toBe(101);
    expect(await d.get('subscriptions', 'UCnew')).toMatchObject({ onYouTube: true, ytSubscriptionId: 'sub-new' });
    expect(await d.get('subscriptions', 'UCold')).toBeUndefined();
    expect(pendingSubscriptionChanges(await d.getAll('subscriptions'))).toHaveLength(0);
  });

  test('duplicates and already-removed subscriptions count as done; deleted channels are dropped', async () => {
    const d = await db();
    await subscribe(d, 'UCdup', 'Dup', NOW);
    await subscribe(d, 'UCgone', 'Gone', NOW + 1);
    await d.put('subscriptions', { ...takeout('UCx'), ytSubscriptionId: 'sx', removed: true, removedAt: NOW + 2 });
    const { c } = client((u, init) => {
      if (init?.method === 'DELETE') return yt('subscriptionNotFound', 404);
      const ch = JSON.parse(init?.body ?? '{}').snippet?.resourceId?.channelId;
      return ch === 'UCdup' ? yt('subscriptionDuplicate') : yt('publisherNotFound', 404);
    });
    const r = await pushSubscriptions(d, c, 'tok', { remainingUnits: 10_000 });
    expect(r).toMatchObject({ subscribed: 1, unsubscribed: 1, gone: 1, remaining: 0, unitsUsed: 150 });
    expect(await d.get('subscriptions', 'UCdup')).toMatchObject({ onYouTube: true });
    expect(await d.get('subscriptions', 'UCgone')).toBeUndefined();
  });

  test('stops when YouTube refuses, on sign-in or quota errors, at the cap, and to keep a reserve', async () => {
    const seed = async () => {
      const d = await db();
      for (let i = 0; i < 3; i++) await subscribe(d, `UC${i}`, `C${i}`, NOW + i);
      return d;
    };
    let n = 0;
    const refused = await pushSubscriptions(await seed(), client(() => (++n === 2 ? yt('subscriptionForbidden', 403) : { status: 200, body: { id: 's' } })).c, 't', { remainingUnits: 10_000 });
    expect(refused).toMatchObject({ subscribed: 1, remaining: 2, stoppedBecause: 'refused', unitsUsed: 100 });

    const auth = await pushSubscriptions(await seed(), client(() => yt('authError', 401)).c, 't', { remainingUnits: 10_000 });
    expect(auth).toMatchObject({ subscribed: 0, remaining: 3, stoppedBecause: 'auth' });

    const capped = await pushSubscriptions(await seed(), client(() => ({ status: 200, body: { id: 's' } })).c, 't', { cap: 2, remainingUnits: 10_000 });
    expect(capped).toMatchObject({ subscribed: 2, remaining: 1, stoppedBecause: 'cap' });

    const reserve = await pushSubscriptions(await seed(), client(() => ({ status: 200, body: { id: 's' } })).c, 't', { remainingUnits: 1_120 });
    expect(reserve).toMatchObject({ subscribed: 2, remaining: 1, stoppedBecause: 'budget' });

    const { c, quota } = client(() => ({ status: 200, body: { id: 's' } }));
    await quota.markExhausted();
    const local = await pushSubscriptions(await seed(), c, 't', { remainingUnits: 10_000 });
    expect(local).toMatchObject({ subscribed: 0, stoppedBecause: 'quota', unitsUsed: 0 });
  });
});

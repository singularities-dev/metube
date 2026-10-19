import 'fake-indexeddb/auto';
import { describe, expect, test } from 'vitest';
import { openMeTubeDB } from './db.ts';
import { rateVideo, removeRating, getFeedback, type Feedback } from './feedback.ts';
import { desiredYtRating, isPending, markSynced, pendingSync, syncRatings } from './sync.ts';
import { MemoryStore, QuotaTracker } from './quota.ts';
import { YouTubeApiError, YouTubeClient } from './api/client.ts';
import type { VideoMeta } from './api/types.ts';

const NOW = Date.parse('2026-10-17T12:00:00Z');
const vid = (id: string): VideoMeta => ({
  id, channelId: 'UC', channelTitle: 'C', title: id, description: '', tags: [], categoryId: '10',
  publishedAt: NOW, durationSec: 600, isLive: false, thumbnail: null, viewCount: null, fetchedAt: NOW,
});
const fb = (rating: number | null, ytSynced?: Feedback['ytSynced']): Feedback =>
  ({ videoId: 'v', channelId: 'UC', channelTitle: 'C', categoryId: '10', tags: [], rating, dismissed: null, moodId: null, at: NOW, ytSynced }) as Feedback;

describe('sync state', () => {
  test('mapping and pending', () => {
    expect([2, 1, 0, -1, -2, null].map((r) => desiredYtRating(fb(r)))).toEqual(['like', 'like', 'none', 'dislike', 'dislike', 'none']);
    expect(isPending(fb(2))).toBe(true);
    expect(isPending(fb(2, 'like'))).toBe(false);
    expect(isPending(fb(0))).toBe(false); // never on YouTube, nothing to do
    expect(isPending(fb(null, 'like'))).toBe(true); // rating removed after syncing: undo on YouTube
    expect(isPending(fb(-1, 'like'))).toBe(true); // changed its mind
  });

  test('mark done, and removing a synced rating keeps it pending until undone', async () => {
    const db = await openMeTubeDB('sync-' + Math.random());
    await rateVideo(db, vid('a'), 2, null, NOW);
    expect(pendingSync(await db.getAll('feedback'))).toHaveLength(1);
    await markSynced(db, 'a', NOW);
    expect((await getFeedback(db, 'a'))?.ytSynced).toBe('like');
    expect(pendingSync(await db.getAll('feedback'))).toHaveLength(0);

    await removeRating(db, 'a');
    const after = await getFeedback(db, 'a');
    expect(after?.rating).toBeNull();
    expect(after && isPending(after)).toBe(true);

    await rateVideo(db, vid('b'), 1, null, NOW);
    await removeRating(db, 'b'); // never synced: simply gone
    expect(await getFeedback(db, 'b')).toBeUndefined();
  });
});

function client(responses: (url: string, init?: { method?: string; headers?: Record<string, string> }) => { status: number; body?: unknown }) {
  const quota = new QuotaTracker(new MemoryStore(), () => new Date(NOW));
  const calls: { url: string; auth?: string; method?: string }[] = [];
  const c = new YouTubeClient({
    getKey: async () => 'k', quota, now: () => NOW,
    fetch: async (url, init) => {
      calls.push({ url, auth: init?.headers?.Authorization, method: init?.method });
      const r = responses(url, init);
      return { ok: r.status < 400, status: r.status, json: async () => r.body ?? {} };
    },
  });
  return { c, quota, calls };
}

describe('syncRatings', () => {
  async function seed(n: number) {
    const db = await openMeTubeDB('run-' + Math.random());
    for (let i = 0; i < n; i++) await rateVideo(db, vid(`v${i}`), i % 2 ? -1 : 2, null, NOW + i);
    return db;
  }

  test('sends oldest first with the token, records quota and marks each synced', async () => {
    const db = await seed(3);
    const { c, quota, calls } = client(() => ({ status: 204 }));
    const r = await syncRatings(db, c, 'tok', { remainingUnits: 10_000 });
    expect(r).toMatchObject({ synced: 3, remaining: 0, unitsUsed: 150 });
    expect(r.stoppedBecause).toBeUndefined();
    expect(calls.map((x) => new URL(x.url).searchParams.get('rating'))).toEqual(['like', 'dislike', 'like']);
    expect(calls[0]).toMatchObject({ auth: 'Bearer tok', method: 'POST' });
    expect((await quota.state()).used).toBe(150);
    expect(pendingSync(await db.getAll('feedback'))).toHaveLength(0);
  });

  test('respects the cap and keeps a quota reserve for the feed', async () => {
    const db = await seed(5);
    const capped = await syncRatings(db, client(() => ({ status: 204 })).c, 't', { cap: 2, remainingUnits: 10_000 });
    expect(capped).toMatchObject({ synced: 2, remaining: 3, stoppedBecause: 'cap' });
    const budget = await syncRatings(db, client(() => ({ status: 204 })).c, 't', { remainingUnits: 1_120, reserveUnits: 1_000 });
    expect(budget).toMatchObject({ synced: 2, remaining: 1, stoppedBecause: 'budget' });
  });

  test('YouTube declining for now stops the run as refused', async () => {
    const db = await seed(2);
    const { c } = client(() => ({ status: 403, body: { error: { code: 403, message: 'Slow down', errors: [{ reason: 'rateLimitExceeded' }] } } }));
    const r = await syncRatings(db, c, 't', { remainingUnits: 10_000 });
    expect(r).toMatchObject({ synced: 0, remaining: 2, stoppedBecause: 'refused' });
    expect((r.cause as YouTubeApiError).kind).toBe('refused');
  });

  test('expired sign-in stops the run; already-synced items stay synced', async () => {
    const db = await seed(3);
    let n = 0;
    const { c } = client(() => (++n === 2 ? { status: 401, body: { error: { code: 401, message: 'Invalid Credentials' } } } : { status: 204 }));
    const r = await syncRatings(db, c, 't', { remainingUnits: 10_000 });
    expect(r).toMatchObject({ synced: 1, remaining: 2, stoppedBecause: 'auth' });
    expect(pendingSync(await db.getAll('feedback'))).toHaveLength(2);
  });

  test('calls that never reach Google cost nothing', async () => {
    const db = await seed(2);
    const { c, quota } = client(() => ({ status: 204 }));
    const offline = new YouTubeClient({
      getKey: async () => 'k', quota: new QuotaTracker(new MemoryStore(), () => new Date(NOW)), now: () => NOW,
      fetch: async () => { throw new Error('offline'); },
    });
    const net = await syncRatings(db, offline, 't', { remainingUnits: 10_000 });
    expect(net).toMatchObject({ synced: 0, remaining: 2, unitsUsed: 0, stoppedBecause: 'error' });
    // The thrown error is kept for the UI to word, not its English message.
    expect(net.cause).toBeInstanceOf(YouTubeApiError);
    expect((net.cause as YouTubeApiError).kind).toBe('network');

    // The local tracker thinks the day is spent, though the caller's budget says otherwise.
    await quota.markExhausted();
    const local = await syncRatings(db, c, 't', { remainingUnits: 10_000 });
    expect(local).toMatchObject({ synced: 0, remaining: 2, unitsUsed: 0, stoppedBecause: 'quota' });
  });

  test('deleted videos are marked and skipped', async () => {
    const db = await seed(2);
    let n = 0;
    const { c } = client(() => (++n === 1 ? { status: 404, body: { error: { code: 404, message: 'nope', errors: [{ reason: 'videoNotFound' }] } } } : { status: 204 }));
    const r = await syncRatings(db, c, 't', { remainingUnits: 10_000 });
    expect(r).toMatchObject({ synced: 1, gone: 1, remaining: 0 });
  });
});

describe('oauth helpers', () => {
  test('auth URL and redirect parsing', async () => {
    const { authUrl, parseRedirect, SYNC_SCOPE } = await import('./oauth.ts');
    const u = new URL(authUrl(' abc.apps.googleusercontent.com ', 'https://x.chromiumapp.org/', 's1', 'fr'));
    expect(u.searchParams.get('client_id')).toBe('abc.apps.googleusercontent.com');
    // Google's sign-in screens follow MeTube's language, not the browser's.
    expect(u.searchParams.get('hl')).toBe('fr');
    expect(u.searchParams.get('response_type')).toBe('token');
    expect(u.searchParams.get('scope')).toBe(SYNC_SCOPE);
    expect(parseRedirect('https://x.chromiumapp.org/#access_token=T&expires_in=3599&state=s1', 's1', 0)).toEqual({ token: 'T', expiresAt: 3_599_000 });
    expect(() => parseRedirect('https://x.chromiumapp.org/#access_token=T&state=evil', 's1')).toThrow(/did not match/);
    expect(() => parseRedirect('https://x.chromiumapp.org/#error=access_denied&state=s1', 's1')).toThrow(/declined/);
    expect(() => parseRedirect('https://x.chromiumapp.org/#error=server_error&state=s1', 's1')).toThrow(expect.objectContaining({ code: 'provider', detail: 'server_error' }));
  });

  test('the browser’s own sign-in errors become codes; only unknown wording is kept, as the detail', async () => {
    const { signInFailure } = await import('./oauth.ts');
    const sorted = (msg: string) => { const e = signInFailure(msg); return { code: e.code, detail: e.detail }; };
    expect(sorted('Authorization page could not be loaded.')).toEqual({ code: 'unreachable', detail: undefined });
    expect(sorted('Authorization page load timed out.')).toEqual({ code: 'unreachable', detail: undefined });
    expect(sorted('Did not redirect to the right URL.')).toEqual({ code: 'failed', detail: undefined });
    expect(sorted('Invalid redirect URL')).toEqual({ code: 'failed', detail: undefined });
    expect(sorted('This API is not available in incognito mode.')).toEqual({ code: 'incognito', detail: undefined });
    expect(sorted('User interaction required.')).toEqual({ code: 'failed', detail: 'User interaction required.' });
  });
});

import { test } from 'vitest';
import assert from 'node:assert/strict';
import { MemoryStore, QuotaTracker, QuotaExceededLocallyError, quotaDay } from './quota.ts';

const at = (iso: string) => () => new Date(iso);

test('quotaDay uses Pacific time', () => {
  // 06:00 UTC on 17 Oct is still 16 Oct in Los Angeles (UTC-7 in October).
  assert.equal(quotaDay(new Date('2026-10-17T06:00:00Z')), '2026-10-16');
  assert.equal(quotaDay(new Date('2026-10-17T08:00:00Z')), '2026-10-17');
});

test('records costs per endpoint', async () => {
  const q = new QuotaTracker(new MemoryStore(), at('2026-10-17T12:00:00Z'));
  await q.record('search.list');
  await q.record('videos.list', 3);
  assert.equal((await q.state()).used, 103);
  assert.equal(await q.remaining(), 10_000 - 103);
});

test('blocks a call that exceeds the remainder', async () => {
  const q = new QuotaTracker(new MemoryStore(), at('2026-10-17T12:00:00Z'), 150);
  await q.record('search.list');
  assert.equal(await q.canAfford('search.list'), false);
  await assert.rejects(q.assertAffordable('search.list'), QuotaExceededLocallyError);
  assert.equal(await q.canAfford('videos.list', 50), true);
});

test('resets after Pacific midnight and keeps a custom limit', async () => {
  const store = new MemoryStore();
  let now = '2026-10-17T12:00:00Z';
  const q = new QuotaTracker(store, () => new Date(now));
  await q.setLimit(20_000);
  await q.record('search.list', 5);
  now = '2026-10-18T08:00:00Z'; // 01:00 Pacific on the 18th
  const s = await q.state();
  assert.deepEqual(s, { day: '2026-10-18', used: 0, limit: 20_000 });
});

test('markExhausted zeroes the remainder', async () => {
  const q = new QuotaTracker(new MemoryStore(), at('2026-10-17T12:00:00Z'));
  await q.markExhausted();
  assert.equal(await q.remaining(), 0);
});

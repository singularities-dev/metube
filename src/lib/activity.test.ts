import { expect, test } from 'vitest';
import { watchesByHour, watchesByMonth } from './activity.ts';
import type { WatchEvent } from './takeout/types.ts';

const w = (iso: string, isAd = false): WatchEvent => ({ videoId: iso, title: null, channelId: null, channelTitle: null, time: new Date(iso).getTime(), isAd });

test('months are continuous, gaps count zero, ads excluded', () => {
  const months = watchesByMonth([w('2026-01-10T12:00:00'), w('2026-01-11T12:00:00'), w('2026-03-02T12:00:00'), w('2026-02-02T12:00:00', true)]);
  expect(months.map((m) => [m.key, m.count])).toEqual([['2026-01', 2], ['2026-02', 0], ['2026-03', 1]]);
  expect(months[0]).toMatchObject({ year: 2026, month: 0 });
  expect(watchesByMonth([])).toEqual([]);
});

test('hours use local time', () => {
  const hours = watchesByHour([w('2026-01-10T08:30:00'), w('2026-01-11T08:59:00'), w('2026-01-11T23:00:00')]);
  expect(hours[8]).toBe(2);
  expect(hours[23]).toBe(1);
  expect(hours.reduce((a, b) => a + b)).toBe(3);
});

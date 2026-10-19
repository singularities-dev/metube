import { describe, expect, test } from 'vitest';
import { timeWindow, todayValue } from './timerange.ts';

const NOW = new Date(2026, 9, 17, 12, 34, 56).getTime();

describe('timeWindow', () => {
  test('presets look back from now, rounded to the hour', () => {
    expect(timeWindow('any', { from: '', to: '' }, NOW)).toEqual({});
    expect(timeWindow('week', { from: '', to: '' }, NOW)).toEqual({ after: new Date(2026, 9, 10, 12).getTime() });
    expect(timeWindow('day', { from: '', to: '' }, NOW + 60_000)).toEqual(timeWindow('day', { from: '', to: '' }, NOW));
  });

  test('custom ranges are whole local days, either end optional, swapped if reversed', () => {
    const jan = new Date(2026, 0, 1).getTime();
    const feb1 = new Date(2026, 1, 1).getTime();
    expect(timeWindow('custom', { from: '2026-01-01', to: '2026-01-31' }, NOW)).toEqual({ after: jan, before: feb1 });
    expect(timeWindow('custom', { from: '2026-01-31', to: '2026-01-01' }, NOW)).toEqual({ after: jan, before: feb1 });
    expect(timeWindow('custom', { from: '', to: '2026-01-31' }, NOW)).toEqual({ before: feb1 });
    expect(timeWindow('custom', { from: 'nonsense', to: '' }, NOW)).toEqual({});
  });

  test('today as a date input value', () => {
    expect(todayValue(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

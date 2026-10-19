/** Aggregations for the Activity view. Pure, so they're easy to test. */
import type { WatchEvent } from './takeout/types.ts';

export interface MonthCount {
  key: string; // YYYY-MM
  year: number;
  month: number; // 0-11 (the UI formats it in the user's language)
  count: number;
}

/** Watches per calendar month (local time), with empty months filled in so gaps show. */
export function watchesByMonth(watches: WatchEvent[]): MonthCount[] {
  if (!watches.length) return [];
  const counts = new Map<string, number>();
  let min = Infinity;
  let max = -Infinity;
  for (const w of watches) {
    if (w.isAd) continue;
    const d = new Date(w.time);
    const idx = d.getFullYear() * 12 + d.getMonth();
    min = Math.min(min, idx);
    max = Math.max(max, idx);
    counts.set(String(idx), (counts.get(String(idx)) ?? 0) + 1);
  }
  const out: MonthCount[] = [];
  for (let i = min; i <= max; i++) {
    const year = Math.floor(i / 12);
    const month = i % 12;
    out.push({ key: `${year}-${String(month + 1).padStart(2, '0')}`, year, month, count: counts.get(String(i)) ?? 0 });
  }
  return out;
}

/** Watches per hour of day (local time). */
export function watchesByHour(watches: WatchEvent[]): number[] {
  const hours = Array.from({ length: 24 }, () => 0);
  for (const w of watches) if (!w.isAd) hours[new Date(w.time).getHours()]!++;
  return hours;
}

export function hourLabel(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

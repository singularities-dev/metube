/** Explore's "When" filter: preset windows or a custom date range. */

export type TimePreset = 'any' | 'day' | 'week' | 'month' | 'year' | 'custom';

/** In menu order; the UI words them (any time, past day … custom range). */
export const TIME_PRESETS: TimePreset[] = ['any', 'day', 'week', 'month', 'year', 'custom'];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const SPAN: Record<Exclude<TimePreset, 'any' | 'custom'>, number> = { day: DAY, week: 7 * DAY, month: 30 * DAY, year: 365 * DAY };

/** Local midnight of a YYYY-MM-DD date input value, or undefined if it isn't one. */
function localDay(value: string, addDays = 0): number | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return undefined;
  const t = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + addDays).getTime();
  return Number.isNaN(t) ? undefined : t;
}

/**
 * The publish window for a preset (epoch ms; after inclusive, before exclusive).
 * Presets round down to the hour so a search for "Past week" stays cacheable.
 * Custom dates are whole local days, both ends included; either may be blank.
 */
export function timeWindow(preset: TimePreset, custom: { from: string; to: string }, now = Date.now()): { after?: number; before?: number } {
  if (preset === 'any') return {};
  if (preset === 'custom') {
    let after = localDay(custom.from);
    let before = localDay(custom.to, 1);
    if (after !== undefined && before !== undefined && after >= before) [after, before] = [localDay(custom.to), localDay(custom.from, 1)];
    return { ...(after !== undefined ? { after } : {}), ...(before !== undefined ? { before } : {}) };
  }
  return { after: Math.floor((now - SPAN[preset]) / HOUR) * HOUR };
}

/** Today as a date input value, for the custom range's max. */
export function todayValue(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

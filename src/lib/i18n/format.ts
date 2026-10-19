/** Locale-aware formatting of numbers, dates and times, for the active UI language. */
import type { Locale } from './index.ts';

const DAY = 86_400_000;

/** Local midnight at the start of the day `t` falls on. */
const startOfDay = (t: number) => new Date(t).setHours(0, 0, 0, 0);

export interface Format {
  locale: Locale;
  /** 12,345 / 12 345 / 12.345 */
  number(n: number): string;
  /** 1.2M / 1,2 M / 1,2 Mio. */
  compact(n: number): string;
  /**
   * The count to choose a plural form for a compact number. CLDR treats "1,2 M"
   * like an exact million (French and Spanish then say "1,2 M de vues"), which
   * plain plural rules on 1,200,000 don't know. Goes by what compact() shows,
   * so 999,960 rounded up to "1 M" counts as a million too.
   */
  compactPluralCount(n: number): number;
  /** 19 Oct 2026, in the locale's order. */
  date(t: number): string;
  /** "Oct 2026" style label for a month (0–11). */
  monthYear(year: number, month: number): string;
  /** Short month name (0–11). */
  month(month: number): string;
  /** Short weekday name, 0 = Sunday. */
  weekday(day: number): string;
  /**
   * "today", "yesterday", "3 days ago" by calendar day in the local time zone;
   * then "1 month ago", "2 months ago", "1 year ago" by elapsed time (30-day
   * months), never "last month" or "last year", which name calendar periods.
   */
  ago(t: number, now?: number): string;
  /** "a, b and c" in the locale. */
  list(items: string[]): string;
  /**
   * A length spoken in words, such as "3 minutes, 45 seconds" or "1 hour, 2
   * minutes and 3 seconds", for screen readers (a clock string like "3:45"
   * reads as a time of day). Zero parts are left out; under a minute is seconds.
   */
  duration(seconds: number): string;
  /** Upper-cases the first letter, the locale's way. */
  capitalise(s: string): string;
}

export function makeFormat(locale: Locale): Format {
  const num = new Intl.NumberFormat(locale);
  const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
  const oneMillion = compact.format(1_000_000);
  const date = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  const monthYear = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' });
  const month = new Intl.DateTimeFormat(locale, { month: 'short' });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // "auto" gives today/yesterday (and the day before yesterday where a language has a word for it).
  const relDays = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const rel = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  const list = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
  const [hours, minutes, seconds] = (['hour', 'minute', 'second'] as const).map(
    (unit) => new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' }),
  ) as [Intl.NumberFormat, Intl.NumberFormat, Intl.NumberFormat];
  const units = new Intl.ListFormat(locale, { style: 'long', type: 'unit' });
  return {
    locale,
    number: (n) => num.format(n),
    compact: (n) => compact.format(n),
    compactPluralCount: (n) => (Math.abs(n) >= 1_000_000 || compact.format(Math.abs(n)) === oneMillion ? 1_000_000 : n),
    date: (t) => date.format(t),
    monthYear: (y, m) => monthYear.format(new Date(y, m, 1)),
    month: (m) => month.format(new Date(2026, m, 1)),
    // 4 January 2026 was a Sunday.
    weekday: (d) => weekday.format(new Date(2026, 0, 4 + d)),
    ago: (t, now = Date.now()) => {
      const elapsed = Math.floor((now - t) / DAY);
      if (elapsed < 30) {
        // Calendar days, so "yesterday" is the previous date; rounding absorbs daylight-saving shifts.
        const days = Math.round((startOfDay(now) - startOfDay(t)) / DAY);
        return relDays.format(-Math.max(0, days), 'day');
      }
      const months = Math.floor(elapsed / 30);
      return months < 12 ? rel.format(-months, 'month') : rel.format(-Math.floor(months / 12), 'year');
    },
    list: (items) => list.format(items),
    duration: (total) => {
      const s = Math.max(0, Math.round(total));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const parts = [h ? hours.format(h) : '', m ? minutes.format(m) : '', s % 60 ? seconds.format(s % 60) : ''].filter(Boolean);
      return units.format(parts.length ? parts : [seconds.format(0)]);
    },
    capitalise: (s) => s.charAt(0).toLocaleUpperCase(locale) + s.slice(1),
  };
}

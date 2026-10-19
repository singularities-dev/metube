/**
 * Parses Takeout HTML timestamps such as "Oct 17, 2026, 10:16:57 AM SAST".
 *
 * Takeout writes these in the account's language and with a timezone
 * abbreviation rather than an offset. We support English month names and a
 * table of common abbreviations; anything unknown returns null so the caller
 * can count it as skipped instead of guessing. The JSON export uses ISO times
 * in every language, so the import page recommends it (import.intro).
 */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

/** Offsets in minutes east of UTC. */
const TZ_OFFSETS: Record<string, number> = {
  UTC: 0, GMT: 0, BST: 60, IST: 330, CET: 60, CEST: 120, EET: 120, EEST: 180,
  SAST: 120, WAT: 60, CAT: 120, EAT: 180,
  EST: -300, EDT: -240, CST: -360, CDT: -300, MST: -420, MDT: -360, PST: -480, PDT: -420,
  AEST: 600, AEDT: 660, ACST: 570, AWST: 480, NZST: 720, NZDT: 780, JST: 540, KST: 540, SGT: 480, HKT: 480,
};

const PATTERN =
  /([A-Za-z]{3,4})\.?\s+(\d{1,2}),\s+(\d{4}),\s+(\d{1,2}):(\d{2}):(\d{2})\s*([AP]M)\s+((?:GMT|UTC)[+-]\d{1,2}(?::\d{2})?|[A-Z]{2,5})/;

/** Abbreviations that mean different zones; resolved by the browser's own time zone. */
const AMBIGUOUS: Record<string, Record<string, number>> = {
  // India Standard Time by default; Irish Standard Time (summer) in Ireland.
  IST: { 'Europe/Dublin': 60 },
};

function localTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/**
 * `timeZone` is the importing browser's IANA zone. Takeout writes timestamps in
 * the account's zone, which is almost always the user's own, so it settles
 * ambiguous abbreviations such as IST.
 */
export function parseTakeoutDate(raw: string, timeZone = localTimeZone()): number | null {
  // Takeout uses narrow no-break spaces (U+202F) and no-break spaces before AM/PM.
  const text = raw.replace(/[  ]/g, ' ').trim();
  const m = PATTERN.exec(text);
  if (!m) return null;
  // Every group in PATTERN is required, so a match always fills all eight.
  const [mon, day, year, hh, mm, ss, ampm, tz] = m.slice(1) as [string, string, string, string, string, string, string, string];
  const month = MONTHS[mon.toLowerCase()];
  if (month === undefined) return null;

  let offset: number | undefined = (timeZone ? AMBIGUOUS[tz]?.[timeZone] : undefined) ?? TZ_OFFSETS[tz];
  if (offset === undefined) {
    const g = /^(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?$/.exec(tz);
    if (!g) return null;
    offset = (g[1] === '-' ? -1 : 1) * (Number(g[2]) * 60 + Number(g[3] ?? 0));
  }

  let hour = Number(hh) % 12;
  if (ampm === 'PM') hour += 12;
  const utc = Date.UTC(Number(year), month, Number(day), hour, Number(mm), Number(ss));
  return utc - offset * 60_000;
}

/**
 * Parsers for the HTML variant of Takeout's YouTube history
 * (watch-history.html, search-history.html).
 *
 * Pure string parsing, so it runs the same in the extension page, a worker and
 * tests (no DOMParser needed). Each activity sits in an "outer-cell" block whose
 * first body cell holds: action text, links, then the timestamp.
 */
import { parseTakeoutDate } from './date.ts';
import type { ParseResult, SearchEvent, WatchEvent } from './types.ts';

const CELL_SPLIT = '<div class="outer-cell';
const BODY = /<div class="content-cell[^"]*mdl-typography--body-1">([\s\S]*?)<\/div>/;
const LINK = /<a href="([^"]+)">([\s\S]*?)<\/a>/g;

export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function* bodies(html: string): Generator<string> {
  const parts = html.split(CELL_SPLIT);
  for (let i = 1; i < parts.length; i++) {
    const m = BODY.exec(parts[i] ?? '');
    yield m?.[1] ?? '';
  }
}

/** The timestamp is the last <br>-separated segment that parses as a date. */
function timeOf(body: string): number | null {
  const segments = body.split('<br>').map((s) => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const t = parseTakeoutDate(segments[i] ?? '');
    if (t !== null) return t;
  }
  return null;
}

export function videoIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('youtu.be')) return u.pathname.slice(1) || null;
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

/**
 * What a YouTube link in a history entry points at: a video (a watch) or a
 * results page (a search). Link targets are the same whatever the account's
 * language, unlike file names and entry wording.
 */
export function youTubeLinkKind(url: string): 'watch' | 'search' | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!/(^|\.)(youtube\.com|youtu\.be)$/.test(u.hostname)) return null;
  if (u.pathname === '/results' && u.searchParams.has('search_query')) return 'search';
  return videoIdFromUrl(url) ? 'watch' : null;
}

/** The query of a YouTube results link, decoded ("lofi+beats" → "lofi beats"). */
export function searchQueryFromUrl(url: string): string | null {
  if (youTubeLinkKind(url) !== 'search') return null;
  return new URL(url).searchParams.get('search_query')?.trim() || null;
}

/** Whether a file holds watch or search history, by the links in its first entries; null if it isn't YouTube history. */
export function historyKind(links: Iterable<string>, sample = 50): 'watch' | 'search' | null {
  let watch = 0;
  let search = 0;
  for (const url of links) {
    const kind = youTubeLinkKind(url);
    if (kind === 'watch') watch++;
    else if (kind === 'search') search++;
    if (watch + search >= sample) break;
  }
  if (!watch && !search) return null;
  return search > watch ? 'search' : 'watch';
}

/** Watch or search history, for Takeout's HTML activity pages in any language; null for anything else. */
export function htmlHistoryKind(html: string): 'watch' | 'search' | null {
  if (!html.includes(CELL_SPLIT)) return null;
  function* hrefs() {
    for (const m of html.matchAll(/<a href="([^"]+)">/g)) yield decodeEntities(m[1] ?? '');
  }
  return historyKind(hrefs());
}

export function channelIdFromUrl(url: string): string | null {
  const m = /\/channel\/([A-Za-z0-9_-]+)/.exec(url);
  return m?.[1] ?? null;
}

interface Link {
  href: string;
  text: string;
}

function linksOf(body: string): Link[] {
  return [...body.matchAll(LINK)].map((m) => ({ href: decodeEntities(m[1] ?? ''), text: decodeEntities(m[2] ?? '').trim() }));
}

export function parseWatchHistoryHtml(html: string): ParseResult<WatchEvent> {
  const items: WatchEvent[] = [];
  let skipped = 0;
  for (const body of bodies(html)) {
    const links = linksOf(body);
    const video = links.find((l) => l.href.includes('watch?v=') || l.href.includes('youtu.be/'));
    const channel = links.find((l) => l.href.includes('/channel/'));
    const videoId = video ? videoIdFromUrl(video.href) : null;
    const time = timeOf(body);
    if (!video || !videoId || time === null) {
      skipped++;
      continue;
    }
    items.push({
      videoId,
      // Removed or private videos show their URL as the title.
      title: video.text.startsWith('http') ? null : video.text,
      channelId: channel ? channelIdFromUrl(channel.href) : null,
      channelTitle: channel ? channel.text : null,
      time,
      isAd: false,
    });
  }
  return { items, skipped };
}

export function parseSearchHistoryHtml(html: string): ParseResult<SearchEvent> {
  const items: SearchEvent[] = [];
  let skipped = 0;
  for (const body of bodies(html)) {
    const link = linksOf(body).find((l) => l.href.includes('search_query='));
    const time = timeOf(body);
    if (!link || time === null) {
      skipped++;
      continue;
    }
    const query = link.text;
    if (query) items.push({ query, time });
    else skipped++;
  }
  return { items, skipped };
}

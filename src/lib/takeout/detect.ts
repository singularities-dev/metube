/**
 * Routes a Takeout file to the right parser by what it holds. Takeout names
 * files, columns and entries in the Google account's language, so the links,
 * channel pages and video IDs inside decide; English file names only settle
 * files too empty to tell. Unrelated Takeout files (channel settings,
 * comments, images…) are reported as ignored rather than failing the import.
 */
import { csvKind, parsePlaylistVideosCsv, parseSubscriptionsCsv, playlistTitleFallback, playlistTitleFromFileName } from './csv.ts';
import { htmlHistoryKind, parseSearchHistoryHtml, parseWatchHistoryHtml } from './html.ts';
import { jsonHistoryKind, parseSearchHistoryJson, parseWatchHistoryJson } from './json.ts';
import type { ParseResult, PlaylistItem, SearchEvent, Subscription, WatchEvent } from './types.ts';

export type ParsedFile =
  | { kind: 'watch'; result: ParseResult<WatchEvent> }
  | { kind: 'search'; result: ParseResult<SearchEvent> }
  | { kind: 'subscriptions'; result: ParseResult<Subscription> }
  | { kind: 'playlist'; result: ParseResult<PlaylistItem> }
  | { kind: 'ignored'; reason: string };

const baseName = (fileName: string) => (fileName.split(/[\\/]/).pop() ?? fileName).toLowerCase();

/**
 * Cheap name-only check, used before reading a file so a folder pick never
 * loads video files. Any language's history, subscription and playlist files
 * are HTML, JSON or CSV; what they hold is checked once they're read.
 */
export function isTakeoutCandidate(fileName: string): boolean {
  return /\.(html|json|csv)$/.test(baseName(fileName));
}

/** Watch or search history by the English file name, for files with no entries to go by. */
function historyByName(name: string, ext: 'html' | 'json'): 'watch' | 'search' | null {
  if (name.endsWith(`watch-history.${ext}`)) return 'watch';
  if (name.endsWith(`search-history.${ext}`)) return 'search';
  return null;
}

export function parseTakeoutFile(fileName: string, text: string): ParsedFile {
  const name = baseName(fileName);

  if (name.endsWith('.html')) {
    const kind = htmlHistoryKind(text) ?? historyByName(name, 'html');
    if (kind === 'watch') return { kind, result: parseWatchHistoryHtml(text) };
    if (kind === 'search') return { kind, result: parseSearchHistoryHtml(text) };
  } else if (name.endsWith('.json')) {
    const data = safeJson(text);
    const kind = jsonHistoryKind(data) ?? historyByName(name, 'json');
    if (kind === 'watch') return { kind, result: parseWatchHistoryJson(data) };
    if (kind === 'search') return { kind, result: parseSearchHistoryJson(data) };
  } else if (name.endsWith('.csv')) {
    const englishPlaylist = playlistTitleFromFileName(fileName);
    const kind = csvKind(text) ?? (name.endsWith('subscriptions.csv') ? 'subscriptions' : englishPlaylist ? 'playlist' : null);
    if (kind === 'subscriptions') return { kind, result: parseSubscriptionsCsv(text) };
    if (kind === 'playlist') return { kind, result: parsePlaylistVideosCsv(text, englishPlaylist ?? playlistTitleFallback(fileName)) };
  }

  return { kind: 'ignored', reason: 'Not a history, subscriptions or playlist file' };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

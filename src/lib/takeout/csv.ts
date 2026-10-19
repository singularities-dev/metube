/** CSV readers for Takeout's subscriptions and playlist exports. */
import type { ParseResult, PlaylistItem, Subscription } from './types.ts';

/** RFC 4180-style parser: quoted fields, escaped quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== '')) rows.push(row);
  return rows;
}

/*
 * Takeout names CSV columns in the account's language ("Channel Id", "Kanal-ID",
 * "ID de la chaîne"…). English names are used when present; otherwise columns
 * are found by what they hold.
 */
/** A channel's page, as Takeout writes it in subscriptions.csv. */
const CHANNEL_URL = /^https?:\/\/(?:www\.)?youtube\.com\/channel\/(UC[\w-]+)\/?$/;
const CHANNEL_ID = /^UC[\w-]{10,}$/;
const VIDEO_ID = /^[\w-]{11}$/;
/** Enough rows to tell columns apart without scanning a whole file. */
const SAMPLE = 20;

/** The first column (not in `skip`) whose value matches in every sampled row; -1 if none. */
function columnWhere(rows: string[][], test: (value: string) => boolean, skip: number[] = []): number {
  const sample = rows.slice(0, SAMPLE);
  if (!sample.length) return -1;
  const width = Math.max(...sample.map((r) => r.length));
  for (let i = 0; i < width; i++) {
    if (!skip.includes(i) && sample.every((r) => test((r[i] ?? '').trim()))) return i;
  }
  return -1;
}

/** The header (lower-cased) and the data rows. */
function table(text: string): { keys: string[]; rows: string[][] } {
  const [header = [], ...rows] = parseCsv(text);
  return { keys: header.map((h) => h.trim().toLowerCase()), rows };
}

/** The English column, or the one whose values pass `test`. */
function column(keys: string[], rows: string[][], english: string, test: (value: string) => boolean, skip: number[] = []): number {
  const i = keys.indexOf(english);
  return i >= 0 ? i : columnWhere(rows, test, skip);
}

/**
 * What a Takeout CSV holds, by its values: channel pages mean subscriptions; a
 * short file of video IDs means a playlist. Null when it can't tell (an empty
 * file, or an unrelated one such as comments or channel settings).
 */
export function csvKind(text: string): 'subscriptions' | 'playlist' | null {
  const { keys, rows } = table(text);
  if (columnWhere(rows, (v) => CHANNEL_URL.test(v)) >= 0) return 'subscriptions';
  // Playlists have a video ID and when it was added; comments and uploads also hold video IDs, but in many more columns.
  if (keys.length <= 3 && columnWhere(rows, (v) => VIDEO_ID.test(v)) >= 0) return 'playlist';
  return null;
}

export function parseSubscriptionsCsv(text: string): ParseResult<Subscription> {
  const { keys, rows } = table(text);
  const urlCol = column(keys, rows, 'channel url', (v) => CHANNEL_URL.test(v));
  const idCol = column(keys, rows, 'channel id', (v) => CHANNEL_ID.test(v), [urlCol]);
  const englishTitle = keys.indexOf('channel title');
  const titleCol = englishTitle >= 0 ? englishTitle : keys.findIndex((_, i) => i !== idCol && i !== urlCol);
  const items: Subscription[] = [];
  let skipped = 0;
  for (const r of rows) {
    const cell = (i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');
    const channelId = cell(idCol) || CHANNEL_URL.exec(cell(urlCol))?.[1] || '';
    if (!channelId) { skipped++; continue; }
    items.push({ channelId, channelTitle: cell(titleCol) || channelId });
  }
  return { items, skipped };
}

/** Per-playlist CSVs ("Watch later-videos.csv"); the playlist title comes from the file name. */
export function parsePlaylistVideosCsv(text: string, playlistTitle: string): ParseResult<PlaylistItem> {
  const { keys, rows } = table(text);
  const videoCol = column(keys, rows, 'video id', (v) => VIDEO_ID.test(v));
  const timeCol = column(keys, rows, 'playlist video creation timestamp', (v) => !Number.isNaN(Date.parse(v)), [videoCol]);
  const items: PlaylistItem[] = [];
  let skipped = 0;
  for (const r of rows) {
    const cell = (i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');
    const videoId = cell(videoCol);
    if (!videoId) { skipped++; continue; }
    const t = Date.parse(cell(timeCol));
    items.push({ playlistTitle, videoId, addedAt: Number.isNaN(t) ? null : t });
  }
  return { items, skipped };
}

/** "Watch later-videos.csv" → "Watch later". Also strips upload-prefix hashes like "aafd4b15-". */
export function playlistTitleFromFileName(name: string): string | null {
  const base = name.split(/[\\/]/).pop() ?? name;
  const m = /^(?:[0-9a-f]{8}-)?(.+)-videos\.csv$/i.exec(base);
  return m?.[1] ?? null;
}

/** A playlist's title from a file name Takeout wrote in another language: the name without its extension. */
export function playlistTitleFallback(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? name;
  return base.replace(/^[0-9a-f]{8}-/i, '').replace(/\.csv$/i, '');
}

/**
 * Parsers for the JSON variant of Takeout's YouTube history. Each entry looks like
 * { title: "Watched <title>", titleUrl, subtitles?: [{ name, url }], time: ISO,
 *   details?: [{ name: "From Google Ads" }] }.
 *
 * Takeout words `title` in the account's language ("Watched …", "Has visto …",
 * "… angesehen"), so everything is read from the language-neutral fields:
 * links and ISO times. Only the English "Watched " is stripped from titles;
 * other titles are left out, and the YouTube API fills them in.
 */
import { channelIdFromUrl, historyKind, searchQueryFromUrl, videoIdFromUrl } from './html.ts';
import type { ParseResult, SearchEvent, WatchEvent } from './types.ts';

interface JsonEntry {
  title?: string;
  titleUrl?: string;
  subtitles?: { name?: string; url?: string }[];
  time?: string;
  details?: { name?: string }[];
}

/** The text after an English prefix, or '' when the title is worded another way. */
function afterPrefix(title: string | undefined, prefix: RegExp): string {
  return title && prefix.test(title) ? title.replace(prefix, '').trim() : '';
}

const entries = (data: unknown): JsonEntry[] =>
  (Array.isArray(data) ? data : []).filter((e): e is JsonEntry => typeof e === 'object' && e !== null);

/** Watch or search history, by the entries' links (any language); null if this isn't YouTube history. */
export function jsonHistoryKind(data: unknown): 'watch' | 'search' | null {
  function* links() {
    for (const e of entries(data)) if (typeof e.titleUrl === 'string') yield e.titleUrl;
  }
  return historyKind(links());
}

export function parseWatchHistoryJson(data: unknown): ParseResult<WatchEvent> {
  const items: WatchEvent[] = [];
  let skipped = 0;
  for (const e of entries(data)) {
    const videoId = e.titleUrl ? videoIdFromUrl(e.titleUrl) : null;
    const time = e.time ? Date.parse(e.time) : NaN;
    if (!videoId || Number.isNaN(time)) {
      skipped++;
      continue;
    }
    const title = afterPrefix(e.title, /^Watched\s+/);
    const ch = e.subtitles?.[0];
    items.push({
      videoId,
      title: !title || title.startsWith('http') ? null : title,
      channelId: ch?.url ? channelIdFromUrl(ch.url) : null,
      channelTitle: ch?.name ?? null,
      time,
      isAd: !!e.details?.some((d) => d.name?.includes('Google Ads')),
    });
  }
  return { items, skipped };
}

export function parseSearchHistoryJson(data: unknown): ParseResult<SearchEvent> {
  const items: SearchEvent[] = [];
  let skipped = 0;
  for (const e of entries(data)) {
    const time = e.time ? Date.parse(e.time) : NaN;
    // The link holds the query in any language; the English title is a fallback for entries without one.
    const query = (e.titleUrl ? searchQueryFromUrl(e.titleUrl) : null) ?? afterPrefix(e.title, /^Searched for\s+/);
    if (!query || Number.isNaN(time) || e.details?.some((d) => d.name?.includes('Google Ads'))) {
      skipped++;
      continue;
    }
    items.push({ query, time });
  }
  return { items, skipped };
}

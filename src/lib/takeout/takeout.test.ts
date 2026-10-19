import { describe, expect, test } from 'vitest';
import { parseTakeoutDate } from './date.ts';
import { parseSearchHistoryHtml, parseWatchHistoryHtml } from './html.ts';
import { parseSearchHistoryJson, parseWatchHistoryJson } from './json.ts';
import { parseCsv, parsePlaylistVideosCsv, parseSubscriptionsCsv, playlistTitleFromFileName } from './csv.ts';
import { isTakeoutCandidate, parseTakeoutFile } from './detect.ts';

// Synthetic fixtures that mirror the real Takeout markup (values are made up).
const cell = (body: string) =>
  `<div class="outer-cell mdl-cell mdl-cell--12-col mdl-shadow--2dp"><div class="mdl-grid"><div class="header-cell mdl-cell mdl-cell--12-col"><p class="mdl-typography--title">YouTube<br></p></div><div class="content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1">${body}</div><div class="content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1 mdl-typography--text-right"></div><div class="content-cell mdl-cell mdl-cell--12-col mdl-typography--caption"><b>Products:</b><br>&emsp;YouTube<br></div></div></div>`;

const WATCH_HTML = `<html><body><div class="mdl-grid">${[
  cell('Watched <a href="https://www.youtube.com/watch?v=abc123DEF45">Rock &amp; Roll &#39;Live&#39;</a><br><a href="https://www.youtube.com/channel/UCchannel0001">Some Channel</a><br>Oct 17, 2026, 10:16:57 AM SAST<br>'),
  cell('Watched <a href="https://www.youtube.com/watch?v=gone0000000">https://www.youtube.com/watch?v=gone0000000</a><br>Sep 27, 2026, 10:55:46 PM SAST<br>'),
  cell('Watched something odd<br>not a date<br>'),
].join('')}</div></body></html>`;

const SEARCH_HTML = cell(
  'Searched for <a href="https://www.youtube.com/results?search_query=edm+female+vocals">edm female vocals</a><br>Oct 14, 2026, 3:17:22 PM SAST<br>',
);

describe('parseTakeoutDate', () => {
  test('IST is India unless the browser is in Ireland', () => {
    expect(new Date(parseTakeoutDate('Jun 1, 2026, 12:00:00 PM IST', 'Asia/Kolkata')!).toISOString()).toBe('2026-06-01T06:30:00.000Z');
    expect(new Date(parseTakeoutDate('Jun 1, 2026, 12:00:00 PM IST', 'Europe/Dublin')!).toISOString()).toBe('2026-06-01T11:00:00.000Z');
  });
  test('converts SAST to UTC', () => {
    expect(new Date(parseTakeoutDate('Oct 17, 2026, 10:16:57 AM SAST')!).toISOString()).toBe('2026-10-17T08:16:57.000Z');
  });
  test('handles 12 AM/PM and GMT offsets', () => {
    expect(new Date(parseTakeoutDate('Jan 1, 2026, 12:00:00 AM UTC')!).toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(new Date(parseTakeoutDate('Jan 1, 2026, 12:30:00 PM GMT+2')!).toISOString()).toBe('2026-01-01T10:30:00.000Z');
  });
  test('returns null for unknown formats', () => {
    expect(parseTakeoutDate('17 Okt. 2026, 10:16:57 SAST')).toBeNull();
    expect(parseTakeoutDate('Oct 17, 2026, 10:16:57 AM XYZT')).toBeNull();
  });
});

describe('HTML history', () => {
  test('watch history: entities, removed videos, skips', () => {
    const { items, skipped } = parseWatchHistoryHtml(WATCH_HTML);
    expect(skipped).toBe(1);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      videoId: 'abc123DEF45',
      title: "Rock & Roll 'Live'",
      channelId: 'UCchannel0001',
      channelTitle: 'Some Channel',
      isAd: false,
    });
    expect(items[1]).toMatchObject({ videoId: 'gone0000000', title: null, channelId: null });
  });
  test('search history', () => {
    const { items } = parseSearchHistoryHtml(SEARCH_HTML);
    expect(items).toEqual([{ query: 'edm female vocals', time: Date.parse('2026-10-14T13:17:22Z') }]);
  });
});

describe('JSON history', () => {
  test('watch history with ads flagged', () => {
    const { items, skipped } = parseWatchHistoryJson([
      {
        title: 'Watched Lo-fi beats',
        titleUrl: 'https://www.youtube.com/watch?v=lofi0000001',
        subtitles: [{ name: 'Chill Ch', url: 'https://www.youtube.com/channel/UCchill' }],
        time: '2026-10-01T10:00:00.000Z',
      },
      { title: 'Watched Buy now', titleUrl: 'https://www.youtube.com/watch?v=ad000000001', time: '2026-10-01T10:01:00Z', details: [{ name: 'From Google Ads' }] },
      { title: 'Visited something' },
    ]);
    expect(skipped).toBe(1);
    expect(items[0]).toMatchObject({ title: 'Lo-fi beats', channelId: 'UCchill', isAd: false });
    expect(items[1]?.isAd).toBe(true);
  });
  test('search history strips prefix', () => {
    const { items } = parseSearchHistoryJson([{ title: 'Searched for dark souls lore', time: '2026-10-01T10:00:00Z' }]);
    expect(items[0]?.query).toBe('dark souls lore');
  });
  test('search queries come from the link when there is one', () => {
    const { items } = parseSearchHistoryJson([
      { title: 'Has buscado lofi', titleUrl: 'https://www.youtube.com/results?search_query=lofi+%26+jazz', time: '2026-10-01T10:00:00Z' },
    ]);
    expect(items[0]?.query).toBe('lofi & jazz');
  });
});

describe('CSV', () => {
  test('quoted fields and CRLF', () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n')).toEqual([['a', 'b'], ['x, y', 'say "hi"']]);
  });
  test('subscriptions', () => {
    const { items } = parseSubscriptionsCsv('Channel Id,Channel Url,Channel Title\nUC1,http://x/UC1,Name One \n\n');
    expect(items).toEqual([{ channelId: 'UC1', channelTitle: 'Name One' }]);
  });
  test('playlist videos and title from file name', () => {
    expect(playlistTitleFromFileName('aafd4b15-Watch_later-videos.csv')).toBe('Watch_later');
    expect(playlistTitleFromFileName('Watch later-videos.csv')).toBe('Watch later');
    const { items } = parsePlaylistVideosCsv('Video ID,Playlist Video Creation Timestamp\nv1,2026-08-29T22:23:57+00:00\n', 'Watch later');
    expect(items[0]).toEqual({ playlistTitle: 'Watch later', videoId: 'v1', addedAt: Date.parse('2026-08-29T22:23:57Z') });
  });
});

describe('parseTakeoutFile', () => {
  test('routes by name and ignores unrelated files', () => {
    expect(parseTakeoutFile('Takeout/YouTube/history/watch-history.html', WATCH_HTML).kind).toBe('watch');
    expect(parseTakeoutFile('x-search-history.html', SEARCH_HTML).kind).toBe('search');
    expect(parseTakeoutFile('channel_images.csv', 'a,b').kind).toBe('ignored');
  });
  test('name pre-filter keeps text files in any language and skips videos', () => {
    expect(isTakeoutCandidate('YouTube/history/watch-history.html')).toBe(true);
    expect(isTakeoutCandidate('Watch later-videos.csv')).toBe(true);
    expect(isTakeoutCandidate('subscriptions.csv')).toBe(true);
    expect(isTakeoutCandidate('YouTube und YouTube Music/Verlauf/Wiedergabeverlauf.json')).toBe(true);
    expect(isTakeoutCandidate('videos/My holiday.mp4')).toBe(false);
    expect(isTakeoutCandidate('channel_images.png')).toBe(false);
  });

  test('unrelated CSVs are read but ignored: settings, comments, uploads', () => {
    expect(parseTakeoutFile('channel_feature_data.csv', 'Channel ID,Channel Feature\nUCxxxxxxxxxxxxxxxxxxxxxx,on\n').kind).toBe('ignored');
    expect(parseTakeoutFile(
      'comments.csv',
      'Comment ID,Channel ID,Comment Create Timestamp,Price,Parent Comment ID,Post ID,Video ID,Comment Text\nUgz1,UCxxxxxxxxxxxxxxxxxxxxxx,2026-01-01T00:00:00Z,0,,,abc123DEF45,hi\n',
    ).kind).toBe('ignored');
  });
});

describe('a German Takeout export', () => {
  // Takeout names files, columns and entries in the account's language; links, IDs and ISO times don't change.
  const watch = JSON.stringify([
    {
      header: 'YouTube',
      title: 'Lo-fi beats angesehen',
      titleUrl: 'https://www.youtube.com/watch?v=lofi0000001',
      subtitles: [{ name: 'Chill Ch', url: 'https://www.youtube.com/channel/UCchill' }],
      time: '2026-10-01T10:00:00.000Z',
    },
    { header: 'YouTube', title: 'Ein entferntes Video angesehen', time: '2026-10-01T09:00:00.000Z' },
  ]);
  const search = JSON.stringify([
    { header: 'YouTube', title: 'Gesucht nach: lofi beats', titleUrl: 'https://www.youtube.com/results?search_query=lofi+beats', time: '2026-10-01T10:00:00Z' },
  ]);

  test('history JSON is routed by its links, and localised wording never leaks in', () => {
    const w = parseTakeoutFile('Takeout/YouTube und YouTube Music/Verlauf/Wiedergabeverlauf.json', watch);
    expect(w.kind).toBe('watch');
    if (w.kind !== 'watch') return;
    expect(w.result.skipped).toBe(1);
    // The localised title can't be cleaned reliably; the YouTube API fills it in.
    expect(w.result.items[0]).toMatchObject({ videoId: 'lofi0000001', title: null, channelId: 'UCchill', channelTitle: 'Chill Ch' });

    const s = parseTakeoutFile('Takeout/YouTube und YouTube Music/Verlauf/Suchverlauf.json', search);
    expect(s.kind).toBe('search');
    if (s.kind === 'search') expect(s.result.items).toEqual([{ query: 'lofi beats', time: Date.parse('2026-10-01T10:00:00Z') }]);
  });

  test('HTML history is routed by its links too', () => {
    const html = cell('<a href="https://www.youtube.com/watch?v=abc123DEF45">Rock</a> angesehen<br><a href="https://www.youtube.com/channel/UCchannel0001">Kanal</a><br>17.10.2026, 10:16:57 MESZ<br>');
    expect(parseTakeoutFile('Wiedergabeverlauf.html', html).kind).toBe('watch');
    expect(parseTakeoutFile('Suchverlauf.html', cell('<a href="https://www.youtube.com/results?search_query=lofi">lofi</a> gesucht<br>')).kind).toBe('search');
  });

  test('subscriptions and playlists are found by their values, whatever the headers say', () => {
    const subs = parseTakeoutFile(
      'Abos/Abos.csv',
      'Kanal-ID,Kanal-URL,Kanaltitel\nUCsample0000000000cycling,http://www.youtube.com/channel/UCsample0000000000cycling,Sample Cycling\n',
    );
    expect(subs).toEqual({ kind: 'subscriptions', result: { items: [{ channelId: 'UCsample0000000000cycling', channelTitle: 'Sample Cycling' }], skipped: 0 } });

    const later = parseTakeoutFile('Playlists/Später ansehen-Videos.csv', 'Video-ID,Zeitstempel der Erstellung des Playlist-Videos\nabc123DEF45,2026-08-29T22:23:57+00:00\n');
    expect(later).toEqual({
      kind: 'playlist',
      result: { items: [{ playlistTitle: 'Später ansehen', videoId: 'abc123DEF45', addedAt: Date.parse('2026-08-29T22:23:57Z') }], skipped: 0 },
    });
    const other = parseTakeoutFile('Playlists/Musik.csv', 'Video-ID,Zeitstempel\nabc123DEF45,2026-08-29T22:23:57+00:00\n');
    expect(other.kind === 'playlist' && other.result.items[0]?.playlistTitle).toBe('Musik');
  });
});

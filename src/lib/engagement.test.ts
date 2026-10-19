import 'fake-indexeddb/auto';
import { describe, expect, test } from 'vitest';
import { channelEngagement, recencyWeight, searchTerms, suggestableTerms } from './engagement.ts';
import { clearImportedData, loadAll, openMeTubeDB, saveImport } from './db.ts';
import { buildImportBatch } from './takeout/import.ts';
import type { WatchEvent } from './takeout/types.ts';

const NOW = Date.parse('2026-10-17T12:00:00Z');
const DAY = 86_400_000;
const w = (videoId: string, channelId: string | null, daysAgo: number, isAd = false): WatchEvent => ({
  videoId, title: videoId, channelId, channelTitle: channelId, time: NOW - daysAgo * DAY, isAd,
});

describe('engagement', () => {
  test('recency halves every half-life', () => {
    expect(recencyWeight(NOW, NOW)).toBe(1);
    expect(recencyWeight(NOW - 180 * DAY, NOW)).toBeCloseTo(0.5);
  });

  test('ranks recent, rewatched and subscribed channels higher; ignores ads and removed videos', () => {
    const result = channelEngagement(
      [
        w('old1', 'UCold', 720), w('old2', 'UCold', 720), w('old3', 'UCold', 720),
        w('new1', 'UCnew', 1), w('new1', 'UCnew', 2),
        w('ad', 'UCad', 0, true),
        w('gone', null, 0),
      ],
      [{ channelId: 'UCsub', channelTitle: 'Sub only' }],
      NOW,
    );
    expect(result.map((c) => c.channelId)).toEqual(['UCnew', 'UCsub', 'UCold']);
    expect(result[0]).toMatchObject({ watches: 2, uniqueVideos: 1, rewatchedVideos: 1 });
    expect(result.find((c) => c.channelId === 'UCad')).toBeUndefined();
  });

  test('search terms count phrases and words', () => {
    const terms = searchTerms(
      [{ query: 'EDM female vocals', time: NOW }, { query: 'edm  mix', time: NOW - DAY }],
      NOW,
    );
    const edm = terms.find((t) => t.term === 'edm')!;
    expect(edm.count).toBe(2);
    expect(terms.some((t) => t.term === 'edm female vocals')).toBe(true);
  });

  test('function words in French, German and Spanish are not suggested on their own', () => {
    const at = (queries: string[]) => queries.map((query, i) => ({ query, time: NOW - i * DAY }));
    const fr = suggestableTerms(searchTerms(at([
      'comment faire du pain', 'comment réparer un vélo', 'comment apprendre le piano', 'recette de l’eau de pain',
    ]), NOW)).map((t) => t.term);
    expect(fr).not.toContain('comment');
    expect(fr).toContain('pain');
    expect(fr).toContain('comment faire du pain');
    // Elisions are split off, so "l’eau" and "d'un" give the words "eau" and nothing.
    const elided = searchTerms(at(['l’eau de pluie', "le goût d'un café"]), NOW).map((t) => t.term);
    expect(elided).toEqual(expect.arrayContaining(['eau', 'pluie', 'goût', 'café']));
    expect(elided).not.toContain('l’eau');
    expect(elided).not.toContain("d'un");
    const de = suggestableTerms(searchTerms(at([
      'die besten tore', 'die simpsons', 'kuchen backen und dekorieren', 'rezept für brot und butter',
    ]), NOW)).map((t) => t.term);
    expect(de).not.toContain('die');
    expect(de).not.toContain('und');
    expect(de).toContain('kuchen backen und dekorieren');
    const es = suggestableTerms(searchTerms(at(['cómo hacer pan', 'cómo cambiar una rueda', 'música para estudiar', 'ejercicios para correr']), NOW)).map((t) => t.term);
    expect(es).not.toContain('cómo');
    expect(es).not.toContain('para');
  });
});

describe('db', () => {
  test('import is idempotent and clearable', async () => {
    const db = await openMeTubeDB('test-' + Math.random());
    const { batch } = buildImportBatch([
      { name: 'subscriptions.csv', text: 'Channel Id,Channel Url,Channel Title\nUC1,u,One\n' },
      { name: 'Watch later-videos.csv', text: 'Video ID,Playlist Video Creation Timestamp\nv1,2026-01-01T00:00:00+00:00\n' },
      { name: 'channel_images.csv', text: 'x' },
    ]);
    batch.watches.push(w('v1', 'UC1', 1));
    await saveImport(db, batch, NOW);
    await saveImport(db, batch, NOW);
    const all = await loadAll(db);
    expect(all.watches).toHaveLength(1);
    expect(all.subscriptions).toHaveLength(1);
    expect(all.playlistItems).toHaveLength(1);
    expect(all.imports).toHaveLength(2);
    await clearImportedData(db);
    expect((await loadAll(db)).watches).toHaveLength(0);
  });
});

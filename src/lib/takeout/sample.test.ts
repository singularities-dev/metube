import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseTakeoutFile } from './detect';

const read = (f: string) => readFileSync(new URL(`../../../fixtures/takeout-sample/${f}`, import.meta.url), 'utf8');

describe('sample Takeout fixture (for reviewers)', () => {
  it.each([
    ['watch-history.json', 'watch', 60],
    ['search-history.json', 'search', 4],
    ['subscriptions.csv', 'subscriptions', 2],
  ])('%s parses', (file, kind, n) => {
    const r = parseTakeoutFile(file, read(file));
    expect(r.kind).toBe(kind);
    if (r.kind !== 'ignored') expect(r.result.items).toHaveLength(n);
  });
});

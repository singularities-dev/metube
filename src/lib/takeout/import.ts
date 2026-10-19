/** Combines parsed Takeout files into one batch for the database. */
import type { ImportBatch } from '../db.ts';
import { parseTakeoutFile } from './detect.ts';

export interface FileReport {
  name: string;
  kind: string;
  count: number;
  skipped: number;
}

export interface NamedText {
  name: string;
  text: string;
}

export function buildImportBatch(files: NamedText[]): { batch: ImportBatch; reports: FileReport[] } {
  const batch: ImportBatch = { files: [], watches: [], searches: [], subscriptions: [], playlistItems: [], skipped: 0 };
  const reports: FileReport[] = [];

  for (const f of files) {
    const parsed = parseTakeoutFile(f.name, f.text);
    if (parsed.kind === 'ignored') {
      reports.push({ name: f.name, kind: 'ignored', count: 0, skipped: 0 });
      continue;
    }
    batch.files.push(f.name);
    batch.skipped += parsed.result.skipped;
    reports.push({ name: f.name, kind: parsed.kind, count: parsed.result.items.length, skipped: parsed.result.skipped });
    switch (parsed.kind) {
      case 'watch': append(batch.watches, parsed.result.items); break;
      case 'search': append(batch.searches, parsed.result.items); break;
      case 'subscriptions': append(batch.subscriptions, parsed.result.items); break;
      case 'playlist': append(batch.playlistItems, parsed.result.items); break;
    }
  }
  return { batch, reports };
}

/** Spread-free append: large histories can exceed the engine's argument limit. */
function append<T>(target: T[], items: T[]): void {
  for (const item of items) target.push(item);
}

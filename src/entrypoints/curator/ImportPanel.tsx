import { useState } from 'react';
import { buildImportBatch, type FileReport } from '@/lib/takeout/import';
import { isTakeoutCandidate } from '@/lib/takeout/detect';
import { openMeTubeDB, saveImport } from '@/lib/db';
import type { MessageKey } from '@/lib/i18n/catalogs';
import { ErrorText, useI18n } from './i18n';

const KIND_LABEL: Record<string, MessageKey> = {
  watch: 'import.kind.watch',
  search: 'import.kind.search',
  subscriptions: 'import.kind.subscriptions',
  playlist: 'import.kind.playlist',
  ignored: 'import.kind.ignored',
};

export function ImportPanel({ onImported }: { onImported: () => void }) {
  const { t, fmt } = useI18n();
  const [busy, setBusy] = useState(false);
  const [reports, setReports] = useState<FileReport[]>();
  // The outcome rather than its words, so a language switch rewords it.
  const [error, setError] = useState<{ kind: 'none' } | { kind: 'error'; cause: unknown }>();

  async function handle(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true);
    setError(undefined);
    try {
      // Filter by extension first: a Takeout folder can hold gigabytes of uploaded videos.
      const picked = [...list].filter((f) => isTakeoutCandidate(f.name));
      const files = await Promise.all(
        picked.map(async (f) => ({ name: f.webkitRelativePath || f.name, text: await f.text() })),
      );
      const { batch, reports } = buildImportBatch(files);
      if (!batch.files.length) {
        setError({ kind: 'none' });
        return;
      }
      await saveImport(await openMeTubeDB(), batch);
      setReports(reports.filter((r) => r.kind !== 'ignored'));
      onImported();
    } catch (e) {
      setError({ kind: 'error', cause: e });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel glass">
      <h2>{t('import.title')}</h2>
      <p className="muted">{t('import.intro')}</p>
      {/* The inputs stay focusable (visually hidden, not display:none) so the pickers work from the keyboard. */}
      <div className="row">
        <label className="button file-button">
          {t('import.chooseFolder')}
          {/* @ts-expect-error webkitdirectory is non-standard but supported by Chrome and Firefox */}
          <input type="file" webkitdirectory="" className="sr-only" disabled={busy} onChange={(e) => handle(e.target.files)} />
        </label>
        <label className="button secondary file-button">
          {t('import.chooseFiles')}
          <input type="file" multiple accept=".html,.json,.csv" className="sr-only" disabled={busy} onChange={(e) => handle(e.target.files)} />
        </label>
      </div>
      <p className="muted" role="status">
        {busy ? t('import.importing') : reports ? t('import.imported', { count: reports.length }) : ''}
      </p>
      {error && <p className="error" role="alert">{error.kind === 'none' ? t('import.noneFound') : <ErrorText error={error.cause} />}</p>}
      {reports && (
        <table>
          <caption className="sr-only">{t('import.results')}</caption>
          <thead>
            <tr>
              <th>{t('import.col.file')}</th>
              <th>{t('import.col.type')}</th>
              <th>{t('import.col.imported')}</th>
              <th>{t('import.col.skipped')}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const kind = KIND_LABEL[r.kind];
              return (
                <tr key={r.name}>
                  <td>{r.name.split('/').pop()}</td>
                  <td>{kind && t(kind)}</td>
                  <td>{fmt.number(r.count)}</td>
                  <td>{fmt.number(r.skipped)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

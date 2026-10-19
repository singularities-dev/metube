import { LINKS } from '@/lib/links';
import { useEffect, useState } from 'react';
import { apiKey, client } from '@/lib/services';
import { YouTubeApiError } from '@/lib/api/client';
import { DAILY_LIMIT_DEFAULT } from '@/lib/quota';
import { HowTo, CLOUD_CONSOLE } from './HowTo';
import { ErrorText, T, useI18n } from './i18n';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
/** <b> names Google Cloud Console menus and options, kept in English; <em> is translated emphasis. */
const strong = { b: <strong lang="en" />, em: <strong /> };

export function SettingsPanel({ onKeyChange }: { onKeyChange: (hasKey: boolean) => void }) {
  const { t } = useI18n();
  const [saved, setSaved] = useState<string>();
  const [draft, setDraft] = useState('');
  // The outcome, not its text, so it follows a change of language.
  const [status, setStatus] = useState<{ ok: true } | { ok: false; error: unknown }>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiKey.get().then((k) => {
      setSaved(k);
      onKeyChange(!!k);
    });
  }, [onKeyChange]);

  async function save() {
    if (!draft.trim()) return;
    setBusy(true);
    setStatus(undefined);
    await apiKey.set(draft);
    try {
      await client.testKey();
      setSaved(draft.trim());
      setDraft('');
      setStatus({ ok: true });
      onKeyChange(true);
    } catch (e) {
      setStatus({ ok: false, error: e });
      if (e instanceof YouTubeApiError && e.kind !== 'network') {
        await apiKey.clear();
        onKeyChange(false);
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    await apiKey.clear();
    setSaved(undefined);
    setStatus(undefined);
    onKeyChange(false);
  }

  return (
    <section className="panel glass">
      <h2>{t('apiKey.heading')}</h2>
      <p className="muted">
        <T k="apiKey.intro" components={{ link: <a href={LINKS.youtubeTerms} {...ext} /> }} />
      </p>
      {saved ? (
        <div className="row">
          <code>{saved.slice(0, 6)}…{saved.slice(-4)}</code>
          <button className="button secondary" onClick={remove}>{t('common.remove')}</button>
        </div>
      ) : (
        <form className="row" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <input
            className="field"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={t('apiKey.placeholder')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label={t('apiKey.field')}
          />
          <button className="button" type="submit" disabled={busy || !draft.trim()}>
            {busy ? t('apiKey.testing') : t('apiKey.save')}
          </button>
        </form>
      )}
      <p className={status?.ok === false ? 'error' : 'muted'} role="status">
        {status && (status.ok ? t('apiKey.works') : <ErrorText error={status.error} />)}
      </p>
      <HowTo
        title={t('apiKey.howTo.title')}
        steps={[
          <T k="apiKey.howTo.step1" components={{ link: <a href={CLOUD_CONSOLE} {...ext} /> }} />,
          <T k="apiKey.howTo.step2" components={strong} />,
          <T k="apiKey.howTo.step3" components={strong} />,
          <T k="apiKey.howTo.step4" components={strong} />,
          <T k="apiKey.howTo.step5" components={strong} />,
          <T k="apiKey.howTo.step6" params={{ button: t('apiKey.save') }} components={strong} />,
        ]}
        note={t('apiKey.howTo.note', { units: DAILY_LIMIT_DEFAULT })}
      />
    </section>
  );
}

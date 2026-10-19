import { useState, type ReactNode } from 'react';
import { T, useI18n } from './i18n';

/** Collapsible step-by-step guide. Steps are a real sequence, so they're numbered. */
export function HowTo({ title, steps, note, open }: { title: string; steps: ReactNode[]; note?: ReactNode; open?: boolean }) {
  return (
    <details className="howto" open={open}>
      <summary>{title}</summary>
      <ol className="howto-steps">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      {note && <p className="hint">{note}</p>}
    </details>
  );
}

/** Text with a copy button, for values the user pastes into Google Cloud. */
export function CopyField({ value, label }: { value: string; label: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <span className="copy-field">
      <span className="sr-only">{t('howto.field', { label })} </span>
      <code>{value}</code>
      <button
        className="button secondary small"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard blocked: the value is selectable */
          }
        }}
      >
        {/* "Copy" is visible; the label is for screen readers only. */}
        <T k={copied ? 'howto.copied' : 'howto.copy'} params={{ label }} components={{ sr: <span className="sr-only" /> }} />
      </button>
      <span className="sr-only" role="status">{copied ? t('howto.copiedStatus', { label }) : ''}</span>
    </span>
  );
}

/**
 * Opens the Console in English in every UI language: the guides name its menus
 * and buttons in English, so what the user sees matches the names in bold.
 */
export const CLOUD_CONSOLE = 'https://console.cloud.google.com/?hl=en';

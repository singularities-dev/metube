import { useEffect, useId, useRef } from 'react';
import { useI18n } from './i18n';

interface Props {
  /** The whole question, already translated. It names the dialog. */
  question: string;
  /** The action's own name, such as "Delete mood", rather than a bare "OK". */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Asks before something that can't be undone. The browser's confirm() words
 * its buttons and header in the browser's language, whatever MeTube's is, and
 * its OK doesn't say what it does; this dialog's buttons are MeTube's own.
 * Focus starts on Cancel, Escape cancels, and focus goes back to whatever
 * opened it (if it's still there).
 */
export function ConfirmDialog({ question, confirmLabel, onConfirm, onCancel }: Props) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const questionId = useId();

  useEffect(() => {
    const d = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    d?.showModal();
    cancel.current?.focus();
    return () => {
      d?.close();
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="confirm glass"
      role="alertdialog"
      aria-labelledby={questionId}
      // Escape closes the dialog by itself, and that counts as Cancel (unless it was opened again since).
      onClose={() => { if (!dialog.current?.open) onCancel(); }}
    >
      <p id={questionId}>{question}</p>
      <div className="confirm-actions">
        <button ref={cancel} className="button secondary" onClick={onCancel}>{t('common.cancel')}</button>
        <button className="button danger-subtle" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}

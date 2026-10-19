/**
 * Language switcher: the current language's flag, opening a short list of the
 * others. Flags are inline SVG (flag emoji don't render on Windows). Each
 * language is named in itself, so it's recognisable whichever is active.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { LOCALES, type Locale, type LocaleInfo } from '@/lib/i18n';
import { useI18n } from './i18n';
import { ChevronIcon } from './Icons';

export function Flag({ code }: { code: LocaleInfo['flag'] }) {
  const id = useId();
  const box = { width: 22, height: 15, className: 'flag', 'aria-hidden': true, preserveAspectRatio: 'xMidYMid slice' } as const;
  switch (code) {
    case 'gb':
      return (
        <svg {...box} viewBox="0 0 60 30">
          <clipPath id={`${id}t`}><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      );
    case 'fr':
      return (
        <svg {...box} viewBox="0 0 3 2">
          <path fill="#002654" d="M0 0h1v2H0z" />
          <path fill="#fff" d="M1 0h1v2H1z" />
          <path fill="#CE1126" d="M2 0h1v2H2z" />
        </svg>
      );
    case 'de':
      return (
        <svg {...box} viewBox="0 0 5 3">
          <path fill="#000" d="M0 0h5v1H0z" />
          <path fill="#DD0000" d="M0 1h5v1H0z" />
          <path fill="#FFCE00" d="M0 2h5v1H0z" />
        </svg>
      );
    case 'es':
      return (
        <svg {...box} viewBox="0 0 3 2">
          <path fill="#AA151B" d="M0 0h3v2H0z" />
          <path fill="#F1BF00" d="M0 .5h3v1H0z" />
        </svg>
      );
  }
}

export function LanguageSwitch({ value, onChange }: { value: Locale; onChange: (locale: Locale) => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const menuId = useId();
  const current = LOCALES.find((l) => l.id === value) ?? LOCALES[0]!;

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  // Opening moves focus to the current language.
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.('.lang-switch')) setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);

  /** Escape closes; arrow keys, Home and End move between languages. */
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const items = [...(list.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (n: number) => { e.preventDefault(); items[(n + items.length) % items.length]?.focus(); };
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
  };

  return (
    <div
      className="lang-switch"
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (open && next && !e.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="lang-button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t('lang.button', { name: current.nativeName })}
        title={current.nativeName}
        onClick={() => (open ? close(true) : setOpen(true))}
      >
        <Flag code={current.flag} />
        <ChevronIcon width={14} height={14} />
      </button>
      {open && (
        <ul id={menuId} ref={list} className="lang-menu glass" aria-label={t('lang.menu')} onKeyDown={onKeyDown}>
          {LOCALES.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                lang={l.id}
                aria-current={l.id === value ? 'true' : undefined}
                onClick={() => {
                  onChange(l.id);
                  close(true);
                }}
              >
                <Flag code={l.flag} />
                <span>{l.nativeName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

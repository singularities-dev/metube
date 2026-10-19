import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { activateMood, createMood, moodLabel, moodPath, type MoodState } from '@/lib/moods';
import { BranchIcon, ChevronIcon, CloseIcon, PlusIcon } from './Icons';
import { moodLabelT, moodName, useI18n } from './i18n';

interface Props {
  state: MoodState;
  onChange: (next: MoodState) => void;
}

/** Case- and accent-insensitive form for matching, so "energique" finds "Énergique". */
const fold = (s: string, locale: string) => s.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu, '');

type Option =
  | { kind: 'mood'; id: string; label: string; name: string; depth: number }
  | { kind: 'create'; name: string; parentId: string | null; label: string }
  | { kind: 'clear'; label: string };

/**
 * Searchable mood combobox. Type to filter by full path ("focus gaming"); if no
 * mood matches exactly, offer to create it at the top level or as a branch of
 * the current mood. Matches both the displayed (translated) path and the stored
 * one, ignoring case and accents.
 */
export function MoodPicker({ state, onChange }: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const active = state.activeId ? moodPath(state.moods, state.activeId) : [];
  const activeMood = active.at(-1);

  const options = useMemo<Option[]>(() => {
    const q = query.trim();
    const folded = fold(q, locale);
    const found = state.moods
      .map((m) => ({ m, label: moodLabelT(state.moods, m.id, t), stored: moodLabel(state.moods, m.id) }))
      .filter(({ label, stored }) => !folded || fold(label, locale).includes(folded) || fold(stored, locale).includes(folded))
      .sort((a, b) => a.label.localeCompare(b.label, locale))
      .map<Option>(({ m, label }) => ({
        kind: 'mood', id: m.id, label, name: moodName(m, t), depth: moodPath(state.moods, m.id).length - 1,
      }));
    const opts: Option[] = [...found];
    const lower = q.toLocaleLowerCase(locale);
    const exact = state.moods.some((m) => m.name.toLocaleLowerCase(locale) === lower || moodName(m, t).toLocaleLowerCase(locale) === lower);
    if (q && !exact) {
      if (activeMood) opts.push({ kind: 'create', name: q, parentId: activeMood.id, label: t('moodPicker.createUnder', { name: q, parent: moodName(activeMood, t) }) });
      opts.push({ kind: 'create', name: q, parentId: null, label: t('moodPicker.createNew', { name: q }) });
    }
    if (!q && state.activeId) opts.unshift({ kind: 'clear', label: t('moodPicker.none') });
    return opts;
  }, [query, state, activeMood, t, locale]);

  useEffect(() => setCursor(0), [query, open]);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  /** Close the popover; return focus to the trigger unless the user moved it elsewhere. */
  function close(refocus: boolean) {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  }

  function choose(o: Option) {
    if (o.kind === 'mood') onChange(activateMood(state, o.id));
    if (o.kind === 'clear') onChange(activateMood(state, null));
    if (o.kind === 'create') {
      const created = createMood(state, o.name, o.parentId);
      onChange(activateMood(created.state, created.mood.id));
    }
    setQuery('');
    close(true);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(options.length - 1, c + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); const o = options[cursor]; if (o) choose(o); }
    else if (e.key === 'Escape') { e.preventDefault(); close(true); }
  }

  return (
    <div className="mood-picker" ref={root}>
      <button
        ref={trigger}
        className="mood-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={state.activeId ? t('moodPicker.current', { mood: moodLabelT(state.moods, state.activeId, t) }) : t('moodPicker.pick')}
        // Keep focus in the search field while open so the click below can close and refocus.
        onMouseDown={(e) => open && e.preventDefault()}
        onClick={() => (open ? close(true) : setOpen(true))}
      >
        <span className="mood-swatch" aria-hidden />
        <span className="mood-current">
          {active.length ? (
            active.map((m, i) => (
              <span key={m.id} className={i === active.length - 1 ? 'mood-leaf' : 'mood-parent'}>
                {i > 0 && <span className="mood-sep" aria-hidden>›</span>}
                {moodName(m, t)}
              </span>
            ))
          ) : (
            <span className="mood-none">{t('moodPicker.pick')}</span>
          )}
        </span>
        <ChevronIcon className="mood-chevron" />
      </button>
      {activeMood && (
        <button className="icon-button subtle" aria-label={t('moodPicker.clear')} title={t('moodPicker.clear')} onClick={() => { onChange({ ...state, activeId: null }); trigger.current?.focus(); }}>
          <CloseIcon />
        </button>
      )}

      {open && (
        <div
          className="popover glass"
          role="dialog"
          aria-label={t('moodPicker.dialog')}
          // Tabbing out closes; a null relatedTarget (click on padding) is left to the mousedown handler.
          onBlur={(e) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
        >
          <input
            ref={input}
            className="field"
            placeholder={t('moodPicker.search')}
            aria-label={t('moodPicker.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-activedescendant={options[cursor] ? `${listId}-${cursor}` : undefined}
          />
          <ul id={listId} role="listbox" aria-label={t('moodPicker.list')} className="options">
            {options.map((o, i) => (
              <li
                key={o.kind === 'mood' ? o.id : `${o.kind}-${o.label}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === cursor}
                className={`option ${o.kind}`}
                data-root={o.kind === 'mood' && o.depth === 0 && !query ? true : undefined}
                onMouseEnter={() => setCursor(i)}
                onMouseDown={(e) => { e.preventDefault(); choose(o); }}
              >
                {o.kind === 'create' && (o.parentId ? <BranchIcon /> : <PlusIcon />)}
                <span style={o.kind === 'mood' && !query ? { paddingInlineStart: o.depth * 14 } : undefined}>
                  {o.kind === 'mood' && !query ? o.name : o.label}
                </span>
                {o.kind === 'mood' && o.id === state.activeId && <span className="option-check"><span aria-hidden>✓</span><span className="sr-only">{t('moodPicker.isCurrent')}</span></span>}
              </li>
            ))}
            {!options.length && <li className="option empty" role="option" aria-selected={false} aria-disabled="true">{t('moodPicker.empty')}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

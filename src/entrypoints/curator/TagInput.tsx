import { useRef, useState } from 'react';
import { normaliseTag } from '@/lib/tags';
import type { Locale } from '@/lib/i18n';
import { CloseIcon } from './Icons';
import { useI18n } from './i18n';

/** A row of removable chips with an inline "add" field. Enter or comma adds. */
export function TagInput({
  tags, onChange, placeholder, tone, label,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  tone: 'like' | 'block';
  /** Visible label text for this list (translated); the field's accessible name includes it. */
  label: string;
}) {
  const { t, locale } = useI18n();
  const [draft, setDraft] = useState('');
  // Tagged with its language: after a switch it's dropped rather than read out again in the wrong language.
  const [announcement, setAnnouncement] = useState<{ locale: Locale; text: string }>();
  const field = useRef<HTMLInputElement>(null);
  function add(value = draft) {
    const tag = normaliseTag(value.replace(/,$/, ''));
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setDraft('');
  }
  function remove(tag: string) {
    onChange(tags.filter((x) => x !== tag));
    setAnnouncement({ locale, text: t('tagInput.removed', { tag }) });
  }
  return (
    <div className="tag-input" data-tone={tone}>
      <ul className="chips" aria-label={label}>
        {tags.map((tag) => (
          <li key={tag} className="chip" data-tone={tone}>
            {tag}
            {/* The button unmounts on click, so hand focus to the field. */}
            <button aria-label={t('tagInput.remove', { tag })} onClick={() => { remove(tag); field.current?.focus(); }}><CloseIcon width={14} height={14} /></button>
          </li>
        ))}
        <li className="chip-field">
          <input
            ref={field}
            value={draft}
            placeholder={placeholder}
            aria-label={t('tagInput.field', { label, placeholder })}
            onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setDraft(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); add(); }
              const last = tags.at(-1);
              if (e.key === 'Backspace' && !draft && last) remove(last);
            }}
            onBlur={() => draft && add()}
          />
        </li>
      </ul>
      <span className="sr-only" role="status">{announcement?.locale === locale ? announcement.text : ''}</span>
    </div>
  );
}

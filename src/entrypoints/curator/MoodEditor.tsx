import { useState } from 'react';
import { deleteMood, seedTags, updateMood, DEFAULT_INTENSITY, type Mood, type MoodState, type MoodWindow } from '@/lib/moods';
import type { MessageKey, Translate } from '@/lib/i18n/catalogs';
import type { Format } from '@/lib/i18n/format';
import { TagInput } from './TagInput';
import { ConfirmDialog } from './ConfirmDialog';
import { CloseIcon, PlusIcon } from './Icons';
import { moodLabelT, moodName, useI18n } from './i18n';

/** The day toggles, Monday first; `d` is the schedule's day number (0 = Sunday). */
const DAYS: { d: number; initial: MessageKey; name: MessageKey }[] = [
  { d: 1, initial: 'moodEditor.dayInitial.1', name: 'moodEditor.day.1' },
  { d: 2, initial: 'moodEditor.dayInitial.2', name: 'moodEditor.day.2' },
  { d: 3, initial: 'moodEditor.dayInitial.3', name: 'moodEditor.day.3' },
  { d: 4, initial: 'moodEditor.dayInitial.4', name: 'moodEditor.day.4' },
  { d: 5, initial: 'moodEditor.dayInitial.5', name: 'moodEditor.day.5' },
  { d: 6, initial: 'moodEditor.dayInitial.6', name: 'moodEditor.day.6' },
  { d: 0, initial: 'moodEditor.dayInitial.0', name: 'moodEditor.day.0' },
];

function intensityLabel(i: number): MessageKey {
  if (i >= 0.95) return 'moodEditor.intensity.only';
  if (i >= 0.7) return 'moodEditor.intensity.strong';
  if (i >= 0.35) return 'moodEditor.intensity.balanced';
  return 'moodEditor.intensity.gentle';
}

/** "weekdays 07:00–12:00", "every day 21:00–02:00", "Mon, Sat 10:00–14:00", in the UI language; days in the toggles' order. */
function describeWindow(w: MoodWindow, t: Translate, fmt: Format): string {
  const times = { from: w.from, to: w.to };
  if (!w.days.length) return t('moodEditor.window.noDays', times);
  const picked = [...w.days].sort().join(',');
  const days = picked === '0,1,2,3,4,5,6'
    ? t('moodEditor.window.everyDay')
    : picked === '1,2,3,4,5'
      ? t('moodEditor.window.weekdays')
      : picked === '0,6'
        ? t('moodEditor.window.weekends')
        : DAYS.filter(({ d }) => w.days.includes(d)).map(({ d }) => fmt.weekday(d)).join(', ');
  return t('moodEditor.window', { days, ...times });
}

function ScheduleRow({ w, onChange, onRemove }: { w: MoodWindow; onChange: (w: MoodWindow) => void; onRemove: () => void }) {
  const { t, fmt } = useI18n();
  return (
    <li className="schedule-row">
      <div className="day-toggles" role="group" aria-label={t('moodEditor.schedule.days')}>
        {DAYS.map(({ d, initial, name }) => (
          <button
            key={d}
            className="day-toggle"
            aria-pressed={w.days.includes(d)}
            aria-label={t(name)}
            title={t(name)}
            onClick={() => onChange({ ...w, days: w.days.includes(d) ? w.days.filter((x) => x !== d) : [...w.days, d] })}
          >
            {t(initial)}
          </button>
        ))}
      </div>
      <span className="time-range">
        <input type="time" className="field time" value={w.from} aria-label={t('moodEditor.schedule.from')} onChange={(e) => onChange({ ...w, from: e.target.value })} />
        <span aria-hidden>{t('moodEditor.schedule.between')}</span>
        <input type="time" className="field time" value={w.to} aria-label={t('moodEditor.schedule.to')} onChange={(e) => onChange({ ...w, to: e.target.value })} />
      </span>
      <button className="icon-button small" aria-label={t('moodEditor.schedule.remove', { window: describeWindow(w, t, fmt) })} title={t('common.remove')} onClick={onRemove}>
        <CloseIcon width={16} height={16} />
      </button>
    </li>
  );
}

interface Props {
  mood: Mood;
  state: MoodState;
  update: (s: MoodState) => void;
  suggestions: string[];
  learnedChannels: { channelId: string; title: string }[];
  /** What the mood searches YouTube for ('' when it has no tags). */
  query: string;
  /** Why the mood isn't searching YouTube right now, if it isn't: the setting is off, or Uncharted sets moods aside. */
  searchOff?: 'setting' | 'uncharted';
  autoMoods: boolean;
  onDeleted: () => void;
}

export function MoodEditor({ mood, state, update, suggestions, learnedChannels, query, searchOff, autoMoods, onDeleted }: Props) {
  const { t, fmt, locale } = useI18n();
  // A starter mood's tags in the UI language; editing a list saves what's shown, plus the change, as the user's own.
  const { include, exclude } = seedTags(mood, locale);
  // Keep intensity local while dragging so ranking doesn't recompute on every pixel.
  const [intensity, setIntensity] = useState(mood.intensity ?? DEFAULT_INTENSITY);
  // The name as typed, while typing: a starter mood's original name would otherwise flip to its translation mid-word.
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const schedule = mood.schedule ?? [];
  const setSchedule = (next: MoodWindow[]) => update(updateMood(state, mood.id, { schedule: next }));

  return (
    <div className="mood-editor glass">
      <div className="mood-editor-row">
        <label htmlFor="mood-name">{t('moodEditor.name')}</label>
        {/* A starter mood shows its translated name; editing it saves what's typed as the user's own. */}
        <input
          id="mood-name"
          className="field"
          value={nameDraft ?? moodName(mood, t)}
          onChange={(e) => { setNameDraft(e.target.value); update(updateMood(state, mood.id, { name: e.target.value })); }}
          onBlur={() => setNameDraft(null)}
        />
      </div>
      <div className="mood-editor-row">
        <span className="label">{t('moodEditor.moreOf')}</span>
        <TagInput tone="like" label={t('moodEditor.moreOf')} placeholder={t('moodEditor.addTag')} tags={include}
          onChange={(next) => update(updateMood(state, mood.id, { include: next }))} />
      </div>
      <div className="mood-editor-row">
        <span className="label">{t('moodEditor.neverShow')}</span>
        <TagInput tone="block" label={t('moodEditor.neverShow')} placeholder={t('moodEditor.addTag')} tags={exclude}
          onChange={(next) => update(updateMood(state, mood.id, { exclude: next }))} />
      </div>
      <div className="mood-editor-row">
        <label htmlFor="mood-intensity">{t('moodEditor.intensity')}</label>
        <div className="intensity">
          <input
            id="mood-intensity"
            type="range" min={0} max={1} step={0.05}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            onPointerUp={() => update(updateMood(state, mood.id, { intensity }))}
            onKeyUp={() => update(updateMood(state, mood.id, { intensity }))}
            onBlur={() => intensity !== mood.intensity && update(updateMood(state, mood.id, { intensity }))}
            aria-valuetext={t(intensityLabel(intensity))}
          />
          <span className="intensity-label">{t(intensityLabel(intensity))}</span>
        </div>
      </div>
      <div className="mood-editor-row top">
        <span className="label">{t('moodEditor.schedule')}</span>
        <div>
          {schedule.length > 0 && (
            <ul className="schedule">
              {schedule.map((w, i) => (
                <ScheduleRow
                  key={i}
                  w={w}
                  onChange={(nw) => setSchedule(schedule.map((x, j) => (j === i ? nw : x)))}
                  onRemove={() => setSchedule(schedule.filter((_, j) => j !== i))}
                />
              ))}
            </ul>
          )}
          <button className="link-button add-window" onClick={() => setSchedule([...schedule, { days: [1, 2, 3, 4, 5], from: '09:00', to: '12:00' }])}>
            <PlusIcon width={14} height={14} /> {t('moodEditor.schedule.add')}
          </button>
          <p className="hint">
            {schedule.length
              ? autoMoods
                ? t('moodEditor.schedule.on', { windows: schedule.map((w) => describeWindow(w, t, fmt)).join(t('moodEditor.window.separator')) })
                : t('moodEditor.schedule.off')
              : t('moodEditor.schedule.none')}
          </p>
        </div>
      </div>
      {suggestions.length > 0 && (
        <div className="mood-editor-row top">
          <span className="label">{t('moodEditor.learned')}</span>
          <div>
            <ul className="chips">
              {suggestions.map((tag) => (
                <li key={tag}>
                  <button className="chip suggest-chip" aria-label={t('moodEditor.learned.add', { tag })} onClick={() => update(updateMood(state, mood.id, { include: [...include, tag] }))}>
                    <PlusIcon width={14} height={14} /> {tag}
                  </button>
                </li>
              ))}
            </ul>
            <p className="hint">{t('moodEditor.learned.hint')}</p>
          </div>
        </div>
      )}
      {learnedChannels.length > 0 && (
        <div className="mood-editor-row top">
          <span className="label">{t('moodEditor.channels')}</span>
          <div>
            <ul className="chips">{learnedChannels.map((c) => <li key={c.channelId} className="chip">{c.title}</li>)}</ul>
            <p className="hint">{t('moodEditor.channels.hint')}</p>
          </div>
        </div>
      )}
      {mood.parentId && (
        <p className="hint">{t('moodEditor.inherits', { parent: moodLabelT(state.moods, mood.parentId, t) })}</p>
      )}
      <div className="mood-editor-actions">
        <span className="hint">
          {searchOff === 'setting'
            ? t('moodEditor.searchOff', { setting: t('settings.moodFetch') })
            : searchOff === 'uncharted'
              ? t('moodEditor.searchPaused', { scope: t('explore.scope.uncharted.label') })
              : query
                ? t('moodEditor.searches', { query })
                : t('moodEditor.noSearch')}
        </span>
        <button className="button danger-subtle" onClick={() => setConfirmingDelete(true)}>
          {t('moodEditor.delete')}
        </button>
        {confirmingDelete && (
          <ConfirmDialog
            question={t('moodEditor.delete.confirm', { name: moodName(mood, t) })}
            confirmLabel={t('moodEditor.delete')}
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={() => {
              setConfirmingDelete(false);
              update(deleteMood(state, mood.id));
              onDeleted();
            }}
          />
        )}
      </div>
    </div>
  );
}

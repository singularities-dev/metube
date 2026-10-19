import { useId, useState } from 'react';
import { PAGE_SIZES, type Prefs, type Theme } from '@/lib/prefs';
import type { MessageKey } from '@/lib/i18n/catalogs';
import { clearImportedData, openMeTubeDB } from '@/lib/db';
import { INLINE_PLAYER } from '@/lib/features';
import { SettingsPanel } from './SettingsPanel';
import { SyncPanel } from './SyncPanel';
import { ImportPanel } from './ImportPanel';
import { EngagementSummary } from './EngagementSummary';
import { AboutPanel } from './AboutPanel';
import { ConfirmDialog } from './ConfirmDialog';
import { useI18n } from './i18n';

interface Props {
  prefs: Prefs;
  updatePrefs: (p: Partial<Prefs>) => void;
  onKeyChange: (hasKey: boolean) => void;
  onDataChange: () => void;
  dataVersion: number;
}

/** Label and hint for a setting row. Only the label names the control; the hint describes it. */
function SettingText({ id, label, hint }: { id: string; label: string; hint?: string }) {
  return (
    <span className="setting-text">
      <label className="setting-label" htmlFor={id}>{label}</label>
      {hint && <span className="setting-hint" id={`${id}-hint`}>{hint}</span>}
    </span>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  const id = useId();
  return (
    <div className="setting">
      <SettingText id={id} label={label} hint={hint} />
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="switch"
        aria-describedby={hint ? `${id}-hint` : undefined}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

function NumberSetting({ value, onChange, label, hint, min, max, step = 1 }: { value: number; onChange: (v: number) => void; label: string; hint?: string; min: number; max: number; step?: number }) {
  const { fmt } = useI18n();
  const id = useId();
  return (
    <div className="setting">
      <SettingText id={id} label={label} hint={hint} />
      <span className="range">
        <input
          id={id}
          type="range"
          min={min} max={max} step={step}
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {/* The range already exposes its value. */}
        <output htmlFor={id} aria-hidden>{fmt.number(value)}</output>
      </span>
    </div>
  );
}

const THEME_OPTIONS: { id: Theme; label: MessageKey }[] = [
  { id: 'system', label: 'app.theme.system' },
  { id: 'light', label: 'app.theme.light' },
  { id: 'dark', label: 'app.theme.dark' },
];

export function SettingsView({ prefs, updatePrefs, onKeyChange, onDataChange, dataVersion }: Props) {
  const { t, fmt } = useI18n();
  const pageSizeHint = useId();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const units = prefs.poolChannels + Math.ceil((prefs.poolChannels * prefs.uploadsPerChannel) / 50);

  return (
    <section className="view narrow">
      <header className="view-head"><h1>{t('settings.heading')}</h1></header>

      <section className="panel glass">
        <h2>{t('settings.appearance')}</h2>
        <div className="setting">
          <span className="setting-text"><span className="setting-label">{t('settings.theme')}</span></span>
          <div className="segmented" role="group" aria-label={t('settings.theme')}>
            {THEME_OPTIONS.map((o) => (
              <button key={o.id} aria-pressed={prefs.theme === o.id} onClick={() => updatePrefs({ theme: o.id })}>
                {t(o.label)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel glass">
        <h2>{t('settings.feed')}</h2>
        <div className="setting">
          <span className="setting-text">
            <span className="setting-label">{t('settings.pageSize')}</span>
            <span className="setting-hint" id={pageSizeHint}>{t('settings.pageSize.hint')}</span>
          </span>
          <div className="segmented" role="group" aria-label={t('settings.pageSize')} aria-describedby={pageSizeHint}>
            {PAGE_SIZES.map((n) => (
              <button key={n} aria-pressed={prefs.pageSize === n} onClick={() => updatePrefs({ pageSize: n })}>{fmt.number(n)}</button>
            ))}
          </div>
        </div>
        <NumberSetting
          label={t('settings.poolChannels')}
          hint={t('settings.poolChannels.hint', { count: units })}
          min={5} max={100} step={5}
          value={prefs.poolChannels}
          onChange={(poolChannels) => updatePrefs({ poolChannels })}
        />
        <NumberSetting
          label={t('settings.uploadsPerChannel')}
          min={2} max={25}
          value={prefs.uploadsPerChannel}
          onChange={(uploadsPerChannel) => updatePrefs({ uploadsPerChannel })}
        />
        <NumberSetting
          label={t('settings.perChannelCap')}
          hint={t('settings.perChannelCap.hint')}
          min={0} max={10}
          value={prefs.perChannelCap}
          onChange={(perChannelCap) => updatePrefs({ perChannelCap })}
        />
        <Toggle
          label={t('settings.moodFetch')}
          hint={t('settings.moodFetch.hint')}
          checked={prefs.moodFetch}
          onChange={(moodFetch) => updatePrefs({ moodFetch })}
        />
        <Toggle
          label={t('settings.autoMoods')}
          hint={t('settings.autoMoods.hint')}
          checked={prefs.autoMoods}
          onChange={(autoMoods) => updatePrefs({ autoMoods })}
        />
        {INLINE_PLAYER && <Toggle
          label={t('settings.playInline')}
          hint={t('settings.playInline.hint')}
          checked={prefs.playInline}
          onChange={(playInline) => updatePrefs({ playInline })}
        />}
        <Toggle label={t('settings.hideShorts')} hint={t('settings.hideShorts.hint')} checked={prefs.hideShorts} onChange={(hideShorts) => updatePrefs({ hideShorts })} />
        <Toggle label={t('settings.hideWatched')} checked={prefs.hideWatched} onChange={(hideWatched) => updatePrefs({ hideWatched })} />
      </section>

      <SettingsPanel onKeyChange={onKeyChange} />
      <SyncPanel prefs={prefs} updatePrefs={updatePrefs} onSynced={onDataChange} />

      <ImportPanel onImported={onDataChange} />
      <EngagementSummary version={dataVersion} />

      <section className="panel glass">
        <h2>{t('settings.data')}</h2>
        <p className="hint">{t('settings.data.hint')}</p>
        <button className="button danger-subtle" onClick={() => setConfirmingClear(true)}>
          {t('settings.data.clear')}
        </button>
        {confirmingClear && (
          <ConfirmDialog
            question={t('settings.data.confirm')}
            confirmLabel={t('settings.data.clear')}
            onCancel={() => setConfirmingClear(false)}
            onConfirm={async () => {
              setConfirmingClear(false);
              await clearImportedData(await openMeTubeDB());
              onDataChange();
            }}
          />
        )}
      </section>

      <AboutPanel />
    </section>
  );
}

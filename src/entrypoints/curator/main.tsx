import '@fontsource-variable/figtree';
import '@fontsource-variable/bricolage-grotesque';
import './style.css';
import { useCallback, useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import { createRoot } from 'react-dom/client';
import type { QuotaState } from '@/lib/quota';
import type { Prefs, Theme } from '@/lib/prefs';
import type { MessageKey } from '@/lib/i18n/catalogs';
import { apiKey, onQuotaChange, quota, store } from '@/lib/services';
import { activateMood, moodPath, scheduledMood, type Mood } from '@/lib/moods';
import { moodHue, useMoods, usePrefs, useTags, useTheme } from './hooks';
import { AutoIcon, CollapseIcon, ExpandIcon, ExploreIcon, MoonIcon, SettingsIcon, SunIcon, TagIcon } from './Icons';
import { ExploreView } from './ExploreView';
import { TagsView } from './TagsView';
import { SettingsView } from './SettingsView';
import { I18nProvider, moodName, resolveLocale, useI18n } from './i18n';
import { LanguageSwitch } from './LanguageSwitch';

type View = 'explore' | 'tags' | 'settings';

const NAV: { id: View; label: MessageKey; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: 'explore', label: 'app.nav.explore', Icon: ExploreIcon },
  { id: 'tags', label: 'app.nav.tags', Icon: TagIcon },
  { id: 'settings', label: 'app.nav.settings', Icon: SettingsIcon },
];

const THEMES: { id: Theme; label: MessageKey; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: 'system', label: 'app.theme.system', Icon: AutoIcon },
  { id: 'light', label: 'app.theme.light', Icon: SunIcon },
  { id: 'dark', label: 'app.theme.dark', Icon: MoonIcon },
];

function initialView(): View {
  const h = location.hash.slice(1);
  return h === 'tags' || h === 'settings' ? h : 'explore';
}

function QuotaMeter() {
  const { t } = useI18n();
  const [s, setS] = useState<QuotaState>();
  const [tipOpen, setTipOpen] = useState(false);
  useEffect(() => {
    const load = () => quota.state().then(setS);
    load();
    return onQuotaChange(load);
  }, []);
  if (!s) return null;
  const left = Math.max(0, s.limit - s.used);
  const pct = Math.round((left / s.limit) * 100);
  return (
    <div className="quota">
      <div className="quota-bar" aria-hidden><span style={{ width: `${pct}%` }} data-low={pct < 15 || undefined} /></div>
      <div className="quota-row">
        <span className="quota-text">{t('app.quota.left', { count: left })}</span>
        <span className="help" data-open={tipOpen || undefined} onMouseLeave={() => setTipOpen(false)}>
          <button
            type="button"
            className="help-icon"
            aria-label={t('app.quota.about')}
            aria-describedby="quota-help"
            aria-expanded={tipOpen}
            onClick={() => setTipOpen((o) => !o)}
            onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setTipOpen(true); }}
            onBlur={() => setTipOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setTipOpen(false); }}
          >?</button>
          <span role="tooltip" id="quota-help" className="help-tip glass">
            {t('app.quota.help', { left, limit: s.limit })}
          </span>
        </span>
      </div>
    </div>
  );
}

/** Provides the chosen language to everything below it. */
function App() {
  const prefsApi = usePrefs();
  // Wait for the saved preferences, so the first paint is already in the chosen language (and theme).
  if (!prefsApi.ready) return null;
  return (
    <I18nProvider locale={resolveLocale(prefsApi.prefs.language)}>
      <Shell prefsApi={prefsApi} />
    </I18nProvider>
  );
}

function Shell({ prefsApi }: { prefsApi: ReturnType<typeof usePrefs> }) {
  const { t, locale } = useI18n();
  const [view, setView] = useState<View>(initialView);
  const { prefs, ready: prefsReady, update: updatePrefs } = prefsApi;
  const tagsApi = useTags();
  const moodsApi = useMoods();
  const [hasKey, setHasKey] = useState<boolean>();
  const [dataVersion, setDataVersion] = useState(0);
  // Ratings and dismissals: refresh Activity without refetching the feed.
  const [feedbackVersion, setFeedbackVersion] = useState(0);

  useTheme(prefs.theme);
  useEffect(() => {
    document.title = t('app.title', { view: t(NAV.find((n) => n.id === view)?.label ?? 'app.nav.explore') });
  }, [view, t]);
  useEffect(() => void apiKey.get().then((k) => setHasKey(!!k)), []);

  const go = useCallback((v: View) => {
    if (location.hash !== `#${v}`) location.hash = v;
    setView(v);
  }, []);
  // Follow back/forward and links to #tags, #settings.
  useEffect(() => {
    const onHash = () => setView(initialView());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // The active mood tints the ambient background: the one place this UI is bold.
  const active = moodPath(moodsApi.state.moods, moodsApi.state.activeId).at(-1);
  useEffect(() => {
    document.documentElement.style.setProperty('--mood-h', String(moodHue(active?.name)));
  }, [active?.name]);

  // Scheduled moods: switch once when a window starts, so a manual choice inside
  // the window is never overridden. Checked on load, every minute and on focus.
  const [autoNote, setAutoNote] = useState<Mood>();
  const moodsRef = useRef(moodsApi);
  moodsRef.current = moodsApi;
  useEffect(() => {
    if (!prefsReady || !prefs.autoMoods) return;
    const check = async () => {
      const { state, update } = moodsRef.current;
      if (!state.moods.length) return;
      const hit = scheduledMood(state.moods, new Date());
      if (!hit) return;
      const last = await store.get<string>('lastAutoWindow');
      if (last === hit.windowKey) return;
      await store.set('lastAutoWindow', hit.windowKey);
      if (state.activeId === hit.mood.id) return;
      update(activateMood(state, hit.mood.id));
      setAutoNote(hit.mood);
      window.setTimeout(() => setAutoNote(undefined), 6000);
    };
    void check();
    const timer = window.setInterval(check, 60_000);
    const onVisible = () => document.visibilityState === 'visible' && void check();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [prefsReady, prefs.autoMoods, moodsApi.state.moods.length]);

  const collapsed = prefs.navCollapsed;
  const themeIndex = THEMES.findIndex((t) => t.id === prefs.theme);
  const nextTheme = THEMES[(themeIndex + 1) % THEMES.length]!;
  const CurrentThemeIcon = THEMES[themeIndex]?.Icon ?? AutoIcon;
  const themeHint = t('app.theme.switch', { current: t(THEMES[themeIndex]?.label ?? 'app.theme.system'), next: t(nextTheme.label) });

  return (
    <div className="app" data-collapsed={collapsed || undefined}>
      <a className="skip-link" href="#main">{t('app.skip')}</a>
      <div className="ambient" aria-hidden />
      <nav className="nav glass" aria-label={t('app.nav')}>
        <div className="brand">
          <img className="brand-mark" src="/icon/96.png" alt="" aria-hidden />
          <span className="brand-name nav-label">MeTube</span>
        </div>
        <ul className="nav-items">
          {NAV.map(({ id, label, Icon }) => (
            <li key={id}>
              <button
                className="nav-item"
                aria-current={view === id ? 'page' : undefined}
                aria-label={t(label)}
                onClick={() => go(id)}
                title={collapsed ? t(label) : undefined}
              >
                <Icon />
                <span className="nav-label">{t(label)}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="nav-foot">
          <QuotaMeter />
          <button
            className="nav-item"
            onClick={() => updatePrefs({ theme: nextTheme.id })}
            aria-label={themeHint}
            title={themeHint}
          >
            <CurrentThemeIcon />
            <span className="nav-label">{t(THEMES[themeIndex]?.label ?? 'app.theme.system')}</span>
          </button>
          <button
            className="nav-item collapse-toggle"
            onClick={() => updatePrefs({ navCollapsed: !collapsed })}
            aria-expanded={!collapsed}
            aria-label={collapsed ? t('app.expandMenu') : t('app.collapseMenu')}
            title={collapsed ? t('app.expandMenu') : t('app.collapseMenu')}
          >
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
            <span className="nav-label">{t('app.collapse')}</span>
          </button>
        </div>
      </nav>

      <main className="content" id="main" tabIndex={-1}>
        <div className="top-tools">
          <LanguageSwitch value={locale} onChange={(language) => updatePrefs({ language } satisfies Partial<Prefs>)} />
        </div>
        {view === 'explore' && (
          <ExploreView
            prefs={prefs}
            tags={tagsApi.tags}
            moods={moodsApi}
            hasKey={hasKey}
            dataVersion={dataVersion}
            onGoToSettings={() => go('settings')}
            onFeedbackChange={() => setFeedbackVersion((v) => v + 1)}
            updatePrefs={updatePrefs}
          />
        )}
        {view === 'tags' && <TagsView tagsApi={tagsApi} dataVersion={dataVersion + feedbackVersion} moods={moodsApi.state} onFeedbackChange={() => setFeedbackVersion((v) => v + 1)} />}
        {view === 'settings' && (
          <SettingsView
            prefs={prefs}
            updatePrefs={updatePrefs}
            onKeyChange={setHasKey}
            onDataChange={() => setDataVersion((v) => v + 1)}
            dataVersion={dataVersion}
          />
        )}
      </main>
      {/* Always mounted, so screen readers announce each scheduled switch. */}
      <div role="status" className="toast-region">
        {autoNote && (
          <div className="toast glass auto-note">
            <span>{t('app.autoMood', { mood: moodName(autoNote, t) })}</span>
            <button className="link-button" onClick={() => setAutoNote(undefined)}>{t('common.ok')}</button>
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

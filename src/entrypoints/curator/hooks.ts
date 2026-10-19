import { useCallback, useEffect, useState } from 'react';
import { loadPrefs, savePrefs, type Prefs, DEFAULT_PREFS } from '@/lib/prefs';
import { loadTags, saveTags, type TagPrefs } from '@/lib/tags';
import { loadMoods, saveMoods, type MoodState } from '@/lib/moods';
import { store } from '@/lib/services';

/** Re-reads a storage key whenever another page (or tab) changes it. */
function useStorageSync(key: string, reload: () => void) {
  useEffect(() => {
    const listener = (changes: Record<string, unknown>, area: string) => {
      if (area === 'local' && key in changes) reload();
    };
    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, [key, reload]);
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const reload = useCallback(() => {
    loadPrefs(store).then(
      (p) => {
        setPrefs(p);
        setReady(true);
      },
      // Unreadable storage: carry on with the defaults rather than never showing the page.
      () => setReady(true),
    );
  }, []);
  useEffect(reload, [reload]);
  useStorageSync('prefs', reload);
  const update = useCallback(async (patch: Partial<Prefs>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    setPrefs(await savePrefs(store, patch));
  }, []);
  return { prefs, ready, update };
}

export function useTags() {
  const [tags, setTags] = useState<TagPrefs>({ liked: [], blocked: [] });
  const reload = useCallback(() => void loadTags(store).then(setTags), []);
  useEffect(reload, [reload]);
  useStorageSync('tags', reload);
  const update = useCallback(async (next: TagPrefs) => {
    setTags(next);
    setTags(await saveTags(store, next));
  }, []);
  return { tags, update };
}

export function useMoods() {
  const [state, setState] = useState<MoodState>({ moods: [], activeId: null });
  const reload = useCallback(() => void loadMoods(store).then(setState), []);
  useEffect(reload, [reload]);
  useStorageSync('moods', reload);
  const update = useCallback(async (next: MoodState) => {
    setState(next);
    await saveMoods(store, next);
  }, []);
  return { state, update };
}

/** Applies the theme preference to <html>, following the OS when set to "system". */
export function useTheme(theme: Prefs['theme']) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}

/** A stable hue (0–359) per mood name, used to tint the ambient background. */
export function moodHue(name: string | undefined): number {
  if (!name) return 172;
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.codePointAt(0)!) >>> 0;
  return h % 360;
}

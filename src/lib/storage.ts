import type { KeyValueStore } from './quota.ts';

/**
 * KeyValueStore backed by the extension's local storage (`browser.storage.local`).
 * Settings, preferences and quota live here; the video cache and imported history
 * go into IndexedDB (added with the Takeout importer).
 */
export function extensionStore(area: { get: Function; set: Function }): KeyValueStore {
  return {
    async get<T>(key: string) {
      const result = await area.get(key);
      return result?.[key] as T | undefined;
    },
    async set<T>(key: string, value: T) {
      await area.set({ [key]: value });
    },
  };
}

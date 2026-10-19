/** Shared extension-side instances: one quota tracker and one API client per page. */
import { QuotaTracker } from './quota.ts';
import { extensionStore } from './storage.ts';
import { YouTubeClient } from './api/client.ts';

export const store = extensionStore(browser.storage.local);

export const quota = new QuotaTracker(store);

const KEY = 'apiKey';
export const apiKey = {
  get: () => store.get<string>(KEY),
  set: (value: string) => store.set(KEY, value.trim()),
  clear: () => browser.storage.local.remove(KEY),
};

export const client = new YouTubeClient({ getKey: apiKey.get, quota });

const CLIENT_ID = 'oauthClientId';
/** OAuth client ID for the optional rating sync. Not a secret, but kept local like everything else. */
export const oauthClientId = {
  get: () => store.get<string>(CLIENT_ID),
  set: (value: string) => store.set(CLIENT_ID, value.trim()),
  clear: () => browser.storage.local.remove(CLIENT_ID),
};

/** Lets the quota meter update whenever any call is recorded. */
export function onQuotaChange(cb: () => void): () => void {
  const listener = (changes: Record<string, unknown>, area: string) => {
    if (area === 'local' && 'quota' in changes) cb();
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}

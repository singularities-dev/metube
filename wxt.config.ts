import { resolve } from 'node:path';
import { defineConfig } from 'wxt';
import { CATALOGS } from './src/lib/i18n/catalogs';
import { en } from './src/lib/i18n/messages/en';

/** The browser's own locale folders for each UI language (English (UK) is the default, "en"). */
const MANIFEST_LOCALES = { en: 'en-GB', fr: 'fr', de: 'de', es: 'es' } as const;

// Manifest V3 for Chrome; WXT emits an MV2-compatible build for Firefox where needed.
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'MeTube',
    // Shown in the browser's add-on list, in the browser's language (see _locales below).
    description: '__MSG_extDescription__',
    default_locale: 'en',
    homepage_url: 'https://github.com/singularities-dev/metube',
    // The toolbar button that opens MeTube (WXT writes browser_action for Firefox's MV2 build).
    action: {
      default_title: '__MSG_extActionTitle__',
      default_icon: { 16: 'icon/16.png', 32: 'icon/32.png', 48: 'icon/48.png' },
    },
    // Minimal permissions keep store review simple.
    // `unlimitedStorage` marks IndexedDB as persistent, so the browser won't evict
    // imported history under disk pressure. `identity` lets the optional sync with
    // YouTube open Google sign-in. Neither triggers an install warning.
    permissions: ['storage', 'unlimitedStorage', 'identity'],
    host_permissions: ['https://www.googleapis.com/*'],
    browser_specific_settings: {
      gecko: {
        id: 'metube@singularities-dev',
        // data_collection_permissions needs Firefox 140+.
        strict_min_version: '140.0',
        // Firefox's data-collection declaration. Nothing goes to the developer, but Mozilla
        // counts any data sent off the device, third parties included: searches, video and
        // channel IDs from imported history, and (when syncing) ratings and subscriptions,
        // all sent to Google's API with the user's own key or sign-in.
        data_collection_permissions: { required: ['browsingActivity', 'searchTerms', 'websiteActivity'] },
      },
    },
  },
  hooks: {
    // GPL-3.0 and the bundled fonts' OFL ask for their licence texts to ship with the add-on.
    'build:publicAssets': (wxt, files) => {
      for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.txt']) {
        files.push({ absoluteSrc: resolve(wxt.config.root, name), relativeDest: name });
      }
      // The manifest's description per language, from the same catalogues as the UI.
      for (const [dir, locale] of Object.entries(MANIFEST_LOCALES)) {
        const message = (key: 'manifest.description' | 'manifest.actionTitle') => ({ message: String(CATALOGS[locale][key] ?? en[key]) });
        files.push({
          relativeDest: `_locales/${dir}/messages.json`,
          contents: JSON.stringify({ extDescription: message('manifest.description'), extActionTitle: message('manifest.actionTitle') }, null, 2),
        });
      }
    },
  },
  // Dev runs reuse one browser profile, so imports, the API key and settings
  // survive restarts of `npm run dev`. Profiles live in .dev-profiles/ (git-ignored).
  webExt: {
    keepProfileChanges: true,
    firefoxProfile: '.dev-profiles/firefox',
    chromiumArgs: ['--user-data-dir=.dev-profiles/chromium'],
  },
});

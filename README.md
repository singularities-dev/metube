# MeTube

Browser extension (Firefox + Chrome) that curates video listings by your own preferences, tags, mood and ratings instead of the platform's algorithm. Local-first: your data stays in your browser, and you use your own YouTube Data API key.

## Use

Click MeTube's toolbar button to open it (it also opens once, right after installing). The page's address is `moz-extension://<install id>/curator.html` in Firefox (the ID is under about:debugging → This Firefox) or `chrome-extension://<extension id>/curator.html` in Chrome.

## Develop

```sh
npm install
npm run dev            # Chrome, hot reload
npm run dev:firefox    # Firefox
npm test               # Vitest
npm run build && npm run build:firefox
```

Dev runs reuse a browser profile in `.dev-profiles/`, so imported history, your API key and settings survive restarts. Delete that folder for a clean start.

## Layout

- `src/lib/` – pure TypeScript core (quota, Takeout parsers, API client, 30-day cache and library, feed ranking and filters, ratings and preference model, tags, moods, prefs, channel subscriptions, sync with YouTube (ratings and subscriptions) and Google sign-in)
- `src/entrypoints/curator/` – the app: Explore (feed, moods, filters), Tags (with Activity), Settings
- `src/lib/i18n/` – translations: English (UK), French, German and Spanish catalogues (one file per namespace in `messages/<language>/`), message formatting and locale-aware dates and numbers
- `src/entrypoints/watch.content.ts` – small note on YouTube watch pages: rate a video you opened from MeTube, or a reminder to like on YouTube what you rated in MeTube
- `src/entrypoints/background.ts` – service worker; answers the watch-page note from MeTube's database
- `fixtures/` – recorded API responses for tests (never commit keys; `fixtures/private/` is ignored)

## License

GPL-3.0-only. See [LICENSE](LICENSE). Bundled third-party code and fonts keep their own licences, listed in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).

## Compliance notes

Official YouTube Data API only (no scraping), API metadata refreshed or deleted within 30 days, playback via the official player only, no ad blocking, minimal permissions.

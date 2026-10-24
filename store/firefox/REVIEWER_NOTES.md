# Notes to reviewer (paste into "Notes to Reviewer")

MeTube is a YouTube feed curator. It uses the official YouTube Data API v3 with the user's own API key; there is no developer server.

**Opening MeTube:** click its toolbar button (it also opens once after install).

**Testing:** the extension needs a YouTube Data API key (free, from Google Cloud, Settings → "How to get an API key"). Without one you can still open MeTube, import a Google Takeout file (a sample is in the source at fixtures/) and browse Tags, Activity and Settings. Happy to provide a restricted test key on request.

**Permissions**
- `storage`, `unlimitedStorage`: all data (imported history, settings, cached metadata) is kept locally in IndexedDB/extension storage. Takeout imports can be large.
- Toolbar button (`browser_action`): opens MeTube's page, or focuses its tab. It finds the tab through `extension.getViews()`, so it needs no `tabs` permission.
- `identity`: optional sync with YouTube. Opens Google sign-in (launchWebAuthFlow) only when the user presses "Sync now" and has configured their own OAuth client (scope `youtube.force-ssl`). During that sync only, the token is used to send the user's ratings (videos.rate), read their subscriptions (subscriptions.list mine=true) and apply the subscribes/unsubscribes they made in MeTube (subscriptions.insert/delete). The sign-in URL includes `hl=<MeTube's UI language>`. The token is held in memory for that sync only and never stored.
- `https://www.googleapis.com/*`: YouTube Data API requests.
- Content script on `https://www.youtube.com/*`: reads the current video ID from the URL and MeTube's language setting from extension storage, and may show a small note in a shadow DOM. If the user opened the video from MeTube in the last 24 hours and hasn't rated it, the note offers MeTube's ratings (saved locally through a runtime message to the background script). If the user's MeTube rating isn't on YouTube yet, it reminds them to like or dislike it there themselves. It never reads, modifies or clicks YouTube's page content and makes no network requests.

**Data collection:** declared as required: `browsingActivity` (video and channel IDs from the user's imported watch history, sent to the YouTube Data API to fetch metadata), `searchTerms` (searches the user runs from MeTube) and `websiteActivity` (ratings and subscription changes sent to YouTube during an optional sync). Nothing is sent to the developer; every request goes to Google with the user's own API key or sign-in.

**Lint warnings:** two `UNSAFE_VAR_ASSIGNMENT` warnings come from React's DOM code in the bundled chunk, not from MeTube's code. The content script sets innerHTML only to a static template; all dynamic text uses textContent.

**Source code:** see SOURCE.md in the source archive for build steps.

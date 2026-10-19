# Notes to reviewer (paste into "Notes to Reviewer")

MeTube is a YouTube feed curator. It uses the official YouTube Data API v3 with the user's own API key; there is no developer server.

**Testing:** the extension needs a YouTube Data API key (free, from Google Cloud, Settings → "How to get an API key"). Without one you can still open MeTube, import a Google Takeout file (a sample is in the source at fixtures/) and browse Tags, Activity and Settings. Happy to provide a restricted test key on request.

**Permissions**
- `storage`, `unlimitedStorage`: all data (imported history, settings, cached metadata) is kept locally in IndexedDB/extension storage. Takeout imports can be large.
- `identity`: optional sync with YouTube. Opens Google sign-in (launchWebAuthFlow) only when the user presses "Sync now" and has configured their own OAuth client (scope `youtube.force-ssl`). During that sync only, the token is used to send the user's ratings (videos.rate), read their subscriptions (subscriptions.list mine=true) and apply the subscribes/unsubscribes they made in MeTube (subscriptions.insert/delete). The token is held in memory for that sync only and never stored.
- `https://www.googleapis.com/*`: YouTube Data API requests.
- Content script on `https://www.youtube.com/*`: reads the current video ID from the URL and may show a small note in a shadow DOM. If the user opened the video from MeTube in the last 24 hours and hasn't rated it, the note offers MeTube's ratings (saved locally through a runtime message to the background script). If the user's MeTube rating isn't on YouTube yet, it reminds them to like or dislike it there themselves. It never reads, modifies or clicks YouTube's page content and makes no network requests.

**Data collection:** `data_collection_permissions: none`. Nothing is sent to the developer. Requests go only to Google, on the user's behalf.

**Lint warnings:** two `UNSAFE_VAR_ASSIGNMENT` warnings come from React's DOM code in the bundled chunk, not from MeTube's code. The content script sets innerHTML only to a static template; all dynamic text uses textContent.

**Source code:** see SOURCE.md in the source archive for build steps.

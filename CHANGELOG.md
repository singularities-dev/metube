# Changelog

All notable changes to MeTube are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Toolbar button.** Opens MeTube, or switches to its tab if it's already open. Its tooltip follows the browser's language. No extra permissions.

### Fixed
- Choosing a category now brings in that category's popular videos on YouTube (1 unit, cached for 6 hours) instead of only filtering what your channels had, which often left it nearly empty.
- Rating or removing a video no longer reshuffles the feed: only that video (or, for "Don't show this channel", that channel) goes, and what MeTube learned applies on the next refresh. Before, related videos could drop off the page at the same time.

## [0.1.0] - 2026-10-19

First public beta for Firefox and Chrome.

### Added
- **Languages.** The whole interface, including the note on YouTube pages and the add-on's description, is available in English (UK), French, German and Spanish. Switch with the flag in the top right; MeTube starts in your browser's language when it's one of these. Numbers, dates and times follow the chosen language.
- Starter moods search YouTube with tags in your language (until you edit them), and Uncharted topics are named in your language.
- Google sign-in for sync opens in the chosen language.
- Google Takeout exports in French, German or Spanish are recognised by their content, not by English file names. JSON exports work fully; localised HTML exports are recognised but their dates aren't read yet, so use JSON for those.

- Confirmations (delete a mood, remove imported history) use MeTube's own dialog, in MeTube's language.
- **Your own feed.** Built from your Google Takeout history (watch history, searches, subscriptions and playlists) and your own YouTube Data API key, instead of YouTube's recommendations.
- **Ratings.** Love, Like, Neutral, Dislike or Hate any video. You can also remove videos as not interested or already watched, or hide a channel. The feed learns from all of it, with Undo.
- **Moods.** Branching moods (for example Energetic › Motorsport) with their own tags, an intensity setting and schedules. Moods learn from ratings given while they're on, and include 30+ starter moods.
- **Tags.** Like or block tags across every feed. Matching ignores spacing and hyphens and knows a few common aliases (sci-fi, scifi, science fiction).
- **Channel scopes.** Everything, Channels I know, New to me, and Uncharted (topics and channels outside your history and likes; only your dislikes still apply).
- **Filters.** Tag, category, date (past day, week, month, year or a custom range) and views (lesser seen or very popular). YouTube searches follow the same filters.
- **Channel subscriptions.** Subscribe with the bell on any video; new subscriptions' uploads join the feed. Takeout imports merge with your list instead of replacing it.
- **Optional sync with YouTube.** Uses your own OAuth client and a sign-in each time; nothing is stored. Sends ratings as likes or dislikes, reads your YouTube subscriptions and sends the subscribes and unsubscribes you make in MeTube, in capped batches that leave quota for your feed.
- **Watch-page note on youtube.com.** Rate a video you opened from MeTube, or get a reminder to like on YouTube what you rated in MeTube.
- **Shorts detection.** Uses video shape (vertical and up to 3 minutes), #shorts tags and length. With Hide Shorts on, channel uploads come from YouTube's long-form list.
- **Activity.** Viewing patterns by month and hour, top channels, your subscriptions, your ratings and what's still pending on YouTube, and removed videos and hidden channels.
- **Quota care.** A local quota meter, a 30-day library of fetched videos reused across filters and searches, and 12-hour caching of searches.
- **Light, dark and system themes**, with the active mood tinting the background.

### Accessibility
- Checked against WCAG 2.2 AA.
- Contrast-safe colours in both themes at every mood hue, and visible control edges.
- Full keyboard use, with focus kept in place when panels close or items are removed.
- Reliable screen-reader announcements and a skip link.
- Support for forced-colours (High Contrast) and "increase contrast" modes.

### Privacy
- No servers, analytics or tracking. Everything stays in your browser.
- Requests go only to Google, with your own key or sign-in.
- YouTube API data is refreshed or deleted within 30 days, as YouTube's policies require. See [PRIVACY.md](PRIVACY.md).

### Known limitations
- Playing videos inside MeTube is built but switched off: YouTube's embedded player doesn't work inside extension pages yet. Videos open on youtube.com.
- Sign-in for sync isn't supported on Firefox for Android.

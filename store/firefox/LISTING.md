# Firefox Add-ons (AMO) listing

## Submitting the beta

1. `npm run zip` (or `npx wxt zip -b firefox`). Upload `.output/metube-<version>-firefox.zip`.
2. Sign in at https://addons.mozilla.org/developers/ and choose **Submit a New Add-on**.
3. Distribution: **On your own** (unlisted, signed; share the file) for a closed beta, or **On this site** (listed) with "Beta" in the summary.
4. Platforms: Firefox for desktop. Leave Android off for now (sync sign-in isn't supported there).
5. When asked about source code, answer **Yes** and upload `.output/metube-<version>-sources.zip`.
6. Paste the fields below. Tick "This add-on has a privacy policy" and paste PRIVACY.md. Paste REVIEWER_NOTES.md into "Notes for Reviewers".
7. Listed only: after submitting, open Edit Product Page → Images and add the screenshots from `store/firefox/screenshots/`.
8. Each later upload needs a higher `version` in package.json.

The source archive was checked to rebuild a byte-identical add-on.

## Name
MeTube

## Summary (max 250 characters)
Your YouTube feed, built from your own history, ratings and moods instead of YouTube's algorithm. Uses your own YouTube API key; your data is stored only in your browser. Beta.

## Description
MeTube builds a calm video feed from what you actually watch and like, instead of what YouTube's algorithm wants you to watch.

- **Your channels, your history.** Import your Google Takeout and MeTube learns which channels and topics you return to.
- **Moods.** Pick a mood such as Focus, Chill or Learn something, and the feed re-sorts to match. Moods can switch on by schedule, branch into sub-moods and learn from your ratings.
- **Rate and remove.** Five ratings from Love to Hate, and "not interested", "already watched" or "hide channel". The feed learns from all of it.
- **Explore new channels**, or stick to channels you know. **Uncharted** goes further: topics and channels outside everything you watch and like, with only your dislikes still applied.
- **Filters.** Choosing a category brings in its popular videos. Narrow by tag, category, date (past day, week, month, year or a custom range) and views (lesser seen or very popular).
- **Saves your quota.** Videos fetched in the last 30 days stay in a local library, so filters and repeat searches often need no API calls.
- **Your ratings on YouTube.** Rate a video from MeTube right on its YouTube page. Activity lists ratings that aren't on YouTube yet, and a small note on the video's page reminds you to like it there, or use the optional batch sync.
- **Subscriptions.** Subscribe to channels with the bell on any video; their uploads join your feed. The optional sync reads your YouTube subscriptions and sends the ones you change in MeTube.
- **In your language.** English, French, German and Spanish; switch with the flag in the top right.
- **Private by design.** No MeTube servers, no analytics, no tracking. Your library stays in this browser; only the searches, video lookups and (if you sync) ratings and subscription changes you make go to Google's YouTube API.
- **Hide Shorts.** Shorts are detected by shape, length and #shorts tags.
- **Plays on YouTube.** Videos open on youtube.com.

**What you need:** a free YouTube Data API key from Google Cloud. MeTube shows you how to get one in a few steps, and tracks your daily quota so you don't run out.

MeTube uses YouTube API Services. By using it you agree to the YouTube Terms of Service (https://www.youtube.com/t/terms). Google Privacy Policy: https://policies.google.com/privacy

This is a beta. Please report problems at https://github.com/singularities-dev/metube/issues

## Categories
Feeds, News & Blogging · Social & Communication (or "Other" if neither fits)

## Tags
youtube, feed, curation, recommendations, privacy

## Support
- Website / homepage: https://github.com/singularities-dev/metube
- Support site: https://github.com/singularities-dev/metube/issues
- Support email: optional; leave blank or use an address that doesn't show your name (issues link above is enough)

## License
GNU General Public License v3.0 (GPL-3.0). The license text is in LICENSE and ships inside the add-on package.

## Privacy policy
Paste the text of PRIVACY.md.

## Screenshots
store/firefox/screenshots/*.png (1280×800).

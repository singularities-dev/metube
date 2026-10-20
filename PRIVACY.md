# MeTube privacy policy

_Last updated: 20 October 2026_

MeTube is a browser extension that builds a YouTube feed from your own data instead of YouTube's recommendations. It is made by singularities-dev with Claude and has no servers: the developer never receives, stores or sees your data.

## What MeTube stores, and where

Everything is stored in your browser's extension storage on your device, and nowhere else:

- **Your Google Takeout import**, if you choose to import one: watch history, search history, subscriptions and playlists.
- **Your YouTube Data API key** and, if you set up syncing, your **OAuth client ID**.
- **Your choices in MeTube**: ratings, channel subscriptions, removed videos, hidden channels, tags, moods and settings.
- **Video and channel details from the YouTube API** (titles, thumbnails, durations and similar), used to build your feed. MeTube refreshes or deletes these within 30 days, as the YouTube API Services policies require.
- **An estimate of your daily API usage**, so MeTube can stay within your quota.

You can remove imported history in Settings → Your data. Removing the extension deletes everything it stored.

## What MeTube sends, and to whom

MeTube talks only to Google, on your behalf. Firefox lists this at install as "browsing activity" (video and channel IDs from your imported history, sent to fetch their details), "search terms" (searches you run in MeTube) and "website activity" (ratings and subscription changes, only if you sync). None of it goes to the developer.


- **YouTube Data API** (`www.googleapis.com`): requests for video, channel and search details, sent with your own API key.
- **Google sign-in** (`accounts.google.com`), only if you use the optional sync. You sign in each time you sync. MeTube uses the sign-in only during that sync, and does not store it, to:
  - send your ratings to YouTube as likes or dislikes;
  - read the list of channels you're subscribed to on YouTube, so MeTube's list matches;
  - subscribe to or unsubscribe from the channels you chose in MeTube.
- **YouTube's image servers** (`i.ytimg.com`), to show video thumbnails.

Google's handling of this data is covered by the [Google Privacy Policy](https://policies.google.com/privacy). MeTube uses YouTube API Services; by using MeTube you agree to the [YouTube Terms of Service](https://www.youtube.com/t/terms).

MeTube has no analytics, no advertising and no tracking, and it never sells or shares your data.

## On youtube.com

MeTube runs a small script on youtube.com that reads the address of the video you are watching and may show a small note:

- If you opened the video from MeTube in the last day and haven't rated it, the note offers MeTube's ratings. A rating you choose there is saved in MeTube, in your browser, like any other rating.
- If you rated the video in MeTube and the rating isn't on YouTube yet, the note reminds you to like or dislike it on YouTube yourself.

The script does not read, change or click anything else on YouTube's pages. It talks only to MeTube inside your browser and sends nothing over the network.

## Revoking access

If you used sync, you can remove MeTube's access to your Google account at any time at [myaccount.google.com/permissions](https://myaccount.google.com/permissions). You can also delete your API key or OAuth client in the Google Cloud Console.

## Changes and contact

Changes to this policy are published in this file, in the [MeTube repository](https://github.com/singularities-dev/metube). Questions: open an issue at [github.com/singularities-dev/metube/issues](https://github.com/singularities-dev/metube/issues).

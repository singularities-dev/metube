import type { Messages } from '../../index.ts';

/**
 * The Settings page: appearance, feed options and the data section.
 * Labels name switches and sliders; hints are the line of help under them.
 * Names quoted in hints must match their labels elsewhere: Explore (the
 * navigation tab) and Edit mood. The page-size hint describes the button under
 * the feed instead of quoting it, since its label includes the count.
 * Shorts is YouTube's name for its short vertical videos: use YouTube's word.
 */
export default {
  'settings.heading': 'Settings',
  'settings.appearance': 'Appearance',
  'settings.theme': 'Theme',
  'settings.feed': 'Feed',
  'settings.pageSize': 'Videos per page',
  'settings.pageSize.hint': 'How many videos Explore shows at once, and how many more the button under the feed adds each time.',
  'settings.poolChannels': 'Channels to draw from',
  'settings.poolChannels.hint': {
    one: 'Your most-watched channels. A full refresh uses about {count} unit.',
    other: 'Your most-watched channels. A full refresh uses about {count} units.',
  },
  'settings.uploadsPerChannel': 'Recent videos per channel',
  'settings.perChannelCap': 'Most from one channel at the top',
  'settings.perChannelCap.hint': 'Stops one busy channel filling the first page. 0 turns this off.',
  'settings.moodFetch': 'Find new videos when I change mood',
  'settings.moodFetch.hint': 'One YouTube search per mood (101 units), reused for 12 hours. Off: moods only re-sort your channels’ videos.',
  'settings.autoMoods': 'Switch moods on schedule',
  'settings.autoMoods.hint': 'Moods with a schedule switch on by themselves when their time starts. Set times in Explore under Edit mood.',
  'settings.playInline': 'Play videos inside MeTube',
  'settings.playInline.hint': 'Clicking a video opens YouTube’s player in a window here, with ratings beside it. Off: opens a new YouTube tab. Ctrl-click always opens a tab.',
  'settings.hideShorts': 'Hide Shorts',
  'settings.hideShorts.hint': 'Vertical videos up to 3 minutes, or a minute or less when the shape is unknown.',
  'settings.hideWatched': 'Hide videos I’ve watched',
  'settings.data': 'Your data',
  'settings.data.hint': 'Everything is stored in this browser only. Clearing removes imported history, not your tags, moods or settings.',
  'settings.data.confirm': 'Remove all imported watch history, searches, subscriptions and playlists from this browser?',
  'settings.data.clear': 'Clear imported history',
} satisfies Messages;

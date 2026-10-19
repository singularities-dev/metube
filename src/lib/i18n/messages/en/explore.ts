import type { Messages } from '../../index.ts';

/**
 * Explore, the main feed: mood shortcuts, the filter toolbar, status lines,
 * empty states and the toasts after rating, removing or subscribing.
 * {mood} is a mood name, {channel} a YouTube channel, {tag} and {query} what
 * the user typed: all left as they are. {mood} may be an adjective
 * ("Energetic"), an imperative ("Make me laugh") or anything the user typed,
 * so never put it bare after a preposition or verb: always introduce it with
 * the word for mood and quote it (the “{mood}” mood), or use a label form
 * ("Mood: {mood}"). {topic} is what the feed searched for:
 * in the "exploring" messages (New to me) one of the user's own tags or
 * searches, left as it is; in the "charting" messages (Uncharted) a translated
 * topic label (uncharted.topic.*), always a bare noun phrase.
 * {rating} is a short rating name (rating.*.short, such as "Love") and
 * {views} a short number such as "10K".
 * Labels quoted in other messages must match their own messages: the buttons
 * "Fresh feed" and "Search YouTube", the channel choices "New to me" and
 * "Everything", the "Settings" page (app.nav.settings) and the filter kinds
 * "only" and "hide" (explore.filter.chip.*). explore.filter.only.label and
 * explore.filter.hide.label are the names screen readers give the Only and
 * Hide buttons, so each must contain that button's visible text.
 */
export default {
  'explore.noKey.title': 'Connect your YouTube key to start',
  'explore.noKey.body': 'Your feed is built from your own history using your own API key. It takes a minute to set up.',
  'explore.noKey.openSettings': 'Open settings',

  // Name of the group of shortcut buttons, one per recent mood.
  'explore.quickMoods': 'Switch mood',
  // Each shortcut button's name for screen readers; it must contain the button's text, the mood's name.
  'explore.switchTo': 'Switch to the “{mood}” mood',
  'explore.editMood': 'Edit mood',
  'explore.freshFeed': 'Fresh feed',
  'explore.freshFeed.hint': 'Re-fetches every channel and your mood, and moves videos you’ve already been shown out of the way.',
  'explore.refresh': 'Refresh feed',
  'explore.refresh.title': 'Refresh (uses cached results where they’re still current)',

  'explore.filter.region': 'Filter the feed',
  'explore.filter.placeholder': 'Filter by tag or word',
  // Buttons beside the filter box: show only videos with what’s typed, or hide them.
  'explore.filter.only': 'Only',
  'explore.filter.only.label': 'Only show videos with {tag}',
  'explore.filter.hide': 'Hide',
  'explore.filter.hide.label': 'Hide videos with {tag}',
  // Enter and Shift+Enter are keys; “only” and “hide” are explore.filter.chip.*.
  'explore.filter.hint': 'Enter adds “only”, Shift+Enter adds “hide”.',
  'explore.filter.active': 'Active filters',
  // The kind of an active filter, shown in small text before its tag.
  'explore.filter.chip.only': 'only',
  'explore.filter.chip.hide': 'hide',
  // Remove buttons on those filters.
  'explore.filter.removeOnly': 'Remove filter “only {tag}”',
  'explore.filter.removeHide': 'Remove filter “hide {tag}”',
  'explore.search': 'Search YouTube',
  'explore.search.busy': 'Searching…',
  // Units are YouTube API quota units; 101 and 12 are fixed.
  'explore.search.hint': 'Search YouTube uses up to 101 units; repeat searches within 12 hours are free.',
  'explore.searchFor': 'Search YouTube for “{query}”',
  'explore.clearFilters': 'Clear filters',

  // Which channels the feed draws from: a group of four buttons named "Channels".
  'explore.scope.group': 'Channels',
  'explore.scope.all.label': 'Everything',
  'explore.scope.all.hint': 'Channels you know and new ones.',
  'explore.scope.known.label': 'Channels I know',
  'explore.scope.known.hint': 'Only channels you watch, subscribe to or rated well.',
  'explore.scope.new.label': 'New to me',
  'explore.scope.new.hint': 'Only channels you haven’t watched yet, around your interests.',
  'explore.scope.uncharted.label': 'Uncharted',
  'explore.scope.uncharted.hint': 'Topics and channels outside your history and likes. Your moods and liked tags are set aside; blocked tags and dislikes still apply.',
  // Follows the Uncharted hint when a mood is active.
  'explore.scope.uncharted.moodPaused': 'The “{mood}” mood is paused while you’re here.',

  // Menu of when videos were published.
  'explore.time.label': 'When',
  'explore.time.any': 'Any time',
  'explore.time.day': 'Past day',
  'explore.time.week': 'Past week',
  'explore.time.month': 'Past month',
  'explore.time.year': 'Past year',
  'explore.time.custom': 'Custom range…',
  'explore.time.customRange': 'Custom date range',
  // Start and end dates of the custom range.
  'explore.time.from': 'From',
  'explore.time.to': 'To',

  // Menu of how many views videos have: lesser-seen ones, or popular ("Pop") ones.
  'explore.views.label': 'Views',
  'explore.views.any': 'Any views',
  'explore.views.lesser': 'Lesser (under {views} views)',
  'explore.views.popular': 'Pop (over {views} views)',

  // YouTube's video categories (category.*); "All" turns the category filter off.
  'explore.category.group': 'Category',
  'explore.category.all': 'All',

  'explore.busy.pool': 'Updating your feed…',
  'explore.busy.fresh': 'Building a fresh feed…',
  'explore.busy.mood': 'Finding videos for the “{mood}” mood…',
  'explore.busy.new': 'Finding channels new to you…',
  'explore.busy.uncharted': 'Charting somewhere new…',
  'explore.busy.search': 'Searching YouTube…',

  // Status after the feed loads, followed by common.unitsUsed. "Exploring" is a
  // search around the user's interests (New to me); "charting" one outside them (Uncharted).
  'explore.note.fresh': { one: 'Fresh feed from {count} channel.', other: 'Fresh feed from {count} channels.' },
  'explore.note.fresh.exploring': {
    one: 'Fresh feed from {count} channel, exploring “{topic}”.',
    other: 'Fresh feed from {count} channels, exploring “{topic}”.',
  },
  'explore.note.fresh.charting': {
    one: 'Fresh feed from {count} channel, charting “{topic}”.',
    other: 'Fresh feed from {count} channels, charting “{topic}”.',
  },
  'explore.note.mood': 'Showing the “{mood}” mood.',
  'explore.note.mood.exploring': 'Showing the “{mood}” mood, exploring “{topic}”.',
  // The feed was fetched again (units were used) or nothing needed fetching.
  'explore.note.updated': 'Updated.',
  'explore.note.updated.exploring': 'Updated, exploring “{topic}”.',
  'explore.note.updated.charting': 'Updated, charting “{topic}”.',
  'explore.note.upToDate': 'Up to date.',
  'explore.note.upToDate.exploring': 'Up to date, exploring “{topic}”.',
  'explore.note.upToDate.charting': 'Up to date, charting “{topic}”.',
  // After Search YouTube, followed by common.unitsUsed or explore.note.fromLibrary.
  'explore.note.searchAdded': 'Results for “{query}” added.',
  'explore.note.fromLibrary': 'From your library, no units used.',
  // Follows the status when filters are on.
  'explore.matches': { one: '{count} video matches.', other: '{count} videos match.' },

  'explore.empty.title': 'Nothing matches yet',
  'explore.empty.newNoInterests': 'New to me explores your interests, and it doesn’t know any yet. Like a few tags, rate some videos, or import your search history in Settings.',
  'explore.empty.new': 'No new channels match right now. Try Fresh feed to explore another of your interests, or switch to Everything.',
  'explore.empty.uncharted': 'Nothing uncharted matches right now. Try Fresh feed for another topic, or loosen your filters.',
  'explore.empty.filtered': 'Try fewer filters, add tags to this mood, or search YouTube to bring in new videos.',
  'explore.empty.noChannels': 'Import your watch history in Settings so your feed has channels to draw from.',

  // Heading of the feed, for screen readers.
  'explore.videos': 'Videos',
  'explore.attribution': 'Video data from YouTube. Videos play on YouTube. <link>YouTube Terms</link>',

  'explore.toast.rated': 'Rated “{rating}”.',
  'explore.toast.ratedForMood': 'Rated “{rating}”. The “{mood}” mood will learn from it.',
  'explore.toast.ratingRemoved': 'Rating removed.',
  // A video was removed from the feed for this reason (dismiss.*).
  'explore.toast.removed.not-interested': 'Removed: not interested.',
  'explore.toast.removed.already-watched': 'Removed: already watched.',
  'explore.toast.channelHidden': '{channel} hidden.',
  'explore.toast.subscribed': 'Subscribed to {channel}. Their new videos join your feed on the next refresh.',
  'explore.toast.unsubscribed': 'Unsubscribed from {channel}.',
  'explore.toast.unsubscribedSync': 'Unsubscribed from {channel}. Sync to remove it on YouTube too.',
} satisfies Messages;

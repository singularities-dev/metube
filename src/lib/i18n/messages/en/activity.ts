import type { Messages } from '../../index.ts';

/**
 * The Activity view: watch statistics, subscriptions, ratings, what MeTube has
 * learned and what was removed from the feed. {channel} and {title} are a
 * channel's or video's name, {date} a formatted date. {mood} is a mood name or
 * path, left as it is; it may be an adjective ("Energetic"), an imperative
 * ("Make me laugh") or anything the user typed, so always introduce it with the
 * word for mood and quote it (the “{mood}” mood), or use a label form
 * ("Mood: {mood}"). Explore and Settings are
 * the names of views (app.nav.*). Keys ending in Label or .label are accessible
 * names for buttons and must contain the button's visible text, where it has some.
 */
export default {
  // Link text when a video's title isn't known.
  'activity.openOnYouTube': 'Open on YouTube',

  'activity.glance.heading': 'At a glance',
  // Labels of the numbers under that heading.
  'activity.glance.watched': 'Videos watched',
  'activity.glance.searches': 'Searches',
  'activity.glance.rated': 'Rated in MeTube',
  'activity.glance.removed': 'Removed from feed',
  'activity.glance.since': 'Imported history goes back to {date}.',

  'activity.months.heading': 'Videos watched per month',
  'activity.months.caption': 'Bar chart of videos watched per month from your imported history.',
  'activity.hours.heading': 'When you watch',
  'activity.hours.hint': 'By hour of the day, in your local time.',
  'activity.hours.caption': 'Bar chart of videos watched by hour of day.',
  // Column heading in a chart's table view: the number of videos.
  'activity.chart.valueHeading': 'Videos',

  'activity.channels.heading': 'Channels you watch most',
  'activity.channels.subscribeLabel': 'Subscribe to {channel}',
  // Tooltips on the bell button.
  'activity.channels.subscribeTitle': 'Subscribe',
  'activity.channels.subscribedTitle': 'Subscribed (select to unsubscribe)',

  'activity.subs.heading': 'Your subscriptions',
  'activity.subs.count': { one: '{count} channel.', other: '{count} channels.' },
  'activity.subs.none': 'None yet. Subscribe with the bell on any video.',
  'activity.subs.pending': {
    one: '{count} change isn’t on YouTube yet. Sync in Settings to send it; until then it’s only in MeTube.',
    other: '{count} changes aren’t on YouTube yet. Sync in Settings to send them; until then they’re only in MeTube.',
  },
  'activity.subs.boost': 'Subscribed channels get a boost in your feed.',
  // Label of the field that filters subscriptions by channel name.
  'activity.subs.find': 'Find',
  'activity.subs.findPlaceholder': 'Channel name',
  // Where a subscription came from, under its channel name.
  'activity.subs.source.metube': 'Subscribed in MeTube',
  'activity.subs.source.metubeOn': 'Subscribed in MeTube {date}',
  'activity.subs.source.youtube': 'From YouTube',
  'activity.subs.source.takeout': 'From your Takeout',
  // {source} is one of the activity.subs.source.* messages.
  'activity.subs.notOnYouTube': '{source} · not on YouTube yet',
  'activity.subs.unsubscribe': 'Unsubscribe',
  'activity.subs.unsubscribeLabel': 'Unsubscribe from {channel}',
  // {query} is what the user typed.
  'activity.subs.noMatch': 'No subscriptions match “{query}”.',
  'activity.subs.unsubPending.heading': 'Unsubscribed, still on YouTube',
  'activity.subs.unsubPending.note': 'Removed on YouTube at your next sync',
  // Button that cancels a pending unsubscribe.
  'activity.subs.keep': 'Keep',
  'activity.subs.keepLabel': 'Keep subscription to {channel}',

  // Screen-reader announcements after an action.
  'activity.status.subscribed': 'Subscribed to {channel}',
  'activity.status.unsubscribed': 'Unsubscribed from {channel}',

  'activity.ratings.heading': 'Your ratings',
  // Above the list: how many videos have each rating. {rating} is a rating button's name (rating.*.short), used as a
  // category label, so put it in a label position rather than make it agree with the number. <n> is the number,
  // shown large, and <r> the name; keep both. Screen readers get countSpoken instead.
  'activity.ratings.count': '<n>{count}</n> <r>{rating}</r>',
  // Only screen readers read countSpoken, and they don't say quotation marks, so put {rating} in a label position
  // (as in tile.link.rated: "your rating: {rating}"), never after a verb, a participle or "como".
  'activity.ratings.countSpoken': { one: '{rating}: {count} video', other: '{rating}: {count} videos' },
  // A filter: the group's label, then its two buttons (all ratings, or only those YouTube doesn't have yet).
  'activity.ratings.filter': 'Show',
  'activity.ratings.filterAll': 'All',
  'activity.ratings.filterPending': 'Not on YouTube yet ({count})',
  // Pending videos may want a like, a dislike or a like or dislike removed; each one's link (activity.yt.*) says which.
  'activity.ratings.pendingHint': 'Open each on YouTube, do what its link says, then mark it done. Or set up syncing in Settings.',
  'activity.ratings.empty': 'Rate videos in Explore with the heart button on each video. Every rating teaches your feed.',
  // Under each rated video; {mood} is the mood it was rated in.
  'activity.ratings.meta': '{channel}, {date}',
  'activity.ratings.metaMood': '{channel}, {date}, in the “{mood}” mood',
  'activity.ratings.change': 'Change rating for {title}',
  'activity.ratings.changeNoTitle': 'Change rating for video from {channel}',
  'activity.ratings.remove': 'Remove rating',
  // {rating} is a rating's short name (rating.*.short).
  'activity.ratings.rated': 'Rated {title}: {rating}',
  'activity.ratings.ratedNoTitle': 'Rated video from {channel}: {rating}',
  'activity.ratings.removed': 'Removed rating for {title}',
  'activity.ratings.removedNoTitle': 'Removed rating for video from {channel}',

  // Links that open the video so the user can do this on YouTube themselves.
  'activity.yt.like': 'Like on YouTube',
  'activity.yt.dislike': 'Dislike on YouTube',
  // States: YouTube already has the rating.
  'activity.yt.liked': 'Liked on YouTube',
  'activity.yt.disliked': 'Disliked on YouTube',
  'activity.yt.removeLike': 'Remove like on YouTube',
  'activity.yt.removeDislike': 'Remove dislike on YouTube',
  'activity.undo.stillLike': 'Rating removed in MeTube. YouTube still has your like.',
  'activity.undo.stillDislike': 'Rating removed in MeTube. YouTube still has your dislike.',

  // Button: the user has made the change on YouTube by hand.
  'activity.markDone': 'Mark done',
  'activity.markDone.label': 'Mark done for {title}',
  'activity.markDone.labelNoTitle': 'Mark done for video from {channel}',
  'activity.markDone.status': 'Marked done for {title}',
  'activity.markDone.statusNoTitle': 'Marked done for video from {channel}',

  'activity.learned.heading': 'What MeTube has learned',
  'activity.learned.hint': 'From your ratings and removals. These shape your feed alongside the tags you set yourself.',
  // Headings over lists of tags.
  'activity.learned.enjoy': 'You tend to enjoy',
  'activity.learned.skip': 'You tend to skip',

  'activity.removed.heading': 'Removed from your feed',
  'activity.removed.channels': 'Hidden channels',
  // When the channel was hidden.
  'activity.removed.hiddenOn': 'Hidden {date}',
  'activity.removed.showAgain': 'Show again',
  'activity.removed.showAgainLabel': 'Show again: {channel}',
  'activity.removed.showingAgain': 'Showing {channel} again',
  // Heading: removed videos, after the hidden channels.
  'activity.removed.videos': 'Videos',
  // {reason} is how it was removed (dismiss.*.label).
  'activity.removed.meta': '{reason}, {channel}, {date}',
  'activity.removed.restore': 'Restore',
  'activity.removed.restore.label': 'Restore {title}',
  'activity.removed.restore.labelNoTitle': 'Restore video from {channel}',
  'activity.removed.restore.status': 'Restored {title}',
  'activity.removed.restore.statusNoTitle': 'Restored video from {channel}',
} satisfies Messages;

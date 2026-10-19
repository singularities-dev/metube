import type { Messages } from '../../index.ts';

/**
 * The Tags page: liked and blocked tags, and suggestions from searches and from
 * videos in the feed. {tag} is a tag or search phrase, shown as it is. "Settings"
 * and "Explore" name the app's sections and must match their navigation labels
 * (app.nav.settings, app.nav.explore).
 */
export default {
  'tags.title': 'Tags',
  'tags.activityTitle': 'Activity',
  /** Accessible name of the row of two tabs ("Your tags", "Activity") that switch this page's section. */
  'tags.tabs': 'Section',
  'tags.tab.tags': 'Your tags',
  'tags.tab.activity': 'Activity',
  'tags.lede': 'Tags shape every feed, whatever mood you’re in. Liked tags rise to the top; blocked tags never appear.',

  /** Heading of the list of liked tags (show more videos with these tags); also the list's accessible name. */
  'tags.liked': 'More of',
  'tags.liked.placeholder': 'Add a tag you like',
  /** Heading of the list of blocked tags (hide videos with these tags); also the list's accessible name. */
  'tags.blocked': 'Never show',
  'tags.blocked.placeholder': 'Add a tag to block',

  'tags.fromSearches': 'From your searches',
  'tags.fromSearches.hint': 'Phrases and recurring words from your imported search history. The number is how often you searched it.',
  'tags.fromSearches.empty': 'Import your search history in Settings to see suggestions here.',
  /** Shown on hover over a suggested search phrase and read after it by screen readers. */
  'tags.fromSearches.detail': { one: 'Searched {count} time', other: 'Searched {count} times' },
  'tags.fromVideos': 'From videos in your feed',
  'tags.fromVideos.hint': 'Tags creators put on recent videos in your feed, with how many carry each. These refresh as your feed does.',
  'tags.fromVideos.empty': 'Open Explore to load your feed, then suggestions appear here.',
  /** Shown on hover over a suggested tag and read after it by screen readers. */
  'tags.fromVideos.detail': { one: 'On {count} video in your feed', other: 'On {count} videos in your feed' },

  /** Icon button on a suggestion: adds {tag} to "More of". */
  'tags.like': 'Like {tag}',
  /** Tooltip of that button. */
  'tags.like.title': 'See more of this',
  /** Icon button on a suggestion: adds {tag} to "Never show". */
  'tags.block': 'Block {tag}',
  /** Tooltip of that button. */
  'tags.block.title': 'Never show this',
} satisfies Messages;

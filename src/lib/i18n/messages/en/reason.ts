import type { Messages } from '../../index.ts';

/**
 * Why a video is in the feed, shown under each tile. Up to two are joined with
 * reason.separator and the first letter capitalised, so each starts lower-case
 * (unless the language capitalises that word anyway). {tags} is one or two
 * tags, left as they are and already joined the language's way ("lofi and
 * chill"): the user's own, or a starter mood's tags in the UI language
 * (moodSeedTags.ts). {topic} is an Uncharted topic's translated label
 * (uncharted.topic.*). Any two reasons can appear together (newToYou then new
 * is common), so each must say whether it is about the channel or the video,
 * and no two should repeat the same word. Any reason can come first and take
 * the capital, so don't start one with a word that then reads as a command or
 * a button name (such as “like”).
 */
export default {
  // Between two reasons. It must differ from the commas inside a list of tags (French puts a narrow no-break space before ';').
  'reason.separator': '; ',
  'reason.uncharted': 'uncharted',
  'reason.unchartedTopic': 'uncharted: {topic}',
  'reason.moodTags': 'fits your mood: {tags}',
  'reason.moodChannel': 'a channel you like in this mood',
  'reason.likedTags': 'tags you like: {tags}',
  'reason.moodLearned': 'this mood has learned you like this',
  'reason.moodSearch': 'found for this mood',
  'reason.search': 'from your search',
  'reason.newToYou': 'a channel new to you',
  'reason.ratedChannel': 'a channel you rate highly',
  'reason.ratedSimilar': 'similar to videos you rated well',
  'reason.rewatch': 'a channel you rewatch',
  'reason.subscribed': 'subscribed',
  'reason.library': 'from your library',
  'reason.new': 'just published',
} satisfies Messages;

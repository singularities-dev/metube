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
 * and no two should repeat the same word.
 */
export default {
  // Between two reasons. It must differ from the commas inside a list of tags (French puts a narrow no-break space before ';').
  'reason.separator': '; ',
  'reason.uncharted': 'Neuland',
  'reason.unchartedTopic': 'Neuland: {topic}',
  'reason.moodTags': 'passt zu deiner Stimmung: {tags}',
  'reason.moodChannel': 'in dieser Stimmung gern gesehener Kanal',
  'reason.likedTags': 'bevorzugte Tags: {tags}',
  'reason.moodLearned': 'gefällt dir laut dieser Stimmung',
  'reason.moodSearch': 'für diese Stimmung gefunden',
  'reason.search': 'aus deiner Suche',
  'reason.newToYou': 'für dich neuer Kanal',
  'reason.ratedChannel': 'von dir positiv bewerteter Kanal',
  'reason.ratedSimilar': 'ähnlich wie deine positiv bewerteten Videos',
  'reason.rewatch': 'von dir immer wieder angesehener Kanal',
  'reason.subscribed': 'abonniert',
  'reason.library': 'aus deiner Bibliothek',
  'reason.new': 'gerade erschienen',
} satisfies Messages;

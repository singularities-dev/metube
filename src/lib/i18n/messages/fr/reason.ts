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
  'reason.separator': '\u202f; ',
  'reason.uncharted': 'inexploré',
  'reason.unchartedTopic': 'inexploré : {topic}',
  'reason.moodTags': 'correspond à votre humeur : {tags}',
  'reason.moodChannel': 'une chaîne que vous aimez pour cette humeur',
  'reason.likedTags': 'tags que vous aimez : {tags}',
  'reason.moodLearned': 'cette humeur a appris que vous aimez ça',
  'reason.moodSearch': 'trouvée pour cette humeur',
  'reason.search': 'issue de votre recherche',
  'reason.newToYou': 'chaîne à découvrir',
  'reason.ratedChannel': 'une chaîne que vous notez bien',
  'reason.ratedSimilar': 'proche des vidéos que vous avez bien notées',
  'reason.rewatch': 'une chaîne dont vous revoyez les vidéos',
  'reason.subscribed': 'de vos abonnements',
  'reason.library': 'de votre bibliothèque',
  'reason.new': 'nouveauté',
} satisfies Messages;

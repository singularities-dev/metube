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
  'reason.uncharted': 'inexplorado',
  'reason.unchartedTopic': 'inexplorado: {topic}',
  'reason.moodTags': 'encaja con tu estado de ánimo: {tags}',
  'reason.moodChannel': 'un canal que te gusta en este estado de ánimo',
  'reason.likedTags': 'etiquetas que te gustan: {tags}',
  'reason.moodLearned': 'este estado de ánimo ha aprendido que esto te gusta',
  'reason.moodSearch': 'encontrado para este estado de ánimo',
  'reason.search': 'de tu búsqueda',
  'reason.newToYou': 'un canal nuevo para ti',
  'reason.ratedChannel': 'un canal que valoras positivamente',
  'reason.ratedSimilar': 'parecido a vídeos que has valorado positivamente',
  'reason.rewatch': 'un canal al que sueles volver',
  'reason.subscribed': 'de tus suscripciones',
  'reason.popular': 'popular en esta categoría',
  'reason.library': 'de tu biblioteca',
  'reason.new': 'recién publicado',
} satisfies Messages;

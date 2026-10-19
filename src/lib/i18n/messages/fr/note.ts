import type { Messages } from '../../index.ts';

/**
 * The small note MeTube shows on YouTube watch pages. "like" and "dislike"
 * mean YouTube's own thumbs-up and thumbs-down buttons. {rating} is a rating
 * name such as "Like" or "Neutral".
 */
export default {
  'note.rateOffer': 'Noter cette vidéo dans MeTube ?',
  'note.rateGroup': 'Noter dans MeTube',
  'note.rateFailed': 'Impossible de noter cette vidéo ici. Notez-la plutôt dans MeTube.',
  'note.rated': 'Vidéo notée « {rating} » dans MeTube.',
  'note.loved': 'Vous avez adoré cette vidéo dans MeTube. Lui mettre un « J’aime » sur YouTube ?',
  'note.hated': 'Vous avez détesté cette vidéo dans MeTube. Lui mettre un « Je n’aime pas » sur YouTube ?',
  'note.ratedLike': 'Vous avez noté cette vidéo « {rating} » dans MeTube. Lui mettre un « J’aime » sur YouTube ?',
  'note.ratedDislike': 'Vous avez noté cette vidéo « {rating} » dans MeTube. Lui mettre un « Je n’aime pas » sur YouTube ?',
  'note.undoLike': 'Vous avez retiré votre note MeTube. YouTube conserve votre « J’aime ».',
  'note.undoDislike': 'Vous avez retiré votre note MeTube. YouTube conserve votre « Je n’aime pas ».',
  // The rating was changed to one YouTube has no thumb for (Neutral), after a like or dislike was sent.
  'note.neutralLike': 'Vous avez noté cette vidéo « {rating} » dans MeTube. YouTube conserve votre « J’aime ».',
  'note.neutralDislike': 'Vous avez noté cette vidéo « {rating} » dans MeTube. YouTube conserve votre « Je n’aime pas ».',
  'note.done': 'Fait',
  'note.doneLabel': 'Marquer comme fait dans MeTube',
  'note.marked': 'Marqué comme fait dans MeTube.',
  'note.unreachable': 'Impossible de joindre MeTube. Rechargez la page et réessayez.',
  'note.hide': 'Masquer l’encart MeTube',
} satisfies Messages;

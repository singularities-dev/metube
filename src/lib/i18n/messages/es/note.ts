import type { Messages } from '../../index.ts';

/**
 * The small note MeTube shows on YouTube watch pages. "like" and "dislike"
 * mean YouTube's own thumbs-up and thumbs-down buttons. {rating} is a rating
 * name such as "Like" or "Neutral".
 */
export default {
  'note.rateOffer': '¿Valorarlo en MeTube?',
  'note.rateGroup': 'Valorar en MeTube',
  'note.rateFailed': 'No se ha podido valorar aquí. Valóralo en MeTube.',
  'note.rated': 'Valorado como «{rating}» en MeTube.',
  'note.loved': 'Lo has valorado como «Genial» en MeTube. ¿Le das «Me gusta» en YouTube?',
  'note.hated': 'Lo has valorado como «Horrible» en MeTube. ¿Le das «No me gusta» en YouTube?',
  'note.ratedLike': 'Lo has valorado como «{rating}» en MeTube. ¿Le das «Me gusta» en YouTube?',
  'note.ratedDislike': 'Lo has valorado como «{rating}» en MeTube. ¿Le das «No me gusta» en YouTube?',
  'note.undoLike': 'Has quitado tu valoración de MeTube. YouTube aún tiene tu «Me gusta».',
  'note.undoDislike': 'Has quitado tu valoración de MeTube. YouTube aún tiene tu «No me gusta».',
  // The rating was changed to one YouTube has no thumb for (Neutral), after a like or dislike was sent.
  'note.neutralLike': 'Lo has valorado como «{rating}» en MeTube. YouTube aún tiene tu «Me gusta».',
  'note.neutralDislike': 'Lo has valorado como «{rating}» en MeTube. YouTube aún tiene tu «No me gusta».',
  'note.done': 'Hecho',
  'note.doneLabel': 'Marcar como hecho en MeTube',
  'note.marked': 'Marcado como hecho en MeTube.',
  'note.unreachable': 'No se ha podido conectar con MeTube. Vuelve a cargar la página e inténtalo de nuevo.',
  'note.hide': 'Ocultar nota de MeTube',
} satisfies Messages;

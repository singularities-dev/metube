import type { Messages } from '../../index.ts';

/**
 * The small note MeTube shows on YouTube watch pages. "like" and "dislike"
 * mean YouTube's own thumbs-up and thumbs-down buttons. {rating} is a rating
 * name such as "Like" or "Neutral".
 */
export default {
  'note.rateOffer': 'Rate this in MeTube?',
  'note.rateGroup': 'Rate in MeTube',
  'note.rateFailed': 'Couldn’t rate this here. Rate it in MeTube instead.',
  'note.rated': 'Rated “{rating}” in MeTube.',
  'note.loved': 'You loved this in MeTube. Give it a like on YouTube?',
  'note.hated': 'You hated this in MeTube. Give it a dislike on YouTube?',
  'note.ratedLike': 'You rated this “{rating}” in MeTube. Give it a like on YouTube?',
  'note.ratedDislike': 'You rated this “{rating}” in MeTube. Give it a dislike on YouTube?',
  'note.undoLike': 'You removed your MeTube rating. YouTube still has your like.',
  'note.undoDislike': 'You removed your MeTube rating. YouTube still has your dislike.',
  // The rating was changed to one YouTube has no thumb for (Neutral), after a like or dislike was sent.
  'note.neutralLike': 'You rated this “{rating}” in MeTube. YouTube still has your like.',
  'note.neutralDislike': 'You rated this “{rating}” in MeTube. YouTube still has your dislike.',
  'note.done': 'Done',
  'note.doneLabel': 'Mark as done in MeTube',
  'note.marked': 'Marked as done in MeTube.',
  'note.unreachable': 'Couldn’t reach MeTube. Reload the page and try again.',
  'note.hide': 'Hide MeTube note',
} satisfies Messages;

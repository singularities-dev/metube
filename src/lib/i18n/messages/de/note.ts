import type { Messages } from '../../index.ts';

/**
 * The small note MeTube shows on YouTube watch pages. "like" and "dislike"
 * mean YouTube's own thumbs-up and thumbs-down buttons. {rating} is a rating
 * name such as "Like" or "Neutral".
 */
export default {
  'note.rateOffer': 'In MeTube bewerten?',
  'note.rateGroup': 'In MeTube bewerten',
  'note.rateFailed': 'Das Bewerten hat hier nicht geklappt. Bewerte das Video stattdessen in MeTube.',
  'note.rated': 'In MeTube mit „{rating}“ bewertet.',
  'note.loved': 'Du hast das in MeTube mit „Super“ bewertet. Auf YouTube mit „Mag ich“ bewerten?',
  'note.hated': 'Du hast das in MeTube mit „Furchtbar“ bewertet. Auf YouTube mit „Mag ich nicht“ bewerten?',
  'note.ratedLike': 'Du hast das in MeTube mit „{rating}“ bewertet. Auf YouTube mit „Mag ich“ bewerten?',
  'note.ratedDislike': 'Du hast das in MeTube mit „{rating}“ bewertet. Auf YouTube mit „Mag ich nicht“ bewerten?',
  'note.undoLike': 'Du hast deine MeTube-Bewertung entfernt. YouTube hat noch dein „Mag ich“.',
  'note.undoDislike': 'Du hast deine MeTube-Bewertung entfernt. YouTube hat noch dein „Mag ich nicht“.',
  // The rating was changed to one YouTube has no thumb for (Neutral), after a like or dislike was sent.
  'note.neutralLike': 'Du hast das in MeTube mit „{rating}“ bewertet. YouTube hat noch dein „Mag ich“.',
  'note.neutralDislike': 'Du hast das in MeTube mit „{rating}“ bewertet. YouTube hat noch dein „Mag ich nicht“.',
  'note.done': 'Erledigt',
  'note.doneLabel': 'In MeTube als erledigt markieren',
  'note.marked': 'In MeTube als erledigt markiert.',
  'note.unreachable': 'MeTube ist nicht erreichbar. Lade die Seite neu und versuche es noch einmal.',
  'note.hide': 'MeTube-Hinweis ausblenden',
} satisfies Messages;

import type { Messages } from '../../index.ts';

/**
 * The five ratings. The one-word short form is the visible text on the rating
 * buttons and their accessible name, so voice-control users can say what they
 * see; the full label is the buttons' tooltip. rating.removeHint names the
 * button of the current rating and must start with {label} (the short form).
 */
export default {
  'rating.2.label': 'J’adore',
  'rating.2.short': 'Adoré',
  'rating.1.label': 'J’aime bien',
  'rating.1.short': 'Aimé',
  'rating.0.label': 'Ça va',
  'rating.0.short': 'Neutre',
  'rating.-1.label': 'Pas pour moi',
  'rating.-1.short': 'Pas aimé',
  'rating.-2.label': 'Je déteste',
  'rating.-2.short': 'Détesté',
  'rating.removeHint': '{label} (retirer la note)',
} satisfies Messages;

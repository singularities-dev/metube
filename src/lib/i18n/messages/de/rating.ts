import type { Messages } from '../../index.ts';

/**
 * The five ratings. The one-word short form is the visible text on the rating
 * buttons and their accessible name, so voice-control users can say what they
 * see; the full label is the buttons' tooltip. rating.removeHint names the
 * button of the current rating and must start with {label} (the short form).
 */
export default {
  'rating.2.label': 'Find ich super',
  'rating.2.short': 'Super',
  'rating.1.label': 'Find ich gut',
  'rating.1.short': 'Gut',
  'rating.0.label': 'Ist okay',
  'rating.0.short': 'Neutral',
  'rating.-1.label': 'Nichts für mich',
  'rating.-1.short': 'Schlecht',
  'rating.-2.label': 'Find ich furchtbar',
  'rating.-2.short': 'Furchtbar',
  'rating.removeHint': '{label} (Bewertung entfernen)',
} satisfies Messages;

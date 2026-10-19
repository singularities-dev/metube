import type { Messages } from '../../index.ts';

/**
 * The five ratings. The one-word short form is the visible text on the rating
 * buttons and their accessible name, so voice-control users can say what they
 * see; the full label is the buttons' tooltip. rating.removeHint names the
 * button of the current rating and must start with {label} (the short form).
 */
export default {
  'rating.2.label': 'Me parece genial',
  'rating.2.short': 'Genial',
  'rating.1.label': 'Me parece bien',
  'rating.1.short': 'Bien',
  'rating.0.label': 'Me parece normal',
  'rating.0.short': 'Normal',
  'rating.-1.label': 'Me parece flojo',
  'rating.-1.short': 'Flojo',
  'rating.-2.label': 'Me parece horrible',
  'rating.-2.short': 'Horrible',
  'rating.removeHint': '{label} (quitar valoración)',
} satisfies Messages;

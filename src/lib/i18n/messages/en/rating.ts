import type { Messages } from '../../index.ts';

/**
 * The five ratings. The one-word short form is the visible text on the rating
 * buttons and their accessible name, so voice-control users can say what they
 * see; the full label is the buttons' tooltip. rating.removeHint names the
 * button of the current rating and must start with {label} (the short form).
 */
export default {
  'rating.2.label': 'Love it',
  'rating.2.short': 'Love',
  'rating.1.label': 'Like it',
  'rating.1.short': 'Like',
  'rating.0.label': 'It’s fine',
  'rating.0.short': 'Neutral',
  'rating.-1.label': 'Not for me',
  'rating.-1.short': 'Dislike',
  'rating.-2.label': 'Hate it',
  'rating.-2.short': 'Hate',
  'rating.removeHint': '{label} (remove rating)',
} satisfies Messages;

import type { Messages } from '../../index.ts';

/** The extension's description in the browser's add-on list and store (132 characters at most). */
export default {
  'manifest.description': 'Your YouTube feed, built from your own history, ratings and moods instead of the algorithm.',
  // Tooltip of the toolbar button that opens MeTube.
  'manifest.actionTitle': 'Open MeTube',
} satisfies Messages;

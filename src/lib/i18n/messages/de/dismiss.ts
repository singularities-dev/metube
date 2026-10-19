import type { Messages } from '../../index.ts';

/** Ways to remove a video from the feed. */
export default {
  'dismiss.not-interested.label': 'Kein Interesse',
  'dismiss.not-interested.hint': 'Weniger Videos wie dieses',
  'dismiss.already-watched.label': 'Schon gesehen',
  'dismiss.already-watched.hint': 'Ausblenden, ohne deinen Geschmack zu ändern',
  'dismiss.hide-channel.label': 'Kanal nicht mehr zeigen',
  'dismiss.hide-channel.hint': 'Alle Videos des Kanals ausblenden',
} satisfies Messages;

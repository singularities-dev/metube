import type { Messages } from '../../index.ts';

/** Ways to remove a video from the feed. */
export default {
  'dismiss.not-interested.label': 'Pas intéressé',
  'dismiss.not-interested.hint': 'Afficher moins de vidéos de ce type',
  'dismiss.already-watched.label': 'Déjà regardée',
  'dismiss.already-watched.hint': 'La masquer sans changer vos goûts',
  'dismiss.hide-channel.label': 'Masquer cette chaîne',
  'dismiss.hide-channel.hint': 'Ne plus rien voir de cette chaîne',
} satisfies Messages;

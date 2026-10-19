import type { Messages } from '../../index.ts';

/**
 * The frame around YouTube's embedded player: subscribe, rate, remove and close.
 * "Subscribe" is a toggle button after the channel's name (pressed while
 * subscribed); "Remove…" opens the ways to remove the video from the feed. The
 * link to YouTube shows just the word "YouTube", so player.openOnYouTube must
 * contain it.
 */
export default {
  'player.subscribe': 'S’abonner',
  'player.rateGroup': 'Noter cette vidéo',
  'player.remove': 'Retirer…',
  'player.removeGroup': 'Retirer du fil',
  'player.openOnYouTube': 'Ouvrir sur YouTube (nouvel onglet)',
  'player.close': 'Fermer le lecteur',
} satisfies Messages;

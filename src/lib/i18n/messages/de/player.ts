import type { Messages } from '../../index.ts';

/**
 * The frame around YouTube's embedded player: subscribe, rate, remove and close.
 * "Subscribe" is a toggle button after the channel's name (pressed while
 * subscribed); "Remove…" opens the ways to remove the video from the feed. The
 * link to YouTube shows just the word "YouTube", so player.openOnYouTube must
 * contain it.
 */
export default {
  'player.subscribe': 'Abonnieren',
  'player.rateGroup': 'Video bewerten',
  'player.remove': 'Entfernen…',
  'player.removeGroup': 'Aus dem Feed entfernen',
  'player.openOnYouTube': 'Auf YouTube öffnen (neuer Tab)',
  'player.close': 'Player schließen',
} satisfies Messages;

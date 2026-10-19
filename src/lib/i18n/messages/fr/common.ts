import type { Messages } from '../../index.ts';

/** Words and phrases shared across the app. */
export default {
  'common.undo': 'Annuler',
  'common.dismissMessage': 'Fermer le message',
  'common.remove': 'Supprimer',
  'common.save': 'Enregistrer',
  'common.done': 'Terminé',
  'common.ok': 'OK',
  'common.close': 'Fermer',
  'common.cancel': 'Annuler',
  'common.showMore': { one: 'Afficher {count} de plus', other: 'Afficher {count} de plus' },
  'common.units': { one: '{count} unité', other: '{count} unités' },
  'common.unitsUsed': { zero: 'Aucune unité utilisée.', one: '{count} unité utilisée.', other: '{count} unités utilisées.' },
  'common.videos': { one: '{count} vidéo', other: '{count} vidéos' },
  'common.channels': { one: '{count} chaîne', other: '{count} chaînes' },
  'common.newTab': '(s’ouvre dans un nouvel onglet)',
  'common.youtubeTerms': 'Conditions d’utilisation de YouTube',
  'common.googlePrivacy': 'Règles de confidentialité de Google',
} satisfies Messages;

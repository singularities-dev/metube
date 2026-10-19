import type { Messages } from '../../index.ts';

/**
 * The Settings page: appearance, feed options and the data section.
 * Labels name switches and sliders; hints are the line of help under them.
 * Names quoted in hints must match their labels elsewhere: Explore (the
 * navigation tab) and Edit mood. The page-size hint describes the button under
 * the feed instead of quoting it, since its label includes the count.
 * Shorts is YouTube's name for its short vertical videos: use YouTube's word.
 */
export default {
  'settings.heading': 'Paramètres',
  'settings.appearance': 'Apparence',
  'settings.theme': 'Thème',
  'settings.feed': 'Fil',
  'settings.pageSize': 'Vidéos par page',
  'settings.pageSize.hint': 'Nombre de vidéos affichées à la fois dans Explorer, et nombre de vidéos ajoutées à chaque clic sur le bouton sous le fil.',
  'settings.poolChannels': 'Chaînes prises en compte',
  'settings.poolChannels.hint': {
    one: 'Vos chaînes les plus regardées. Une actualisation complète utilise environ {count} unité de quota.',
    other: 'Vos chaînes les plus regardées. Une actualisation complète utilise environ {count} unités de quota.',
  },
  'settings.uploadsPerChannel': 'Vidéos récentes par chaîne',
  'settings.perChannelCap': 'Maximum par chaîne en tête du fil',
  'settings.perChannelCap.hint': 'Évite qu’une chaîne très active remplisse la première page. 0 désactive cette limite.',
  'settings.moodFetch': 'Chercher de nouvelles vidéos au changement d’humeur',
  'settings.moodFetch.hint': 'Une recherche YouTube par humeur (101 unités), réutilisée pendant 12 heures. Désactivé : les humeurs ne font que retrier les vidéos de vos chaînes.',
  'settings.autoMoods': 'Changer d’humeur selon les horaires',
  'settings.autoMoods.hint': 'Les humeurs programmées s’activent automatiquement au début de leurs horaires. Réglez les horaires dans Explorer, sous « Modifier l’humeur ».',
  'settings.playInline': 'Lire les vidéos dans MeTube',
  'settings.playInline.hint': 'Un clic sur une vidéo ouvre le lecteur YouTube dans une fenêtre de MeTube, avec les notes à côté. Désactivé : un clic ouvre un nouvel onglet YouTube. Ctrl+clic ouvre toujours un onglet.',
  'settings.hideShorts': 'Masquer les Shorts',
  'settings.hideShorts.hint': 'Vidéos verticales de 3 minutes maximum, ou d’une minute maximum quand le format est inconnu.',
  'settings.hideWatched': 'Masquer les vidéos déjà regardées',
  'settings.data': 'Vos données',
  'settings.data.hint': 'Tout est enregistré uniquement dans ce navigateur. L’effacement supprime l’historique importé, mais pas vos tags, vos humeurs ni vos paramètres.',
  'settings.data.confirm': 'Supprimer de ce navigateur tout ce qui a été importé : historique des vidéos regardées, recherches, abonnements et playlists ?',
  'settings.data.clear': 'Effacer l’historique importé',
} satisfies Messages;

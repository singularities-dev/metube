import type { Messages } from '../../index.ts';

/**
 * Explore, the main feed: mood shortcuts, the filter toolbar, status lines,
 * empty states and the toasts after rating, removing or subscribing.
 * {mood} is a mood name, {channel} a YouTube channel, {tag} and {query} what
 * the user typed: all left as they are. {mood} may be an adjective
 * ("Energetic"), an imperative ("Make me laugh") or anything the user typed,
 * so never put it bare after a preposition or verb: always introduce it with
 * the word for mood and quote it (the “{mood}” mood), or use a label form
 * ("Mood: {mood}"). {topic} is what the feed searched for:
 * in the "exploring" messages (New to me) one of the user's own tags or
 * searches, left as it is; in the "charting" messages (Uncharted) a translated
 * topic label (uncharted.topic.*), always a bare noun phrase.
 * {rating} is a short rating name (rating.*.short, such as "Love") and
 * {views} a short number such as "10K".
 * Labels quoted in other messages must match their own messages: the buttons
 * "Fresh feed" and "Search YouTube", the channel choices "New to me" and
 * "Everything", the "Settings" page (app.nav.settings) and the filter kinds
 * "only" and "hide" (explore.filter.chip.*). explore.filter.only.label and
 * explore.filter.hide.label are the names screen readers give the Only and
 * Hide buttons, so each must contain that button's visible text.
 */
export default {
  'explore.noKey.title': 'Ajoutez votre clé API YouTube pour commencer',
  'explore.noKey.body': 'Votre fil est construit à partir de votre propre historique, avec votre propre clé API. La configuration prend une minute.',
  'explore.noKey.openSettings': 'Ouvrir les paramètres',

  // Name of the group of shortcut buttons, one per recent mood.
  'explore.quickMoods': 'Changer d’humeur',
  // Each shortcut button's name for screen readers; it must contain the button's text, the mood's name.
  'explore.switchTo': 'Passer à l’humeur « {mood} »',
  'explore.editMood': 'Modifier l’humeur',
  'explore.freshFeed': 'Nouveau fil',
  'explore.freshFeed.hint': 'Recharge toutes les chaînes et les résultats de votre humeur, et écarte les vidéos qui vous ont déjà été présentées.',
  'explore.refresh': 'Actualiser le fil',
  'explore.refresh.title': 'Actualiser (utilise les résultats en cache tant qu’ils sont à jour)',

  'explore.filter.region': 'Filtrer le fil',
  'explore.filter.placeholder': 'Filtrer par tag ou mot',
  // Buttons beside the filter box: show only videos with what’s typed, or hide them.
  'explore.filter.only': 'Uniquement',
  'explore.filter.only.label': 'Afficher uniquement les vidéos avec {tag}',
  'explore.filter.hide': 'Masquer',
  'explore.filter.hide.label': 'Masquer les vidéos avec {tag}',
  // Enter and Shift+Enter are keys; “only” and “hide” are explore.filter.chip.*.
  'explore.filter.hint': 'Entrée ajoute « uniquement », Maj+Entrée ajoute « masquer ».',
  'explore.filter.active': 'Filtres actifs',
  // The kind of an active filter, shown in small text before its tag.
  'explore.filter.chip.only': 'uniquement',
  'explore.filter.chip.hide': 'masquer',
  // Remove buttons on those filters.
  'explore.filter.removeOnly': 'Retirer le filtre : uniquement {tag}',
  'explore.filter.removeHide': 'Retirer le filtre : masquer {tag}',
  'explore.search': 'Rechercher sur YouTube',
  'explore.search.busy': 'Recherche…',
  // Units are YouTube API quota units; 101 and 12 are fixed.
  'explore.search.hint': '« Rechercher sur YouTube » utilise jusqu’à 101 unités de quota ; une même recherche répétée dans les 12 heures est gratuite.',
  'explore.searchFor': 'Rechercher « {query} » sur YouTube',
  'explore.clearFilters': 'Effacer les filtres',

  // Which channels the feed draws from: a group of four buttons named "Channels".
  'explore.scope.group': 'Chaînes',
  'explore.scope.all.label': 'Tout',
  'explore.scope.all.hint': 'Les chaînes que vous connaissez et de nouvelles chaînes.',
  'explore.scope.known.label': 'Chaînes connues',
  'explore.scope.known.hint': 'Uniquement les chaînes que vous regardez, vos abonnements et les chaînes que vous avez bien notées.',
  'explore.scope.new.label': 'À découvrir',
  'explore.scope.new.hint': 'Uniquement des chaînes que vous n’avez pas encore regardées, autour de vos centres d’intérêt.',
  'explore.scope.uncharted.label': 'Inexploré',
  'explore.scope.uncharted.hint': 'Des sujets et des chaînes hors de votre historique et de vos goûts. Vos humeurs et vos tags aimés sont mis de côté ; les tags bloqués et les notes négatives s’appliquent toujours.',
  // Follows the Uncharted hint when a mood is active.
  'explore.scope.uncharted.moodPaused': 'L’humeur « {mood} » est en pause tant que vous êtes ici.',

  // Menu of when videos were published.
  'explore.time.label': 'Date de publication',
  'explore.time.any': 'Date indifférente',
  'explore.time.day': 'Moins d’un jour',
  'explore.time.week': 'Moins d’une semaine',
  'explore.time.month': 'Moins d’un mois',
  'explore.time.year': 'Moins d’un an',
  'explore.time.custom': 'Période personnalisée…',
  'explore.time.customRange': 'Période personnalisée',
  // Start and end dates of the custom range.
  'explore.time.from': 'Début',
  'explore.time.to': 'Fin',

  // Menu of how many views videos have: lesser-seen ones, or popular ("Pop") ones.
  'explore.views.label': 'Vues',
  'explore.views.any': 'Nombre de vues indifférent',
  'explore.views.lesser': 'Peu vues (moins de {views} vues)',
  'explore.views.popular': 'Populaires (plus de {views} de vues)',

  // YouTube's video categories (category.*); "All" turns the category filter off.
  'explore.category.group': 'Catégorie',
  'explore.category.all': 'Toutes',

  'explore.busy.pool': 'Mise à jour de votre fil…',
  'explore.busy.fresh': 'Création d’un nouveau fil…',
  'explore.busy.mood': 'Recherche de vidéos pour l’humeur « {mood} »…',
  'explore.busy.new': 'Recherche de chaînes à découvrir…',
  'explore.busy.uncharted': 'Cap sur l’inconnu…',
  'explore.busy.search': 'Recherche sur YouTube…',

  // Status after the feed loads, followed by common.unitsUsed. "Exploring" is a
  // search around the user's interests (New to me); "charting" one outside them (Uncharted).
  'explore.note.fresh': { one: 'Nouveau fil à partir de {count} chaîne.', other: 'Nouveau fil à partir de {count} chaînes.' },
  'explore.note.fresh.exploring': {
    one: 'Nouveau fil à partir de {count} chaîne, en explorant « {topic} ».',
    other: 'Nouveau fil à partir de {count} chaînes, en explorant « {topic} ».',
  },
  'explore.note.fresh.charting': {
    one: 'Nouveau fil à partir de {count} chaîne, cap sur « {topic} ».',
    other: 'Nouveau fil à partir de {count} chaînes, cap sur « {topic} ».',
  },
  'explore.note.mood': 'Affichage de l’humeur « {mood} ».',
  'explore.note.mood.exploring': 'Affichage de l’humeur « {mood} », en explorant « {topic} ».',
  // The feed was fetched again (units were used) or nothing needed fetching.
  'explore.note.updated': 'Mis à jour.',
  'explore.note.updated.exploring': 'Mis à jour, en explorant « {topic} ».',
  'explore.note.updated.charting': 'Mis à jour, cap sur « {topic} ».',
  'explore.note.upToDate': 'À jour.',
  'explore.note.upToDate.exploring': 'À jour, en explorant « {topic} ».',
  'explore.note.upToDate.charting': 'À jour, cap sur « {topic} ».',
  // After Search YouTube, followed by common.unitsUsed or explore.note.fromLibrary.
  'explore.note.searchAdded': 'Résultats pour « {query} » ajoutés.',
  'explore.note.fromLibrary': 'De votre bibliothèque, aucune unité utilisée.',
  // Follows the status when filters are on.
  'explore.matches': { one: '{count} vidéo correspond.', other: '{count} vidéos correspondent.' },

  'explore.empty.title': 'Aucun résultat pour l’instant',
  'explore.empty.newNoInterests': '« À découvrir » explore vos centres d’intérêt, mais n’en connaît encore aucun. Aimez quelques tags, notez des vidéos ou importez votre historique des recherches dans Paramètres.',
  'explore.empty.new': 'Aucune nouvelle chaîne ne correspond pour le moment. Essayez « Nouveau fil » pour explorer un autre de vos centres d’intérêt, ou passez à « Tout ».',
  'explore.empty.uncharted': 'Rien d’inexploré ne correspond pour le moment. Essayez « Nouveau fil » pour un autre sujet, ou assouplissez vos filtres.',
  'explore.empty.filtered': 'Essayez avec moins de filtres, ajoutez des tags à cette humeur ou lancez une recherche sur YouTube pour trouver de nouvelles vidéos.',
  'explore.empty.noChannels': 'Importez votre historique des vidéos regardées dans Paramètres pour donner des chaînes à votre fil.',

  // Heading of the feed, for screen readers.
  'explore.videos': 'Vidéos',
  'explore.attribution': 'Données vidéo fournies par YouTube. Les vidéos sont lues sur YouTube. <link>Conditions d’utilisation de YouTube</link>',

  'explore.toast.rated': 'Vidéo notée « {rating} ».',
  'explore.toast.ratedForMood': 'Vidéo notée « {rating} ». L’humeur « {mood} » en tiendra compte.',
  'explore.toast.ratingRemoved': 'Note retirée.',
  // A video was removed from the feed for this reason (dismiss.*).
  'explore.toast.removed.not-interested': 'Vidéo retirée : pas intéressé.',
  'explore.toast.removed.already-watched': 'Vidéo retirée : déjà regardée.',
  'explore.toast.channelHidden': 'Chaîne masquée : {channel}.',
  'explore.toast.subscribed': 'Abonnement ajouté : {channel}. Ses nouvelles vidéos rejoindront votre fil à la prochaine actualisation.',
  'explore.toast.unsubscribed': 'Abonnement supprimé : {channel}.',
  'explore.toast.unsubscribedSync': 'Abonnement supprimé : {channel}. Synchronisez pour le supprimer aussi sur YouTube.',
} satisfies Messages;

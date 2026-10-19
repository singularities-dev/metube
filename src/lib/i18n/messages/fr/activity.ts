import type { Messages } from '../../index.ts';

/**
 * The Activity view: watch statistics, subscriptions, ratings, what MeTube has
 * learned and what was removed from the feed. {channel} and {title} are a
 * channel's or video's name, {date} a formatted date. {mood} is a mood name or
 * path, left as it is; it may be an adjective ("Energetic"), an imperative
 * ("Make me laugh") or anything the user typed, so always introduce it with the
 * word for mood and quote it (the “{mood}” mood), or use a label form
 * ("Mood: {mood}"). Explore and Settings are
 * the names of views (app.nav.*). Keys ending in Label or .label are accessible
 * names for buttons and must contain the button's visible text, where it has some.
 */
export default {
  // Link text when a video's title isn't known.
  'activity.openOnYouTube': 'Ouvrir sur YouTube',

  'activity.glance.heading': 'En un coup d’œil',
  // Labels of the numbers under that heading.
  'activity.glance.watched': 'Vidéos regardées',
  'activity.glance.searches': 'Recherches',
  'activity.glance.rated': 'Notées dans MeTube',
  'activity.glance.removed': 'Retirées du fil',
  'activity.glance.since': 'L’historique importé commence le {date}.',

  'activity.months.heading': 'Vidéos regardées par mois',
  'activity.months.caption': 'Diagramme en barres des vidéos regardées par mois, d’après votre historique importé.',
  'activity.hours.heading': 'Vos heures de visionnage',
  'activity.hours.hint': 'Par heure de la journée, selon votre fuseau horaire.',
  'activity.hours.caption': 'Diagramme en barres des vidéos regardées par heure de la journée.',
  // Column heading in a chart's table view: the number of videos.
  'activity.chart.valueHeading': 'Vidéos',

  'activity.channels.heading': 'Chaînes les plus regardées',
  'activity.channels.subscribeLabel': 'S’abonner à {channel}',
  // Tooltips on the bell button.
  'activity.channels.subscribeTitle': 'S’abonner',
  'activity.channels.subscribedTitle': 'Abonné (sélectionnez pour vous désabonner)',

  'activity.subs.heading': 'Vos abonnements',
  'activity.subs.count': { one: '{count} chaîne.', other: '{count} chaînes.' },
  'activity.subs.none': 'Aucun pour l’instant. Abonnez-vous avec la cloche sur n’importe quelle vidéo.',
  'activity.subs.pending': {
    one: '{count} modification n’est pas encore sur YouTube. Synchronisez dans Paramètres pour l’envoyer ; d’ici là, elle n’existe que dans MeTube.',
    other: '{count} modifications ne sont pas encore sur YouTube. Synchronisez dans Paramètres pour les envoyer ; d’ici là, elles n’existent que dans MeTube.',
  },
  'activity.subs.boost': 'Vos abonnements sont mis en avant dans votre fil.',
  // Label of the field that filters subscriptions by channel name.
  'activity.subs.find': 'Rechercher',
  'activity.subs.findPlaceholder': 'Nom de la chaîne',
  // Where a subscription came from, under its channel name.
  'activity.subs.source.metube': 'Abonnement ajouté dans MeTube',
  'activity.subs.source.metubeOn': 'Abonnement ajouté dans MeTube le {date}',
  'activity.subs.source.youtube': 'Depuis YouTube',
  'activity.subs.source.takeout': 'Depuis votre Takeout',
  // {source} is one of the activity.subs.source.* messages.
  'activity.subs.notOnYouTube': '{source} · pas encore sur YouTube',
  'activity.subs.unsubscribe': 'Se désabonner',
  'activity.subs.unsubscribeLabel': 'Se désabonner de {channel}',
  // {query} is what the user typed.
  'activity.subs.noMatch': 'Aucun abonnement ne correspond à « {query} ».',
  'activity.subs.unsubPending.heading': 'Désabonnements pas encore sur YouTube',
  'activity.subs.unsubPending.note': 'Désabonnement sur YouTube à votre prochaine synchronisation',
  // Button that cancels a pending unsubscribe.
  'activity.subs.keep': 'Conserver',
  'activity.subs.keepLabel': 'Conserver l’abonnement à {channel}',

  // Screen-reader announcements after an action.
  'activity.status.subscribed': 'Abonnement ajouté : {channel}',
  'activity.status.unsubscribed': 'Abonnement supprimé : {channel}',

  'activity.ratings.heading': 'Vos notes',
  // Above the list: how many videos have each rating. {rating} is a rating button's name (rating.*.short), used as a
  // category label, so put it in a label position rather than make it agree with the number. <n> is the number,
  // shown large, and <r> the name; keep both. Screen readers get countSpoken instead.
  'activity.ratings.count': '<r>{rating}</r> : <n>{count}</n>',
  // Only screen readers read countSpoken, and they don't say quotation marks, so put {rating} in a label position
  // (as in tile.link.rated: "your rating: {rating}"), never after a verb, a participle or "como".
  'activity.ratings.countSpoken': { one: '{rating} : {count} vidéo', other: '{rating} : {count} vidéos' },
  // A filter: the group's label, then its two buttons (all ratings, or only those YouTube doesn't have yet).
  'activity.ratings.filter': 'Afficher',
  'activity.ratings.filterAll': 'Toutes',
  'activity.ratings.filterPending': 'Pas encore sur YouTube ({count})',
  // Pending videos may want a like, a dislike or a like or dislike removed; each one's link (activity.yt.*) says which.
  'activity.ratings.pendingHint': 'Ouvrez chaque vidéo sur YouTube, faites ce qu’indique son lien, puis choisissez « Marquer comme fait ». Vous pouvez aussi configurer la synchronisation dans Paramètres.',
  'activity.ratings.empty': 'Notez des vidéos dans Explorer avec le bouton en forme de cœur de chaque vidéo. Chaque note affine votre fil.',
  // Under each rated video; {mood} is the mood it was rated in.
  'activity.ratings.meta': '{channel}, {date}',
  'activity.ratings.metaMood': '{channel}, {date}, dans l’humeur « {mood} »',
  'activity.ratings.change': 'Modifier la note de {title}',
  'activity.ratings.changeNoTitle': 'Modifier la note de la vidéo de {channel}',
  'activity.ratings.remove': 'Retirer la note',
  // {rating} is a rating's short name (rating.*.short).
  'activity.ratings.rated': 'Note de {title} : {rating}',
  'activity.ratings.ratedNoTitle': 'Note de la vidéo de {channel} : {rating}',
  'activity.ratings.removed': 'Note retirée : {title}',
  'activity.ratings.removedNoTitle': 'Note retirée : la vidéo de {channel}',

  // Links that open the video so the user can do this on YouTube themselves.
  'activity.yt.like': 'Mettre « J’aime » sur YouTube',
  'activity.yt.dislike': 'Mettre « Je n’aime pas » sur YouTube',
  // States: YouTube already has the rating.
  'activity.yt.liked': '« J’aime » mis sur YouTube',
  'activity.yt.disliked': '« Je n’aime pas » mis sur YouTube',
  'activity.yt.removeLike': 'Retirer le « J’aime » sur YouTube',
  'activity.yt.removeDislike': 'Retirer le « Je n’aime pas » sur YouTube',
  'activity.undo.stillLike': 'Note retirée dans MeTube. YouTube conserve votre « J’aime ».',
  'activity.undo.stillDislike': 'Note retirée dans MeTube. YouTube conserve votre « Je n’aime pas ».',

  // Button: the user has made the change on YouTube by hand.
  'activity.markDone': 'Marquer comme fait',
  'activity.markDone.label': 'Marquer comme fait pour {title}',
  'activity.markDone.labelNoTitle': 'Marquer comme fait pour la vidéo de {channel}',
  'activity.markDone.status': 'Marqué comme fait : {title}',
  'activity.markDone.statusNoTitle': 'Marqué comme fait : la vidéo de {channel}',

  'activity.learned.heading': 'Ce que MeTube a appris',
  'activity.learned.hint': 'D’après vos notes et les vidéos que vous avez retirées. Ces tags façonnent votre fil, en plus de ceux que vous choisissez vous-même.',
  // Headings over lists of tags.
  'activity.learned.enjoy': 'Vous appréciez plutôt',
  'activity.learned.skip': 'Vous évitez plutôt',

  'activity.removed.heading': 'Éléments retirés de votre fil',
  'activity.removed.channels': 'Chaînes masquées',
  // When the channel was hidden.
  'activity.removed.hiddenOn': 'Masquée le {date}',
  'activity.removed.showAgain': 'Réafficher',
  'activity.removed.showAgainLabel': 'Réafficher {channel}',
  'activity.removed.showingAgain': 'Chaîne réaffichée : {channel}',
  // Heading: removed videos, after the hidden channels.
  'activity.removed.videos': 'Vidéos',
  // {reason} is how it was removed (dismiss.*.label).
  'activity.removed.meta': '{reason}, {channel}, {date}',
  'activity.removed.restore': 'Restaurer',
  'activity.removed.restore.label': 'Restaurer {title}',
  'activity.removed.restore.labelNoTitle': 'Restaurer la vidéo de {channel}',
  'activity.removed.restore.status': 'Vidéo restaurée : {title}',
  'activity.removed.restore.statusNoTitle': 'Vidéo de {channel} restaurée',
} satisfies Messages;

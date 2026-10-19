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
  'activity.openOnYouTube': 'Abrir en YouTube',

  'activity.glance.heading': 'De un vistazo',
  // Labels of the numbers under that heading.
  'activity.glance.watched': 'Vídeos vistos',
  'activity.glance.searches': 'Búsquedas',
  'activity.glance.rated': 'Valorados en MeTube',
  'activity.glance.removed': 'Quitados del feed',
  'activity.glance.since': 'El historial importado se remonta al {date}.',

  'activity.months.heading': 'Vídeos vistos por mes',
  'activity.months.caption': 'Gráfico de barras de los vídeos vistos por mes según tu historial importado.',
  'activity.hours.heading': 'Cuándo ves vídeos',
  'activity.hours.hint': 'Por hora del día, en tu hora local.',
  'activity.hours.caption': 'Gráfico de barras de los vídeos vistos por hora del día.',
  // Column heading in a chart's table view: the number of videos.
  'activity.chart.valueHeading': 'Vídeos',

  'activity.channels.heading': 'Canales que más ves',
  'activity.channels.subscribeLabel': 'Suscribirse a {channel}',
  // Tooltips on the bell button.
  'activity.channels.subscribeTitle': 'Suscribirse',
  'activity.channels.subscribedTitle': 'Suscrito (selecciona para anular la suscripción)',

  'activity.subs.heading': 'Tus suscripciones',
  'activity.subs.count': { one: '{count} canal.', other: '{count} canales.' },
  'activity.subs.none': 'Aún no tienes ninguna. Suscríbete con la campana de cualquier vídeo.',
  'activity.subs.pending': {
    one: '{count} cambio de suscripción aún no está en YouTube. Sincroniza en Configuración para enviarlo; hasta entonces, solo está en MeTube.',
    other: '{count} cambios de suscripción aún no están en YouTube. Sincroniza en Configuración para enviarlos; hasta entonces, solo están en MeTube.',
  },
  'activity.subs.boost': 'Tus suscripciones tienen prioridad en tu feed.',
  // Label of the field that filters subscriptions by channel name.
  'activity.subs.find': 'Buscar',
  'activity.subs.findPlaceholder': 'Nombre del canal',
  // Where a subscription came from, under its channel name.
  'activity.subs.source.metube': 'Suscripción en MeTube',
  'activity.subs.source.metubeOn': 'Suscripción en MeTube (el {date})',
  'activity.subs.source.youtube': 'De YouTube',
  'activity.subs.source.takeout': 'De tu Takeout',
  // {source} is one of the activity.subs.source.* messages.
  'activity.subs.notOnYouTube': '{source} · aún no está en YouTube',
  'activity.subs.unsubscribe': 'Anular suscripción',
  'activity.subs.unsubscribeLabel': 'Anular suscripción a {channel}',
  // {query} is what the user typed.
  'activity.subs.noMatch': 'Ninguna suscripción coincide con «{query}».',
  'activity.subs.unsubPending.heading': 'Suscripción anulada, aún activa en YouTube',
  'activity.subs.unsubPending.note': 'Se anulará en YouTube en tu próxima sincronización',
  // Button that cancels a pending unsubscribe.
  'activity.subs.keep': 'Mantener',
  'activity.subs.keepLabel': 'Mantener suscripción a {channel}',

  // Screen-reader announcements after an action.
  'activity.status.subscribed': 'Te has suscrito a {channel}',
  'activity.status.unsubscribed': 'Has anulado la suscripción a {channel}',

  'activity.ratings.heading': 'Tus valoraciones',
  // Above the list: how many videos have each rating. {rating} is a rating button's name (rating.*.short), used as a
  // category label, so put it in a label position rather than make it agree with the number. <n> is the number,
  // shown large, and <r> the name; keep both. Screen readers get countSpoken instead.
  'activity.ratings.count': '<r>{rating}</r>: <n>{count}</n>',
  // Only screen readers read countSpoken, and they don't say quotation marks, so put {rating} in a label position
  // (as in tile.link.rated: "your rating: {rating}"), never after a verb, a participle or "como".
  'activity.ratings.countSpoken': { one: '{rating}: {count} vídeo', other: '{rating}: {count} vídeos' },
  // A filter: the group's label, then its two buttons (all ratings, or only those YouTube doesn't have yet).
  'activity.ratings.filter': 'Mostrar',
  'activity.ratings.filterAll': 'Todas',
  'activity.ratings.filterPending': 'Aún no en YouTube ({count})',
  // Pending videos may want a like, a dislike or a like or dislike removed; each one's link (activity.yt.*) says which.
  'activity.ratings.pendingHint': 'Abre cada vídeo en YouTube, haz lo que indica su enlace y después márcalo como hecho. O configura la sincronización en Configuración.',
  'activity.ratings.empty': 'Valora vídeos en Explorar con el botón del corazón de cada vídeo. Cada valoración le enseña algo a tu feed.',
  // Under each rated video; {mood} is the mood it was rated in.
  'activity.ratings.meta': '{channel}, {date}',
  'activity.ratings.metaMood': '{channel}, {date}, en el estado de ánimo «{mood}»',
  'activity.ratings.change': 'Cambiar valoración de {title}',
  'activity.ratings.changeNoTitle': 'Cambiar valoración del vídeo de {channel}',
  'activity.ratings.remove': 'Quitar valoración',
  // {rating} is a rating's short name (rating.*.short).
  'activity.ratings.rated': 'Valoración de {title}: {rating}',
  'activity.ratings.ratedNoTitle': 'Valoración del vídeo de {channel}: {rating}',
  'activity.ratings.removed': 'Has quitado la valoración de {title}',
  'activity.ratings.removedNoTitle': 'Has quitado la valoración del vídeo de {channel}',

  // Links that open the video so the user can do this on YouTube themselves.
  'activity.yt.like': 'Dar «Me gusta» en YouTube',
  'activity.yt.dislike': 'Dar «No me gusta» en YouTube',
  // States: YouTube already has the rating.
  'activity.yt.liked': 'Con «Me gusta» en YouTube',
  'activity.yt.disliked': 'Con «No me gusta» en YouTube',
  'activity.yt.removeLike': 'Quitar «Me gusta» en YouTube',
  'activity.yt.removeDislike': 'Quitar «No me gusta» en YouTube',
  'activity.undo.stillLike': 'Valoración quitada en MeTube. YouTube aún tiene tu «Me gusta».',
  'activity.undo.stillDislike': 'Valoración quitada en MeTube. YouTube aún tiene tu «No me gusta».',

  // Button: the user has made the change on YouTube by hand.
  'activity.markDone': 'Marcar como hecho',
  'activity.markDone.label': 'Marcar como hecho: {title}',
  'activity.markDone.labelNoTitle': 'Marcar como hecho: vídeo de {channel}',
  'activity.markDone.status': 'Marcado como hecho: {title}',
  'activity.markDone.statusNoTitle': 'Marcado como hecho: vídeo de {channel}',

  'activity.learned.heading': 'Lo que MeTube ha aprendido',
  'activity.learned.hint': 'A partir de tus valoraciones y de los vídeos que has quitado. Esto influye en tu feed junto con las etiquetas que eliges tú.',
  // Headings over lists of tags.
  'activity.learned.enjoy': 'Te suelen gustar',
  'activity.learned.skip': 'Sueles saltarte',

  'activity.removed.heading': 'Fuera de tu feed',
  'activity.removed.channels': 'Canales ocultos',
  // When the channel was hidden.
  'activity.removed.hiddenOn': 'Oculto desde el {date}',
  'activity.removed.showAgain': 'Volver a mostrar',
  'activity.removed.showAgainLabel': 'Volver a mostrar: {channel}',
  'activity.removed.showingAgain': 'Se vuelve a mostrar {channel}',
  // Heading: removed videos, after the hidden channels.
  'activity.removed.videos': 'Vídeos',
  // {reason} is how it was removed (dismiss.*.label).
  'activity.removed.meta': '{reason}, {channel}, {date}',
  'activity.removed.restore': 'Restaurar',
  'activity.removed.restore.label': 'Restaurar {title}',
  'activity.removed.restore.labelNoTitle': 'Restaurar el vídeo de {channel}',
  'activity.removed.restore.status': 'Has restaurado {title}',
  'activity.removed.restore.statusNoTitle': 'Has restaurado el vídeo de {channel}',
} satisfies Messages;

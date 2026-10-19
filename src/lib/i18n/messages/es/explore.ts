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
  'explore.noKey.title': 'Conecta tu clave de YouTube para empezar',
  'explore.noKey.body': 'Tu feed se crea a partir de tu propio historial con tu propia clave de API. Se configura en un minuto.',
  'explore.noKey.openSettings': 'Abrir Configuración',

  // Name of the group of shortcut buttons, one per recent mood.
  'explore.quickMoods': 'Cambiar de estado de ánimo',
  // Each shortcut button's name for screen readers; it must contain the button's text, the mood's name.
  'explore.switchTo': 'Cambiar al estado de ánimo «{mood}»',
  'explore.editMood': 'Editar estado de ánimo',
  'explore.freshFeed': 'Feed nuevo',
  'explore.freshFeed.hint': 'Vuelve a cargar todos los canales y tu estado de ánimo, y aparta los vídeos que ya se te han mostrado.',
  'explore.refresh': 'Actualizar feed',
  'explore.refresh.title': 'Actualizar (usa los resultados guardados mientras sigan vigentes)',

  'explore.filter.region': 'Filtrar el feed',
  'explore.filter.placeholder': 'Filtra por etiqueta o palabra',
  // Buttons beside the filter box: show only videos with what’s typed, or hide them.
  'explore.filter.only': 'Solo',
  'explore.filter.only.label': 'Mostrar solo vídeos con {tag}',
  'explore.filter.hide': 'Ocultar',
  'explore.filter.hide.label': 'Ocultar vídeos con {tag}',
  // Enter and Shift+Enter are keys; “only” and “hide” are explore.filter.chip.*.
  'explore.filter.hint': 'Intro añade «solo»; Mayús+Intro añade «ocultar».',
  'explore.filter.active': 'Filtros activos',
  // The kind of an active filter, shown in small text before its tag.
  'explore.filter.chip.only': 'solo',
  'explore.filter.chip.hide': 'ocultar',
  // Remove buttons on those filters.
  'explore.filter.removeOnly': 'Quitar filtro «solo»: {tag}',
  'explore.filter.removeHide': 'Quitar filtro «ocultar»: {tag}',
  'explore.search': 'Buscar en YouTube',
  'explore.search.busy': 'Buscando…',
  // Units are YouTube API quota units; 101 and 12 are fixed.
  'explore.search.hint': '«Buscar en YouTube» usa hasta 101 unidades; si repites una búsqueda en menos de 12 horas, es gratis.',
  'explore.searchFor': 'Buscar «{query}» en YouTube',
  'explore.clearFilters': 'Quitar filtros',

  // Which channels the feed draws from: a group of four buttons named "Channels".
  'explore.scope.group': 'Canales',
  'explore.scope.all.label': 'Todo',
  'explore.scope.all.hint': 'Canales que conoces y canales nuevos.',
  'explore.scope.known.label': 'Canales que conozco',
  'explore.scope.known.hint': 'Solo canales que ves, a los que te has suscrito o que has valorado positivamente.',
  'explore.scope.new.label': 'Nuevos para mí',
  'explore.scope.new.hint': 'Solo canales que aún no has visto, en torno a tus intereses.',
  'explore.scope.uncharted.label': 'Inexplorado',
  'explore.scope.uncharted.hint': 'Temas y canales fuera de tu historial y de tus gustos. Tus estados de ánimo y las etiquetas que te gustan se dejan de lado; las etiquetas bloqueadas y lo que no te gusta se siguen teniendo en cuenta.',
  // Follows the Uncharted hint when a mood is active.
  'explore.scope.uncharted.moodPaused': 'El estado de ánimo «{mood}» queda en pausa mientras estás aquí.',

  // Menu of when videos were published.
  'explore.time.label': 'Fecha',
  'explore.time.any': 'Cualquier fecha',
  'explore.time.day': 'Último día',
  'explore.time.week': 'Última semana',
  'explore.time.month': 'Último mes',
  'explore.time.year': 'Último año',
  'explore.time.custom': 'Intervalo personalizado…',
  'explore.time.customRange': 'Intervalo de fechas personalizado',
  // Start and end dates of the custom range.
  'explore.time.from': 'Desde',
  'explore.time.to': 'Hasta',

  // Menu of how many views videos have: lesser-seen ones, or popular ("Pop") ones.
  'explore.views.label': 'Visualizaciones',
  'explore.views.any': 'Cualquier popularidad',
  'explore.views.lesser': 'Poco vistos (menos de {views})',
  'explore.views.popular': 'Populares (más de {views})',

  // YouTube's video categories (category.*); "All" turns the category filter off.
  'explore.category.group': 'Categoría',
  'explore.category.all': 'Todas',

  'explore.busy.pool': 'Actualizando tu feed…',
  'explore.busy.fresh': 'Creando un feed nuevo…',
  'explore.busy.mood': 'Buscando vídeos para el estado de ánimo «{mood}»…',
  'explore.busy.new': 'Buscando canales nuevos para ti…',
  'explore.busy.uncharted': 'Rumbo a terreno inexplorado…',
  'explore.busy.search': 'Buscando en YouTube…',

  // Status after the feed loads, followed by common.unitsUsed. "Exploring" is a
  // search around the user's interests (New to me); "charting" one outside them (Uncharted).
  'explore.note.fresh': { one: 'Feed nuevo con {count} canal.', other: 'Feed nuevo con {count} canales.' },
  'explore.note.fresh.exploring': {
    one: 'Feed nuevo con {count} canal, explorando «{topic}».',
    other: 'Feed nuevo con {count} canales, explorando «{topic}».',
  },
  'explore.note.fresh.charting': {
    one: 'Feed nuevo con {count} canal, rumbo a «{topic}».',
    other: 'Feed nuevo con {count} canales, rumbo a «{topic}».',
  },
  'explore.note.mood': 'Mostrando el estado de ánimo «{mood}».',
  'explore.note.mood.exploring': 'Mostrando el estado de ánimo «{mood}», explorando «{topic}».',
  // The feed was fetched again (units were used) or nothing needed fetching.
  'explore.note.updated': 'Actualizado.',
  'explore.note.updated.exploring': 'Actualizado, explorando «{topic}».',
  'explore.note.updated.charting': 'Actualizado, rumbo a «{topic}».',
  'explore.note.upToDate': 'Al día.',
  'explore.note.upToDate.exploring': 'Al día, explorando «{topic}».',
  'explore.note.upToDate.charting': 'Al día, rumbo a «{topic}».',
  // After Search YouTube, followed by common.unitsUsed or explore.note.fromLibrary.
  'explore.note.searchAdded': 'Se han añadido los resultados de «{query}».',
  'explore.note.fromLibrary': 'De tu biblioteca, sin usar unidades.',
  // Follows the status when filters are on.
  'explore.matches': { one: '{count} vídeo coincide.', other: '{count} vídeos coinciden.' },

  'explore.empty.title': 'Todavía no hay nada que coincida',
  'explore.empty.newNoInterests': '«Nuevos para mí» explora tus intereses, pero aún no conoce ninguno. Añade algunas etiquetas que te gusten, valora unos cuantos vídeos o importa tu historial de búsqueda en Configuración.',
  'explore.empty.new': 'Ahora mismo no hay canales nuevos que coincidan. Prueba «Feed nuevo» para explorar otro de tus intereses o cambia a «Todo».',
  'explore.empty.uncharted': 'Ahora mismo no hay nada inexplorado que coincida. Prueba «Feed nuevo» para ver otro tema o usa filtros menos estrictos.',
  'explore.empty.filtered': 'Prueba con menos filtros, añade etiquetas a este estado de ánimo o busca en YouTube para traer vídeos nuevos.',
  'explore.empty.noChannels': 'Importa tu historial de reproducciones en Configuración para que tu feed tenga canales de donde sacar vídeos.',

  // Heading of the feed, for screen readers.
  'explore.videos': 'Vídeos',
  'explore.attribution': 'Datos de vídeo proporcionados por YouTube. Los vídeos se reproducen en YouTube. <link>Términos de YouTube</link>',

  'explore.toast.rated': 'Valorado como «{rating}».',
  'explore.toast.ratedForMood': 'Valorado como «{rating}». El estado de ánimo «{mood}» aprenderá de ello.',
  'explore.toast.ratingRemoved': 'Valoración quitada.',
  // A video was removed from the feed for this reason (dismiss.*).
  'explore.toast.removed.not-interested': 'Quitado: no me interesa.',
  'explore.toast.removed.already-watched': 'Quitado: ya lo he visto.',
  'explore.toast.channelHidden': 'Has ocultado {channel}.',
  'explore.toast.subscribed': 'Te has suscrito a {channel}. Sus vídeos nuevos se añadirán a tu feed en la próxima actualización.',
  'explore.toast.unsubscribed': 'Has anulado la suscripción a {channel}.',
  'explore.toast.unsubscribedSync': 'Has anulado la suscripción a {channel}. Sincroniza para anularla también en YouTube.',
} satisfies Messages;

import type { Messages } from '../../index.ts';

/**
 * Syncing ratings and subscriptions with YouTube, and setting up the OAuth
 * client for it. In the guide (sync.howto.*), text in <b>…</b> names Google
 * Cloud Console screens, buttons and fields: keep it in English as written
 * (the guide's link opens the Console in English, as sync.howto.project says).
 * <b> is marked as English, so screen readers say it the way the Console shows
 * it; put nothing translated inside it. <em>…</em> is translated emphasis (bold
 * too): “same project”, and MeTube's and Google's buttons in sync.howto.continue.
 * {count}, {cost}, {total} and {reserve} are numbers; {scope} is an OAuth scope,
 * shown as it is.
 */
export default {
  'sync.title': 'Sincronizar con YouTube',
  'sync.intro': 'Opcional. Envía tus valoraciones de MeTube a YouTube como «Me gusta» y «No me gusta», y mantiene tus suscripciones sincronizadas en ambos sentidos, por lotes y cuando tú quieras.',
  /** {love}, {like}, {dislike}, {hate} are the rating names (rating.*.short). “Activity” is the Tags page tab and must match tags.tab.activity. */
  'sync.intro.ratings': '«{love}» y «{like}» pasan a ser «Me gusta»; «{dislike}» y «{hate}», «No me gusta». Sin esto, las valoraciones y las suscripciones se quedan en MeTube, y en Actividad verás las valoraciones para aplicarlas tú en YouTube.',

  /** {ratings} is sync.pending.ratings (“3 ratings”), {subs} is sync.pending.subs (“2 subscription changes”); the words around them are shown muted. */
  'sync.pending': '{ratings} y {subs} aún no están en YouTube',
  /** <n>…</n> is the count, shown large; <m>…</m> is the word after it, shown muted. */
  'sync.pending.ratings': { one: '<n>{count}</n> <m>valoración</m>', other: '<n>{count}</n> <m>valoraciones</m>' },
  'sync.pending.subs': { one: '<n>{count}</n> <m>cambio de suscripción</m>', other: '<n>{count}</n> <m>cambios de suscripción</m>' },
  'sync.now': 'Sincronizar ahora',
  'sync.syncing': 'Sincronizando…',
  'sync.hint.cost': {
    one: 'Abre el inicio de sesión de Google, lee tus suscripciones de YouTube (1 unidad por cada 50 canales) y después envía hasta {count} cambio ({cost} unidades cada uno, unas {total} en total).',
    other: 'Abre el inicio de sesión de Google, lee tus suscripciones de YouTube (1 unidad por cada 50 canales) y después envía hasta {count} cambios ({cost} unidades cada uno, unas {total} en total).',
  },
  'sync.hint.reserve': 'Siempre deja {reserve} unidades para tu feed.',
  'sync.cap.label': 'Máximo de cambios por sincronización',
  'sync.cap.hint': {
    one: 'Valoraciones y cambios de suscripción en conjunto; {count} unidad como máximo.',
    other: 'Valoraciones y cambios de suscripción en conjunto; {count} unidades como máximo.',
  },

  /** Label before the saved OAuth client ID. */
  'sync.clientId': 'ID de cliente',
  'sync.clientId.field': 'ID de cliente de OAuth',
  'sync.clientId.placeholder': 'Pega el ID de cliente de OAuth',
  'sync.clientId.invalid': 'Eso no parece un ID de cliente de OAuth. Un ID válido termina en .apps.googleusercontent.com.',
  /** {button} is the “Sync now” button (sync.now). */
  'sync.saved': 'Guardado. Selecciona «{button}» para iniciar sesión y enviar tus valoraciones.',

  /** The result of a sync: the sentences that apply, in this order, then common.unitsUsed. */
  'sync.result.subsRead': { one: 'Se ha leído {count} suscripción de YouTube.', other: 'Se han leído {count} suscripciones de YouTube.' },
  'sync.result.subsAdded': { one: '{count} suscripción es nueva en MeTube.', other: '{count} suscripciones son nuevas en MeTube.' },
  'sync.result.subsRemoved': { one: '{count} suscripción ya no está en YouTube.', other: '{count} suscripciones ya no están en YouTube.' },
  'sync.result.subscribed': { one: 'Te has suscrito a {count} canal.', other: 'Te has suscrito a {count} canales.' },
  'sync.result.unsubscribed': { one: 'Has anulado la suscripción a {count} canal.', other: 'Has anulado la suscripción a {count} canales.' },
  'sync.result.subsGone': { one: 'Se ha omitido {count} canal que ya no existe.', other: 'Se han omitido {count} canales que ya no existen.' },
  'sync.result.subsLeft': {
    one: '{count} cambio de suscripción queda para la próxima vez.',
    other: '{count} cambios de suscripción quedan para la próxima vez.',
  },
  'sync.result.ratingsSent': { zero: 'No se ha enviado ninguna valoración a YouTube.', one: 'Se ha enviado {count} valoración a YouTube.', other: 'Se han enviado {count} valoraciones a YouTube.' },
  'sync.result.ratingsGone': { one: 'Se ha omitido {count} vídeo que ya no está disponible.', other: 'Se han omitido {count} vídeos que ya no están disponibles.' },
  'sync.result.ratingsLeft': { one: '{count} valoración queda para la próxima vez.', other: '{count} valoraciones quedan para la próxima vez.' },
  /**
   * Why sending stopped early; follows the “… left for next time.” sentence it
   * explains. The limit and the reserve are shared, so when subscriptions stopped
   * at one, the reason may come once, after the ratings sentences, for both.
   */
  'sync.stopped.cap': 'Se ha alcanzado el límite por sincronización.',
  'sync.stopped.budget': 'Se ha detenido el envío para que tu feed conserve {reserve} unidades hoy.',
  'sync.stopped.unknown': 'Vuelve a intentarlo más tarde.',

  'sync.howto.title': 'Cómo configurar la sincronización',
  'sync.howto.project': 'En la <link>Google Cloud Console</link>, selecciona el <em>mismo proyecto</em> que el de tu clave de API. El enlace abre la consola en inglés para que sus menús coincidan con los nombres en negrita de abajo.',
  'sync.howto.consent': 'Ve a <b>APIs & Services → OAuth consent screen</b>. Elige <b>External</b>, ponle un nombre, p. ej., «MeTube (personal)», y añade tu correo electrónico.',
  'sync.howto.scopes': 'En <b>Scopes</b>, añade <code>{scope}</code>. En <b>Test users</b>, añade tu propia cuenta de Google. Deja la aplicación en <b>Testing</b>.',
  'sync.howto.client': 'Ve a <b>Credentials → Create credentials → OAuth client ID</b> y elige <b>Web application</b>.',
  'sync.howto.redirect': 'En <b>Authorized redirect URIs</b>, añade la dirección de MeTube en este navegador:',
  'sync.howto.copyId': 'Créalo, copia el <b>Client ID</b> (no el secreto del cliente: MeTube no lo necesita) y pégalo arriba.',
  /** {button} is the “Sync now” button (sync.now). “Continue” is the button on Google’s sign-in warning. MeTube asks Google to show its sign-in screens in the language chosen in MeTube, so use Google’s own wording for that button in this language. */
  'sync.howto.continue': 'Selecciona <em>{button}</em>. Google te avisará de que no ha verificado la aplicación: es lo normal con tu propia aplicación, así que selecciona <em>Continuar</em>.',
  'sync.howto.note': 'Inicias sesión cada vez que sincronizas; MeTube conserva el inicio de sesión solo durante esa sincronización y nunca lo guarda. La dirección de redirección cambia según el navegador, así que, si usas MeTube en Firefox y en Chrome, añade las dos.',
  /** Names the copyable redirect address, for screen readers (“Copy Redirect URL”). */
  'sync.redirectUrl': 'URL de redirección',
} satisfies Messages;

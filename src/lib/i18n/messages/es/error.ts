import type { Messages } from '../../index.ts';

/**
 * Errors from the YouTube API, the local quota guard and Google sign-in.
 * error.key-restricted names Google Cloud Console options in <b>…</b>
 * (Application restrictions, None, API restrictions): keep them in English, as
 * the API key guide does, so they match the Console's menus. <b> is marked as
 * English for screen readers, so put nothing translated inside it.
 * error.other and error.unknown are complete sentences on their own.
 * error.detail can follow error.other, error.unknown or a sign-in error when
 * YouTube, Google or the browser gave a reason MeTube has no message for:
 * {detail} is that reason as it is, always in English (a message such as
 * “User interaction required.” or “The requested file could not be read…”, or
 * a code such as “server_error”), shown in its own element marked as English.
 * Don't translate it or refer to it in the other messages.
 * error.storageFull is for the browser running out of space to save MeTube's
 * data (a full disk, for example).
 */
export default {
  'error.no-key': 'Añade tu clave de YouTube Data API en Configuración.',
  'error.invalid-key': 'Se ha rechazado esa clave de API. Compruébala en Configuración.',
  'error.key-restricted': 'Google bloquea esta clave para MeTube. En los ajustes de la clave, cambia <b>Application restrictions</b> a <b>None</b> y, en <b>API restrictions</b>, permite YouTube Data API v3.',
  'error.quota': 'Se ha agotado la cuota de la API de hoy. Se restablece a medianoche, hora del Pacífico.',
  'error.api-disabled': 'Habilita «YouTube Data API v3» en el proyecto de Google Cloud de esta clave.',
  'error.network': 'No se ha podido conectar con YouTube. Comprueba tu conexión y vuelve a intentarlo.',
  'error.auth': 'Tu sesión de YouTube ha caducado o se ha rechazado el acceso. Vuelve a iniciar sesión para seguir sincronizando.',
  'error.refused': 'YouTube lo ha rechazado por ahora. Vuelve a intentarlo más tarde.',
  'error.not-found': 'YouTube no lo ha encontrado.',
  'error.duplicate': 'YouTube ya lo tiene.',
  'error.other': 'YouTube ha devuelto un error.',
  'error.localQuota': {
    one: 'Hoy no queda suficiente cuota: hace falta {count} unidad (disponibles hoy: {remaining}).',
    other: 'Hoy no queda suficiente cuota: hacen falta {count} unidades (disponibles hoy: {remaining}).',
  },
  'error.unknown': 'Algo ha fallado. Inténtalo de nuevo.',
  'error.storageFull': 'No hay suficiente espacio de almacenamiento. Libera espacio en tu dispositivo y vuelve a intentarlo.',
  'error.signin.declined': 'Se ha rechazado el inicio de sesión.',
  'error.signin.cancelled': 'Se ha cancelado el inicio de sesión.',
  'error.signin.mismatch': 'La respuesta del inicio de sesión no coincide con la solicitud. Vuelve a intentarlo.',
  'error.signin.noToken': 'Google no ha devuelto ningún token de inicio de sesión.',
  'error.signin.provider': 'No se ha podido iniciar sesión con Google.',
  'error.signin.unreachable': 'No se ha podido abrir el inicio de sesión de Google. Comprueba tu conexión y vuelve a intentarlo.',
  'error.signin.incognito': 'El inicio de sesión de Google no funciona en ventanas privadas. Abre MeTube en una ventana normal para sincronizar.',
  'error.signin.failed': 'No se ha podido completar el inicio de sesión de Google. Comprueba que la URL de redirección que aparece abajo está añadida a tu cliente de OAuth.',
  'error.detail': 'Detalles: <code>{detail}</code>',
} satisfies Messages;

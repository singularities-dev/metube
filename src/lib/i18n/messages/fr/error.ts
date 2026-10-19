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
  'error.no-key': 'Ajoutez votre clé API YouTube Data dans Paramètres.',
  'error.invalid-key': 'Cette clé API a été refusée. Vérifiez-la dans Paramètres.',
  'error.key-restricted': 'Google bloque cette clé pour MeTube. Dans les paramètres de la clé, réglez <b>Application restrictions</b> sur <b>None</b> et, sous <b>API restrictions</b>, autorisez YouTube Data API v3.',
  'error.quota': 'Le quota d’API du jour est épuisé. Il est réinitialisé à minuit, heure du Pacifique.',
  'error.api-disabled': 'Activez « YouTube Data API v3 » pour le projet Google Cloud de cette clé.',
  'error.network': 'Impossible de joindre YouTube. Vérifiez votre connexion et réessayez.',
  'error.auth': 'Votre connexion YouTube a expiré ou a été refusée. Reconnectez-vous pour continuer la synchronisation.',
  'error.refused': 'YouTube refuse la demande pour le moment. Réessayez plus tard.',
  'error.not-found': 'YouTube n’a pas trouvé cet élément.',
  'error.duplicate': 'Cet élément existe déjà sur YouTube.',
  'error.other': 'YouTube a renvoyé une erreur.',
  'error.localQuota': {
    one: 'Quota restant insuffisant aujourd’hui : il faut {count} unité et il en reste {remaining}.',
    other: 'Quota restant insuffisant aujourd’hui : il faut {count} unités et il en reste {remaining}.',
  },
  'error.unknown': 'Une erreur s’est produite. Veuillez réessayer.',
  'error.storageFull': 'Espace de stockage insuffisant. Libérez de l’espace sur votre appareil et réessayez.',
  'error.signin.declined': 'La connexion a été refusée.',
  'error.signin.cancelled': 'La connexion a été annulée.',
  'error.signin.mismatch': 'La réponse de connexion ne correspond pas à la demande. Réessayez.',
  'error.signin.noToken': 'Google n’a pas renvoyé de jeton de connexion.',
  'error.signin.provider': 'Échec de la connexion Google.',
  'error.signin.unreachable': 'Impossible d’ouvrir la page de connexion Google. Vérifiez votre accès à Internet et réessayez.',
  'error.signin.incognito': 'La connexion Google ne fonctionne pas dans une fenêtre de navigation privée. Ouvrez MeTube dans une fenêtre normale pour synchroniser.',
  'error.signin.failed': 'Impossible de terminer la connexion Google. Vérifiez que l’URL de redirection ci-dessous est bien ajoutée à votre client OAuth.',
  'error.detail': 'Détails : <code>{detail}</code>',
} satisfies Messages;

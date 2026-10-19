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
  'error.no-key': 'Füge in den Einstellungen deinen Schlüssel für die YouTube Data API hinzu.',
  'error.invalid-key': 'Dieser API-Schlüssel wurde abgelehnt. Prüfe ihn in den Einstellungen.',
  'error.key-restricted': 'Google sperrt diesen Schlüssel für MeTube. Stelle in den Einstellungen des Schlüssels <b>Application restrictions</b> auf <b>None</b> und erlaube unter <b>API restrictions</b> die YouTube Data API v3.',
  'error.quota': 'Das API-Kontingent für heute ist aufgebraucht. Es wird um Mitternacht pazifischer Zeit zurückgesetzt.',
  'error.api-disabled': 'Aktiviere „YouTube Data API v3“ im Google-Cloud-Projekt dieses Schlüssels.',
  'error.network': 'Keine Verbindung zu YouTube. Prüfe deine Internetverbindung und versuche es noch einmal.',
  'error.auth': 'Deine YouTube-Anmeldung ist abgelaufen oder wurde abgelehnt. Melde dich noch einmal an, um weiter zu synchronisieren.',
  'error.refused': 'YouTube hat die Anfrage vorerst abgelehnt. Versuche es später noch einmal.',
  'error.not-found': 'YouTube konnte das nicht finden.',
  'error.duplicate': 'Das ist auf YouTube schon vorhanden.',
  'error.other': 'YouTube hat einen Fehler gemeldet.',
  'error.localQuota': {
    one: 'Nicht mehr genug Kontingent für heute: Das kostet {count} Einheit (heute noch übrig: {remaining}).',
    other: 'Nicht mehr genug Kontingent für heute: Das kostet {count} Einheiten (heute noch übrig: {remaining}).',
  },
  'error.unknown': 'Etwas ist schiefgelaufen. Bitte versuche es noch einmal.',
  'error.storageFull': 'Nicht genug Speicherplatz. Gib auf deinem Gerät Speicherplatz frei und versuche es noch einmal.',
  'error.signin.declined': 'Die Anmeldung wurde abgelehnt.',
  'error.signin.cancelled': 'Die Anmeldung wurde abgebrochen.',
  'error.signin.mismatch': 'Die Antwort auf die Anmeldung passte nicht zur Anfrage. Versuche es noch einmal.',
  'error.signin.noToken': 'Google hat kein Anmeldetoken zurückgegeben.',
  'error.signin.provider': 'Die Google-Anmeldung ist fehlgeschlagen.',
  'error.signin.unreachable': 'Die Google-Anmeldung konnte nicht geöffnet werden. Prüfe deine Internetverbindung und versuche es noch einmal.',
  'error.signin.incognito': 'Die Google-Anmeldung funktioniert nicht in privaten Fenstern. Öffne MeTube zum Synchronisieren in einem normalen Fenster.',
  'error.signin.failed': 'Die Google-Anmeldung konnte nicht abgeschlossen werden. Prüfe, ob die Weiterleitungs-URL unten in deinem OAuth-Client eingetragen ist.',
  'error.detail': 'Details: <code>{detail}</code>',
} satisfies Messages;

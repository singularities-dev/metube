import type { Messages } from '../../index.ts';

/** Words and phrases shared across the app. */
export default {
  'common.undo': 'Rückgängig',
  'common.dismissMessage': 'Meldung schließen',
  'common.remove': 'Entfernen',
  'common.save': 'Speichern',
  'common.done': 'Fertig',
  'common.ok': 'OK',
  'common.close': 'Schließen',
  'common.cancel': 'Abbrechen',
  'common.showMore': { one: '{count} weiteres anzeigen', other: '{count} weitere anzeigen' },
  'common.units': { one: '{count} Einheit', other: '{count} Einheiten' },
  'common.unitsUsed': { zero: 'Keine Einheiten verbraucht.', one: '{count} Einheit verbraucht.', other: '{count} Einheiten verbraucht.' },
  'common.videos': { one: '{count} Video', other: '{count} Videos' },
  'common.channels': { one: '{count} Kanal', other: '{count} Kanäle' },
  'common.newTab': '(öffnet in neuem Tab)',
  'common.youtubeTerms': 'Nutzungsbedingungen von YouTube',
  'common.googlePrivacy': 'Datenschutzerklärung von Google',
} satisfies Messages;

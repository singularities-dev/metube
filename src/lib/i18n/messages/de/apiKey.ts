import type { Messages } from '../../index.ts';

/**
 * The YouTube API key panel in Settings, with its step-by-step guide.
 * Text in <b>…</b> names Google Cloud Console menus, buttons and options: keep
 * it in English as written. <b> is marked as English, so screen readers say it
 * the way the Console shows it; put nothing translated inside it. <em>…</em> is
 * translated emphasis (bold too): in step 6, {button} is this panel's “Save and
 * test” button. The guide's link opens the Console in English, which step 1
 * tells the user. {units} is a number.
 */
export default {
  'apiKey.heading': 'YouTube-API-Schlüssel',
  'apiKey.intro': 'Dein eigener Schlüssel aus Google Cloud, beschränkt auf die YouTube Data API v3. Er wird nur in diesem Browser gespeichert. Mit der Nutzung stimmst du den <link>Nutzungsbedingungen von YouTube</link> zu.',
  'apiKey.field': 'Schlüssel für die YouTube Data API',
  'apiKey.placeholder': 'API-Schlüssel einfügen',
  'apiKey.save': 'Speichern und testen',
  'apiKey.testing': 'Wird getestet…',
  'apiKey.works': 'Der Schlüssel funktioniert. Der Test hat 1 Einheit verbraucht.',
  'apiKey.howTo.title': 'So bekommst du einen API-Schlüssel',
  'apiKey.howTo.step1': 'Öffne die <link>Google Cloud Console</link> und melde dich an. Das ist kostenlos: Für das Standardkontingent brauchst du kein Rechnungskonto. Der Link öffnet die Console auf Englisch, damit ihre Menüs zu den fett gedruckten Namen unten passen.',
  'apiKey.howTo.step2': 'Erstelle über die Projektauswahl oben mit <b>New project</b> ein neues Projekt, etwa „metube“, und achte darauf, dass es ausgewählt ist.',
  'apiKey.howTo.step3': 'Gehe zu <b>APIs & Services → Library</b>, suche <b>YouTube Data API v3</b> und klicke auf <b>Enable</b>.',
  'apiKey.howTo.step4': 'Gehe zu <b>APIs & Services → Credentials</b> und wähle dann <b>Create credentials → API key</b>.',
  'apiKey.howTo.step5': 'Öffne den neuen Schlüssel. Wähle unter <b>API restrictions</b> die Option <b>Restrict key</b> und setze nur bei YouTube Data API v3 ein Häkchen. Lass <b>Application restrictions</b> auf <b>None</b>: Erweiterungen senden keine Website-Adresse, daher würde eine Website-Beschränkung MeTube blockieren. Speichere zum Schluss.',
  'apiKey.howTo.step6': 'Kopiere den Schlüssel, füge ihn oben ein und wähle <em>{button}</em>.',
  'apiKey.howTo.note': 'Halte den Schlüssel geheim. Damit hast du {units} Einheiten pro Tag; die Kontingentanzeige von MeTube zählt mit.',
} satisfies Messages;

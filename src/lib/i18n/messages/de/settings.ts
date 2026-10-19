import type { Messages } from '../../index.ts';

/**
 * The Settings page: appearance, feed options and the data section.
 * Labels name switches and sliders; hints are the line of help under them.
 * Names quoted in hints must match their labels elsewhere: Explore (the
 * navigation tab) and Edit mood. The page-size hint describes the button under
 * the feed instead of quoting it, since its label includes the count.
 * Shorts is YouTube's name for its short vertical videos: use YouTube's word.
 */
export default {
  'settings.heading': 'Einstellungen',
  'settings.appearance': 'Darstellung',
  'settings.theme': 'Design',
  'settings.feed': 'Feed',
  'settings.pageSize': 'Videos pro Seite',
  'settings.pageSize.hint': 'Wie viele Videos „Entdecken“ auf einmal zeigt und wie viele die Schaltfläche unter dem Feed jeweils hinzufügt.',
  'settings.poolChannels': 'Kanäle für den Feed',
  'settings.poolChannels.hint': {
    one: 'Deine meistgesehenen Kanäle. Eine vollständige Aktualisierung verbraucht etwa {count} Einheit.',
    other: 'Deine meistgesehenen Kanäle. Eine vollständige Aktualisierung verbraucht etwa {count} Einheiten.',
  },
  'settings.uploadsPerChannel': 'Neueste Videos pro Kanal',
  'settings.perChannelCap': 'Max. Videos pro Kanal ganz oben',
  'settings.perChannelCap.hint': 'Verhindert, dass ein sehr aktiver Kanal die erste Seite füllt. Bei 0 ist das ausgeschaltet.',
  'settings.moodFetch': 'Bei Stimmungswechsel neue Videos finden',
  'settings.moodFetch.hint': 'Eine YouTube-Suche pro Stimmung (101 Einheiten), 12 Stunden lang wiederverwendet. Aus: Stimmungen sortieren nur die Videos deiner Kanäle neu.',
  'settings.autoMoods': 'Stimmungen nach Zeitplan wechseln',
  'settings.autoMoods.hint': 'Stimmungen mit Zeitplan werden automatisch aktiv, wenn ihre Zeit beginnt. Die Zeiten legst du unter „Entdecken“ mit „Stimmung bearbeiten“ fest.',
  'settings.playInline': 'Videos in MeTube abspielen',
  'settings.playInline.hint': 'Ein Klick auf ein Video öffnet den YouTube-Player hier in einem Fenster, mit den Bewertungen daneben. Aus: öffnet einen neuen YouTube-Tab. Strg+Klick öffnet immer einen Tab.',
  'settings.hideShorts': 'Shorts ausblenden',
  'settings.hideShorts.hint': 'Videos im Hochformat bis 3 Minuten, bei unbekanntem Format bis zu einer Minute.',
  'settings.hideWatched': 'Angesehene Videos ausblenden',
  'settings.data': 'Deine Daten',
  'settings.data.hint': 'Alles wird nur in diesem Browser gespeichert. Löschen entfernt den importierten Verlauf, nicht deine Tags, Stimmungen oder Einstellungen.',
  'settings.data.confirm': 'Alle importierten Daten (Wiedergabeverlauf, Suchanfragen, Abos und Playlists) aus diesem Browser entfernen?',
  'settings.data.clear': 'Importierten Verlauf löschen',
} satisfies Messages;

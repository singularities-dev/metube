import type { Messages } from '../../index.ts';

/** Importing a Google Takeout export. */
export default {
  'import.title': 'Aus Google Takeout importieren',
  /** “YouTube and YouTube Music” is the folder’s name in Takeout: use the name Takeout gives it in your language. JSON is one of Takeout’s format choices for the history (the other is HTML). */
  'import.intro': 'Wähle den Ordner „YouTube und YouTube Music“ aus deinem Takeout-Export oder einzelne Dateien daraus. Stelle in Takeout JSON als Format für den Verlauf ein. Alles bleibt in diesem Browser.',
  'import.chooseFolder': 'Ordner auswählen',
  'import.chooseFiles': 'Dateien auswählen',
  'import.importing': 'Wird importiert…',
  'import.imported': { one: '{count} Datei importiert.', other: '{count} Dateien importiert.' },
  'import.noneFound': 'Keine dieser Dateien scheint eine Verlaufs-, Abo- oder Playlist-Datei aus einem YouTube-Takeout-Export zu sein.',
  /** Caption of the results table, for screen readers. */
  'import.results': 'Importergebnisse',
  /** Column headers of the results table: the file’s name, what kind of file it is, and how many entries in it were imported and skipped. */
  'import.col.file': 'Datei',
  'import.col.type': 'Typ',
  'import.col.imported': 'Importiert',
  'import.col.skipped': 'Übersprungen',
  /** What a file holds, in the table’s Type column. */
  'import.kind.watch': 'Wiedergabeverlauf',
  'import.kind.search': 'Suchverlauf',
  'import.kind.subscriptions': 'Abos',
  'import.kind.playlist': 'Playlist',
  'import.kind.ignored': 'Nicht verwendet',
} satisfies Messages;

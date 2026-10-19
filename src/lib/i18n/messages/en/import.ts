import type { Messages } from '../../index.ts';

/** Importing a Google Takeout export. */
export default {
  'import.title': 'Import from Google Takeout',
  /** “YouTube and YouTube Music” is the folder’s name in Takeout: use the name Takeout gives it in your language. JSON is one of Takeout’s format choices for the history (the other is HTML). */
  'import.intro': 'Pick the “YouTube and YouTube Music” folder from your Takeout export, or individual files. In Takeout, choose JSON as the history format. Everything stays in this browser.',
  'import.chooseFolder': 'Choose folder',
  'import.chooseFiles': 'Choose files',
  'import.importing': 'Importing…',
  'import.imported': { one: 'Imported {count} file.', other: 'Imported {count} files.' },
  'import.noneFound': 'None of these look like YouTube Takeout history, subscription or playlist files.',
  /** Caption of the results table, for screen readers. */
  'import.results': 'Import results',
  /** Column headers of the results table: the file’s name, what kind of file it is, and how many entries in it were imported and skipped. */
  'import.col.file': 'File',
  'import.col.type': 'Type',
  'import.col.imported': 'Imported',
  'import.col.skipped': 'Skipped',
  /** What a file holds, in the table’s Type column. */
  'import.kind.watch': 'Watch history',
  'import.kind.search': 'Search history',
  'import.kind.subscriptions': 'Subscriptions',
  'import.kind.playlist': 'Playlist',
  'import.kind.ignored': 'Not used',
} satisfies Messages;

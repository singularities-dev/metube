import type { Messages } from '../../index.ts';

/** Importing a Google Takeout export. */
export default {
  'import.title': 'Importer depuis Google Takeout',
  /** “YouTube and YouTube Music” is the folder’s name in Takeout: use the name Takeout gives it in your language. JSON is one of Takeout’s format choices for the history (the other is HTML). */
  'import.intro': 'Choisissez le dossier « YouTube et YouTube Music » de votre export Takeout, ou des fichiers séparés. Dans Takeout, sélectionnez le format JSON pour l’historique. Tout reste dans ce navigateur.',
  'import.chooseFolder': 'Choisir un dossier',
  'import.chooseFiles': 'Choisir des fichiers',
  'import.importing': 'Importation…',
  'import.imported': { one: '{count} fichier importé.', other: '{count} fichiers importés.' },
  'import.noneFound': 'Aucun de ces fichiers ne semble être un fichier d’historique, d’abonnements ou de playlist YouTube issu de Takeout.',
  /** Caption of the results table, for screen readers. */
  'import.results': 'Résultats de l’importation',
  /** Column headers of the results table: the file’s name, what kind of file it is, and how many entries in it were imported and skipped. */
  'import.col.file': 'Fichier',
  'import.col.type': 'Type',
  'import.col.imported': 'Importées',
  'import.col.skipped': 'Ignorées',
  /** What a file holds, in the table’s Type column. */
  'import.kind.watch': 'Historique des vidéos regardées',
  'import.kind.search': 'Historique des recherches',
  'import.kind.subscriptions': 'Abonnements',
  'import.kind.playlist': 'Playlist',
  'import.kind.ignored': 'Non utilisé',
} satisfies Messages;

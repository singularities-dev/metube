import type { Messages } from '../../index.ts';

/** Importing a Google Takeout export. */
export default {
  'import.title': 'Importar desde Google Takeout',
  /** “YouTube and YouTube Music” is the folder’s name in Takeout: use the name Takeout gives it in your language. JSON is one of Takeout’s format choices for the history (the other is HTML). */
  'import.intro': 'Elige la carpeta «YouTube y YouTube Music» de tu exportación de Takeout, o archivos sueltos. En Takeout, selecciona JSON como formato del historial. Todo se queda en este navegador.',
  'import.chooseFolder': 'Elegir carpeta',
  'import.chooseFiles': 'Elegir archivos',
  'import.importing': 'Importando…',
  'import.imported': { one: 'Se ha importado {count} archivo.', other: 'Se han importado {count} archivos.' },
  'import.noneFound': 'Ninguno de estos archivos parece contener historial, suscripciones o listas de reproducción de YouTube Takeout.',
  /** Caption of the results table, for screen readers. */
  'import.results': 'Resultados de la importación',
  /** Column headers of the results table: the file’s name, what kind of file it is, and how many entries in it were imported and skipped. */
  'import.col.file': 'Archivo',
  'import.col.type': 'Tipo',
  'import.col.imported': 'Importados',
  'import.col.skipped': 'Omitidos',
  /** What a file holds, in the table’s Type column. */
  'import.kind.watch': 'Historial de reproducciones',
  'import.kind.search': 'Historial de búsqueda',
  'import.kind.subscriptions': 'Suscripciones',
  'import.kind.playlist': 'Lista de reproducción',
  'import.kind.ignored': 'No se usa',
} satisfies Messages;

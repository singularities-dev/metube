import type { Messages } from '../../index.ts';

/** Words and phrases shared across the app. */
export default {
  'common.undo': 'Deshacer',
  'common.dismissMessage': 'Cerrar mensaje',
  'common.remove': 'Quitar',
  'common.save': 'Guardar',
  'common.done': 'Hecho',
  'common.ok': 'Aceptar',
  'common.close': 'Cerrar',
  'common.cancel': 'Cancelar',
  'common.showMore': { one: 'Mostrar {count} más', other: 'Mostrar {count} más' },
  'common.units': { one: '{count} unidad', other: '{count} unidades' },
  'common.unitsUsed': { zero: 'No se ha usado ninguna unidad.', one: 'Se ha usado {count} unidad.', other: 'Se han usado {count} unidades.' },
  'common.videos': { one: '{count} vídeo', other: '{count} vídeos' },
  'common.channels': { one: '{count} canal', other: '{count} canales' },
  'common.newTab': '(se abre en una pestaña nueva)',
  'common.youtubeTerms': 'Términos del Servicio de YouTube',
  'common.googlePrivacy': 'Política de Privacidad de Google',
} satisfies Messages;

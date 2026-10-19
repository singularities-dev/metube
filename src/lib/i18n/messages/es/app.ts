import type { Messages } from '../../index.ts';

/**
 * The app shell: navigation, theme, quota meter and scheduled-mood notice.
 * {mood} is a mood name, left as it is. It may be an adjective ("Energetic"),
 * an imperative ("Make me laugh") or anything the user typed, so always
 * introduce it with the word for mood and quote it (the “{mood}” mood), or use
 * a label form ("Mood: {mood}").
 * In app.theme.switch, {current} and {next} are theme names (app.theme.*),
 * which may be phrases such as “Match system”, so put them in a label
 * position (“Next: {next}”) or quote them, never bare after a verb.
 */
export default {
  'app.skip': 'Saltar al contenido',
  'app.nav': 'Principal',
  'app.nav.explore': 'Explorar',
  'app.nav.tags': 'Etiquetas',
  'app.nav.settings': 'Configuración',
  'app.title': '{view} · MeTube',
  'app.theme.system': 'Según el sistema',
  'app.theme.light': 'Claro',
  'app.theme.dark': 'Oscuro',
  'app.theme.switch': 'Tema: {current}. Cambiar a «{next}»',
  'app.collapse': 'Contraer',
  'app.collapseMenu': 'Contraer menú',
  'app.expandMenu': 'Expandir menú',
  'app.quota.left': { one: 'Queda {count} unidad', other: 'Quedan {count} unidades' },
  'app.quota.about': 'Información sobre el uso de la cuota',
  'app.quota.help': 'Es una estimación. MeTube cuenta las unidades que debería usar cada solicitud (disponibles hoy: {left} de {limit}). Google Cloud lleva la cuenta real, así que consulta la página de cuota de tu proyecto en la Cloud Console para ver las cifras exactas. Se restablece a medianoche, hora del Pacífico.',
  'app.autoMood': 'Se ha cambiado al estado de ánimo «{mood}» según su horario.',
} satisfies Messages;

import type { Messages } from '../../index.ts';

/**
 * Editing a mood: its tags, intensity, schedule and what it has learned.
 * {name} and {parent} are mood names or paths, {tag} and {query} are tags or
 * search terms, all shown as they are. {query} is what the mood searches
 * YouTube for: the user's tags, or a starter mood's tags in the UI language
 * (moodSeedTags.ts). A mood name may be an adjective
 * ("Energetic"), an imperative ("Make me laugh") or anything the user typed,
 * so introduce {parent} with the word for mood and quote it (the “{parent}” mood).
 * searchOff and searchPaused replace searches when the mood isn't searching
 * YouTube: {setting} is the Settings option that turns mood searches on
 * (settings.moodFetch) and {scope} the Uncharted channel choice
 * (explore.scope.uncharted.label), each quoted as a whole label.
 *
 * "Learned" and "Channels" label the tags and channels the mood has picked up
 * from the user's ratings. Labels quoted in other messages must match: "More of" in learned.add, the
 * starter mood "Focus" (moodSeed.focus) in schedule.none, and "Settings".
 *
 * Schedule: a time window reads "{days} {from}–{to}", e.g. "weekdays 07:00–12:00";
 * {days} is "every day", "weekdays", "weekends" or short day names, Monday
 * first ("Mon, Sat"). {from} and {to} are 24-hour times. {window} is one such
 * description and {windows} several, joined by window.separator. A window
 * never starts a sentence: it follows a colon or semicolon in schedule.on and
 * sits inside schedule.remove. So write everyDay, weekdays and weekends in the
 * form that fits mid-sentence (German "wochentags", not "Wochentags"). "to"
 * (schedule.between) sits between the two time fields; "From" and "To" are
 * those fields' names.
 *
 * Day toggles: dayInitial.N is the one-letter text on each day's button (0 =
 * Sunday) and day.N its full name, read by screen readers. The full name should
 * start with the button text (e.g. Spanish "Mi" rather than "X" for miércoles).
 */
export default {
  'moodEditor.name': 'Nombre',
  'moodEditor.moreOf': 'Más de esto',
  'moodEditor.neverShow': 'No mostrar nunca',
  'moodEditor.addTag': 'Añade una etiqueta',

  'moodEditor.intensity': 'Intensidad',
  'moodEditor.intensity.only': 'Solo vídeos de este estado de ánimo',
  'moodEditor.intensity.strong': 'Fuerte: sobre todo este estado de ánimo',
  'moodEditor.intensity.balanced': 'Equilibrada',
  'moodEditor.intensity.gentle': 'Toque suave',

  'moodEditor.schedule': 'Horario',
  'moodEditor.schedule.days': 'Días',
  'moodEditor.schedule.from': 'Desde',
  'moodEditor.schedule.to': 'Hasta',
  'moodEditor.schedule.between': 'a',
  'moodEditor.schedule.remove': 'Quitar la franja «{window}»',
  'moodEditor.schedule.add': 'Añadir franja',
  'moodEditor.schedule.on': 'Se activa solo: {windows}. Si eliges otro estado de ánimo en ese horario, se respeta tu elección.',
  'moodEditor.schedule.off': 'El cambio automático por horario está desactivado en Configuración.',
  'moodEditor.schedule.none': 'Haz que este estado de ánimo se active solo a ciertas horas, como «Concentración» las mañanas entre semana.',

  'moodEditor.window': '{days} {from}–{to}',
  'moodEditor.window.noDays': '{from}–{to}',
  'moodEditor.window.separator': '; ',
  'moodEditor.window.everyDay': 'todos los días',
  'moodEditor.window.weekdays': 'entre semana',
  'moodEditor.window.weekends': 'fines de semana',

  'moodEditor.day.1': 'Lunes',
  'moodEditor.day.2': 'Martes',
  'moodEditor.day.3': 'Miércoles',
  'moodEditor.day.4': 'Jueves',
  'moodEditor.day.5': 'Viernes',
  'moodEditor.day.6': 'Sábado',
  'moodEditor.day.0': 'Domingo',
  'moodEditor.dayInitial.1': 'L',
  'moodEditor.dayInitial.2': 'M',
  'moodEditor.dayInitial.3': 'Mi',
  'moodEditor.dayInitial.4': 'J',
  'moodEditor.dayInitial.5': 'V',
  'moodEditor.dayInitial.6': 'S',
  'moodEditor.dayInitial.0': 'D',

  'moodEditor.learned': 'Lo aprendido',
  'moodEditor.learned.add': '{tag}, añadir a «Más de esto»',
  'moodEditor.learned.hint': 'Etiquetas de vídeos que has valorado positivamente con este estado de ánimo activo. Añádelas para que cuenten de forma explícita.',
  'moodEditor.channels': 'Canales',
  'moodEditor.channels.hint': 'Canales que valoras positivamente con este estado de ánimo. Sus vídeos nuevos aparecen siempre que está activo.',
  'moodEditor.inherits': 'También usa las etiquetas del estado de ánimo «{parent}».',

  'moodEditor.searches': 'Busca «{query}» en YouTube.',
  'moodEditor.noSearch': 'Añade una etiqueta para que este estado de ánimo pueda encontrar vídeos nuevos.',
  'moodEditor.searchOff': 'Este estado de ánimo no busca en YouTube: la opción «{setting}» está desactivada en Configuración.',
  'moodEditor.searchPaused': 'Este estado de ánimo no busca en YouTube mientras estás en «{scope}».',
  'moodEditor.delete': 'Eliminar estado de ánimo',
  'moodEditor.delete.confirm': '¿Eliminar «{name}» y los estados de ánimo que dependen de él?',
} satisfies Messages;

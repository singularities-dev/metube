import type { Messages } from '../../index.ts';

/**
 * The mood picker in the Explore header: a button showing the current mood (or
 * "Pick a mood") that opens a searchable list of moods. "Moods" is the list's
 * name for screen readers, "No mood" the option that turns the mood off, and
 * "(current)" is read after the mood that's on. {mood} and {parent} are mood
 * names or paths ("Energetic › Motorsport") and {name} is what the user typed,
 * all shown as they are. A mood name may be an adjective or an imperative
 * ("Make me laugh"), so quote it after the word for mood (the “{parent}” mood)
 * or use a label form ("Mood: {mood}").
 */
export default {
  'moodPicker.pick': 'Elige un estado de ánimo',
  'moodPicker.current': 'Estado de ánimo: {mood}',
  'moodPicker.clear': 'Quitar estado de ánimo',
  'moodPicker.dialog': 'Elige un estado de ánimo',
  'moodPicker.search': 'Busca o crea un estado de ánimo',
  'moodPicker.list': 'Estados de ánimo',
  'moodPicker.none': 'Sin estado de ánimo',
  'moodPicker.createUnder': 'Crear «{name}» dentro del estado de ánimo «{parent}»',
  'moodPicker.createNew': 'Crear «{name}» como estado de ánimo nuevo',
  'moodPicker.isCurrent': '(actual)',
  'moodPicker.empty': 'Escribe un nombre para crear un estado de ánimo',
} satisfies Messages;

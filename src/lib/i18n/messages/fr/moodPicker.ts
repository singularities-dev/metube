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
  'moodPicker.pick': 'Choisir une humeur',
  'moodPicker.current': 'Humeur : {mood}',
  'moodPicker.clear': 'Désactiver l’humeur',
  'moodPicker.dialog': 'Choisir une humeur',
  'moodPicker.search': 'Rechercher ou créer une humeur',
  'moodPicker.list': 'Humeurs',
  'moodPicker.none': 'Aucune humeur',
  'moodPicker.createUnder': 'Créer « {name} » dans l’humeur « {parent} »',
  'moodPicker.createNew': 'Créer « {name} » comme nouvelle humeur',
  'moodPicker.isCurrent': '(actuelle)',
  'moodPicker.empty': 'Saisissez un nom pour créer une humeur',
} satisfies Messages;

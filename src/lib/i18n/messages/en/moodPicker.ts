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
  'moodPicker.pick': 'Pick a mood',
  'moodPicker.current': 'Mood: {mood}',
  'moodPicker.clear': 'Clear mood',
  'moodPicker.dialog': 'Choose a mood',
  'moodPicker.search': 'Search or create a mood',
  'moodPicker.list': 'Moods',
  'moodPicker.none': 'No mood',
  'moodPicker.createUnder': 'Create “{name}” under the “{parent}” mood',
  'moodPicker.createNew': 'Create “{name}” as a new mood',
  'moodPicker.isCurrent': '(current)',
  'moodPicker.empty': 'Type a name to create a mood',
} satisfies Messages;

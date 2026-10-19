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
  'moodPicker.pick': 'Stimmung wählen',
  'moodPicker.current': 'Stimmung: {mood}',
  'moodPicker.clear': 'Stimmung abwählen',
  'moodPicker.dialog': 'Stimmung wählen',
  'moodPicker.search': 'Stimmung suchen oder erstellen',
  'moodPicker.list': 'Stimmungen',
  'moodPicker.none': 'Keine Stimmung',
  'moodPicker.createUnder': '„{name}“ unter der Stimmung „{parent}“ erstellen',
  'moodPicker.createNew': '„{name}“ als neue Stimmung erstellen',
  'moodPicker.isCurrent': '(aktuell)',
  'moodPicker.empty': 'Gib einen Namen ein, um eine Stimmung zu erstellen',
} satisfies Messages;

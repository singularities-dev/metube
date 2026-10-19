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
  'moodEditor.name': 'Name',
  'moodEditor.moreOf': 'More of',
  'moodEditor.neverShow': 'Never show',
  'moodEditor.addTag': 'Add a tag',

  'moodEditor.intensity': 'Intensity',
  'moodEditor.intensity.only': 'Only videos that fit this mood',
  'moodEditor.intensity.strong': 'Strong: mostly this mood',
  'moodEditor.intensity.balanced': 'Balanced',
  'moodEditor.intensity.gentle': 'Gentle nudge',

  'moodEditor.schedule': 'Schedule',
  'moodEditor.schedule.days': 'Days',
  'moodEditor.schedule.from': 'From',
  'moodEditor.schedule.to': 'To',
  'moodEditor.schedule.between': 'to',
  'moodEditor.schedule.remove': 'Remove “{window}”',
  'moodEditor.schedule.add': 'Add a time',
  'moodEditor.schedule.on': 'Switches on by itself: {windows}. Picking another mood during that time is respected.',
  'moodEditor.schedule.off': 'Scheduled switching is off in Settings.',
  'moodEditor.schedule.none': 'Switch this mood on automatically at certain times, like Focus on weekday mornings.',

  'moodEditor.window': '{days} {from}–{to}',
  'moodEditor.window.noDays': '{from}–{to}',
  // Between schedule descriptions in one sentence (French puts a narrow no-break space before ';').
  'moodEditor.window.separator': '; ',
  'moodEditor.window.everyDay': 'every day',
  'moodEditor.window.weekdays': 'weekdays',
  'moodEditor.window.weekends': 'weekends',

  'moodEditor.day.1': 'Monday',
  'moodEditor.day.2': 'Tuesday',
  'moodEditor.day.3': 'Wednesday',
  'moodEditor.day.4': 'Thursday',
  'moodEditor.day.5': 'Friday',
  'moodEditor.day.6': 'Saturday',
  'moodEditor.day.0': 'Sunday',
  'moodEditor.dayInitial.1': 'M',
  'moodEditor.dayInitial.2': 'T',
  'moodEditor.dayInitial.3': 'W',
  'moodEditor.dayInitial.4': 'T',
  'moodEditor.dayInitial.5': 'F',
  'moodEditor.dayInitial.6': 'S',
  'moodEditor.dayInitial.0': 'S',

  'moodEditor.learned': 'Learned',
  'moodEditor.learned.add': '{tag}, add to More of',
  'moodEditor.learned.hint': 'Tags from videos you rated well while this mood was on. Add them to make it explicit.',
  'moodEditor.channels': 'Channels',
  'moodEditor.channels.hint': 'Channels you rate well in this mood. Their new videos come in whenever it’s on.',
  'moodEditor.inherits': 'Also uses the tags of the “{parent}” mood.',

  'moodEditor.searches': 'Searches YouTube for “{query}”.',
  'moodEditor.noSearch': 'Add a tag so this mood can find new videos.',
  'moodEditor.searchOff': 'This mood doesn’t search YouTube: “{setting}” is off in Settings.',
  'moodEditor.searchPaused': 'This mood doesn’t search YouTube while you’re in “{scope}”.',
  'moodEditor.delete': 'Delete mood',
  'moodEditor.delete.confirm': 'Delete “{name}” and any moods branching from it?',
} satisfies Messages;

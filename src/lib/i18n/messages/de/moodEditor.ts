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
  'moodEditor.moreOf': 'Mehr davon',
  'moodEditor.neverShow': 'Nie zeigen',
  'moodEditor.addTag': 'Tag hinzufügen',

  'moodEditor.intensity': 'Intensität',
  'moodEditor.intensity.only': 'Nur Videos, die zu dieser Stimmung passen',
  'moodEditor.intensity.strong': 'Stark: vor allem diese Stimmung',
  'moodEditor.intensity.balanced': 'Ausgewogen',
  'moodEditor.intensity.gentle': 'Sanfter Schubs',

  'moodEditor.schedule': 'Zeitplan',
  'moodEditor.schedule.days': 'Wochentage',
  'moodEditor.schedule.from': 'Von',
  'moodEditor.schedule.to': 'Bis',
  'moodEditor.schedule.between': 'bis',
  'moodEditor.schedule.remove': 'Zeitfenster „{window}“ entfernen',
  'moodEditor.schedule.add': 'Zeit hinzufügen',
  'moodEditor.schedule.on': 'Wird automatisch aktiv: {windows}. Wählst du in dieser Zeit eine andere Stimmung, bleibt es bei deiner Wahl.',
  'moodEditor.schedule.off': 'Der automatische Wechsel nach Zeitplan ist in den Einstellungen ausgeschaltet.',
  'moodEditor.schedule.none': 'Lass diese Stimmung zu bestimmten Zeiten automatisch aktiv werden, etwa „Fokus“ wochentags morgens.',

  'moodEditor.window': '{days} {from}–{to}',
  'moodEditor.window.noDays': '{from}–{to}',
  'moodEditor.window.separator': '; ',
  'moodEditor.window.everyDay': 'täglich',
  'moodEditor.window.weekdays': 'wochentags',
  'moodEditor.window.weekends': 'am Wochenende',

  'moodEditor.day.1': 'Montag',
  'moodEditor.day.2': 'Dienstag',
  'moodEditor.day.3': 'Mittwoch',
  'moodEditor.day.4': 'Donnerstag',
  'moodEditor.day.5': 'Freitag',
  'moodEditor.day.6': 'Samstag',
  'moodEditor.day.0': 'Sonntag',
  'moodEditor.dayInitial.1': 'Mo',
  'moodEditor.dayInitial.2': 'Di',
  'moodEditor.dayInitial.3': 'Mi',
  'moodEditor.dayInitial.4': 'Do',
  'moodEditor.dayInitial.5': 'Fr',
  'moodEditor.dayInitial.6': 'Sa',
  'moodEditor.dayInitial.0': 'So',

  'moodEditor.learned': 'Gelernt',
  'moodEditor.learned.add': '{tag}, zu „Mehr davon“ hinzufügen',
  'moodEditor.learned.hint': 'Tags aus Videos, die du positiv bewertet hast, während diese Stimmung aktiv war. Füge sie hinzu, damit sie fest dazugehören.',
  'moodEditor.channels': 'Kanäle',
  'moodEditor.channels.hint': 'Kanäle, die du in dieser Stimmung positiv bewertest. Ihre neuen Videos erscheinen immer, wenn die Stimmung aktiv ist.',
  'moodEditor.inherits': 'Nutzt auch die Tags der Stimmung „{parent}“.',

  'moodEditor.searches': 'Sucht auf YouTube nach „{query}“.',
  'moodEditor.noSearch': 'Füge ein Tag hinzu, damit diese Stimmung neue Videos finden kann.',
  'moodEditor.searchOff': 'Diese Stimmung sucht nicht auf YouTube: „{setting}“ ist in den Einstellungen ausgeschaltet.',
  'moodEditor.searchPaused': 'Diese Stimmung sucht nicht auf YouTube, solange „{scope}“ ausgewählt ist.',
  'moodEditor.delete': 'Stimmung löschen',
  'moodEditor.delete.confirm': '„{name}“ und alle Stimmungen, die davon abzweigen, löschen?',
} satisfies Messages;

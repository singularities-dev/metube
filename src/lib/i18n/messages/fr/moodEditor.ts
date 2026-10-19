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
  'moodEditor.name': 'Nom',
  'moodEditor.moreOf': 'Plus souvent',
  'moodEditor.neverShow': 'Ne jamais afficher',
  'moodEditor.addTag': 'Ajouter un tag',

  'moodEditor.intensity': 'Intensité',
  'moodEditor.intensity.only': 'Uniquement les vidéos de cette humeur',
  'moodEditor.intensity.strong': 'Forte : surtout cette humeur',
  'moodEditor.intensity.balanced': 'Équilibrée',
  'moodEditor.intensity.gentle': 'Léger coup de pouce',

  'moodEditor.schedule': 'Horaires',
  'moodEditor.schedule.days': 'Jours',
  'moodEditor.schedule.from': 'Début',
  'moodEditor.schedule.to': 'Fin',
  'moodEditor.schedule.between': 'à',
  'moodEditor.schedule.remove': 'Supprimer l’horaire {window}',
  'moodEditor.schedule.add': 'Ajouter un horaire',
  'moodEditor.schedule.on': 'S’active automatiquement : {windows}. Si vous choisissez une autre humeur pendant ces plages horaires, votre choix est respecté.',
  'moodEditor.schedule.off': 'Le changement d’humeur programmé est désactivé dans Paramètres.',
  'moodEditor.schedule.none': 'Activez cette humeur automatiquement à certaines heures, par exemple « Concentration » en semaine le matin.',

  'moodEditor.window': '{days} {from}–{to}',
  'moodEditor.window.noDays': '{from}–{to}',
  'moodEditor.window.separator': '\u202f; ',
  'moodEditor.window.everyDay': 'tous les jours',
  'moodEditor.window.weekdays': 'en semaine',
  'moodEditor.window.weekends': 'le week-end',

  'moodEditor.day.1': 'Lundi',
  'moodEditor.day.2': 'Mardi',
  'moodEditor.day.3': 'Mercredi',
  'moodEditor.day.4': 'Jeudi',
  'moodEditor.day.5': 'Vendredi',
  'moodEditor.day.6': 'Samedi',
  'moodEditor.day.0': 'Dimanche',
  'moodEditor.dayInitial.1': 'L',
  'moodEditor.dayInitial.2': 'M',
  'moodEditor.dayInitial.3': 'M',
  'moodEditor.dayInitial.4': 'J',
  'moodEditor.dayInitial.5': 'V',
  'moodEditor.dayInitial.6': 'S',
  'moodEditor.dayInitial.0': 'D',

  'moodEditor.learned': 'Appris',
  'moodEditor.learned.add': '{tag}, ajouter à « Plus souvent »',
  'moodEditor.learned.hint': 'Tags des vidéos que vous avez bien notées quand cette humeur était active. Ajoutez-les pour les rendre explicites.',
  'moodEditor.channels': 'Chaînes',
  'moodEditor.channels.hint': 'Chaînes que vous notez bien avec cette humeur. Leurs nouvelles vidéos arrivent chaque fois qu’elle est active.',
  'moodEditor.inherits': 'Utilise aussi les tags de l’humeur « {parent} ».',

  'moodEditor.searches': 'Cette humeur recherche « {query} » sur YouTube.',
  'moodEditor.noSearch': 'Ajoutez un tag pour que cette humeur puisse trouver de nouvelles vidéos.',
  'moodEditor.searchOff': 'Cette humeur ne lance pas de recherche sur YouTube : l’option « {setting} » est désactivée dans Paramètres.',
  'moodEditor.searchPaused': 'Cette humeur ne lance pas de recherche sur YouTube tant que vous êtes dans « {scope} ».',
  'moodEditor.delete': 'Supprimer l’humeur',
  'moodEditor.delete.confirm': 'Supprimer « {name} » et ses éventuelles sous-humeurs ?',
} satisfies Messages;

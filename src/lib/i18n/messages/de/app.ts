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
  'app.skip': 'Zum Inhalt springen',
  'app.nav': 'Hauptnavigation',
  'app.nav.explore': 'Entdecken',
  'app.nav.tags': 'Tags',
  'app.nav.settings': 'Einstellungen',
  'app.title': '{view} · MeTube',
  'app.theme.system': 'Systemstandard',
  'app.theme.light': 'Hell',
  'app.theme.dark': 'Dunkel',
  'app.theme.switch': 'Design: {current}. Auf {next} umstellen',
  'app.collapse': 'Einklappen',
  'app.collapseMenu': 'Menü einklappen',
  'app.expandMenu': 'Menü ausklappen',
  'app.quota.left': { one: 'Noch {count} Einheit', other: 'Noch {count} Einheiten' },
  'app.quota.about': 'Infos zum Verbrauch',
  'app.quota.help': 'Ein Schätzwert: MeTube zählt die Einheiten, die jede Anfrage kosten sollte (heute noch {left} von {limit} übrig). Den echten Zählerstand führt Google Cloud. Genaue Zahlen findest du auf der Kontingentseite deines Projekts in der Cloud Console. Wird um Mitternacht pazifischer Zeit zurückgesetzt.',
  'app.autoMood': 'Laut Zeitplan zur Stimmung „{mood}“ gewechselt.',
} satisfies Messages;

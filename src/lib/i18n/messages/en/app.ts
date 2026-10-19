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
  'app.skip': 'Skip to content',
  'app.nav': 'Main',
  'app.nav.explore': 'Explore',
  'app.nav.tags': 'Tags',
  'app.nav.settings': 'Settings',
  'app.title': '{view} · MeTube',
  'app.theme.system': 'Match system',
  'app.theme.light': 'Light',
  'app.theme.dark': 'Dark',
  'app.theme.switch': 'Theme: {current}. Next: {next}',
  'app.collapse': 'Collapse',
  'app.collapseMenu': 'Collapse menu',
  'app.expandMenu': 'Expand menu',
  'app.quota.left': { one: '{count} unit left', other: '{count} units left' },
  'app.quota.about': 'About this usage',
  'app.quota.help': 'An estimate. MeTube counts the units each request should cost ({left} of {limit} left today). Google Cloud keeps the real count, so check your project’s quota page in the Cloud Console for exact numbers. Resets at midnight Pacific time.',
  'app.autoMood': 'Switched to the “{mood}” mood for its scheduled time.',
} satisfies Messages;

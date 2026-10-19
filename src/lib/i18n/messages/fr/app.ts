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
  'app.skip': 'Aller au contenu',
  'app.nav': 'Menu principal',
  'app.nav.explore': 'Explorer',
  'app.nav.tags': 'Tags',
  'app.nav.settings': 'Paramètres',
  'app.title': '{view} · MeTube',
  'app.theme.system': 'Comme le système',
  'app.theme.light': 'Clair',
  'app.theme.dark': 'Sombre',
  'app.theme.switch': 'Thème : {current}. Passer au thème suivant : {next}',
  'app.collapse': 'Réduire',
  'app.collapseMenu': 'Réduire le menu',
  'app.expandMenu': 'Développer le menu',
  'app.quota.left': { one: '{count} unité restante', other: '{count} unités restantes' },
  'app.quota.about': 'À propos de ce décompte',
  'app.quota.help': 'Il s’agit d’une estimation. MeTube compte les unités de quota que chaque requête devrait coûter (il en reste {left} sur {limit} aujourd’hui). Google Cloud tient le décompte réel : pour les chiffres exacts, consultez la page des quotas de votre projet dans la Cloud Console. Le quota est réinitialisé à minuit, heure du Pacifique.',
  'app.autoMood': 'L’humeur « {mood} » s’est activée selon ses horaires.',
} satisfies Messages;

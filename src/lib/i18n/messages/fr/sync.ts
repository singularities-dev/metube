import type { Messages } from '../../index.ts';

/**
 * Syncing ratings and subscriptions with YouTube, and setting up the OAuth
 * client for it. In the guide (sync.howto.*), text in <b>…</b> names Google
 * Cloud Console screens, buttons and fields: keep it in English as written
 * (the guide's link opens the Console in English, as sync.howto.project says).
 * <b> is marked as English, so screen readers say it the way the Console shows
 * it; put nothing translated inside it. <em>…</em> is translated emphasis (bold
 * too): “same project”, and MeTube's and Google's buttons in sync.howto.continue.
 * {count}, {cost}, {total} and {reserve} are numbers; {scope} is an OAuth scope,
 * shown as it is.
 */
export default {
  'sync.title': 'Synchronisation avec YouTube',
  'sync.intro': 'Facultatif. Envoie vos notes MeTube à YouTube sous forme de « J’aime » et de « Je n’aime pas », et synchronise vos abonnements dans les deux sens, par lots, quand vous le décidez.',
  /** {love}, {like}, {dislike}, {hate} are the rating names (rating.*.short). “Activity” is the Tags page tab and must match tags.tab.activity. */
  'sync.intro.ratings': '« {love} » et « {like} » deviennent un « J’aime », « {dislike} » et « {hate} » un « Je n’aime pas ». Sans cela, les notes et les abonnements restent dans MeTube, et l’onglet Activité liste les notes que vous pouvez appliquer vous-même sur YouTube.',

  /** {ratings} is sync.pending.ratings (“3 ratings”), {subs} is sync.pending.subs (“2 subscription changes”); the words around them are shown muted. */
  'sync.pending': '{ratings} et {subs} pas encore sur YouTube',
  /** <n>…</n> is the count, shown large; <m>…</m> is the word after it, shown muted. */
  'sync.pending.ratings': { one: '<n>{count}</n> <m>note</m>', other: '<n>{count}</n> <m>notes</m>' },
  'sync.pending.subs': { one: '<n>{count}</n> <m>modification d’abonnement</m>', other: '<n>{count}</n> <m>modifications d’abonnement</m>' },
  'sync.now': 'Synchroniser',
  'sync.syncing': 'Synchronisation…',
  'sync.hint.cost': {
    one: 'Ouvre la connexion Google, lit vos abonnements YouTube (1 unité pour 50 chaînes), puis envoie jusqu’à {count} modification ({cost} unités chacune, environ {total} au total).',
    other: 'Ouvre la connexion Google, lit vos abonnements YouTube (1 unité pour 50 chaînes), puis envoie jusqu’à {count} modifications ({cost} unités chacune, environ {total} au total).',
  },
  'sync.hint.reserve': 'La synchronisation laisse toujours {reserve} unités pour votre fil.',
  'sync.cap.label': 'Maximum de modifications par synchronisation',
  'sync.cap.hint': {
    one: 'Notes et modifications d’abonnement confondues ; {count} unité au maximum.',
    other: 'Notes et modifications d’abonnement confondues ; {count} unités au maximum.',
  },

  /** Label before the saved OAuth client ID. */
  'sync.clientId': 'ID client',
  'sync.clientId.field': 'ID client OAuth',
  'sync.clientId.placeholder': 'Coller l’ID client OAuth',
  'sync.clientId.invalid': 'Cela ne ressemble pas à un ID client OAuth : il doit se terminer par .apps.googleusercontent.com.',
  /** {button} is the “Sync now” button (sync.now). */
  'sync.saved': 'Enregistré. Choisissez « {button} » pour vous connecter et envoyer vos notes.',

  /** The result of a sync: the sentences that apply, in this order, then common.unitsUsed. */
  'sync.result.subsRead': { one: '{count} abonnement lu sur YouTube.', other: '{count} abonnements lus sur YouTube.' },
  'sync.result.subsAdded': { one: '{count} abonnement ne figurait pas encore dans MeTube.', other: '{count} abonnements ne figuraient pas encore dans MeTube.' },
  'sync.result.subsRemoved': { one: '{count} abonnement n’est plus sur YouTube.', other: '{count} abonnements ne sont plus sur YouTube.' },
  'sync.result.subscribed': { one: 'Abonnement ajouté pour {count} chaîne.', other: 'Abonnements ajoutés pour {count} chaînes.' },
  'sync.result.unsubscribed': { one: 'Abonnement supprimé pour {count} chaîne.', other: 'Abonnements supprimés pour {count} chaînes.' },
  'sync.result.subsGone': { one: '{count} chaîne ignorée, car elle n’existe plus.', other: '{count} chaînes ignorées, car elles n’existent plus.' },
  'sync.result.subsLeft': {
    one: '{count} modification d’abonnement est reportée à la prochaine fois.',
    other: '{count} modifications d’abonnement sont reportées à la prochaine fois.',
  },
  'sync.result.ratingsSent': { zero: 'Aucune note envoyée à YouTube.', one: '{count} note envoyée à YouTube.', other: '{count} notes envoyées à YouTube.' },
  'sync.result.ratingsGone': { one: '{count} vidéo ignorée, car elle n’est plus disponible.', other: '{count} vidéos ignorées, car elles ne sont plus disponibles.' },
  'sync.result.ratingsLeft': { one: '{count} note est reportée à la prochaine fois.', other: '{count} notes sont reportées à la prochaine fois.' },
  /**
   * Why sending stopped early; follows the “… left for next time.” sentence it
   * explains. The limit and the reserve are shared, so when subscriptions stopped
   * at one, the reason may come once, after the ratings sentences, for both.
   */
  'sync.stopped.cap': 'La limite par synchronisation a été atteinte.',
  'sync.stopped.budget': 'L’envoi a été interrompu pour réserver {reserve} unités à votre fil aujourd’hui.',
  'sync.stopped.unknown': 'Réessayez plus tard.',

  'sync.howto.title': 'Comment configurer la synchronisation',
  'sync.howto.project': 'Dans la <link>Google Cloud Console</link>, sélectionnez le <em>même projet</em> que pour votre clé API. Le lien ouvre la console en anglais, pour que ses menus correspondent aux noms en gras ci-dessous.',
  'sync.howto.consent': 'Allez dans <b>APIs & Services → OAuth consent screen</b>. Choisissez <b>External</b>, donnez-lui un nom, par exemple « MeTube (personnel) », et ajoutez votre adresse e-mail.',
  'sync.howto.scopes': 'Sous <b>Scopes</b>, ajoutez <code>{scope}</code>. Sous <b>Test users</b>, ajoutez votre propre compte Google. Laissez l’application en <b>Testing</b>.',
  'sync.howto.client': 'Allez dans <b>Credentials → Create credentials → OAuth client ID</b> et choisissez <b>Web application</b>.',
  'sync.howto.redirect': 'Sous <b>Authorized redirect URIs</b>, ajoutez l’adresse de MeTube dans ce navigateur :',
  'sync.howto.copyId': 'Créez-le, copiez le <b>Client ID</b> (pas le secret, MeTube n’en a pas besoin) et collez-le ci-dessus.',
  /** {button} is the “Sync now” button (sync.now). “Continue” is the button on Google’s sign-in warning. MeTube asks Google to show its sign-in screens in the language chosen in MeTube, so use Google’s own wording for that button in this language. */
  'sync.howto.continue': 'Choisissez <em>{button}</em>. Google vous avertira qu’il n’a pas validé l’application : c’est normal pour votre propre application, choisissez donc <em>Continuer</em>.',
  'sync.howto.note': 'Vous vous connectez à chaque synchronisation ; MeTube ne garde la connexion que pour cette synchronisation et ne l’enregistre jamais. L’adresse de redirection diffère selon le navigateur : si vous utilisez MeTube dans Firefox et dans Chrome, ajoutez les deux.',
  /** Names the copyable redirect address, for screen readers (“Copy Redirect URL”). */
  'sync.redirectUrl': 'URL de redirection',
} satisfies Messages;

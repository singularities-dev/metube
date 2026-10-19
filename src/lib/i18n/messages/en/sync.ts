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
  'sync.title': 'Sync with YouTube',
  'sync.intro': 'Optional. Sends your MeTube ratings to YouTube as likes and dislikes, and keeps your subscriptions in step both ways, in batches when you choose.',
  /** {love}, {like}, {dislike}, {hate} are the rating names (rating.*.short). “Activity” is the Tags page tab and must match tags.tab.activity. */
  'sync.intro.ratings': '{love} and {like} become a like, {dislike} and {hate} a dislike. Without this, ratings and subscriptions stay in MeTube, and Activity lists ratings for you to apply on YouTube yourself.',

  /** {ratings} is sync.pending.ratings (“3 ratings”), {subs} is sync.pending.subs (“2 subscription changes”); the words around them are shown muted. */
  'sync.pending': '{ratings} and {subs} not on YouTube yet',
  /** <n>…</n> is the count, shown large; <m>…</m> is the word after it, shown muted. */
  'sync.pending.ratings': { one: '<n>{count}</n> <m>rating</m>', other: '<n>{count}</n> <m>ratings</m>' },
  'sync.pending.subs': { one: '<n>{count}</n> <m>subscription change</m>', other: '<n>{count}</n> <m>subscription changes</m>' },
  'sync.now': 'Sync now',
  'sync.syncing': 'Syncing…',
  'sync.hint.cost': {
    one: 'Opens Google sign-in, reads your YouTube subscriptions (1 unit per 50 channels), then sends up to {count} change ({cost} units each, about {total} in all).',
    other: 'Opens Google sign-in, reads your YouTube subscriptions (1 unit per 50 channels), then sends up to {count} changes ({cost} units each, about {total} in all).',
  },
  'sync.hint.reserve': 'It always leaves {reserve} units for your feed.',
  'sync.cap.label': 'Most changes per sync',
  'sync.cap.hint': {
    one: 'Ratings and subscription changes together; {count} unit at most.',
    other: 'Ratings and subscription changes together; {count} units at most.',
  },

  /** Label before the saved OAuth client ID. */
  'sync.clientId': 'Client ID',
  'sync.clientId.field': 'OAuth client ID',
  'sync.clientId.placeholder': 'Paste OAuth client ID',
  'sync.clientId.invalid': 'That doesn’t look like an OAuth client ID. It ends in .apps.googleusercontent.com.',
  /** {button} is the “Sync now” button (sync.now). */
  'sync.saved': 'Saved. Choose {button} to sign in and send your ratings.',

  /** The result of a sync: the sentences that apply, in this order, then common.unitsUsed. */
  'sync.result.subsRead': { one: 'Read {count} subscription from YouTube.', other: 'Read {count} subscriptions from YouTube.' },
  'sync.result.subsAdded': { one: '{count} subscription is new to MeTube.', other: '{count} subscriptions are new to MeTube.' },
  'sync.result.subsRemoved': { one: '{count} subscription is no longer on YouTube.', other: '{count} subscriptions are no longer on YouTube.' },
  'sync.result.subscribed': { one: 'Subscribed to {count} channel.', other: 'Subscribed to {count} channels.' },
  'sync.result.unsubscribed': { one: 'Unsubscribed from {count} channel.', other: 'Unsubscribed from {count} channels.' },
  'sync.result.subsGone': { one: 'Skipped {count} channel that no longer exists.', other: 'Skipped {count} channels that no longer exist.' },
  'sync.result.subsLeft': {
    one: '{count} subscription change is left for next time.',
    other: '{count} subscription changes are left for next time.',
  },
  'sync.result.ratingsSent': { zero: 'No ratings sent to YouTube.', one: '{count} rating sent to YouTube.', other: '{count} ratings sent to YouTube.' },
  'sync.result.ratingsGone': { one: 'Skipped {count} video that’s no longer available.', other: 'Skipped {count} videos that are no longer available.' },
  'sync.result.ratingsLeft': { one: '{count} rating is left for next time.', other: '{count} ratings are left for next time.' },
  /**
   * Why sending stopped early; follows the “… left for next time.” sentence it
   * explains. The limit and the reserve are shared, so when subscriptions stopped
   * at one, the reason may come once, after the ratings sentences, for both.
   */
  'sync.stopped.cap': 'The limit per sync was reached.',
  'sync.stopped.budget': 'Sending stopped to keep {reserve} units for your feed today.',
  'sync.stopped.unknown': 'Try again later.',

  'sync.howto.title': 'How to set up syncing',
  'sync.howto.project': 'In the <link>Google Cloud Console</link>, select the <em>same project</em> as your API key. The link opens the Console in English, so its menus match the names in bold below.',
  'sync.howto.consent': 'Go to <b>APIs & Services → OAuth consent screen</b>. Choose <b>External</b>, name it e.g. “MeTube (personal)” and add your email.',
  'sync.howto.scopes': 'Under <b>Scopes</b>, add <code>{scope}</code>. Under <b>Test users</b>, add your own Google account. Leave the app in <b>Testing</b>.',
  'sync.howto.client': 'Go to <b>Credentials → Create credentials → OAuth client ID</b> and pick <b>Web application</b>.',
  'sync.howto.redirect': 'Under <b>Authorized redirect URIs</b>, add this browser’s address for MeTube:',
  'sync.howto.copyId': 'Create it, copy the <b>Client ID</b> (not the secret, MeTube doesn’t need it) and paste it above.',
  /** {button} is the “Sync now” button (sync.now). “Continue” is the button on Google’s sign-in warning. MeTube asks Google to show its sign-in screens in the language chosen in MeTube, so use Google’s own wording for that button in this language. */
  'sync.howto.continue': 'Choose <em>{button}</em>. Google will warn that it hasn’t verified the app: that’s expected for your own app, so choose <em>Continue</em>.',
  'sync.howto.note': 'You sign in each time you sync; MeTube keeps the sign-in only for that sync and never stores it. The redirect address differs per browser, so if you use MeTube in both Firefox and Chrome, add both.',
  /** Names the copyable redirect address, for screen readers (“Copy Redirect URL”). */
  'sync.redirectUrl': 'Redirect URL',
} satisfies Messages;

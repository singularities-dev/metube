import type { Messages } from '../../index.ts';

/**
 * The summary of imported watch and search history in Settings.
 * The summary fills {watches} and {channels} with the engagement.watches and
 * engagement.channels phrases (“1,234 watches”, “56 channels”), so word those
 * in the case the summary needs. engagement.channel.line is one entry in the
 * top channels list: {channel} is the channel's name from YouTube, left as it
 * is, and {stats} its stats, shown muted inside <m>: “12 watched, 3 videos
 * rewatched, subscribed” (times watched, videos watched more than once, and
 * whether you subscribe to it). The stats are joined by
 * engagement.channel.separator, so word each one to stand on its own in that
 * list.
 */
export default {
  'engagement.heading': 'Votre historique en un coup d’œil',
  'engagement.summary': '{watches} sur {channels}.',
  'engagement.summary.imported': '{watches} sur {channels}, dernière importation le {date}.',
  'engagement.watches': { one: '{count} visionnage', other: '{count} visionnages' },
  'engagement.channels': { one: '{count} chaîne', other: '{count} chaînes' },
  'engagement.topChannels': 'Chaînes les plus regardées',
  'engagement.channel.line': '{channel} <m>({stats})</m>',
  'engagement.channel.watched': { one: '{count} visionnage', other: '{count} visionnages' },
  'engagement.channel.rewatched': { one: '{count} vidéo revue', other: '{count} vidéos revues' },
  'engagement.channel.subscribed': 'abonné',
  'engagement.channel.separator': ', ',
  'engagement.searches': 'Ce que vous recherchez',
  'engagement.searchCount': { one: '{count} recherche', other: '{count} recherches' },
} satisfies Messages;

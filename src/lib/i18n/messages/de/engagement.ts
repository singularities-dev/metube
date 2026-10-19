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
  'engagement.heading': 'Dein Verlauf im Überblick',
  'engagement.summary': '{watches} von {channels}.',
  'engagement.summary.imported': '{watches} von {channels}, zuletzt importiert am {date}.',
  'engagement.watches': { one: '{count} Wiedergabe', other: '{count} Wiedergaben' },
  'engagement.channels': { one: '{count} Kanal', other: '{count} Kanälen' },
  'engagement.topChannels': 'Top-Kanäle',
  'engagement.channel.line': '{channel} <m>({stats})</m>',
  'engagement.channel.watched': { one: '{count} Wiedergabe', other: '{count} Wiedergaben' },
  'engagement.channel.rewatched': { one: '{count} Video erneut angesehen', other: '{count} Videos erneut angesehen' },
  'engagement.channel.subscribed': 'abonniert',
  'engagement.channel.separator': ', ',
  'engagement.searches': 'Wonach du suchst',
  'engagement.searchCount': { one: '{count} Suchanfrage', other: '{count} Suchanfragen' },
} satisfies Messages;

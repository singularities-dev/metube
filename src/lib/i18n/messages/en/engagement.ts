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
  'engagement.heading': 'Your history at a glance',
  'engagement.summary': '{watches} across {channels}.',
  'engagement.summary.imported': '{watches} across {channels}, last imported {date}.',
  'engagement.watches': { one: '{count} watch', other: '{count} watches' },
  'engagement.channels': { one: '{count} channel', other: '{count} channels' },
  'engagement.topChannels': 'Top channels',
  'engagement.channel.line': '{channel} <m>({stats})</m>',
  'engagement.channel.watched': { one: '{count} watched', other: '{count} watched' },
  'engagement.channel.rewatched': { one: '{count} video rewatched', other: '{count} videos rewatched' },
  'engagement.channel.subscribed': 'subscribed',
  'engagement.channel.separator': ', ',
  'engagement.searches': 'What you search for',
  'engagement.searchCount': { one: '{count} search', other: '{count} searches' },
} satisfies Messages;

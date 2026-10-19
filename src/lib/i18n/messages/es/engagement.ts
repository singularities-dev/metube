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
  'engagement.heading': 'Tu historial de un vistazo',
  'engagement.summary': '{watches} en {channels}.',
  'engagement.summary.imported': '{watches} en {channels}, última importación el {date}.',
  'engagement.watches': { one: '{count} reproducción', other: '{count} reproducciones' },
  'engagement.channels': { one: '{count} canal', other: '{count} canales' },
  'engagement.topChannels': 'Canales más vistos',
  'engagement.channel.line': '{channel} <m>({stats})</m>',
  'engagement.channel.watched': { one: '{count} reproducción', other: '{count} reproducciones' },
  'engagement.channel.rewatched': { one: '{count} vídeo repetido', other: '{count} vídeos repetidos' },
  'engagement.channel.subscribed': 'suscrito',
  'engagement.channel.separator': ', ',
  'engagement.searches': 'Lo que buscas',
  'engagement.searchCount': { one: '{count} búsqueda', other: '{count} búsquedas' },
} satisfies Messages;

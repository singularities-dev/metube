import type { Messages } from '../../index.ts';

/**
 * A video tile in the feed: its hover actions, their menus and the details
 * under the thumbnail. {title} and {channel} are YouTube's, left as they are.
 * The action buttons show only an icon with a one-word tooltip ("Watch",
 * "Rate", "Remove": verbs), and the tooltip's word must appear in the button's
 * name ("Watch {title}"). In views and likes, {value} is a compact number such
 * as "1.2M"; the plural form follows the exact count. Screen readers read
 * tile.link.* after the video's title, following a comma (a space for
 * tile.link.newTab): {duration} is a spoken length such as "3 minutes, 45
 * seconds", already formatted for the language. {rating} is a rating
 * button's short name (rating.*.short, such as "Like" or "Dislike"), which
 * may be a verb or an adverb, so put it in a label position ("your rating:
 * {rating}"), not after a verb ("you rated it {rating}"). Quoting it doesn't
 * help: screen readers don't say quotation marks. Screen readers read
 * tile.meta, or tile.meta.subscribed for a channel you subscribe to, in place
 * of the line under the title: {age} is a relative time from the formatter,
 * such as "today", "yesterday", "3 days ago" or "2 months ago", saying when
 * the video was published; the published participle agrees with the implied
 * word for video (fr "publiée", es "publicado"). tile.subscribed is the
 * tooltip on that line's bell icon. In tile.stats, {views} and {likes} are the
 * tile.views and tile.likes texts; the line is visual only (screen readers
 * hear the two as a list), so pick the separator and order that read best.
 */
export default {
  'tile.views': { one: '{value} Aufruf', other: '{value} Aufrufe' },
  'tile.likes': { one: '{value} Like', other: '{value} Likes' },
  'tile.stats': '{views} · {likes}',
  'tile.watch.tooltip': 'Ansehen',
  'tile.watch.label': '{title} ansehen',
  'tile.playHere': 'Hier abspielen',
  'tile.openInNewTab': 'In neuem Tab öffnen',
  'tile.subscribe.label': '{channel} abonnieren',
  'tile.subscribe.tooltipOn': 'Abonniert (auswählen, um das Abo zu beenden)',
  'tile.subscribe.tooltipOff': 'Kanal abonnieren',
  'tile.rate.tooltip': 'Bewerten',
  'tile.rate.label': '{title} bewerten',
  'tile.remove.tooltip': 'Entfernen',
  'tile.remove.label': '{title} aus dem Feed entfernen',
  'tile.subscribed': 'Abonniert',
  'tile.meta': '{channel}, veröffentlicht {age}',
  'tile.meta.subscribed': '{channel} (von dir abonniert), veröffentlicht {age}',
  'tile.link.newTab': '(öffnet YouTube in neuem Tab)',
  'tile.link.duration': '{duration} (öffnet YouTube in neuem Tab)',
  'tile.link.rated': 'von dir mit {rating} bewertet (öffnet YouTube in neuem Tab)',
  'tile.link.durationRated': '{duration}, von dir mit {rating} bewertet (öffnet YouTube in neuem Tab)',
} satisfies Messages;

import type { Messages } from '../../index.ts';

/**
 * The Activity view: watch statistics, subscriptions, ratings, what MeTube has
 * learned and what was removed from the feed. {channel} and {title} are a
 * channel's or video's name, {date} a formatted date. {mood} is a mood name or
 * path, left as it is; it may be an adjective ("Energetic"), an imperative
 * ("Make me laugh") or anything the user typed, so always introduce it with the
 * word for mood and quote it (the “{mood}” mood), or use a label form
 * ("Mood: {mood}"). Explore and Settings are
 * the names of views (app.nav.*). Keys ending in Label or .label are accessible
 * names for buttons and must contain the button's visible text, where it has some.
 */
export default {
  // Link text when a video's title isn't known.
  'activity.openOnYouTube': 'Auf YouTube öffnen',

  'activity.glance.heading': 'Auf einen Blick',
  // Labels of the numbers under that heading.
  'activity.glance.watched': 'Angesehene Videos',
  'activity.glance.searches': 'Suchanfragen',
  'activity.glance.rated': 'In MeTube bewertet',
  'activity.glance.removed': 'Aus dem Feed entfernt',
  'activity.glance.since': 'Der importierte Verlauf reicht bis zum {date} zurück.',

  'activity.months.heading': 'Angesehene Videos pro Monat',
  'activity.months.caption': 'Balkendiagramm der angesehenen Videos pro Monat aus deinem importierten Verlauf.',
  'activity.hours.heading': 'Wann du Videos ansiehst',
  'activity.hours.hint': 'Nach Uhrzeit, in deiner Ortszeit.',
  'activity.hours.caption': 'Balkendiagramm der angesehenen Videos nach Uhrzeit.',
  // Column heading in a chart's table view: the number of videos.
  'activity.chart.valueHeading': 'Videos',

  'activity.channels.heading': 'Kanäle, die du am häufigsten ansiehst',
  'activity.channels.subscribeLabel': '{channel} abonnieren',
  // Tooltips on the bell button.
  'activity.channels.subscribeTitle': 'Abonnieren',
  'activity.channels.subscribedTitle': 'Abonniert (auswählen, um das Abo zu beenden)',

  'activity.subs.heading': 'Deine Abos',
  'activity.subs.count': { one: '{count} Kanal.', other: '{count} Kanäle.' },
  'activity.subs.none': 'Noch keine. Abonniere Kanäle über die Glocke an jedem Video.',
  'activity.subs.pending': {
    one: '{count} Abo-Änderung ist noch nicht auf YouTube. Synchronisiere in den Einstellungen, um sie zu übertragen. Bis dahin gibt es sie nur in MeTube.',
    other: '{count} Abo-Änderungen sind noch nicht auf YouTube. Synchronisiere in den Einstellungen, um sie zu übertragen. Bis dahin gibt es sie nur in MeTube.',
  },
  'activity.subs.boost': 'Abonnierte Kanäle werden in deinem Feed bevorzugt.',
  // Label of the field that filters subscriptions by channel name.
  'activity.subs.find': 'Suchen',
  'activity.subs.findPlaceholder': 'Kanalname',
  // Where a subscription came from, under its channel name.
  'activity.subs.source.metube': 'In MeTube abonniert',
  'activity.subs.source.metubeOn': 'Am {date} in MeTube abonniert',
  'activity.subs.source.youtube': 'Von YouTube',
  'activity.subs.source.takeout': 'Aus deinem Takeout-Export',
  // {source} is one of the activity.subs.source.* messages.
  'activity.subs.notOnYouTube': '{source} · noch nicht auf YouTube',
  'activity.subs.unsubscribe': 'Abo beenden',
  'activity.subs.unsubscribeLabel': 'Abo beenden: {channel}',
  // {query} is what the user typed.
  'activity.subs.noMatch': 'Keine Abos passen zu „{query}“.',
  'activity.subs.unsubPending.heading': 'Abo beendet, auf YouTube noch aktiv',
  'activity.subs.unsubPending.note': 'Wird bei der nächsten Synchronisierung auf YouTube entfernt',
  // Button that cancels a pending unsubscribe.
  'activity.subs.keep': 'Behalten',
  'activity.subs.keepLabel': 'Abo für {channel} behalten',

  // Screen-reader announcements after an action.
  'activity.status.subscribed': '{channel} abonniert',
  'activity.status.unsubscribed': 'Abo für {channel} beendet',

  'activity.ratings.heading': 'Deine Bewertungen',
  // Above the list: how many videos have each rating. {rating} is a rating button's name (rating.*.short), used as a
  // category label, so put it in a label position rather than make it agree with the number. <n> is the number,
  // shown large, and <r> the name; keep both. Screen readers get countSpoken instead.
  'activity.ratings.count': '<r>{rating}</r>: <n>{count}</n>',
  // Only screen readers read countSpoken, and they don't say quotation marks, so put {rating} in a label position
  // (as in tile.link.rated: "your rating: {rating}"), never after a verb, a participle or "como".
  'activity.ratings.countSpoken': { one: '{rating}: {count} Video', other: '{rating}: {count} Videos' },
  // A filter: the group's label, then its two buttons (all ratings, or only those YouTube doesn't have yet).
  'activity.ratings.filter': 'Anzeigen',
  'activity.ratings.filterAll': 'Alle',
  'activity.ratings.filterPending': 'Noch nicht auf YouTube ({count})',
  // Pending videos may want a like, a dislike or a like or dislike removed; each one's link (activity.yt.*) says which.
  'activity.ratings.pendingHint': 'Öffne jedes Video auf YouTube, tu dort, was sein Link angibt, und wähle dann „Erledigt“. Oder richte in den Einstellungen die Synchronisierung ein.',
  'activity.ratings.empty': 'Bewerte Videos unter „Entdecken“ mit dem Herzsymbol an jedem Video. Mit jeder Bewertung lernt dein Feed dazu.',
  // Under each rated video; {mood} is the mood it was rated in.
  'activity.ratings.meta': '{channel}, {date}',
  'activity.ratings.metaMood': '{channel}, {date}, Stimmung: {mood}',
  'activity.ratings.change': 'Bewertung für {title} ändern',
  'activity.ratings.changeNoTitle': 'Bewertung für ein Video von {channel} ändern',
  'activity.ratings.remove': 'Bewertung entfernen',
  // {rating} is a rating's short name (rating.*.short).
  'activity.ratings.rated': '{title} bewertet: {rating}',
  'activity.ratings.ratedNoTitle': 'Video von {channel} bewertet: {rating}',
  'activity.ratings.removed': 'Bewertung für {title} entfernt',
  'activity.ratings.removedNoTitle': 'Bewertung für ein Video von {channel} entfernt',

  // Links that open the video so the user can do this on YouTube themselves.
  'activity.yt.like': 'Auf YouTube mit „Mag ich“ bewerten',
  'activity.yt.dislike': 'Auf YouTube mit „Mag ich nicht“ bewerten',
  // States: YouTube already has the rating.
  'activity.yt.liked': 'Auf YouTube mit „Mag ich“ bewertet',
  'activity.yt.disliked': 'Auf YouTube mit „Mag ich nicht“ bewertet',
  'activity.yt.removeLike': '„Mag ich“ auf YouTube entfernen',
  'activity.yt.removeDislike': '„Mag ich nicht“ auf YouTube entfernen',
  'activity.undo.stillLike': 'Bewertung in MeTube entfernt. YouTube hat noch dein „Mag ich“.',
  'activity.undo.stillDislike': 'Bewertung in MeTube entfernt. YouTube hat noch dein „Mag ich nicht“.',

  // Button: the user has made the change on YouTube by hand.
  'activity.markDone': 'Erledigt',
  'activity.markDone.label': '{title} als erledigt markieren',
  'activity.markDone.labelNoTitle': 'Video von {channel} als erledigt markieren',
  'activity.markDone.status': '{title} als erledigt markiert',
  'activity.markDone.statusNoTitle': 'Video von {channel} als erledigt markiert',

  'activity.learned.heading': 'Was MeTube gelernt hat',
  'activity.learned.hint': 'Aus deinen Bewertungen und entfernten Videos. Das Gelernte prägt deinen Feed zusammen mit den Tags, die du selbst festlegst.',
  // Headings over lists of tags.
  'activity.learned.enjoy': 'Gefällt dir meistens',
  'activity.learned.skip': 'Überspringst du meistens',

  'activity.removed.heading': 'Aus deinem Feed entfernt',
  'activity.removed.channels': 'Ausgeblendete Kanäle',
  // When the channel was hidden.
  'activity.removed.hiddenOn': 'Ausgeblendet am {date}',
  'activity.removed.showAgain': 'Wieder anzeigen',
  'activity.removed.showAgainLabel': 'Wieder anzeigen: {channel}',
  'activity.removed.showingAgain': '{channel} wird wieder angezeigt',
  // Heading: removed videos, after the hidden channels.
  'activity.removed.videos': 'Videos',
  // {reason} is how it was removed (dismiss.*.label).
  'activity.removed.meta': '{reason}, {channel}, {date}',
  'activity.removed.restore': 'Wiederherstellen',
  'activity.removed.restore.label': '{title} wiederherstellen',
  'activity.removed.restore.labelNoTitle': 'Video von {channel} wiederherstellen',
  'activity.removed.restore.status': '{title} wiederhergestellt',
  'activity.removed.restore.statusNoTitle': 'Video von {channel} wiederhergestellt',
} satisfies Messages;

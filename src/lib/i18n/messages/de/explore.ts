import type { Messages } from '../../index.ts';

/**
 * Explore, the main feed: mood shortcuts, the filter toolbar, status lines,
 * empty states and the toasts after rating, removing or subscribing.
 * {mood} is a mood name, {channel} a YouTube channel, {tag} and {query} what
 * the user typed: all left as they are. {mood} may be an adjective
 * ("Energetic"), an imperative ("Make me laugh") or anything the user typed,
 * so never put it bare after a preposition or verb: always introduce it with
 * the word for mood and quote it (the “{mood}” mood), or use a label form
 * ("Mood: {mood}"). {topic} is what the feed searched for:
 * in the "exploring" messages (New to me) one of the user's own tags or
 * searches, left as it is; in the "charting" messages (Uncharted) a translated
 * topic label (uncharted.topic.*), always a bare noun phrase.
 * {rating} is a short rating name (rating.*.short, such as "Love") and
 * {views} a short number such as "10K".
 * Labels quoted in other messages must match their own messages: the buttons
 * "Fresh feed" and "Search YouTube", the channel choices "New to me" and
 * "Everything", the "Settings" page (app.nav.settings) and the filter kinds
 * "only" and "hide" (explore.filter.chip.*). explore.filter.only.label and
 * explore.filter.hide.label are the names screen readers give the Only and
 * Hide buttons, so each must contain that button's visible text.
 */
export default {
  'explore.noKey.title': 'Hinterlege deinen YouTube-API-Schlüssel, um loszulegen',
  'explore.noKey.body': 'Dein Feed entsteht aus deinem eigenen Verlauf, mit deinem eigenen API-Schlüssel. Die Einrichtung dauert eine Minute.',
  'explore.noKey.openSettings': 'Einstellungen öffnen',

  // Name of the group of shortcut buttons, one per recent mood.
  'explore.quickMoods': 'Stimmung wechseln',
  // Each shortcut button's name for screen readers; it must contain the button's text, the mood's name.
  'explore.switchTo': 'Zur Stimmung „{mood}“ wechseln',
  'explore.editMood': 'Stimmung bearbeiten',
  'explore.freshFeed': 'Frischer Feed',
  'explore.freshFeed.hint': 'Lädt alle Kanäle und deine Stimmung neu und schiebt Videos, die dir schon angezeigt wurden, nach hinten.',
  'explore.refresh': 'Feed aktualisieren',
  'explore.refresh.title': 'Aktualisieren (nutzt zwischengespeicherte Ergebnisse, solange sie noch aktuell sind)',

  'explore.filter.region': 'Feed filtern',
  'explore.filter.placeholder': 'Nach Tag oder Wort filtern',
  // Buttons beside the filter box: show only videos with what’s typed, or hide them.
  'explore.filter.only': 'Nur',
  'explore.filter.only.label': 'Nur Videos mit {tag} zeigen',
  'explore.filter.hide': 'Ohne',
  'explore.filter.hide.label': 'Videos ohne {tag} zeigen',
  // Enter and Shift+Enter are keys; “only” and “hide” are explore.filter.chip.*.
  'explore.filter.hint': 'Eingabetaste fügt „nur“ hinzu, Umschalt+Eingabetaste „ohne“.',
  'explore.filter.active': 'Aktive Filter',
  // The kind of an active filter, shown in small text before its tag.
  'explore.filter.chip.only': 'nur',
  'explore.filter.chip.hide': 'ohne',
  // Remove buttons on those filters.
  'explore.filter.removeOnly': 'Filter „nur {tag}“ entfernen',
  'explore.filter.removeHide': 'Filter „ohne {tag}“ entfernen',
  'explore.search': 'Auf YouTube suchen',
  'explore.search.busy': 'Wird gesucht…',
  // Units are YouTube API quota units; 101 and 12 are fixed.
  'explore.search.hint': '„Auf YouTube suchen“ verbraucht bis zu 101 Einheiten. Wiederholte Suchen innerhalb von 12 Stunden sind kostenlos.',
  'explore.searchFor': 'Auf YouTube nach „{query}“ suchen',
  'explore.clearFilters': 'Filter zurücksetzen',

  // Which channels the feed draws from: a group of four buttons named "Channels".
  'explore.scope.group': 'Kanäle',
  'explore.scope.all.label': 'Alles',
  'explore.scope.all.hint': 'Kanäle, die du kennst, und neue.',
  'explore.scope.known.label': 'Bekannte Kanäle',
  'explore.scope.known.hint': 'Nur Kanäle, die du abonniert, positiv bewertet oder schon angesehen hast.',
  'explore.scope.new.label': 'Neu für mich',
  'explore.scope.new.hint': 'Nur Kanäle rund um deine Interessen, die du noch nicht angesehen hast.',
  'explore.scope.uncharted.label': 'Neuland',
  'explore.scope.uncharted.hint': 'Themen und Kanäle außerhalb deines Verlaufs und deines Geschmacks. Deine Stimmungen und die Tags, die du magst, bleiben außen vor. Blockierte Tags und negative Bewertungen gelten weiterhin.',
  // Follows the Uncharted hint when a mood is active.
  'explore.scope.uncharted.moodPaused': 'Die Stimmung „{mood}“ ist pausiert, solange du hier bist.',

  // Menu of when videos were published.
  'explore.time.label': 'Upload-Datum',
  'explore.time.any': 'Beliebige Zeit',
  'explore.time.day': 'Letzte 24 Stunden',
  'explore.time.week': 'Letzte 7 Tage',
  'explore.time.month': 'Letzte 30 Tage',
  'explore.time.year': 'Letzte 12 Monate',
  'explore.time.custom': 'Eigener Zeitraum…',
  'explore.time.customRange': 'Eigener Zeitraum',
  // Start and end dates of the custom range.
  'explore.time.from': 'Von',
  'explore.time.to': 'Bis',

  // Menu of how many views videos have: lesser-seen ones, or popular ("Pop") ones.
  'explore.views.label': 'Aufrufe',
  'explore.views.any': 'Beliebig viele Aufrufe',
  'explore.views.lesser': 'Wenig gesehen (unter {views} Aufrufen)',
  'explore.views.popular': 'Beliebt (über {views} Aufrufe)',

  // YouTube's video categories (category.*); "All" turns the category filter off.
  'explore.category.group': 'Kategorie',
  'explore.category.all': 'Alle',

  'explore.busy.pool': 'Feed wird aktualisiert…',
  'explore.busy.fresh': 'Frischer Feed wird erstellt…',
  'explore.busy.mood': 'Videos für die Stimmung „{mood}“ werden gesucht…',
  'explore.busy.new': 'Neue Kanäle für dich werden gesucht…',
  'explore.busy.uncharted': 'Neuland wird erkundet…',
  'explore.busy.search': 'YouTube wird durchsucht…',

  // Status after the feed loads, followed by common.unitsUsed. "Exploring" is a
  // search around the user's interests (New to me); "charting" one outside them (Uncharted).
  'explore.note.fresh': { one: 'Frischer Feed aus {count} Kanal.', other: 'Frischer Feed aus {count} Kanälen.' },
  'explore.note.fresh.exploring': {
    one: 'Frischer Feed aus {count} Kanal, erkundet „{topic}“.',
    other: 'Frischer Feed aus {count} Kanälen, erkundet „{topic}“.',
  },
  'explore.note.fresh.charting': {
    one: 'Frischer Feed aus {count} Kanal, Neuland: „{topic}“.',
    other: 'Frischer Feed aus {count} Kanälen, Neuland: „{topic}“.',
  },
  'explore.note.mood': 'Feed für die Stimmung „{mood}“.',
  'explore.note.mood.exploring': 'Feed für die Stimmung „{mood}“, erkundet „{topic}“.',
  // The feed was fetched again (units were used) or nothing needed fetching.
  'explore.note.updated': 'Aktualisiert.',
  'explore.note.updated.exploring': 'Aktualisiert, erkundet „{topic}“.',
  'explore.note.updated.charting': 'Aktualisiert, Neuland: „{topic}“.',
  'explore.note.upToDate': 'Auf dem neuesten Stand.',
  'explore.note.upToDate.exploring': 'Auf dem neuesten Stand, erkundet „{topic}“.',
  'explore.note.upToDate.charting': 'Auf dem neuesten Stand, Neuland: „{topic}“.',
  // After Search YouTube, followed by common.unitsUsed or explore.note.fromLibrary.
  'explore.note.searchAdded': 'Ergebnisse für „{query}“ hinzugefügt.',
  'explore.note.fromLibrary': 'Aus deiner Bibliothek, keine Einheiten verbraucht.',
  // Follows the status when filters are on.
  'explore.matches': { one: '{count} passendes Video.', other: '{count} passende Videos.' },

  'explore.empty.title': 'Noch keine Treffer',
  'explore.empty.newNoInterests': '„Neu für mich“ erkundet deine Interessen, kennt aber noch keine. Gib an, welche Tags du magst, bewerte ein paar Videos oder importiere in den Einstellungen deinen Suchverlauf.',
  'explore.empty.new': 'Gerade gibt es keine passenden neuen Kanäle. Probiere „Frischer Feed“, um ein anderes deiner Interessen zu erkunden, oder wechsle zu „Alles“.',
  'explore.empty.uncharted': 'Gerade gibt es kein passendes Neuland. Probiere „Frischer Feed“ für ein anderes Thema oder lockere deine Filter.',
  'explore.empty.filtered': 'Verwende weniger Filter, füge dieser Stimmung Tags hinzu oder suche auf YouTube nach neuen Videos.',
  'explore.empty.noChannels': 'Importiere in den Einstellungen deinen Wiedergabeverlauf, damit dein Feed Kanäle hat, aus denen er schöpfen kann.',

  // Heading of the feed, for screen readers.
  'explore.videos': 'Videos',
  'explore.attribution': 'Videodaten von YouTube. Videos werden auf YouTube abgespielt. <link>Nutzungsbedingungen von YouTube</link>',

  'explore.toast.rated': 'Mit „{rating}“ bewertet.',
  'explore.toast.ratedForMood': 'Mit „{rating}“ bewertet. Die Stimmung „{mood}“ lernt daraus.',
  'explore.toast.ratingRemoved': 'Bewertung entfernt.',
  // A video was removed from the feed for this reason (dismiss.*).
  'explore.toast.removed.not-interested': 'Entfernt: kein Interesse.',
  'explore.toast.removed.already-watched': 'Entfernt: schon gesehen.',
  'explore.toast.channelHidden': '{channel} ausgeblendet.',
  'explore.toast.subscribed': '{channel} abonniert. Neue Videos des Kanals erscheinen bei der nächsten Aktualisierung in deinem Feed.',
  'explore.toast.unsubscribed': 'Abo für {channel} beendet.',
  'explore.toast.unsubscribedSync': 'Abo für {channel} beendet. Synchronisiere, um es auch auf YouTube zu beenden.',
} satisfies Messages;

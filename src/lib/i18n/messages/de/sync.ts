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
  'sync.title': 'Mit YouTube synchronisieren',
  'sync.intro': 'Optional. Überträgt deine MeTube-Bewertungen als „Mag ich“- und „Mag ich nicht“-Bewertungen an YouTube und gleicht deine Abos in beide Richtungen ab – gebündelt, wann du willst.',
  /** {love}, {like}, {dislike}, {hate} are the rating names (rating.*.short). “Activity” is the Tags page tab and must match tags.tab.activity. */
  'sync.intro.ratings': '„{love}“ und „{like}“ werden zu „Mag ich“, „{dislike}“ und „{hate}“ zu „Mag ich nicht“. Ohne Synchronisierung bleiben Bewertungen und Abos in MeTube, und unter „Aktivität“ siehst du die Bewertungen, um sie selbst auf YouTube zu übernehmen.',

  /** {ratings} is sync.pending.ratings (“3 ratings”), {subs} is sync.pending.subs (“2 subscription changes”); the words around them are shown muted. */
  'sync.pending': '{ratings} und {subs} noch nicht auf YouTube',
  /** <n>…</n> is the count, shown large; <m>…</m> is the word after it, shown muted. */
  'sync.pending.ratings': { one: '<n>{count}</n> <m>Bewertung</m>', other: '<n>{count}</n> <m>Bewertungen</m>' },
  'sync.pending.subs': { one: '<n>{count}</n> <m>Abo-Änderung</m>', other: '<n>{count}</n> <m>Abo-Änderungen</m>' },
  'sync.now': 'Jetzt synchronisieren',
  'sync.syncing': 'Wird synchronisiert…',
  'sync.hint.cost': {
    one: 'Öffnet die Google-Anmeldung, liest deine YouTube-Abos (1 Einheit pro 50 Kanäle) und sendet dann bis zu {count} Änderung (je {cost} Einheiten, insgesamt etwa {total}).',
    other: 'Öffnet die Google-Anmeldung, liest deine YouTube-Abos (1 Einheit pro 50 Kanäle) und sendet dann bis zu {count} Änderungen (je {cost} Einheiten, insgesamt etwa {total}).',
  },
  'sync.hint.reserve': 'Dabei bleiben immer {reserve} Einheiten für deinen Feed übrig.',
  'sync.cap.label': 'Max. Änderungen pro Synchronisierung',
  'sync.cap.hint': {
    one: 'Bewertungen und Abo-Änderungen zusammen; höchstens {count} Einheit.',
    other: 'Bewertungen und Abo-Änderungen zusammen; höchstens {count} Einheiten.',
  },

  /** Label before the saved OAuth client ID. */
  'sync.clientId': 'Client-ID',
  'sync.clientId.field': 'OAuth-Client-ID',
  'sync.clientId.placeholder': 'OAuth-Client-ID einfügen',
  'sync.clientId.invalid': 'Das sieht nicht nach einer OAuth-Client-ID aus. Sie endet auf .apps.googleusercontent.com.',
  /** {button} is the “Sync now” button (sync.now). */
  'sync.saved': 'Gespeichert. Wähle „{button}“, um dich anzumelden und deine Bewertungen zu senden.',

  /** The result of a sync: the sentences that apply, in this order, then common.unitsUsed. */
  'sync.result.subsRead': { one: '{count} Abo von YouTube abgerufen.', other: '{count} Abos von YouTube abgerufen.' },
  'sync.result.subsAdded': { one: '{count} Abo ist neu in MeTube.', other: '{count} Abos sind neu in MeTube.' },
  'sync.result.subsRemoved': { one: '{count} Abo besteht auf YouTube nicht mehr.', other: '{count} Abos bestehen auf YouTube nicht mehr.' },
  'sync.result.subscribed': { one: '{count} Kanal abonniert.', other: '{count} Kanäle abonniert.' },
  'sync.result.unsubscribed': { one: 'Abo für {count} Kanal beendet.', other: 'Abos für {count} Kanäle beendet.' },
  'sync.result.subsGone': { one: '{count} Kanal übersprungen, den es nicht mehr gibt.', other: '{count} Kanäle übersprungen, die es nicht mehr gibt.' },
  'sync.result.subsLeft': {
    one: '{count} Abo-Änderung bleibt für das nächste Mal.',
    other: '{count} Abo-Änderungen bleiben für das nächste Mal.',
  },
  'sync.result.ratingsSent': { zero: 'Keine Bewertungen an YouTube gesendet.', one: '{count} Bewertung an YouTube gesendet.', other: '{count} Bewertungen an YouTube gesendet.' },
  'sync.result.ratingsGone': { one: '{count} Video übersprungen, das nicht mehr verfügbar ist.', other: '{count} Videos übersprungen, die nicht mehr verfügbar sind.' },
  'sync.result.ratingsLeft': { one: '{count} Bewertung bleibt für das nächste Mal.', other: '{count} Bewertungen bleiben für das nächste Mal.' },
  /**
   * Why sending stopped early; follows the “… left for next time.” sentence it
   * explains. The limit and the reserve are shared, so when subscriptions stopped
   * at one, the reason may come once, after the ratings sentences, for both.
   */
  'sync.stopped.cap': 'Das Limit pro Synchronisierung wurde erreicht.',
  'sync.stopped.budget': 'Das Senden wurde gestoppt, damit heute noch {reserve} Einheiten für deinen Feed bleiben.',
  'sync.stopped.unknown': 'Versuche es später noch einmal.',

  'sync.howto.title': 'So richtest du die Synchronisierung ein',
  'sync.howto.project': 'Wähle in der <link>Google Cloud Console</link> <em>dasselbe Projekt</em> wie für deinen API-Schlüssel. Der Link öffnet die Console auf Englisch, damit ihre Menüs zu den fett gedruckten Namen unten passen.',
  'sync.howto.consent': 'Gehe zu <b>APIs & Services → OAuth consent screen</b>. Wähle <b>External</b>, gib einen Namen ein, etwa „MeTube (privat)“, und füge deine E-Mail-Adresse hinzu.',
  'sync.howto.scopes': 'Füge unter <b>Scopes</b> den Scope <code>{scope}</code> hinzu. Füge unter <b>Test users</b> dein eigenes Google-Konto hinzu. Lass die App im Status <b>Testing</b>.',
  'sync.howto.client': 'Gehe zu <b>Credentials → Create credentials → OAuth client ID</b> und wähle <b>Web application</b>.',
  'sync.howto.redirect': 'Füge unter <b>Authorized redirect URIs</b> die MeTube-Adresse dieses Browsers hinzu:',
  'sync.howto.copyId': 'Erstelle den Client, kopiere die <b>Client ID</b> (nicht das Client-Secret, das braucht MeTube nicht) und füge sie oben ein.',
  /** {button} is the “Sync now” button (sync.now). “Continue” is the button on Google’s sign-in warning. MeTube asks Google to show its sign-in screens in the language chosen in MeTube, so use Google’s own wording for that button in this language. */
  'sync.howto.continue': 'Wähle <em>{button}</em>. Google warnt, dass die App nicht überprüft wurde. Das ist bei deiner eigenen App normal, wähle also <em>Weiter</em>.',
  'sync.howto.note': 'Du meldest dich bei jeder Synchronisierung an; MeTube behält die Anmeldung nur für diese Synchronisierung und speichert sie nie. Die Weiterleitungsadresse ist in jedem Browser anders. Wenn du MeTube in Firefox und Chrome nutzt, füge also beide hinzu.',
  /** Names the copyable redirect address, for screen readers (“Copy Redirect URL”). */
  'sync.redirectUrl': 'Weiterleitungs-URL',
} satisfies Messages;

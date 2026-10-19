import type { Messages } from '../../index.ts';

/**
 * The About panel at the end of Settings: version, policies, licence and links.
 * {version} is the extension's version, such as 0.1.0. Tags wrap link text:
 * <terms> YouTube's Terms of Service, <privacy> Google's Privacy Policy,
 * <policy> MeTube's privacy policy, <permissions> the Google Account page for
 * third-party access, <link> the licence. Use the documents' official names.
 * MeTube's privacy policy (<policy>) is only in English: say so after the link
 * in other languages.
 */
export default {
  'about.heading': 'Über MeTube',
  'about.terms': 'Version {version} (Beta). MeTube nutzt die YouTube API Services. Mit der Nutzung von MeTube stimmst du den <terms>Nutzungsbedingungen von YouTube</terms> zu; für die Datennutzung durch Google gilt die <privacy>Datenschutzerklärung von Google</privacy>.',
  'about.privacy': 'MeTube speichert alles in diesem Browser und hat keine Server. Lies die <policy>Datenschutzerklärung von MeTube</policy> (auf Englisch). Wenn du die Synchronisierung der Bewertungen genutzt hast, kannst du MeTube den Zugriff jederzeit in den <permissions>Berechtigungen deines Google-Kontos</permissions> entziehen.',
  'about.licence': 'Freie Software unter der <link>GNU GPL v3</link>.',
  'about.source': 'Quellcode',
  'about.issues': 'Problem melden',
} satisfies Messages;

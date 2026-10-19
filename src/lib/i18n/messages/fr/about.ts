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
  'about.heading': 'À propos de MeTube',
  'about.terms': 'Version {version} (bêta). MeTube utilise les Services d’API YouTube. En utilisant MeTube, vous acceptez les <terms>Conditions d’utilisation de YouTube</terms> ; l’utilisation des données par Google est régie par les <privacy>Règles de confidentialité de Google</privacy>.',
  'about.privacy': 'MeTube conserve tout dans ce navigateur et n’a aucun serveur. Lisez la <policy>politique de confidentialité de MeTube</policy> (en anglais). Si vous avez utilisé la synchronisation des notes, vous pouvez supprimer l’accès de MeTube à tout moment dans les <permissions>autorisations de votre compte Google</permissions>.',
  'about.licence': 'Logiciel libre sous licence <link>GNU GPL v3</link>.',
  'about.source': 'Code source',
  'about.issues': 'Signaler un problème',
} satisfies Messages;

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
  'about.heading': 'About MeTube',
  'about.terms': 'Version {version} (beta). MeTube uses YouTube API Services. By using MeTube you agree to the <terms>YouTube Terms of Service</terms>; Google’s use of data is covered by the <privacy>Google Privacy Policy</privacy>.',
  'about.privacy': 'MeTube keeps everything in this browser and has no servers. Read the <policy>MeTube privacy policy</policy>. If you used rating sync, you can remove MeTube’s access at any time in your <permissions>Google Account permissions</permissions>.',
  'about.licence': 'Free software under the <link>GNU GPL v3</link>.',
  'about.source': 'Source code',
  'about.issues': 'Report a problem',
} satisfies Messages;

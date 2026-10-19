import type { Messages } from '../../index.ts';

/**
 * The YouTube API key panel in Settings, with its step-by-step guide.
 * Text in <b>…</b> names Google Cloud Console menus, buttons and options: keep
 * it in English as written. <b> is marked as English, so screen readers say it
 * the way the Console shows it; put nothing translated inside it. <em>…</em> is
 * translated emphasis (bold too): in step 6, {button} is this panel's “Save and
 * test” button. The guide's link opens the Console in English, which step 1
 * tells the user. {units} is a number.
 */
export default {
  'apiKey.heading': 'YouTube API key',
  'apiKey.intro': 'Your own key from Google Cloud, restricted to YouTube Data API v3. Stored only in this browser. By using it you agree to the <link>YouTube Terms of Service</link>.',
  'apiKey.field': 'YouTube Data API key',
  'apiKey.placeholder': 'Paste API key',
  'apiKey.save': 'Save and test',
  'apiKey.testing': 'Testing…',
  'apiKey.works': 'Key works. 1 unit used to test it.',
  'apiKey.howTo.title': 'How to get an API key',
  'apiKey.howTo.step1': 'Open the <link>Google Cloud Console</link> and sign in. Free; no billing needed for the default quota. The link opens the Console in English, so its menus match the names in bold below.',
  'apiKey.howTo.step2': 'Use the project picker at the top to create a <b>New project</b>, e.g. “metube”, and make sure it’s selected.',
  'apiKey.howTo.step3': 'Go to <b>APIs & Services → Library</b>, find <b>YouTube Data API v3</b> and click <b>Enable</b>.',
  'apiKey.howTo.step4': 'Go to <b>APIs & Services → Credentials</b>, then <b>Create credentials → API key</b>.',
  'apiKey.howTo.step5': 'Open the new key. Under <b>API restrictions</b> choose <b>Restrict key</b> and tick only YouTube Data API v3. Leave <b>Application restrictions</b> on <b>None</b>: extensions don’t send a website address, so a website restriction would block MeTube. Save.',
  'apiKey.howTo.step6': 'Copy the key, paste it above and choose <em>{button}</em>.',
  'apiKey.howTo.note': 'Keep the key private. It gives {units} units a day; MeTube’s quota meter tracks them.',
} satisfies Messages;

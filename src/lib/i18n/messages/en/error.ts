import type { Messages } from '../../index.ts';

/**
 * Errors from the YouTube API, the local quota guard and Google sign-in.
 * error.key-restricted names Google Cloud Console options in <b>…</b>
 * (Application restrictions, None, API restrictions): keep them in English, as
 * the API key guide does, so they match the Console's menus. <b> is marked as
 * English for screen readers, so put nothing translated inside it.
 * error.other and error.unknown are complete sentences on their own.
 * error.detail can follow error.other, error.unknown or a sign-in error when
 * YouTube, Google or the browser gave a reason MeTube has no message for:
 * {detail} is that reason as it is, always in English (a message such as
 * “User interaction required.” or “The requested file could not be read…”, or
 * a code such as “server_error”), shown in its own element marked as English.
 * Don't translate it or refer to it in the other messages.
 * error.storageFull is for the browser running out of space to save MeTube's
 * data (a full disk, for example).
 */
export default {
  'error.no-key': 'Add your YouTube Data API key in Settings.',
  'error.invalid-key': 'That API key was rejected. Check it in Settings.',
  'error.key-restricted': 'Google blocked this key for MeTube. In the key’s settings, set <b>Application restrictions</b> to <b>None</b> and, under <b>API restrictions</b>, allow YouTube Data API v3.',
  'error.quota': 'Today’s API quota is used up. It resets at midnight Pacific time.',
  'error.api-disabled': 'Enable “YouTube Data API v3” for this key’s Google Cloud project.',
  'error.network': 'Couldn’t reach YouTube. Check your connection and try again.',
  'error.auth': 'Your YouTube sign-in has expired or was refused. Sign in again to keep syncing.',
  'error.refused': 'YouTube declined for now. Try again later.',
  'error.not-found': 'YouTube couldn’t find that.',
  'error.duplicate': 'YouTube already has that.',
  'error.other': 'YouTube returned an error.',
  'error.localQuota': {
    one: 'Not enough quota left today: this needs {count} unit (left today: {remaining}).',
    other: 'Not enough quota left today: this needs {count} units (left today: {remaining}).',
  },
  'error.unknown': 'Something went wrong. Please try again.',
  'error.storageFull': 'Not enough storage space. Free up some space on your device and try again.',
  'error.signin.declined': 'Sign-in was declined.',
  'error.signin.cancelled': 'Sign-in was cancelled.',
  'error.signin.mismatch': 'The sign-in response didn’t match the request. Please try again.',
  'error.signin.noToken': 'Google didn’t return a sign-in token.',
  'error.signin.provider': 'Google sign-in failed.',
  'error.signin.unreachable': 'Couldn’t open Google sign-in. Check your connection and try again.',
  'error.signin.incognito': 'Google sign-in doesn’t work in private windows. Open MeTube in a normal window to sync.',
  'error.signin.failed': 'Couldn’t complete Google sign-in. Check that the redirect URL below is added to your OAuth client.',
  'error.detail': 'Details: <code>{detail}</code>',
} satisfies Messages;

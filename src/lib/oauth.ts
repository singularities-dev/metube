/**
 * Google sign-in for rating sync, using the browser's identity API.
 *
 * Uses the OAuth implicit flow with the user's own "Web application" client ID:
 * no client secret, no server. The access token lasts about an hour and is kept
 * in memory for the sync that asked for it; it is never stored.
 */

/** Why sign-in failed, so the UI can say it in the user's language. */
export class SignInError extends Error {
  readonly code: 'declined' | 'cancelled' | 'mismatch' | 'noToken' | 'provider' | 'unreachable' | 'incognito' | 'failed';
  /**
   * Google's error code or the browser's own wording, kept only when no code
   * here covers it. It is English whatever MeTube's language, so the UI shows it
   * apart from its translated sentence, never inside it.
   */
  readonly detail?: string;
  constructor(code: SignInError['code'], message: string, detail?: string) {
    super(message);
    this.name = 'SignInError';
    this.code = code;
    this.detail = detail;
  }
}

/** Covers liking videos (videos.rate) and reading or changing your subscriptions (subscriptions.*). */
export const SYNC_SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl';

export interface AccessToken {
  token: string;
  expiresAt: number;
}

/** The redirect URL Google must allow for this browser's copy of the extension. */
export function redirectUrl(): string {
  return browser.identity.getRedirectURL();
}

/**
 * Builds the Google authorisation URL. Pure, so it's easy to test. `hl` is
 * MeTube's UI language (a BCP 47 tag such as "en-GB" or "fr"), so Google's
 * account chooser, consent screen and "unverified app" warning match the
 * translated guide rather than the browser's language.
 */
export function authUrl(clientId: string, redirect: string, state: string, hl: string): string {
  return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: clientId.trim(),
    redirect_uri: redirect,
    response_type: 'token',
    scope: SYNC_SCOPE,
    include_granted_scopes: 'true',
    prompt: 'select_account',
    state,
    hl,
  })}`;
}

/** Reads the token (or error) from the redirect URL's fragment. */
export function parseRedirect(url: string, expectedState: string, now = Date.now()): AccessToken {
  const hash = new URL(url).hash.replace(/^#/, '');
  const p = new URLSearchParams(hash || new URL(url).search);
  const error = p.get('error');
  if (error) {
    throw error === 'access_denied'
      ? new SignInError('declined', 'Sign-in was declined.')
      : new SignInError('provider', `Google sign-in failed: ${error}`, error);
  }
  if (p.get('state') !== expectedState) throw new SignInError('mismatch', 'Sign-in response did not match the request. Please try again.');
  const token = p.get('access_token');
  if (!token) throw new SignInError('noToken', 'Google did not return a sign-in token.');
  const seconds = Number(p.get('expires_in') ?? 3600);
  return { token, expiresAt: now + (Number.isFinite(seconds) ? seconds : 3600) * 1000 };
}

/**
 * Sorts the browser's own sign-in errors into codes the UI words in the user's
 * language. Their text is English whatever the browser's language, so only a
 * message none of these cover is kept, as the detail. Pure, so it's easy to test.
 */
export function signInFailure(msg: string): SignInError {
  // Chrome: "Authorization page could not be loaded." or "… load timed out." (offline, or Google's page failed).
  if (/could not be loaded|timed out|network ?error|offline/i.test(msg)) {
    return new SignInError('unreachable', 'Couldn’t open Google sign-in. Check your connection and try again.');
  }
  if (/incognito|private/i.test(msg)) return new SignInError('incognito', 'Google sign-in doesn’t work in private windows.');
  // Chrome: "Did not redirect to the right URL."; Firefox: "Invalid redirect URL".
  const advice = 'Check that the redirect URL below is added to your OAuth client.';
  if (/redirect/i.test(msg)) return new SignInError('failed', `Couldn’t complete Google sign-in. ${advice}`);
  return new SignInError('failed', `Couldn’t complete Google sign-in (${msg}). ${advice}`, msg);
}

/** Signs in with Google, whose screens are shown in `hl`, MeTube's UI language. */
export async function signIn(clientId: string, hl: string): Promise<AccessToken> {
  const state = crypto.randomUUID();
  let result: string | undefined;
  try {
    result = await browser.identity.launchWebAuthFlow({ url: authUrl(clientId, redirectUrl(), state, hl), interactive: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/closed|cancel|user did not approve/i.test(msg)) throw new SignInError('cancelled', 'Sign-in was cancelled.');
    console.warn('MeTube: Google sign-in failed:', msg);
    throw signInFailure(msg);
  }
  if (!result) throw new SignInError('cancelled', 'Sign-in was cancelled.');
  return parseRedirect(result, state);
}

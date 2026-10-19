/**
 * The UI side of translations: the active language, `t()` for messages, `fmt`
 * for numbers and dates, and <T> for messages with markup such as
 * "Go to <b>Credentials</b>" or "agree to the <link>Terms</link>".
 */
import { cloneElement, createContext, Fragment, isValidElement, useContext, useEffect, useMemo, type ReactElement, type ReactNode } from 'react';
import { CATALOGS, translator, type MessageKey, type Translate } from '@/lib/i18n/catalogs';
import { makeFormat, type Format } from '@/lib/i18n/format';
import { DEFAULT_LOCALE, detectLocale, interpolate, LOCALES, pickForm, type Locale, type Params } from '@/lib/i18n';
import { en } from '@/lib/i18n/messages/en';
import { moodPath, SEED_NAMES, type Mood } from '@/lib/moods';
import { unchartedTopicId } from '@/lib/feed';
import { YouTubeApiError } from '@/lib/api/client';
import { QuotaExceededLocallyError } from '@/lib/quota';
import { SignInError } from '@/lib/oauth';

export interface I18n {
  locale: Locale;
  t: Translate;
  fmt: Format;
}

const make = (locale: Locale): I18n => ({ locale, t: translator(locale), fmt: makeFormat(locale) });
const I18nContext = createContext<I18n>(make(DEFAULT_LOCALE));

/** The language actually in use for a preference ('auto' follows the browser). */
export const resolveLocale = (pref: 'auto' | Locale): Locale => (pref === 'auto' ? detectLocale() : pref);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => make(locale), [locale]);
  // Screen readers and spell-checkers need the page's language (WCAG 3.1.1).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

/**
 * A message with markup. Tags in the message (`<b>…</b>`, `<link>…</link>`, no
 * nesting) are replaced by the matching element in `components`, with the
 * tag's text as its children. Parameters are filled in inside the text only,
 * so a channel name containing "<b>" stays plain text.
 */
export function T({ k, params, components = {} }: { k: MessageKey; params?: Params; components?: Record<string, ReactElement> }) {
  const { locale } = useI18n();
  const message = CATALOGS[locale][k] ?? en[k];
  const count = typeof params?.count === 'number' ? params.count : undefined;
  const raw = message === undefined ? k : pickForm(message, CATALOGS[locale][k] ? locale : 'en-GB', count);
  const parts: ReactNode[] = [];
  const re = /<(\w+)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    if (m.index > last) parts.push(interpolate(raw.slice(last, m.index), locale, params));
    const el = components[m[1]!];
    const inner = interpolate(m[2]!, locale, params);
    parts.push(isValidElement(el) ? cloneElement(el, { key: parts.length }, inner) : inner);
    last = re.lastIndex;
  }
  if (last < raw.length) parts.push(interpolate(raw.slice(last), locale, params));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}

/** A mood's display name: starter moods are translated until the user renames them. */
export function moodName(m: Pick<Mood, 'id' | 'name'>, t: Translate): string {
  const seed = SEED_NAMES[m.id];
  return seed !== undefined && m.name === seed ? t(`moodSeed.${m.id}` as MessageKey) : m.name;
}

/** "Energetic › Motorsport", translated where the names are still the starter ones. */
export function moodLabelT(moods: Mood[], id: string, t: Translate): string {
  return moodPath(moods, id).map((m) => moodName(m, t)).join(' › ');
}

/**
 * An Uncharted topic's label. MeTube picks these topics itself, so they're
 * translated; anything else (such as an older cached query) stays as it is.
 */
export function unchartedTopicName(topic: string, t: Translate): string {
  const id = unchartedTopicId(topic);
  return id ? t(`uncharted.topic.${id}`) : topic;
}

const TRANSLATORS = LOCALES.map((l) => translator(l.id));

/**
 * An Uncharted topic's labels in every language, for matching against the
 * user's own tags and searches (never for display). All languages count,
 * whatever the UI language, since tags and search history mix them.
 */
export function unchartedTopicLabels(topic: string): string[] {
  const id = unchartedTopicId(topic);
  return id ? TRANSLATORS.map((t) => t(`uncharted.topic.${id}`)) : [];
}

/** A message's text without its markup (`<b>APIs</b>` → `APIs`), for places that can only show a string. */
const plainText = (text: string) => text.replace(/<(\w+)>([\s\S]*?)<\/\1>/g, '$2');

/** The browser ran out of space for IndexedDB or storage (a DOMException named QuotaExceededError). */
const isStorageFull = (e: unknown) => typeof e === 'object' && e !== null && (e as { name?: unknown }).name === 'QuotaExceededError';

/**
 * A user-facing message for anything thrown by the API client, the quota guard,
 * sign-in or the browser (IndexedDB, files, storage), as plain text: always a
 * whole translated sentence, never the English wording behind it. Status lines
 * use <ErrorText> instead, which also marks English Console labels and shows
 * that wording apart, marked as English.
 */
export function errorMessage(e: unknown, t: Translate): string {
  if (e instanceof YouTubeApiError) return plainText(t(`error.${e.kind}`));
  if (e instanceof QuotaExceededLocallyError) return t('error.localQuota', { count: e.needed, remaining: e.remaining });
  if (e instanceof SignInError) return t(`error.signin.${e.code}`);
  if (isStorageFull(e)) return t('error.storageFull');
  return t('error.unknown');
}

/**
 * The English wording behind an error that errorMessage can only describe in
 * general: a sign-in error's detail (Google's or the browser's), YouTube's own
 * message for an error MeTube has no message for, or the browser's message for
 * anything else it threw. Chrome and Firefox word those in English whatever
 * the UI language.
 */
function errorDetail(e: unknown): string | undefined {
  if (e instanceof SignInError) return e.detail;
  if (e instanceof YouTubeApiError) return e.kind === 'other' ? e.message.trim() || undefined : undefined;
  if (e instanceof QuotaExceededLocallyError || isStorageFull(e) || e === undefined || e === null) return undefined;
  return (e instanceof Error ? e.message : String(e)).trim() || undefined;
}

/**
 * errorMessage as elements. Google Cloud Console labels (<b> in
 * error.key-restricted) are marked as English, so screen readers say them the
 * way the Console shows them (WCAG 3.1.2). The English wording behind an error
 * (errorDetail) follows the translated sentence on its own, marked as English
 * too, rather than sitting inside it.
 */
export function ErrorText({ error }: { error: unknown }) {
  const { t } = useI18n();
  if (error instanceof YouTubeApiError && error.kind === 'key-restricted') {
    return <T k="error.key-restricted" components={{ b: <strong lang="en" /> }} />;
  }
  const detail = errorDetail(error);
  return (
    <>
      {errorMessage(error, t)}
      {detail && <>{' '}<T k="error.detail" params={{ detail }} components={{ code: <code lang="en" /> }} /></>}
    </>
  );
}

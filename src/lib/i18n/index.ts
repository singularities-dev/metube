/**
 * Translations for MeTube's UI: English (UK), French, German and Spanish,
 * switchable at runtime (the browser's own i18n API follows the browser's
 * language and can't switch without a restart).
 *
 * Catalogues are flat maps of key → message. A message interpolates `{name}`
 * parameters (numbers are formatted for the locale) and can have plural forms,
 * chosen by the `count` parameter with the locale's plural rules.
 */

export type Locale = 'en-GB' | 'fr' | 'de' | 'es';

export interface LocaleInfo {
  id: Locale;
  /** The language's name in itself, as shown in the switcher. */
  nativeName: string;
  flag: 'gb' | 'fr' | 'de' | 'es';
}

export const LOCALES: LocaleInfo[] = [
  { id: 'en-GB', nativeName: 'English (UK)', flag: 'gb' },
  { id: 'fr', nativeName: 'Français', flag: 'fr' },
  { id: 'de', nativeName: 'Deutsch', flag: 'de' },
  { id: 'es', nativeName: 'Español', flag: 'es' },
];

export const DEFAULT_LOCALE: Locale = 'en-GB';

export const isLocale = (x: unknown): x is Locale => LOCALES.some((l) => l.id === x);

/** The best of our languages for the browser's preferred ones; any English is English (UK). */
export function detectLocale(languages: readonly string[] = globalThis.navigator?.languages ?? []): Locale {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    if (base === 'en') return 'en-GB';
    if (base === 'fr' || base === 'de' || base === 'es') return base;
  }
  return DEFAULT_LOCALE;
}

/** Plural forms by CLDR category; `zero` (optional) is used for exactly 0, `other` is required. */
export interface Plural {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}
export type Message = string | Plural;
export type Messages = Record<string, Message>;
export type Params = Record<string, string | number>;

const pluralRules = new Map<Locale, Intl.PluralRules>();
const numberFormats = new Map<Locale, Intl.NumberFormat>();

function plural(locale: Locale): Intl.PluralRules {
  let r = pluralRules.get(locale);
  if (!r) pluralRules.set(locale, (r = new Intl.PluralRules(locale)));
  return r;
}

function numbers(locale: Locale): Intl.NumberFormat {
  let f = numberFormats.get(locale);
  if (!f) numberFormats.set(locale, (f = new Intl.NumberFormat(locale)));
  return f;
}

/** Picks the plural form for `count` (falling back to `other`, since newer CLDR adds categories such as French `many`). */
export function pickForm(message: Message, locale: Locale, count: number | undefined): string {
  if (typeof message === 'string') return message;
  if (count === undefined) return message.other;
  if (count === 0 && message.zero !== undefined) return message.zero;
  return message[plural(locale).select(count) as keyof Plural] ?? message.other;
}

/** Replaces `{name}` with its parameter; numbers are formatted for the locale. Unknown names stay as they are. */
export function interpolate(text: string, locale: Locale, params?: Params): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const v = params[name];
    if (v === undefined) return whole;
    return typeof v === 'number' ? numbers(locale).format(v) : v;
  });
}

export function formatMessage(message: Message | undefined, locale: Locale, params?: Params): string | undefined {
  if (message === undefined) return undefined;
  const count = typeof params?.count === 'number' ? params.count : undefined;
  return interpolate(pickForm(message, locale, count), locale, params);
}

/** `{name}` placeholders in a message (all forms), for checking translations against the English. */
export function placeholders(message: Message): string[] {
  const texts = typeof message === 'string' ? [message] : Object.values(message).filter((x): x is string => typeof x === 'string');
  return [...new Set(texts.flatMap((t) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!)))].sort();
}

/** Rich-text tags such as `<b>…</b>` or `<link>…</link>` in a message, for the same check. */
export function richTags(message: Message): string[] {
  const texts = typeof message === 'string' ? [message] : Object.values(message).filter((x): x is string => typeof x === 'string');
  return [...new Set(texts.flatMap((t) => [...t.matchAll(/<(\w+)>/g)].map((m) => m[1]!)))].sort();
}

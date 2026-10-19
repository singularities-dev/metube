/** All catalogues, and lookup with English as the fallback for anything missing. */
import { formatMessage, type Locale, type Params } from './index.ts';
import { en, type Catalog, type MessageKey } from './messages/en/index.ts';
import { fr } from './messages/fr/index.ts';
import { de } from './messages/de/index.ts';
import { es } from './messages/es/index.ts';

export type { Catalog, MessageKey };

export const CATALOGS: Record<Locale, Catalog> = { 'en-GB': en, fr, de, es };

export type Translate = (key: MessageKey, params?: Params) => string;

/** A translate function for one language. Missing messages fall back to English, then to the key itself. */
export function translator(locale: Locale): Translate {
  const catalog = CATALOGS[locale];
  return (key, params) =>
    formatMessage(catalog[key], locale, params) ?? formatMessage(en[key], 'en-GB', params) ?? key;
}

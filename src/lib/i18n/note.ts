/**
 * Messages for the note on YouTube watch pages. The content script runs on
 * every YouTube page, so it loads only these two small namespaces per
 * language rather than the whole app's catalogue.
 */
import { detectLocale, formatMessage, isLocale, type Locale, type Messages, type Params } from './index.ts';
import enNote from './messages/en/note.ts';
import enRating from './messages/en/rating.ts';
import frNote from './messages/fr/note.ts';
import frRating from './messages/fr/rating.ts';
import deNote from './messages/de/note.ts';
import deRating from './messages/de/rating.ts';
import esNote from './messages/es/note.ts';
import esRating from './messages/es/rating.ts';

const english = { ...enNote, ...enRating };
export type NoteKey = keyof typeof english;

const NOTE: Record<Locale, Messages> = {
  'en-GB': english,
  fr: { ...frNote, ...frRating },
  de: { ...deNote, ...deRating },
  es: { ...esNote, ...esRating },
};

/** The UI language from the stored preferences (the content script can't use the app's React context). */
export function noteLocale(prefs: unknown): Locale {
  const language = (prefs as { language?: unknown } | undefined)?.language;
  return isLocale(language) ? language : detectLocale();
}

export function noteTranslator(locale: Locale): (key: NoteKey, params?: Params) => string {
  return (key, params) => formatMessage(NOTE[locale][key], locale, params) ?? formatMessage(english[key], 'en-GB', params) ?? key;
}

import { describe, expect, test } from 'vitest';
import { detectLocale, formatMessage, LOCALES, placeholders, richTags, type Message } from './index.ts';
import { makeFormat } from './format.ts';
import { CATALOGS, translator } from './catalogs.ts';
import { en, namespaces } from './messages/en/index.ts';
import { normalisePrefs } from '../prefs.ts';
import { UNCHARTED_TOPICS, unchartedTopicId } from '../feed.ts';

describe('messages', () => {
  test('the browser’s languages pick ours; any English is English (UK)', () => {
    expect(detectLocale(['en-US', 'fr'])).toBe('en-GB');
    expect(detectLocale(['fr-CA'])).toBe('fr');
    expect(detectLocale(['pt-BR', 'de-AT'])).toBe('de');
    expect(detectLocale(['es-419'])).toBe('es');
    expect(detectLocale(['ja'])).toBe('en-GB');
    expect(detectLocale([])).toBe('en-GB');
  });

  test('plural forms follow each language’s rules, with zero and other as fallbacks', () => {
    const m: Message = { zero: 'none', one: '{count} video', other: '{count} videos' };
    expect(formatMessage(m, 'en-GB', { count: 0 })).toBe('none');
    expect(formatMessage({ one: '{count} vidéo', other: '{count} vidéos' }, 'fr', { count: 0 })).toBe('0 vidéo');
    expect(formatMessage({ one: '{count} video', other: '{count} videos' }, 'en-GB', { count: 1 })).toBe('1 video');
    // French has a "many" category for big round numbers; without that form, "other" is used.
    expect(formatMessage({ one: '{count} vidéo', other: '{count} vidéos' }, 'fr', { count: 1_000_000 })).toBe('1\u202f000\u202f000 vidéos');
  });

  test('numbers are formatted for the language; unknown placeholders are left alone', () => {
    expect(formatMessage('{n} left, {x}', 'de', { n: 12345 })).toBe('12.345 left, {x}');
    expect(formatMessage('{n}', 'en-GB', { n: 12345 })).toBe('12,345');
  });

  test('translate falls back to English, then to the key', () => {
    const t = translator('fr');
    expect(t('common.undo')).toBe(CATALOGS.fr['common.undo'] ?? 'Undo');
    expect(translator('en-GB')('app.quota.left', { count: 1 })).toBe('1 unit left');
  });

  test('placeholders and rich-text tags are found in every form', () => {
    expect(placeholders({ one: '{count} in {mood}', other: '{count} in {mood}s' })).toEqual(['count', 'mood']);
    expect(richTags('Go to <b>Credentials</b> and the <link>console</link>')).toEqual(['b', 'link']);
  });
});

describe('formatting', () => {
  test('dates, months, weekdays, relative times and lists', () => {
    const en = makeFormat('en-GB');
    expect(en.weekday(0)).toBe('Sun');
    expect(en.monthYear(2026, 9)).toBe('Oct 2026');
    expect(en.list(['a', 'b', 'c'])).toBe('a, b and c');
    const de = makeFormat('de');
    expect(de.weekday(1)).toBe('Mo');
    expect(de.number(1234.5)).toBe('1.234,5');
    expect(makeFormat('fr').capitalise('éte')).toBe('Éte');
    // Compact millions take CLDR's "many" form where a language has one.
    const fr = makeFormat('fr');
    const views = { one: '{value} vue', many: '{value} de vues', other: '{value} vues' };
    expect(formatMessage(views, 'fr', { count: fr.compactPluralCount(1_234_567), value: fr.compact(1_234_567) })).toBe('1,2\u00a0M de vues');
    expect(formatMessage(views, 'fr', { count: fr.compactPluralCount(4_200), value: fr.compact(4_200) })).toBe('4,2\u00a0k vues');
    // Just under a million rounds up to "1 M", so it takes the million's form too.
    expect(formatMessage(views, 'fr', { count: fr.compactPluralCount(999_960), value: fr.compact(999_960) })).toBe('1\u00a0M de vues');
    const es = makeFormat('es');
    const esViews = { one: '{value} visualización', many: '{value} de visualizaciones', other: '{value} visualizaciones' };
    expect(formatMessage(esViews, 'es', { count: es.compactPluralCount(999_960), value: es.compact(999_960) })).toBe('1\u00a0M de visualizaciones');
    // German doesn't abbreviate thousands, so the count stays as it is.
    expect(de.compactPluralCount(999_960)).toBe(999_960);
    expect(formatMessage({ one: '{value} view', other: '{value} views' }, 'en-GB', { count: en.compactPluralCount(2_000_000), value: en.compact(2_000_000) })).toBe('2m views');
  });

  test('durations are spoken in words, without zero parts', () => {
    const en = makeFormat('en-GB');
    expect(en.duration(225)).toBe('3 minutes, 45 seconds');
    expect(en.duration(3723)).toBe('1 hour, 2 minutes, 3 seconds');
    expect(en.duration(3600)).toBe('1 hour');
    expect(en.duration(42)).toBe('42 seconds');
    expect(en.duration(0)).toBe('0 seconds');
    expect(makeFormat('de').duration(3723)).toBe('1 Stunde, 2 Minuten und 3 Sekunden');
    expect(makeFormat('es').duration(225)).toBe('3 minutos y 45 segundos');
  });
});

describe('relative times', () => {
  // Local times, so the calendar-day checks hold in any time zone.
  const at = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m, d, h, min).getTime();
  const en = makeFormat('en-GB');

  test('days count calendar dates: today, yesterday, then n days ago', () => {
    expect(en.ago(at(2026, 9, 19, 0), at(2026, 9, 19, 12))).toBe('today');
    expect(en.ago(at(2026, 9, 18, 23, 30), at(2026, 9, 19, 0, 30))).toBe('yesterday');
    expect(en.ago(at(2026, 9, 17, 0, 10), at(2026, 9, 18, 23, 50))).toBe('yesterday');
    expect(en.ago(at(2026, 9, 16, 23), at(2026, 9, 19, 1))).toBe('3 days ago');
    expect(makeFormat('de').ago(at(2026, 9, 17, 9), at(2026, 9, 19, 8))).toBe('vorgestern');
    // A video published a moment from now (clock skew) is still today.
    expect(en.ago(at(2026, 9, 19, 13), at(2026, 9, 19, 12))).toBe('today');
  });

  test('months and years are elapsed time, never "last month" or "last year"', () => {
    expect(en.ago(at(2026, 7, 22), at(2026, 9, 19))).toBe('1 month ago');
    expect(en.ago(at(2024, 10, 20), at(2026, 9, 19))).toBe('1 year ago');
    expect(en.ago(at(2025, 9, 1), at(2026, 9, 19))).toBe('1 year ago');
    // ICU versions differ on plain or no-break spaces here.
    expect(makeFormat('fr').ago(at(2026, 7, 22), at(2026, 9, 19)).replace(/\s/g, ' ')).toBe('il y a 1 mois');
    expect(makeFormat('es').ago(at(2024, 10, 20), at(2026, 9, 19))).toBe('hace 1 año');
  });
});

describe('catalogues', () => {
  test('every English key sits in its namespace file', () => {
    for (const [ns, messages] of Object.entries(namespaces)) {
      for (const key of Object.keys(messages)) expect(key.startsWith(`${ns}.`), `${key} in ${ns}.ts`).toBe(true);
    }
  });

  test('English plural messages always have one and other', () => {
    for (const [key, m] of Object.entries(en)) {
      if (typeof m === 'object') expect(m.one !== undefined && m.other !== undefined, key).toBe(true);
    }
  });

  for (const { id } of LOCALES.filter((l) => l.id !== 'en-GB')) {
    test(`${id}: same keys, placeholders, tags and plural shape as English`, () => {
      const catalog = CATALOGS[id] as Record<string, Message>;
      expect(Object.keys(catalog).sort()).toEqual(Object.keys(en).sort());
      const categories = new Intl.PluralRules(id).resolvedOptions().pluralCategories;
      for (const [key, source] of Object.entries(en) as [string, Message][]) {
        const m = catalog[key]!;
        expect(placeholders(m), `${id} ${key} placeholders`).toEqual(placeholders(source));
        expect(richTags(m), `${id} ${key} tags`).toEqual(richTags(source));
        expect(typeof m, `${id} ${key} plural shape`).toBe(typeof source);
        if (typeof m === 'object') {
          // "many" may fall back to "other"; every other category the language uses needs a form.
          for (const c of categories) if (c !== 'many') expect(m[c as keyof typeof m], `${id} ${key} ${c}`).toBeDefined();
        }
        expect(typeof m === 'string' ? m.trim() : m.other.trim(), `${id} ${key} empty`).not.toBe('');
      }
    });
  }
});

test('every Uncharted topic has a label in every language; other queries have none', () => {
  for (const topic of UNCHARTED_TOPICS) {
    const id = unchartedTopicId(topic);
    expect(id, topic).toBeDefined();
    for (const { id: locale } of LOCALES) {
      const label = (CATALOGS[locale] as Record<string, Message>)[`uncharted.topic.${id}`];
      expect(typeof label === 'string' && label.trim() !== '', `${locale} ${topic}`).toBe(true);
    }
  }
  expect(unchartedTopicId('lofi beats')).toBeUndefined();
});

test('the language preference accepts our languages and auto only', () => {
  expect(normalisePrefs({ language: 'de' }).language).toBe('de');
  expect(normalisePrefs({ language: 'it' }).language).toBe('auto');
  expect(normalisePrefs({}).language).toBe('auto');
});

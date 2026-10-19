/**
 * The starter moods' tags in each UI language other than English. English uses
 * the tags MeTube ships with (moods.ts); seedTags there picks a language's list
 * while the user hasn't edited that list. Like moodSeed.* for the names, but
 * these are lists of search terms rather than messages, so they sit outside the
 * catalogues, one file per language (messages/<language>/moodSeedTags.ts).
 */
import type { Locale } from './index.ts';
import fr from './messages/fr/moodSeedTags.ts';
import de from './messages/de/moodSeedTags.ts';
import es from './messages/es/moodSeedTags.ts';

/** One starter mood's lists: "More of" (include) and "Never show" (exclude, only where the English has one). */
export interface SeedTagList {
  include: string[];
  exclude?: string[];
}

/** Every starter mood's lists, by mood ID. */
export type SeedTagLists = Record<string, SeedTagList>;

export const LOCALISED_SEED_TAGS: Partial<Record<Locale, SeedTagLists>> = { fr, de, es };

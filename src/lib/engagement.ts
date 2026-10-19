/**
 * Turns imported history into engagement signals for the preference model.
 *
 * Signals are recency-weighted with an exponential half-life, so a channel you
 * binged three years ago counts less than one you watch now. These are implicit
 * signals only; explicit ratings (love…hate) will outweigh them.
 */
import type { SearchEvent, Subscription, WatchEvent } from './takeout/types.ts';

export const DEFAULT_HALF_LIFE_DAYS = 180;
/** Subscribing is a deliberate choice but passive; active watching should outrank it. */
export const SUBSCRIPTION_BONUS = 3;
export const REWATCH_BONUS = 2;
const DAY = 86_400_000;

export interface ChannelEngagement {
  channelId: string;
  channelTitle: string;
  watches: number;
  uniqueVideos: number;
  /** Videos watched more than once: a strong positive signal. */
  rewatchedVideos: number;
  firstWatched: number;
  lastWatched: number;
  subscribed: boolean;
  /** Recency-weighted watches, plus bonuses for rewatches and subscriptions. */
  score: number;
}

export interface SearchTerm {
  term: string;
  count: number;
  lastSearched: number;
  score: number;
}

export function recencyWeight(time: number, now: number, halfLifeDays = DEFAULT_HALF_LIFE_DAYS): number {
  const ageDays = Math.max(0, (now - time) / DAY);
  return Math.pow(0.5, ageDays / halfLifeDays);
}

export function channelEngagement(
  watches: WatchEvent[],
  subscriptions: Subscription[],
  now: number = Date.now(),
  halfLifeDays = DEFAULT_HALF_LIFE_DAYS,
): ChannelEngagement[] {
  const subs = new Map(subscriptions.map((s) => [s.channelId, s.channelTitle]));
  const byChannel = new Map<string, { title: string; times: number[]; videos: Map<string, number> }>();

  for (const w of watches) {
    if (!w.channelId || w.isAd) continue;
    let c = byChannel.get(w.channelId);
    if (!c) byChannel.set(w.channelId, (c = { title: w.channelTitle ?? w.channelId, times: [], videos: new Map() }));
    c.times.push(w.time);
    c.videos.set(w.videoId, (c.videos.get(w.videoId) ?? 0) + 1);
  }

  const result: ChannelEngagement[] = [];
  for (const [channelId, c] of byChannel) {
    const rewatched = [...c.videos.values()].filter((n) => n > 1).length;
    const weighted = c.times.reduce((sum, t) => sum + recencyWeight(t, now, halfLifeDays), 0);
    const subscribed = subs.has(channelId);
    result.push({
      channelId,
      channelTitle: c.title,
      watches: c.times.length,
      uniqueVideos: c.videos.size,
      rewatchedVideos: rewatched,
      firstWatched: c.times.reduce((a, b) => Math.min(a, b)),
      lastWatched: c.times.reduce((a, b) => Math.max(a, b)),
      subscribed,
      score: weighted + rewatched * REWATCH_BONUS + (subscribed ? SUBSCRIPTION_BONUS : 0),
    });
  }
  // Subscribed channels with no watches still count: the user chose them.
  for (const [channelId, title] of subs) {
    if (!byChannel.has(channelId)) {
      result.push({
        channelId, channelTitle: title, watches: 0, uniqueVideos: 0, rewatchedVideos: 0,
        firstWatched: 0, lastWatched: 0, subscribed: true, score: SUBSCRIPTION_BONUS,
      });
    }
  }
  return result.sort((a, b) => b.score - a.score);
}

/**
 * Function words that recur across searches without saying what they're about.
 * All languages apply whatever the UI language, since search history mixes
 * them. Some are English words too ("die", "comment"): only their single-word
 * suggestion goes; whole phrases keep them.
 */
const STOPWORDS = new Set([
  // English (plus a few Romance articles)
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'how', 'what', 'is', 'vs', 'de', 'la', 'le', 'el', 'da',
  // French
  'les', 'des', 'du', 'au', 'aux', 'et', 'ou', 'un', 'une', 'pour', 'avec', 'sur', 'dans', 'par', 'en', 'est', 'comment', 'qui', 'que', 'quoi', 'ce', 'ces',
  // German
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'und', 'oder', 'mit', 'für', 'von', 'zu', 'im', 'auf', 'bei', 'wie', 'was', 'ist', 'mein',
  // Spanish (queries are only lower-cased, so accented and plain spellings both)
  'los', 'las', 'del', 'al', 'un', 'una', 'en', 'con', 'para', 'por', 'es', 'como', 'cómo', 'que', 'qué', 'mi',
]);

/** A function word in any of our languages ("the", "des", "und", "del"), which says nothing about a topic. */
export const isStopword = (w: string) => STOPWORDS.has(w);

/** French elisions ("l'eau", "d’un"), split off so they don't make words of their own. */
const ELISION = /\b(?:[cdjlmnst]|qu)['’]/g;

/** Search queries both as whole phrases and as single words (single words help tag matching). */
export function searchTerms(
  searches: SearchEvent[],
  now: number = Date.now(),
  halfLifeDays = DEFAULT_HALF_LIFE_DAYS,
): SearchTerm[] {
  const terms = new Map<string, SearchTerm>();
  const add = (term: string, time: number) => {
    const t = terms.get(term) ?? { term, count: 0, lastSearched: 0, score: 0 };
    t.count++;
    t.lastSearched = Math.max(t.lastSearched, time);
    t.score += recencyWeight(time, now, halfLifeDays);
    terms.set(term, t);
  };
  for (const s of searches) {
    const phrase = s.query.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!phrase) continue;
    const words = phrase.replace(ELISION, ' ').split(' ').filter((w) => w.length > 1 && !STOPWORDS.has(w));
    if (words.length > 1) add(phrase, s.time);
    for (const w of new Set(words)) add(w, s.time);
  }
  return [...terms.values()].sort((a, b) => b.score - a.score);
}

/**
 * Search terms worth suggesting: whole phrases, plus single words only when they
 * recur across searches ("world" from one "world cup highlights" search is noise).
 */
export function suggestableTerms(terms: SearchTerm[]): SearchTerm[] {
  return terms.filter((t) => t.term.includes(' ') || t.count > 1);
}

/**
 * The preference model: what explicit feedback teaches us.
 *
 * Every rating or dismissal adds a signed weight to the video's channel, its
 * tags and its category. A mood active at the time also learns the tags, so
 * "Gaming music" gradually discovers what gaming music means to this user.
 * Recomputed from the feedback records on load, so it can never drift from
 * what the user actually said, and undo or deletion is exact.
 */
import type { Feedback } from './feedback.ts';

const DAY = 86_400_000;
/** Feedback fades slowly: a year-old rating counts half. */
export const FEEDBACK_HALF_LIFE_DAYS = 365;

/** Taste signal per dismissal type. "Already watched" says nothing about taste. */
const DISMISSAL_WEIGHT = { 'not-interested': -1, 'already-watched': 0, 'hide-channel': -2 } as const;

export interface PreferenceModel {
  channels: Map<string, number>;
  tags: Map<string, number>;
  categories: Map<string, number>;
  /** moodId → tag → weight. */
  moodTags: Map<string, Map<string, number>>;
  /** moodId → channelId → weight: channels you rate well while that mood is on. */
  moodChannels: Map<string, Map<string, number>>;
  /** channelId → title, for display. */
  channelTitles: Map<string, string>;
  hiddenChannels: Set<string>;
  /** Videos never to show again (dismissed or rated negatively). */
  hiddenVideos: Set<string>;
  ratings: Map<string, number>;
}

function add(map: Map<string, number>, key: string, v: number) {
  map.set(key, (map.get(key) ?? 0) + v);
}

export function feedbackWeight(f: Feedback): number {
  if (f.dismissed) return DISMISSAL_WEIGHT[f.dismissed];
  return f.rating ?? 0;
}

export function buildModel(feedback: Feedback[], now = Date.now()): PreferenceModel {
  const m: PreferenceModel = {
    channels: new Map(), tags: new Map(), categories: new Map(), moodTags: new Map(), moodChannels: new Map(), channelTitles: new Map(),
    hiddenChannels: new Set(), hiddenVideos: new Set(), ratings: new Map(),
  };
  for (const f of feedback) {
    m.channelTitles.set(f.channelId, f.channelTitle);
    if (f.rating !== null && !f.dismissed) m.ratings.set(f.videoId, f.rating);
    if (f.dismissed === 'hide-channel') m.hiddenChannels.add(f.channelId);
    if (f.dismissed || (f.rating !== null && f.rating < 0)) m.hiddenVideos.add(f.videoId);

    const w = feedbackWeight(f) * Math.pow(0.5, Math.max(0, now - f.at) / DAY / FEEDBACK_HALF_LIFE_DAYS);
    if (!w) continue;
    add(m.channels, f.channelId, w);
    add(m.categories, f.categoryId, w * 0.3);
    // Spread a judgement across a video's tags so heavily tagged videos don't dominate.
    const per = f.tags.length ? w / Math.sqrt(f.tags.length) : 0;
    for (const t of f.tags) add(m.tags, t, per);
    if (f.moodId) {
      let mt = m.moodTags.get(f.moodId);
      if (!mt) m.moodTags.set(f.moodId, (mt = new Map()));
      for (const t of f.tags) add(mt, t, per);
      let mc = m.moodChannels.get(f.moodId);
      if (!mc) m.moodChannels.set(f.moodId, (mc = new Map()));
      add(mc, f.channelId, w);
    }
  }
  return m;
}

/** Bounded multiplier from a raw affinity, so one signal can't run away. */
export function affinityFactor(raw: number, strength = 0.35, min = 0.25, max = 2.5): number {
  return Math.min(max, Math.max(min, Math.exp(raw * strength)));
}

/** Strongest learned tags, positive and negative, for display. */
export function topTags(map: Map<string, number>, n = 20): { liked: [string, number][]; disliked: [string, number][] } {
  const all = [...map].filter(([, v]) => Math.abs(v) > 0.05);
  return {
    liked: all.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, n),
    disliked: all.filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1]).slice(0, n),
  };
}

/** Tags a mood has learned, merged across its branch (ancestors count half). */
export function learnedMoodTags(model: PreferenceModel, moodPathIds: string[]): Map<string, number> {
  const out = new Map<string, number>();
  moodPathIds.forEach((id, i) => {
    const weight = i === moodPathIds.length - 1 ? 1 : 0.5;
    for (const [t, v] of model.moodTags.get(id) ?? []) add(out, t, v * weight);
  });
  return out;
}

/** Tags this mood has learned you like, which aren't yet part of its definition. */
export function moodSuggestions(model: PreferenceModel, moodPathIds: string[], existing: string[], n = 8): string[] {
  const have = new Set(existing);
  return [...learnedMoodTags(model, moodPathIds)]
    .filter(([t, v]) => v > 0.3 && !have.has(t))
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t]) => t);
}

/**
 * Channels a mood has learned you like (net positive), strongest first, across
 * its branch (ancestors count half). These get pulled into the mood's feed.
 */
export function moodChannels(model: PreferenceModel, moodPathIds: string[], minWeight = 0.9): Map<string, number> {
  const out = new Map<string, number>();
  moodPathIds.forEach((id, i) => {
    const weight = i === moodPathIds.length - 1 ? 1 : 0.5;
    for (const [c, v] of model.moodChannels.get(id) ?? []) add(out, c, v * weight);
  });
  return new Map([...out].filter(([, v]) => v >= minWeight).sort((a, b) => b[1] - a[1]));
}

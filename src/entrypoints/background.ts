import { openMeTubeDB } from '@/lib/db';
import { desiredYtRating, isPending, markSynced } from '@/lib/sync';
import { RATINGS, getFeedback, rateVideo, type Rating } from '@/lib/feedback';
import { store } from '@/lib/services';
import { loadImpressions } from '@/lib/impressions';
import { loadMoods } from '@/lib/moods';

/** How long after opening a video from MeTube the YouTube page offers to rate it. */
const RATE_OFFER_MS = 24 * 60 * 60 * 1000;

/** Messages from the watch-page note (content scripts can't open MeTube's database). */
export type WatchMessage =
  | { type: 'yt-status'; videoId: string }
  | { type: 'yt-mark-done'; videoId: string }
  | { type: 'yt-rate'; videoId: string; rating: Rating };

export type WatchNote = WatchStatus | RateOffer;

/** Reply to yt-rate: whether the rating was saved, and the note to show next. */
export type RateReply = { rated: false } | { rated: true; note: WatchNote | null };

/** Opened from MeTube but not rated yet: offer MeTube's ratings on the page (the note words them). */
export interface RateOffer {
  offer: 'rate';
  ratings: Rating[];
}

export interface WatchStatus {
  offer?: undefined;
  /** What YouTube should show, and what MeTube rated. */
  want: 'like' | 'dislike' | 'none';
  rating: Rating | null;
  /** YouTube still has a like/dislike that MeTube no longer wants: the rating was removed or changed to Neutral. */
  undo: 'like' | 'dislike' | null;
}

async function status(videoId: string): Promise<WatchNote | null> {
  const db = await openMeTubeDB();
  const f = await db.get('feedback', videoId);
  if (!f || (f.rating === null && !f.ytSynced && !f.dismissed)) {
    const opened = (await loadImpressions(store)).opened[videoId];
    if (opened && Date.now() - opened < RATE_OFFER_MS && (await db.get('videos', videoId))) {
      return { offer: 'rate', ratings: RATINGS.map((r) => r.value) };
    }
    return null;
  }
  if (f.dismissed || !isPending(f)) return null;
  const want = desiredYtRating(f);
  return {
    want,
    rating: f.rating,
    undo: want === 'none' && (f.ytSynced === 'like' || f.ytSynced === 'dislike') ? f.ytSynced : null,
  };
}

/** Rates from the YouTube page, then returns the follow-up note (usually "like it on YouTube"). */
async function rate(videoId: string, rating: Rating): Promise<RateReply> {
  const db = await openMeTubeDB();
  const v = await db.get('videos', videoId);
  // The video's details left the cache since the offer was shown: nothing to rate against.
  if (!v) return { rated: false };
  const prev = await getFeedback(db, videoId);
  await rateVideo(db, v, rating, prev?.moodId ?? (await loadMoods(store)).activeId);
  return { rated: true, note: await status(videoId) };
}

export default defineBackground(() => {
  // Open the curator page when the extension is installed.
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') void browser.tabs.create({ url: browser.runtime.getURL('/curator.html') });
  });

  // sendResponse + `return true` works in both Chrome and Firefox for async replies.
  browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse: (r: unknown) => void) => {
    const m = message as WatchMessage;
    if (m?.type === 'yt-status') {
      status(m.videoId).then(sendResponse, () => sendResponse(null));
      return true;
    }
    if (m?.type === 'yt-mark-done') {
      openMeTubeDB().then((db) => markSynced(db, m.videoId)).then(() => sendResponse(true), () => sendResponse(false));
      return true;
    }
    if (m?.type === 'yt-rate') {
      rate(m.videoId, m.rating).then(sendResponse, () => sendResponse({ rated: false }));
      return true;
    }
    return false;
  });
});

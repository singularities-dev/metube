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

const CURATOR = '/curator.html';

/**
 * An open MeTube tab, if there is one. Finding it this way needs no "tabs"
 * permission: Chrome lists its own pages' contexts, and Firefox's background
 * page can reach its own open pages.
 */
async function findCuratorTab(): Promise<{ id: number; windowId: number } | undefined> {
  const url = browser.runtime.getURL(CURATOR);
  const runtime = browser.runtime as typeof browser.runtime & {
    getContexts?: (filter: { contextTypes: string[]; documentUrls: string[] }) => Promise<{ tabId: number; windowId: number }[]>;
  };
  if (runtime.getContexts) {
    const [ctx] = await runtime.getContexts({ contextTypes: ['TAB'], documentUrls: [url, `${url}#explore`, `${url}#tags`, `${url}#settings`] });
    return ctx && ctx.tabId >= 0 ? { id: ctx.tabId, windowId: ctx.windowId } : undefined;
  }
  for (const view of browser.extension?.getViews?.({ type: 'tab' }) ?? []) {
    const page = view as unknown as { location: Location; browser: typeof browser };
    if (page.location.pathname !== CURATOR) continue;
    const tab = await page.browser.tabs.getCurrent();
    if (tab?.id !== undefined) return { id: tab.id, windowId: tab.windowId ?? -1 };
  }
  return undefined;
}

/** Switches to MeTube's tab, or opens one. */
async function openCurator() {
  const tab = await findCuratorTab().catch(() => undefined);
  if (!tab) {
    await browser.tabs.create({ url: browser.runtime.getURL(CURATOR) });
    return;
  }
  await browser.tabs.update(tab.id, { active: true });
  if (tab.windowId >= 0) await browser.windows.update(tab.windowId, { focused: true });
}

export default defineBackground(() => {
  // Open MeTube when the extension is installed, and from its toolbar button.
  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') void openCurator();
  });
  (browser.action ?? browser.browserAction).onClicked.addListener(() => void openCurator());

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

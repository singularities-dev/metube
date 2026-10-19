/**
 * A small note on YouTube watch pages, in two cases:
 * - Opened from MeTube in the last day and not rated yet: offers MeTube's five ratings.
 * - Rated in MeTube but not on YouTube yet: "You loved this in MeTube. Give it a like."
 *   You click YouTube's own like button; MeTube never clicks or reads YouTube's
 *   page for you. "Done" marks it.
 *
 * Runs on all of youtube.com because YouTube navigates between pages without
 * reloading; it reacts to YouTube's navigation event and to history changes.
 */
import type { RateOffer, RateReply, WatchNote, WatchStatus } from './background';
import type { Rating } from '@/lib/feedback';
import { noteLocale, noteTranslator, type NoteKey } from '@/lib/i18n/note';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

/** The note follows MeTube's language setting, read when each note is shown. */
let locale: Locale = DEFAULT_LOCALE;
let t = noteTranslator(locale);
async function loadLanguage() {
  try {
    locale = noteLocale((await browser.storage.local.get('prefs'))?.prefs);
  } catch {
    // Storage unavailable (extension reloaded): keep the last language.
  }
  t = noteTranslator(locale);
}
const ratingName = (r: Rating) => t(`rating.${r}.short` as NoteKey);

const HOST_ID = 'metube-note-host';
const dismissedThisSession = new Set<string>();

function currentVideoId(): string | null {
  if (location.pathname !== '/watch') return null;
  return new URL(location.href).searchParams.get('v');
}

function removeNote() {
  document.getElementById(HOST_ID)?.remove();
}

/**
 * Sets the note's text a moment after it changes, so screen readers notice the
 * live region (text inserted together with the region itself is often missed).
 */
function say(root: ShadowRoot, text: string) {
  window.setTimeout(() => {
    const el = root.querySelector('.text');
    if (el) el.textContent = text;
  }, 100);
}

/** After the note's buttons go away, keep keyboard focus inside the note. */
function focusClose(root: ShadowRoot) {
  root.querySelector<HTMLButtonElement>('.close')?.focus();
}

function message(s: WatchStatus): string {
  // YouTube still has a like or dislike MeTube no longer wants: the rating was removed, or changed to Neutral.
  if (s.undo) {
    return s.rating === null
      ? t(s.undo === 'like' ? 'note.undoLike' : 'note.undoDislike')
      : t(s.undo === 'like' ? 'note.neutralLike' : 'note.neutralDislike', { rating: ratingName(s.rating) });
  }
  if (s.rating === 2) return t('note.loved');
  if (s.rating === -2) return t('note.hated');
  const rating = s.rating === null ? '' : ratingName(s.rating);
  return t(s.want === 'dislike' ? 'note.ratedDislike' : 'note.ratedLike', { rating });
}

function show(videoId: string, n: WatchNote) {
  if (n.offer === 'rate') renderOffer(videoId, n);
  else render(videoId, n);
}

function renderOffer(videoId: string, o: RateOffer) {
  const root = shell(videoId);
  say(root, t('note.rateOffer'));
  root.querySelector('.done')!.remove();
  const row = root.querySelector('.choices')!;
  for (const r of o.ratings) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = ratingName(r);
    b.addEventListener('click', async () => {
      try {
        const reply = (await browser.runtime.sendMessage({ type: 'yt-rate', videoId, rating: r })) as RateReply | null;
        if (!reply?.rated) {
          say(root, t('note.rateFailed'));
          row.remove();
          focusClose(root);
          window.setTimeout(removeNote, 4000);
        } else if (reply.note && reply.note.offer !== 'rate') {
          show(videoId, reply.note);
          document.getElementById(HOST_ID)?.shadowRoot?.querySelector<HTMLButtonElement>('.done')?.focus();
        } else {
          say(root, t('note.rated', { rating: ratingName(r) }));
          row.remove();
          focusClose(root);
          window.setTimeout(removeNote, 3000);
        }
      } catch { removeNote(); }
    });
    row.appendChild(b);
  }
}

function render(videoId: string, s: WatchStatus) {
  const root = shell(videoId);
  root.querySelector('.choices')!.remove();
  say(root, message(s));
  root.querySelector('.done')!.addEventListener('click', async () => {
    let ok = false;
    try {
      ok = (await browser.runtime.sendMessage({ type: 'yt-mark-done', videoId })) === true;
    } catch {
      // Extension reloaded or unavailable.
    }
    say(root, ok ? t('note.marked') : t('note.unreachable'));
    root.querySelector<HTMLButtonElement>('.done')!.remove();
    focusClose(root);
    window.setTimeout(removeNote, ok ? 3000 : 4000);
  });
}

function shell(videoId: string): ShadowRoot {
  removeNote();
  const host = document.createElement('div');
  host.id = HOST_ID;
  // Shadow DOM keeps our styles and YouTube's apart.
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      .note {
        position: fixed; right: 20px; bottom: 20px; z-index: 2147483000;
        display: flex; align-items: center; gap: 12px; max-width: min(420px, calc(100vw - 40px));
        padding: 10px 10px 10px 14px; border-radius: 14px;
        font: 14px/1.4 system-ui, sans-serif; color: #e2ebe9;
        background: rgb(20 31 34 / 0.92); backdrop-filter: blur(16px);
        border: 1px solid rgb(255 255 255 / 0.08); box-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.6);
      }
      .mark { flex: none; width: 26px; height: 26px; border-radius: 8px; display: grid; place-items: center;
        background: #6fbfa6; color: #0c1416; font: 700 11px/1 system-ui; }
      .text { flex: 1; }
      .body { flex: 1; display: grid; gap: 8px; }
      .choices { display: flex; flex-wrap: wrap; gap: 6px; }
      .chip { background: rgb(255 255 255 / 0.08); color: #e2ebe9; padding: 5px 11px; }
      .chip:hover { background: #6fbfa6; color: #0c1416; }
      button { font: inherit; border: 0; cursor: pointer; border-radius: 99px; }
      .done { background: #6fbfa6; color: #0c1416; font-weight: 600; padding: 6px 12px; }
      .close { background: transparent; color: #9aaeab; width: 28px; height: 28px; font-size: 18px; line-height: 1; }
      .close:hover { color: #e2ebe9; }
      button:focus-visible { outline: 2px solid #6fbfa6; outline-offset: 2px; }
      .close { min-width: 28px; }
      @media (forced-colors: active) {
        .note, button { border: 1px solid CanvasText; }
      }
    </style>
    <div class="note" role="region" aria-label="MeTube">
      <span class="mark" aria-hidden="true">Me</span>
      <span class="body"><span class="text" role="status"></span><span class="choices" role="group"></span></span>
      <button class="done" type="button"></button>
      <button class="close" type="button">×</button>
    </div>`;
  // The template stays static; translated words go in through the DOM, never as HTML.
  root.querySelector('.note')!.setAttribute('lang', locale);
  root.querySelector('.choices')!.setAttribute('aria-label', t('note.rateGroup'));
  const done = root.querySelector('.done')!;
  done.textContent = t('note.done');
  done.setAttribute('aria-label', t('note.doneLabel'));
  root.querySelector('.close')!.setAttribute('aria-label', t('note.hide'));
  root.querySelector('.close')!.addEventListener('click', () => {
    dismissedThisSession.add(videoId);
    removeNote();
  });
  (document.body ?? document.documentElement).appendChild(host);
  return root;
}

let lastChecked: string | null = null;

async function check() {
  const id = currentVideoId();
  if (id === lastChecked) return;
  lastChecked = id;
  removeNote();
  if (!id || dismissedThisSession.has(id)) return;
  await loadLanguage();
  try {
    const n = (await browser.runtime.sendMessage({ type: 'yt-status', videoId: id })) as WatchNote | null;
    if (n && currentVideoId() === id) show(id, n);
  } catch {
    // Extension reloaded or unavailable: show nothing.
  }
}

export default defineContentScript({
  matches: ['https://www.youtube.com/*'],
  main() {
    void check();
    document.addEventListener('yt-navigate-finish', () => void check());
    window.addEventListener('popstate', () => void check());
  },
});

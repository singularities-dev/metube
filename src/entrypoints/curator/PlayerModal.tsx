import { useEffect, useRef, useState } from 'react';
import type { VideoMeta } from '@/lib/api/types';
import { DISMISSALS, RATINGS, type Dismissal, type Rating } from '@/lib/feedback';
import { BellFilledIcon, BellIcon, CloseIcon, ExternalIcon } from './Icons';
import { RATING_ICONS } from './VideoGrid';
import { useI18n } from './i18n';

interface Props {
  video: VideoMeta;
  rating: Rating | undefined;
  onRate: (v: VideoMeta, r: Rating | null) => void;
  onDismiss: (v: VideoMeta, reason: Dismissal) => void;
  onClose: () => void;
  subscribed: boolean;
  onSubscribe: (v: VideoMeta, subscribe: boolean) => void;
}

/**
 * Plays a video in YouTube's own embedded player, which counts as playback on
 * YouTube. The player is an iframe from YouTube, so MeTube can't (and doesn't)
 * reach into it; rating and removing live here in the frame around it.
 */
export function PlayerModal({ video: v, rating, onRate, onDismiss, onClose, subscribed, onSubscribe }: Props) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const [removing, setRemoving] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${v.id}`;

  useEffect(() => {
    const d = dialog.current;
    // Whatever opened the player gets focus back when it closes (if it's still there).
    const opener = document.activeElement as HTMLElement | null;
    d?.showModal();
    return () => {
      d?.close();
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="player glass"
      aria-labelledby="player-title"
      onClose={onClose}
      // Escape closes the Remove panel first, then the player.
      onCancel={(e) => { if (removing) { e.preventDefault(); setRemoving(false); } }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="player-frame">
        <iframe
          src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
          title={v.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <div className="player-bar">
        <div className="player-info">
          <h2 id="player-title">{v.title}</h2>
          <p className="muted player-channel">
            {v.channelTitle}
            <button className="chip-button" aria-pressed={subscribed} onClick={() => onSubscribe(v, !subscribed)}>
              {subscribed ? <BellFilledIcon width={14} height={14} /> : <BellIcon width={14} height={14} />}
              {t('player.subscribe')}
            </button>
          </p>
        </div>
        <div className="player-rate" role="group" aria-label={t('player.rateGroup')}>
          {RATINGS.map((r) => {
            const Icon = RATING_ICONS[r.value];
            // The name starts with the visible word, so voice control can use it (WCAG 2.5.3).
            const label = t(`rating.${r.value}.short`);
            return (
              <button
                key={r.value}
                aria-pressed={rating === r.value}
                data-rating={r.value}
                aria-label={rating === r.value ? t('rating.removeHint', { label }) : label}
                title={t(`rating.${r.value}.label`)}
                onClick={() => onRate(v, rating === r.value ? null : r.value)}
              >
                <Icon width={20} height={20} />
                <span aria-hidden>{label}</span>
              </button>
            );
          })}
        </div>
        <div className="player-actions">
          <div className="player-remove">
            <button className="button secondary small" aria-expanded={removing} aria-controls="player-remove" onClick={() => setRemoving((x) => !x)}>{t('player.remove')}</button>
            {removing && (
              <div id="player-remove" className="tile-menu glass dismiss-menu" role="group" aria-label={t('player.removeGroup')}>
                {DISMISSALS.map((d) => (
                  <button key={d.value} onClick={() => { onDismiss(v, d.value); onClose(); }}>
                    <span className="menu-label">{t(`dismiss.${d.value}.label`)}</span>
                    <span className="menu-hint">{t(`dismiss.${d.value}.hint`)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <a className="button secondary small" href={watchUrl} target="_blank" rel="noopener noreferrer" aria-label={t('player.openOnYouTube')} onClick={onClose}>
            <ExternalIcon width={16} height={16} /> YouTube
          </a>
          {/* Focus starts here rather than inside YouTube's iframe. */}
          <button className="icon-button" aria-label={t('player.close')} onClick={onClose} autoFocus>
            <CloseIcon width={20} height={20} />
          </button>
        </div>
      </div>
    </dialog>
  );
}

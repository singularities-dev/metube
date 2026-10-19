/** Normalised records produced by the Takeout parsers. */

export interface WatchEvent {
  videoId: string;
  /** Null when the video has since been removed or made private. */
  title: string | null;
  channelId: string | null;
  channelTitle: string | null;
  /** Epoch milliseconds (UTC). */
  time: number;
  /** True for ads shown via Google Ads (JSON exports mark these). */
  isAd: boolean;
}

export interface SearchEvent {
  query: string;
  time: number;
}

export interface Subscription {
  channelId: string;
  channelTitle: string;
  /** Where it came from. Rows stored before MeTube had its own subscriptions have none: Takeout. */
  source?: 'takeout' | 'metube' | 'youtube';
  /** When you subscribed, if known (epoch ms). */
  subscribedAt?: number;
  /** Whether YouTube has it. Unset means assumed from the source (see isOnYouTube in subscriptions.ts). */
  onYouTube?: boolean;
  /** YouTube's ID for the subscription, needed to unsubscribe there. */
  ytSubscriptionId?: string;
  /** Unsubscribed in MeTube while YouTube still has it: kept until a sync removes it there. */
  removed?: boolean;
  removedAt?: number;
}

export interface PlaylistItem {
  playlistTitle: string;
  videoId: string;
  addedAt: number | null;
}

export interface ParseResult<T> {
  items: T[];
  /** Entries we could not read; kept so the UI can report them. */
  skipped: number;
}

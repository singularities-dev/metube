/** The slices of YouTube Data API v3 responses that MeTube uses. */

export interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface PlaylistItemsResponse {
  nextPageToken?: string;
  items: {
    contentDetails: { videoId: string; videoPublishedAt?: string };
  }[];
}

export interface VideosResponse {
  items: {
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      channelTitle: string;
      title: string;
      description: string;
      tags?: string[];
      categoryId: string;
      liveBroadcastContent?: 'none' | 'live' | 'upcoming';
      defaultAudioLanguage?: string;
      thumbnails: Partial<Record<'default' | 'medium' | 'high' | 'standard' | 'maxres', Thumbnail>>;
    };
    contentDetails: { duration: string };
    statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
    /** Sizes only when the request set maxHeight/maxWidth and the aspect ratio is known. */
    player?: { embedWidth?: string | number; embedHeight?: string | number };
  }[];
}

export interface SubscriptionsResponse {
  nextPageToken?: string;
  items: {
    id: string;
    snippet: { title: string; publishedAt?: string; resourceId: { channelId: string } };
  }[];
}

export interface SearchResponse {
  items: { id: { kind: string; videoId?: string } }[];
}

/**
 * YouTube's video categories. IDs are stable worldwide, so these are listed
 * statically instead of spending a videoCategories call.
 */
export const CATEGORIES: { id: string; name: string }[] = [
  { id: '20', name: 'Gaming' },
  { id: '10', name: 'Music' },
  { id: '25', name: 'News' },
  { id: '17', name: 'Sports' },
  { id: '28', name: 'Science & Tech' },
  { id: '27', name: 'Education' },
  { id: '24', name: 'Entertainment' },
  { id: '1', name: 'Film' },
  { id: '23', name: 'Comedy' },
  { id: '2', name: 'Cars' },
  { id: '22', name: 'People & Blogs' },
  { id: '26', name: 'How-to' },
  { id: '19', name: 'Travel' },
  { id: '15', name: 'Animals' },
];

export interface VideoCategoriesResponse {
  items: { id: string; snippet: { title: string; assignable: boolean } }[];
}

export interface ApiErrorBody {
  error: {
    code: number;
    message: string;
    errors?: { reason: string; domain?: string; message?: string }[];
  };
}

/** Our normalised video record, cached in IndexedDB. */
export interface VideoMeta {
  id: string;
  channelId: string;
  channelTitle: string;
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  publishedAt: number;
  durationSec: number;
  /** Width / height of the player; missing when YouTube doesn't know it, or on records cached before it was kept. */
  aspect?: number;
  isLive: boolean;
  thumbnail: string | null;
  viewCount: number | null;
  /** Missing on records cached before likes were kept, or when the owner hides them. */
  likeCount?: number | null;
  /** When we fetched this from the API; drives the 30-day refresh/delete rule. */
  fetchedAt: number;
}

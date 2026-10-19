/**
 * Local YouTube Data API quota tracker.
 *
 * The API does not report remaining quota, so we count units ourselves.
 * Quota resets at midnight Pacific time, so the "quota day" is the calendar
 * date in America/Los_Angeles.
 */

export const DAILY_LIMIT_DEFAULT = 10_000;

/** Unit cost per endpoint (YouTube Data API v3). */
export const ENDPOINT_COST = {
  'search.list': 100,
  'videos.list': 1,
  'playlistItems.list': 1,
  'channels.list': 1,
  'subscriptions.list': 1,
  'videoCategories.list': 1,
  /** Writes to YouTube for the signed-in user (need OAuth). */
  'videos.rate': 50,
  'subscriptions.insert': 50,
  'subscriptions.delete': 50,
} as const;

export type Endpoint = keyof typeof ENDPOINT_COST;

export interface QuotaState {
  /** Quota day as YYYY-MM-DD in Pacific time. */
  day: string;
  used: number;
  limit: number;
}

/** Minimal key-value store so the tracker works with browser storage or in tests. */
export interface KeyValueStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
}

const STORAGE_KEY = 'quota';

/** Calendar date in Pacific time, which is when YouTube resets quota. */
export function quotaDay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export class QuotaExceededLocallyError extends Error {
  readonly needed: number;
  readonly remaining: number;
  constructor(needed: number, remaining: number) {
    super(`Quota: need ${needed} units, ${remaining} left today`);
    this.name = 'QuotaExceededLocallyError';
    this.needed = needed;
    this.remaining = remaining;
  }
}

export class QuotaTracker {
  private readonly store: KeyValueStore;
  private readonly clock: () => Date;
  private readonly defaultLimit: number;

  constructor(
    store: KeyValueStore,
    clock: () => Date = () => new Date(),
    defaultLimit: number = DAILY_LIMIT_DEFAULT,
  ) {
    this.store = store;
    this.clock = clock;
    this.defaultLimit = defaultLimit;
  }

  /** Current state, rolled over to a fresh day when Pacific midnight has passed. */
  async state(): Promise<QuotaState> {
    const today = quotaDay(this.clock());
    const saved = await this.store.get<QuotaState>(STORAGE_KEY);
    if (!saved || saved.day !== today) {
      return { day: today, used: 0, limit: saved?.limit ?? this.defaultLimit };
    }
    return saved;
  }

  async remaining(): Promise<number> {
    const s = await this.state();
    return Math.max(0, s.limit - s.used);
  }

  cost(endpoint: Endpoint, calls = 1): number {
    return ENDPOINT_COST[endpoint] * calls;
  }

  async canAfford(endpoint: Endpoint, calls = 1): Promise<boolean> {
    return (await this.remaining()) >= this.cost(endpoint, calls);
  }

  /** Throws before a call that would exceed the local budget. */
  async assertAffordable(endpoint: Endpoint, calls = 1): Promise<void> {
    const needed = this.cost(endpoint, calls);
    const left = await this.remaining();
    if (needed > left) throw new QuotaExceededLocallyError(needed, left);
  }

  /** Record units spent after a call was sent (failed calls still cost quota). */
  async record(endpoint: Endpoint, calls = 1): Promise<QuotaState> {
    const s = await this.state();
    const next = { ...s, used: s.used + this.cost(endpoint, calls) };
    await this.store.set(STORAGE_KEY, next);
    return next;
  }

  /** The API returned quotaExceeded: the key was used elsewhere, so mark the day as spent. */
  async markExhausted(): Promise<QuotaState> {
    const s = await this.state();
    const next = { ...s, used: s.limit };
    await this.store.set(STORAGE_KEY, next);
    return next;
  }

  /** Users with a raised quota on their own Cloud project can set their limit. */
  async setLimit(limit: number): Promise<QuotaState> {
    if (!Number.isInteger(limit) || limit <= 0) throw new RangeError('limit must be a positive integer');
    const s = await this.state();
    const next = { ...s, limit };
    await this.store.set(STORAGE_KEY, next);
    return next;
  }
}

/** In-memory store for tests and previews. */
export class MemoryStore implements KeyValueStore {
  private data = new Map<string, unknown>();
  async get<T>(key: string) {
    return this.data.get(key) as T | undefined;
  }
  async set<T>(key: string, value: T) {
    this.data.set(key, structuredClone(value));
  }
}

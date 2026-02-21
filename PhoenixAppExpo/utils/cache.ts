// In-memory API response cache.
// Fresh window (< 5 min): return cached data immediately, skip the network call.
// Stale window (5–30 min): still usable as an offline fallback when the network fails.
// Dead (> 30 min): ignored.

const FRESH_TTL = 5 * 60 * 1000;
const STALE_TTL = 30 * 60 * 1000;

type CacheEntry = { data: unknown; timestamp: number };

const store = new Map<string, CacheEntry>();

export function getCache<T>(key: string): { data: T; isStale: boolean } | null {
  const entry = store.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.timestamp;
  if (age > STALE_TTL) {
    store.delete(key);
    return null;
  }
  return { data: entry.data as T, isStale: age > FRESH_TTL };
}

export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

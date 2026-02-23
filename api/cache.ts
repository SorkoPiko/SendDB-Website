const cache = new Map<string, { data: unknown; expiry: number }>();

const TTL_MS = 5 * 60 * 1000; 

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, expiry: Date.now() + TTL_MS });
}
export const CONTENT_TTL_MS = 5 * 60 * 1000;

const store = new Map<string, { value: unknown; expiresAt: number }>();

/**
 * Caches ONLY resolved plain values in memory with a TTL.
 * Never stores in-flight Promises so Cloudflare Workers isolates never await cross-request I/O,
 * and never caches thrown errors.
 */
export async function memoizeAsync<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }

  const value = await fn();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function clearServerMemo(): void {
  store.clear();
}

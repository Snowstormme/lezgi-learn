import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearServerMemo, memoizeAsync } from '@/lib/server-memo';

describe('server-memo TTL cache', () => {
  beforeEach(() => {
    clearServerMemo();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the cached result on repeat calls within TTL without invoking fn again', async () => {
    const fn = vi.fn(async () => ({ count: 42 }));

    const first = await memoizeAsync('k1', 60_000, fn);
    const second = await memoizeAsync('k1', 60_000, fn);

    expect(first).toEqual({ count: 42 });
    expect(second).toBe(first);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('re-invokes fn after the TTL expires', async () => {
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    let seq = 0;
    const fn = vi.fn(async () => ++seq);

    const first = await memoizeAsync('k2', 5_000, fn);
    now += 4_999;
    const stillFresh = await memoizeAsync('k2', 5_000, fn);
    now += 2;
    const refreshed = await memoizeAsync('k2', 5_000, fn);

    expect(first).toBe(1);
    expect(stillFresh).toBe(1);
    expect(refreshed).toBe(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('never caches rejected calls so the next invocation retries fn', async () => {
    let attempt = 0;
    const fn = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) {
        throw new Error('temporary failure');
      }
      return 'recovered';
    });

    await expect(memoizeAsync('k3', 60_000, fn)).rejects.toThrow(
      'temporary failure'
    );
    const second = await memoizeAsync('k3', 60_000, fn);

    expect(second).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

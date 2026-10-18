import { afterEach, describe, expect, it, vi } from 'vitest';
import { Amodb, AmodbError, RateLimitError } from '../src/index';
import { parseRetryAfter, retryDelaySeconds } from '../src/transport';
import { KEY, json, mockFetch, mockSleep } from './helpers';

const rateLimited = (headers: Record<string, string> = {}) =>
  json(
    { success: false, status_code: 25, status_message: 'Your request count (21) is over the allowed limit of (20).' },
    429,
    headers,
  );

afterEach(() => {
  vi.useRealTimers();
});

describe('429 retry', () => {
  it('waits for Retry-After and then succeeds', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': '2' }), json({ id: 550 }));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
    expect(await client.movies.details(550)).toEqual({ id: 550 });
    expect(m.calls).toHaveLength(2);
    expect(s.waits).toEqual([2000]);
  });

  it('sends the same auth header on every attempt', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': '1' }), json({}));
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: mockSleep().sleep });
    await client.request('/configuration');
    expect(m.calls.map((c) => c.headers.Authorization)).toEqual([`Bearer ${KEY}`, `Bearer ${KEY}`]);
  });

  it('stops after 3 retries and raises RateLimitError', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': '1' }));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
    const error = await client.movies.details(550).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error).toBeInstanceOf(AmodbError);
    const e = error as RateLimitError;
    expect(e.status).toBe(429);
    expect(e.statusCode).toBe(25);
    expect(e.statusMessage).toContain('over the allowed limit');
    expect(e.retryAfter).toBe(1);
    expect(m.calls).toHaveLength(4);
    expect(s.waits).toEqual([1000, 1000, 1000]);
  });

  it('waits 1, 2 and 4 seconds when Retry-After is missing', async () => {
    const m = mockFetch(rateLimited());
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
    const error = (await client.request('/configuration').catch((e: unknown) => e)) as RateLimitError;
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.retryAfter).toBeNull();
    expect(s.waits).toEqual([1000, 2000, 4000]);
    expect(m.calls).toHaveLength(4);
  });

  it('clamps long waits to 60 seconds', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': '600' }), json({}));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
    await client.request('/configuration');
    expect(s.waits).toEqual([60_000]);
  });

  it('accepts an HTTP date in Retry-After', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-18T12:00:00Z'));
    const m = mockFetch(rateLimited({ 'Retry-After': 'Sun, 18 Oct 2026 12:00:10 GMT' }), json({}));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
    await client.request('/configuration');
    expect(s.waits).toEqual([10_000]);
  });

  it('treats a past HTTP date as zero seconds', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-18T12:00:00Z'));
    const m = mockFetch(rateLimited({ 'Retry-After': 'Sun, 18 Oct 2026 11:00:00 GMT' }), json({}));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
    await client.request('/configuration');
    expect(s.waits).toEqual([0]);
  });

  it('falls back to exponential waits when Retry-After is unreadable', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': 'soon' }), json({}));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
    await client.request('/configuration');
    expect(s.waits).toEqual([1000]);
  });

  it('respects a lower maxRetries', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': '1' }));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep, maxRetries: 1 });
    await expect(client.request('/configuration')).rejects.toBeInstanceOf(RateLimitError);
    expect(m.calls).toHaveLength(2);
    expect(s.waits).toEqual([1000]);
  });

  it('does not retry when maxRetries is 0', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': '1' }));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep, maxRetries: 0 });
    await expect(client.request('/configuration')).rejects.toBeInstanceOf(RateLimitError);
    expect(m.calls).toHaveLength(1);
    expect(s.waits).toEqual([]);
  });

  it('caps maxRetries at 3', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': '1' }));
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: mockSleep().sleep, maxRetries: 50 });
    await expect(client.request('/configuration')).rejects.toBeInstanceOf(RateLimitError);
    expect(m.calls).toHaveLength(4);
  });

  it('does not retry other statuses', async () => {
    for (const status of [401, 404, 500, 504]) {
      const m = mockFetch(json({ success: false, status_code: 11, status_message: 'x' }, status));
      const s = mockSleep();
      const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
      await expect(client.request('/configuration')).rejects.toBeInstanceOf(AmodbError);
      expect(m.calls).toHaveLength(1);
      expect(s.waits).toEqual([]);
    }
  });

  it('retries OMDb calls too', async () => {
    const m = mockFetch(rateLimited({ 'Retry-After': '1' }), json({ Response: 'True', Title: 'x' }));
    const s = mockSleep();
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: s.sleep });
    await client.omdb.byTitle('x');
    expect(m.calls).toHaveLength(2);
    expect(s.waits).toEqual([1000]);
  });

  it('uses real timers for the wait when no sleep is injected', async () => {
    vi.useFakeTimers();
    const m = mockFetch(rateLimited({ 'Retry-After': '3' }), json({ ok: true }));
    const client = new Amodb({ apiKey: KEY, fetch: m.fetch });
    const pending = client.request('/configuration');
    await vi.advanceTimersByTimeAsync(2900);
    expect(m.calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(200);
    expect(await pending).toEqual({ ok: true });
    expect(m.calls).toHaveLength(2);
  });
});

describe('parseRetryAfter', () => {
  it('reads seconds, dates and junk', () => {
    expect(parseRetryAfter('7')).toBe(7);
    expect(parseRetryAfter(' 7 ')).toBe(7);
    expect(parseRetryAfter('0')).toBe(0);
    expect(parseRetryAfter('-3')).toBe(0);
    expect(parseRetryAfter('1.2')).toBe(2);
    expect(parseRetryAfter('')).toBeNull();
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter(undefined)).toBeNull();
    expect(parseRetryAfter('later')).toBeNull();
    const now = Date.parse('2026-10-18T12:00:00Z');
    expect(parseRetryAfter('Sun, 18 Oct 2026 12:00:30 GMT', now)).toBe(30);
  });

  it('computes the wait', () => {
    expect([0, 1, 2].map((n) => retryDelaySeconds(null, n))).toEqual([1, 2, 4]);
    expect(retryDelaySeconds(5, 2)).toBe(5);
    expect(retryDelaySeconds(999, 0)).toBe(60);
    expect(retryDelaySeconds(0, 0)).toBe(0);
  });
});

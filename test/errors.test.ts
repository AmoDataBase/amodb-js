import { describe, expect, it } from 'vitest';
import { Amodb, AmodbError, AmodbTimeoutError, NetworkError, RateLimitError } from '../src/index';
import { KEY, json, mockFetch, mockSleep, text } from './helpers';

function client(...replies: Parameters<typeof mockFetch>) {
  const m = mockFetch(...replies);
  return { c: new Amodb({ apiKey: KEY, fetch: m.fetch, sleep: mockSleep().sleep }), ...m };
}

const table: Array<[number, number, string]> = [
  [401, 7, 'Invalid API key: You must be granted a valid key.'],
  [401, 10, 'Suspended API key: Access to your account has been suspended, contact amodb.'],
  [402, 36, 'Your plan has expired. Renew at https://amodb.dev/pricing'],
  [404, 34, 'The resource you requested could not be found.'],
  [405, 37, 'This method is not offered by amodb.'],
  [500, 11, 'Internal error: Something went wrong, contact amodb.'],
  [504, 24, 'Your request to the backend server timed out. Try again.'],
];

describe('error mapping', () => {
  it.each(table)('maps HTTP %i with status_code %i', async (status, code, message) => {
    const body = { success: false, status_code: code, status_message: message };
    const { c } = client(json(body, status));
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as AmodbError;
    expect(error).toBeInstanceOf(AmodbError);
    expect(error).not.toBeInstanceOf(RateLimitError);
    expect(error.name).toBe('AmodbError');
    expect(error.status).toBe(status);
    expect(error.statusCode).toBe(code);
    expect(error.statusMessage).toBe(message);
    expect(error.message).toBe(message);
    expect(error.body).toEqual(body);
  });

  it('maps a 429 body to RateLimitError with the TMDB fields', async () => {
    const body = { success: false, status_code: 25, status_message: 'Your request count (21) is over the allowed limit of (20).' };
    const { c } = client(json(body, 429, { 'Retry-After': '5' }));
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as RateLimitError;
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.name).toBe('RateLimitError');
    expect(error.status).toBe(429);
    expect(error.statusCode).toBe(25);
    expect(error.retryAfter).toBe(5);
    expect(error.body).toEqual(body);
  });

  it('handles a non JSON error body', async () => {
    const { c } = client(text('<html>Server error</html>', 502));
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as AmodbError;
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(502);
    expect(error.statusCode).toBeNull();
    expect(error.statusMessage).toBe('HTTP 502');
    expect(error.body).toBe('<html>Server error</html>');
  });

  it('handles an empty error body', async () => {
    const { c } = client(text('', 503));
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as AmodbError;
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(503);
    expect(error.statusCode).toBeNull();
    expect(error.body).toBeNull();
  });

  it('ignores a status_code that is not a number', async () => {
    const { c } = client(json({ status_code: 'x', status_message: 'odd' }, 400));
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as AmodbError;
    expect(error.statusCode).toBeNull();
    expect(error.statusMessage).toBe('odd');
  });

  it('raises AmodbError for a 200 body that is not JSON', async () => {
    const { c } = client(text('not json', 200));
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as AmodbError;
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(200);
    expect(error.body).toBe('not json');
  });

  it('raises AmodbError for an empty 200 body', async () => {
    const { c } = client(text('', 200));
    await expect(c.movies.details(1)).rejects.toBeInstanceOf(AmodbError);
  });

  it('supports instanceof checks across the hierarchy', () => {
    const base = { status: 0, statusMessage: 'x' };
    expect(new RateLimitError({ ...base, status: 429 })).toBeInstanceOf(AmodbError);
    expect(new AmodbTimeoutError(base)).toBeInstanceOf(AmodbError);
    expect(new NetworkError(base)).toBeInstanceOf(AmodbError);
    expect(new AmodbError(base)).toBeInstanceOf(Error);
    expect(new AmodbTimeoutError(base).name).toBe('AmodbTimeoutError');
    expect(new NetworkError(base).name).toBe('NetworkError');
    expect(new AmodbError(base).statusCode).toBeNull();
    expect(new AmodbError(base).body).toBeNull();
  });

  it('never puts the key in an error message', async () => {
    const m = mockFetch(json({ status_code: 7, status_message: 'Invalid API key' }, 401));
    const c = new Amodb({ apiKey: KEY, fetch: m.fetch, auth: 'query' });
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as AmodbError;
    expect(error.message).not.toContain(KEY);
    expect(String(error.stack)).not.toContain(KEY);
  });
});

describe('timeout', () => {
  it('raises AmodbTimeoutError and aborts the request', async () => {
    const m = mockFetch();
    m.fn.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        }),
    );
    const c = new Amodb({ apiKey: KEY, fetch: m.fetch, timeout: 30 });
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as AmodbTimeoutError;
    expect(error).toBeInstanceOf(AmodbTimeoutError);
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(0);
    expect(error.statusCode).toBeNull();
    expect(error.statusMessage).toContain('30 ms');
    expect(error.body).toBeNull();
    expect(m.fn).toHaveBeenCalledTimes(1);
  });

  it('times out even when fetch ignores the abort signal', async () => {
    const m = mockFetch();
    m.fn.mockImplementation(() => new Promise<Response>(() => undefined));
    const c = new Amodb({ apiKey: KEY, fetch: m.fetch, timeout: 20 });
    await expect(c.request('/configuration')).rejects.toBeInstanceOf(AmodbTimeoutError);
  });

  it('times out while the body is still being read', async () => {
    const m = mockFetch();
    m.fn.mockImplementation(async () => {
      const slow = { status: 200, statusText: 'OK', headers: new Headers(), text: () => new Promise<string>(() => undefined) };
      return slow as unknown as Response;
    });
    const c = new Amodb({ apiKey: KEY, fetch: m.fetch, timeout: 20 });
    await expect(c.request('/configuration')).rejects.toBeInstanceOf(AmodbTimeoutError);
  });

  it('does not retry a timeout', async () => {
    const m = mockFetch();
    m.fn.mockImplementation(() => new Promise<Response>(() => undefined));
    const s = mockSleep();
    const c = new Amodb({ apiKey: KEY, fetch: m.fetch, timeout: 20, sleep: s.sleep });
    await expect(c.request('/configuration')).rejects.toBeInstanceOf(AmodbTimeoutError);
    expect(m.fn).toHaveBeenCalledTimes(1);
    expect(s.waits).toEqual([]);
  });

  it('passes an abort signal to fetch', async () => {
    const { c, calls } = client(json({}));
    await c.request('/configuration');
    expect(calls[0]?.signal).toBeInstanceOf(AbortSignal);
    expect(calls[0]?.signal?.aborted).toBe(false);
  });

  it('can be disabled with timeout 0', async () => {
    const m = mockFetch(json({ ok: true }));
    const c = new Amodb({ apiKey: KEY, fetch: m.fetch, timeout: 0 });
    expect(await c.request('/configuration')).toEqual({ ok: true });
  });
});

describe('network failures', () => {
  it('wraps a rejected fetch in NetworkError', async () => {
    const cause = new TypeError('fetch failed');
    const { c } = client(cause);
    const error = (await c.movies.details(1).catch((e: unknown) => e)) as NetworkError;
    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toBeInstanceOf(AmodbError);
    expect(error.status).toBe(0);
    expect(error.statusCode).toBeNull();
    expect(error.statusMessage).toBe('fetch failed');
    expect(error.cause).toBe(cause);
  });

  it('does not retry network errors', async () => {
    const { c, fn } = client(new TypeError('fetch failed'));
    await expect(c.request('/configuration')).rejects.toBeInstanceOf(NetworkError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

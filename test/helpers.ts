import { vi } from 'vitest';

export const KEY = '0123456789abcdef0123456789abcdef';

export interface Call {
  url: string;
  u: URL;
  headers: Record<string, string>;
  signal: AbortSignal | null | undefined;
}

/** A response factory. Bodies can be read once, so each call builds a new Response. */
export type Reply = () => Response | Promise<Response>;

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Reply {
  return () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json', ...headers },
    });
}

export function text(body: string, status = 200, headers: Record<string, string> = {}): Reply {
  return () => new Response(body, { status, headers });
}

/**
 * A mocked fetch. Replies are used in order and the last one repeats.
 * A reply may also be an Error, which makes fetch reject.
 */
export function mockFetch(...replies: Array<Reply | Error>) {
  const calls: Call[] = [];
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    calls.push({
      url,
      u: new URL(url),
      headers: { ...((init?.headers as Record<string, string> | undefined) ?? {}) },
      signal: init?.signal,
    });
    const reply = replies[Math.min(calls.length - 1, replies.length - 1)];
    if (reply === undefined) return json({})();
    if (reply instanceof Error) throw reply;
    return reply();
  });
  return { fetch: fn as unknown as typeof fetch, calls, fn };
}

/** A sleep that records the requested waits and returns at once. */
export function mockSleep() {
  const waits: number[] = [];
  const sleep = async (ms: number): Promise<void> => {
    waits.push(ms);
  };
  return { sleep, waits };
}

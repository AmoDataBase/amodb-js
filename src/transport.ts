import {
  DEFAULT_BASE_URL,
  DEFAULT_IMAGE_BASE_URL,
  DEFAULT_OMDB_URL,
  DEFAULT_TIMEOUT_MS,
  MAX_RETRIES,
  MAX_RETRY_WAIT_SECONDS,
  USER_AGENT,
} from './constants';
import { AmodbError, AmodbTimeoutError, NetworkError, RateLimitError } from './errors';
import type { AmodbOptions, AuthMode } from './options';
import { buildQuery } from './query';
import type { Params } from './types';

/** What resource classes need from the client. */
export interface Requester {
  request<T = unknown>(path: string, params?: Params): Promise<T>;
}

interface RawResponse {
  status: number;
  statusText: string;
  retryAfter: string | null;
  text: string;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

/**
 * Reads a Retry-After header: integer seconds or an HTTP date.
 * Returns whole seconds (never negative), or null when missing or unreadable.
 */
export function parseRetryAfter(value: string | null | undefined, now: number = Date.now()): number | null {
  if (value === null || value === undefined) return null;
  const text = value.trim();
  if (text === '') return null;
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Math.max(0, Math.ceil(Number(text)));
  const when = Date.parse(text);
  if (Number.isNaN(when)) return null;
  return Math.max(0, Math.ceil((when - now) / 1000));
}

/** Seconds to wait before retry number `attempt` (0 based). */
export function retryDelaySeconds(retryAfter: number | null, attempt: number): number {
  const seconds = retryAfter === null ? 2 ** attempt : retryAfter;
  return Math.min(MAX_RETRY_WAIT_SECONDS, Math.max(0, seconds));
}

function parseBody(text: string): unknown {
  if (text === '') return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorFromResponse(raw: RawResponse): AmodbError {
  const body = parseBody(raw.text);
  const fields = isRecord(body) ? body : {};
  const statusCode = typeof fields.status_code === 'number' ? fields.status_code : null;
  let statusMessage = raw.statusText || `HTTP ${raw.status}`;
  if (typeof fields.status_message === 'string') statusMessage = fields.status_message;
  else if (typeof fields.Error === 'string') statusMessage = fields.Error;

  if (raw.status === 429) {
    return new RateLimitError({
      status: raw.status,
      statusCode,
      statusMessage,
      body,
      retryAfter: parseRetryAfter(raw.retryAfter),
    });
  }
  return new AmodbError({ status: raw.status, statusCode, statusMessage, body });
}

/** Sends requests, adds auth, retries on 429 and maps failures to typed errors. */
export class HttpClient implements Requester {
  readonly baseUrl: string;
  readonly omdbUrl: string;
  readonly imageBaseUrl: string;
  readonly language: string | undefined;
  readonly timeout: number;
  readonly maxRetries: number;
  readonly auth: AuthMode;

  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch | undefined;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly userAgent: string | null;

  constructor(options: AmodbOptions) {
    const apiKey = typeof options?.apiKey === 'string' ? options.apiKey.trim() : '';
    if (apiKey === '') {
      throw new TypeError('amodb: apiKey is required. Get a key at https://amodb.dev/pricing');
    }
    const auth = options.auth ?? 'bearer';
    if (auth !== 'bearer' && auth !== 'query') {
      throw new TypeError(`amodb: auth must be "bearer" or "query", got "${String(auth)}"`);
    }
    if (typeof options.fetch !== 'function' && typeof globalThis.fetch !== 'function') {
      throw new TypeError('amodb: no global fetch found. Use Node 18 or newer, or pass the fetch option.');
    }

    this.apiKey = apiKey;
    this.auth = auth;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.omdbUrl = options.omdbUrl ?? DEFAULT_OMDB_URL;
    this.imageBaseUrl = options.imageBaseUrl ?? DEFAULT_IMAGE_BASE_URL;
    this.language = options.language || undefined;
    this.timeout =
      typeof options.timeout === 'number' && Number.isFinite(options.timeout) && options.timeout >= 0
        ? options.timeout
        : DEFAULT_TIMEOUT_MS;
    const retries = typeof options.maxRetries === 'number' && Number.isFinite(options.maxRetries) ? options.maxRetries : MAX_RETRIES;
    this.maxRetries = Math.min(MAX_RETRIES, Math.max(0, Math.floor(retries)));
    this.fetchImpl = options.fetch;
    this.sleep = options.sleep ?? defaultSleep;
    this.userAgent = options.userAgent ?? (isBrowser() ? null : USER_AGENT);
  }

  /** GET `baseUrl + path` with auth, retries and typed errors. Returns parsed JSON. */
  async request<T = unknown>(path: string, params?: Params): Promise<T> {
    const query: Params = this.auth === 'query' ? { api_key: this.apiKey } : {};
    if (this.language !== undefined) query.language = this.language;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (key === 'language' && value === undefined) continue;
        query[key] = value;
      }
    }
    if (this.auth === 'query') query.api_key = this.apiKey;

    const headers = this.headers(this.auth === 'bearer');
    const url = this.baseUrl + (path.startsWith('/') ? path : `/${path}`) + withQuery(path, buildQuery(query));
    const { data } = await this.execute(url, headers);
    return data as T;
  }

  /** GET the OMDb endpoint. `Response: "False"` bodies raise AmodbError. */
  async omdb<T = unknown>(params: Params): Promise<T> {
    const query: Params = { apikey: this.apiKey, ...params };
    query.apikey = this.apiKey;
    const url = this.omdbUrl + withQuery(this.omdbUrl, buildQuery(query));
    const { data, status } = await this.execute(url, this.headers(false));
    if (isRecord(data) && data.Response === 'False') {
      const message = typeof data.Error === 'string' ? data.Error : 'OMDb request failed';
      throw new AmodbError({ status, statusCode: null, statusMessage: message, body: data });
    }
    return data as T;
  }

  /** GET the public plan catalog from the scheme and host of `baseUrl`. No key is sent. */
  async plans<T = unknown>(): Promise<T> {
    const url = `${new URL(this.baseUrl).origin}/plans`;
    const { data } = await this.execute(url, this.headers(false));
    return data as T;
  }

  private headers(bearer: boolean): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (bearer) headers.Authorization = `Bearer ${this.apiKey}`;
    if (this.userAgent) headers['User-Agent'] = this.userAgent;
    return headers;
  }

  private async execute(url: string, headers: Record<string, string>): Promise<{ data: unknown; status: number }> {
    for (let attempt = 0; ; attempt++) {
      const raw = await this.fetchOnce(url, headers);

      if (raw.status === 429 && attempt < this.maxRetries) {
        await this.sleep(retryDelaySeconds(parseRetryAfter(raw.retryAfter), attempt) * 1000);
        continue;
      }
      if (raw.status < 200 || raw.status >= 300) throw errorFromResponse(raw);

      if (raw.text.trim() === '') {
        throw new AmodbError({ status: raw.status, statusMessage: 'Empty response body', body: null });
      }
      let data: unknown;
      try {
        data = JSON.parse(raw.text) as unknown;
      } catch (cause) {
        throw new AmodbError({ status: raw.status, statusMessage: 'Response is not valid JSON', body: raw.text, cause });
      }
      return { data, status: raw.status };
    }
  }

  private async fetchOnce(url: string, headers: Record<string, string>): Promise<RawResponse> {
    const doFetch = this.fetchImpl ?? globalThis.fetch;
    const controller = new AbortController();

    const work = (async (): Promise<RawResponse> => {
      try {
        const res = await doFetch(url, { method: 'GET', headers, signal: controller.signal });
        const text = await res.text();
        return {
          status: res.status,
          statusText: res.statusText,
          retryAfter: res.headers.get('retry-after'),
          text,
        };
      } catch (cause) {
        const message = cause instanceof Error && cause.message ? cause.message : 'Network request failed';
        throw new NetworkError({ status: 0, statusMessage: message, cause });
      }
    })();

    if (this.timeout <= 0) return work;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new AmodbTimeoutError({ status: 0, statusMessage: `Request timed out after ${this.timeout} ms` }));
        controller.abort();
      }, this.timeout);
    });
    try {
      return await Promise.race([work, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Returns `?query` or `&query` depending on whether `base` already has a query string. */
function withQuery(base: string, query: string): string {
  if (query === '') return '';
  return (base.includes('?') ? '&' : '?') + query;
}

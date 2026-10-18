import type { Params, QueryValue } from './types';

function scalar(value: string | number | boolean): string {
  return encodeURIComponent(String(value));
}

/**
 * Encodes one value for a query string.
 * Booleans become true or false, arrays are joined with commas, null,
 * undefined and empty arrays return undefined (the key is dropped).
 */
export function encodeValue(value: QueryValue): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) {
    const parts = (value as ReadonlyArray<string | number | boolean>).map(scalar);
    return parts.length === 0 ? undefined : parts.join(',');
  }
  return scalar(value as string | number | boolean);
}

/** Builds `a=1&b=x,y` from a params map. Keys are sent exactly as given. */
export function buildQuery(params: Params | undefined): string {
  if (!params) return '';
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    const encoded = encodeValue(value);
    if (encoded !== undefined) pairs.push(`${encodeURIComponent(key)}=${encoded}`);
  }
  return pairs.join('&');
}

/** Percent-encodes one path segment. */
export function seg(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function snakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/**
 * Turns a typed options object into a wire params map: camelCase keys become
 * snake_case, undefined values are dropped, and the `params` passthrough is
 * merged first so typed options win on conflict.
 */
export function toParams(options?: object, extra?: Params): Params {
  const out: Params = {};
  if (options) {
    const { params, ...rest } = options as { params?: Params };
    if (params) Object.assign(out, params);
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) out[snakeCase(key)] = value as QueryValue;
    }
  }
  if (extra) Object.assign(out, extra);
  return out;
}

/** Lets a method take `2` or `{ page: 2, language: 'ru-RU' }`. */
export function pageOptions(arg?: number | object): object | undefined {
  return typeof arg === 'number' ? { page: arg } : arg;
}

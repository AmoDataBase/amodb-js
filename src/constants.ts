export const VERSION = '0.1.0';

export const DEFAULT_BASE_URL = 'https://api.amodb.dev/3';
export const DEFAULT_OMDB_URL = 'https://api.amodb.dev/omdb/';
export const DEFAULT_IMAGE_BASE_URL = 'https://img.amodb.dev/t/p/';

/** Default request timeout in milliseconds. */
export const DEFAULT_TIMEOUT_MS = 15_000;

/** Retries on HTTP 429. This is also the hard cap. */
export const MAX_RETRIES = 3;

/** Longest wait between retries, in seconds. */
export const MAX_RETRY_WAIT_SECONDS = 60;

export const USER_AGENT = `amodb-js/${VERSION}`;

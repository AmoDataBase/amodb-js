export interface AmodbErrorInit {
  /** HTTP status. 0 for failures before a response (network, timeout). */
  status: number;
  /** The `status_code` field of the error body, or null when absent. */
  statusCode?: number | null;
  /** The `status_message` field of the error body, or a short description. */
  statusMessage: string;
  /** Parsed JSON body, or the raw text when it is not JSON. */
  body?: unknown;
  cause?: unknown;
}

/** Base class for every error thrown by the client for a failed call. */
export class AmodbError extends Error {
  override name = 'AmodbError';
  /** HTTP status. 0 for failures before a response (network, timeout). */
  readonly status: number;
  /** The `status_code` field of the error body, or null when absent. */
  readonly statusCode: number | null;
  /** The `status_message` field of the error body, or a short description. */
  readonly statusMessage: string;
  /** Parsed JSON body, or the raw text when it is not JSON. Null when empty. */
  readonly body: unknown;

  constructor(init: AmodbErrorInit) {
    super(init.statusMessage, init.cause === undefined ? undefined : { cause: init.cause });
    this.status = init.status;
    this.statusCode = init.statusCode ?? null;
    this.statusMessage = init.statusMessage;
    this.body = init.body ?? null;
  }
}

export interface RateLimitErrorInit extends AmodbErrorInit {
  retryAfter?: number | null;
}

/** HTTP 429. Thrown after the last retry is used up. */
export class RateLimitError extends AmodbError {
  override name = 'RateLimitError';
  /** Seconds from the `Retry-After` header, or null when the header is missing. */
  readonly retryAfter: number | null;

  constructor(init: RateLimitErrorInit) {
    super(init);
    this.retryAfter = init.retryAfter ?? null;
  }
}

/** The request did not finish within the `timeout` option. */
export class AmodbTimeoutError extends AmodbError {
  override name = 'AmodbTimeoutError';
}

/** The request failed before a response arrived (DNS, connection reset, offline). */
export class NetworkError extends AmodbError {
  override name = 'NetworkError';
}

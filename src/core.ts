/**
 * Core primitives shared across `@adnet/sdk`: the API error type, the internal
 * request-options shape, and the abstract `Resource` base every resource group
 * extends.
 *
 * `Resource` and `RequestOptions` are exported for cross-module use within the
 * package but are intentionally NOT re-exported from the package root.
 */

import type { AdNetClient } from './client.js';

/** Thrown for any non-2xx response. */
export class AdNetApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    public readonly method: string,
    public readonly path: string,
  ) {
    super(`AdNet API ${method} ${path} -> ${status} ${statusText}`);
    this.name = 'AdNetApiError';
  }
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** When set, sends multipart/form-data instead of JSON. */
  form?: FormData;
  signal?: AbortSignal;
  /** Extra request headers (e.g. `X-CAPI-Token` for server-side conversion ingestion). */
  headers?: Record<string, string>;
  /** Parse the response as text instead of JSON (e.g. rendered HTML / app-ads.txt). */
  text?: boolean;
  /**
   * Safe-retry key for mutating calls — sent as `Idempotency-Key`. Reuse the
   * same value when retrying the SAME logical operation; the server replays the
   * original response instead of acting twice.
   */
  idempotencyKey?: string;
}

export abstract class Resource {
  protected constructor(protected readonly c: AdNetClient) {}
}

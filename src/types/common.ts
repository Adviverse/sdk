/**
 * Client configuration + generic envelope shapes shared across resources.
 *
 * These are pure type definitions (erased at build time).
 */

/* ------------------------------------------------------------------------- */
/* Client configuration                                                      */
/* ------------------------------------------------------------------------- */

export interface AdNetClientOptions {
  /** Base URL of the control-plane, e.g. `https://adviverse.com` (no trailing `/v1`). */
  baseUrl: string;
  /**
   * Ad-serving host (the engine), used by `terminal.serve()`. Defaults to
   * `https://serve.adviverse.com`. Only override for self-hosted/staging engines.
   */
  servingBaseUrl?: string;
  /** Bearer session token. Optional; can be set later via {@link AdNetClient.setToken}. */
  token?: string;
  /**
   * Scoped API key (`ak_<prefix>.<secret>`) for server-to-server / agent access,
   * sent as `x-api-key`. Takes precedence over `token`. Create one in Settings →
   * API keys with the scopes (read / write / admin) the integration needs.
   */
  apiKey?: string;
  /**
   * Optional fetch implementation override (e.g. for testing or custom agents).
   * Defaults to the global `fetch`.
   */
  fetch?: typeof fetch;
  /** Default request timeout in milliseconds. Defaults to 30000. */
  timeoutMs?: number;
}

/** Opt-in pagination for list endpoints. Omit to get the full set. */
export interface Pagination {
  limit?: number;
  offset?: number;
  [k: string]: string | number | boolean | undefined;
}

export interface Ok {
  ok: boolean;
  [k: string]: unknown;
}

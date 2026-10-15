/** Terminal (CLI status-line) self-network serving + public serve tokens. Split
 * out of `advertiser.ts` to honor the repo's 650-line cap; re-exported from
 * there so the public API is unchanged. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

/**
 * Terminal (CLI status-line) self-network serving. `serve()` fetches ONE rotated
 * ad from YOUR OWN active terminal campaigns, scoped by the API key (the key
 * needs the `terminal:serve` scope). Optional `campaignId` narrows to a single
 * campaign. Unlike the rest of the SDK this hits the ad-serving host
 * (`servingBaseUrl`, default https://serve.adviverse.com), not the API base.
 */
export interface TerminalAd {
  text?: string;
  body?: string;
  cta?: string;
  brand?: string;
  url?: string;
  short_url?: string;
  impression_url?: string;
  label?: string;
  ttl?: number;
}
/**
 * Adaptive mode-switching policy for a serve token. When armed, the engine flips
 * a given install from YOUR OWN ads to the open marketplace once that install
 * engages the pinned campaign — clicked (`flipOnClick`) or saw `flipAfter`
 * impressions. `fallbackTag` is the marketplace placement (tk_…) served post-flip
 * (must be one of your own placements); omit it to flip to a plain (ad-less)
 * status. Requires a campaign-pinned token. All decisions are server-side, so the
 * shipped daemon never changes.
 */
export interface TerminalSwitchPolicy {
  flipAfter?: number;
  flipOnClick?: boolean;
  fallbackTag?: string;
}
export interface TerminalToken {
  id: string;
  token: string;            // public 'ts_…' value — safe to ship
  campaignId?: string | null;
  name?: string | null;
  switch?: TerminalSwitchPolicy;
  createdAt?: string | null;
}
export class TerminalResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /**
   * Fetch one rotated terminal ad from YOUR OWN campaigns. Auth precedence:
   * `token` (public ts_… — safe to ship) → the client's `x-api-key` (secret).
   */
  serve(opts: { token?: string; campaignId?: string; uid?: string } = {}): Promise<TerminalAd> {
    return this.c.request('GET', '/terminal/serve', {
      baseUrl: this.c.servingBaseUrl,
      query: { token: opts.token, campaignId: opts.campaignId, uid: opts.uid },
    });
  }
  /** Mint a PUBLIC serve token (ts_…) — non-secret, serve-only, safe to embed in
   * a distributed client. Optionally pin it to one terminal campaign, and/or arm
   * adaptive mode-switching (`switch`) so the engine rotates each install between
   * your ads and the marketplace based on engagement. */
  createToken(
    body: { name?: string; campaignId?: string; switch?: TerminalSwitchPolicy } = {},
  ): Promise<TerminalToken> {
    return this.c.request('POST', '/v1/advertiser/terminal-tokens', { body });
  }
  listTokens(): Promise<TerminalToken[]> {
    return this.c.request('GET', '/v1/advertiser/terminal-tokens');
  }
  /** Arm / update / disable a token's mode-switching policy in place (same ts_
   * value keeps working). Pass an empty object (or all-zero policy) to disable. */
  setTokenPolicy(id: string, policy: TerminalSwitchPolicy): Promise<{ id: string; switch: TerminalSwitchPolicy }> {
    return this.c.request('PATCH', `/v1/advertiser/terminal-tokens/${encodeURIComponent(id)}/switch`, { body: policy });
  }
  /** Rotate a token's value (old value stops working immediately). */
  rotateToken(id: string): Promise<TerminalToken> {
    return this.c.request('POST', `/v1/advertiser/terminal-tokens/${encodeURIComponent(id)}/rotate`);
  }
  revokeToken(id: string): Promise<{ revoked: boolean }> {
    return this.c.request('DELETE', `/v1/advertiser/terminal-tokens/${encodeURIComponent(id)}`);
  }
}

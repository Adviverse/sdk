/** First-party DOOH (digital-out-of-home) screen network.
 *
 * A publisher runs the Adviverse player on physical screens; each screen is
 * billable inventory. The player pairs by showing a code the publisher claims
 * here, then pulls a loop from the ad-engine and reports proof-of-play. These map
 * onto the `/v1/dooh/*` (publisher) and `/v1/advertiser/dooh/*` routes. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

/** Venue metadata attached when a publisher claims a pending screen. */
export interface ClaimScreenRequest {
  /** The pairing code the player is displaying on the screen. */
  code: string;
  venueName?: string;
  venueType?: string;
  orientation?: 'landscape' | 'portrait';
  resolutionW?: number;
  resolutionH?: number;
  lat?: number;
  lng?: number;
  timezone?: string;
  /** Seconds each ad slot is shown. */
  loopSeconds?: number;
  floorCpm?: number;
  /** Viewers reached per play (>=1); scales the impression's price + budget cost. */
  audienceMultiplier?: number;
}

export interface UpdateScreenRequest {
  venueName?: string;
  venueType?: string;
  orientation?: 'landscape' | 'portrait';
  loopSeconds?: number;
  floorCpm?: number;
  audienceMultiplier?: number;
}

/** A DOOH screen (with live `online` derived from its heartbeat). */
export interface DoohScreen {
  id: string;
  placement_id: string | null;
  venue_name: string | null;
  venue_type: string | null;
  orientation: string | null;
  resolution_w: number | null;
  resolution_h: number | null;
  loop_seconds: number;
  audience_multiplier: number;
  status: string;
  tag_key?: string | null;
  online?: boolean;
  last_heartbeat_at: string | null;
  player_version: string | null;
  created_at: string;
  [k: string]: unknown;
}

/** One proof-of-play row + the report summary. */
export interface DoohPlayReport {
  summary: { plays: number; completed: number; completion_rate: number; spend: number; screens: number };
  rows: Array<{
    request_id: string;
    screen_id: string | null;
    campaign_id: string | null;
    creative_id: string | null;
    played_at: string | null;
    duration_ms: number | null;
    completed: boolean;
    screenshot_url: string | null;
    price_paid: number | null;
    currency: string | null;
    venue_name?: string | null;
  }>;
}

/**
 * First-party DOOH screen management + proof-of-play verification. Pairing itself
 * is player-initiated (public); this resource is the publisher/advertiser side.
 */
export class DoohResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }

  /** Claim a pending screen by the code it is displaying (attaches venue + activates). */
  claimScreen(req: ClaimScreenRequest): Promise<DoohScreen> {
    return this.c.request('POST', '/v1/dooh/screens/claim', { body: req });
  }

  /** The caller's screen fleet, each with a live online flag. */
  listScreens(): Promise<DoohScreen[]> {
    return this.c.request('GET', '/v1/dooh/screens');
  }

  getScreen(id: string): Promise<DoohScreen> {
    return this.c.request('GET', `/v1/dooh/screens/${encodeURIComponent(id)}`);
  }

  updateScreen(id: string, req: UpdateScreenRequest): Promise<DoohScreen> {
    return this.c.request('PATCH', `/v1/dooh/screens/${encodeURIComponent(id)}`, { body: req });
  }

  setScreenStatus(id: string, status: 'active' | 'paused'): Promise<{ status: string }> {
    return this.c.request('POST', `/v1/dooh/screens/${encodeURIComponent(id)}/status`, { body: { status } });
  }

  /** Publisher proof-of-play earnings report. */
  plays(params?: { from?: string; to?: string }): Promise<DoohPlayReport> {
    return this.c.request('GET', '/v1/dooh/plays', { query: params });
  }

  /** Advertiser proof-of-play VERIFICATION report (prove ads ran on real screens). */
  advertiserPlays(params?: { from?: string; to?: string }): Promise<DoohPlayReport> {
    return this.c.request('GET', '/v1/advertiser/dooh/plays', { query: params });
  }
}

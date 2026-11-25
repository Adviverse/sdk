/** Pixel + conversion ingestion (CAPI, server-side tracking) and identity
 * resolution. Re-exported from `advertiser.ts`. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type {
  PixelInfo,
  CapiEvent,
} from '../types.js';

/** The account pixel (Meta-Pixel-style event tag). */
export class PixelResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** List all pixels on the account (an agency keeps one per client). */
  list(): Promise<PixelInfo[]> {
    return this.c.request('GET', '/v1/advertiser/pixels');
  }
  /** Create a new pixel. */
  create(name?: string): Promise<PixelInfo> {
    return this.c.request('POST', '/v1/advertiser/pixels', { body: { name } });
  }
  /** Delete a pixel (an account always keeps at least one). */
  delete(id: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `/v1/advertiser/pixels/${encodeURIComponent(id)}`);
  }
  /** Get one pixel (the given pixelId, else the account's primary). */
  get(pixelId?: string): Promise<PixelInfo> {
    return this.c.request('GET', '/v1/advertiser/pixel', { query: pixelId ? { pixelId } : undefined });
  }
  /** Per-event activity totals (count/users/value) over the last `days`. */
  events(days = 30, pixelId?: string): Promise<Array<{ event: string; events: number; users: number; value: number }>> {
    return this.c.request('GET', '/v1/advertiser/pixel/events', { query: { days, ...(pixelId ? { pixelId } : {}) } });
  }
  /** Funnel + conversions/revenue/spend/ROAS summary + daily trend over the last `days`. */
  insights(days = 30, pixelId?: string): Promise<{
    summary: { events: number; conversions: number; revenue: number; spend: number; roas: number };
    funnel: Array<{ event: string; users: number }>;
    daily: Array<{ date: string; events: number; conversions: number; revenue: number }>;
  }> {
    return this.c.request('GET', '/v1/advertiser/pixel/insights', { query: { days, ...(pixelId ? { pixelId } : {}) } });
  }
  /**
   * Closed-loop source attribution over the last `days`: visitors, checkouts,
   * sales closed (conversions), abandoned (reached checkout but didn't buy),
   * revenue and conversion rate broken down by traffic source + UTM campaign.
   */
  attribution(days = 30, pixelId?: string): Promise<{
    sources: Array<{
      source: string; medium: string; campaign: string;
      visitors: number; checkouts: number; conversions: number; lost: number;
      abandoned: number; revenue: number; lostValue: number; convRate: number;
    }>;
    totals: { visitors: number; checkouts: number; conversions: number; lost: number; abandoned: number; revenue: number; lostValue: number; convRate: number };
    lostReasons: Array<{ reason: string; count: number; value: number }>;
    byFirstTouch: Array<{ source: string; visitors: number; conversions: number; revenue: number }>;
  }> {
    return this.c.request('GET', '/v1/advertiser/pixel/attribution', { query: { days, ...(pixelId ? { pixelId } : {}) } });
  }
  /**
   * Product/content-level analytics over the last `days`: distinct users who
   * viewed / added-to-cart / purchased / lost each product (by content_id) and
   * the revenue (and lost would-be revenue) it drove.
   */
  products(days = 30, pixelId?: string): Promise<Array<{
    productId: string; viewed: number; addedToCart: number;
    purchased: number; lost: number; revenue: number; lostValue: number;
  }>> {
    return this.c.request('GET', '/v1/advertiser/pixel/products', { query: { days, ...(pixelId ? { pixelId } : {}) } });
  }
  /**
   * Toggle real-time, action-based audiences. When on, pixel events update rule
   * audiences instantly (and an `assign: '<key>'` param on an event drops the user
   * into that audience, creating it if new) instead of waiting for the batch.
   */
  setRealtime(enabled: boolean, pixelId?: string): Promise<{ realtimeAudiences: boolean }> {
    return this.c.request('POST', '/v1/advertiser/pixel/realtime', { body: { enabled, ...(pixelId ? { pixelId } : {}) } });
  }
  /** Update per-pixel configuration: name, default consent mode, allowed domains. */
  updateSettings(body: { pixelId?: string; name?: string; defaultConsent?: boolean; allowedDomains?: string[] }): Promise<PixelInfo> {
    return this.c.request('POST', '/v1/advertiser/pixel/settings', { body });
  }
  /** Look up a user's CDP trait profile by canonical id / cookie uid / email. */
  traits(user: string, pixelId?: string): Promise<{ canonical: string; traits: Record<string, string> }> {
    return this.c.request('GET', '/v1/advertiser/pixel/traits', { query: { user, ...(pixelId ? { pixelId } : {}) } });
  }
}

/** Conversion API (server-to-server conversion ingestion). */
export class CapiResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Generate/rotate the CAPI access token (revokes the previous one). */
  rotateToken(): Promise<{ token: string; [k: string]: unknown }> {
    return this.c.request('POST', '/v1/capi/token');
  }
  /** Recent CAPI events received. */
  events(limit?: number): Promise<unknown[]> {
    return this.c.request('GET', '/v1/capi/events', { query: { limit } });
  }
  /** Ingest server-side conversions. Auth is the CAPI token (NOT the session/API key). */
  send(capiToken: string, events: CapiEvent[]): Promise<{ results: unknown[] }> {
    return this.c.request('POST', '/v1/capi/events', { body: { events }, headers: { 'X-CAPI-Token': capiToken } });
  }
}

/** Public ingestion endpoints (no auth) — server-side conversion / event tracking. */
export class TrackResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Record a conversion by click id (advertiser postback / S2S). */
  conversion(body: { clickId?: string; click_id?: string; value?: number; postbackId?: string; postback_id?: string; orderId?: string; orderValue?: number; payout?: number; revenue?: number }): Promise<unknown> {
    return this.c.request('POST', '/v1/track/conversion', { body });
  }
  /** Ingest a pixel event server-side (same payload the pixel.js library sends). */
  event(body: Record<string, unknown>): Promise<unknown> {
    return this.c.request('POST', '/v1/track/event', { body });
  }
  /**
   * Set user traits (CDP profile attributes) for a person, e.g. { plan:'pro', ltv:540 }.
   * Identify the user via `am` (hashed email/phone) for server-side calls; when a
   * pixel has real-time audiences on, trait-based rule audiences re-evaluate live.
   */
  traits(body: { pixelId: string; traits: Record<string, string | number>; am?: { em?: string; ph?: string } }): Promise<{ status: string; traits?: number }> {
    return this.c.request('POST', '/v1/track/trait', { body });
  }
}

/** Cross-device / cross-channel identity resolution (advertiser). */
export class IdentityResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  resolve(body: { email?: string; phone?: string; cookieId?: string; deviceId?: string }): Promise<unknown> {
    return this.c.request('POST', '/v1/identity/resolve', { body });
  }
  link(body: { canonicalId: string; signals: Array<{ type: string; value: string }> }): Promise<unknown> {
    return this.c.request('POST', '/v1/identity/link', { body });
  }
  setConsent(body: { canonicalId: string; state: 'granted' | 'denied' }): Promise<unknown> {
    return this.c.request('POST', '/v1/identity/consent', { body });
  }
  stats(): Promise<unknown> {
    return this.c.request('GET', '/v1/identity/stats');
  }
  get(canonicalId: string): Promise<unknown> {
    return this.c.request('GET', `/v1/identity/${encodeURIComponent(canonicalId)}`);
  }
}

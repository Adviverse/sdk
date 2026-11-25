/** Offerwall: publishers list CPA offers their users complete to earn the
 * publisher's virtual currency (`/v1/publisher/offerwalls*`), and advertisers
 * opt CPA campaigns in (`/v1/advertiser/campaigns/:id/offerwall`).
 *
 * Callback verification (publisher server): recompute
 * hex HMAC-SHA256(callbackSecret, `${transaction_id}:${user_id}:${offer_id}:${payout}:${currency_amount}`)
 * over the exact query strings, compare with `sig`, credit once per transaction_id. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export interface OfferwallInput {
  /** e.g. "Gems". */
  currencyName?: string;
  /** Currency units credited per USD of publisher payout. */
  exchangeRate?: number;
  iconUrl?: string;
  /** https endpoint that receives the signed S2S callback. */
  callbackUrl?: string;
  /** Max completions per user per offer (default 1). */
  userCap?: number;
}

export interface Offerwall {
  placementId: string;
  propertyId: string;
  propertyName: string | null;
  tagKey: string;
  status: 'active' | 'paused';
  revShare: number;
  currencyName: string;
  exchangeRate: number;
  iconUrl: string | null;
  userCap: number;
  callbackUrl: string | null;
  /** Open in an iframe / in-app webview; replace {USER_ID}. */
  hostedUrl: string;
  createdAt: string;
}

export interface OfferwallCompletion {
  id: string;
  transaction_id: string;
  campaign_id: string;
  user_id: string;
  payout: number;
  currency_amount: number;
  status: 'pending' | 'delivered' | 'failed' | 'no_callback';
  attempts: number;
  last_status_code: number | null;
  last_error: string | null;
  next_attempt_at: string;
  delivered_at: string | null;
  created_at: string;
}

export interface OfferwallEarnings {
  placement_id: string;
  completions: number;
  earned: number;
  currency_awarded: number;
  delivered: number;
  failed: number;
}

export interface OfferwallOptIn {
  enabled: boolean;
  instructions: string | null;
  eligible: boolean;
  reason: string | null;
}

const BASE = '/v1/publisher/offerwalls';

export class OfferwallResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(): Promise<Offerwall[]> {
    return this.c.request('GET', BASE);
  }
  /** Create the property's wall. `callbackSecret` is returned only here (and on rotate). */
  create(body: OfferwallInput & { propertyId: string }): Promise<Offerwall & { callbackSecret: string }> {
    return this.c.request('POST', BASE, { body });
  }
  update(placementId: string, body: OfferwallInput & { status?: 'active' | 'paused' }): Promise<Offerwall> {
    return this.c.request('PATCH', `${BASE}/${encodeURIComponent(placementId)}`, { body });
  }
  rotateSecret(placementId: string): Promise<{ callbackSecret: string }> {
    return this.c.request('POST', `${BASE}/${encodeURIComponent(placementId)}/rotate-secret`);
  }
  /** Delivery log, newest first. */
  completions(placementId: string, limit?: number): Promise<OfferwallCompletion[]> {
    return this.c.request('GET', `${BASE}/${encodeURIComponent(placementId)}/completions`, limit ? { query: { limit } } : undefined);
  }
  retryCallback(completionId: string): Promise<{ queued: boolean }> {
    return this.c.request('POST', `${BASE}/completions/${encodeURIComponent(completionId)}/retry`);
  }
  earnings(days?: number): Promise<OfferwallEarnings[]> {
    return this.c.request('GET', `${BASE}/earnings`, days ? { query: { days } } : undefined);
  }
  /** Advertiser: is this CPA campaign shown in offerwalls? */
  getOptIn(campaignId: string): Promise<OfferwallOptIn> {
    return this.c.request('GET', `/v1/advertiser/campaigns/${encodeURIComponent(campaignId)}/offerwall`);
  }
  setOptIn(campaignId: string, body: { enabled: boolean; instructions?: string }): Promise<OfferwallOptIn> {
    return this.c.request('PUT', `/v1/advertiser/campaigns/${encodeURIComponent(campaignId)}/offerwall`, { body });
  }
}

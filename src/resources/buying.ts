/** Advertiser buying tools: pre-creation bid suggestion and per-placement
 * performance (the source for placement allow/block lists and custom bids). */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export type BidModel = 'cpm' | 'cpc' | 'cpa' | 'cpi';

export interface BidSuggestion {
  format: string;
  geo: string[];
  device: string[];
  model: BidModel;
  /** Valid won impressions the suggestion is based on (0 = floors only). */
  samples: number;
  min: number;
  recommended: number;
  top: number;
  floorCpm: number;
  /** observed = real CTR/CVR; default = engine defaults (1% CTR, 5% CVR); n/a for CPM. */
  rateSource: 'observed' | 'default' | 'n/a';
  note: string;
}

export interface PlacementPerformanceRow {
  placementId: string;
  format: string | null;
  domain: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  /** Percent, 0-100. */
  ctr: number;
  ecpa: number | null;
  ecpm: number;
  status: 'allowed' | 'blocked' | 'default';
  /** Custom bid multiplier (bid_modifiers.placement), null when none. */
  bidMultiplier: number | null;
}

export interface PlacementPerformance {
  campaignId: string;
  days: number;
  baseBid: number;
  pricingModel: string;
  whitelist: string[];
  blacklist: string[];
  placements: PlacementPerformanceRow[];
}

export class BuyingResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Min / recommended / top bids for a draft campaign. `geo` / `device` are lists. */
  bidSuggestion(q: { format: string; geo?: string[]; device?: string[]; model?: BidModel }): Promise<BidSuggestion> {
    return this.c.request('GET', '/v1/advertiser/insights/bid-suggestion', {
      query: { format: q.format, geo: q.geo?.join(','), device: q.device?.join(','), model: q.model },
    });
  }
  /** Per-placement stats for a campaign over `days` (1-90, default 30). Block/allow
   * via campaigns.update(id, { targeting: { placementBlacklist | placementWhitelist } });
   * set a custom bid via campaigns.update(id, { bidModifiers: { placement: { <id>: multiplier } } }). */
  placementPerformance(campaignId: string, days?: number): Promise<PlacementPerformance> {
    return this.c.request('GET', `/v1/advertiser/campaigns/${encodeURIComponent(campaignId)}/placement-performance`, {
      query: { days },
    });
  }
}

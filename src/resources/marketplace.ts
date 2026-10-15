/** Retail-media resource groups: the marketplace product catalog and seller
 * "promote products" campaigns (sponsored products in search). A thin
 * specialization of the campaign lifecycle — see the retail-media program
 * design spec. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type {
  Ok,
  MarketplaceCatalogItem,
  UpsertMarketplaceCatalogRequest,
  MarketplaceCatalogUpsertResult,
  MarketplaceCatalogRecord,
  CreatePromoteCampaignRequest,
  PromoteCampaign,
} from '../types.js';

/** Register (or update) a scheduled catalog feed. */
export interface RegisterCatalogFeedRequest {
  /** A hosted JSON/CSV catalog URL we re-fetch on a schedule. */
  feedUrl: string;
  /** Refresh cadence in minutes (min 15, default 360). */
  intervalMinutes?: number;
}

/** A registered scheduled catalog feed. */
export interface CatalogFeed {
  id: string;
  feed_url: string;
  interval_minutes: number;
  status: string;
  /** Last sync attempt (also gates the schedule); null until first run. */
  last_synced_at?: string | null;
  /** Last failure message, cleared after a successful sync. */
  last_error?: string | null;
  created_at?: string;
  [k: string]: unknown;
}

/**
 * The marketplace's canonical, multi-seller product catalog. SKUs are ingested
 * via a bulk upsert (keyed by `external_id`) and become eligible to be promoted
 * as sponsored products in search.
 */
export class MarketplaceCatalogResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** Bulk upsert catalog items (create or update by `external_id`). */
  upsert(items: MarketplaceCatalogItem[]): Promise<MarketplaceCatalogUpsertResult> {
    const body: UpsertMarketplaceCatalogRequest = { items };
    return this.c.request('POST', '/v1/advertiser/marketplace-catalog', { body });
  }
  /** The catalog items the account has uploaded. */
  list(): Promise<MarketplaceCatalogRecord[]> {
    return this.c.request('GET', '/v1/advertiser/marketplace-catalog');
  }

  /**
   * Register (or update) a hosted catalog feed URL that we re-fetch on a schedule
   * (SSRF-guarded pull → the same upsert path). Re-registering the same URL updates
   * its interval and re-activates it.
   */
  registerFeed(input: RegisterCatalogFeedRequest): Promise<CatalogFeed> {
    return this.c.request('POST', '/v1/advertiser/catalog-feeds', { body: input });
  }

  /** The scheduled catalog feeds the account has registered. */
  listFeeds(): Promise<CatalogFeed[]> {
    return this.c.request('GET', '/v1/advertiser/catalog-feeds');
  }

  /** Remove a registered feed (stops its scheduled refresh). */
  removeFeed(id: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `/v1/advertiser/catalog-feeds/${encodeURIComponent(id)}`);
  }
}

/**
 * Seller "promote products" campaigns — a thin retail-media specialization of
 * the campaign lifecycle. Prices CPC (max cost-per-click) or CPA (per-checkout)
 * over a selection of catalog items, and reuses the standard submit / status
 * moderation flow.
 */
export class PromoteCampaignsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  create(body: CreatePromoteCampaignRequest): Promise<PromoteCampaign> {
    return this.c.request('POST', '/v1/advertiser/promote-campaigns', { body });
  }
  list(): Promise<PromoteCampaign[]> {
    return this.c.request('GET', '/v1/advertiser/promote-campaigns');
  }
  /** Submit a promote campaign for review. */
  submit(id: string): Promise<Ok> {
    return this.c.request('POST', `/v1/advertiser/promote-campaigns/${encodeURIComponent(id)}/submit`);
  }
  /** Set a promote campaign's status (e.g. active, paused). */
  setStatus(id: string, status: string): Promise<Ok> {
    return this.c.request('POST', `/v1/advertiser/promote-campaigns/${encodeURIComponent(id)}/status`, {
      body: { status },
    });
  }
}

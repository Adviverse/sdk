/**
 * Campaign + automation-rule request/response shapes.
 */

import type { Campaign } from '../shared';

/** A campaign group — the umbrella over one or more ad sets (campaigns). */
export interface CampaignGroup {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | string;
  objective?: string | null;
  adSets?: Campaign[];
  spent_total?: number;
  [k: string]: unknown;
}

export interface CreateCampaignRequest {
  name: string;
  /** Parent campaign group ("Campaign" umbrella); omit for a standalone ad set. */
  groupId?: string;
  format?: Campaign['format'];
  pricingModel?: Campaign['pricing_model'];
  bidAmount?: number;
  budgetDaily?: number;
  budgetTotal?: number;
  pacing?: Campaign['pacing'];
  startAt?: string;
  endAt?: string;
  timezone?: string;
  currency?: string;
  dealType?: string;
  targeting?: Campaign['targeting'];
  brandSafety?: Record<string, unknown>;
  bidModifiers?: Record<string, unknown>;
  conversion?: Record<string, unknown>;
  houseAd?: boolean;
  /** Default true: a house/backfill-tier campaign also runs on every placement this account publishes, even if absent from its placement whitelist. */
  autoOwnPlacements?: boolean;
  /** Default true: smart routing weights delivery toward sites where similar ads perform well; false = pure targeting. */
  networkExpansion?: boolean;
  deliveryGoal?: number;
  goalType?: 'impressions' | 'clicks';
  targetCpa?: number;
  targetRoas?: number;
  holdoutPct?: number;
  skanAppStoreId?: string;
  skanSourceId?: string;
  /**
   * Advertiser-side UTM passthrough — appended to the landing URL so the
   * advertiser's OWN analytics (GA4, Shopify, …) credit Adviverse-driven
   * traffic. Omit for the default (enabled; auto source=adviverse,
   * medium=<format>, campaign=<campaign id>). Set fields to override, or
   * `{ enabled: false }` to disable. Independent of our adclid attribution.
   */
  utm?: UtmConfig;
}

export interface UtmConfig {
  enabled?: boolean;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

/**
 * Retail-media (sponsored products) request/response shapes.
 */

/** One item in a marketplace catalog bulk upsert (a multi-seller SKU record). */
export interface MarketplaceCatalogItem {
  /** The marketplace's own SKU / item id (upsert key). */
  external_id: string;
  title: string;
  description?: string;
  image_url?: string;
  price?: number;
  currency?: string;
  landing_url?: string;
  brand?: string;
  category?: string;
  keywords?: string[];
  availability?: string;
}

/** Body of a catalog bulk upsert. */
export interface UpsertMarketplaceCatalogRequest {
  items: MarketplaceCatalogItem[];
}

/** Result of a catalog bulk upsert. */
export interface MarketplaceCatalogUpsertResult {
  upserted?: number;
  [k: string]: unknown;
}

/** A catalog item as stored / returned by the API. */
export interface MarketplaceCatalogRecord extends MarketplaceCatalogItem {
  item_id?: string;
  seller_account_id?: string;
  updated_at?: string;
  [k: string]: unknown;
}

/** Selects which catalog items a promote campaign covers (one of the shapes). */
export type PromoteItemSelector =
  | { item_ids: string[] }
  | { keywords: string[] }
  | { all: boolean };

/** Body to create a seller "promote products" campaign. */
export interface CreatePromoteCampaignRequest {
  name: string;
  pricingModel?: 'cpc' | 'cpa';
  /** Max CPC, or the flat CPA rate. Required unless `cpaMode: 'percent'`. */
  bidAmount?: number;
  /** CPA basis (`pricingModel: 'cpa'` only): `'flat'` bills `bidAmount`, `'percent'` bills `cpaPercent × order`. Default `'flat'`. */
  cpaMode?: 'flat' | 'percent';
  /** Fraction of order value billed per checkout when `cpaMode: 'percent'` (0–1, e.g. 0.15 = 15%). */
  cpaPercent?: number;
  /** Anti-fraud floor: checkouts below this order value never bill. 0 = no floor. */
  minOrderValue?: number;
  budgetDaily?: number;
  budgetTotal?: number;
  pacing?: string;
  currency?: string;
  itemSelector: PromoteItemSelector;
  targeting?: Record<string, unknown>;
}

/** A seller "promote products" campaign (retail-media specialization). */
export interface PromoteCampaign {
  id: string;
  name: string;
  pricing_model: 'cpc' | 'cpa' | string;
  bid_amount?: number;
  cpa_mode?: 'flat' | 'percent' | string;
  cpa_percent?: number;
  min_order_value?: number;
  budget_daily?: number | null;
  budget_total?: number | null;
  pacing?: string | null;
  currency?: string | null;
  item_selector?: PromoteItemSelector | Record<string, unknown>;
  targeting?: Record<string, unknown> | null;
  status?: string;
  [k: string]: unknown;
}

export interface CreateAutomationRuleRequest {
  name?: string;
  scope?: 'campaign' | 'all';
  targetId?: string;
  metric?: 'cpa' | 'ctr' | 'spend' | 'conversions' | 'fill_rate' | string;
  operator?: 'gt' | 'lt';
  threshold?: number;
  windowHours?: number;
  action?: 'pause' | 'resume' | 'notify' | 'adjust_bid' | string;
  actionValue?: number;
  enabled?: boolean;
}

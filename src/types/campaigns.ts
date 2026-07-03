/**
 * Campaign + automation-rule request/response shapes.
 */

import type { Campaign } from '../shared';

export interface CreateCampaignRequest {
  name: string;
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

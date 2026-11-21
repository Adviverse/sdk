/**
 * Publisher-side shapes: properties, placements, combos, deals, consent,
 * seller listings, and app/CTV inventory.
 */

import type { Placement, Property } from '../shared';

export interface CreatePropertyRequest {
  domain: string;
  /** website | cli | mobile_app | ctv (defaults to website). */
  kind?: string;
  category?: number;
  verificationMethod?: Property['verification_method'];
  /** Friendly display name (optional; falls back to the domain/slug). */
  name?: string;
}

/** Send exactly one of `propertyId` / `appId` (an app id from `apps.list()` is a property id). */
export interface CreatePlacementRequest {
  propertyId?: string;
  /** Alias of propertyId for mobile/CTV apps; apps only accept app formats (no popunder/social_bar/in_page_push). */
  appId?: string;
  name: string;
  format: Placement['format'];
  width?: number;
  height?: number;
  floorCpm?: number;
  revShare?: number;
  auctionType?: string;
  passbackUrl?: string;
  frequencyCap?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  /** Personal Network: serve only the owner's house ads from this placement. */
  houseOnly?: boolean;
  houseShare?: number;
  houseBackfill?: boolean;
  floorFallback?: boolean;
  /**
   * Responsive / multi-size: one placement + one tag serves whatever creative
   * size fits the slot's rendered container (width/height become optional).
   * Banner format only.
   */
  responsive?: boolean;
}

/** Editable placement fields (propertyId/format/dimensions are fixed at creation). */
export interface UpdatePlacementRequest {
  name?: string;
  floorCpm?: number;
  revShare?: number;
  auctionType?: string;
  passbackUrl?: string;
  status?: string;
  houseOnly?: boolean;
  houseShare?: number;
  houseBackfill?: boolean;
  floorFallback?: boolean;
  /** Opt the placement into automatic (yield-optimizer-managed) floors. When
   * true the dynamic-floor job manages floorCpm + floorSoft from recent
   * clearing prices; when false you stay in full manual control. */
  floorAuto?: boolean;
  /** Soft reserve the engine reads alongside the hard floorCpm. */
  floorSoft?: number;
  /** Per-visitor cap { impressions, windowSeconds }; {} or null removes it. */
  frequencyCap?: { impressions?: number; windowSeconds?: number } | null;
  /** Auto-ads tuning for a responsive banner placement (stored at settings.auto_ads;
   * omitted keys get defaults). null clears it. Applied to live pages within ~5 min. */
  autoAds?: Partial<AutoAdsSettings> | null;
}

/** settings.auto_ads — read by the SDK for `data-auto-ads` / adviverse.autoAds(); wins over data-max. */
export interface AutoAdsSettings {
  /** false = never insert auto ads (default true). */
  enabled: boolean;
  /** Max slots per page, 1-10 (default 3). */
  max: number;
  /** Paragraphs between ads, 2-12 (default 4). */
  every: number;
  /** Only paragraphs longer than this many characters count, 0-2000 (default 60). */
  min_paragraph_chars: number;
  /** Paths where auto ads never run; `*` is a wildcard, e.g. "/checkout*". */
  exclude_paths: string[];
  /** CSS selectors for the content container (default: article, main, [role=main], …). */
  selectors?: string[];
}

/** One placement provisioned as part of a combo / layout preset. */
export interface ComboUnit {
  format: string;
  label: string;
  width?: number;
  height?: number;
  position?: string;
}

/** A named combo / layout preset (static catalog). */
export interface ComboPreset {
  key: string;
  label: string;
  description: string;
  units: ComboUnit[];
}

/** One custom ad unit (format) to bundle into a combo. */
export interface ComboUnitInput {
  format: string;
  label?: string;
  width?: number;
  height?: number;
}

/**
 * Body for creating a combo. Provide EITHER a `presetKey` (a named catalog
 * preset) OR a custom `units` array (your own mix of ad formats). The shared
 * yield/auction settings apply to every unit.
 */
export interface CreateComboRequest {
  presetKey?: string;
  units?: ComboUnitInput[];
  /** Override the combo label (defaults to the preset label, or "Combo"). */
  namePrefix?: string;
  floorCpm?: number;
  revShare?: number;
  auctionType?: string;
  passbackUrl?: string;
  houseOnly?: boolean;
  houseShare?: number;
  houseBackfill?: boolean;
  floorFallback?: boolean;
}

/** Result of provisioning a combo: the group + one combined embed snippet. */
export interface ComboResult {
  comboId: string;
  /** The source preset key, or "" for a custom-units combo. */
  presetKey: string;
  label: string;
  placements: Placement[];
  /** The combined embed block — paste once before `</body>`. */
  snippet: string;
  /** Non-blocking advisories (e.g. duplicate popunder). */
  warnings: string[];
}

/** A property's combos, each with its combined embed snippet. */
export interface ComboList {
  combos: Array<{
    comboId: string;
    label: string;
    placements: Placement[];
    snippet: string;
  }>;
}

/** Per-placement publisher rollup (earnings + fill + viewability). */
export interface PublisherPlacementRow {
  placement_id: string;
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  rpm: number;
  ecpm: number;
  requests: number;
  filled: number;
  fill_rate: number;
  /** Fills from paid demand (excludes house/self-promo), and its % of requests. */
  paid_filled: number;
  paid_fill_rate: number;
  measurable: number;
  viewable: number;
  viewable_rate: number;
  /** Viewable impressions that reported layout shift (browsers with the API). */
  cls_measured: number;
  /** Mean layout shift this slot caused per measured impression. */
  cls_avg: number;
  /** Share (0..1) of measured impressions with CLS > 0.1. */
  cls_poor_rate: number;
}

/** Publisher fill summary (GET /v1/reporting/publisher/fill). Rates are %. */
export interface PublisherFillReport {
  requests: number;
  filled: number;
  fill_rate: number;
  /** Fills from paid demand (excludes house/self-promo). */
  paid_filled: number;
  paid_fill_rate: number;
  /** No-fill counts by reason. */
  nofill: Record<string, number>;
}

export interface Deal {
  id: string;
  deal_code: string;
  name: string;
  /** Null while a deal is "open" (created with a claim link, not yet claimed). */
  advertiser_id: string | null;
  publisher_id: string;
  placement_id?: string | null;
  deal_type: string;
  floor_cpm: number;
  currency: string;
  status: string;
  /** Present on an unclaimed open deal — the token in its shareable claim link. */
  claim_token?: string | null;
  created_at: string;
}

export interface CreateDealRequest {
  name: string;
  publisher_id?: string;
  /** Omit to create an "open" deal — the response carries a `claim_token` to share. */
  advertiser_id?: string;
  placement_id?: string;
  deal_type?: string;
  floor_cpm?: number;
  currency?: string;
}

/** Result of resolving an advertiser by email (for targeting a deal). */
export interface AdvertiserLookup {
  id: string;
  email: string;
  name?: string | null;
}

/** Preview of an open deal shown before an advertiser claims it via its link. */
export interface DealClaimPreview {
  id: string;
  deal_code: string;
  name: string;
  deal_type: string;
  floor_cpm: number;
  currency: string;
  status: string;
  publisher_name?: string | null;
  /** True when the deal is still unclaimed and can be accepted. */
  claimable: boolean;
}

/** A publisher's consent configuration (CMP framework + snippet behavior). */
export interface ConsentConfig {
  publisherId: string;
  /** The property (domain) this config applies to; null = account-wide default. */
  propertyId?: string | null;
  mode: 'tcf_v2' | 'gpp' | 'custom' | string;
  defaultConsent: boolean;
  /** Honor the GPC browser flag as an explicit opt-out. */
  honorGpc?: boolean;
  /** Which CMP signals the generated snippet reads & forwards. */
  collectTcf?: boolean;
  collectGpp?: boolean;
  collectGpc?: boolean;
  /** Re-send the signal when the user changes their consent. */
  resendOnChange?: boolean;
  /** Custom-CMP bridge: where the snippet reads the ads decision. */
  consentSource?: 'tcf' | 'gpp' | 'cookie' | 'global' | string;
  /** Cookie name (source=cookie) or JS global path (source=global). */
  consentKey?: string | null;
  /** The value that means "ads allowed" for cookie/global sources. */
  consentGrantValue?: string | null;
  /** TCF purpose required for ads (default 1 = storage). */
  tcfPurpose?: number;
  /** Our IAB vendor id to require in the TCF string (optional). */
  tcfVendorId?: number | null;
  /** Ads always load: unanswered/rejected visitors get contextual ads (no identifier); personalized still waits for consent. */
  contextualWithoutConsent?: boolean;
  /** Enhanced frequency capping: outside the EEA/UK (no GPC/opt-out), contextual caps add browser signals + an SDK canvas hash. Off = IP + UA only, stricter traffic rules. */
  enhancedCapping?: boolean;
}

export interface SaveConsentConfigRequest {
  /** Property (domain) to save this config for; omit for the account-wide default. */
  propertyId?: string;
  mode: 'tcf_v2' | 'gpp' | 'custom' | string;
  defaultConsent: boolean;
  honorGpc?: boolean;
  collectTcf?: boolean;
  collectGpp?: boolean;
  collectGpc?: boolean;
  resendOnChange?: boolean;
  consentSource?: 'tcf' | 'gpp' | 'cookie' | 'global' | string;
  consentKey?: string;
  consentGrantValue?: string;
  tcfPurpose?: number;
  tcfVendorId?: number;
  /** Ads always load: unanswered/rejected visitors get contextual ads (no identifier). */
  contextualWithoutConsent?: boolean;
  /** Enhanced frequency capping outside the EEA/UK (declare it in your privacy policy). */
  enhancedCapping?: boolean;
}

/** A publisher's public sellers.json listing preference. When `sellerPublic` is
 * false the seller is listed confidentially (name/domain withheld). */
export interface SellerListing {
  sellerPublic: boolean;
  sellerDomain?: string | null;
}

export interface SaveSellerListingRequest {
  sellerPublic: boolean;
  /** Optional declared seller domain (hostname-ish; scheme/path are stripped). */
  sellerDomain?: string;
}

/** One recorded consent signal, attributed to the publisher's snippet. */
export interface ConsentLogEntry {
  created_at: string;
  mode?: string | null;
  tcf_string?: string | null;
  gpp_string?: string | null;
  gpc?: boolean | null;
}

export interface CreateAppRequest {
  kind: 'mobile_app' | 'ctv';
  name: string;
  bundleId: string;
  platform: string;
  storeUrl?: string;
  appStoreId?: string;
  category?: number;
  ctvMeta?: Record<string, unknown>;
  /** One of your website properties; its /app-ads.txt verifies the app. */
  developerPropertyId?: string;
}

/** One app-ads.txt authorized-seller entry on an app. */
export interface AppAdsTxtEntry {
  domain: string;
  sellerId: string;
  relationship?: 'DIRECT' | 'RESELLER';
  certId?: string;
}

export interface UpdateAppRequest {
  appAdsTxt?: AppAdsTxtEntry[];
  skadnetworkIds?: string[];
  ctvMeta?: Record<string, unknown>;
  storeUrl?: string;
  platform?: string;
  /** One of your website properties; null unlinks it. */
  developerPropertyId?: string | null;
}

/** A mobile-app / CTV app: a `properties` row of kind mobile_app | ctv (all columns returned). */
export interface App {
  id: string;
  publisher_id: string;
  kind: 'mobile_app' | 'ctv';
  name: string | null;
  /** Holds the bundle id for apps. */
  domain: string;
  bundle_id: string | null;
  store_url: string | null;
  platform: string | null;
  app_store_id: string | null;
  category: number | null;
  app_ads_txt: AppAdsTxtEntry[];
  skadnetwork_ids: string[];
  ctv_meta: Record<string, unknown>;
  developer_property_id: string | null;
  verification_method: string | null;
  verification_token: string;
  verification_status: 'unverified' | 'pending' | 'verified';
  status: 'pending' | 'approved' | 'rejected' | string;
  verified_at?: string | null;
  created_at: string;
  updated_at?: string;
  [k: string]: unknown;
}

/** One site niche (IAB Content Taxonomy v1 tier-1) — GET /v1/site-niches. */
export interface SiteNiche {
  id: number;
  code: string;
  name: string;
}

/** Result of POST /v1/publisher/properties/{id}/classify. */
export interface NicheClassification {
  category: number | null;
  categories: { id: number; score: number }[];
  error: string | null;
  pages: number;
}

/** A row of the trust audit log — GET /v1/admin/trust-events. */
export interface TrustEvent {
  id: string;
  property_id: string;
  domain: string;
  name: string | null;
  from_tier: 'unverified' | 'trusted';
  to_tier: 'unverified' | 'trusted';
  reason: 'auto_promote' | 'auto_demote_ivt' | 'domain_changed' | 'admin_override';
  actor_id: string | null;
  metrics: Record<string, unknown>;
  created_at: string;
}

// Domain types inlined from the internal @adnet/shared workspace package
// so the published @adviverse/sdk is fully self-contained.

/**
 * @adnet/shared — canonical domain types and enums shared across the AdNet
 * platform (dashboard frontend, control-plane, and as documentation for the Go
 * services). These mirror the Postgres schema in infra/postgres/migrations.
 *
 * Consumed by the dashboard via `import type` (TypeScript path alias), so the
 * imports are erased at build time and add no runtime weight. Backend services
 * can adopt this package once their Docker build context includes packages/*.
 */

/* ---- enums (string unions matching the DB enum types) -------------------- */
export type AccountType = 'advertiser' | 'publisher' | 'admin';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'banned';

export type AdFormat =
  | 'banner'
  | 'popunder'
  | 'native'
  | 'social_bar'
  | 'interstitial'
  | 'in_page_push'
  | 'direct_link'
  | 'video'
  | 'audio'
  | 'carousel'
  | 'email'
  | 'terminal';

export type PricingModel = 'cpm' | 'cpc' | 'cpa' | 'cpi';
export type Pacing = 'even' | 'asap';

export type CampaignStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'rejected'
  | 'completed'
  | 'archived';

export type CreativeType = 'image' | 'native' | 'popunder_url' | 'push' | 'html5' | 'video' | 'audio';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type MalwareScanStatus = 'pending' | 'clean' | 'flagged' | 'skipped';

export type PlacementStatus = 'active' | 'paused' | 'archived';
export type VerificationMethod = 'dns' | 'file' | 'meta' | 'domainconnect';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type LedgerEntryType =
  | 'deposit'
  | 'spend'
  | 'earning'
  | 'payout'
  | 'refund'
  | 'referral'
  | 'adjustment';

export type PayoutMethod = 'paypal' | 'wire' | 'crypto' | 'paxum' | 'card';
export type PayoutStatus = 'requested' | 'on_hold' | 'processing' | 'paid' | 'rejected';

/* ---- core entities ------------------------------------------------------- */
export interface Account {
  id: string;
  type: AccountType;
  email: string;
  status: AccountStatus;
  company_name?: string | null;
  kyc_status?: string | null;
  quality_score?: number | null;
  two_fa_enabled?: boolean;
  email_verified?: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  account_id: string;
  domain: string;
  kind: string;
  verification_method: VerificationMethod;
  verification_token: string;
  verification_status: VerificationStatus;
  status: PlacementStatus | string;
  /** Site-niche id (see `properties.niches()`); null when unknown. */
  category?: number | null;
  /** 'manual' = set by the publisher (never auto-overwritten); 'auto' = detected. */
  category_source?: 'auto' | 'manual';
  /** Top-3 detected niches, score = share of the classifier score (0-1). */
  categories?: { id: number; score: number }[];
  classified_at?: string | null;
  classify_error?: string | null;
  /** 'unverified' inventory gets CPA-only demand until promoted to 'trusted'. */
  trust_tier?: 'unverified' | 'trusted';
  /** An admin pinned the trust tier; automatic promotion/demotion is off. */
  trust_locked?: boolean;
  verified_at?: string | null;
  /** Progress toward automatic promotion (null for CLI properties / stats unavailable). */
  trust_progress?: {
    clean_impressions: number;
    impressions_needed: number;
    days_verified: number;
    days_needed: number;
    ivt_share: number;
    max_ivt_share: number;
    window_days: number;
  } | null;
  /** Ads before consent (resolved: this property's consent config, else the account default). */
  contextual_without_consent?: boolean;
  /** Enhanced frequency capping (resolved like contextual_without_consent). */
  enhanced_capping?: boolean;
  created_at: string;
}

/** Result of POST /v1/publisher/properties/{id}/verify. On failure, `error` + `message` say why and `check` shows what was fetched. */
export interface PropertyVerifyResult {
  verified: boolean;
  token: string;
  method: string | null;
  error: 'dns_lookup_failed' | 'token_not_found' | 'http_error' | 'fetch_failed' | null;
  message: string | null;
  check: {
    method: string | null;
    /** URL fetched (file/meta) or DNS name queried (dns). */
    target: string;
    status?: number;
    finalUrl?: string;
    age?: string | null;
    /** cf-cache-status (or x-cache) header. */
    cacheStatus?: string | null;
    bodyBytes?: number;
    records?: string[];
  };
}

export interface Placement {
  id: string;
  property_id: string;
  name: string;
  format: AdFormat;
  tag_key: string;
  floor_cpm: number;
  rev_share: number;
  width?: number | null;
  height?: number | null;
  status: PlacementStatus;
  /** True when signed-tag enforcement is on. The secret itself is only returned by `rotateSigningSecret()`. */
  has_signing_secret?: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  account_id: string;
  name: string;
  format: AdFormat;
  pricing_model: PricingModel;
  bid_amount: number;
  budget_daily: number;
  budget_total: number;
  spent_total: number;
  pacing: Pacing;
  status: CampaignStatus;
  /** Routing switches (default true) — see CreateCampaignRequest. */
  auto_own_placements?: boolean;
  network_expansion?: boolean;
  targeting?: Targeting;
  created_at: string;
}

export interface Targeting {
  geoInclude?: string[];
  geoExclude?: string[];
  deviceTypes?: string[];
  os?: string[];
  browsers?: string[];
  iabCategories?: string[];
  dayparting?: number[];
}

export interface Creative {
  id: string;
  campaign_id: string;
  type: CreativeType;
  asset_url?: string | null;
  landing_url: string;
  title?: string | null;
  description?: string | null;
  cta?: string | null;
  width?: number | null;
  height?: number | null;
  /* VAST video fields (snake_case response columns). */
  duration?: number | null;
  skip_offset_sec?: number | null;
  vpaid_url?: string | null;
  /** Flat array of { width, height, static_url, static_mime, click_url }. */
  companions?: Array<{ width: number; height: number; static_url: string; static_mime: string; click_url: string }>;
  vast_tag_url?: string | null;
  moderation_status: ModerationStatus;
  malware_scan_status: MalwareScanStatus;
  status: PlacementStatus;
}

export interface LedgerEntry {
  id: string;
  account_id: string;
  entry_type: LedgerEntryType;
  amount: number;
  currency: string;
  balance_after: number;
  ts: string;
}

export interface Balance {
  available: number;
  held: number;
  currency: string;
}

/* ---- API responses ------------------------------------------------------- */
export interface DomainConnectResult {
  supported: boolean;
  method: 'domainconnect' | 'manual';
  applyUrl?: string;
  providerId?: string;
  token: string;
}

export interface CreativeUploadResult {
  assetUrl: string;
  width?: number;
  height?: number;
  scan: 'clean' | 'flagged' | 'skipped';
}

export interface ReportRow {
  dimension: string;
  impressions: number;
  clicks: number;
  conversions?: number;
  ctr: number;
  ecpm: number;
  revenue?: number;
  spend?: number;
}

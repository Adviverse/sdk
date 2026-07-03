/**
 * Auction-insights shapes for both advertisers (/v1/advertiser/insights) and
 * publishers (/v1/publisher/insights).
 */

// ---- Advertiser auction insights (/v1/advertiser/insights) ----

/** One point on the bid-simulator curve: projected reach + spend at a bid. */
export interface BidSimPoint {
  bid: number;
  winRate: number;
  estImpressionsPerDay: number;
  estSpendPerDay: number;
}

/** Bid simulator: win-rate curve extended with reach + spend per day. */
export interface BidSimulatorResult {
  format: string;
  geo: string;
  points: BidSimPoint[];
  note: string;
}

/** Per-creative rollup row for a campaign. */
export interface CreativePerformanceRow {
  creativeId: string;
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
  spend: number;
  ecpm: number;
}
export interface CreativePerformanceResult {
  creatives: CreativePerformanceRow[];
}

/** Targeting-slice competitiveness from the recent clearing-price distribution. */
export interface CompetitivenessResult {
  score: 'low' | 'moderate' | 'high';
  clearingP50: number;
  clearingP90: number;
  sampleSize: number;
}

/** Directional bid-shading savings summary for the advertiser. */
export interface ShadingSavingsResult {
  activeFactorAvg: number;
  totalSpend30d: number;
  estimatedSavings: number;
  savingsPct: number;
  note: string;
}

/** Per-campaign delivery pacing row (insights list shape). */
export interface PacingRow {
  campaignId: string;
  name: string;
  deliveredPct: number;
  flightPct: number;
  onPace: boolean;
}
export interface PacingResult {
  campaigns: PacingRow[];
}

// ---- Publisher auction insights (/v1/publisher/insights) ----

/** One point on the publisher's own-inventory clearing distribution. */
export interface PublisherClearingPoint {
  floor: number;
  fillRate: number;
  expectedRevenue: number;
}

/** Own-inventory clearing distribution for one of the publisher's placements. */
export interface PublisherClearingResult {
  placementId: string;
  points: PublisherClearingPoint[];
  clearingP50: number;
  clearingP90: number;
  sampleSize: number;
}

/** Revenue-maximizing floor recommendation for a placement. */
export interface FloorRecommendationResult {
  currentFloor: number;
  currentSoft: number;
  recommendedFloor: number;
  recommendedSoft: number;
  expectedRevenueLiftPct: number;
  floorAuto: boolean;
  sampleSize: number;
  note: string;
}

/** One per-placement no-fill reason row. */
export interface PublisherNoFillReason {
  reason: string;
  count: number;
  pct: number;
}

/** Per-placement no-fill breakdown over the last 30 days. */
export interface PublisherNoFillResult {
  placementId: string;
  totalRequests: number;
  filled: number;
  fillRate: number;
  reasons: PublisherNoFillReason[];
}

/** One deal's delivery performance row. */
export interface PublisherDealPerformance {
  dealId: string;
  code: string;
  name: string;
  dealType: string;
  impressions: number;
  clicks: number;
  revenue: number;
  ecpm: number;
}

/** Deal performance for all of the publisher's deals. */
export interface PublisherDealsResult {
  deals: PublisherDealPerformance[];
}

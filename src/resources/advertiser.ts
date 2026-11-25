/** Advertiser-side resource groups: campaigns, creatives, audiences, the pixel,
 * product feeds, conversion ingestion, identity, automation, verification and
 * warehouse exports. */

import type {
  Campaign,
  Creative,
  CreativeUploadResult,
  CampaignStatus,
} from '../shared';
import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type {
  Pagination,
  Ok,
  CreateCampaignRequest,
  CampaignGroup,
  CreateCreativeRequest,
  UpdateCreativeRequest,
  BrandSafetyConfig,
  BidSimulatorResult,
  CreativePerformanceResult,
  CompetitivenessResult,
  ShadingSavingsResult,
  PacingResult,
} from '../types.js';

/**
 * Campaign groups — the "Campaign" umbrella over ad sets (campaigns). A group
 * carries name/status/objective; status cascades to its ad sets. Create an ad
 * set under a group by passing `groupId` to campaigns.create().
 */
export class CampaignGroupsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** Groups with their ad sets nested + a per-group spend rollup. */
  list(): Promise<CampaignGroup[]> {
    return this.c.request('GET', '/v1/advertiser/campaign-groups');
  }
  get(id: string): Promise<CampaignGroup> {
    return this.c.request('GET', `/v1/advertiser/campaign-groups/${encodeURIComponent(id)}`);
  }
  create(body: { name: string; objective?: string }): Promise<CampaignGroup> {
    return this.c.request('POST', '/v1/advertiser/campaign-groups', { body });
  }
  update(id: string, body: { name?: string; status?: string; objective?: string }): Promise<CampaignGroup> {
    return this.c.request('PATCH', `/v1/advertiser/campaign-groups/${encodeURIComponent(id)}`, { body });
  }
  remove(id: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `/v1/advertiser/campaign-groups/${encodeURIComponent(id)}`);
  }
}

export class CampaignsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(page?: Pagination): Promise<Campaign[]> {
    return this.c.request('GET', '/v1/advertiser/campaigns', { query: page });
  }
  get(id: string): Promise<Campaign> {
    return this.c.request('GET', `/v1/advertiser/campaigns/${encodeURIComponent(id)}`);
  }
  create(body: CreateCampaignRequest, idempotencyKey?: string): Promise<Campaign> {
    return this.c.request('POST', '/v1/advertiser/campaigns', { body, idempotencyKey });
  }
  update(id: string, body: Partial<CreateCampaignRequest>): Promise<Campaign> {
    return this.c.request('PATCH', `/v1/advertiser/campaigns/${encodeURIComponent(id)}`, { body });
  }
  /** Soft-delete a campaign: stops serving + removes it from the list. Past
   *  spend/stats stay for reporting. */
  remove(id: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `/v1/advertiser/campaigns/${encodeURIComponent(id)}`);
  }
  submit(id: string): Promise<Ok> {
    return this.c.request('POST', `/v1/advertiser/campaigns/${encodeURIComponent(id)}/submit`);
  }
  setStatus(id: string, status: CampaignStatus): Promise<Ok> {
    return this.c.request('POST', `/v1/advertiser/campaigns/${encodeURIComponent(id)}/status`, {
      body: { status },
    });
  }
  reachEstimate(body: unknown): Promise<{ estimatedDailyImpressions: number; matchingPlacements?: number | null; appliedFilters?: string[]; note?: string }> {
    return this.c.request('POST', '/v1/advertiser/reach-estimate', { body });
  }
  getConversionConfig(id: string): Promise<unknown> {
    return this.c.request(
      'GET',
      `/v1/advertiser/campaigns/${encodeURIComponent(id)}/conversion-config`,
    );
  }
  setConversionConfig(id: string, body: unknown): Promise<Ok> {
    return this.c.request(
      'POST',
      `/v1/advertiser/campaigns/${encodeURIComponent(id)}/conversion-config`,
      { body },
    );
  }
  /** Get the resolved targeting configuration for a campaign. */
  targeting(id: string): Promise<Record<string, unknown>> {
    return this.c.request('GET', `/v1/advertiser/campaigns/${encodeURIComponent(id)}/targeting`);
  }
  /** Set brand-safety rules for a campaign (categories/keywords/domains to avoid). */
  setBrandSafety(id: string, body: BrandSafetyConfig): Promise<Ok> {
    return this.c.request('POST', `/v1/advertiser/campaigns/${encodeURIComponent(id)}/brand-safety`, { body });
  }
  /** Recommended bid range for a format (optionally a geo), from recent clearing prices. */
  bidRecommendation(query: { format: string; geo?: string }): Promise<unknown> {
    return this.c.request('GET', '/v1/advertiser/insights/bid-recommendation', { query });
  }
}

export class CreativesResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** The advertiser's whole creative library (independent of any campaign). */
  list(): Promise<Creative[]> {
    return this.c.request('GET', '/v1/advertiser/creatives');
  }
  get(id: string): Promise<Creative> {
    return this.c.request('GET', `/v1/advertiser/creatives/${encodeURIComponent(id)}`);
  }
  /** Creatives serving a campaign (directly authored + attached from the library). */
  listForCampaign(campaignId: string): Promise<Creative[]> {
    return this.c.request(
      'GET',
      `/v1/advertiser/campaigns/${encodeURIComponent(campaignId)}/creatives`,
    );
  }
  /** Create a creative. Omit campaignId to add it to the library only. */
  create(body: CreateCreativeRequest): Promise<Creative> {
    return this.c.request('POST', '/v1/advertiser/creatives', { body });
  }
  update(id: string, body: UpdateCreativeRequest): Promise<Creative> {
    return this.c.request('PATCH', `/v1/advertiser/creatives/${encodeURIComponent(id)}`, { body });
  }
  /** Attach a library creative to a campaign (optional rotation weight). */
  attach(id: string, campaignId: string, weight?: number): Promise<{ attached: boolean }> {
    return this.c.request('POST', `/v1/advertiser/creatives/${encodeURIComponent(id)}/attach`, { body: { campaignId, weight } });
  }
  detach(id: string, campaignId: string): Promise<{ detached: boolean }> {
    return this.c.request('POST', `/v1/advertiser/creatives/${encodeURIComponent(id)}/detach`, { body: { campaignId } });
  }
  /** Campaigns a library creative is attached to. */
  campaigns(id: string): Promise<Array<{ id: string; name: string; status: string; weight: number; enabled: boolean }>> {
    return this.c.request('GET', `/v1/advertiser/creatives/${encodeURIComponent(id)}/campaigns`);
  }
  /** Uploads a creative asset (multipart). `file` is a Blob/File; `filename` sets the
   * multipart filename (helps the server infer type); extra fields go in `fields`. */
  upload(file: Blob, fields?: Record<string, string>, filename?: string): Promise<CreativeUploadResult> {
    const form = new FormData();
    if (filename) form.append('file', file, filename);
    else form.append('file', file);
    if (fields) for (const [k, v] of Object.entries(fields)) form.append(k, v);
    return this.c.request('POST', '/v1/advertiser/creatives/upload', { form });
  }
  /** Uploads a PLAYABLE (interactive HTML5) as a ZIP bundle. The server validates
   * it, injects the sandbox runtime into its index.html, and hosts it on the CDN.
   * Returns { assetUrl, type:'html5', … } to pass to create() as a full-screen
   * (interstitial/rewarded) creative. `zip` is a Blob/File of the .zip. */
  uploadPlayable(zip: Blob, filename = 'playable.zip'): Promise<CreativeUploadResult & { files: number; bytes: number }> {
    const form = new FormData();
    form.append('file', zip, filename);
    return this.c.request('POST', '/v1/advertiser/creatives/playable', { form });
  }
  delete(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/advertiser/creatives/${encodeURIComponent(id)}`);
  }
  /** Transcode a video creative to HLS for SSAI (fire-and-forget; poll the creative for status). */
  transcode(id: string): Promise<{ queued: boolean }> {
    return this.c.request('POST', `/v1/advertiser/creatives/${encodeURIComponent(id)}/transcode`);
  }
  /** Add a DCO component to a creative's pool (the bandit picks among them at serve time). */
  addComponent(id: string, body: { slot: 'headline' | 'body' | 'image' | 'cta' | 'logo' | 'bg_color' | string; value: string }): Promise<unknown> {
    return this.c.request('POST', `/v1/advertiser/creatives/${encodeURIComponent(id)}/components`, { body });
  }
  /** List a creative's DCO component pool. */
  components(id: string): Promise<unknown[]> {
    return this.c.request('GET', `/v1/advertiser/creatives/${encodeURIComponent(id)}/components`);
  }
  /** Remove a DCO component from a creative's pool. */
  removeComponent(id: string, componentId: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/advertiser/creatives/${encodeURIComponent(id)}/components/${encodeURIComponent(componentId)}`);
  }
  /** Toggle DCO / dynamic-product-ad flags on a creative. */
  setDco(id: string, body: { isDco?: boolean; dcoContext?: 'global' | 'geo' | 'device' | 'audience'; productAd?: boolean; defaultProductId?: string }): Promise<Creative> {
    return this.c.request('PATCH', `/v1/advertiser/creatives/${encodeURIComponent(id)}/dco`, { body });
  }
}

/**
 * Advertiser auction insights (`/v1/advertiser/insights`): bid simulator, per-
 * creative performance, slice competitiveness, bid-shading savings, and delivery
 * pacing. All endpoints are scoped to the authed advertiser account.
 */
export class InsightsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Win-rate curve extended with projected impressions + spend per day. Pass
   * your own `bid` to fold it into the candidate points. */
  bidSimulator(query: { format: string; geo?: string; bid?: number }): Promise<BidSimulatorResult> {
    return this.c.request('GET', '/v1/advertiser/insights/bid-simulator', { query });
  }
  /** Per-creative rollup (impressions, clicks, conversions, ctr, cvr, spend,
   * ecpm) for one of your campaigns, sorted by spend. */
  creativePerformance(campaignId: string): Promise<CreativePerformanceResult> {
    return this.c.request('GET', '/v1/advertiser/insights/creative-performance', { query: { campaignId } });
  }
  /** Competitiveness (low/moderate/high) of a targeting slice from the recent
   * market clearing-price distribution. */
  competitiveness(query: { format: string; geo?: string }): Promise<CompetitivenessResult> {
    return this.c.request('GET', '/v1/advertiser/insights/competitiveness', { query });
  }
  /** Directional bid-shading savings estimate from the active shading factors +
   * recent spend (optionally scoped to one campaign). */
  shadingSavings(query?: { campaignId?: string }): Promise<ShadingSavingsResult> {
    return this.c.request('GET', '/v1/advertiser/insights/shading-savings', { query });
  }
  /** Per-campaign delivery pacing (deliveredPct vs flightPct, onPace). */
  pacing(): Promise<PacingResult> {
    return this.c.request('GET', '/v1/advertiser/insights/pacing');
  }
}

// Resource groups split into sibling files (line cap); re-exported here so the
// import surface of `./resources/advertiser` is unchanged.
export * from './advertiser-audiences.js';
export * from './advertiser-pixel.js';
export * from './advertiser-ops.js';

// Agency resource groups (Team, Clients, Invoices, Transfers) live in a sibling
// file to honor the 650-line cap; re-exported here so the import surface of
// `./resources/advertiser` is unchanged.
export * from './advertiser-agency.js';

// Terminal (CLI status-line) self-network serving + serve tokens live in a
// sibling file to honor the 650-line cap; re-exported here so the import
// surface of `./resources/advertiser` is unchanged.
export * from './advertiser-terminal.js';

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
  Audience,
  AudiencePixel,
  AudienceRule,
  RuleNode,
  ModeledLookalikeResult,
  ModeledLookalikePreview,
  PixelInfo,
  CreateFeedRequest,
  CapiEvent,
  CreateAutomationRuleRequest,
  VerificationSettings,
  RunExportRequest,
  TaxonomyNode,
  SegmentCatalogEntry,
  ContributeSegmentRequest,
  SegmentContribution,
  SegmentLicense,
  SegmentEarnings,
  CliLinkCode,
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

/** Advertiser audiences: uploaded lists, retargeting pixels, and lookalikes. */
export class AudiencesResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** List the account's audiences with their current live size. */
  list(): Promise<Audience[]> {
    return this.c.request('GET', '/v1/advertiser/audiences');
  }
  /**
   * Audience Builder: ready-to-create first-party audiences suggested from the
   * account's own harvested pixel events (all visitors, engaged, cart/checkout
   * abandoners, purchasers, high-value, per-product viewers). Each suggestion's
   * `rule` can be passed straight to `create({ name, rule })`.
   */
  suggestions(days = 30): Promise<{
    suggestions: Array<{ key: string; name: string; description: string; type: 'rule'; rule: AudienceRule; estReach: number; basis: string }>;
    eventInventory: Record<string, number>;
  }> {
    return this.c.request('GET', '/v1/advertiser/audiences/suggestions', { query: { days } });
  }
  /**
   * Create an audience. 'uploaded' (paste hashes), 'retargeting' (pixel ping), or
   * pass a `rule` for an event-defined audience (type becomes 'rule'). The `rule`
   * accepts either the legacy flat shape OR a full AND/OR/NOT `RuleNode` tree with
   * event + trait predicates.
   */
  create(body: { name: string; type?: 'uploaded' | 'retargeting' | 'rule' | string; rule?: AudienceRule | RuleNode; pixelId?: string }): Promise<{ id: string }> {
    return this.c.request('POST', '/v1/advertiser/audiences', { body });
  }
  /** Bulk-add hashed user ids / emails to an uploaded audience. */
  addMembers(id: string, hashes: string[]): Promise<{ added: number; size: number }> {
    return this.c.request('POST', `/v1/advertiser/audiences/${encodeURIComponent(id)}/members`, { body: { hashes } });
  }
  /** Build a lookalike audience modeled from this seed audience (geo/device
   * profile-match heuristic over impressions). */
  lookalike(id: string, size?: number): Promise<{ id: string; size: number }> {
    return this.c.request('POST', `/v1/advertiser/audiences/${encodeURIComponent(id)}/lookalike`, { body: { size } });
  }
  /**
   * Build an IN-HOUSE MODELED lookalike from a seed audience using first-party
   * pixel data: it learns the content keywords / event types / value buckets that
   * are DISTINCTIVE to the seed (vs your overall audience, so everywhere-common
   * signals can't dominate) and materializes the top-scoring similar users.
   * Privacy-safe: k-anonymity floors on the seed and the output, consent/opt-out
   * honored. `minScore` (0..1) is an optional affinity threshold per candidate.
   */
  createModeledLookalike(seedAudienceId: string, opts: { size?: number; minScore?: number } = {}): Promise<ModeledLookalikeResult> {
    return this.c.request('POST', '/v1/advertiser/audiences/lookalike-modeled', { body: { seedAudienceId, ...opts } });
  }
  /** Preview the modeled lookalike for a seed (sizes, k-anon eligibility, the
   * most distinctive features) WITHOUT materializing an audience. */
  modeledLookalikePreview(seedAudienceId: string): Promise<ModeledLookalikePreview> {
    return this.c.request('GET', `/v1/advertiser/audiences/${encodeURIComponent(seedAudienceId)}/lookalike-modeled/preview`);
  }
  /** Get the retargeting pixel (image + JS embeds) for a retargeting audience. */
  pixel(id: string): Promise<AudiencePixel> {
    return this.c.request('GET', `/v1/advertiser/audiences/${encodeURIComponent(id)}/pixel`);
  }
  delete(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/advertiser/audiences/${encodeURIComponent(id)}`);
  }
  /** Update an audience's name and/or rule (tree or flat). Re-resolves membership. */
  update(id: string, body: { name?: string; rule?: AudienceRule | RuleNode }): Promise<{ id: string }> {
    return this.c.request('PATCH', `/v1/advertiser/audiences/${encodeURIComponent(id)}`, { body });
  }
  /** Estimate reach for a rule WITHOUT creating it — distinct matching users. */
  estimate(rule: AudienceRule | RuleNode, pixelId?: string): Promise<{ count: number }> {
    return this.c.request('POST', '/v1/advertiser/audiences/estimate', { body: { rule, ...(pixelId ? { pixelId } : {}) } });
  }
  /** Audience sync destinations (push members to Meta / Google / a webhook). */
  destinations(audienceId: string): Promise<unknown[]> {
    return this.c.request('GET', `/v1/advertiser/audiences/${encodeURIComponent(audienceId)}/destinations`);
  }
  addDestination(audienceId: string, body: { type: 'webhook' | 'meta_custom_audience' | 'google_customer_match'; config: Record<string, unknown> }): Promise<{ id: string }> {
    return this.c.request('POST', `/v1/advertiser/audiences/${encodeURIComponent(audienceId)}/destinations`, { body });
  }
  updateDestination(destId: string, body: { config?: Record<string, unknown>; active?: boolean }): Promise<{ id: string }> {
    return this.c.request('PATCH', `/v1/advertiser/destinations/${encodeURIComponent(destId)}`, { body });
  }
  deleteDestination(destId: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/advertiser/destinations/${encodeURIComponent(destId)}`);
  }
  syncDestination(destId: string): Promise<{ status: string; count: number }> {
    return this.c.request('POST', `/v1/advertiser/destinations/${encodeURIComponent(destId)}/sync`);
  }
}

/**
 * Audience Cloud: the shared interest taxonomy, the segment catalog (contextual
 * keywords + network behavioral presets), and the privacy-safe data co-op
 * (contribute your audiences under an interest niche; license others' segments).
 *
 * Targeting a segment = adding its id to a campaign's `targeting.audience_include[]`;
 * a contextual interest = adding its keywords to `targeting.contextual_include[]`.
 */
export class SegmentsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** The shared interest taxonomy (IAB-style nodes with contextual keywords). */
  taxonomy(): Promise<TaxonomyNode[]> {
    return this.c.request('GET', '/v1/segments/taxonomy');
  }
  /** Browse interests: contextual keywords (always available) + the behavioral
   * preset for each interest (materialized, building, or none). */
  catalog(): Promise<SegmentCatalogEntry[]> {
    return this.c.request('GET', '/v1/advertiser/segments/catalog');
  }
  /** Contribute one of the account's audiences to the co-op. The niche is
   * auto-detected from the audience's members (taxonomyId is optional). Returns
   * the segment id, rev-share, and the resolved niche. */
  contribute(body: ContributeSegmentRequest): Promise<{ segmentId: string; revShare: number; taxonomyId: string | null; niche: string | null }> {
    return this.c.request('POST', '/v1/advertiser/segments/contribute', { body });
  }
  /** The auto-detected interest/niche for an audience (from its members' keywords). */
  detectNiche(audienceId: string): Promise<{ taxonomyId: string | null; name: string | null }> {
    return this.c.request('GET', '/v1/advertiser/segments/detect-niche', { query: { audienceId } });
  }
  /** Segments the account has contributed to the co-op (size, rev-share, licensees). */
  contributions(): Promise<SegmentContribution[]> {
    return this.c.request('GET', '/v1/advertiser/segments/contributions');
  }
  /** Withdraw a contributed segment from the co-op. */
  revoke(id: string): Promise<{ revoked: boolean }> {
    return this.c.request('POST', `/v1/advertiser/segments/${encodeURIComponent(id)}/revoke`);
  }
  /** License a network behavioral segment for targeting; returns its segment id
   * (add to `audience_include`) and the data CPM that applies. */
  license(id: string): Promise<{ segmentId: string; dataCpm: number; note: string }> {
    return this.c.request('POST', `/v1/advertiser/segments/${encodeURIComponent(id)}/license`);
  }
  /** Segments the account has licensed (target by `segment_id` in `audience_include`). */
  licenses(): Promise<SegmentLicense[]> {
    return this.c.request('GET', '/v1/advertiser/segments/licenses');
  }
  /** The co-op data-fee statement: rev-share earned as a contributor (held until
   * maturation) vs data fees paid as a licensee, with per-segment and recent
   * earning/spend breakdowns. */
  earnings(): Promise<SegmentEarnings> {
    return this.c.request('GET', '/v1/advertiser/segments/earnings');
  }
  /** Mint a one-time CLI link code (single-use, ~10-min TTL). The terminal/CLI
   * user sets it as `ADVIVERSE_LINK_CODE` to tie their coding activity +
   * audiences to this account's identity. */
  cliLinkCode(): Promise<CliLinkCode> {
    return this.c.request('POST', '/v1/advertiser/cli-link-code');
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

// Agency resource groups (Team, Clients, Invoices, Transfers) live in a sibling
// file to honor the 650-line cap; re-exported here so the import surface of
// `./resources/advertiser` is unchanged.
export * from './advertiser-agency.js';

/** Product feeds (catalog source for dynamic product ads / DCO). */
export class FeedsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  list(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/advertiser/feeds');
  }
  create(body: CreateFeedRequest): Promise<unknown> {
    return this.c.request('POST', '/v1/advertiser/feeds', { body });
  }
  /** Trigger an immediate fetch/refresh of the feed's products. */
  fetch(id: string): Promise<unknown> {
    return this.c.request('POST', `/v1/advertiser/feeds/${encodeURIComponent(id)}/fetch`);
  }
  products(id: string, page?: Pagination): Promise<{ products: unknown[] }> {
    return this.c.request('GET', `/v1/advertiser/feeds/${encodeURIComponent(id)}/products`, { query: page });
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

/** Warehouse exports (events / conversions / spend → CSV/NDJSON). */
export class ExportsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  run(body: RunExportRequest): Promise<unknown> {
    return this.c.request('POST', '/v1/exports/run', { body });
  }
  list(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/exports');
  }
}

/** Third-party measurement / brand-safety vendor configuration. */
export class VerificationResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  categories(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/verification/categories');
  }
  settings(): Promise<VerificationSettings> {
    return this.c.request('GET', '/v1/verification/settings');
  }
  saveSettings(body: VerificationSettings): Promise<VerificationSettings> {
    return this.c.request('PUT', '/v1/verification/settings', { body });
  }
}

/** Automation rules, the budget optimizer log, and anomaly alerts (advertiser). */
export class AutomationResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  rules(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/automation/rules');
  }
  createRule(body: CreateAutomationRuleRequest): Promise<unknown> {
    return this.c.request('POST', '/v1/automation/rules', { body });
  }
  deleteRule(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/automation/rules/${encodeURIComponent(id)}`);
  }
  /** Enable or disable a rule (pause it without deleting). */
  setRuleEnabled(id: string, enabled: boolean): Promise<unknown> {
    return this.c.request('PATCH', `/v1/automation/rules/${encodeURIComponent(id)}`, { body: { enabled } });
  }
  /** Recent automated budget-reallocation actions. */
  optimizerLog(limit?: number): Promise<unknown[]> {
    return this.c.request('GET', '/v1/optimizer/log', { query: { limit } });
  }
  alerts(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/alerts');
  }
  ackAlert(id: string): Promise<unknown> {
    return this.c.request('POST', `/v1/alerts/${encodeURIComponent(id)}/ack`);
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

// Terminal (CLI status-line) self-network serving + serve tokens live in a
// sibling file to honor the 650-line cap; re-exported here so the import
// surface of `./resources/advertiser` is unchanged.
export * from './advertiser-terminal.js';

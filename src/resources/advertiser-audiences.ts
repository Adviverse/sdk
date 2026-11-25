/** Advertiser audiences (uploaded/retargeting/rule/lookalike + sync destinations)
 * and the Audience Cloud segment co-op. Re-exported from `advertiser.ts`. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type {
  Ok,
  Audience,
  AudiencePixel,
  AudienceRule,
  RuleNode,
  ModeledLookalikeResult,
  ModeledLookalikePreview,
  TaxonomyNode,
  SegmentCatalogEntry,
  ContributeSegmentRequest,
  SegmentContribution,
  SegmentLicense,
  SegmentEarnings,
  CliLinkCode,
} from '../types.js';

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

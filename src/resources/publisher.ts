/** Publisher-side resource groups: properties, placements, consent, terminal
 * ad-integrity, apps, and edge-region discovery. */

import type { Property, Placement, DomainConnectResult } from '../shared';
import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type {
  Pagination,
  Ok,
  CreatePropertyRequest,
  CreatePlacementRequest,
  UpdatePlacementRequest,
  ConsentConfig,
  SaveConsentConfigRequest,
  ConsentLogEntry,
  SellerListing,
  SaveSellerListingRequest,
  CreateAppRequest,
  ComboPreset,
  CreateComboRequest,
  ComboResult,
  ComboList,
  PublisherClearingResult,
  FloorRecommendationResult,
  PublisherNoFillResult,
  PublisherDealsResult,
} from '../types.js';

export class PropertiesResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(page?: Pagination): Promise<Property[]> {
    return this.c.request('GET', '/v1/publisher/properties', { query: page });
  }
  create(body: CreatePropertyRequest, idempotencyKey?: string): Promise<Property> {
    return this.c.request('POST', '/v1/publisher/properties', { body, idempotencyKey });
  }
  /** Update a property's editable fields: display name, domain, category, and
   *  verification method. Changing the domain resets verification. */
  update(
    id: string,
    body: { name?: string; domain?: string; category?: number; verificationMethod?: string },
  ): Promise<Property> {
    return this.c.request('PATCH', `/v1/publisher/properties/${encodeURIComponent(id)}`, { body });
  }
  verify(id: string): Promise<Ok> {
    return this.c.request('POST', `/v1/publisher/properties/${encodeURIComponent(id)}/verify`);
  }
  /** Set/clear the property's first-party ad-serving domain (anti-adblock). Pass
   *  null/undefined to remove. Returns the CNAME target to point the domain at. */
  setServingDomain(id: string, domain: string | null): Promise<{ serving_domain: string | null; cname_target: string; verified: boolean }> {
    return this.c.request('POST', `/v1/publisher/properties/${encodeURIComponent(id)}/serving-domain`, { body: { domain } });
  }
  /** Verify the custom serving domain CNAMEs to our edge (proves control + routes). */
  verifyServingDomain(id: string): Promise<{ verified: boolean; serving_domain: string; cname_target: string }> {
    return this.c.request('POST', `/v1/publisher/properties/${encodeURIComponent(id)}/serving-domain/verify`);
  }
  removeServingDomain(id: string): Promise<{ serving_domain: string | null; verified: boolean }> {
    return this.c.request('DELETE', `/v1/publisher/properties/${encodeURIComponent(id)}/serving-domain`);
  }
  domainConnect(id: string): Promise<DomainConnectResult> {
    return this.c.request(
      'POST',
      `/v1/publisher/properties/${encodeURIComponent(id)}/domainconnect`,
    );
  }
  delete(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/publisher/properties/${encodeURIComponent(id)}`);
  }
  /** This property's Made-For-Advertising quality score + improvement guidance. */
  mfa(id: string): Promise<{ score: number; guidance: string }> {
    return this.c.request('GET', `/v1/publisher/properties/${encodeURIComponent(id)}/mfa`);
  }
}

export class PlacementsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(page?: Pagination): Promise<Placement[]> {
    return this.c.request('GET', '/v1/publisher/placements', { query: page });
  }
  create(body: CreatePlacementRequest, idempotencyKey?: string): Promise<Placement> {
    return this.c.request('POST', '/v1/publisher/placements', { body, idempotencyKey });
  }
  update(id: string, body: UpdatePlacementRequest): Promise<Placement> {
    return this.c.request('PATCH', `/v1/publisher/placements/${encodeURIComponent(id)}`, { body });
  }
  tag(id: string): Promise<{ tag: string; [k: string]: unknown }> {
    return this.c.request('GET', `/v1/publisher/placements/${encodeURIComponent(id)}/tag`);
  }
  /**
   * Generate/rotate the placement's signing secret (Layer 3). Returned ONCE —
   * embed it in your signing client (ADVIVERSE_SIGNING_SECRET). With a secret
   * set, the engine only serves /terminal requests carrying a valid HMAC sig.
   */
  rotateSigningSecret(id: string): Promise<{ signingSecret: string }> {
    return this.c.request('POST', `/v1/publisher/placements/${encodeURIComponent(id)}/signing-secret`);
  }
  /** Disable signed-tag enforcement (back to unsigned serving). */
  disableSigning(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/publisher/placements/${encodeURIComponent(id)}/signing-secret`);
  }

  /** The static combo / layout preset catalog. */
  comboPresets(): Promise<{ presets: ComboPreset[] }> {
    return this.c.request('GET', '/v1/publisher/combo-presets');
  }

  /**
   * Provision several placements at once from a preset and get ONE combined
   * embed snippet back (paste once before `</body>`).
   */
  createCombo(propertyId: string, body: CreateComboRequest): Promise<ComboResult> {
    return this.c.request(
      'POST',
      `/v1/publisher/properties/${encodeURIComponent(propertyId)}/combos`,
      { body },
    );
  }

  /** List a property's combos, each with its combined embed snippet. */
  listCombos(propertyId: string): Promise<ComboList> {
    return this.c.request(
      'GET',
      `/v1/publisher/properties/${encodeURIComponent(propertyId)}/combos`,
    );
  }
}

/** Publisher consent configuration + the recorded consent log. */
export class ConsentResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /**
   * Get consent config. Consent is scoped per PROPERTY (domain) — pass a
   * propertyId to read that property's config (falling back to the account-wide
   * default). Omit it to read the account-wide default directly.
   */
  getConfig(propertyId?: string): Promise<ConsentConfig> {
    const q = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : '';
    return this.c.request('GET', `/v1/publisher/consent-config${q}`);
  }
  /**
   * Save the CMP framework + default-consent + snippet behavior for a property
   * (set `propertyId` in the body). Omit `propertyId` to save the account default.
   */
  saveConfig(body: SaveConsentConfigRequest): Promise<ConsentConfig> {
    return this.c.request('POST', '/v1/publisher/consent-config', { body });
  }
  /** This publisher's recent consent-log entries (attributed via their snippet). */
  log(): Promise<ConsentLogEntry[]> {
    return this.c.request('GET', '/v1/publisher/consent-log');
  }

  /** Get this publisher's public sellers.json listing preference. */
  getSellerListing(): Promise<SellerListing> {
    return this.c.request('GET', '/v1/publisher/seller-listing');
  }

  /** Opt into (or out of) a public sellers.json listing, optionally declaring a
   * seller domain. When opted out the seller stays confidential. */
  saveSellerListing(body: SaveSellerListingRequest): Promise<SellerListing> {
    return this.c.request('PUT', '/v1/publisher/seller-listing', { body });
  }
}

/** Terminal ad-integrity (publisher): detect machines/installs serving a foreign tag. */
export class IntegrityResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /**
   * Report machines running this publisher's tag that ALSO run a foreign tag
   * (a competing ad daemon), and — when `client` is given — installs reporting
   * that client id but serving a tag this publisher doesn't own (a tag swap).
   */
  report(opts: { client?: string; days?: number } = {}): Promise<{
    tags: string[];
    competing: Array<{ uid: string; lastSeen: string; pings: number; foreignTags: string[] }>;
    swapped: Array<{ installId: string; lastSeen: string; tags: string[] }>;
    summary: { installs: number; machines: number };
  }> {
    return this.c.request('GET', '/v1/publisher/integrity', { query: { client: opts.client, days: opts.days } });
  }
  /**
   * Liveness: per-install last-seen + ads on/off state, so a host backend can
   * tell — without filesystem access — which installs are alive & serving, alive
   * but switched off, or gone silent. `alive` = pinged within ~95 min. Pass
   * `client` to scope to your branded installs.
   */
  liveness(opts: { client?: string; days?: number } = {}): Promise<{
    installs: Array<{ installId: string; client: string; uid: string; tag: string; lastSeen: string; enabled: boolean; alive: boolean }>;
    summary: { total: number; alive: number; disabled: number; stale: number };
  }> {
    return this.c.request('GET', '/v1/publisher/liveness', { query: { client: opts.client, days: opts.days } });
  }
}

/** Publisher mobile / CTV apps. */
export class AppsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  list(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/publisher/apps');
  }
  get(id: string): Promise<unknown> {
    return this.c.request('GET', `/v1/publisher/apps/${encodeURIComponent(id)}`);
  }
  create(body: CreateAppRequest): Promise<unknown> {
    return this.c.request('POST', '/v1/publisher/apps', { body });
  }
  update(id: string, body: Record<string, unknown>): Promise<unknown> {
    return this.c.request('PATCH', `/v1/publisher/apps/${encodeURIComponent(id)}`, { body });
  }
  /** The generated app-ads.txt content (plain text). */
  appAdsTxt(id: string): Promise<string> {
    return this.c.request('GET', `/v1/publisher/apps/${encodeURIComponent(id)}/app-ads.txt`, { text: true });
  }
}

/**
 * Publisher auction insights (`/v1/publisher/insights`). All routes are scoped
 * to the authed publisher; placement routes only touch placements you own.
 */
export class PublisherInsightsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }

  /**
   * Your own inventory's clearing distribution for a placement: for ~10
   * candidate floors, fillRate = P(a bid clears ≥ floor) and expectedRevenue =
   * floor × fillRate, plus clearing P50/P90. This is your own revenue data — it
   * never exposes competitor identities.
   */
  clearing(placementId: string): Promise<PublisherClearingResult> {
    return this.c.request('GET', '/v1/publisher/insights/clearing', { query: { placementId } });
  }

  /** Revenue-maximizing floor recommendation for a placement (reuses the yield
   * optimizer's pick) with the expected-revenue lift over your current floor. */
  floorRecommendation(placementId: string): Promise<FloorRecommendationResult> {
    return this.c.request('GET', '/v1/publisher/insights/floor-recommendation', { query: { placementId } });
  }

  /** Per-placement no-fill reason breakdown over the last 30 days. */
  noFill(placementId: string): Promise<PublisherNoFillResult> {
    return this.c.request('GET', '/v1/publisher/insights/no-fill', { query: { placementId } });
  }

  /** Delivery performance (impressions, clicks, revenue, ecpm) for your deals. */
  deals(): Promise<PublisherDealsResult> {
    return this.c.request('GET', '/v1/publisher/insights/deals');
  }
}

/** Edge regions (public discovery). */
export class RegionsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  list(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/regions');
  }
  nearest(query?: { country?: string; lat?: number; lng?: number }): Promise<{ id: string; code: string; public_endpoint: string }> {
    return this.c.request('GET', '/v1/regions/nearest', { query });
  }
  health(): Promise<Array<{ id: string; code: string; status: string; uptime: number }>> {
    return this.c.request('GET', '/v1/regions/health');
  }
}

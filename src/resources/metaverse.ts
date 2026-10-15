/** Metaverse ad network: whitelabel worlds + ad-surface inventory + proof-of-view.
 *
 * A metaverse operator onboards a "world" (gets a signing secret used to attest
 * proofs of view); shop owners place ad surfaces (screens / posters / portals) and
 * earn; on-platform + Adviverse demand cross-fill. Maps onto `/v1/metaverse/*`. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export interface CreateWorldRequest {
  name: string;
  /** The tenant network these surfaces belong to (empty = the general pool). */
  networkId?: string;
}
export interface World {
  id: string;
  name: string;
  network_id: string | null;
  trust_tier: string;
  status: string;
  /** Returned ONCE on create — the world server signs proofs with it. */
  signing_secret?: string;
  created_at: string;
}

export interface ClaimSurfaceRequest {
  code: string;
  shopId?: string;
  world?: string;
  surfaceType?: 'screen' | 'poster' | 'portal';
  posX?: number; posY?: number; posZ?: number;
  widthM?: number; heightM?: number;
  floorCpm?: number;
  audienceMultiplier?: number;
  maxDistanceM?: number;
}
export interface UpdateSurfaceRequest {
  surfaceType?: 'screen' | 'poster' | 'portal';
  floorCpm?: number;
  audienceMultiplier?: number;
  maxDistanceM?: number;
}
export interface Surface {
  id: string;
  placement_id: string | null;
  shop_id: string | null;
  world: string | null;
  surface_type: string;
  status: string;
  tag_key?: string | null;
  online?: boolean;
  last_heartbeat_at: string | null;
  created_at: string;
  [k: string]: unknown;
}

/** One world's automatic trust-score snapshot (admin visibility). */
export interface WorldTrustScore {
  world_integration_id: string;
  world_name: string | null;
  account_id: string | null;
  /** The world's live trust tier (unverified = CPA-only, trusted = CPM-eligible). */
  current_tier: string;
  /** Composite 0..1 traffic-quality score. */
  score: number | null;
  views_7d: number | null;
  valid_rate: number | null;
  attested_rate: number | null;
  unique_user_ratio: number | null;
  dwell_cv: number | null;
  /** The tier the scorer decided this run. */
  auto_tier: string | null;
  factors: Record<string, unknown> | null;
  computed_at: string;
}

export interface SurfaceViewReport {
  summary: { views: number; valid_views: number; enters: number; completes: number; spend: number; surfaces: number };
  rows: Array<{
    request_id: string;
    surface_id: string | null;
    campaign_id: string | null;
    event_type: string;
    in_view_ms: number | null;
    distance_m: number | null;
    valid: boolean;
    price_paid: number | null;
    currency: string | null;
    created_at: string;
    shop_id?: string | null;
  }>;
}

/** Metaverse worlds, ad surfaces, and proof-of-view. Pairing itself is
 * world-initiated (public); this resource is the operator/shop/advertiser side. */
export class MetaverseResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }

  /** Onboard a world integration (returns the signing secret ONCE). */
  createWorld(req: CreateWorldRequest): Promise<World> {
    return this.c.request('POST', '/v1/metaverse/worlds', { body: req });
  }
  listWorlds(): Promise<World[]> {
    return this.c.request('GET', '/v1/metaverse/worlds');
  }

  /** Claim a pending surface by the code it is displaying (activates serving). */
  claimSurface(req: ClaimSurfaceRequest): Promise<Surface> {
    return this.c.request('POST', '/v1/metaverse/surfaces/claim', { body: req });
  }
  listSurfaces(): Promise<Surface[]> {
    return this.c.request('GET', '/v1/metaverse/surfaces');
  }
  getSurface(id: string): Promise<Surface> {
    return this.c.request('GET', `/v1/metaverse/surfaces/${encodeURIComponent(id)}`);
  }
  updateSurface(id: string, req: UpdateSurfaceRequest): Promise<Surface> {
    return this.c.request('PATCH', `/v1/metaverse/surfaces/${encodeURIComponent(id)}`, { body: req });
  }
  setSurfaceStatus(id: string, status: 'active' | 'paused'): Promise<{ status: string }> {
    return this.c.request('POST', `/v1/metaverse/surfaces/${encodeURIComponent(id)}/status`, { body: { status } });
  }

  /** Publisher proof-of-view earnings report. */
  views(params?: { from?: string; to?: string }): Promise<SurfaceViewReport> {
    return this.c.request('GET', '/v1/metaverse/views', { query: params });
  }
  /** Advertiser proof-of-view VERIFICATION report (real avatars, dwell, completions). */
  advertiserViews(params?: { from?: string; to?: string }): Promise<SurfaceViewReport> {
    return this.c.request('GET', '/v1/advertiser/metaverse/views', { query: params });
  }

  /** ADMIN: latest automatic trust-score snapshot per world (CPA-only ⇄ CPM tiering). */
  adminTrustScores(): Promise<WorldTrustScore[]> {
    return this.c.request('GET', '/v1/admin/metaverse/trust-scores');
  }
}

/**
 * Creative request/response shapes.
 */

import type { Creative } from '../shared';

/**
 * Create a creative. Field names are camelCase to match the control-plane DTO
 * (the API rejects unknown/snake_case fields). Covers every customization the
 * dashboard Creative Studio exposes; which fields apply depends on `type`.
 */
export interface CreateCreativeRequest {
  /** Attach to a campaign at creation, or omit for a library-only creative. */
  campaignId?: string;
  /** image | native | popunder_url | push | html5 | video */
  type: Creative['type'];
  landingUrl: string;
  /** Media asset (image / video / HTML5 bundle URL). Use {@link CreativesResource.upload} to host one. */
  assetUrl?: string;
  title?: string;
  description?: string;
  /** Logo / icon (native, push). */
  iconUrl?: string;
  /** Feature image (native). */
  mainImageUrl?: string;
  cta?: string;
  brandName?: string;
  /** Native star rating (0–5, one decimal). */
  starRating?: number;
  width?: number;
  height?: number;
  /** Rotation weight when multiple creatives serve one campaign (default 1). */
  weight?: number;
  /* ---- VAST video (type video / audio) ---- */
  /** Media duration in seconds (1–600). Probed from `vastTagUrl` when omitted. */
  duration?: number;
  /** >0 makes the linear ad skippable after N seconds (0–600). */
  skipOffsetSec?: number;
  /** Interactive VPAID (application/javascript) creative file — https. */
  vpaidUrl?: string;
  /** Companion banners (VAST CompanionAds), max 5. */
  companions?: CreativeCompanion[];
  /**
   * Third-party VAST tag from your own ad server (https, ≤2048 chars). Only valid
   * for type `video`/`audio`. A video creative needs `assetUrl` OR `vastTagUrl`;
   * with no `assetUrl` Adviverse serves a VAST Wrapper pointing at this tag (when
   * both are set the hosted asset wins). Pass `null` on update to clear it.
   */
  vastTagUrl?: string | null;
}

/** A VAST companion banner (request shape, camelCase). */
export interface CreativeCompanion {
  width: number;
  height: number;
  /** Static image (https). */
  staticUrl: string;
  /** e.g. image/png — inferred from the URL when omitted. */
  staticMime?: string;
  /** Companion click-through; falls back to the creative's landingUrl. */
  clickUrl?: string;
}

/** Editable creative content fields (`type` & `campaignId` are fixed at creation). */
export type UpdateCreativeRequest = Omit<CreateCreativeRequest, 'campaignId' | 'type'>;

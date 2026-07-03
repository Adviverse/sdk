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
}

/** Editable creative content fields (`type` & `campaignId` are fixed at creation). */
export type UpdateCreativeRequest = Omit<CreateCreativeRequest, 'campaignId' | 'type'>;

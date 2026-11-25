/** AI Creative Studio (`/v1/advertiser/creative-studio/*`) and per-ad-set creative
 * auto-optimization (`/v1/advertiser/campaigns/:id/creative-optimization`). */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export type StudioFormat = 'native' | 'banner' | 'push' | 'interstitial';

export interface StudioVariant {
  format: StudioFormat;
  headline: string;
  body: string;
  cta: string;
}

export interface StudioGenerateInput {
  /** Landing page to read (title/description/og tags). Give this and/or `brief`. */
  landingUrl?: string;
  brief?: string;
  formats: StudioFormat[];
  /** Variants per format, 1-8 (default 4). */
  count?: number;
}

export interface StudioGeneration {
  id: string;
  landingUrl: string | null;
  brief: string | null;
  formats: StudioFormat[];
  count: number;
  model: string;
  status: 'pending' | 'ok' | 'error';
  error: string | null;
  page: { url: string; title: string; description: string; ogTitle: string; ogDescription: string; ogImage: string; siteName: string } | null;
  variants: StudioVariant[];
  inputTokens: number | null;
  outputTokens: number | null;
  savedCreativeIds: string[];
  createdAt: string;
}

export interface StudioSaveInput {
  generationId: string;
  variants: StudioVariant[];
  /** Defaults to the generation's landing URL. */
  landingUrl?: string;
  /** Defaults to the landing page og:image. */
  mainImageUrl?: string;
  /** Icon for push creatives. */
  iconUrl?: string;
  brandName?: string;
  /** Also attach the saved creatives to this ad set. */
  campaignId?: string;
}

export interface CreativeOptimization {
  enabled: boolean;
  windowDays: number;
  creatives: Array<{
    creativeId: string;
    title: string | null;
    type: string;
    moderationStatus: string;
    impressions: number;
    clicks: number;
    /** 0-1 */
    ctr: number;
    /** Impression share within the ad set, 0-1. */
    share: number;
  }>;
}

export class CreativeStudioResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** Generate copy variants (nothing is saved yet). 503 if the server has no AI key; 429 past the hourly limit. */
  generate(body: StudioGenerateInput): Promise<StudioGeneration> {
    return this.c.request('POST', '/v1/advertiser/creative-studio/generate', { body });
  }
  /** Save selected variants as library creatives (they go through moderation). */
  save(body: StudioSaveInput): Promise<{ creatives: Array<Record<string, unknown>> }> {
    return this.c.request('POST', '/v1/advertiser/creative-studio/save', { body });
  }
  /** Past generation requests, newest first. */
  history(limit?: number): Promise<StudioGeneration[]> {
    return this.c.request('GET', '/v1/advertiser/creative-studio/history', limit ? { query: { limit } } : undefined);
  }
  /** "Auto-optimize creatives" state + per-creative 30-day CTR and share for an ad set. */
  getOptimization(campaignId: string): Promise<CreativeOptimization> {
    return this.c.request('GET', `/v1/advertiser/campaigns/${encodeURIComponent(campaignId)}/creative-optimization`);
  }
  /** Turn Thompson-sampling creative rotation on/off for an ad set. */
  setOptimization(campaignId: string, enabled: boolean): Promise<CreativeOptimization> {
    return this.c.request('PUT', `/v1/advertiser/campaigns/${encodeURIComponent(campaignId)}/creative-optimization`, { body: { enabled } });
  }
}

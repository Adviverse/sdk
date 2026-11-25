/** Web push notifications (subscriber-based push). Maps onto `/v1/push/*` and
 * `/v1/publisher/push/*`. Browsers subscribe through the publisher-hosted service
 * worker; this resource covers server-side subscription ingest and the
 * publisher's setup + subscriber stats. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushPlacementView {
  placementId: string;
  tagKey: string;
  /** False when the platform VAPID keys are unset (push disabled). */
  configured: boolean;
  workerUrl: string;
  /** Contents of /adviverse-sw.js to host at the site root. */
  serviceWorkerFile: string;
  snippet: string;
  subscribers: { active: number; total: number; new7d: number; sentToday: number };
  byCountry: { country: string; count: number }[];
  byDevice: { device: string; count: number }[];
}

export class PushResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** Register (or refresh) a browser PushSubscription for a push placement tag. Deduped by endpoint. */
  subscribe(tag: string, subscription: PushSubscriptionJSON): Promise<{ ok: boolean }> {
    return this.c.request('POST', '/v1/push/subscribe', { body: { tag, subscription } });
  }
  /** Mark a subscription unsubscribed by its endpoint. */
  unsubscribe(endpoint: string): Promise<{ ok: boolean }> {
    return this.c.request('POST', '/v1/push/unsubscribe', { body: { endpoint } });
  }
  /** Setup (service-worker file, snippet) and subscriber counts for one owned push placement. */
  placement(placementId: string): Promise<PushPlacementView> {
    return this.c.request('GET', `/v1/publisher/push/placements/${encodeURIComponent(placementId)}`);
  }
}

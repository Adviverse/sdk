/** External DSP partners (RTB demand): a DSP applies publicly; an admin approves
 * and manages it. Active partners receive the SSP's OpenRTB 2.6 bid requests.
 * Maps onto `/v1/dsp-partners/apply` and `/v1/admin/dsp-partners`. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export type DspPartnerStatus = 'pending' | 'active' | 'paused' | 'rejected';

/** Public application to buy Adviverse supply over OpenRTB. */
export interface DspApplyRequest {
  name: string;
  contactEmail: string;
  /** https OpenRTB bid endpoint (must resolve to a public address). */
  endpointUrl: string;
  company?: string;
  /** Placement formats to receive (e.g. `banner`, `video`, `native`); empty = all. */
  formats?: string[];
  /** ISO-2 countries; empty = all. */
  geos?: string[];
  /** Max bid requests per second (0 = unlimited). */
  qpsLimit?: number;
  notes?: string;
}

/** Admin create/update fields (all optional on update). */
export interface DspPartnerFields extends Partial<DspApplyRequest> {
  status?: DspPartnerStatus;
  /** 10-1000 ms. */
  timeoutMs?: number;
  /** Header sent on every bid request, e.g. `X-Api-Key`. */
  authHeader?: string;
  /** Header value; stored encrypted, never returned. '' clears it. */
  authSecret?: string;
}

export interface DspStats {
  req: number;
  bids: number;
  wins: number;
  /** USD clearing value of won bids. */
  spend: number;
}

export interface DspPartner {
  id: string;
  name: string;
  company: string | null;
  contact_email: string;
  endpoint_url: string;
  status: DspPartnerStatus;
  timeout_ms: number;
  qps_limit: number;
  formats: string[];
  geos: string[];
  auth_header: string | null;
  has_auth_secret: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** Present on `list()`. */
  stats?: DspStats;
}

export class DspPartnersResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }

  /** Public: apply as a DSP partner (created as `pending`). */
  apply(req: DspApplyRequest): Promise<{ id: string; status: DspPartnerStatus }> {
    return this.c.request('POST', '/v1/dsp-partners/apply', { body: req });
  }

  /** Admin: every partner with stats summed over the last `days` (default 7). */
  list(params: { days?: number } = {}): Promise<DspPartner[]> {
    return this.c.request('GET', '/v1/admin/dsp-partners', { query: params });
  }

  /** Admin: create a partner. */
  create(req: DspApplyRequest & DspPartnerFields): Promise<DspPartner> {
    return this.c.request('POST', '/v1/admin/dsp-partners', { body: req });
  }

  /** Admin: update a partner (approve = `{ status: 'active' }`). */
  update(id: string, fields: DspPartnerFields): Promise<DspPartner> {
    return this.c.request('PATCH', `/v1/admin/dsp-partners/${encodeURIComponent(id)}`, { body: fields });
  }

  /** Admin: delete a partner. */
  delete(id: string): Promise<{ ok: boolean }> {
    return this.c.request('DELETE', `/v1/admin/dsp-partners/${encodeURIComponent(id)}`);
  }

  /** Admin: per-UTC-day stats for one partner, newest first. */
  stats(id: string, params: { days?: number } = {}): Promise<{ total: DspStats; days: ({ day: string } & DspStats)[] }> {
    return this.c.request('GET', `/v1/admin/dsp-partners/${encodeURIComponent(id)}/stats`, { query: params });
  }
}

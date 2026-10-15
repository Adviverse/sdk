/** Agency-facing advertiser resource groups: team seats + per-pixel RBAC,
 * agency clients (billable entities) + spend tagging, in-platform invoicing,
 * and pixel ownership transfer. Split out of `advertiser.ts` to honor the
 * repo's 650-line cap; re-exported from there so the public API is unchanged. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

/** Agency team seats + per-pixel access control (RBAC). */
export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'analyst';
  status: 'invited' | 'active' | 'disabled';
  allPixels: boolean;
  pixelIds: string[];
  lastLoginAt: string | null;
  createdAt: string;
}
export class TeamResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Every seat under the account, with each member's role + pixel grants. */
  list(): Promise<TeamMember[]> {
    return this.c.request('GET', '/v1/advertiser/team');
  }
  /**
   * Invite a team member. `role` 'admin' grants full account access; 'manager'
   * and 'analyst' are confined to the assigned `pixelIds` (managers can write,
   * analysts are read-only). `allPixels: true` grants every pixel.
   */
  invite(body: { email: string; name?: string; role: 'admin' | 'manager' | 'analyst'; allPixels?: boolean; pixelIds?: string[] }): Promise<TeamMember> {
    return this.c.request('POST', '/v1/advertiser/team', { body });
  }
  /** Change a member's role, pixel grants, name, or status ('active'|'disabled'). */
  update(id: string, body: { role?: 'admin' | 'manager' | 'analyst'; allPixels?: boolean; pixelIds?: string[]; status?: 'active' | 'disabled'; name?: string }): Promise<TeamMember> {
    return this.c.request('POST', `/v1/advertiser/team/${encodeURIComponent(id)}`, { body });
  }
  /** Re-send a pending member's invitation email. */
  resendInvite(id: string): Promise<{ ok: boolean }> {
    return this.c.request('POST', `/v1/advertiser/team/${encodeURIComponent(id)}/resend`);
  }
  /** Remove a seat entirely (revokes their sessions). */
  remove(id: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `/v1/advertiser/team/${encodeURIComponent(id)}`);
  }
}

/** Agency clients (billable entities) + campaign spend tagging. */
export interface AgencyClient {
  id: string; name: string; billingEmail: string; pixelId: string;
  notes: string; status: string; taggedCampaigns: number; createdAt: string;
}
export class ClientsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** List the agency's clients (with tagged-campaign counts). */
  list(): Promise<AgencyClient[]> {
    return this.c.request('GET', '/v1/advertiser/clients');
  }
  get(id: string): Promise<AgencyClient> {
    return this.c.request('GET', `/v1/advertiser/clients/${encodeURIComponent(id)}`);
  }
  create(body: { name: string; billingEmail?: string; pixelId?: string; notes?: string }): Promise<AgencyClient> {
    return this.c.request('POST', '/v1/advertiser/clients', { body });
  }
  update(id: string, body: { name?: string; billingEmail?: string; pixelId?: string; notes?: string; status?: 'active' | 'archived' }): Promise<AgencyClient> {
    return this.c.request('POST', `/v1/advertiser/clients/${encodeURIComponent(id)}`, { body });
  }
  remove(id: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `/v1/advertiser/clients/${encodeURIComponent(id)}`);
  }
  /** Campaigns owned by the account with their current client tag. */
  campaigns(): Promise<Array<{ id: string; name: string; client_id: string | null; status: string }>> {
    return this.c.request('GET', '/v1/advertiser/clients/campaigns');
  }
  /** Tag (or untag with clientId=null) a campaign to a client so its spend rolls up. */
  tagCampaign(campaignId: string, clientId: string | null): Promise<{ tagged: boolean }> {
    return this.c.request('POST', '/v1/advertiser/clients/tag', { body: { campaignId, clientId } });
  }
  /** Spend + delivery for a client over a period (defaults to last 30d). */
  spend(id: string, from?: string, to?: string): Promise<{ spend: number; impressions: number; clicks: number; conversions: number; campaigns: number }> {
    return this.c.request('GET', `/v1/advertiser/clients/${encodeURIComponent(id)}/spend`, { query: { ...(from ? { from } : {}), ...(to ? { to } : {}) } });
  }
}

/** Agency invoicing (per-client in-platform billing). */
export interface Invoice {
  id: string; clientId: string; clientName: string; number: string;
  status: 'draft' | 'sent' | 'paid' | 'void'; currency: string;
  subtotal: number; total: number; periodStart: string | null; periodEnd: string | null;
  notes: string; payToken: string | null; issuedAt: string | null; dueAt: string | null; paidAt: string | null;
  items: Array<{ id: string; description: string; kind: string; quantity: number; unitAmount: number; amount: number }>;
}
export class InvoicesResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  list(clientId?: string): Promise<Invoice[]> {
    return this.c.request('GET', '/v1/advertiser/invoices', { query: clientId ? { clientId } : undefined });
  }
  get(id: string): Promise<Invoice> {
    return this.c.request('GET', `/v1/advertiser/invoices/${encodeURIComponent(id)}`);
  }
  /**
   * Create a draft invoice. With a period, auto-adds the client's tagged-campaign
   * spend as a line, plus an optional markupPct agency fee. Extra manual items
   * may be supplied.
   */
  create(body: { clientId: string; periodStart?: string; periodEnd?: string; currency?: string; dueAt?: string; notes?: string; markupPct?: number; includeSpend?: boolean; items?: Array<{ description: string; kind?: string; quantity?: number; unitAmount?: number; amount?: number }> }): Promise<Invoice> {
    return this.c.request('POST', '/v1/advertiser/invoices', { body });
  }
  addItem(id: string, item: { description: string; kind?: string; quantity?: number; unitAmount?: number; amount?: number }): Promise<Invoice> {
    return this.c.request('POST', `/v1/advertiser/invoices/${encodeURIComponent(id)}/items`, { body: item });
  }
  removeItem(id: string, itemId: string): Promise<Invoice> {
    return this.c.request('DELETE', `/v1/advertiser/invoices/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}`);
  }
  /** Send the invoice: mints a public pay link + emails the client. Returns it with `payLink`. */
  send(id: string): Promise<Invoice & { payLink: string }> {
    return this.c.request('POST', `/v1/advertiser/invoices/${encodeURIComponent(id)}/send`);
  }
  /** Record an offline/out-of-band payment. */
  markPaid(id: string): Promise<Invoice> {
    return this.c.request('POST', `/v1/advertiser/invoices/${encodeURIComponent(id)}/mark-paid`);
  }
  void(id: string): Promise<Invoice> {
    return this.c.request('POST', `/v1/advertiser/invoices/${encodeURIComponent(id)}/void`);
  }
}

/** Pixel ownership transfer (agency → a client's own account). */
export interface PixelTransfer {
  id: string; pixelId: string; pixelName: string; toEmail: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'expired';
  createdAt: string; expiresAt: string; acceptedAt: string | null;
}
export class TransfersResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Initiate a transfer of one of your pixels (and its audiences) to an email. */
  initiate(pixelId: string, email: string): Promise<PixelTransfer> {
    return this.c.request('POST', '/v1/advertiser/transfers', { body: { pixelId, email } });
  }
  /** Outgoing transfers you've initiated. */
  list(): Promise<PixelTransfer[]> {
    return this.c.request('GET', '/v1/advertiser/transfers');
  }
  cancel(id: string): Promise<{ cancelled: boolean }> {
    return this.c.request('POST', `/v1/advertiser/transfers/${encodeURIComponent(id)}/cancel`);
  }
  /** Preview an incoming transfer by its token (the recipient must be logged in). */
  info(token: string): Promise<{ status: string; pixelName: string; fromAgency: string; toEmail: string }> {
    return this.c.request('GET', '/v1/transfers/info', { query: { token } });
  }
  /** Accept an incoming transfer — the pixel + its audiences move to YOUR account. */
  accept(token: string): Promise<{ accepted: boolean; pixelId: string; audiencesMoved: number }> {
    return this.c.request('POST', '/v1/transfers/accept', { body: { token } });
  }
}

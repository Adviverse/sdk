/** Admin-guarded operations and the docs-CMS guides resource. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type { Ok, Guide, UpsertGuideRequest, Post, UpsertPostRequest } from '../types.js';

/**
 * Admin operations. Requires an account with admin roles (or an API key with the
 * `admin` scope). Every method here maps to an admin-guarded route.
 */
export class AdminResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  accounts(query?: { q?: string }): Promise<unknown[]> {
    return this.c.request('GET', '/v1/admin/accounts', { query });
  }
  setAccountStatus(id: string, status: 'active' | 'pending' | 'suspended' | 'banned' | 'closed'): Promise<Ok> {
    return this.c.request('POST', `/v1/admin/accounts/${encodeURIComponent(id)}/status`, { body: { status } });
  }
  moderation(query?: { type?: string }): Promise<unknown[]> {
    return this.c.request('GET', '/v1/admin/moderation', { query });
  }
  decideModeration(id: string, decision: 'approved' | 'rejected', notes?: string): Promise<Ok> {
    return this.c.request('POST', `/v1/admin/moderation/${encodeURIComponent(id)}/decide`, { body: { decision, notes } });
  }
  /** Re-scan a creative for cloaking + screenshot. */
  rescanCreative(creativeId: string): Promise<Ok> {
    return this.c.request('POST', `/v1/admin/moderation/${encodeURIComponent(creativeId)}/rescan`);
  }
  blocklist(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/admin/fraud/blocklist');
  }
  addBlocklist(body: { kind: 'ip' | 'domain' | 'asn' | 'device' | 'user_agent' | 'country' | 'subnet'; value: string; reason?: string }): Promise<Ok> {
    return this.c.request('POST', '/v1/admin/fraud/blocklist', { body });
  }
  fraudQuality(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/admin/fraud/quality');
  }
  payouts(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/admin/payouts');
  }
  processPayout(id: string): Promise<{ ok: boolean; status: string }> {
    return this.c.request('POST', `/v1/admin/payouts/${encodeURIComponent(id)}/process`);
  }
  getConfig(): Promise<Array<{ key: string; value: unknown }>> {
    return this.c.request('GET', '/v1/admin/config');
  }
  setConfig(key: string, value?: unknown): Promise<Ok> {
    return this.c.request('POST', '/v1/admin/config', { body: { key, value } });
  }
  audit(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/admin/audit');
  }
  /** Properties ranked by Made-For-Advertising risk score. */
  mfaRanking(limit?: number): Promise<unknown[]> {
    return this.c.request('GET', '/v1/admin/mfa', { query: { limit } });
  }
  createRegion(body: { code: string; name: string; public_endpoint: string; lat: number; lng: number; country_codes?: string[]; status?: 'active' | 'draining' | 'disabled'; priority?: number }): Promise<unknown> {
    return this.c.request('POST', '/v1/admin/regions', { body });
  }
  updateRegion(id: string, body: Record<string, unknown>): Promise<unknown> {
    return this.c.request('PATCH', `/v1/admin/regions/${encodeURIComponent(id)}`, { body });
  }
  /** List data-subject access/deletion requests. */
  dsarList(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/admin/dsar');
  }
  /** Mark a DSAR complete. */
  completeDsar(id: string): Promise<Ok> {
    return this.c.request('POST', `/v1/admin/dsar/${encodeURIComponent(id)}/complete`);
  }
}

/**
 * Docs CMS. Public read (the dashboard's in-app docs); admin create/update/delete
 * edits content at runtime (no redeploy). Public SSR HTML is served separately at
 * `/guides` and `/guides/:slug`. (The OpenAPI reference is at `/v1/docs`.)
 */
export class GuidesResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Published guides (optionally filtered by category). */
  list(opts: { locale?: string; category?: string } = {}): Promise<Guide[]> {
    return this.c.request('GET', '/v1/guides', { query: opts });
  }
  /** One published guide by slug. */
  get(slug: string, locale?: string): Promise<Guide> {
    return this.c.request('GET', `/v1/guides/${encodeURIComponent(slug)}`, { query: { locale } });
  }
  /** All guides incl. drafts (admin). */
  adminList(locale?: string): Promise<Guide[]> {
    return this.c.request('GET', '/v1/admin/guides', { query: { locale } });
  }
  /** Create (or upsert by slug+locale) a guide (admin). */
  create(body: UpsertGuideRequest & { slug: string; title: string }): Promise<Guide> {
    return this.c.request('POST', '/v1/admin/guides', { body });
  }
  /** Update a guide (admin). */
  update(id: string, body: UpsertGuideRequest): Promise<Guide> {
    return this.c.request('PATCH', `/v1/admin/guides/${encodeURIComponent(id)}`, { body });
  }
  /** Delete a guide (admin). */
  delete(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/admin/guides/${encodeURIComponent(id)}`);
  }
}

/**
 * Blog. Public read (the dashboard's in-app blog); admin create/update/delete
 * edits content at runtime (no redeploy). Public SSR HTML is served separately at
 * `/blog` and `/blog/:slug`.
 */
export class BlogResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Published posts (optionally filtered by tag), newest first. */
  list(opts: { locale?: string; tag?: string } = {}): Promise<Post[]> {
    return this.c.request('GET', '/v1/blog', { query: opts });
  }
  /** One published post by slug. */
  get(slug: string, locale?: string): Promise<Post> {
    return this.c.request('GET', `/v1/blog/${encodeURIComponent(slug)}`, { query: { locale } });
  }
  /** All posts incl. drafts (admin). */
  adminList(locale?: string): Promise<Post[]> {
    return this.c.request('GET', '/v1/admin/blog', { query: { locale } });
  }
  /** Create (or upsert by slug+locale) a post (admin). */
  create(body: UpsertPostRequest & { slug: string; title: string }): Promise<Post> {
    return this.c.request('POST', '/v1/admin/blog', { body });
  }
  /** Update a post (admin). */
  update(id: string, body: UpsertPostRequest): Promise<Post> {
    return this.c.request('PATCH', `/v1/admin/blog/${encodeURIComponent(id)}`, { body });
  }
  /** Delete a post (admin). */
  delete(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/admin/blog/${encodeURIComponent(id)}`);
  }
}

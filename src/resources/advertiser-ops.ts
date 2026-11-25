/** Advertiser tooling: product feeds, warehouse exports, verification settings
 * and automation rules/alerts. Re-exported from `advertiser.ts`. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type {
  Pagination,
  Ok,
  CreateFeedRequest,
  CreateAutomationRuleRequest,
  VerificationSettings,
  RunExportRequest,
} from '../types.js';

/** Product feeds (catalog source for dynamic product ads / DCO). */
export class FeedsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  list(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/advertiser/feeds');
  }
  create(body: CreateFeedRequest): Promise<unknown> {
    return this.c.request('POST', '/v1/advertiser/feeds', { body });
  }
  /** Trigger an immediate fetch/refresh of the feed's products. */
  fetch(id: string): Promise<unknown> {
    return this.c.request('POST', `/v1/advertiser/feeds/${encodeURIComponent(id)}/fetch`);
  }
  products(id: string, page?: Pagination): Promise<{ products: unknown[] }> {
    return this.c.request('GET', `/v1/advertiser/feeds/${encodeURIComponent(id)}/products`, { query: page });
  }
}

/** Warehouse exports (events / conversions / spend → CSV/NDJSON). */
export class ExportsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  run(body: RunExportRequest): Promise<unknown> {
    return this.c.request('POST', '/v1/exports/run', { body });
  }
  list(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/exports');
  }
}

/** Third-party measurement / brand-safety vendor configuration. */
export class VerificationResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  categories(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/verification/categories');
  }
  settings(): Promise<VerificationSettings> {
    return this.c.request('GET', '/v1/verification/settings');
  }
  saveSettings(body: VerificationSettings): Promise<VerificationSettings> {
    return this.c.request('PUT', '/v1/verification/settings', { body });
  }
}

/** Automation rules, the budget optimizer log, and anomaly alerts (advertiser). */
export class AutomationResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  rules(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/automation/rules');
  }
  createRule(body: CreateAutomationRuleRequest): Promise<unknown> {
    return this.c.request('POST', '/v1/automation/rules', { body });
  }
  deleteRule(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/automation/rules/${encodeURIComponent(id)}`);
  }
  /** Enable or disable a rule (pause it without deleting). */
  setRuleEnabled(id: string, enabled: boolean): Promise<unknown> {
    return this.c.request('PATCH', `/v1/automation/rules/${encodeURIComponent(id)}`, { body: { enabled } });
  }
  /** Recent automated budget-reallocation actions. */
  optimizerLog(limit?: number): Promise<unknown[]> {
    return this.c.request('GET', '/v1/optimizer/log', { query: { limit } });
  }
  alerts(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/alerts');
  }
  ackAlert(id: string): Promise<unknown> {
    return this.c.request('POST', `/v1/alerts/${encodeURIComponent(id)}/ack`);
  }
}

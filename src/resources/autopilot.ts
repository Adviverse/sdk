/** Advertiser Autopilot (`/v1/advertiser/autopilot*`) and Publisher Yield
 * Autopilot (`/v1/publisher/yield-autopilot*`): goal-driven bid/budget and
 * fill-guarded floor tuning with an action log, dry-run and one-click revert. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export type AutopilotGoal = 'target_cpa' | 'target_roas' | 'max_conversions' | 'max_clicks';

export interface AutopilotConfigInput {
  /** Exactly one of groupId (campaign group) or campaignId (ad set). */
  groupId?: string;
  campaignId?: string;
  goal: AutopilotGoal;
  /** Target CPA (currency) or target ROAS ratio; required for target_* goals. */
  target?: number;
  minBid?: number;
  maxBid?: number;
  /** Total daily budget cap across the group's ad sets. */
  dailyBudgetCap?: number;
  /** Max change per run in percent (1-50, default 10). */
  maxStepPct?: number;
  windowHours?: number;
  /** target_cpa only: delegate placement blocking to one CPA Goal rule per ad set. */
  blockPlacements?: boolean;
  /** Default true: log proposals only. */
  dryRun?: boolean;
  enabled?: boolean;
}

export interface AutopilotConfig {
  id: string;
  groupId: string | null;
  campaignId: string | null;
  goal: AutopilotGoal;
  target: number | null;
  minBid: number;
  maxBid: number | null;
  dailyBudgetCap: number | null;
  maxStepPct: number;
  windowHours: number;
  blockPlacements: boolean;
  dryRun: boolean;
  enabled: boolean;
  lastRunAt: string | null;
  createdAt: string;
}

export interface AutopilotAction {
  id: string;
  campaignId: string;
  campaignName: string | null;
  runId: string;
  action: 'bid' | 'budget' | 'block_rule';
  before: number | null;
  after: number | null;
  refId: string | null;
  reason: string;
  metrics: Record<string, number>;
  dryRun: boolean;
  revertedAt: string | null;
  createdAt: string;
}

export interface YieldAutopilotConfigInput {
  /** Exactly one of placementId or propertyId (every placement of the property). */
  placementId?: string;
  propertyId?: string;
  /** Minimum paid fill rate to keep (0.01-0.99, default 0.6). */
  minFill?: number;
  maxStepPct?: number;
  minFloor?: number;
  maxFloor?: number;
  windowHours?: number;
  dryRun?: boolean;
  enabled?: boolean;
}

export interface YieldAutopilotConfig {
  id: string;
  placementId: string | null;
  propertyId: string | null;
  minFill: number;
  maxStepPct: number;
  minFloor: number;
  maxFloor: number | null;
  windowHours: number;
  dryRun: boolean;
  enabled: boolean;
  lastRunAt: string | null;
  createdAt: string;
}

export interface YieldAutopilotAction {
  id: string;
  placementId: string;
  placementName: string | null;
  runId: string;
  action: 'floor';
  before: number;
  after: number;
  reason: string;
  metrics: Record<string, number>;
  dryRun: boolean;
  revertedAt: string | null;
  createdAt: string;
}

export interface AutopilotRunResult<A> {
  runId: string;
  dryRun: boolean;
  actions: Partial<A>[];
}

export interface AutopilotRevertResult {
  runId: string;
  reverted: number;
  skipped: number;
  dryRun: boolean;
}

export interface ComboRecommendation {
  key: string;
  label: string;
  description: string;
  missingFormats: string[];
}

const ADV = '/v1/advertiser/autopilot';
const PUB = '/v1/publisher/yield-autopilot';
const id = (s: string) => encodeURIComponent(s);

export class AutopilotResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(filter?: { groupId?: string; campaignId?: string }): Promise<AutopilotConfig[]> {
    return this.c.request('GET', ADV, filter ? { query: filter } : undefined);
  }
  /** Create or update (one config per group / ad set). */
  upsert(body: AutopilotConfigInput): Promise<AutopilotConfig> {
    return this.c.request('PUT', ADV, { body });
  }
  delete(configId: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `${ADV}/${id(configId)}`);
  }
  actions(configId: string, limit?: number): Promise<AutopilotAction[]> {
    return this.c.request('GET', `${ADV}/${id(configId)}/actions`, limit ? { query: { limit } } : undefined);
  }
  run(configId: string): Promise<AutopilotRunResult<AutopilotAction>> {
    return this.c.request('POST', `${ADV}/${id(configId)}/run`);
  }
  /** Undo the latest applied run and switch the config to dry-run. */
  revert(configId: string): Promise<AutopilotRevertResult> {
    return this.c.request('POST', `${ADV}/${id(configId)}/revert`);
  }
}

export class YieldAutopilotResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(filter?: { placementId?: string; propertyId?: string }): Promise<YieldAutopilotConfig[]> {
    return this.c.request('GET', PUB, filter ? { query: filter } : undefined);
  }
  upsert(body: YieldAutopilotConfigInput): Promise<YieldAutopilotConfig> {
    return this.c.request('PUT', PUB, { body });
  }
  delete(configId: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `${PUB}/${id(configId)}`);
  }
  actions(configId: string, limit?: number): Promise<YieldAutopilotAction[]> {
    return this.c.request('GET', `${PUB}/${id(configId)}/actions`, limit ? { query: { limit } } : undefined);
  }
  /** Combo presets that would add formats the property doesn't run yet (never auto-applied). */
  recommendations(configId: string): Promise<{ propertyId: string; combos: ComboRecommendation[] }> {
    return this.c.request('GET', `${PUB}/${id(configId)}/recommendations`);
  }
  run(configId: string): Promise<AutopilotRunResult<YieldAutopilotAction>> {
    return this.c.request('POST', `${PUB}/${id(configId)}/run`);
  }
  revert(configId: string): Promise<AutopilotRevertResult> {
    return this.c.request('POST', `${PUB}/${id(configId)}/revert`);
  }
}

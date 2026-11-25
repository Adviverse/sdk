/** CPA Goal: per-campaign rules that auto-block (unlink) placements that spend
 * without converting. Maps onto `/v1/advertiser/campaigns/:id/cpa-goals*`.
 * Requires S2S conversion postbacks (`/v1/track/conversion`). */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export type CpaGoalMetric = 'conversions' | 'ecpa';
export type CpaGoalOp = 'lt' | 'lte' | 'gt' | 'gte';

export interface CpaGoalRuleInput {
  /** conversions: block when conversions <op> value. ecpa: block when spend / max(conversions,1) <op> value. */
  metric: CpaGoalMetric;
  /** lt|lte for conversions, gt|gte for ecpa. */
  op: CpaGoalOp;
  value: number;
  /** Minimum spend on the placement before the rule may fire (default 0). */
  spendThreshold?: number;
  /** Lookback window in days, 1-90 (default 30). */
  windowDays?: number;
  enabled?: boolean;
}

export interface CpaGoalRule extends Required<CpaGoalRuleInput> {
  id: string;
  campaignId: string;
  lastRunAt: string | null;
  createdAt: string;
}

export interface CpaGoalDecision {
  placementId: string;
  ruleId: string;
  spend: number;
  conversions: number;
  ecpa: number | null;
}

export interface CpaGoalAction {
  id: string;
  ruleId: string | null;
  placementId: string;
  action: string;
  spend: number;
  conversions: number;
  createdAt: string;
}

export class CpaGoalsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  private base(campaignId: string) {
    return `/v1/advertiser/campaigns/${encodeURIComponent(campaignId)}/cpa-goals`;
  }
  /** Rules + whether conversion tracking is set up + whether CPA Goal applies (CPM/CPC). */
  list(campaignId: string): Promise<{ rules: CpaGoalRule[]; trackingConfigured: boolean; applicable: boolean }> {
    return this.c.request('GET', this.base(campaignId));
  }
  create(campaignId: string, body: CpaGoalRuleInput): Promise<CpaGoalRule> {
    return this.c.request('POST', this.base(campaignId), { body });
  }
  update(campaignId: string, ruleId: string, body: Partial<CpaGoalRuleInput>): Promise<CpaGoalRule> {
    return this.c.request('PATCH', `${this.base(campaignId)}/${encodeURIComponent(ruleId)}`, { body });
  }
  delete(campaignId: string, ruleId: string): Promise<{ deleted: boolean }> {
    return this.c.request('DELETE', `${this.base(campaignId)}/${encodeURIComponent(ruleId)}`);
  }
  /** Dry run: placements the enabled rules would block right now. */
  preview(campaignId: string): Promise<{ placements: CpaGoalDecision[] }> {
    return this.c.request('GET', `${this.base(campaignId)}/preview`);
  }
  /** Placements CPA Goal has blocked, newest first. */
  actions(campaignId: string, limit?: number): Promise<CpaGoalAction[]> {
    return this.c.request('GET', `${this.base(campaignId)}/actions`, limit ? { query: { limit } } : undefined);
  }
}

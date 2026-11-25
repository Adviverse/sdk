/** Instant USDC payouts + opt-in auto-payout for publishers, and the admin view.
 * Maps onto `/v1/finance/instant-payouts*` and `/v1/admin/instant-payouts`. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export type UsdcNetwork = 'BSC' | 'Solana' | 'Ethereum';

export interface InstantPayoutSettingsInput {
  address?: string;
  network?: UsdcNetwork;
  memo?: string;
  /** Pay the whole available balance automatically once it reaches autoThreshold. */
  autoEnabled?: boolean;
  /** USD, at least the minimum payout. Required when autoEnabled. */
  autoThreshold?: number;
  autoCadence?: 'daily' | 'weekly';
}

export interface InstantPayoutLimits {
  maxPerPayout: number;
  maxPerDay: number;
  sentLast24h?: number;
  remainingToday?: number;
  minAccountAgeDays: number;
  walletCooldownHours: number;
  minQualityScore: number;
  minPayout?: number;
}

export interface InstantPayoutRecord {
  id: string;
  amount: string;
  status: string;
  origin: 'instant' | 'auto';
  instant: boolean;
  hold_reason: string | null;
  provider_ref: string | null;
  tx_hash: string | null;
  requested_at: string;
  processed_at: string | null;
}

export interface InstantPayoutStatus {
  enabled: boolean;
  providerReady: boolean;
  networks: UsdcNetwork[];
  settings: {
    address: string;
    network: UsdcNetwork;
    currency: string;
    memo: string | null;
    walletChangedAt: string;
    autoEnabled: boolean;
    autoThreshold: number | null;
    autoCadence: 'daily' | 'weekly';
    lastAutoAt: string | null;
    lastAutoResult: string | null;
  } | null;
  available: number;
  eligibility: { ok: boolean; reasons: string[] };
  limits: InstantPayoutLimits;
  recent: InstantPayoutRecord[];
}

export interface InstantPayoutResult {
  payout: string;
  /** instant = sent now; queued = a gate failed, waiting in the manual payout queue. */
  mode: 'instant' | 'queued' | 'duplicate';
  status: string;
  reasons?: string[];
}

export interface AdminInstantPayouts {
  enabled: boolean;
  providerReady: boolean;
  limits: InstantPayoutLimits;
  sentLast24h: number;
  autoEnabledAccounts: number;
  payouts: (InstantPayoutRecord & { publisher_id: string; publisher_email: string | null; network: string | null })[];
}

export class InstantPayoutsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** Wallet, auto-payout rule, current gate verdict, limits and recent instant/auto payouts. */
  status(): Promise<InstantPayoutStatus> {
    return this.c.request('GET', '/v1/finance/instant-payouts');
  }
  /** Save the USDC wallet and/or auto-payout rule (a wallet change starts a cooldown). */
  saveSettings(body: InstantPayoutSettingsInput): Promise<InstantPayoutStatus> {
    return this.c.request('PUT', '/v1/finance/instant-payouts/settings', { body });
  }
  /** Cash out `amount` (default: all available) to the saved USDC wallet. */
  payout(amount?: number): Promise<InstantPayoutResult> {
    return this.c.request('POST', '/v1/finance/instant-payouts', { body: amount === undefined ? {} : { amount } });
  }
  /** Admin: kill-switch state, limits and the latest instant/auto payouts. */
  adminOverview(): Promise<AdminInstantPayouts> {
    return this.c.request('GET', '/v1/admin/instant-payouts');
  }
}

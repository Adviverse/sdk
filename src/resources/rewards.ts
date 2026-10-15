/** Rewarded-crypto experiences: fund a per-campaign reward pool for a metaverse
 * portal/experience; each verified completion pays the end-user a crypto reward —
 * TENANT-CUSTODIED. Adviverse escrows the advertiser's money, attests completions,
 * credits the world operator, and emits a signed payout webhook the metaverse
 * operator fulfils on-chain in its own coin. Maps onto `/v1/rewards/*`. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

export interface FundPoolRequest {
  /** The portal/experience campaign this pool rewards completions for. */
  campaignId: string;
  /** Fixed reward paid per verified completion (in `token`). */
  perCompletion: number;
  /** Amount to escrow now (added to the pool's total_funded). */
  amount: number;
  /** Reward denomination; defaults to the account's own currency/token. */
  token?: string;
  /** Max rewards one end-user (user_ref) can earn per UTC day (default 5). */
  perUserDailyCap?: number;
  /** Max rewards one wallet can earn per UTC day (default 5). */
  perWalletDailyCap?: number;
}

export interface RewardPool {
  id: string;
  campaign_id: string;
  advertiser_id: string;
  token: string | null;
  /** 'world' = tenant-custodied (operator pays via webhook) | 'onchain_creative' = advertiser pays on-chain from the creative. */
  mode: string;
  payout_chain: string | null;
  total_funded: string | number;
  spent: string | number;
  per_completion: string | number;
  per_user_daily_cap: number;
  per_wallet_daily_cap: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOnchainPoolRequest {
  /** The portal/experience campaign this on-chain reward applies to. */
  campaignId: string;
  /** Display reward per completion (the real amount is enforced by your contract). */
  perCompletion: number;
  /** Coin symbol the end-user receives, e.g. BTC / ETH / USDC. */
  token: string;
  /** Chain the payout settles on, e.g. bitcoin / ethereum / base / polygon. */
  chain?: string;
  perUserDailyCap?: number;
  perWalletDailyCap?: number;
}

/** An on-chain reward pool plus the one-time voucher secret to verify eligibility vouchers. */
export interface OnchainRewardPool extends RewardPool {
  /** HMAC secret your contract/backend uses to verify Adviverse eligibility vouchers. */
  voucher_secret?: string;
}

export interface RewardReport {
  summary: {
    completions: number;
    sent: number;
    pending: number;
    failed: number;
    /** Attributed on-chain completions (advertiser-custodied mode). */
    onchain: number;
    /** On-chain completions whose payout tx hash was reported back. */
    onchainConfirmed: number;
    paid: number;
    recipients: number;
  };
  byCampaign: Array<{
    campaign_id: string | null;
    completions: number;
    sent: number;
    pending: number;
    failed: number;
    paid: number;
  }>;
  pools: Array<{
    campaign_id: string;
    token: string | null;
    mode: string;
    payout_chain: string | null;
    total_funded: number;
    spent: number;
    per_completion: number;
    status: string;
  }>;
  rows: Array<{
    request_id: string;
    campaign_id: string | null;
    wallet: string | null;
    user_ref: string | null;
    amount: number;
    token: string | null;
    status: string;
    /** On-chain payout transaction hash (advertiser-custodied mode), once reported. */
    tx_hash: string | null;
    attempts: number;
    created_at: string;
    sent_at: string | null;
  }>;
}

/** Rewarded-crypto experience pools + payout reporting (advertiser + operator side). */
export class RewardsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }

  /** Fund (or top up) a campaign's reward pool — escrows `amount` from your balance. */
  fundPool(req: FundPoolRequest): Promise<RewardPool> {
    return this.c.request('POST', '/v1/rewards/pools', { body: req });
  }

  /**
   * Create an ADVERTISER-CUSTODIED, on-chain-in-the-creative reward pool. No escrow:
   * your own dApp/contract in the portal pays the user on-chain. Returns the pool
   * plus the one-time `voucher_secret` your contract/backend uses to verify the
   * eligibility voucher Adviverse issues on each verified completion before paying.
   */
  createOnchainPool(req: CreateOnchainPoolRequest): Promise<OnchainRewardPool> {
    return this.c.request('POST', '/v1/rewards/pools/onchain', { body: req });
  }

  /** Fetch a campaign's on-chain reward voucher secret (verify vouchers with it). */
  voucherSecret(campaignId: string): Promise<{ campaignId: string; voucher_secret: string }> {
    return this.c.request('GET', `/v1/rewards/pools/${encodeURIComponent(campaignId)}/voucher-secret`);
  }

  /** List your reward pools. */
  listPools(): Promise<RewardPool[]> {
    return this.c.request('GET', '/v1/rewards/pools');
  }

  /** Get one campaign's reward pool. */
  getPool(campaignId: string): Promise<RewardPool> {
    return this.c.request('GET', `/v1/rewards/pools/${encodeURIComponent(campaignId)}`);
  }

  /** Pause / resume a reward pool. */
  setPoolStatus(campaignId: string, status: 'active' | 'paused'): Promise<{ status: string }> {
    return this.c.request('POST', `/v1/rewards/pools/${encodeURIComponent(campaignId)}/status`, {
      body: { status },
    });
  }

  /** Reward-payout report: completions, amounts paid, per-campaign + per-payout rows. */
  report(params?: { from?: string; to?: string }): Promise<RewardReport> {
    return this.c.request('GET', '/v1/rewards/report', { query: params });
  }

  /**
   * Point a metaverse world's reward-payout webhook at your endpoint. Adviverse
   * POSTs a signed `{ completion_id, campaign_id, user_ref, wallet, amount, token,
   * ts, sig }` per verified completion; you fulfil the end-user's on-chain payout.
   */
  setWorldWebhook(worldId: string, url: string): Promise<{ ok: boolean; worldId: string; reward_webhook_url: string }> {
    return this.c.request('POST', '/v1/rewards/world-webhook', { body: { worldId, url } });
  }
}

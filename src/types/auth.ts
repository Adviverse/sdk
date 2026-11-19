/**
 * Auth, account, and account-settings request/response shapes.
 */

import type { Account, AccountType } from '../shared';

export interface SignupRequest {
  type: AccountType;
  email: string;
  password: string;
  companyName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  totp?: string;
}

export interface LoginResponse {
  token: string;
  account: Account;
  [k: string]: unknown;
}

export interface MeResponse {
  id: string;
  /** The signup choice only; see `roles`. */
  type: AccountType;
  /** What the account can act as: every non-admin account is both publisher and advertiser. */
  roles?: Array<'publisher' | 'advertiser' | 'admin'>;
  email: string;
  adminRoles?: string[];
  twoFaEnabled?: boolean;
  emailVerified?: boolean;
  /** false = SSO-only account (no email+password login). */
  hasPassword?: boolean;
}

export interface TwoFaSetupResponse {
  secret: string;
  otpauthUrl: string;
  [k: string]: unknown;
}

/** A one-time code a terminal/CLI user sets as `ADVIVERSE_LINK_CODE` to link
 * their CLI to this account's identity. Single-use, short-lived (`expiresInSec`). */
export interface CliLinkCode {
  code: string;
  expiresInSec: number;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  rate: number;
  expires_at?: string | null;
  [k: string]: unknown;
}

/** Refer & earn (the Referalli affiliate program): GET /v1/referrals/affiliate. Amounts in USD. */
export interface AffiliateOverview {
  joined: boolean;
  code?: string | null;
  /** The account's `?via=` sign-up link. */
  link?: string | null;
  clicks?: number;
  signups?: number;
  pendingReview?: number;
  customers?: number;
  /** Referalli's sentence for the rule, e.g. "10% of every payment for 6 months". */
  summary: string | null;
  terms: { holdDays: number; capUsd: number; windowDays: number };
  /** pending = held for the hold period; settled = credited to the balance, net of reversals. */
  commissions: { pending: number; settled: number };
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events?: string[];
  /** Signing secret — returned only by create() and rotateSecret(); use revealSecret() otherwise. */
  secret?: string;
  /** list()/update(): whether a signing secret is set, and its last 4 chars. */
  has_secret?: boolean;
  secret_hint?: string | null;
  active?: boolean;
  created_at?: string;
  [k: string]: unknown;
}

export interface CreateWebhookRequest {
  url: string;
  events?: string[];
}

/** Partial update of a webhook endpoint (any subset). */
export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  active?: boolean;
}

/** One logged delivery attempt for a webhook subscription. */
export interface WebhookDelivery {
  id: string;
  event_type: string;
  status_code?: number | null;
  attempts: number;
  delivered: boolean;
  created_at: string;
  next_retry_at?: string | null;
}

/** Result of a ping/redeliver call. */
export interface WebhookDeliveryResult {
  delivered: boolean;
  statusCode: number;
  deliveryId: string;
}

export interface ApiKey {
  id: string;
  name?: string;
  prefix?: string;
  scopes?: string[];
  created_at?: string;
  /** ISO timestamp when the key expires; null/absent = never. */
  expires_at?: string | null;
  /** True when expires_at is in the past. */
  expired?: boolean;
  [k: string]: unknown;
}

export interface CreateApiKeyRequest {
  name?: string;
  scopes?: string[];
  /** Optional expiry in days (1..365). Omitted = never expires. */
  expiresInDays?: number;
}

export interface OnboardingProfile {
  goal?: string;
  name?: string;
  company?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  marketingOptIn?: boolean;
}

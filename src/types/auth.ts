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
  type: AccountType;
  email: string;
  adminRoles?: string[];
  twoFaEnabled?: boolean;
  emailVerified?: boolean;
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

export interface WebhookEndpoint {
  id: string;
  url: string;
  events?: string[];
  secret?: string;
  [k: string]: unknown;
}

export interface CreateWebhookRequest {
  url: string;
  events?: string[];
}

export interface ApiKey {
  id: string;
  name?: string;
  prefix?: string;
  scopes?: string[];
  created_at?: string;
  [k: string]: unknown;
}

export interface CreateApiKeyRequest {
  name?: string;
  scopes?: string[];
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

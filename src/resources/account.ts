/** Account & cross-cutting resource groups: auth, finance, deals, referrals,
 * webhooks, API keys, reporting, billing, account lifecycle, privacy and the
 * public stats endpoint. */

import type { Balance, LedgerEntry, ReportRow } from '../shared';
import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type {
  Pagination,
  Ok,
  SignupRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  TwoFaSetupResponse,
  DepositRequest,
  PayoutRequest,
  FinanceMethods,
  TaxFormRequest,
  ReportQuery,
  PublisherPlacementRow,
  PublisherFillReport,
  Deal,
  CreateDealRequest,
  AdvertiserLookup,
  DealClaimPreview,
  Referral,
  AffiliateOverview,
  WebhookEndpoint,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookDelivery,
  WebhookDeliveryResult,
  ApiKey,
  CreateApiKeyRequest,
  OnboardingProfile,
  DeviceCodeRequest,
  DeviceCodeResponse,
  DeviceTokenResponse,
  AgentSignupRequest,
  AgentSignupResponse,
} from '../types.js';

export class AuthResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  signup(body: SignupRequest): Promise<Ok> {
    return this.c.request('POST', '/v1/auth/signup', { body });
  }
  verifyEmail(token: string): Promise<Ok> {
    return this.c.request('POST', '/v1/auth/verify-email', { body: { token } });
  }
  resendVerification(email: string): Promise<Ok> {
    return this.c.request('POST', '/v1/auth/resend-verification', { body: { email } });
  }
  forgotPassword(email: string): Promise<Ok> {
    return this.c.request('POST', '/v1/auth/forgot-password', { body: { email } });
  }
  resetPassword(token: string, password: string): Promise<Ok> {
    return this.c.request('POST', '/v1/auth/reset-password', { body: { token, password } });
  }
  /**
   * Set or change the signed-in account's password. Omit `currentPassword` when
   * the account is SSO-only (setting a password for the first time so email+password
   * login also works); it's required when changing an existing password.
   */
  setPassword(newPassword: string, currentPassword?: string): Promise<{ ok: boolean; hadPassword: boolean }> {
    return this.c.request('POST', '/v1/auth/password', {
      body: { newPassword, ...(currentPassword ? { currentPassword } : {}) },
    });
  }
  /** Headless signup for agents: no captcha, browser or password; the response carries an API key. Needs no auth. */
  agentSignup(body: AgentSignupRequest): Promise<AgentSignupResponse> {
    return this.c.request('POST', '/v1/auth/agent-signup', { body });
  }
  /** Start an RFC 8628 device login: show `user_code` / `verification_uri_complete`, then poll deviceToken(). */
  deviceCode(body: DeviceCodeRequest = {}): Promise<DeviceCodeResponse> {
    return this.c.request('POST', '/v1/auth/device/code', { body });
  }
  /** Poll every `interval` s. Throws AdNetApiError 400 with body.error authorization_pending | slow_down | access_denied | expired_token until approved. */
  deviceToken(deviceCode: string): Promise<DeviceTokenResponse> {
    return this.c.request('POST', '/v1/auth/device/token', { body: { device_code: deviceCode } });
  }
  login(body: LoginRequest): Promise<LoginResponse> {
    return this.c.request('POST', '/v1/auth/login', { body });
  }
  logout(): Promise<Ok> {
    return this.c.request('POST', '/v1/auth/logout');
  }
  me(): Promise<MeResponse> {
    return this.c.request('GET', '/v1/auth/me');
  }
  setup2fa(): Promise<TwoFaSetupResponse> {
    return this.c.request('POST', '/v1/auth/2fa/setup');
  }
  enable2fa(totp: string): Promise<Ok> {
    return this.c.request('POST', '/v1/auth/2fa/enable', { body: { totp } });
  }
  /** List linked social-login providers (GitHub/Google/Discord/Microsoft). */
  connections(): Promise<Array<{ provider: string; connectedAt: string }>> {
    return this.c.request('GET', '/v1/auth/connections');
  }
  /** Disconnect a linked social-login provider. */
  disconnect(provider: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/auth/connections/${encodeURIComponent(provider)}`);
  }
}

export class FinanceResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  balance(): Promise<Balance> {
    return this.c.request('GET', '/v1/finance/balance');
  }
  ledger(query?: { limit?: number; offset?: number }): Promise<LedgerEntry[]> {
    return this.c.request('GET', '/v1/finance/ledger', { query });
  }
  deposit(body: DepositRequest): Promise<Ok> {
    return this.c.request('POST', '/v1/finance/deposit', { body });
  }
  deposits(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/finance/deposits');
  }
  /** Configured deposit/payout rails + the minimum payout. */
  methods(): Promise<FinanceMethods> {
    return this.c.request('GET', '/v1/finance/methods');
  }
  requestPayout(body: PayoutRequest): Promise<Ok> {
    return this.c.request('POST', '/v1/finance/payout', { body });
  }
  payouts(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/finance/payouts');
  }
  /** Get the saved payout tax form (W-9 / W-8BEN), if any. */
  taxForm(): Promise<unknown> {
    return this.c.request('GET', '/v1/finance/tax-form');
  }
  /** Submit/update the payout tax form (required before payouts in many jurisdictions). */
  submitTaxForm(body: TaxFormRequest): Promise<Ok> {
    return this.c.request('POST', '/v1/finance/tax-form', { body });
  }
}

export class ReportingResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  publisher(query?: ReportQuery): Promise<ReportRow[]> {
    return this.c.request('GET', '/v1/reporting/publisher', { query });
  }
  /** Fill summary: requests, fill_rate, paid_fill_rate (house excluded), no-fill reasons. */
  publisherFill(query?: ReportQuery): Promise<PublisherFillReport> {
    return this.c.request('GET', '/v1/reporting/publisher/fill', { query });
  }
  /** Per-placement rollup (impressions, clicks, CTR, revenue, RPM, eCPM, fill
   * rate, paid fill rate, viewable rate, slot CLS) for the authed publisher. */
  publisherPlacements(query?: ReportQuery): Promise<PublisherPlacementRow[]> {
    return this.c.request('GET', '/v1/reporting/publisher/placements', { query });
  }
  /** Anti-adblock: impressions recovered from adblock visitors (first-party serving). */
  antiAdblock(query?: ReportQuery): Promise<{ summary: { impressions: number; recovered: number; recovered_pct: number }; series: unknown[] }> {
    return this.c.request('GET', '/v1/reporting/publisher/anti-adblock', { query });
  }
  advertiser(query?: ReportQuery): Promise<ReportRow[]> {
    return this.c.request('GET', '/v1/reporting/advertiser', { query });
  }
  ivt(query?: ReportQuery): Promise<ReportRow[]> {
    return this.c.request('GET', '/v1/reporting/ivt', { query });
  }
  sustainability(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/sustainability', { query });
  }
  /** Conversion funnel (impression → click → conversion) for the advertiser. */
  funnel(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/funnel', { query });
  }
  /** Reach & frequency (unique users): reach, avg frequency, distribution, daily. */
  reach(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/reach', { query });
  }
  /**
   * Breakdown over a dimension the hourly rollup drops
   * (bdim=os|browser|deal|page|page_url|app|property). 'page' groups by site
   * (host), 'page_url' by individual page (host+path), 'app' by in-app/in-game
   * app id, 'property' by owning property (app/site). Rows carry impressions,
   * clicks, ctr, revenue (publisher earnings or advertiser spend) and ecpm.
   */
  breakdown(
    query?: ReportQuery & {
      bdim?: 'os' | 'browser' | 'deal' | 'page' | 'page_url' | 'app' | 'property' | 'region' | 'make' | 'model' | 'sub1' | 'sub2' | 'sub3' | 'sub4' | 'sub5';
    },
  ): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/breakdown', { query });
  }
  /** Per-creative performance (CTR/CVR) + fatigue for the advertiser. */
  creatives(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/creatives', { query });
  }
  /** ROAS / conversion-value daily trend for the advertiser. */
  roas(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/roas', { query });
  }
  /** Time-to-click engagement latency (avg/median + distribution). */
  timeToClick(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/time-to-click', { query });
  }
  /** Publisher delivery waterfall: requests→filled→rendered→measurable→viewable. */
  deliveryFunnel(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/delivery-funnel', { query });
  }
  /** Ad-serving decision latency (percentiles + slow-rate) for the publisher. */
  serveLatency(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/serve-latency', { query });
  }
  /** Consent / GPC rate: personalized vs aggregate-only pixel events. */
  consentRate(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/consent-rate', { query });
  }
  /** Network benchmark: this publisher's eCPM/fill/viewability percentile rank. */
  benchmark(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/benchmark', { query });
  }
  /** Real-time KPI snapshot (last ~15 min, per-minute). */
  realtime(): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/realtime');
  }
  /** Geographic (country-level) performance breakdown. */
  geo(query?: ReportQuery): Promise<ReportRow[]> {
    return this.c.request('GET', '/v1/reporting/geo', { query });
  }
  /** Auction dynamics (requests, fills, fill rate, no-fill reasons). */
  auction(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/auction', { query });
  }
  /** Cross-tab of two dimensions (e.g. country × device). */
  pivot(query: { dim1: string; dim2: string; from?: string; to?: string }): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/pivot', { query });
  }
  /** Clearing-price percentiles + estimated win-rate curve (advertiser). */
  bidLandscape(): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/bid-landscape');
  }
  /** Delivery pacing for goal/booked campaigns (advertiser). */
  deliveryPacing(): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/delivery-pacing');
  }
  /** Top cross-site user path sequences (advertiser). */
  journey(query?: { from?: string; to?: string; topN?: number }): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/journey', { query });
  }
  /** Per-campaign incrementality / lift vs holdout (advertiser). */
  incrementality(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/incrementality', { query });
  }
  /** Closed-loop full-funnel attribution for house campaigns (advertiser). */
  closedLoop(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/closed-loop', { query });
  }
  /** Personal Network (house ads) infra fees + delivery. */
  personalNetwork(query?: ReportQuery): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/personal-network', { query });
  }
  /** Viewability metrics, grouped by placement or campaign. */
  viewability(query?: { groupBy?: 'placement' | 'campaign'; from?: string; to?: string }): Promise<ReportRow[]> {
    return this.c.request('GET', '/v1/reporting/viewability', { query });
  }
  /** Video completion: the funnel (starts → quartiles → completes) and completion
   * rate / VTR, plus a per-placement (publisher) or per-campaign (advertiser)
   * breakdown. Returns { funnel, breakdown }. */
  video(query?: { from?: string; to?: string }): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/video', { query });
  }
  /** Affiliate sub-id funnel: impressions → clicks → conversions per sub-id, with
   * CTR / CVR / revenue / payout. `sub` picks which of sub1..sub5 to group by
   * (default sub1). Conversions populate on advertiser scope only. */
  affiliate(query?: { sub?: 'sub1' | 'sub2' | 'sub3' | 'sub4' | 'sub5'; from?: string; to?: string }): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/affiliate', { query });
  }
  /** Per-card carousel click attribution: clicks per card of each carousel
   * creative, with the card's title/price. Advertiser-scoped. */
  carousel(query?: { from?: string; to?: string }): Promise<unknown> {
    return this.c.request('GET', '/v1/reporting/carousel', { query });
  }
  /** List saved report configurations. */
  saved(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/reporting/saved');
  }
  /** Save a report configuration. */
  saveSaved(body: { name?: string; config?: Record<string, unknown> }): Promise<unknown> {
    return this.c.request('POST', '/v1/reporting/saved', { body });
  }
  /** Delete a saved report. */
  deleteSaved(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/reporting/saved/${encodeURIComponent(id)}`);
  }
  /** List scheduled (emailed) reports. */
  scheduled(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/reporting/scheduled');
  }
  /** Create a scheduled email report (daily/weekly). */
  createScheduled(body: { name?: string; config?: Record<string, unknown>; cadence?: 'daily' | 'weekly'; email?: string }): Promise<unknown> {
    return this.c.request('POST', '/v1/reporting/scheduled', { body });
  }
  /** Delete a scheduled report. */
  deleteScheduled(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/reporting/scheduled/${encodeURIComponent(id)}`);
  }
}

export class DealsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /**
   * Accounts are dual-sided. Pass `role` to see deals where the account is the
   * publisher (seller) vs the advertiser (buyer); omit it to default to the
   * account's stored type.
   */
  list(params?: Pagination & { role?: 'advertiser' | 'publisher' }): Promise<Deal[]> {
    return this.c.request('GET', '/v1/deals', { query: params });
  }
  create(body: CreateDealRequest): Promise<Deal> {
    return this.c.request('POST', '/v1/deals', { body });
  }
  /** Resolve an advertiser account by exact email, to target a deal at them. */
  lookupAdvertiser(email: string): Promise<AdvertiserLookup> {
    return this.c.request('GET', '/v1/deals/advertiser-lookup', { query: { email } });
  }
  setStatus(id: string, status: string): Promise<Ok> {
    return this.c.request('POST', `/v1/deals/${encodeURIComponent(id)}/status`, {
      body: { status },
    });
  }
  accept(id: string): Promise<Ok> {
    return this.c.request('POST', `/v1/deals/${encodeURIComponent(id)}/accept`);
  }
  /** Preview an open deal from its claim token (before claiming). */
  previewClaim(token: string): Promise<DealClaimPreview> {
    return this.c.request('GET', `/v1/deals/claim/${encodeURIComponent(token)}`);
  }
  /** Claim an open deal via its token → the caller becomes the advertiser, deal goes active. */
  claim(token: string): Promise<Ok> {
    return this.c.request('POST', `/v1/deals/claim/${encodeURIComponent(token)}`);
  }
}

export class ReferralsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(): Promise<Referral[]> {
    return this.c.request('GET', '/v1/referrals');
  }
  /** Refer & earn: partner status, `?via=` link, clicks, sign-ups and commissions. */
  affiliate(): Promise<AffiliateOverview> {
    return this.c.request('GET', '/v1/referrals/affiliate');
  }
  /** Join Refer & earn (idempotent); returns the new overview. */
  joinAffiliate(): Promise<AffiliateOverview> {
    return this.c.request('POST', '/v1/referrals/affiliate/join');
  }
}

export class WebhooksResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(): Promise<WebhookEndpoint[]> {
    return this.c.request('GET', '/v1/webhooks');
  }
  events(): Promise<unknown[]> {
    return this.c.request('GET', '/v1/webhooks/events');
  }
  create(body: CreateWebhookRequest): Promise<WebhookEndpoint> {
    return this.c.request('POST', '/v1/webhooks', { body });
  }
  /** Update an endpoint's URL, subscribed events, and/or active (pause) flag. */
  update(id: string, body: UpdateWebhookRequest): Promise<WebhookEndpoint> {
    return this.c.request('PATCH', `/v1/webhooks/${encodeURIComponent(id)}`, { body });
  }
  delete(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/webhooks/${encodeURIComponent(id)}`);
  }
  /** Roll the signing secret (old one stops verifying immediately). */
  rotateSecret(id: string): Promise<WebhookEndpoint> {
    return this.c.request('POST', `/v1/webhooks/${encodeURIComponent(id)}/rotate-secret`);
  }
  /** Fetch the signing secret (list()/update() only return `has_secret` + `secret_hint`). */
  revealSecret(id: string): Promise<{ secret: string }> {
    return this.c.request('POST', `/v1/webhooks/${encodeURIComponent(id)}/secret/reveal`);
  }
  /** Fire a synthetic `ping` event to verify the endpoint. */
  ping(id: string): Promise<WebhookDeliveryResult> {
    return this.c.request('POST', `/v1/webhooks/${encodeURIComponent(id)}/ping`);
  }
  /** Recent delivery attempts for one subscription (newest first). */
  deliveries(id: string, query?: { limit?: number }): Promise<WebhookDelivery[]> {
    return this.c.request('GET', `/v1/webhooks/${encodeURIComponent(id)}/deliveries`, { query });
  }
  /** Manually re-send a past delivery's payload. */
  redeliver(deliveryId: string): Promise<WebhookDeliveryResult> {
    return this.c.request('POST', `/v1/webhooks/deliveries/${encodeURIComponent(deliveryId)}/redeliver`);
  }
}

export class KeysResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  list(): Promise<ApiKey[]> {
    return this.c.request('GET', '/v1/keys');
  }
  create(body: CreateApiKeyRequest): Promise<ApiKey & { token?: string }> {
    return this.c.request('POST', '/v1/keys', { body });
  }
  delete(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/keys/${encodeURIComponent(id)}`);
  }
  /** Revoke the API key this client is using (logout). 400 when authenticated by session. */
  revokeCurrent(): Promise<{ revoked: true }> {
    return this.c.request('DELETE', '/v1/keys/current');
  }
}

/** Invoices & statements (advertiser sees own; admin-only ops noted per method). */
export class BillingResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  invoices(query?: { accountId?: string }): Promise<unknown[]> {
    return this.c.request('GET', '/v1/billing/invoices', { query });
  }
  invoice(id: string): Promise<unknown> {
    return this.c.request('GET', `/v1/billing/invoices/${encodeURIComponent(id)}`);
  }
  statement(query?: { from?: string; to?: string; accountId?: string }): Promise<unknown> {
    return this.c.request('GET', '/v1/billing/statement', { query });
  }
  /** Rendered HTML of an invoice. */
  renderInvoice(id: string): Promise<string> {
    return this.c.request('GET', `/v1/billing/invoices/${encodeURIComponent(id)}/render`, { text: true });
  }
  /** Generate a draft invoice for an account+period (admin). */
  generateInvoice(body: { accountId: string; periodStart: string; periodEnd: string }): Promise<unknown> {
    return this.c.request('POST', '/v1/billing/invoices/generate', { body });
  }
  /** Issue a draft invoice (admin). */
  issueInvoice(id: string): Promise<unknown> {
    return this.c.request('POST', `/v1/billing/invoices/${encodeURIComponent(id)}/issue`);
  }
  /** Pay an invoice (advertiser own; admin any). */
  payInvoice(id: string): Promise<unknown> {
    return this.c.request('POST', `/v1/billing/invoices/${encodeURIComponent(id)}/pay`);
  }
  /** Void an invoice (admin). */
  voidInvoice(id: string): Promise<unknown> {
    return this.c.request('POST', `/v1/billing/invoices/${encodeURIComponent(id)}/void`);
  }
}

/** Account lifecycle: KYC + onboarding. */
export class AccountResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** KYC status for the account. */
  kyc(): Promise<{ status: string; verified: boolean }> {
    return this.c.request('GET', '/v1/account/kyc');
  }
  /** Start a hosted Didit identity-verification session → returns a URL to visit. */
  startKyc(): Promise<{ url: string }> {
    return this.c.request('POST', '/v1/account/kyc/didit/start');
  }
  /** Onboarding progress/state. */
  onboarding(): Promise<{ status: string; completed: boolean }> {
    return this.c.request('GET', '/v1/onboarding');
  }
  /** Save the onboarding profile (goal, company, country, currency, …). */
  saveOnboardingProfile(body: OnboardingProfile): Promise<Ok> {
    return this.c.request('POST', '/v1/onboarding/profile', { body });
  }
}

/** Privacy / DSAR (public submission). */
export class PrivacyResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Submit a data-subject access ('access') or deletion ('delete') request. */
  submitDsar(body: { kind: 'access' | 'delete'; email: string }): Promise<{ id: string; status: string }> {
    return this.c.request('POST', '/v1/privacy/dsar', { body });
  }
}

/** Public, cached marketing stats (ads served, total paid out). */
export class StatsResource extends Resource {
  constructor(c: AdNetClient) { super(c); }
  /** Network-wide public stats (Redis-cached server-side). No auth required. */
  public(): Promise<{ adsServed: number; totalPaidOut: number }> {
    return this.c.request('GET', '/v1/stats');
  }
}

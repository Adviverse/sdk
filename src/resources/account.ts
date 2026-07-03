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
  TaxFormRequest,
  ReportQuery,
  PublisherPlacementRow,
  Deal,
  CreateDealRequest,
  AdvertiserLookup,
  DealClaimPreview,
  Referral,
  WebhookEndpoint,
  CreateWebhookRequest,
  ApiKey,
  CreateApiKeyRequest,
  OnboardingProfile,
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
  publisherFill(query?: ReportQuery): Promise<ReportRow[]> {
    return this.c.request('GET', '/v1/reporting/publisher/fill', { query });
  }
  /** Per-placement rollup (impressions, clicks, CTR, revenue, RPM, eCPM, fill
   * rate, viewable rate) for the authed publisher. */
  publisherPlacements(query?: ReportQuery): Promise<PublisherPlacementRow[]> {
    return this.c.request('GET', '/v1/reporting/publisher/placements', { query });
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
  /** OS / browser / deal breakdown (bdim=os|browser|deal) — dropped by the rollup. */
  breakdown(query?: ReportQuery & { bdim?: 'os' | 'browser' | 'deal' | 'page' }): Promise<unknown> {
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
  delete(id: string): Promise<Ok> {
    return this.c.request('DELETE', `/v1/webhooks/${encodeURIComponent(id)}`);
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

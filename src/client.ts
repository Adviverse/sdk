/** The core `AdNetClient` — wires up every resource group and performs the
 * low-level HTTP request. */

import { AdNetApiError, type RequestOptions } from './core.js';
import type { AdNetClientOptions } from './types.js';
import {
  AuthResource,
  FinanceResource,
  ReportingResource,
  DealsResource,
  ReferralsResource,
  WebhooksResource,
  KeysResource,
  BillingResource,
  AccountResource,
  PrivacyResource,
  StatsResource,
} from './resources/account.js';
import {
  CampaignsResource,
  CampaignGroupsResource,
  CreativesResource,
  TerminalResource,
  AudiencesResource,
  SegmentsResource,
  PixelResource,
  TeamResource,
  ClientsResource,
  InvoicesResource,
  TransfersResource,
  FeedsResource,
  CapiResource,
  TrackResource,
  ExportsResource,
  VerificationResource,
  AutomationResource,
  IdentityResource,
  InsightsResource,
} from './resources/advertiser.js';
import {
  PropertiesResource,
  PlacementsResource,
  ConsentResource,
  IntegrityResource,
  AppsResource,
  RegionsResource,
  PublisherInsightsResource,
} from './resources/publisher.js';
import { AdminResource, GuidesResource, BlogResource } from './resources/admin.js';
import {
  MarketplaceCatalogResource,
  PromoteCampaignsResource,
} from './resources/marketplace.js';
import { ConversionsResource } from './resources/conversions.js';
import { CurrenciesResource } from './resources/currencies.js';
import { DoohResource } from './resources/dooh.js';
import { MetaverseResource } from './resources/metaverse.js';
import { PortalTemplatesResource } from './resources/portal-templates.js';
import { RewardsResource } from './resources/rewards.js';

export class AdNetClient {
  private readonly baseUrl: string;
  /** Ad-serving host (engine), used for /terminal/serve. */
  readonly servingBaseUrl: string;
  private token?: string;
  private apiKey?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  // Resource groups.
  readonly auth: AuthResource;
  readonly campaigns: CampaignsResource;
  readonly campaignGroups: CampaignGroupsResource;
  readonly creatives: CreativesResource;
  readonly terminal: TerminalResource;
  readonly properties: PropertiesResource;
  readonly placements: PlacementsResource;
  readonly finance: FinanceResource;
  readonly reporting: ReportingResource;
  readonly deals: DealsResource;
  readonly referrals: ReferralsResource;
  readonly webhooks: WebhooksResource;
  readonly keys: KeysResource;
  readonly consent: ConsentResource;
  readonly audiences: AudiencesResource;
  readonly segments: SegmentsResource;
  readonly pixel: PixelResource;
  readonly team: TeamResource;
  readonly clients: ClientsResource;
  readonly invoices: InvoicesResource;
  readonly transfers: TransfersResource;
  readonly integrity: IntegrityResource;
  readonly feeds: FeedsResource;
  readonly capi: CapiResource;
  readonly track: TrackResource;
  readonly billing: BillingResource;
  readonly exports: ExportsResource;
  readonly verification: VerificationResource;
  readonly automation: AutomationResource;
  readonly identity: IdentityResource;
  readonly insights: InsightsResource;
  readonly publisherInsights: PublisherInsightsResource;
  readonly apps: AppsResource;
  readonly account: AccountResource;
  readonly regions: RegionsResource;
  readonly privacy: PrivacyResource;
  readonly admin: AdminResource;
  readonly guides: GuidesResource;
  readonly blog: BlogResource;
  readonly stats: StatsResource;
  readonly marketplaceCatalog: MarketplaceCatalogResource;
  readonly promoteCampaigns: PromoteCampaignsResource;
  readonly conversions: ConversionsResource;
  readonly currencies: CurrenciesResource;
  readonly dooh: DoohResource;
  readonly metaverse: MetaverseResource;
  readonly portalTemplates: PortalTemplatesResource;
  readonly rewards: RewardsResource;

  constructor(opts: AdNetClientOptions) {
    if (!opts?.baseUrl) throw new Error('AdNetClient: baseUrl is required');
    this.baseUrl = opts.baseUrl.replace(/\/+$/, '');
    this.servingBaseUrl = (opts.servingBaseUrl ?? 'https://serve.adviverse.com').replace(/\/+$/, '');
    this.token = opts.token;
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    const f = opts.fetch ?? globalThis.fetch;
    if (typeof f !== 'function') {
      throw new Error('AdNetClient: no fetch implementation available; pass options.fetch');
    }
    this.fetchImpl = f.bind(globalThis);

    this.auth = new AuthResource(this);
    this.campaigns = new CampaignsResource(this);
    this.terminal = new TerminalResource(this);
    this.campaignGroups = new CampaignGroupsResource(this);
    this.creatives = new CreativesResource(this);
    this.properties = new PropertiesResource(this);
    this.placements = new PlacementsResource(this);
    this.finance = new FinanceResource(this);
    this.reporting = new ReportingResource(this);
    this.deals = new DealsResource(this);
    this.referrals = new ReferralsResource(this);
    this.webhooks = new WebhooksResource(this);
    this.keys = new KeysResource(this);
    this.consent = new ConsentResource(this);
    this.audiences = new AudiencesResource(this);
    this.segments = new SegmentsResource(this);
    this.pixel = new PixelResource(this);
    this.team = new TeamResource(this);
    this.clients = new ClientsResource(this);
    this.invoices = new InvoicesResource(this);
    this.transfers = new TransfersResource(this);
    this.integrity = new IntegrityResource(this);
    this.feeds = new FeedsResource(this);
    this.capi = new CapiResource(this);
    this.track = new TrackResource(this);
    this.billing = new BillingResource(this);
    this.exports = new ExportsResource(this);
    this.verification = new VerificationResource(this);
    this.automation = new AutomationResource(this);
    this.identity = new IdentityResource(this);
    this.insights = new InsightsResource(this);
    this.publisherInsights = new PublisherInsightsResource(this);
    this.apps = new AppsResource(this);
    this.account = new AccountResource(this);
    this.regions = new RegionsResource(this);
    this.privacy = new PrivacyResource(this);
    this.admin = new AdminResource(this);
    this.guides = new GuidesResource(this);
    this.blog = new BlogResource(this);
    this.stats = new StatsResource(this);
    this.marketplaceCatalog = new MarketplaceCatalogResource(this);
    this.promoteCampaigns = new PromoteCampaignsResource(this);
    this.conversions = new ConversionsResource(this);
    this.currencies = new CurrenciesResource(this);
    this.dooh = new DoohResource(this);
    this.metaverse = new MetaverseResource(this);
    this.portalTemplates = new PortalTemplatesResource(this);
    this.rewards = new RewardsResource(this);
  }

  /** Sets (or clears) the bearer session token used for subsequent requests. */
  setToken(token?: string): void {
    this.token = token;
  }

  /** Returns the currently configured session token, if any. */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * Sets (or clears) the scoped API key (`ak_<prefix>.<secret>`) used for
   * subsequent requests. Sent as the `x-api-key` header — use this for
   * server-to-server / agent access. Takes precedence over a session token.
   */
  setApiKey(apiKey?: string): void {
    this.apiKey = apiKey;
  }

  /** Low-level request. Most callers should use the typed resource methods. */
  async request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const url = new URL((opts.baseUrl ?? this.baseUrl) + path);
    if (opts.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    // A scoped API key (x-api-key) takes precedence; otherwise a session bearer.
    if (this.apiKey) headers['x-api-key'] = this.apiKey;
    else if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;
    if (opts.headers) Object.assign(headers, opts.headers);

    let body: BodyInit | undefined;
    if (opts.form) {
      body = opts.form; // browser/runtime sets the multipart boundary header.
    } else if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const signal = opts.signal ?? controller.signal;

    let res: Response;
    try {
      res = await this.fetchImpl(url.toString(), { method, headers, body, signal });
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text();
    let parsed: unknown = undefined;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    if (!res.ok) {
      throw new AdNetApiError(res.status, res.statusText, parsed, method, path);
    }
    return (opts.text ? text : parsed) as T;
  }
}

export default AdNetClient;

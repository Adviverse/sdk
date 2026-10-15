/** Tenant platform-token / currency registry.
 *
 * A tenant registers their OWN token and its USD rate in `currency_rates`
 * (micro-USD per 1 unit). Instead of a static rate, a token may carry a LIVE
 * PRICE FEED — a price-API URL the control-plane polls to keep `usd_micro`
 * current. These map onto the `/v1/finance/currencies` routes. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

/** Register or update a tenant token. Provide EITHER a static `usdMicro` OR a
 * live `rateUrl` price feed (optionally with a `rateJsonPath` dot-path). */
export interface RegisterCurrencyRequest {
  /** Token/currency code (fiat ISO or the tenant's own token symbol). */
  code: string;
  name: string;
  /** micro-USD per 1 unit (1_000_000 = $1.00). Optional when `rateUrl` is set. */
  usdMicro?: number;
  /** Price-API URL returning the token's USD price; polled to keep the rate live. */
  rateUrl?: string;
  /** Dot-path to the numeric price in the JSON body (e.g. `price` or `data.usd`). */
  rateJsonPath?: string;
}

/** A registered token/currency row from `/v1/finance/currencies`. */
export interface CurrencyRate {
  code: string;
  /** micro-USD per 1 unit (bigint serialized as number or string). */
  usd_micro: number | string;
  name: string;
  owner_account_id: string | null;
  /** The live price-feed URL, if this token is feed-backed. */
  rate_url?: string | null;
  /** The dot-path used to read the price out of the feed response. */
  rate_json_path?: string | null;
  /** When the live feed last successfully updated `usd_micro`. */
  last_rate_at?: string | null;
  updated_at: string;
}

/**
 * Tenant token registry. `list()` returns every registered token + its rate
 * (incl. any live price feed); `register()` creates/updates the caller's token.
 */
export class CurrenciesResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }

  /** List all registered tokens/currencies and their USD rates. */
  list(): Promise<CurrencyRate[]> {
    return this.c.request('GET', '/v1/finance/currencies');
  }

  /** Register or update the caller's token and its USD rate (or live feed). */
  register(req: RegisterCurrencyRequest): Promise<CurrencyRate> {
    return this.c.request('POST', '/v1/finance/currencies', { body: req });
  }
}

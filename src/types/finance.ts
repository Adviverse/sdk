/**
 * Finance shapes: deposits, payouts, and tax forms.
 */

/**
 * Implemented deposit rails. `card` is Stripe card checkout; `wire` and `paxum`
 * are instruction-based (the response carries where to send funds + a reference,
 * and the balance is credited once ops confirms receipt). `mock` is dev/test only
 * (refused in prod). An unconfigured rail is refused rather than silently mocked.
 */
export type DepositProvider = 'stripe' | 'paypal' | 'crypto' | 'card' | 'wire' | 'paxum' | 'mock';

/** Implemented publisher payout rails. `wire` settles on ops confirmation. */
export type PayoutMethod = 'paypal' | 'crypto' | 'paxum' | 'wire';

export interface DepositRequest {
  amount: number;
  /**
   * ISO 4217 currency code (e.g. `'USD'`), or a tenant's own platform-token code
   * (any non-ISO code registered in the tenant's currency table); for such an
   * account `amount` is denominated in that token.
   */
  currency?: string;
  provider?: DepositProvider;
}

export interface PayoutRequest {
  amount: number;
  method: PayoutMethod;
  /** ISO 4217 code, or a tenant's own platform-token code (see {@link DepositRequest.currency}). */
  currency?: string;
  /** Method-specific destination: `{ email }` for paypal/paxum, `{ address, currency, network, memo? }` for crypto, bank fields for wire. */
  destination?: Record<string, unknown>;
}

/** Rails usable in this environment (GET /v1/finance/methods). */
export interface FinanceMethods {
  deposit: string[];
  payout: string[];
  /** Minimum withdrawal in USD (operator's MIN_PAYOUT_USD). */
  minPayout: number;
}

export interface TaxFormRequest {
  formType: 'w9' | 'w8ben' | string;
  legalName: string;
  taxClassification?: string;
  taxId: string;
  address: string;
  country: string;
  certified: boolean;
}

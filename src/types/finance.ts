/**
 * Finance shapes: deposits, payouts, and tax forms.
 */

/** Implemented deposit processors. `mock` is dev/test only (refused in prod). */
export type DepositProvider = 'stripe' | 'paypal' | 'crypto' | 'mock';

/** Implemented publisher payout rails. */
export type PayoutMethod = 'paypal' | 'crypto';

export interface DepositRequest {
  amount: number;
  currency?: string;
  provider?: DepositProvider;
}

export interface PayoutRequest {
  amount: number;
  method: PayoutMethod;
  currency?: string;
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

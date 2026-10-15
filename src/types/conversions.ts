/**
 * Retail-media conversion tracking request/response shapes (sub-project ②).
 *
 * These back the public server-to-server postback endpoints used to attribute
 * and settle per-checkout (CPA) campaigns: a verified, deduped Purchase debits
 * the advertiser (CPA amount) and credits the publisher (rev-share); a later
 * refund/chargeback posts a compensating ledger entry (never a mutation).
 *
 * Pure type definitions (erased at build time).
 */

/**
 * Report an attributed purchase (advertiser postback / S2S). `clickId` is the
 * ad click id (adclid) captured on the landing page; `orderId` is the
 * marketplace's own order id and is the dedup key. `orderValue` is the gross
 * order amount; `value` optionally overrides the billable/attributed value.
 */
export interface ReportConversionRequest {
  /** The ad click id (adclid) captured on the landing page. */
  clickId: string;
  /** The marketplace's own order id — the conversion dedup key. */
  orderId: string;
  /** Gross order value (mapped to `order_value` on the wire). */
  orderValue: number;
  /** Optional billable/attributed value override (defaults to orderValue). */
  value?: number;
  /** Optional idempotency / event id for at-most-once ingestion. */
  eventId?: string;
  /** Optional campaign hint when the click id doesn't resolve one on its own. */
  campaignId?: string;
}

/** Result of a conversion postback. */
export interface ReportConversionResult {
  status?: string;
  deduped?: boolean;
  [k: string]: unknown;
}

/**
 * Report a refund / chargeback for a previously reported order. Reverses the
 * settlement for that `orderId` with a compensating (append-only) ledger entry.
 */
export interface ReportRefundRequest {
  /** The marketplace order id to reverse (matches a prior conversion). */
  orderId: string;
  /** Optional advertiser account scope (when the caller can act for several). */
  advertiserId?: string;
}

/** Result of a refund postback. */
export interface ReportRefundResult {
  status?: string;
  reversed?: boolean;
  [k: string]: unknown;
}

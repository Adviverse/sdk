/** Retail-media conversion tracking (sub-project ②): the public server-to-server
 * postback surface that attributes and settles per-checkout (CPA) campaigns.
 *
 * A verified, deduped Purchase debits the advertiser (CPA amount) and credits
 * the publisher (rev-share); a later refund/chargeback posts a compensating
 * ledger entry (append-only, never a mutation). These endpoints are public
 * ingestion routes — distinct from the pixel/CAPI event surface. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';
import type {
  ReportConversionRequest,
  ReportConversionResult,
  ReportRefundRequest,
  ReportRefundResult,
} from '../types.js';

/**
 * Conversion postbacks for retail-media CPA settlement. `purchase()` reports an
 * attributed, deduped-by-order purchase; `refund()` reverses a prior order.
 */
export class ConversionsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }

  /**
   * Report an attributed purchase (advertiser postback / S2S). `clickId` is the
   * ad click id (adclid); `orderId` is the marketplace order id (dedup key);
   * `orderValue` is the gross order amount (sent as `order_value`). Optional
   * `value` overrides the billable value, `eventId` gives at-most-once
   * ingestion, and `campaignId` hints attribution when the click id can't
   * resolve one on its own.
   */
  purchase(req: ReportConversionRequest): Promise<ReportConversionResult> {
    const { orderValue, ...rest } = req;
    return this.c.request('POST', '/v1/track/conversion', {
      body: { ...rest, order_value: orderValue },
    });
  }

  /** Report a refund / chargeback for a previously reported order — reverses
   * its settlement with a compensating ledger entry. */
  refund(req: ReportRefundRequest): Promise<ReportRefundResult> {
    return this.c.request('POST', '/v1/track/refund', { body: req });
  }
}

/** Signed impression proofs (docs/proofs.md). Maps onto `/v1/proofs/*`.
 * `publicKey` and `verify` need no auth; `roots` and `bundle` return your own data. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

/** Signed fields of one billed impression. */
export interface ProofRecord {
  kid: string;
  request_id: string;
  campaign_id: string;
  creative_id: string;
  placement_id: string;
  /** Unix ms, UTC. */
  ts_ms: number;
  /** Price charged x 1,000,000 in `currency`. */
  price_micros: number;
  currency: string;
  ivt: string;
}

export interface ProofRoot {
  advertiserId: string;
  day: string;
  recordCount: number;
  merkleRoot: string;
  kid: string;
  signature: string;
  createdAt: string;
}

export interface ProofPublicKeys {
  enabled: boolean;
  message?: string;
  keys: { kty: 'OKP'; crv: 'Ed25519'; alg: 'EdDSA'; use: 'sig'; kid: string; x: string; createdAt: string }[];
}

export interface ProofVerifyResult {
  valid: boolean;
  rootValid?: boolean;
  kid?: string;
  reason?: string;
}

export class ProofsResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }
  /** JWKS-style list of every signing key (old keys stay listed after rotation). */
  publicKey(): Promise<ProofPublicKeys> {
    return this.c.request('GET', '/v1/proofs/public-key');
  }
  /** Your signed daily Merkle roots, newest first. Dates are YYYY-MM-DD, inclusive. */
  roots(query: { from?: string; until?: string } = {}): Promise<{ enabled: boolean; message?: string; roots: ProofRoot[] }> {
    return this.c.request('GET', '/v1/proofs/roots', { query });
  }
  /** One day's proof bundle as raw NDJSON text (root, records, leaves). */
  bundle(day: string, campaignId?: string): Promise<string> {
    return this.c.request('GET', '/v1/proofs/bundle', { query: { day, campaignId }, text: true });
  }
  /** Verify a record + signature and/or a root against the network keys. */
  verify(body: { record?: ProofRecord; signature?: string; root?: Omit<ProofRoot, 'createdAt'> }): Promise<ProofVerifyResult> {
    return this.c.request('POST', '/v1/proofs/verify', { body });
  }
}

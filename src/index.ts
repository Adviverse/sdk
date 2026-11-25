/**
 * @adnet/sdk — a typed, dependency-free TypeScript client for the AdNet Control
 * Plane public API.
 *
 * The control-plane API is versioned under `/v1` and every response carries an
 * `X-API-Version: 1` header. This client targets v1.
 *
 * Zero runtime dependencies: it uses the global `fetch` (Node >= 18 and all
 * modern browsers). Domain types are imported (type-only) from `@adnet/shared`
 * so they are erased at build time and add no weight.
 *
 * @example
 * ```ts
 * import { AdNetClient } from '@adnet/sdk';
 *
 * const client = new AdNetClient({ baseUrl: 'https://adviverse.com' });
 * const { token } = await client.auth.login({ email, password });
 * client.setToken(token);
 * const campaigns = await client.campaigns.list();
 * ```
 *
 * This module is the public barrel: it re-exports the client, every resource
 * group, the error type, and all request/response payload shapes. The
 * implementation is split across `client.ts`, `core.ts`, `types.ts`, and
 * `resources/*` for file-length hygiene — the public import surface is
 * unchanged.
 */

export * from './types.js';
export { AdNetApiError } from './core.js';
export * from './resources/account.js';
export * from './resources/advertiser.js';
export * from './resources/publisher.js';
export * from './resources/admin.js';
export * from './resources/marketplace.js';
export * from './resources/conversions.js';
export * from './resources/currencies.js';
export * from './resources/dooh.js';
export * from './resources/metaverse.js';
export * from './resources/portal-templates.js';
export * from './resources/dsp-partners.js';
export * from './resources/rewards.js';
export * from './resources/cpa-goals.js';
export * from './resources/buying.js';
export * from './client.js';

import AdNetClient from './client.js';
export default AdNetClient;

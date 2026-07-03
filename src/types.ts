/**
 * Shared request/response payload shapes for `@adnet/sdk`.
 *
 * These are pure type definitions (erased at build time). Domain types are
 * imported (type-only) from `@adnet/shared`.
 *
 * This module is a barrel: the declarations now live in cohesive per-domain
 * files under `./types/` and are re-exported here so every existing
 * `import { X } from '../types'` / `from './types'` / `@adnet/sdk` keeps
 * resolving unchanged.
 */

export * from './types/common.js';
export * from './types/auth.js';
export * from './types/campaigns.js';
export * from './types/creatives.js';
export * from './types/publisher.js';
export * from './types/finance.js';
export * from './types/reporting.js';
export * from './types/audiences.js';
export * from './types/verification.js';
export * from './types/insights.js';

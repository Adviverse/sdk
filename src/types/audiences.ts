/**
 * Audience shapes: custom audiences, pixels, rules, and the Audience Cloud
 * (DMP segments / interest taxonomy / data co-op).
 */

/** A custom audience (uploaded list, retargeting pixel, or lookalike). */
export interface Audience {
  id: string;
  name: string;
  type: 'uploaded' | 'retargeting' | 'lookalike' | string;
  size: number;
  created_at?: string;
}

/** Result of building an in-house modeled lookalike audience. */
export interface ModeledLookalikeResult {
  audienceId: string;
  size: number;
  modeledFrom: string;
  note: string;
}

/** Preview of a modeled lookalike: seed/background sizes, k-anon eligibility,
 * and the features most DISTINCTIVE to the seed (vs the account background). */
export interface ModeledLookalikePreview {
  seedAudienceId: string;
  seedName: string;
  seedSize: number;
  backgroundSize?: number;
  eligible: boolean;
  topFeatures: Array<{ feature: string; weight: number }>;
  note?: string;
}

/** The retargeting pixel for an audience: an image tag, a JS variant, and the raw URL. */
export interface AudiencePixel {
  audienceId: string;
  url: string;
  img: string;
  js: string;
}

/** The account pixel (Meta-Pixel-style): id + ready-to-paste base snippet. */
export interface PixelInfo {
  id: string;
  name: string;
  libraryUrl: string;
  baseSnippet: string;
  standardEvents: string[];
  realtimeAudiences: boolean;
}

/** An event-rule audience: people who fired `event` within `windowDays`, minus `excludeEvent`. */
export interface AudienceRule {
  event: string;
  windowDays?: number;
  excludeEvent?: string;
  excludeWindowDays?: number;
  filters?: Array<{ param: string; op: 'gte' | 'lte' | 'eq' | string; value: any }>;
}

/** One filter clause on an event leaf. */
export interface RuleFilter { param: 'value' | 'content_id' | 'url' | string; op?: 'gte' | 'lte' | 'eq'; value?: any }

/**
 * Full-depth audience rule TREE: arbitrary AND/OR/NOT of event and trait
 * predicates. Pass as the `rule` on `audiences.create` (same field as the legacy
 * flat rule — a rule is a tree when it carries a `kind`).
 *  - event: did `event` ≥ `minCount` times in `windowDays`, matching `filters`
 *  - trait: the user's CDP `trait` satisfies `cmp` vs `value`
 */
export type RuleNode =
  | { kind: 'and'; children: RuleNode[] }
  | { kind: 'or'; children: RuleNode[] }
  | { kind: 'not'; child: RuleNode }
  | { kind: 'event'; event: string; windowDays?: number; minCount?: number; filters?: RuleFilter[] }
  | { kind: 'trait'; trait: string; cmp: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'exists'; value?: any };

/* ------------------------------------------------------------------------- */
/* Audience Cloud (DMP segments / interest taxonomy / data co-op)            */
/* ------------------------------------------------------------------------- */

/** One node of the shared interest taxonomy (IAB-style). `parent` is the id of
 * the parent node, or null for a top-level interest. `keywords` are the
 * contextual keywords this interest contributes to `contextual_include`. */
export interface TaxonomyNode {
  id: string;
  parent: string | null;
  name: string;
  keywords: string[];
  sensitive: boolean;
}

/** A network behavioral preset materialized for an interest: a ready-to-target
 * segment (`segmentId` → add to a campaign's `audience_include`). */
export interface SegmentBehavioral {
  segmentId: string;
  size: number;
  dataCpm: number;
}

/** A behavioral preset still accumulating membership (not yet targetable). */
export interface SegmentBehavioralBuilding {
  size: number;
  needed: number;
}

/** A catalog entry: the contextual keywords always available for an interest,
 * plus the behavioral preset (when materialized) or its build progress. */
export interface SegmentCatalogEntry {
  taxonomyId: string;
  name: string;
  parent: string | null;
  contextualKeywords: string[];
  behavioral: SegmentBehavioral | null;
  behavioralBuilding: SegmentBehavioralBuilding | null;
}

/** Request to contribute one of the account's audiences to the co-op under an
 * interest niche, optionally setting the revenue-share the contributor takes. */
export interface ContributeSegmentRequest {
  audienceId: string;
  /** Optional — the niche is auto-detected from the audience's members when omitted. */
  taxonomyId?: string;
  revShare?: number;
}

/** A segment the account has contributed to the co-op (row shape from the API). */
export interface SegmentContribution {
  id: string;
  name: string;
  taxonomy_id: string;
  size: number;
  rev_share: number;
  licensees: number;
}

/** A segment the account has licensed from the co-op (row shape from the API).
 * Target it by adding `segment_id` to a campaign's `audience_include`. */
export interface SegmentLicense {
  segment_id: string;
  data_cpm: number;
  name: string;
  taxonomy_id: string;
  size: number;
  scope: string;
}

/** The co-op data-fee statement: `totalEarned` is the rev-share the account has
 * accrued as a contributor (held until maturation); `totalSpent` is the data
 * fees it has paid as a licensee. `bySegment` breaks earnings out per contributed
 * segment; the `recent*` arrays are the latest individual earning/spend events. */
export interface SegmentEarnings {
  totalEarned: number;
  totalSpent: number;
  bySegment: Array<{ segmentId: string; name: string; earned: number }>;
  recentEarnings: Array<{ ts: string; amount: number; segmentId: string; segmentName: string }>;
  recentSpend: Array<{ ts: string; amount: number; segmentId: string }>;
}

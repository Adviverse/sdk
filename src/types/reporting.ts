/**
 * Reporting / data-pipeline shapes: report queries, exports, feeds, CAPI events,
 * and docs-CMS guides.
 */

export interface ReportQuery {
  from?: string;
  to?: string;
  groupBy?: string;
  /**
   * Combinable filters on publisher stats / placements / breakdown reports:
   * comma-separated lists, AND across fields, OR within one (max 20 values each).
   */
  country?: string;
  device?: string;
  format?: string;
  placement?: string;
  property?: string;
  os?: string;
  browser?: string;
  [k: string]: string | number | boolean | undefined;
}

export interface CreateFeedRequest {
  name: string;
  url: string;
  format: 'csv' | 'xml' | 'google_merchant' | string;
  scheduleCron?: string;
}

export interface CapiEvent {
  eventId: string;
  eventName: string;
  value?: number;
  currency?: string;
  clickId?: string;
  identifiers?: { emailHash?: string; phoneHash?: string; externalId?: string };
  eventTime?: string;
  customData?: Record<string, unknown>;
}

export interface RunExportRequest {
  dataset: 'events' | 'conversions' | 'spend' | string;
  from: string;
  to: string;
  format?: 'ndjson' | 'csv' | string;
}

/** A docs-CMS guide (markdown document rendered in-app and as public SSR HTML). */
export interface Guide {
  id: string;
  slug: string;
  locale: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertGuideRequest {
  slug?: string;
  title?: string;
  locale?: string;
  category?: string;
  summary?: string;
  body?: string;
  position?: number;
  published?: boolean;
}

/** A blog post (markdown article rendered in-app and as public SSR HTML). */
export interface Post {
  id: string;
  slug: string;
  locale: string;
  title: string;
  tag: string;
  author: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  position: number;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertPostRequest {
  slug?: string;
  title?: string;
  locale?: string;
  tag?: string;
  author?: string;
  excerpt?: string;
  body?: string;
  cover_image?: string;
  position?: number;
  published?: boolean;
  published_at?: string;
}

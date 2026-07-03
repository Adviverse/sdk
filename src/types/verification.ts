/**
 * Brand-safety + ad-verification settings shapes.
 */

export interface BrandSafetyConfig {
  categories?: string[];
  keywords?: string[];
  domains?: string[];
  sensitivity?: string;
  options?: Record<string, unknown>;
}

export interface VerificationSettings {
  vendor?: 'none' | 'ias' | 'doubleverify' | 'moat' | string;
  measurementEnabled?: boolean;
  /** Viewability target 0–1. */
  viewabilityTarget?: number;
  brandSafetyCategories?: string[];
  /**
   * Page domains the advertiser refuses to serve on. Normalized server-side to
   * bare lowercased hosts and enforced at serve time (rule-based) by the
   * ad-engine — candidates are skipped when the page domain matches.
   */
  blockedDomains?: string[];
  /**
   * Custom words/phrases the advertiser refuses to serve next to. Enforced at
   * serve time (rule-based) by the ad-engine — candidates are skipped when the
   * page content matches. The blocked categories above are additionally
   * auto-expanded into common synonyms server-side.
   */
  blockedKeywords?: string[];
  apiKey?: string;
}

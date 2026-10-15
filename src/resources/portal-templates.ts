/** Portal experience template builder: prebuilt, configurable HTML5 portal
 * experiences (mini-game / product showcase / 360 viewer). An advertiser picks
 * a template + fills a config; the API stores it and returns a hosted URL that
 * becomes an `html5` creative, attachable to a metaverse PORTAL surface.
 * Maps onto `/v1/portal/*`. */

import { Resource } from '../core.js';
import type { AdNetClient } from '../client.js';

/** One configurable input a template exposes. */
export interface PortalField {
  key: string;
  label: string;
  type: 'text' | 'image' | 'color' | 'url' | 'number';
  required?: boolean;
}

/** A prebuilt HTML5 portal experience the advertiser can configure. */
export interface PortalTemplate {
  key: string;
  name: string;
  description: string;
  fields: PortalField[];
}

export interface CreatePortalConfigRequest {
  /** A template key from `listTemplates()` (e.g. 'product-showcase'). */
  template: string;
  /** The template's fields (see the template's `fields` for the shape). */
  config: Record<string, unknown>;
}

/** The stored config + the hosted URL that renders it (use as a creative asset). */
export interface PortalConfigResult {
  id: string;
  url: string;
}

export class PortalTemplatesResource extends Resource {
  constructor(c: AdNetClient) {
    super(c);
  }

  /** The template catalog (each with its schema-driven `fields`). */
  listTemplates(): Promise<PortalTemplate[]> {
    return this.c.request('GET', '/v1/portal/templates');
  }

  /**
   * Store a portal config and get back `{ id, url }`. The `url` is the hosted
   * template with the config id baked in — pass it as an `html5` creative's
   * `assetUrl` (and the config's landing URL as `landingUrl`) to make a normal
   * creative attachable to a metaverse portal-surface campaign.
   */
  createConfig(req: CreatePortalConfigRequest): Promise<PortalConfigResult> {
    return this.c.request('POST', '/v1/portal/configs', { body: req });
  }
}

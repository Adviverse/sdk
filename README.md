# @adnet/sdk

A typed, **dependency-free** TypeScript client for the AdNet Control Plane public API.

- Uses the global `fetch` (Node >= 18 and modern browsers). No runtime dependencies.
- Domain types are imported (type-only) from [`@adnet/shared`](../../packages/shared), so they
  are erased at build time.
- Targets the **versioned `/v1`** API. Every API response includes an `X-API-Version: 1` header;
  future major versions may additionally send `Deprecation` / `Sunset` headers on the older
  version per RFC 8594.

## Install

Within the monorepo it is wired as a workspace package (`@adnet/sdk`). Externally, publish/pack the
`src` directory (it ships TypeScript sources) or run `tsc` to emit `dist`.

## Usage

```ts
import { AdNetClient } from '@adnet/sdk';

// Server-to-server / agents: pass a scoped API key (sent as x-api-key).
// Create one in the dashboard → Settings → API keys with the scopes you need.
const client = new AdNetClient({
  baseUrl: 'https://adviverse.com', // do NOT include /v1
  apiKey: process.env.ADVIVERSE_API_KEY, // ak_<prefix>.<secret>
});

// …or authenticate interactively with a session token instead:
//   const { token } = await client.auth.login({ email, password });
//   client.setToken(token);

// Advertiser: campaigns + creatives
const campaigns = await client.campaigns.list();
const campaign = await client.campaigns.create({
  name: 'Spring Sale',
  format: 'banner',
  pricing_model: 'cpm',
  bid_amount: 1.5,
  budget_total: 1000,
});
await client.creatives.create({
  campaign_id: campaign.id,
  type: 'image',
  landing_url: 'https://shop.example/spring',
  asset_url: 'https://cdn.example/banner.png',
});
await client.campaigns.submit(campaign.id);

// Publisher: properties + placements
const property = await client.properties.create({ domain: 'news.example', kind: 'website' });
const placement = await client.placements.create({
  property_id: property.id,
  name: 'Sidebar 300x250',
  format: 'banner',
  floor_cpm: 0.5,
});
const { tag } = await client.placements.tag(placement.id);

// Finance, reporting, deals, referrals, webhooks, keys
const balance = await client.finance.balance();
const report = await client.reporting.advertiser({ from: '2026-01-01', to: '2026-01-31' });
const deals = await client.deals.list();
const referrals = await client.referrals.list();
const hooks = await client.webhooks.list();
const apiKey = await client.keys.create({ name: 'ci', scopes: ['read'] });
```

## Using an API key instead of a session

```ts
const client = new AdNetClient({ baseUrl: 'https://adviverse.com', token: process.env.ADNET_API_KEY });
```

## Error handling

Non-2xx responses throw an `AdNetApiError` carrying `status`, `statusText`, the parsed `body`,
and the `method`/`path` that failed:

```ts
import { AdNetApiError } from '@adnet/sdk';

try {
  await client.campaigns.get('missing-id');
} catch (err) {
  if (err instanceof AdNetApiError && err.status === 404) {
    // handle not-found
  }
}
```

## Resource groups

| Group | Methods |
| --- | --- |
| `auth` | `signup`, `login`, `logout`, `me`, `verifyEmail`, `resendVerification`, `forgotPassword`, `resetPassword`, `setup2fa`, `enable2fa` |
| `campaigns` | `list`, `get`, `create`, `update`, `submit`, `setStatus`, `reachEstimate`, `getConversionConfig`, `setConversionConfig` |
| `creatives` | `listForCampaign`, `create`, `upload`, `delete` |
| `properties` | `list`, `create`, `verify`, `domainConnect` |
| `placements` | `list`, `create`, `update`, `tag` |
| `finance` | `balance`, `ledger`, `deposit`, `deposits`, `requestPayout`, `payouts` |
| `reporting` | `publisher`, `publisherFill`, `advertiser`, `ivt`, `sustainability` |
| `deals` | `list`, `create`, `setStatus`, `accept` |
| `referrals` | `list` |
| `webhooks` | `list`, `events`, `create`, `delete` |
| `keys` | `list`, `create`, `delete` |

## Configuration

```ts
new AdNetClient({
  baseUrl: 'https://adviverse.com',
  token: 'optional-bearer-or-api-key',
  timeoutMs: 30_000,      // default
  fetch: customFetchImpl, // optional; defaults to global fetch
});
```

# @adviverse/sdk

A typed, **dependency-free** TypeScript client for the [Adviverse](https://adviverse.com)
ad network public API (v1).

- Uses the global `fetch` (Node ≥ 18 and modern browsers) — **zero runtime dependencies**.
- Ships ESM + CJS + bundled type declarations.
- Targets the versioned `/v1` API.

## Install

```bash
npm i @adviverse/sdk
```

## Usage

```ts
import { AdNetClient } from '@adviverse/sdk';

const client = new AdNetClient({
  baseUrl: 'https://adviverse.com',
  apiKey: process.env.ADVIVERSE_API_KEY, // scoped API key (ak_…)
  // or: token: '<session bearer token>'
});

// Campaigns
const campaigns = await client.campaigns.list();
const campaign = await client.campaigns.create({ name: 'Q3 Launch', /* … */ });

// Reporting, pixel, audiences, publisher properties & placements, finance, etc.
await client.pixel.get();
await client.audiences.list();
```

The client exposes a resource group per API area: `campaigns`, `creatives`,
`audiences`, `pixel`, `properties`, `placements`, `finance`, `reporting`,
`deals`, `webhooks`, `keys`, `team`, `clients`, `invoices`, `transfers`, and more.

## Authentication

Pass either a **scoped API key** (`apiKey`, sent as `x-api-key`) for
server-to-server / agent use, or a **session token** (`token`, sent as a bearer).
An API key takes precedence.

## Errors

Non-2xx responses throw an `AdNetApiError` carrying `status`, `statusText`, the
parsed `body`, and the request `method` / `path`:

```ts
import { AdNetApiError } from '@adviverse/sdk';

try {
  await client.campaigns.get('missing-id');
} catch (err) {
  if (err instanceof AdNetApiError && err.status === 404) {
    // handle not-found
  }
}
```

## AI agents

For a ready-to-run MCP server that exposes this API as tools, see
[`@adviverse/mcp`](https://github.com/Adviverse/mcp).

## License

Proprietary — see [LICENSE](LICENSE).

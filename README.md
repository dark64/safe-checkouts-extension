# Safe Checkouts

A browser extension that identifies legitimate checkout iframes on websites by matching them against a curated safe-list.

## Features

- Detects checkout iframes (e.g., Stripe, Shopify) and highlights them
- Displays a "Safe" label near matched iframes
- Fetches the safe-list from a [this repository](https://raw.githubusercontent.com/dark64/safe-checkouts-extension/main/safe-urls.json)
- Caches the safe-list locally for 24 hours to minimize network requests
- Supports regex patterns for flexible URL matching

## Permissions

- `storage` - caching the safe-list locally

## Contributing

Contributions are very welcome! If you know of a legitimate payment or checkout iframe that isn't currently covered, please open a PR adding its URL pattern to `safe-urls.json`.

Each entry is a regex pattern matched against the iframe `src`.

## License

MIT

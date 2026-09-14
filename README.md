# Orwa Sole Co. storefront

[![CodSpeed](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://app.codspeed.io/odhiambogregory988-hash/my-ai-project?utm_source=badge)

Next.js storefront and admin dashboard, backed by Supabase.

## Development

```bash
npm install
npm run dev        # start the dev server
npm run build      # production build
npm run typecheck  # TypeScript checks
```

## Benchmarks

Performance-critical helpers in `lib/` are benchmarked with
[vitest bench](https://vitest.dev/guide/features.html#benchmarking) and tracked
continuously by [CodSpeed](https://codspeed.io).

```bash
npm run bench
```

Benchmarks live in `bench/` and cover catalogue loading and price formatting
(`lib/store.ts`), admin session tokens (`lib/auth.ts`), and the order history
helpers (`lib/accounts.ts`). They run on every pull request through the
`.github/workflows/codspeed.yml` workflow.

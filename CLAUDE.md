# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> ⚠️ **Read `AGENTS.md` first.** This project runs Next.js 16 (App Router), which
> has breaking changes vs. older versions in your training data. Before writing
> any Next.js code, consult the bundled docs in `node_modules/next/dist/docs/`.

## Project

"Malika bozor" — an online catalog/marketplace for phone shops in the **Malika
bozori** (a phone market in Tashkent). Buyers browse and compare phone listings
across shops without registering; shop owners pay a subscription to list phones;
an admin moderates shops/listings and confirms payments.

**The entire codebase is in Uzbek (Latin script)** — variable names, function
names, routes, UI text, and comments. Match this. Common terms:

| Uzbek | Meaning | Uzbek | Meaning |
|---|---|---|---|
| `dokon` | shop | `elon` | listing/ad |
| `obuna` | subscription | `tarif` | plan/tier |
| `tolov` | payment | `kabinet` | shop owner dashboard |
| `kirish` / `chiqish` | login / logout | `royxat` | registration |
| `qidiruv` | search | `joylashuv` | location |
| `xato` | error | `narx` | price |
| `holati` | status/condition | `faol` | active |
| `bor` | in stock | `reyting` | rating |

## Commands

```bash
npm run dev      # dev server (Turbopack) on :3000
npm run build    # production build
npm run start    # serve production build
npm run seed     # wipe + reseed MongoDB with test data (reads .env.local)
```

There is **no test runner and no lint script**. Type safety comes from `tsc`
(strict mode); `npm run build` is the closest thing to a CI check. Copy
`.env.example` → `.env.local` before running anything.

`npm run seed` creates an admin (`900000000` / `admin123`) and 4 shops
(`901110000`–`901110003` / `dokon123`) with listings.

## Architecture

Next.js 16 App Router + React 19 (React Compiler enabled via
`babel-plugin-react-compiler`) + Tailwind v4 + MongoDB/Mongoose. Path alias
`@/*` → `src/*`. PWA via `public/sw.js` + `src/app/manifest.ts`.

### Data layer (`src/models/`, `src/lib/db.ts`)

- Mongoose models use the cached-singleton pattern (`models.X || model('X', …)`)
  so Next hot-reload doesn't redefine schemas. `dbConnect()` caches the
  connection on `global._mongoose`. **Always `await dbConnect()` before any DB
  query** in a route/server component.
- Core entities: `User` (admin | shop), `Shop`, `Listing`, `Tolov` (payment),
  `Statistika`. A shop owner is a `User` with `rol: 'shop'` and a `shopId`.

### Auth (`src/lib/auth.ts`)

- JWT (`jose`, HS256) stored in an httpOnly cookie `mb_session` (7 days).
  Passwords hashed with `bcryptjs`.
- `getCurrentUser()` is the entry point — reads the cookie, returns the `IUser`
  or `null`. API routes guard with explicit `user.rol` / `user.shopId` checks
  returning `{ xato }` + status.
- **Page-level auth is enforced in layouts**, not middleware:
  `src/app/kabinet/layout.tsx` (requires `rol: 'shop'`) and
  `src/app/admin/layout.tsx` (requires `rol: 'admin'`) redirect via
  `next/navigation`.
- Phone numbers are the login identifier; `telefonNormalize()` canonicalizes to
  `+998XXXXXXXXX`.

### Subscriptions, plans, referrals — the business rules

These live in small single-purpose `src/lib/` files; **change business numbers
only there**:

- `tariflar.ts` — the three plans (`boshlangich`/`standart`/`premium`), their
  listing limits and prices. `limitTugaganmi()` gates listing creation.
- `obuna.ts` — `obunaniUzaytir(shop, oy)` extends `shop.obunaTugashi` and
  auto-approves a pending shop. **Mutates but does not save** — caller saves.
  Used by both admin confirmation and (future) payment webhooks so logic isn't
  duplicated.
- `referral.ts` — referral codes + `referralMukofotBer()` (idempotent via
  `referralMukofotBerildi` flag), grants free months on first payment.
- A listing only appears in public search when its shop is `tasdiqlangan` AND
  `obunaTugashi > now` — enforced in the `/api/listings` aggregation, not at
  write time.

### Payments (`src/lib/tolov/`, `src/app/api/tolov/`)

Three providers in `TolovProvider`: `payme`, `click`, `karta`. The **active**
flow is `karta` (manual card-to-card): shop creates a `kutilmoqda` `Tolov`, then
admin confirms via `PATCH /api/admin/tolov/[id]` which marks it `tolangan`,
calls `obunaniUzaytir`, sets the plan, and runs `referralMukofotBer`. Payme/Click
Merchant-API scaffolding exists (`payme.ts`, `click.ts`, webhook routes) but
card is the zero-cost default.

### Public search API (`src/app/api/listings/route.ts`)

`GET` runs a MongoDB aggregation: match active listings → `$lookup` shops →
filter to approved+subscribed shops → sort → `$facet` for paginate+count.
Responses set `Cache-Control: s-maxage=30, stale-while-revalidate=60` (Vercel
CDN edge caching). Several public pages also rely on ISR.

### Statistics (`src/lib/stat.ts`, `src/lib/statBeacon.ts`)

Event types in `STAT_TURLARI` (shop/listing views, calls, telegram, directions).
Client fires events via `navigator.sendBeacon` → `POST /api/stat`, aggregated
per-day keyed by Asia/Tashkent date (`sanaKalit()`). Surfaced in
`/kabinet/statistika` (shop) and `/admin` (global).

### Conventions

- **Validation**: every mutating API route validates input with a Zod schema
  (shared ones in `src/lib/validators.ts`) and returns
  `{ xato: '<uzbek message>' }` with an appropriate status. Success returns
  `{ ok: true, … }`.
- **Maps/location**: shops have optional `geo {lat,lng}`; `JoylashuvXarita`
  (Leaflet/OpenStreetMap) handles picking/showing location. Falls back to OSM
  when `NEXT_PUBLIC_GOOGLE_MAPS_KEY` is unset.
- **Images**: optional Cloudinary unsigned upload (`NEXT_PUBLIC_CLOUDINARY_*`)
  via `RasmYuklash`; `rasmlar` is a string[] of URLs.
- Server Components by default; mark interactive components `'use client'`.

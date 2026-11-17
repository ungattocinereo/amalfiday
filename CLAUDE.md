# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Amalfi.Day — a static website for an Amalfi Coast local guide covering photoshoots, apartments, beaches, transport, and experiences. Built with **Astro 5**, outputs purely static HTML. Blog content is fetched from a Ghost CMS at build time.

Live site: https://amalfi.day

## Commands

```bash
npm run dev            # Dev server at localhost:4321
npm run build          # Build static site to dist/
npm run build:static   # Build + Brotli/Gzip precompress assets
npm run preview        # Preview production build locally
npm run contact:api    # Run contact form API server (for dev, proxied via /api)
npm test               # Unit tests (Node built-in test runner, tests/)
```

No linter is configured.

## Architecture

### Rendering Model

Everything is static (`output: 'static'`). Pages are Astro components in `src/pages/` with file-based routing. Ghost CMS posts are fetched at build time via `src/data/ghost.ts` — if env vars are missing, the blog gracefully renders empty.

### Layout Chain

`BaseLayout` (`src/layouts/BaseLayout.astro`) wraps every page. It provides:
- Full SEO/OG/Twitter meta tags (configured from props + defaults in `src/data/site.ts`)
- Theme initialization script (day/night via `localStorage` + `prefers-color-scheme`)
- Header and Footer components

Pages pass `title`, `description`, `image` as props to BaseLayout.

### Styling System

- **Design tokens** in `src/styles/tokens.css` — CSS custom properties for colors, fonts, spacing, shadows
- **Day/Night theming** via `[data-theme='night']` selector overriding the same custom properties
- **Fonts**: Libre Baskerville (display), Roboto (body), IBM Plex Mono (mono)
- **Component-scoped CSS** in `<style>` blocks within `.astro` files
- **Global styles** in `src/styles/global.css`
- Brand color: `#FF5900` (accent orange)

### Contact Form

The contact page submits to `/api/contact` which forwards messages to Telegram via the Bot API. In dev, Vite proxies `/api` to `localhost:8787` where `scripts/contact-server.mjs` runs. In production the same `scripts/contact-server.mjs` runs on the server as the `amalfi-contact.service` systemd unit and Caddy proxies `/api/contact` to it (see Hosting and Deployment). The `api/*.js` files are thin wrappers kept for serverless hosts and are not executed in production.

### Direct Booking

Guests search dates on `/apartments/#direct` and get a price quote on `/book/<id>/`. Payment is not online yet: the guest sends a request through the contact form and the host confirms.

- `src/data/direct-units.mjs` — registry: site id → Hostex property / Airbnb listing, max guests
- `scripts/lib/booking-quote.mjs` — pure price rules (nightly rate, discount, minimum stay)
- `scripts/lib/hostex-read.mjs` — read-only Hostex client
- `scripts/lib/booking-handlers.mjs` + `api/booking/calendar.js`, `api/booking/quote.js` — endpoints
- `src/scripts/direct-booking-client.mjs` — browser pure functions
- `src/data/booking-mode.mjs` — `BOOKING_MODE` (`'request'` now, `'instant'` with online payment): drives guest copy in `DirectBooking.astro`, `BookingPanel.astro` and `policyText`
- `scripts/lib/rate-limit.mjs` — in-memory per-IP limiter (quote 30/min, calendar 20/min → 429 + `Retry-After`); production runs one long-lived Node process, so the limiter holds across requests. The calendar endpoint answers 400 to any query string (there is no CDN in production; the rule keeps the endpoint cheap to cache in-process later)
- Calendar nights are `{ d, b, p, m }` plus `a: 1` (closed on arrival) / `x: 1` (closed on departure); `unitState` refuses those stays like `quoteStay`
- `src/components/DirectBooking.astro`, `DirectCard.astro`, `BookingPanel.astro`; page `src/pages/book/[id].astro`
- Local dev without Hostex: `BOOKING_FIXTURE=1 npm run contact:api` serves fixture data

### Key Data Files

- `src/data/site.ts` — site metadata, navigation links, footer links, featured photoshoots
- `src/data/ghost.ts` — Ghost CMS client with TypeScript types, graceful error handling
- `hero-quatrains.json` — array of 4-line poems rotated randomly on the homepage hero

### Static Assets

- `public/` — images, favicons, brand assets (served at root `/`)
- `staticpages/` — large media files for content pages
- Images are WebP format; lazy-loaded with `loading="lazy"`

## Hosting and Deployment

**The live site is NOT on Vercel.** It runs on the owner's own server (ssh host `sweden`):

- Checkout at `/srv/amalfiday`; Caddy serves the static build from `/srv/amalfiday/dist` (precompressed br/gzip). Example config in `docs/deploy-static.md`.
- Server routes: Caddy proxies `/api/contact` to `127.0.0.1:8787`, where `amalfi-contact.service` runs `node scripts/contact-server.mjs` with env from `/srv/amalfiday/.env`. Any new `/api/...` route needs a handler in `scripts/contact-server.mjs` **and** a Caddy `handle` rule on the server. `/api/booking/*` is implemented in the Node server but not yet proxied by Caddy. The calendar's Hostex read is cached in-process for 60 s (`scripts/lib/nights-cache.mjs`, stale fallback up to 10 min); quotes always read Hostex live. The service must be restarted after a deploy to load new server code.
- `/api/availability` is not proxied: in production the availability calendar reads the static `public/calendars/availability.json`, regenerated by `npm run build:static`.
- Deploy: `/srv/amalfiday/deploy-amalfi-day.sh` does `git fetch origin main`, `git reset --hard origin/main`, `npm ci`, `npm run build:static`. Whatever is on `main` goes live when it runs.
- No CDN: `s-maxage` headers have no effect; cache in the Node process or in Caddy. Scheduled jobs are systemd timers or cron on the server, not platform crons.
- `vercel.json` redirects are not applied in production; redirects live in the Caddy config and `astro.config.mjs`.

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `GHOST_API_URL` | Ghost CMS base URL (needed for blog) |
| `GHOST_CONTENT_API_KEY` | Ghost Content API key |
| `TELEGRAM_BOT_TOKEN` | Contact form → Telegram |
| `TELEGRAM_CHAT_ID` | Target Telegram chat |
| `PUBLIC_WHATSAPP_PHONE` | WhatsApp contact number |
| `HOSTEX_ACCESS_TOKEN` | Hostex API token for direct booking (server-only) |
| `DIRECT_DISCOUNT_PCT` | Direct booking discount in percent (default 10) |

All are optional — the site builds and works without them (blog shows empty, contact form errors).

This repository is public: tokens live only in `.env` and the hosting dashboard, and must never be committed.

## Adding Content

New photoshoot pages: copy `src/pages/photoshootings/template.astro`, replace content and images. Gallery images are defined as arrays in the frontmatter. Image paths are relative to `public/`.

New pages: create `.astro` file in `src/pages/` — Astro's file-based routing handles the rest. Wrap content in `<BaseLayout>` with appropriate SEO props.

## Docker / Ghost CMS

`compose.yml` runs Ghost + MariaDB for the blog backend. This is separate from the Astro site — Ghost is only queried at build time. Deployment docs in `docs/ghost-deploy.md`.

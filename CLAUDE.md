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
```

No test runner or linter is configured.

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

The contact page submits to `/api/contact` which forwards messages to Telegram via the Bot API. In dev, Vite proxies `/api` to `localhost:8787` where `scripts/contact-server.mjs` runs. In production, `api/contact.js` is a serverless function (Vercel/similar).

### Key Data Files

- `src/data/site.ts` — site metadata, navigation links, footer links, featured photoshoots
- `src/data/ghost.ts` — Ghost CMS client with TypeScript types, graceful error handling
- `hero-quatrains.json` — array of 4-line poems rotated randomly on the homepage hero

### Static Assets

- `public/` — images, favicons, brand assets (served at root `/`)
- `staticpages/` — large media files for content pages
- Images are WebP format; lazy-loaded with `loading="lazy"`

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `GHOST_API_URL` | Ghost CMS base URL (needed for blog) |
| `GHOST_CONTENT_API_KEY` | Ghost Content API key |
| `TELEGRAM_BOT_TOKEN` | Contact form → Telegram |
| `TELEGRAM_CHAT_ID` | Target Telegram chat |
| `PUBLIC_WHATSAPP_PHONE` | WhatsApp contact number |

All are optional — the site builds and works without them (blog shows empty, contact form errors).

## Adding Content

New photoshoot pages: copy `src/pages/photoshootings/template.astro`, replace content and images. Gallery images are defined as arrays in the frontmatter. Image paths are relative to `public/`.

New pages: create `.astro` file in `src/pages/` — Astro's file-based routing handles the rest. Wrap content in `<BaseLayout>` with appropriate SEO props.

## Docker / Ghost CMS

`compose.yml` runs Ghost + MariaDB for the blog backend. This is separate from the Astro site — Ghost is only queried at build time. Deployment docs in `docs/ghost-deploy.md`.

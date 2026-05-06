# Repository Guidelines

## Project Structure & Module Organization

This is an Astro 5 static site for Amalfi.Day. Application source lives in `src/`: routes in `src/pages`, shared Astro components in `src/components`, common layouts in `src/layouts`, data and integrations in `src/data`, and global CSS in `src/styles`. Public assets are served from `public/` by URL path, while larger legacy media also exists in `staticpages/`. Build and content utilities live in `scripts/`. Generated output such as `dist/`, `.astro/`, and `node_modules/` should not be edited by hand.

## Build, Test, and Development Commands

- `npm install` installs project dependencies.
- `npm run dev` starts Astro locally, usually at `http://localhost:4321`.
- `npm run build` runs the standard Astro static build.
- `npm run build:static` refreshes calendars, builds the site, then precompresses assets for deployment.
- `npm run preview` serves the built site locally for final checks.
- `npm run update-calendars`, `npm run optimize-images`, and `npm run precompress` run individual maintenance tasks.
- `npm run contact:api` starts the local contact API helper used by the Vite `/api` proxy.

## Coding Style & Naming Conventions

Use ES modules and match the existing Astro style: two-space indentation, single quotes in JavaScript/TypeScript config files, and semicolon-free statements. Name Astro components in PascalCase, for example `AvailabilityCalendar.astro`; route files should follow URL-oriented lowercase names such as `parking.astro` or `blog/[slug].astro`. Keep page content close to the relevant `.astro` route unless it is reused, then move shared values to `src/data`.

## Testing Guidelines

No automated test runner is currently configured. Treat `npm run build` as the minimum verification for code changes, and use `npm run preview` for layout, navigation, SEO, and asset checks. For changes touching calendars, images, compression, Ghost, or contact handling, also run the matching script directly before building.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Refresh apartment availability calendars` or `Add CldImage helper; migrate 7 hero images to Cloudinary fetch`. Keep the first line specific and outcome-focused. Pull requests should include a concise description, affected routes or assets, verification commands run, linked issues when available, and screenshots for visible UI changes.

## Security & Configuration Tips

Do not commit secrets. Use `.env` from `.env.example` for `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `PUBLIC_WHATSAPP_PHONE`, `GHOST_API_URL`, and `GHOST_CONTENT_API_KEY`. If Ghost variables are missing, the blog intentionally falls back to an empty list.

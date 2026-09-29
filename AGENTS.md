# Repository Guidelines

## Project Structure & Module Organization

This is an Astro 5 static site for Amalfi.Day. Application source lives in `src/`: routes in `src/pages`, shared Astro components in `src/components`, common layouts in `src/layouts`, data and integrations in `src/data`, and global CSS in `src/styles`. Public assets are served from `public/` by URL path, while larger legacy media also exists in `staticpages/`. Build and content utilities live in `scripts/`. Generated output such as `dist/`, `.astro/`, and `node_modules/` should not be edited by hand.

## Photoshoot Pages

For new photoshoots and changes to their hero, galleries, images, or request form, read and apply the project [photoshoot-template skill](.agents/skills/photoshoot-template/SKILL.md). The approved default is `src/pages/photoshootings/template-gallery.astro`; older `template.astro` and `concept-editorial.astro` are not the default for new pages. Preserving faces in every crop is mandatory: check each image in the hero, galleries, and thumbnails across desktop and mobile sizes, and use focal points specific to that photoshoot. Preserve the agreed fonts, themes, contextual icons, gallery controls, and compact request flow described in the skill unless the user explicitly changes them.

## Build, Test, and Development Commands

- `npm install` installs project dependencies.
- `npm run dev` starts Astro locally, usually at `http://localhost:4321`.
- `npm run build` runs the standard Astro static build.
- `npm run build:static` refreshes calendars, builds the site, then precompresses assets for deployment.
- `npm run preview` serves the built site locally for final checks.
- `npm run update-calendars`, `npm run optimize-images`, and `npm run precompress` run individual maintenance tasks.
- `npm run contact:api` starts the local contact API helper used by the Vite `/api` proxy.

## City Icons and Catalog Cards

Use the shared city identities in `src/data/city-icons.ts` wherever a UI label or card identifies a city. Use `CityLabel.astro` for an icon with its city name (including compound labels such as Amalfi & Atrani), or `getCityIcon(name)` inside existing icon wrappers. Never assign a different icon locally or use a generic map pin for a registered city. Add new cities and spelling aliases to this registry once, then reuse them throughout the project. Keep every city's icon distinct; the generic pin is only a fallback for unregistered locations. Icons beside readable city names are decorative (`aria-hidden="true"`). This rule does not add icons inside ordinary prose or replace functional icons for maps, directions, transport, or session themes.

Photoshoot catalog cards use full-bleed photographs, the existing gradient overlay, a category badge, and overlaid location/title. Select card images and focal points in the photoshoot's `card` data; verify faces at desktop and mobile sizes rather than assuming the hero image fits a card.

## Coding Style & Naming Conventions

Use ES modules and match the existing Astro style: two-space indentation, single quotes in JavaScript/TypeScript config files, and semicolon-free statements. Name Astro components in PascalCase, for example `AvailabilityCalendar.astro`; route files should follow URL-oriented lowercase names such as `parking.astro` or `blog/[slug].astro`. Keep page content close to the relevant `.astro` route unless it is reused, then move shared values to `src/data`.

## Testing Guidelines

No automated test runner is currently configured. Treat `npm run build` as the minimum verification for code changes, and use `npm run preview` for layout, navigation, SEO, and asset checks. For changes touching calendars, images, compression, Ghost, or contact handling, also run the matching script directly before building.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Refresh apartment availability calendars` or `Add CldImage helper; migrate 7 hero images to Cloudinary fetch`. Keep the first line specific and outcome-focused. Pull requests should include a concise description, affected routes or assets, verification commands run, linked issues when available, and screenshots for visible UI changes.

## Security & Configuration Tips

Do not commit secrets. Use `.env` from `.env.example` for `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `PUBLIC_WHATSAPP_PHONE`, `GHOST_API_URL`, and `GHOST_CONTENT_API_KEY`. If Ghost variables are missing, the blog intentionally falls back to an empty list.

# Cloudinary integration plan

**Cloud name:** `di63rbpo7`
**Account URL provided:** `CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@di63rbpo7`

This document covers two questions:

1. **Where do the keys go** (so the integration "just works" on local, Vercel, and the VPS)?
2. **Which integration shape fits this site best** (build-time URL rewrite vs. upload-and-replace)?

---

## TL;DR — recommended setup

Use **Cloudinary's `fetch` delivery type** (Approach A below). Cloudinary pulls each image from `https://amalfi.day/...` on first request, transforms it (`f_auto, q_auto, width`), and caches the result for ~30 days at the CDN edge.

For this you only need the **cloud name** (which is public-safe). `CLOUDINARY_URL` with the API key/secret is **only needed if you also want to upload assets** (Approach B). Recommend keeping the env var available anyway for future use.

---

## Where to put the keys

The `CLOUDINARY_URL` env var has the format:

```
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

The `cloudinary` Node SDK reads it automatically — no manual config call needed.

### 1. Local development (your laptop)

Put it in **`.env`** at the repo root (gitignored):

```env
# Public — exposed to client-side code, safe to commit if needed:
PUBLIC_CLOUDINARY_CLOUD_NAME=di63rbpo7

# Secret — server/build only, NEVER commit:
CLOUDINARY_URL=cloudinary://YOUR_API_KEY:YOUR_API_SECRET@di63rbpo7
```

Astro exposes `import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME` to both server and client; `import.meta.env.CLOUDINARY_URL` only to the build process.

Update `.env.example` with placeholder values so the next dev knows what to set:

```env
PUBLIC_CLOUDINARY_CLOUD_NAME=di63rbpo7
CLOUDINARY_URL=cloudinary://YOUR_KEY:YOUR_SECRET@di63rbpo7
```

### 2. Vercel deployment

If/when the site is ever deployed to Vercel, add the same two vars there:

```bash
vercel env add PUBLIC_CLOUDINARY_CLOUD_NAME production    # paste: di63rbpo7
vercel env add CLOUDINARY_URL production                  # paste full cloudinary:// URL
```

Repeat for the `preview` and `development` environments if you want preview deploys to have it.

### 3. Sweden VPS (current production)

Edit **`/home/greg/amalfiday/.env`** on the VPS:

```bash
ssh sweden
sudo -u greg nano /home/greg/amalfiday/.env
```

Append (or replace) these lines:

```env
PUBLIC_CLOUDINARY_CLOUD_NAME=di63rbpo7
CLOUDINARY_URL=cloudinary://YOUR_API_KEY:YOUR_API_SECRET@di63rbpo7
```

The deploy script (`/home/greg/deploy-amalfi-day.sh`) does `git fetch + reset --hard + npm install + npm run build:static`. It does **not** touch `.env`, so values persist across deploys. The build picks them up automatically because Astro reads `.env` from the project root.

After saving, trigger a deploy to verify:

```bash
ssh sweden 'sudo /home/greg/deploy-amalfi-day.sh'
tail /tmp/deploy.log    # check for build-time errors
```

---

## Approach A — fetch delivery (recommended)

Cloudinary's **`/image/fetch/`** endpoint pulls a remote image, transforms it, and caches it. No upload, no SDK in the browser, no admin keys at runtime. Source images stay where they are; Cloudinary acts as a CDN + transformer in front of them.

### URL shape

```
https://res.cloudinary.com/di63rbpo7/image/fetch/<transforms>/<URL-encoded source>
```

Example — render a 1200px-wide auto-format/auto-quality version of the homepage hero:

```
https://res.cloudinary.com/di63rbpo7/image/fetch/f_auto,q_auto,w_1200/https://amalfi.day/staticpages/video/atrani-sorrento-video.webp
```

Common transforms:

| Param | Meaning |
|---|---|
| `f_auto` | Pick the best format per browser (AVIF → WebP → JPEG) |
| `q_auto` | Auto-quality (typically saves 30–60% vs original at same perceived quality) |
| `w_<n>` | Width in px; height adjusts to keep aspect ratio |
| `dpr_auto` | Match device pixel ratio (Retina / 2× / 3×) |
| `c_fill,g_auto` | Crop to fill, with smart-pick gravity |

### Implementation plan

1. **Helper component** — `src/components/CldImage.astro`. Takes `src`, `alt`, `width`, `height` and emits an `<img>` with `srcset` for `1x`/`2x` from Cloudinary fetch, plus the original local `src` as fallback. Reads `PUBLIC_CLOUDINARY_CLOUD_NAME` from env.
2. **Migrate above-the-fold images first** — heroes on `/`, `/photoshootings`, `/apartments`, `/experience`, blog post hero. These give the biggest LCP win.
3. **Migrate gallery thumbs and cards** — biggest savings from `q_auto` + `dpr_auto`.
4. **Skip:** SVG logos, brand assets in `/brand/` (already optimal, would just route through Cloudinary for nothing).

### Constraints to know

- **Cloudinary fetch needs the source to be publicly reachable.** `amalfi.day` is — fine. Local dev (`localhost:4321`) is not, so in dev the helper component should fall back to the local path.
- **Free tier:** 25 credits/month. 1 credit ≈ 1000 transformations or ≈ 1 GB delivery. For a static site with browser caching this is generous.
- **First request to a new transform** can take 1–2s (Cloudinary fetches and processes). After that it's CDN-served.
- **Cache:** Cloudinary caches for 30 days by default. To force re-fetch after replacing an image, change the URL (e.g., add `v=<timestamp>` query string).

---

## Approach B — upload + use Cloudinary URLs

Only worth doing if you want:
- Versioned uploads with Cloudinary public IDs you control
- AI tagging / face detection / responsive breakpoints API
- Decoupling the image origin from the website domain

### Implementation plan

1. **`scripts/cloudinary-sync.mjs`** — walks `public/photoshootings`, `public/staticpages`, `public/apartments`, `public/pre-footer`, etc.; uploads new files via the SDK; writes `public/cloudinary-manifest.json` mapping local paths → public IDs.
2. **`CldImage.astro`** — looks up the local path in the manifest; if found, builds a `https://res.cloudinary.com/di63rbpo7/image/upload/<transforms>/<public_id>` URL.
3. **Hook into `npm run build:static`** so new images upload before each build.

`CLOUDINARY_URL` (with API key + secret) is required for this approach. Keep the env var even if you go with Approach A first, so this stays one config line away.

---

## Suggested package

Either approach uses the same SDK:

```bash
npm install cloudinary
```

For the helper component, we won't import the SDK in the browser — just construct fetch URLs by string, since the cloud name is enough.

For the upload script we use the full SDK server-side; it picks up `CLOUDINARY_URL` automatically:

```js
import { v2 as cloudinary } from 'cloudinary'
// SDK reads CLOUDINARY_URL from env automatically
const result = await cloudinary.uploader.upload('public/photoshootings/individual/Shifa/Hero.webp', {
  public_id: 'photoshootings/individual/Shifa/Hero',
  overwrite: false,
})
```

---

## Routing policy (since 2026-05-02)

**Photoshoot images (`/photoshootings/...`) and apartment images (`/apartments/...`) are served direct from amalfi.day, never via Cloudinary.** Everything else routes through Cloudinary fetch when `PUBLIC_CLOUDINARY_CLOUD_NAME` is set.

The policy is baked into `src/components/CldImage.astro`:

```ts
const SKIP_CLOUDINARY = ['/photoshootings/', '/apartments/']
const useCloud =
  Boolean(cloud) && !SKIP_CLOUDINARY.some((p) => src.includes(p))
```

When `useCloud` is false, the helper emits a plain `<img>` with the local `src`, no `srcset`. `width`, `height`, `alt`, `loading`, and `fetchpriority` are still preserved so layout reservation, LCP hints, and accessibility keep working.

This means callers can safely use `<CldImage>` everywhere — for photoshoot/apartment paths it transparently degrades to a plain `<img>`, so future migrations of gallery thumbs and apartment cards "just work" without per-call branching.

To extend the skip-list (e.g. also keep `/brand/` direct), edit the `SKIP_CLOUDINARY` array.

---

## What to do next

1. ~~Drop the keys into the three places listed in **"Where to put the keys"**.~~ ✓ (done 2026-05-02)
2. ~~Confirm Cloudinary fetch returns 200 for a sample URL.~~ ✓
3. ~~Add `CldImage.astro` helper and migrate the heroes.~~ ✓ (commit `5497ba6`)
4. Migrate further non-photoshoot/non-apartment images as needed (e.g., `/staticpages/...` cards, blog index thumbs).

---

## Quick reference

- **Console:** https://console.cloudinary.com (cloud `di63rbpo7`)
- **Fetch URL builder/docs:** https://cloudinary.com/documentation/fetch_remote_images
- **Transformations cheatsheet:** https://cloudinary.com/documentation/image_transformations
- **Free-tier limits:** https://cloudinary.com/pricing (25 credits/mo as of 2026-05)

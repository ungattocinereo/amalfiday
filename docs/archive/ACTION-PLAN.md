# SEO Action Plan: amalfi.day

**Current Score: 52/100** | **Target Score: 80+/100**

---

## CRITICAL (Fix Immediately)

### 1. Fix robots.txt deployment
**Impact:** Crawlability + Sitemap discovery | **Effort:** 5 min
**Current:** `public/robots.txt` exists in source but returns 404 in production.
**Action:** Verify the file is included in the build output (`dist/robots.txt`). Check Vercel/hosting config to ensure static files from `public/` are served at root. Run `npm run build` and confirm `dist/robots.txt` exists.

### 2. Remove spam category pages
**Impact:** Security + Trust | **Effort:** 30 min
**Current:** Casino spam pages exist at `/category/777slot-casino-login-561` and `/category/zet-casino-review-207`.
**Action:**
- Log into Ghost CMS admin
- Delete the spam categories/tags
- Check for any other injected content
- Change Ghost admin password
- Add to robots.txt: `Disallow: /category/777slot*` and `Disallow: /category/zet*`
- Submit removal requests in Google Search Console

### 3. Add H1 tag to homepage
**Impact:** On-page SEO | **Effort:** 5 min
**Current:** Homepage has no `<h1>` element. First heading is `<h2>`.
**Action:** In `src/pages/index.astro`, add a visually hidden or styled H1 in the hero section:
```html
<h1 class="sr-only">Amalfi Coast Local Guide — Photoshoots, Tours & Apartments</h1>
```
Or make the "Amalfication" branding section the H1.

### 4. Exclude /edit/ URLs from sitemap
**Impact:** Crawl budget + Indexability | **Effort:** 10 min
**Current:** 20+ Ghost CMS `/blog/*/edit/` URLs are in the sitemap.
**Action:** In `astro.config.mjs`, configure the sitemap integration to exclude patterns:
```js
sitemap({
  filter: (page) => !page.includes('/edit/') && !page.includes('/template/')
})
```

---

## HIGH (Fix Within 1 Week)

### 5. Add Organization + LocalBusiness JSON-LD
**Impact:** Schema (0 -> 5/10) | **Effort:** 1 hour
**Where:** `src/layouts/BaseLayout.astro`
**Action:** Add a `<script type="application/ld+json">` block with:
```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "name": "Amalfi.Day",
  "legalName": "CristallPont S.R.L.",
  "url": "https://amalfi.day",
  "logo": "https://amalfi.day/brand/logo-dark.svg",
  "description": "Local guide for Amalfi Coast photoshoots, apartments, and curated experiences.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Atrani",
    "addressRegion": "SA",
    "addressCountry": "IT"
  },
  "sameAs": [
    "https://instagram.com/amalfi.day",
    "https://facebook.com/amalfi.day",
    "https://twitter.com/amalfiday"
  ],
  "vatID": "06863730650"
}
```

### 6. Add Article JSON-LD to blog posts
**Impact:** Rich results for blog content | **Effort:** 30 min
**Where:** `src/pages/blog/[slug].astro`
**Action:** Add Article schema with headline, datePublished, author, image, publisher.

### 7. Add Service/TouristTrip schema to experience pages
**Impact:** Rich results for tour searches | **Effort:** 45 min
**Where:** `src/pages/experience/car-tours.astro`, `src/pages/experience/scooter.astro`
**Action:** Add TouristTrip or Service schema with name, description, offers (price), duration.

### 8. Optimize homepage title tag
**Impact:** Click-through rate | **Effort:** 5 min
**Current:** "Amalfi.Day -- CristallPont Amalfi Day"
**Better:** "Amalfi Coast Local Guide | Photoshoots, Tours & Apartments | Amalfi.Day"
**Where:** `src/pages/index.astro` — update the `title` prop passed to BaseLayout.

### 9. Fix above-fold image loading
**Impact:** LCP / Performance | **Effort:** 10 min
**Current:** Bus and ferry timetable images use `loading="lazy"` but are above-fold.
**Action:** In `src/pages/index.astro`, change these images to `loading="eager"`:
- `bus-timetables.webp`
- `ferry-timetables.webp`

---

## MEDIUM (Fix Within 1 Month)

### 10. Add BreadcrumbList schema
**Impact:** Search result breadcrumbs | **Effort:** 1 hour
**Action:** Create a Breadcrumb component and add BreadcrumbList JSON-LD to inner pages.

### 11. Add AggregateRating schema to photoshootings page
**Impact:** Star ratings in search results | **Effort:** 30 min
**Current:** 4 testimonials with 5-star ratings exist but are not structured.
**Action:** Add Review and AggregateRating JSON-LD using the existing testimonial data.

### 12. Create an About/Team page
**Impact:** E-E-A-T signals | **Effort:** 2 hours
**Action:** Create `src/pages/about.astro` with:
- Greg's bio, photography background, years on the coast
- Professional credentials, press mentions
- Company info (CristallPont S.R.L.)
- Link to it from the header or footer

### 13. Redirect old parking URL
**Impact:** Avoid duplicate content | **Effort:** 5 min
**Current:** Both `/parking/` and `/parking-in-amalfi-coast-2025/` exist.
**Action:** Add a 301 redirect from the old URL to `/parking/` in Vercel config or Astro middleware.

### 14. Create llms.txt for AI crawlers
**Impact:** AI search visibility | **Effort:** 30 min
**Action:** Create `public/llms.txt` with a structured site summary for AI crawlers (GPTBot, ClaudeBot, PerplexityBot).

### 15. Improve homepage content density
**Impact:** Content quality score | **Effort:** 1 hour
**Current:** Homepage has ~300 words of indexable text, mostly in card labels.
**Action:** Add a brief introductory paragraph below the hero with keywords: "Amalfi Coast", "local guide", "photoshoots", "apartments", "tours".

---

## LOW (Backlog)

### 16. Convert remaining .jpg images to WebP
**Impact:** Performance | **Effort:** 30 min
Some older photoshoot images are still `.jpg` (e.g., `couples/img_5f68ca5842ca6.jpg`).

### 17. Add WebSite schema with SearchAction
**Impact:** Sitelinks search box | **Effort:** 15 min
If search functionality is added, include WebSite schema with SearchAction.

### 18. Add related content links between photoshoot pages
**Impact:** Internal linking + engagement | **Effort:** 1 hour
Add "You might also like" section at the bottom of individual photoshoot pages.

### 19. Add author pages for blog posts
**Impact:** E-E-A-T | **Effort:** 2 hours
Create author pages and link blog posts to them for E-E-A-T signals.

### 20. Standardize brand naming
**Impact:** Brand consistency for AI citation | **Effort:** 30 min
Use "Amalfi.Day" consistently in all meta tags and visible text. Reserve "CristallPont S.R.L." for legal/footer only.

---

## Impact Projection

| After Fixes | Estimated Score |
|------------|----------------|
| Critical fixes only (#1-4) | 60/100 |
| + High priority (#5-9) | 72/100 |
| + Medium priority (#10-15) | 82/100 |
| + Low priority (#16-20) | 85/100 |

---

*Action plan generated February 14, 2026*

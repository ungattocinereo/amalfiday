# SEO Audit Report: amalfi.day

**Date:** February 14, 2026
**Business Type:** Local Service / Tourism (photoshoots, guided tours, apartments on the Amalfi Coast)
**Pages Crawled:** ~75 (including blog, photoshoots, experiences, guides)
**Overall SEO Health Score: 52/100**

---

## Executive Summary

Amalfi.Day is a well-designed, content-rich Amalfi Coast tourism site with strong visual presentation and good on-page content. However, it suffers from several **critical SEO gaps** that significantly limit its search visibility:

### Top 5 Critical Issues
1. **No robots.txt served in production** (404) — crawlers can't find sitemap or directives
2. **Zero structured data (JSON-LD)** across the entire site — no Organization, LocalBusiness, Article, or Service schema
3. **Homepage missing H1 tag** — no primary heading for Google to understand page topic
4. **Sitemap includes /edit/ URLs and template page** — exposing CMS admin paths to search engines
5. **Spam/hack category pages indexed** — `category/777slot-casino-login-561` and `category/zet-casino-review-207` appear in Google's map

### Top 5 Quick Wins
1. Deploy `public/robots.txt` (already exists in source, just not deploying correctly)
2. Add H1 to homepage (5-minute fix)
3. Add Organization + LocalBusiness JSON-LD to BaseLayout (30 min)
4. Remove `/edit/` and `/template/` URLs from sitemap (Astro config fix)
5. Remove spam category pages and block them in robots.txt

---

## 1. Technical SEO (Score: 14/25)

### Crawlability

| Check | Status | Notes |
|-------|--------|-------|
| robots.txt | FAIL | Returns 404 in production. File exists at `public/robots.txt` but is not being served. |
| Sitemap | PASS (with issues) | `sitemap-index.xml` exists and references `sitemap-0.xml`. But sitemap contains problematic URLs. |
| Canonical tags | PASS | Every page has `<link rel="canonical">` correctly set. |
| HTTPS | PASS | Site served over HTTPS. |
| Mobile viewport | PASS | `<meta name="viewport">` present on all pages. |
| hreflang | N/A | Single-language site (English). Not required. |

### Sitemap Issues

The sitemap at `sitemap-0.xml` contains **problematic URLs** that should be excluded:

- **`/blog/*/edit/` URLs** (20+ entries) — These are Ghost CMS edit links. Already disallowed in robots.txt source, but robots.txt isn't being served.
- **`/photoshootings/template/`** — Template page meant for internal use only.
- **`/design-guidelines/`** — Internal page, correctly disallowed in robots.txt source.
- **`/parking-in-amalfi-coast-2025/`** — Duplicate of `/parking/` (potential redirect needed).
- **`/photo/`** — Appears to be a duplicate/old path.

### Security Headers

Not directly tested, but HTTPS is properly configured.

### Indexability Issues

| Issue | Severity | Pages Affected |
|-------|----------|----------------|
| Spam category pages indexed | CRITICAL | `/category/777slot-casino-login-561`, `/category/zet-casino-review-207` |
| /edit/ paths in sitemap | HIGH | 20+ blog post edit URLs |
| Template page in sitemap | MEDIUM | `/photoshootings/template/` |
| Old parking URL not redirected | MEDIUM | `/parking-in-amalfi-coast-2025/` |

---

## 2. Content Quality (Score: 16/25)

### E-E-A-T Assessment

| Signal | Status | Notes |
|--------|--------|-------|
| Experience | STRONG | Owner (Greg) is clearly positioned as local guide with 10+ years on Amalfi Coast. Personal stories, first-person voice. Real photo sessions with named clients. |
| Expertise | STRONG | Deep local knowledge demonstrated across parking guides, transport timetables, beach reviews. Blog posts cover local news with authority. |
| Authoritativeness | MEDIUM | No About page with detailed bio. No professional credentials or press mentions visible. Blog has bylines but no author pages. |
| Trustworthiness | STRONG | Real business entity (CristallPont S.R.L., P.IVA visible). Real testimonials with full names. Booking.com and Airbnb cross-references. |

### Content Depth

| Page | Word Count (est.) | Assessment |
|------|-------------------|------------|
| Homepage | ~300 | THIN — mostly navigation links and cards, very little indexable text |
| Parking guide | 2000+ | STRONG — comprehensive, opinionated guide with real local knowledge |
| Photoshootings | ~400 | MODERATE — gallery-heavy, could use more descriptive text |
| Experience | ~500 | MODERATE — good structure, could expand descriptions |
| Blog posts | 500-1500 | GOOD — consistent quality, timely local content |

### Content Issues

- **Homepage has minimal indexable text** — the hero section is a poem rotated via JavaScript (not indexable), and the rest is mostly card links.
- **Photoshoot individual pages** are gallery-heavy with limited text content. Adding story narratives would improve ranking potential.
- **No About/Team page** — missing key E-E-A-T signals for the photographer/guide.

---

## 3. On-Page SEO (Score: 12/20)

### Title Tags

| Page | Title | Length | Assessment |
|------|-------|--------|------------|
| Homepage | "Amalfi.Day -- CristallPont Amalfi Day" | 38 chars | NEEDS IMPROVEMENT — "CristallPont Amalfi Day" is the company name, not a keyword-optimized title. Better: "Amalfi Coast Local Guide -- Photoshoots, Tours & Apartments" |
| Photoshootings | "Photoshootings -- CristallPont Amalfi Day" | 42 chars | OK — but "Photoshootings" is not the English search term. "Amalfi Coast Photoshoots" would rank better. |
| Experience | "Experiences -- CristallPont Amalfi Day" | 39 chars | OK — could include "Private Tours" or "Amalfi Coast" |
| Parking | "Parking Amalfi Coast 2026 -- Complete Guide" | 44 chars | EXCELLENT — year-targeted, keyword-rich |

### Meta Descriptions

All pages have meta descriptions. They are generally well-written and within the 150-160 character sweet spot.

### Heading Structure

| Page | H1 | H2s | Issues |
|------|-----|-----|--------|
| Homepage | MISSING | 4 | No H1 tag at all. First heading is H2. |
| Photoshootings | "Individual Sessions" (used as H1) | 2 | Actually uses `<h1>` correctly for section headers, but has multiple H1s |
| Experience | "Feel the coast as locals do" | 3 | Good H1, proper hierarchy |
| Parking | Present | Multiple | Well-structured |

### Internal Linking

- Good internal linking structure overall.
- Footer provides links to all major sections.
- Experience cards link to individual tour pages.
- Photoshoot cards link to individual story pages.
- **Missing**: breadcrumb navigation on inner pages.
- **Missing**: related content links (e.g., "You might also like" between photoshoot pages).

---

## 4. Schema & Structured Data (Score: 0/10)

### Current Implementation

**None.** The site has zero JSON-LD structured data across all pages.

### Missing Schema Opportunities

| Schema Type | Where | Impact |
|-------------|-------|--------|
| **Organization** | BaseLayout (all pages) | Establishes brand identity, logo, social profiles in Knowledge Panel |
| **LocalBusiness** | Homepage | Google Maps integration, local search visibility, opening hours |
| **TouristAttraction / TouristTrip** | Experience pages | Rich results for tour searches |
| **Photographer / Service** | Photoshooting pages | Service-specific rich results |
| **Article** | Blog posts | Rich results with date, author, featured image |
| **BreadcrumbList** | All inner pages | Breadcrumb trail in search results |
| **AggregateRating / Review** | Photoshootings page | Star ratings in search results from testimonials |
| **WebSite** | Homepage | Enables sitelinks search box |

---

## 5. Performance (Score: 6/10)

### Observations

| Metric | Assessment |
|--------|------------|
| Static HTML output | EXCELLENT — Astro SSG means fast TTFB |
| Image format | GOOD — WebP used throughout |
| Image lazy loading | MIXED — above-fold images use `loading="lazy"` (bad), hero uses `loading="eager"` (good) |
| Font loading | GOOD — `preload` with `onload` swap pattern |
| Third-party scripts | MINIMAL — only Google Analytics |
| Video | GOOD — preload="none" with poster image |

### Issues

- **Bus and ferry timetable images** (above-fold on all viewports) use `loading="lazy"` — should be `loading="eager"`.
- **6 quick-link images** in the hero ribbon use `loading="lazy"` — visible on desktop above-fold.
- No Brotli/Gzip precompression detected in production (though `build:static` script exists).

---

## 6. Images (Score: 3/5)

### Alt Text

| Check | Status |
|-------|--------|
| Hero images | PASS — descriptive alt text |
| Photoshoot cards | PASS — shoot title as alt |
| Logo images (night mode) | FAIL — empty alt="" on night-mode logos but these are decorative (aria-hidden), so acceptable |
| Blog post images | PASS — post titles as alt |

### Image Optimization

- All content images are WebP format.
- Hero image has `fetchpriority="high"` and `loading="eager"` (correct).
- Most images have width/height attributes to prevent CLS.
- Some older photoshoot images still use `.jpg` format (e.g., `couples/img_5f68ca5842ca6.jpg`).

---

## 7. AI Search Readiness (Score: 1/5)

### Citability Score: LOW

| Signal | Status |
|--------|--------|
| Structured data | MISSING — AI systems rely heavily on JSON-LD to extract facts |
| Clear factual statements | MODERATE — blog posts have good factual density; service pages are more emotional/marketing |
| llms.txt | MISSING — no `/llms.txt` file for AI crawlers |
| AI crawler access | UNKNOWN — no robots.txt being served, so all crawlers have access by default |
| Passage-level structure | MODERATE — good use of headings in content pages, but homepage is mostly visual |
| Brand mention consistency | MODERATE — "Amalfi.Day" and "CristallPont" are used interchangeably |

### Recommendations for AI Visibility
1. Add JSON-LD structured data (Organization, LocalBusiness, Service)
2. Create `/llms.txt` with a site summary for AI crawlers
3. Ensure factual, citation-worthy passages in service descriptions (prices, durations, included items)
4. Use consistent brand naming ("Amalfi.Day" everywhere, "CristallPont S.R.L." only in legal footer)

---

## Scoring Summary

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 25% | 14/25 | 14.0 |
| Content Quality | 25% | 16/25 | 16.0 |
| On-Page SEO | 20% | 12/20 | 12.0 |
| Schema / Structured Data | 10% | 0/10 | 0.0 |
| Performance | 10% | 6/10 | 6.0 |
| Images | 5% | 3/5 | 3.0 |
| AI Search Readiness | 5% | 1/5 | 1.0 |
| **TOTAL** | **100%** | | **52/100** |

---

## Spam/Security Alert

The site map crawl revealed **two spam category pages** that appear to be from a past hack or spam injection:

- `https://amalfi.day/category/777slot-casino-login-561`
- `https://amalfi.day/category/zet-casino-review-207`

These are casino/gambling spam pages. **Action required:**
1. Check if these pages are generated from Ghost CMS (likely injected tags/categories)
2. Remove them immediately
3. Add `noindex` tags or delete the categories from Ghost
4. Monitor Google Search Console for other injected content
5. Consider changing Ghost admin credentials

---

*Report generated by SEO Audit Tool | February 14, 2026*

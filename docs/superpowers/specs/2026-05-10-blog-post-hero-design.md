# Blog Post Hero Redesign

Date: 2026-05-10
Scope: `src/pages/blog/[slug].astro` and the production Caddy route for Ghost responsive images.

## Goal

Turn individual Ghost-powered blog posts at `/blog/<slug>/` into immersive article pages with a full-screen hero in the visual language of `/apartments`, while leaving the blog index and paginated listing unchanged.

The redesign should make articles feel intentional and editorial when Ghost content includes modern Koenig cards, especially full-width header cards and responsive images.

## Current Problems

- Article pages use a small centered header plus a separate hero image, so the first screen feels weaker than the rest of the site.
- Ghost `kg-header-card kg-width-full` is not styled, so header cards collapse into the narrow article column and can render as awkward empty strips.
- The article body was originally designed around simple paragraphs, headings, and images. It does not yet fully account for the richer HTML that Ghost emits from the Koenig editor, so using a Header card or full-width media inside a post can break spacing, image height, text contrast, and the overall reading rhythm.
- Ghost `srcset` URLs such as `/blog/content/images/size/w600/...` return 404 on production because Caddy serves `/blog/content/images/*` directly from the Ghost content volume before Ghost can generate resized files.
- The blog index currently has its own masthead and editorial listing. It should not change in this pass.

## Design Direction

Individual post pages should start with a cinematic full-viewport hero:

- Use the post feature image (`post.image`) as a full-bleed background.
- Apply a dark vignette and gradient overlay so the header/navigation and title remain readable.
- Use the existing `hero--dark` hook so `Header.astro` switches into its on-hero treatment.
- Show the primary tag as the eyebrow, the post title as the large display headline, and `post.excerpt` as the subtitle.
- Keep author, publish date, and reading time visible in the hero metadata.
- Add a subtle scroll hint, matching the behavior and feel of `/apartments`.

If a post has no feature image, the hero should still render cleanly using a dark gradient/surface treatment, but production Ghost posts are expected to have images.

## Article Body

After the hero:

- Remove the separate `.post-image` block to avoid showing the feature image twice.
- Keep the main reading column narrow enough for comfortable reading, roughly the existing `680px` article width.
- Keep the author bio, transport callout, related posts, and back link behavior.
- Preserve existing Ghost card support where it already works: images, galleries, videos, bookmarks, callouts, toggles, tables, and embeds.
- Keep the first-paragraph drop cap, but constrain it to the first real top-level paragraph so it does not attach to Ghost cards or media.

## Post Content Layout Fixes

Treat the post body as a Ghost-rendered editorial document, not just a stream of basic HTML:

- Normalize vertical rhythm between paragraphs, headings, figures, lists, dividers, and Ghost cards so inserted media does not create huge accidental gaps or cramped transitions.
- Define clear width rules for content types:
  - text, lists, tables, and quotes stay in the readable article column;
  - `kg-width-wide` breaks out to a controlled wide measure;
  - `kg-width-full` breaks out to the viewport without causing horizontal scroll.
- Style Ghost image cards explicitly through `.kg-image-card`, `.kg-image`, and captions, rather than relying only on generic `figure img` rules.
- Ensure images, captions, and cards have stable dimensions or responsive constraints so lazy-loaded media and broken `srcset` choices do not collapse layout while loading.
- Make Ghost headings inside the body (`h2`, `h3`, and card headings) feel like article section markers, with spacing that works after text, images, and header cards.
- Keep blockquotes, callouts, bookmarks, videos, embeds, and toggles visually compatible with the new hero so the article does not feel like two different templates stitched together.
- Add mobile rules for every breakout pattern so full-width content remains edge-to-edge and readable on phones without clipping text or creating side-scroll.
- Use the production article example with Ghost Header cards as the main regression case, because it exposes the original missing layout support.

## Ghost Header Cards

Style `kg-header-card` explicitly:

- `kg-width-full` should break out of the article column and span the viewport.
- Header card images should have stable responsive heights and `object-fit: cover`.
- Add a dark overlay so optional Ghost heading/subheading text is legible.
- Center or left-align Ghost header text according to the classes Ghost emits, without needing custom HTML in the post.
- If the Ghost header card contains only an image and no text, it should still look like a deliberate visual interlude.
- On mobile, full-width cards should remain edge-to-edge but not cause horizontal scrolling or text overflow.

## Production Image Routing

Fix the production Caddy route for Ghost responsive images:

- Add a more specific handler above the current `/blog/content/images/*` volume handler:

```caddyfile
handle /blog/content/images/size/* {
    reverse_proxy 127.0.0.1:40001
}
```

- Keep the existing volume handler for ordinary `/blog/content/images/*` requests.
- This follows the runbook entry for Ghost image `srcset` 404s: Ghost generates the resized file on first request, then the direct volume path remains the fast path for regular content images.
- Apply the runbook Caddy safe-edit workflow: backup, edit, diff, validate, reload, running-config verification, origin probe, public probe, changelog.

## Non-Goals

- Do not redesign `/blog`, `/blog/2`, or other paginated blog listing pages.
- Do not change Ghost content, slugs, post data fetching, or the Ghost API wrapper unless implementation reveals a direct need.
- Do not migrate all Ghost inline images to Cloudinary in this pass.
- Do not alter unrelated page heroes or shared navigation behavior beyond using the existing `hero--dark` integration.

## Verification

Local verification:

- Run `npm run build`.
- If Ghost env vars are unavailable locally, use production HTML/screenshot inspection for visual comparison and rely on the build for syntax/CSS validation.

Production verification after deploy:

- Confirm the example article returns 200.
- Confirm representative Ghost responsive image URLs return 200, including `/blog/content/images/size/w600/...` and `/blog/content/images/size/w1000/...`.
- Capture desktop and mobile screenshots of the example post.
- Confirm `/blog` index remains visually and structurally unchanged.

## Self-Review

- No placeholders remain.
- Scope is limited to individual blog post pages and the known production Caddy image route.
- The design reuses existing site mechanics (`hero--dark`, feature image, article column, Ghost classes) instead of introducing a new page system.
- The Caddy change is operationally separate from the Astro layout change and has its own verification path.

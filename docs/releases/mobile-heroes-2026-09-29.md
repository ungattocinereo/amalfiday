# Approved production checkpoint — 29 September 2026

Rollback tag: `rollback/mobile-heroes-production-2026-09-29`.
Published application commit: `d153f410f04237c2ddfe3f7792072c9513308b3c`.
The checkpoint tag adds only this documentation and its README link to that code.
This is the latest user-approved rollback point; retain the earlier migration tag.

## Included state

- All 18 published photoshoots, their English stories and optimized WebP assets.
- Individual and Couples & Families catalog sections, three desktop columns for
  couples/families, image swaps on hover, face-aware crops and compact resting captions.
- Shared city icons and the rendered, interactive PhotoPoses phone preview.
- Full-viewport mobile heroes without letterboxing and inline city labels.
- Separate portrait covers for Nick's family (`cnr2126`, focal `34% 30%`) and
  Sally & Rose's family (`cnr1313`, focal `70% 45%`). The latter uses a top heading
  to keep all six faces clear. Desktop covers remain unchanged.
- Cover animation, its pause control and reduced-motion support.

## Verification at publication

The local and production builds succeeded: 155 pages, with Brotli/Gzip assets.
All 18 heroes were checked at 320×568, 390×844, 768×1024, 844×390 and 1440×900.
Additional checks covered both themes, animation endpoints, pause/resume and
reduced motion. All 18 published mobile heroes passed full-image coverage,
city-label wrapping and horizontal-overflow checks. The 43 public HTTP checks
covered published pages, images, contact, domain verification and the retained
404 for Colours of Atrani. Caddy, contact API and rebuild services remained active.
Mobile checks used browser emulation, not physical iPhones.

## Exact production snapshot

The current published output was copied on the VPS to:

`/srv/amalfiday/.deploy-backups/checkpoint-mobile-heroes-20260929-152218/dist`

This is the **approved version itself**, not the version before the deployment.
Its contents were compared against the live directory with no differences.
The parent directory records the source commit and creation time. This snapshot
also preserves the generated calendars, blog output, compressed assets and public
domain-verification files as they were at the checkpoint.

To restore the exact published output, copy this snapshot into a fresh staging
directory, verify it, then atomically exchange it with `/srv/amalfiday/dist`.
Keep the displaced live directory for recovery and leave the checkpoint intact.
Recheck the public pages and services after the exchange. Do not alter the contact
service, private environment or Caddy routing as part of a static-output rollback.

## Rebuild from GitHub

Fetch `rollback/mobile-heroes-production-2026-09-29` and use a separate checkout
at that tag. Install the locked dependencies, supply the existing server
environment privately and preserve the public domain-verification files.
Build into a separate directory following [the deployment guide](../deploy-static.md),
verify the output, then exchange it with the live output while retaining a backup.
Calendar and Ghost content are refreshed during a rebuild; use the VPS snapshot
above when an exact byte-for-byte restoration is required.

Private original imports in `new_photoshoots/`, runtime credentials and local
browser artifacts are not part of the Git checkpoint. The web-ready photographs
are committed, so a normal site build does not require the private source JPEGs.

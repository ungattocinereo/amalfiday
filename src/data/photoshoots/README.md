# Published photoshoots

Each JSON file supplies an existing route with its own copy, SEO metadata, cover,
photographs and three ordered gallery chapters. `PhotoshootPage.astro` renders the
shared design; `template-gallery.astro` remains the four-gallery demonstration.

Every main hero displays `PhotoshootHeroDate.astro` above the heading beside the
location, wrapping onto its own line on phones. `date` is the confirmed shooting
date or known period; optional `dateTime` is its ISO calendar value for `<time>`.
Do not derive shooting dates from `schema.datePublished`, export timestamps,
Photoshop/XMP creation dates, file modification dates or folder years. Use the
confirmed story or original capture metadata (`DateTimeOriginal`). Keep partial
dates partial, and mark file-based estimates explicitly only when authorized.
An empty `date` displays `Date to be confirmed`, so the date position remains
visible until the photographer supplies it. Time of day belongs in the story,
not in the date field.

## Client reviews

When a shoot has a client review, add `review` with `author`, optional
`authorDetail`, and the complete supplied text split into `paragraphs`. Optional
`rating` is the confirmed integer score from 1 to 5; never default to five stars.
Optional `source` holds the platform `name`, `url` and local `logo` path.
`PhotoshootReview.astro` renders every review in the approved template style,
immediately after the booking CTA and before the footer, in both site themes.
Shoots without a review render no review section. The template uses Nathalie's
review as an explicitly labelled example, not as Loreana's words.

Use a direct review URL when available. A platform listing link must be labelled
as the platform's reviews, not as the individual review. Do not invent review
dates or verified-booking status. Nathalie's supplied text and 5/5 rating were
confirmed by the photographer. The GetYourGuide logo source is documented in
`public/brand/README.md`.

## Photographs and chapters

- Keep frame IDs stable and use each frame in exactly one chapter. Chapter types
  are `rail`, `spreads`, `dissolve` and `immersive`.
- `before` contains the story blocks displayed before that chapter. Quotes with
  confirmed attribution belong in `quote`; unattributed editorial copy belongs
  in a story paragraph.
- `focal` and optional `mobileFocal` are manually reviewed CSS object positions
  for that photograph, not filename-based defaults or automatic face detection.
  `thumbFit: "contain"` retains both people in wide couple/group thumbnails.
  `immersiveFit: "contain"` reserves space around originals whose faces would
  otherwise overlap the site navigation or full-screen gallery captions.
- `card` selects a catalog cover independently of the hero: `frameId` must match
  an existing hero/gallery frame, with its own `focal` and optional `mobileFocal`.
  Keep the full-image card, category badge and overlaid title; check every face
  at narrow widths, including the final hover zoom. `card.hover` selects the second
  photograph with its own `frameId`, `focal` and optional `mobileFocal`. Set
  `zoom: 1` when the default hover zoom would crop a group member. Reuse
  optimized responsive assets for both images. City labels use the shared `CityLabel.astro` component.
- After changing source images, run `npm run photoshoots:images`, then
  `npm run build`. The image command preserves originals and writes responsive
  WebP derivatives under `public/photoshootings/optimized/` and actual dimensions
  into `src/data/photoshoot-images.json`. Do not edit that manifest by hand.
- Review covers and every cropped image at desktop, tablet, portrait and
  landscape phone sizes. Check both themes, every chapter's final frame, odd
  spreads, touch gestures, and the request form with intercepted responses.

The collection currently contains 23 shoots, 69 chapters and 642 gallery frames.
The cover may also be one of a shoot's gallery photographs.


## New source photographs

The fourteen stories imported from `new_photoshoots/` use `sourceFile` for the private
input JPEG and `original` for a full-frame, metadata-free WebP (up to 2560 px on
its longest edge). Their originals stay untouched and are not copied into public
assets. Every hero fills the viewport with `cover`, including phones and tablets;
`heroLayout: "panorama"` only keeps the compact heading for these wide covers.
Use `hero.mobileFocal` to protect faces in portrait crops. When a wide group cannot
fit, `mobileHero` selects an existing gallery `frameId` with its own `focal` for
portrait screens up to 900 px. Optional `headingPosition: "top"` keeps the heading
above people positioned low in that frame; the summary remains at the bottom.
Check all faces at both animation endpoints and preserve the desktop cover.
Gallery photographs and thumbnails use `contain` to retain the original framing.

Rebuild selected shoots without regenerating other photographs:

```sh
npm run photoshoots:images -- ashley-positano jassi-conca-proposal
npm run build
```

For an interrupted run with unchanged sources, add `--resume` to reuse completed
files. Omit it after changing a photograph or compression settings.

Source decisions:

- The first import included nine folders with `description.md`; the five later stories are documented below.
- Jassi uses `2-print`, not the smaller Instagram exports.
- Nick's `_CNR0994.jpg` is empty and was excluded.
- Nathalie's WhatsApp screenshot is not part of the public gallery.
- No year was inferred from folder names. Nick's supplied date is shown as May 23;
  other dates use the season supplied in the description or `Date to be confirmed`.
- Stephanie's photographs show Positano (including named signs), although the
  Russian description says Amalfi. The page follows the photographed location.
- Renaud's story explicitly describes the proposal scenes as recreations.

The first nine-story import has 287 photographs: nine covers and 278 unique gallery frames.
Each gallery photograph appears once, retaining filename order within its story.


## Five additional stories

- Esmeralda Cortez: all 102 photographs. The story gives an approximate shooting
  date, displayed as “Around 8 August 2026” without an exact ISO date. Photographs
  clearly include Atrani as well as Amalfi, so both cities appear in the location.
- Anh Hoang: all 56 photographs; 10 April 2026, Conca dei Marini.
- Nilsa Otanez: all 26 photographs; 20 June 2026, Amalfi and Atrani. Her complete
  five-star review and platform attribution come from the existing testimonials
  in `src/pages/photoshootings.astro`.
- Tom Semb: all 38 photographs, including the distinct colour and monochrome
  versions; 20 August 2026, Atrani. The supplied Ripley inspiration is retained.
- Takamasa Shigemi: all 34 photographs; 9 June 2026, Amalfi and Atrani. The complete
  Japanese review from `description.md` follows its existing English translation
  from the catalog. Both texts remain visible. `review.original` stores its
  `lang` and full `paragraphs`; the shared review component marks the language.

These 256 frames each appear once across three chapters per page. The desktop
cover also appears in its original gallery sequence. Each story selects a
mobile cover and separate catalog/hover covers with its own focal
points. No source JPEGs or private camera metadata are published. Dates come
from the supplied descriptions, not from export timestamps.

Tom Semb uses `cnr0188-2` for the desktop and mobile hero. Its mobile
`fit: "contain"` preserves both faces on narrow portrait screens.

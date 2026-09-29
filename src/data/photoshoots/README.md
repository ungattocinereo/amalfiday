# Published photoshoots

Each JSON file supplies an existing route with its own copy, SEO metadata, cover,
photographs and three ordered gallery chapters. `PhotoshootPage.astro` renders the
shared design; `template-gallery.astro` remains the four-gallery demonstration.

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

The collection currently contains 18 shoots, 54 chapters and 386 gallery frames.
The cover may also be one of a shoot's gallery photographs.


## New source photographs

The nine stories imported from `new_photoshoots/` use `sourceFile` for the private
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

- Only the nine folders with `description.md` were imported.
- Jassi uses `2-print`, not the smaller Instagram exports.
- Nick's `_CNR0994.jpg` is empty and was excluded.
- Nathalie's WhatsApp screenshot is not part of the public gallery.
- No year was inferred from folder names. Nick's supplied date is shown as May 23;
  other dates are omitted or use only the season supplied in the description.
- Stephanie's photographs show Positano (including named signs), although the
  Russian description says Amalfi. The page follows the photographed location.
- Renaud's story explicitly describes the proposal scenes as recreations.

The new set has 287 photographs: nine covers and 278 unique gallery frames.
Each gallery photograph appears once, retaining filename order within its story.

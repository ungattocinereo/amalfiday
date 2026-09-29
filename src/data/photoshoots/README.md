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
- After changing source images, run `npm run photoshoots:images`, then
  `npm run build`. The image command preserves originals and writes responsive
  WebP derivatives under `public/photoshootings/optimized/` and actual dimensions
  into `src/data/photoshoot-images.json`. Do not edit that manifest by hand.
- Review covers and every cropped image at desktop, tablet, portrait and
  landscape phone sizes. Check both themes, every chapter's final frame, odd
  spreads, touch gestures, and the request form with intercepted responses.

The collection currently contains 9 shoots, 27 chapters and 108 gallery frames.
The cover may also be one of a shoot's gallery photographs.

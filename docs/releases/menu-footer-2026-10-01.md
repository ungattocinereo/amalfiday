# Menu and footer release — 1 October 2026

Published checkpoint: `rollback/menu-footer-2026-10-01`.
Previous-version checkpoint: `rollback/before-menu-footer-2026-10-01`
(`a8d1813726a0585998b9dbf5c964444b1b3d0972`).

This release publishes all current menu and footer changes together:

- Compact, translucent desktop dropdowns with a small pointer beneath their
  trigger, vertical link groups and horizontal section dividers.
- A text-only Contact us link with a filled dialogue icon in desktop and mobile
  navigation. The requested dividers between the logo and News, Experience and
  Coast Intel, and Coast Intel and Contact us are removed.
- The existing light and dark themes, glass blur, scrolling header transition,
  navigation destinations and keyboard controls remain available.
- Larger footer links, regular link icons, illustrated legal links, link hover
  animations, separate legal and credit backgrounds, and theme-aware styling.

The exact original menu component is retained in
[`docs/backups/header-2026-10-01`](../backups/header-2026-10-01/README.md)
for a menu-only restoration.

## Production snapshots

The protected release directory is
`/srv/amalfiday/.release-menu-footer-2026-10-01`.
`before-dist` retains the complete previous published website. The previous
source revision, server-only files, current calendar data, public verification
files and private configuration are backed up separately in this directory.
Private backups are never committed or served by the website.

The full site is built in the separate `source` checkout with the existing
production configuration using `npm run build:static`. Public verification files
are preserved. The deployment lock prevents the GitHub hook from rebuilding the
live directory during preparation. The Ghost rebuild listener is paused for the
release and restored afterwards; Caddy and the contact API continue running.

After validating the staged output, exchange it atomically with
`/srv/amalfiday/dist`. The release directory retains `published-dist`, build logs,
the published commit and HTTP verification results.

## Restore

To restore the full previous website, preserve the current output and atomically
exchange `/srv/amalfiday/dist` with a copy of `before-dist`. Coordinate the source
checkout and the Ghost rebuild listener with
`rollback/before-menu-footer-2026-10-01`, preserving production configuration,
server-only files, calendars and public verification files.

To return to this release, use `published-dist` or rebuild
`rollback/menu-footer-2026-10-01` following the
[static deployment guide](../deploy-static.md). Earlier checkpoints remain
available.

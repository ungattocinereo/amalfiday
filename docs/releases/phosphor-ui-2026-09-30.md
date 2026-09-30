# Phosphor icons and interface release — 30 September 2026

Previous-version rollback tag: `rollback/before-phosphor-ui-2026-09-30`
(`c0f3a5c1cee8bbc90eb424c3bcd64243674ac186`).
Published checkpoint: `rollback/phosphor-ui-2026-09-30`.

This release includes all interface changes agreed in this session:

- Phosphor icons throughout the Astro site and Ghost theme. Regular is the default,
  Experience and Coast Intel use filled icons, and navigation social icons use light.
- The compact desktop CONTACT button has a rounded outline and animated hover fill.
- Desktop dropdowns open on hover with an animated line and sliding panel.
  Keyboard controls and mobile tap navigation remain available.
- Hero text shares the expanded menu's maximum width and side gutters, with
  vertically centered content where appropriate and preserved photoshoot crops.
- Footer links have no horizontal separators, smaller desktop typography,
  centered mobile content and a slightly darker background.

## VPS snapshots

The release directory is `/srv/amalfiday/.release-phosphor-ui-2026-09-30`.
It retains `before-dist`, the exact published output before this release, and
`before-source.tar.gz`, the previous committed source. Server-only changes,
verification files and private production configuration are backed up separately
inside this protected directory. These private backups are never committed.

The new site is built in the separate `source` checkout using production
configuration. The deploy lock prevents the automatic GitHub hook from replacing
the live site during preparation. The Ghost rebuild listener is briefly paused
and restored after deployment. Verification files are preserved in the new output.

`published-dist` retains the verified published output. `commit.txt`, build logs
and verification results identify the deployed revision. Ghost theme updates have
a separate `before-ghost-theme` snapshot.

## Restore

To undo this release, preserve the current output and atomically exchange
`/srv/amalfiday/dist` with a copy of `before-dist`. Restore the corresponding
Ghost theme snapshot if needed. Coordinate the source checkout and Ghost rebuild
listener with `rollback/before-phosphor-ui-2026-09-30` so subsequent rebuilds keep
the restored version. Preserve private configuration, verification files and
server-only changes. The contact API and Caddy configuration do not need changes.

To return to this release later, use `published-dist` or rebuild the published
checkpoint following [the static deployment guide](../deploy-static.md).

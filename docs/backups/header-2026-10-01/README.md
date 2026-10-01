# Menu backup — 1 October 2026

`Header.astro` is the exact menu component saved before the compact dropdown
redesign. It includes the original markup, interactions, styles and theme support.
The navigation data, logo and shared fonts were not changed by this redesign.

To restore the previous menu, run this from the project root:

```sh
cp docs/backups/header-2026-10-01/Header.astro src/components/Header.astro
npm run build
```

The backup is outside the site's routes and public assets, so it is not published
as a page or a downloadable file.

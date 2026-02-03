# Ghost on Docker (Ubuntu)

## Files
- `dockercompose.yml`

## Quick start
1. Start containers:

```bash
docker compose -f dockercompose.yml up -d
```

2. Admin setup:
Open `https://day.cristallpont.com/blog/ghost` and complete the Ghost setup wizard.

## Notes
- Database: MariaDB (same env vars as MySQL).
- Caddy should proxy `/blog` and `/blog/*` to `127.0.0.1:40001`.
- If you want Ghost to also serve the public blog, proxy `/` to Ghost instead of Astro.

# Ghost on Docker (Ubuntu)

## Files
- `docker-compose.yml`

## Quick start
1. Start containers:

```bash
docker compose up -d
```

2. Admin setup:
Open `https://day.cristallpont.com/ghost` and complete the Ghost setup wizard.

## Notes
- Database: MariaDB (same env vars as MySQL).
- Caddy should proxy `/ghost` and `/ghost/*` to `127.0.0.1:40001`.
- If you want Ghost to also serve the public blog, proxy `/` to Ghost instead of Astro.

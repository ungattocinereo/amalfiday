# Ghost on Docker (Ubuntu)

## Files
- `docker-compose.ghost.yml`
- `.env.ghost` (copy from `.env.ghost.example`)

## Quick start
1. Copy env file:

```bash
cp .env.ghost.example .env.ghost
```

2. Edit `.env.ghost` and set strong passwords.

3. Start containers:

```bash
docker compose -f docker-compose.ghost.yml --env-file .env.ghost up -d
```

4. Admin setup:
Open `https://day.cristallpont.com/ghost` and complete the Ghost setup wizard.

## Notes
- Database: MariaDB (same env vars as MySQL).
- Caddy should proxy `/ghost` and `/ghost/*` to `127.0.0.1:2368`.
- If you want Ghost to also serve the public blog, proxy `/` to Ghost instead of Astro.

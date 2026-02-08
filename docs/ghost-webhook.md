# Ghost Webhook → Auto-Rebuild

When a post is published or updated in Ghost, a webhook triggers `npm run build:static` so the static site updates automatically.

## 1. Create a systemd service

```bash
sudo nano /etc/systemd/system/amalfi-rebuild.service
```

```ini
[Unit]
Description=Amalfi.Day Ghost rebuild webhook
After=network.target

[Service]
Type=simple
User=greg
WorkingDirectory=/home/greg/amalfiday
Environment=GHOST_WEBHOOK_SECRET=CHANGE_ME
ExecStart=/usr/bin/node scripts/ghost-rebuild.mjs
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now amalfi-rebuild
sudo systemctl status amalfi-rebuild
```

## 2. Configure Ghost webhook

Ghost Admin → Settings → Integrations → Add custom integration → Add webhook:

| Field | Value |
|-------|-------|
| Event | **Site changed (rebuild all)** |
| Target URL | `http://127.0.0.1:4400/rebuild?secret=CHANGE_ME` |

Use the same secret in both places.

## 3. Check logs

```bash
journalctl -u amalfi-rebuild -f
```

## How it works

```
Ghost publishes/updates post
  → POST http://127.0.0.1:4400/rebuild?secret=...
  → ghost-rebuild.mjs runs `npm run build:static`
  → dist/ updated in-place
  → Caddy serves new files immediately (no restart needed)
```

- Builds are deduplicated: if a build is already running, the next webhook is skipped.
- Listens only on `127.0.0.1` — not exposed to the internet.
- Caddy does not need a restart because `file_server` reads from disk on each request.

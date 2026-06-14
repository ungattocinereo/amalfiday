# Static Deploy (Brotli Precompression)

## Build
```bash
npm install
npm run build:static
```

This generates `dist/` and precompressed `.br` + `.gz` files.

## Caddy (example)
```caddyfile
amalfi.day {
  handle /api/contact {
    reverse_proxy 127.0.0.1:8787
  }

  root * /var/www/amalfi-day/dist
  file_server {
    precompressed br gzip
  }
}
```

## Notes
- `output: "static"` is already set in `astro.config.mjs`.
- Contact form now posts to `/api/contact` to send Telegram messages. Static-only hosting must run `npm run contact:api` (or the `amalfi-contact.service` systemd unit) and proxy `/api/contact` to that Node service before the static file handler.

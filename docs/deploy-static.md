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
  root * /var/www/amalfi-day/dist
  file_server {
    precompressed br gzip
  }
}
```

## Notes
- `output: "static"` is already set in `astro.config.mjs`.
- Contact form now posts to `/api/contact` (serverless) to send Telegram messages. Static-only hosting must provide this endpoint separately.

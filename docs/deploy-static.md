# Static Deploy (Brotli Precompression)

## Build
```bash
npm install
npm run build:static
```

This generates `dist/` and precompressed `.br` + `.gz` files.

## Caddy (example)
```caddyfile
day.cristallpont.com {
  root * /var/www/amalfi-day/dist
  file_server {
    precompressed br gzip
  }
}
```

## Notes
- `output: "static"` is already set in `astro.config.mjs`.
- If you need `/api/contact`, host it separately (static build has no server endpoints).

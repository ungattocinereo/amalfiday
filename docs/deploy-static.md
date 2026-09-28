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

  @removedPhotoLocations path /photolocations /photolocations/
  handle @removedPhotoLocations {
    root * /srv/amalfiday/dist
    rewrite * /404.html
    file_server {
      status 404
    }
  }

  root * /srv/amalfiday/dist
  file_server {
    precompressed br gzip
  }
}
```

## Notes
- `output: "static"` is already set in `astro.config.mjs`.
- Contact form now posts to `/api/contact` to send Telegram messages. Static-only hosting must run `npm run contact:api` (or the `amalfi-contact.service` systemd unit) and proxy `/api/contact` to that Node service before the static file handler.

Production runs from `/srv/amalfiday`. Preserve any server-only changes before updating the checkout. Build into a separate output directory, verify it, then replace the live `dist` while retaining the previous directory for rollback. Keep the existing public verification files when rebuilding.

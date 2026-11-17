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

  @removedPages path /photolocations /photolocations/ /photoshootings/concept-editorial /photoshootings/concept-editorial/ /photoshootings/concept-editorial/index.html /photoshootings/concept-editorial.html
  handle @removedPages {
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

## Direct booking endpoints

`/api/booking/calendar` and `/api/booking/quote` are served by the same Node
service as the contact form (`scripts/contact-server.mjs`, unit
`amalfi-contact.service`). To switch them on in production:

1. Add the Hostex token to `/srv/amalfiday/.env` (server-only, never commit it):
   `HOSTEX_ACCESS_TOKEN=...` and, optionally, `DIRECT_DISCOUNT_PCT=10`.
2. Add this block to the `amalfi.day` site in the Caddyfile, next to the
   `/api/contact` handler, then `caddy validate` and reload Caddy:

   ```caddyfile
   handle /api/booking/* {
     reverse_proxy 127.0.0.1:8787
   }
   ```

3. Restart the service so it loads the new code and environment:
   `sudo systemctl restart amalfi-contact.service`. The deploy script does not
   restart it; do this after every deploy that changes `scripts/` or `api/`.
4. Check: `curl -s https://amalfi.day/api/booking/calendar | head -c 200` returns
   JSON with `units`; a second request within a minute is served from the
   in-process cache.

Until steps 1 to 3 are done, `/apartments` and `/book/<id>/` show their fallback
(platform links, no live prices). There is no CDN: the calendar is cached for
60 seconds inside the Node process; quotes always read Hostex live. Do not pass
`BOOKING_FIXTURE` in production.

## Notes
- `output: "static"` is already set in `astro.config.mjs`.
- Contact form now posts to `/api/contact` to send Telegram messages. Static-only hosting must run `npm run contact:api` (or the `amalfi-contact.service` systemd unit) and proxy `/api/contact` to that Node service before the static file handler.

Production runs from `/srv/amalfiday`. Preserve any server-only changes before updating the checkout. Build into a separate output directory, verify it, then replace the live `dist` while retaining the previous directory for rollback. Keep the existing public verification files when rebuilding.

`Colours of Atrani` (`/photoshootings/concept-editorial/`) has been removed from
the catalogue and source routes. Keep the explicit 404 matcher above on production:
the general `try_files ... /404.html` fallback alone serves the error page with a
200 status. Its photographs remain available where used by other pages.

# Homepage posing guide — 1 October 2026

Previous-version rollback tag: `rollback/before-home-posing-2026-10-01`
(`e6932467e50f041d7ec39dad71014b7db443094e`).
Published checkpoint: `rollback/home-posing-2026-10-01`.

The homepage now uses the posing-guide copy and interactive phone from the
photography catalogue. Its desktop phone is capped at 380px, with a soft central
glow adapted to light and dark themes. The shared cursor-driven tilt preserves
the catalogue's interaction and reduced-motion behavior. Mobile content stacks
vertically without horizontal overflow. The former paper preview and its scroll
animation have been removed.

The release directory is `/srv/amalfiday/.release-home-posing-2026-10-01`.
`before-dist` retains the exact previous published output. The previous source
revision is identified by `before-commit.txt` and the GitHub rollback tag.
Server-only changes, verification files and private production configuration
are backed up inside this protected directory and never committed.

Build the entire project in the separate `source` directory with production
configuration and refreshed calendars, then precompress and verify the output
before exchanging it atomically with `/srv/amalfiday/dist`. The deploy lock
prevents the GitHub hook from publishing during preparation. Restore the Ghost
rebuild listener after activation; Caddy and the contact API keep running.

`published-dist`, `commit.txt`, build logs and HTTP verification results record
the deployed version. To undo it, preserve the current output and atomically
exchange it with a copy of `before-dist`. Coordinate the source checkout and
Ghost rebuild listener with the previous rollback tag, preserving private
configuration and server-only files. Earlier checkpoints remain available.

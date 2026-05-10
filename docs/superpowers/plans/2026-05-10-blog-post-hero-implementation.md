# Blog Post Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign individual Ghost blog post pages at `/blog/<slug>/` with a full-screen hero and robust Ghost content layout, while leaving `/blog` index and pagination unchanged.

**Architecture:** Keep the work scoped to the existing Astro route `src/pages/blog/[slug].astro`. Replace the current post header and duplicate feature image with a `hero--dark` fullscreen section, then harden the article CSS for Ghost Koenig cards, especially `kg-header-card`, `kg-width-wide`, and `kg-width-full`. Apply the production Ghost responsive image fix separately in Caddy following the Sweden VPS runbook.

**Tech Stack:** Astro 5, scoped Astro CSS with `:global()` for Ghost HTML, existing `CldImage.astro`, Ghost Content API HTML, Caddy on Sweden VPS.

---

## File Structure

- Modify `src/pages/blog/[slug].astro`
  - Owns the article route markup, post hero, Ghost HTML styling, author bio, transport callout, related posts, lightbox, and Ghost video helpers.
  - This is intentionally a single-file change because the current route already owns all article-specific CSS and scripts.
- Create or modify no files for `/blog/[...page].astro`
  - Blog index and pagination remain unchanged.
- Modify production `/etc/caddy/Caddyfile` on `ssh sweden`
  - Add one route above the existing `/blog/content/images/*` volume handler so Ghost can generate responsive `/size/wXXX/*` images.

---

### Task 1: Replace Post Header With Full-Screen Hero

**Files:**
- Modify: `src/pages/blog/[slug].astro`
- Do not modify: `src/pages/blog/[...page].astro`

- [ ] **Step 1: Replace the old header and duplicate image markup**

In `src/pages/blog/[slug].astro`, remove the `<!-- POST HEADER -->` block and the `<!-- HERO IMAGE -->` block. Insert this markup immediately after the opening `BaseLayout` component and before `<!-- ARTICLE BODY -->`:

```astro
  <!-- POST HERO -->
  <section class:list={['post-hero', 'hero--dark', !post.image && 'post-hero--empty']}>
    {post.image ? (
      <CldImage
        class="post-hero__image"
        src={post.image}
        alt=""
        width={2000}
        height={1250}
        priority
        sizes="100vw"
        aria-hidden="true"
      />
    ) : (
      <div class="post-hero__fallback" aria-hidden="true"></div>
    )}
    <div class="post-hero__vignette"></div>
    <div class="post-hero__content">
      <div class="container">
        <div class="post-hero__copy">
          <a class="post-hero__section" href="/blog">Amalfi Notes</a>
          <span class="post-hero__cat">{post.tag}</span>
          <h1 class="post-hero__title">{post.title}</h1>
          {post.excerpt && <p class="post-hero__lead">{post.excerpt}</p>}
          <div class="post-hero__meta">
            <span>{post.author.name}</span>
            <span><i class="fa-solid fa-calendar"></i> {post.date}</span>
            {post.readingTime > 0 && <span><i class="fa-solid fa-clock"></i> {post.readingTime} min read</span>}
          </div>
        </div>
      </div>
    </div>
    <div class="post-hero__scroll-hint" aria-hidden="true"><span></span></div>
  </section>
```

- [ ] **Step 2: Remove obsolete header/image CSS**

Delete all CSS rules in the `/* === POST HEADER === */` section: `.post-header`, `.post-header__cat`, `.post-header__title`, `.post-header__rule`, `.post-header__meta`, and `.post-header__meta span`.

Delete all CSS rules in the `/* === HERO IMAGE === */` section: `.post-image` and `.post-image img`.

- [ ] **Step 3: Add post hero CSS near the top of the `<style>` block**

Add this replacement block before the existing post callout styles:

```css
  /* === POST HERO === */
  .post-hero {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    background: #090a0b;
    color: #ffffff;
  }

  .post-hero__image,
  .post-hero__fallback {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1.01);
  }

  .post-hero__image {
    animation: post-hero-drift 8s cubic-bezier(0.25, 0, 0.4, 1) forwards;
  }

  .post-hero__fallback {
    background:
      radial-gradient(circle at 18% 12%, rgba(255, 89, 0, 0.45), transparent 32%),
      radial-gradient(circle at 84% 22%, rgba(0, 156, 255, 0.35), transparent 34%),
      linear-gradient(135deg, #08090c 0%, #151923 100%);
  }

  .post-hero__vignette {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(0deg, rgba(0, 0, 0, 0.74) 0%, rgba(0, 0, 0, 0.2) 48%, rgba(0, 0, 0, 0.35) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.48) 0%, rgba(0, 0, 0, 0.08) 58%),
      radial-gradient(ellipse at 50% 0%, transparent 45%, rgba(0, 0, 0, 0.26) 100%);
    pointer-events: none;
  }

  .post-hero__content {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: calc(var(--header-space) + 2rem) 0 clamp(3rem, 8vh, 6rem);
  }

  .post-hero__copy {
    max-width: 820px;
  }

  .post-hero__section,
  .post-hero__cat {
    display: inline-flex;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .post-hero__section {
    color: rgba(255, 255, 255, 0.62);
    margin-right: 0.8rem;
    text-decoration: none;
  }

  .post-hero__section:hover {
    color: #ffffff;
    text-decoration: none;
  }

  .post-hero__cat {
    color: #ff7a33;
  }

  .post-hero__title {
    max-width: 12ch;
    font-size: clamp(2.8rem, 7.6vw, 6.4rem);
    line-height: 0.98;
    letter-spacing: 0;
    margin: 1rem 0 0;
    color: #ffffff;
  }

  .post-hero__lead {
    max-width: 42rem;
    font-size: clamp(1rem, 1.4vw, 1.2rem);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.78);
    margin-top: 1.25rem;
  }

  .post-hero__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem 1.1rem;
    margin-top: 1.4rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.7);
  }

  .post-hero__meta span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .post-hero__scroll-hint {
    position: absolute;
    bottom: clamp(1rem, 2.5vh, 2rem);
    left: 50%;
    z-index: 3;
    transform: translateX(-50%);
  }

  .post-hero__scroll-hint span {
    display: block;
    width: 1px;
    height: 34px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.55), transparent);
    animation: post-scroll-pulse 2s ease-in-out infinite;
  }

  @keyframes post-hero-drift {
    from { transform: scale(1.01); }
    to { transform: scale(1.06); }
  }

  @keyframes post-scroll-pulse {
    0%, 100% { opacity: 0.4; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(1.28); }
  }
```

- [ ] **Step 4: Update article top spacing**

Change the existing article/content top spacing to:

```css
  .article {
    max-width: 680px;
    margin: 0 auto;
    padding: clamp(3rem, 7vw, 5rem) 1.5rem 3rem;
    position: relative;
  }

  .article__content {
    padding-top: 0;
  }
```

- [ ] **Step 5: Commit local hero markup/CSS**

Run:

```bash
git add src/pages/blog/[slug].astro
git commit -m "Redesign blog post hero"
```

Expected: one committed change to `src/pages/blog/[slug].astro`; no changes to `src/pages/blog/[...page].astro`.

---

### Task 2: Harden Ghost Post Body Layout

**Files:**
- Modify: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Make the drop cap target the first real paragraph**

Change:

```css
  .article__content :global(> p:first-child::first-letter) {
```

to:

```css
  .article__content :global(> p:first-of-type::first-letter) {
```

Also change the same selector inside the mobile media query from `> p:first-child::first-letter` to `> p:first-of-type::first-letter`.

- [ ] **Step 2: Replace generic image/figure rules with Ghost-aware rules**

Replace the existing image and figure section with:

```css
  /* Images and figures inside content */
  .article__content :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-sm);
    margin: 0;
  }

  .article__content :global(figure),
  .article__content :global(.kg-card) {
    margin: clamp(2.2rem, 5vw, 4rem) 0;
  }

  .article__content :global(.kg-image-card) {
    overflow: hidden;
  }

  .article__content :global(.kg-image-card img),
  .article__content :global(figure img) {
    display: block;
    width: 100%;
    height: auto;
    margin: 0;
  }

  .article__content :global(figcaption),
  .article__content :global(.kg-card figcaption) {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    line-height: 1.5;
    color: var(--color-text-muted);
    text-align: center;
    margin-top: 0.7rem;
    letter-spacing: 0.04em;
  }
```

- [ ] **Step 3: Replace width breakout rules**

Replace the existing `.kg-width-wide` rule with:

```css
  /* === Wide and full-bleed Ghost cards === */
  .article__content :global(.kg-width-wide) {
    width: min(1080px, calc(100vw - 3rem));
    max-width: calc(100vw - 3rem);
    margin-left: 50%;
    transform: translateX(-50%);
  }

  .article__content :global(.kg-width-full) {
    width: 100vw;
    max-width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
  }
```

- [ ] **Step 4: Add explicit Ghost header card styles after the breakout rules**

Add:

```css
  .article__content :global(.kg-header-card) {
    position: relative;
    min-height: clamp(360px, 72vh, 760px);
    display: grid;
    place-items: center;
    overflow: hidden;
    background: #090a0b;
    color: #ffffff;
    isolation: isolate;
  }

  .article__content :global(.kg-header-card::after) {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(0deg, rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0.22)),
      radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(0, 0, 0, 0.36) 100%);
    pointer-events: none;
  }

  .article__content :global(.kg-header-card picture),
  .article__content :global(.kg-header-card-image) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .article__content :global(.kg-header-card-image) {
    object-fit: cover;
    border-radius: 0;
  }

  .article__content :global(.kg-header-card-content) {
    position: relative;
    z-index: 2;
    width: min(960px, calc(100% - 3rem));
    padding: clamp(2.5rem, 8vw, 6rem) 0;
    color: #ffffff;
  }

  .article__content :global(.kg-header-card-text) {
    max-width: 760px;
    margin: 0 auto;
  }

  .article__content :global(.kg-header-card-text.kg-align-left) {
    margin-left: 0;
    margin-right: auto;
  }

  .article__content :global(.kg-header-card-heading) {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 7vw, 5.8rem);
    line-height: 1;
    letter-spacing: 0;
    color: #ffffff;
    margin: 0;
  }

  .article__content :global(.kg-header-card-subheading) {
    max-width: 42rem;
    margin: 1rem auto 0;
    font-size: clamp(1rem, 1.5vw, 1.2rem);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.78);
  }

  .article__content :global(.kg-header-card-text.kg-align-left .kg-header-card-subheading) {
    margin-left: 0;
  }
```

- [ ] **Step 5: Add mobile rules for hero and breakouts**

Inside the existing `@media (max-width: 640px)` block, add:

```css
    .post-hero {
      min-height: 100svh;
    }

    .post-hero__content {
      padding-bottom: clamp(4rem, 12vh, 6rem);
    }

    .post-hero__title {
      max-width: 11ch;
      font-size: clamp(2.35rem, 13vw, 3.8rem);
      overflow-wrap: anywhere;
    }

    .post-hero__lead {
      font-size: 0.98rem;
    }

    .post-hero__meta {
      font-size: 0.62rem;
    }

    .article {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .article__content :global(.kg-width-wide),
    .article__content :global(.kg-width-full) {
      width: 100vw;
      max-width: 100vw;
      margin-left: calc(50% - 50vw);
      margin-right: calc(50% - 50vw);
      transform: none;
    }

    .article__content :global(.kg-header-card) {
      min-height: clamp(320px, 68vh, 560px);
    }

    .article__content :global(.kg-header-card-content) {
      width: min(100% - 2rem, 620px);
    }
```

- [ ] **Step 6: Commit Ghost body layout fixes**

Run:

```bash
git add src/pages/blog/[slug].astro
git commit -m "Harden Ghost article content layout"
```

Expected: second local commit touching only `src/pages/blog/[slug].astro`.

---

### Task 3: Local Build Verification

**Files:**
- Read/verify: `src/pages/blog/[slug].astro`
- Do not modify source unless build reports an error.

- [ ] **Step 1: Run Astro build**

Run:

```bash
npm run build
```

Expected:
- Build exits `0`.
- If local Ghost env vars are missing, build may log `Ghost API env vars missing`; that is acceptable because the route uses `getStaticPaths()` from Ghost at build time.
- No Astro syntax errors from `src/pages/blog/[slug].astro`.

- [ ] **Step 2: Confirm blog index file was not edited**

Run:

```bash
git diff -- src/pages/blog/[...page].astro
```

Expected: no output.

- [ ] **Step 3: Inspect final local diff**

Run:

```bash
git status --short
git log --oneline -3
```

Expected:
- Only known pre-existing untracked folders such as `how-to-images/` and `output/` remain.
- Recent commits include the two implementation commits from Tasks 1 and 2.

---

### Task 4: Production Caddy Fix for Ghost Responsive Images

**Files:**
- Modify on server: `/etc/caddy/Caddyfile`
- Update on server: `/home/greg/runbook/CHANGELOG.md`

- [ ] **Step 1: Sync runbook on VPS**

Run:

```bash
ssh sweden 'cd /home/greg/runbook && git pull --ff-only'
```

Expected: `Already up to date.` or a successful fast-forward.

- [ ] **Step 2: Backup Caddyfile**

Run:

```bash
ssh sweden 'TS=$(date +%Y%m%d%H%M); backup="/etc/caddy/Caddyfile.bak.$TS"; sudo cp /etc/caddy/Caddyfile "$backup"; printf "%s\n" "$backup" | tee /tmp/amalfiday-caddy-backup-path'
```

Expected: prints and stores a path such as `/etc/caddy/Caddyfile.bak.202605101230`.

- [ ] **Step 3: Edit Caddyfile with the agent edit tool or a real editor**

Insert this block above the existing `handle /blog/content/images/*` block in the `amalfi.day, www.amalfi.day` site:

```caddyfile
	handle /blog/content/images/size/* {
		reverse_proxy 127.0.0.1:40001
	}
```

The relevant Caddyfile section should become:

```caddyfile
	handle /ghost-rebuild {
		rewrite * /rebuild
		reverse_proxy 127.0.0.1:4400
	}

	handle /blog/content/images/size/* {
		reverse_proxy 127.0.0.1:40001
	}

	handle /blog/content/images/* {
		root * /var/lib/docker/volumes/amalfiday_ghost_content/_data
		uri strip_prefix /blog/content
		header Cache-Control "public, max-age=31536000"
		file_server
	}
```

- [ ] **Step 4: Diff, validate, and reload Caddy**

Run:

```bash
ssh sweden 'backup=$(cat /tmp/amalfiday-caddy-backup-path); sudo diff "$backup" /etc/caddy/Caddyfile'
ssh sweden 'sudo /usr/local/bin/caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile'
ssh sweden 'sudo systemctl reload caddy'
```

Expected:
- Diff shows only the new `/blog/content/images/size/*` handler.
- Validate ends with `Valid configuration`.
- Reload exits `0`.

- [ ] **Step 5: Verify running config and image routing**

Run:

```bash
ssh sweden 'curl -s http://localhost:2019/config/apps/http/servers/srv0/routes | python3 -c "import json,sys; r=json.load(sys.stdin); names=[]; [names.extend(h[\"host\"]) for route in r for mset in route.get(\"match\",[]) if \"host\" in mset for h in [mset]]; print(\"amalfi.day\" in names, \"www.amalfi.day\" in names)"'
curl -L -sSI https://amalfi.day/blog/content/images/size/w600/2026/05/IMG_3087.jpeg
curl -L -sSI https://amalfi.day/blog/content/images/size/w1000/2026/05/IMG_3087.jpeg
curl -L -sSI https://amalfi.day/blog/content/images/2026/05/IMG_3087.jpeg
```

Expected:
- Running config command prints `True True`.
- All three curl commands return `HTTP/2 200`.
- The original image URL still returns from the fast volume path.

- [ ] **Step 6: Log the Caddy change in runbook**

Run:

```bash
ssh sweden 'backup=$(cat /tmp/amalfiday-caddy-backup-path); cd /home/greg/runbook && printf "%s | Codex | amalfi.day: added Caddy /blog/content/images/size/* proxy to Ghost 40001 | fixes Ghost Koenig responsive image srcset 404s while preserving direct volume serving for original images | revert by restoring %s then sudo systemctl reload caddy\n" "$(date "+%Y-%m-%d %H:%M %Z")" "$backup" >> CHANGELOG.md && git add CHANGELOG.md && git commit -m "changelog: amalfi day Ghost image size proxy" && git push'
```

Expected: runbook commit and push succeed.

---

### Task 5: Production Deploy and Visual Verification

**Files:**
- Deploy source: local repository commits pushed to the remote used by `/home/greg/deploy-amalfi-day.sh`.
- Verify production URL: `https://amalfi.day/blog/a-local-3-or-4-day-amalfi-coast-itinerary-without-a-car/`

- [ ] **Step 1: Push local implementation commits**

Run:

```bash
git push
```

Expected: push exits `0`.

- [ ] **Step 2: Deploy static site on VPS**

Run:

```bash
ssh sweden '/home/greg/deploy-amalfi-day.sh'
```

Expected:
- Deploy script exits `0`.
- Build output reports the site was built and precompressed.

- [ ] **Step 3: Capture production screenshots**

Run:

```bash
playwright screenshot --full-page --viewport-size=1440,2200 https://amalfi.day/blog/a-local-3-or-4-day-amalfi-coast-itinerary-without-a-car/ /private/tmp/amalfiday-post-hero-desktop.png
playwright screenshot --full-page --viewport-size=390,1800 https://amalfi.day/blog/a-local-3-or-4-day-amalfi-coast-itinerary-without-a-car/ /private/tmp/amalfiday-post-hero-mobile.png
```

Expected:
- Desktop screenshot shows a fullscreen hero with readable title/excerpt and no duplicate feature image immediately below.
- Mobile screenshot shows the title fitting without horizontal scroll.
- Ghost header cards render as intentional full-width visual breaks.

- [ ] **Step 4: Confirm `/blog` index remains unchanged in source and reachable in production**

Run:

```bash
git diff -- src/pages/blog/[...page].astro
curl -L -sS -o /dev/null -w "blog index HTTP %{http_code}\n" https://amalfi.day/blog/
```

Expected:
- Git diff is empty.
- Public `/blog/` returns `blog index HTTP 200`.

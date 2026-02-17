"""
Visual and Mobile SEO audit capture script for amalfi.day
"""
from playwright.sync_api import sync_playwright
import json
import os

URL = "https://amalfi.day"
OUT = "/Users/greg/Documents/Code/AmalfiDay_3/screenshots"

def run_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # --- Desktop 1440x900 ---
        print("[1/2] Desktop 1440x900 ...")
        desk = browser.new_page(viewport={"width": 1440, "height": 900})
        desk.goto(URL, wait_until="networkidle", timeout=30000)
        desk.screenshot(path=os.path.join(OUT, "desktop_1440x900.png"), full_page=False)
        desk.screenshot(path=os.path.join(OUT, "desktop_1440x900_full.png"), full_page=True)

        audit = desk.evaluate("""() => {
            const data = {};
            const h1 = document.querySelector('h1');
            data.h1_text = h1 ? h1.innerText : null;
            data.h1_font_size = h1 ? getComputedStyle(h1).fontSize : null;

            const ctas = [];
            document.querySelectorAll('a, button').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < 900 && rect.bottom > 0) {
                    ctas.push({
                        tag: el.tagName,
                        text: el.innerText.trim().substring(0, 80),
                        href: el.href || null,
                        top: Math.round(rect.top),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                    });
                }
            });
            data.ctas_above_fold = ctas;

            const imgs = [];
            document.querySelectorAll('img').forEach(el => {
                imgs.push({
                    src: el.src ? el.src.substring(0, 120) : null,
                    alt: el.alt || '',
                    loading: el.loading || 'eager',
                    width: el.naturalWidth,
                    height: el.naturalHeight,
                    display_width: el.clientWidth,
                    display_height: el.clientHeight,
                    in_viewport: el.getBoundingClientRect().top < 900,
                });
            });
            data.images = imgs;

            data.title = document.title;
            data.meta_description = document.querySelector('meta[name="description"]')?.content || null;
            data.meta_viewport = document.querySelector('meta[name="viewport"]')?.content || null;
            data.og_image = document.querySelector('meta[property="og:image"]')?.content || null;
            data.canonical = document.querySelector('link[rel="canonical"]')?.href || null;
            const body = document.querySelector('body');
            data.body_font_size = body ? getComputedStyle(body).fontSize : null;

            return data;
        }""")
        desk.close()

        # --- Mobile 375x812 ---
        print("[2/2] Mobile 375x812 ...")
        mob = browser.new_page(
            viewport={"width": 375, "height": 812},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        mob.goto(URL, wait_until="networkidle", timeout=30000)
        mob.screenshot(path=os.path.join(OUT, "mobile_375x812.png"), full_page=False)
        mob.screenshot(path=os.path.join(OUT, "mobile_375x812_full.png"), full_page=True)

        mobile_audit = mob.evaluate("""() => {
            const data = {};
            data.page_width = document.documentElement.scrollWidth;
            data.viewport_width = window.innerWidth;
            data.has_horizontal_scroll = document.documentElement.scrollWidth > window.innerWidth;

            const nav = document.querySelector('nav');
            data.nav_visible = nav ? nav.getBoundingClientRect().height > 0 : false;
            const hamburger = document.querySelector('[class*="hamburger"], [class*="menu-toggle"], [aria-label*="menu"], [class*="mobile"], button[class*="nav"]');
            data.hamburger_found = !!hamburger;

            const h1 = document.querySelector('h1');
            data.h1_font_size_mobile = h1 ? getComputedStyle(h1).fontSize : null;
            const body = document.querySelector('body');
            data.body_font_size_mobile = body ? getComputedStyle(body).fontSize : null;

            const paragraphs = document.querySelectorAll('p');
            const pSizes = [];
            paragraphs.forEach((p, i) => {
                if (i < 10) {
                    pSizes.push({
                        text: p.innerText.substring(0, 50),
                        fontSize: getComputedStyle(p).fontSize,
                    });
                }
            });
            data.paragraph_font_sizes = pSizes;

            const smallTargets = [];
            document.querySelectorAll('a, button').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && (rect.width < 48 || rect.height < 48)) {
                    smallTargets.push({
                        tag: el.tagName,
                        text: el.innerText.trim().substring(0, 50),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                    });
                }
            });
            data.small_touch_targets = smallTargets;

            const ctas = [];
            document.querySelectorAll('a, button').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < 812 && rect.bottom > 0 && el.innerText.trim()) {
                    ctas.push({
                        text: el.innerText.trim().substring(0, 80),
                        top: Math.round(rect.top),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                    });
                }
            });
            data.mobile_ctas_above_fold = ctas;

            const imgs = [];
            document.querySelectorAll('img').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < 812) {
                    imgs.push({
                        src: el.src ? el.src.substring(0, 100) : null,
                        loading: el.loading || 'eager',
                        naturalWidth: el.naturalWidth,
                        displayWidth: el.clientWidth,
                    });
                }
            });
            data.mobile_images_above_fold = imgs;

            return data;
        }""")
        mob.close()
        browser.close()

        combined = {"desktop": audit, "mobile": mobile_audit}
        with open(os.path.join(OUT, "audit_data.json"), "w") as f:
            json.dump(combined, f, indent=2)

        print("\nDone. Files saved to:", OUT)
        print(json.dumps(combined, indent=2))

if __name__ == "__main__":
    run_audit()

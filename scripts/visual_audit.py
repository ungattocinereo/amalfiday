"""
Visual audit script for amalfi.day
Captures screenshots at multiple viewports and checks key visual/SEO elements.
"""

from playwright.sync_api import sync_playwright
import json
import os

URL = "https://amalfi.day"
OUT_DIR = "/Users/greg/Documents/Code/AmalfiDay_3/screenshots"

VIEWPORTS = [
    {"name": "desktop_1920x1080",  "width": 1920, "height": 1080},
    {"name": "laptop_1366x768",    "width": 1366, "height": 768},
    {"name": "tablet_768x1024",    "width": 768,  "height": 1024},
    {"name": "mobile_375x812",     "width": 375,  "height": 812},
]

os.makedirs(OUT_DIR, exist_ok=True)

def capture_and_audit(url, viewports, out_dir):
    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch()

        for vp in viewports:
            name = vp["name"]
            w, h = vp["width"], vp["height"]
            print(f"\n--- {name} ({w}x{h}) ---")

            page = browser.new_page(viewport={"width": w, "height": h})
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(1500)  # let animations settle

            # Above-the-fold screenshot
            atf_path = os.path.join(out_dir, f"{name}_above_fold.png")
            page.screenshot(path=atf_path, full_page=False)
            print(f"  Saved above-fold: {atf_path}")

            # Full-page screenshot
            full_path = os.path.join(out_dir, f"{name}_full_page.png")
            page.screenshot(path=full_path, full_page=True)
            print(f"  Saved full-page:  {full_path}")

            # --- Element analysis ---
            info = {"viewport": f"{w}x{h}", "elements": {}}

            # H1
            h1 = page.query_selector("h1")
            if h1:
                box = h1.bounding_box()
                text = h1.inner_text()
                visible_atf = box and box["y"] + box["height"] <= h
                info["elements"]["h1"] = {
                    "text": text.strip()[:120],
                    "bounding_box": box,
                    "visible_above_fold": visible_atf,
                }
                print(f"  H1: '{text.strip()[:80]}' | above-fold: {visible_atf}")
            else:
                info["elements"]["h1"] = None
                print("  H1: NOT FOUND")

            # Meta tags
            title_tag = page.title()
            meta_desc = page.query_selector('meta[name="description"]')
            og_title = page.query_selector('meta[property="og:title"]')
            og_image = page.query_selector('meta[property="og:image"]')
            canonical = page.query_selector('link[rel="canonical"]')

            info["seo"] = {
                "title": title_tag,
                "title_length": len(title_tag) if title_tag else 0,
                "meta_description": meta_desc.get_attribute("content") if meta_desc else None,
                "og_title": og_title.get_attribute("content") if og_title else None,
                "og_image": og_image.get_attribute("content") if og_image else None,
                "canonical": canonical.get_attribute("href") if canonical else None,
            }

            # Primary CTA (links/buttons in hero area)
            cta_candidates = page.query_selector_all("a.cta, a.btn, button.cta, .hero a, .hero button, [class*='cta'], [class*='btn']")
            ctas_above_fold = []
            for el in cta_candidates:
                box = el.bounding_box()
                if box and box["y"] + box["height"] <= h:
                    ctas_above_fold.append({
                        "text": el.inner_text().strip()[:80],
                        "href": el.get_attribute("href"),
                        "y_position": box["y"],
                    })
            info["ctas_above_fold"] = ctas_above_fold
            print(f"  CTAs above fold: {len(ctas_above_fold)}")

            # Navigation check
            nav = page.query_selector("nav, header nav, [role='navigation']")
            info["navigation_present"] = nav is not None

            # Images in viewport
            images = page.query_selector_all("img")
            img_issues = []
            for img in images:
                box = img.bounding_box()
                if box and box["y"] < h:
                    alt = img.get_attribute("alt") or ""
                    src = img.get_attribute("src") or ""
                    loading = img.get_attribute("loading") or "eager"
                    if not alt:
                        img_issues.append({"src": src[:100], "issue": "missing alt text"})
                    if box["y"] < h and loading == "lazy":
                        img_issues.append({"src": src[:100], "issue": "above-fold image with lazy loading"})
            info["image_issues"] = img_issues

            # Mobile specific: check for horizontal overflow
            if w <= 768:
                body_scroll_width = page.evaluate("document.body.scrollWidth")
                info["horizontal_overflow"] = body_scroll_width > w
                print(f"  Horizontal overflow: {body_scroll_width > w} (scrollWidth={body_scroll_width}, viewport={w})")

                # Check base font size
                base_font = page.evaluate("window.getComputedStyle(document.body).fontSize")
                info["base_font_size"] = base_font
                print(f"  Base font size: {base_font}")

            results[name] = info
            page.close()

        browser.close()

    # Save audit data
    audit_path = os.path.join(out_dir, "visual_audit.json")
    with open(audit_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    print(f"\nAudit data saved to {audit_path}")

    return results

if __name__ == "__main__":
    capture_and_audit(URL, VIEWPORTS, OUT_DIR)

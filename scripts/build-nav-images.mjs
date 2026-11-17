// Builds small WebP images for the navigation menu (public/nav/).
// For each source: <slug>-thumb.webp (120x120 cover) and <slug>-card.webp
// (width 560, height proportional, capped at 640). Skips outputs that are
// newer than their source. Run: npm run nav:images

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const OUT = join(PUBLIC, 'nav');

const SOURCES = {
  couple: 'photoshootings/optimized/regan-tay-ravello/HERO-regan-walk-ravello-love-720.webp',
  solo: 'photoshootings/optimized/loreana/hero-720.webp',
  family: 'photoshootings/olga-marat/28-olga-marat-atrani-2023.webp',
  balcony: 'apartments/the-sunrise-balcony.webp',
  atrani: 'apartments/3-view-from-cristall-Pont.jpg',
  orange: 'apartments/orange-room.jpg',
  vintage: 'apartments/room-in-atrani-vintage.webp',
  youth: 'apartments/casa-bunkbed-room.jpg',
  'solo-room': 'apartments/romfor-1-person.jpg.webp',
  scenic: 'staticpages/car-tours/Scenic-Coast/Scenic-Coast-amalfi-coast-tours-5.webp',
  peak: 'staticpages/car-tours/Peak-Flavors/Peak-Flavors-amalfi-coast-tours-7.webp',
  moto: 'staticpages/moto/hero/moto-ride-with-photographer-in-amalfi-coast-4.webp',
  ferry: 'staticpages/timetables/ferry-hero-01.webp',
};

const CARD_WIDTH = 560;
const CARD_MAX_HEIGHT = 640;

function isFresh(outPath, srcPath) {
  if (!existsSync(outPath)) return false;
  return statSync(outPath).mtimeMs >= statSync(srcPath).mtimeMs;
}

async function buildOne(slug, relSrc) {
  const srcPath = join(PUBLIC, relSrc);
  if (!existsSync(srcPath)) throw new Error(`Source not found: ${relSrc}`);

  const thumbPath = join(OUT, `${slug}-thumb.webp`);
  const cardPath = join(OUT, `${slug}-card.webp`);
  const rows = [];

  if (isFresh(thumbPath, srcPath)) {
    rows.push({ file: `${slug}-thumb.webp`, status: 'skip' });
  } else {
    const info = await sharp(srcPath)
      .rotate()
      .resize(120, 120, { fit: 'cover', position: 'attention' })
      .webp({ quality: 72 })
      .toFile(thumbPath);
    rows.push({ file: `${slug}-thumb.webp`, status: 'built', width: info.width, height: info.height });
  }

  if (isFresh(cardPath, srcPath)) {
    rows.push({ file: `${slug}-card.webp`, status: 'skip' });
  } else {
    const meta = await sharp(srcPath).rotate().metadata();
    const ratio = meta.height / meta.width;
    const height = Math.min(Math.round(CARD_WIDTH * ratio), CARD_MAX_HEIGHT);
    const info = await sharp(srcPath)
      .rotate()
      .resize(CARD_WIDTH, height, { fit: 'cover', position: 'attention' })
      .webp({ quality: 74 })
      .toFile(cardPath);
    rows.push({ file: `${slug}-card.webp`, status: 'built', width: info.width, height: info.height });
  }

  return rows;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const report = [];
  for (const [slug, relSrc] of Object.entries(SOURCES)) {
    report.push(...(await buildOne(slug, relSrc)));
  }

  console.log('file'.padEnd(26) + 'status'.padEnd(9) + 'size'.padEnd(12) + 'KB');
  for (const r of report) {
    const outPath = join(OUT, r.file);
    const kb = (statSync(outPath).size / 1024).toFixed(1);
    const size = r.width ? `${r.width}x${r.height}` : '-';
    console.log(r.file.padEnd(26) + r.status.padEnd(9) + size.padEnd(12) + kb);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Downloads each tip's poster frame from YouTube into assets/images/tips/.
 *
 * Run by hand and commit the result:
 *   node scripts/fetch-tip-thumbnails.mjs
 *
 * Never wire this into `pnpm run build`. Same rule as fetch-youtube-shorts.mjs: a slow
 * or rate-limited YouTube must not be able to break a deploy.
 *
 * Why the files are worth committing. The poster is the LCP element of all ~165 tip
 * pages, and serving it from i.ytimg.com cost Lighthouse 1.7s of LCP "load time" for a
 * 30KB image -- a cold DNS+TCP+TLS handshake to an origin nothing had warmed, plus
 * ~153ms of their server latency, none of which overlaps anything. A `rel=preconnect`
 * changed nothing. From our own origin the request reuses the connection the HTML came
 * on and the same page measures LCP well inside budget.
 *
 * Re-running is idempotent: an existing file is left alone unless --force is passed.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = "assets/images/tips";
const TIPS_JSON = "src/_data/tips.json";
const MANIFEST = "src/_data/tipPosters.json";
const force = process.argv.includes("--force");

/* 1280x720 is kept, not downscaled. The facade is 340 CSS px wide at aspect-ratio
 * 9/16 (assets/global.css .tip-player) and object-fit: cover scales a 16:9 frame to
 * the box HEIGHT, so 720px of source is already an upscale on any DPR>=2 screen. */
const SOURCES = (id) => [
  `https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`,
  `https://i.ytimg.com/vi_webp/${id}/hqdefault.webp`,
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
];

const videoIdOf = (tip) => {
  const match = String(tip?.thumbnail || "").match(
    /^https:\/\/i\.ytimg\.com\/vi(?:_webp)?\/([\w-]+)\//,
  );
  return match ? match[1] : tip?.id || null;
};

async function fetchFirst(urls) {
  const failures = [];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        failures.push(`${res.status} ${url}`);
        continue;
      }
      return Buffer.from(await res.arrayBuffer());
    } catch (error) {
      failures.push(`${error.message} ${url}`);
    }
  }
  throw new Error(failures.join("; "));
}

const raw = JSON.parse(await readFile(TIPS_JSON, "utf8"));
const items = Array.isArray(raw) ? raw : raw.items || [];
await mkdir(OUT_DIR, { recursive: true });

let written = 0;
let skipped = 0;
const failed = [];

for (const tip of items) {
  const id = videoIdOf(tip);
  if (!id) {
    failed.push(`${tip?.slug || "(no slug)"}: no video id`);
    continue;
  }

  const out = path.join(OUT_DIR, `${id}.webp`);
  if (!force && existsSync(out)) {
    skipped += 1;
    continue;
  }

  try {
    const body = await fetchFirst(SOURCES(id));
    // Re-encode rather than saving YouTube's bytes as-is: their WebP is tuned for a
    // player thumbnail, and this both normalises the format (a .jpg fallback still
    // lands as .webp) and shaves a few KB off the LCP image.
    const webp = await sharp(body).webp({ quality: 80, effort: 5 }).toBuffer();
    await writeFile(out, webp);
    written += 1;
    console.log(`[tip-thumbs] ${id} ${(webp.length / 1024).toFixed(1)}KB`);
  } catch (error) {
    failed.push(`${id}: ${error.message}`);
  }
}

/* The manifest is what the build reads, so it records the dimensions actually on disk
 * rather than assuming every poster came back as a 1280x720 maxres frame -- a video
 * with no maxres thumbnail falls back to a smaller one, and a wrong width/height on the
 * <img> would mis-reserve the box and show up as layout shift. Rebuilt from the files
 * every run, so deleting a poster removes it from the manifest too. */
const manifest = {};
for (const tip of items) {
  const id = videoIdOf(tip);
  if (!id) continue;
  const file = path.join(OUT_DIR, `${id}.webp`);
  if (!existsSync(file)) continue;
  const { width, height } = await sharp(file).metadata();
  manifest[id] = { width, height };
}
await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n[tip-thumbs] wrote ${written}, skipped ${skipped}, failed ${failed.length}`);
console.log(`[tip-thumbs] ${MANIFEST}: ${Object.keys(manifest).length} posters`);
for (const line of failed) console.error(`[tip-thumbs] FAILED ${line}`);
if (failed.length) process.exitCode = 1;

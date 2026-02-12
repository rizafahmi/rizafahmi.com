#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const DEFAULT_DIR = "assets/images";
const DEFAULT_FORMATS = ["webp", "avif"];
const DEFAULT_WEBP_QUALITY = 82;
const DEFAULT_AVIF_QUALITY = 55;

function parseArgs(argv) {
  const args = {
    dir: DEFAULT_DIR,
    formats: DEFAULT_FORMATS,
    force: false,
    dryRun: false,
    // Skip very small files/icons by default.
    minBytes: 8 * 1024,
    minDimension: 96,
    webpQuality: DEFAULT_WEBP_QUALITY,
    avifQuality: DEFAULT_AVIF_QUALITY,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir") args.dir = argv[++i];
    else if (a === "--formats") args.formats = argv[++i].split(",").map((x) => x.trim()).filter(Boolean);
    else if (a === "--force") args.force = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--min-bytes") args.minBytes = Number(argv[++i]);
    else if (a === "--min-dimension") args.minDimension = Number(argv[++i]);
    else if (a === "--webp-quality") args.webpQuality = Number(argv[++i]);
    else if (a === "--avif-quality") args.avifQuality = Number(argv[++i]);
    else if (a === "-h" || a === "--help") {
      console.log(`Optimize PNGs into modern formats (WebP/AVIF).

Usage:
  node scripts/optimize-images.mjs [--dir assets/images] [--formats webp,avif] [--dry-run] [--force]

Options:
  --dir <path>            Directory to scan (default: ${DEFAULT_DIR})
  --formats <list>        Comma-separated list: webp,avif (default: ${DEFAULT_FORMATS.join(",")})
  --force                 Regenerate even if outputs are newer
  --dry-run               Print what would happen
  --min-bytes <n>         Skip files smaller than this (default: ${args.minBytes})
  --min-dimension <n>     Skip images where both width & height are below this (default: ${args.minDimension})
  --webp-quality <n>      WebP quality (default: ${DEFAULT_WEBP_QUALITY})
  --avif-quality <n>      AVIF quality (default: ${DEFAULT_AVIF_QUALITY})
`);
      process.exit(0);
    }
  }

  return args;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function shouldSkipBySizeAndDimensions(srcPath, { minBytes, minDimension }) {
  const st = await fs.stat(srcPath);
  if (st.size < minBytes) return { skip: true };

  try {
    const meta = await sharp(srcPath).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w && h && w < minDimension && h < minDimension) {
      return { skip: true };
    }
  } catch {
    // If metadata fails, don't skip based on dimensions.
  }

  return { skip: false };
}

async function isSourceNewer(src, out) {
  const [ss, so] = await Promise.all([fs.stat(src), fs.stat(out)]);
  return ss.mtimeMs > so.mtimeMs;
}

async function main() {
  const args = parseArgs(process.argv);
  const rootDir = path.resolve(process.cwd(), args.dir);

  const all = await walk(rootDir);
  const pngs = all.filter((p) => p.toLowerCase().endsWith(".png"));

  let generated = 0;
  let skippedTiny = 0;

  for (const srcPath of pngs) {
    const skipInfo = await shouldSkipBySizeAndDimensions(srcPath, args);
    if (skipInfo.skip) {
      skippedTiny++;
      continue;
    }

    for (const fmt of args.formats) {
      if (!DEFAULT_FORMATS.includes(fmt)) continue;

      const outPath = srcPath.replace(/\.png$/i, `.${fmt}`);
      const hasOut = await fileExists(outPath);

      if (hasOut && !args.force) {
        const srcNewer = await isSourceNewer(srcPath, outPath).catch(() => true);
        if (!srcNewer) continue;
      }

      if (args.dryRun) {
        console.log(`[dry-run] ${path.relative(process.cwd(), srcPath)} -> ${path.relative(process.cwd(), outPath)}`);
        continue;
      }

      if (fmt === "webp") {
        await sharp(srcPath).webp({ quality: args.webpQuality }).toFile(outPath);
      } else if (fmt === "avif") {
        await sharp(srcPath).avif({ quality: args.avifQuality }).toFile(outPath);
      }

      generated++;
      console.log(`generated ${path.relative(process.cwd(), outPath)}`);
    }
  }

  console.log(`\nDone. generated=${generated} skippedTiny=${skippedTiny}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

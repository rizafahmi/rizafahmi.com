import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import sharp from "sharp";
import { buildSvg, formatOgDate, generateOgImage, visibleTags } from "../src/libs/og-image.js";

test("visibleTags hides internal collection tags", () => {
  assert.deepEqual(visibleTags(["catatan", "ai", "nav", "elixir"]), ["ai", "elixir"]);
});

test("formatOgDate uses Indonesian month abbreviations", () => {
  assert.equal(formatOgDate("2026-06-20"), "catatan · Jun 2026");
  assert.equal(formatOgDate(null), "catatan");
});

test("buildSvg uses Neo-Acid Gallery palette", () => {
  const svg = buildSvg({
    title: "Judul Contoh",
    excerpt: "Ringkasan singkat.",
    tags: ["ai"],
    date: "2026-01-15",
  });

  assert.match(svg, /#f7f7f5/);
  assert.match(svg, /#c5f82a/);
  assert.match(svg, /#0a0b0d/);
  assert.match(svg, /RIZA FAHMI · rizafahmi.com/);
  assert.match(svg, /catatan · Jan 2026/);
  assert.doesNotMatch(svg, /rx="/);
});

test("generateOgImage writes a 1200x630 PNG", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "og-image-"));
  const outputPath = path.join(dir, "sample.png");

  await generateOgImage({
    title: "Cara Belajar Pemrograman yang Efektif",
    excerpt: "Panduan praktis untuk pemula.",
    tags: ["pemrograman", "belajar"],
    date: "2026-06-20",
    outputPath,
  });

  const meta = await sharp(outputPath).metadata();
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);

  const png = await readFile(outputPath);
  assert.ok(png.length > 0);
});

// Guards against a silent encoder regression: sharp is native, and an SVG
// render can succeed while producing a technically valid but empty image
// (e.g. embedded fonts failing to load in a new libvips). These assertions
// look at actual pixel content, not just the build exit code.
test("generateOgImage renders real content, not a blank canvas", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "og-image-content-"));
  const outputPath = path.join(dir, "content.png");

  await generateOgImage({
    title: "Cara Belajar Pemrograman yang Efektif",
    excerpt: "Panduan praktis untuk pemula yang ingin mulai ngoding.",
    tags: ["pemrograman", "belajar"],
    date: "2026-06-20",
    outputPath,
  });

  const png = await readFile(outputPath);
  // Production OG images sit around 12-17KB; anything tiny means an empty render.
  assert.ok(png.length > 5000, `expected a plausible PNG size, got ${png.length} bytes`);

  const { data, info } = await sharp(outputPath).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 1200);
  assert.equal(info.height, 630);

  let ink = 0;
  let accent = 0;
  const luma = [];
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    luma.push(y);
    // Dark pixels: heading text, tag chips, border, rules.
    if (y < 80) ink++;
    // Accent #c5f82a: top bar and right-hand stripe.
    if (Math.abs(r - 197) < 25 && Math.abs(g - 248) < 25 && Math.abs(b - 42) < 25) accent++;
  }

  // Text must actually be drawn. Border and tag chips alone account for
  // ~12.5k dark pixels; the rendered text adds ~10k more. The threshold sits
  // between the two, so a font-loading regression fails here even though the
  // chrome still renders and the image stays a valid 1200x630 PNG.
  assert.ok(ink > 16000, `expected rendered text pixels, got ${ink}`);
  assert.ok(accent > 10000, `expected the accent bar and stripe, got ${accent}`);

  // Not a uniform fill: a blank image of any single colour has ~zero variance.
  const mean = luma.reduce((a, b) => a + b, 0) / luma.length;
  const variance = luma.reduce((a, b) => a + (b - mean) ** 2, 0) / luma.length;
  assert.ok(Math.sqrt(variance) > 15, `expected pixel variance, got sd ${Math.sqrt(variance)}`);
});

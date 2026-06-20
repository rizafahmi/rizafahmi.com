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

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/* Pagefind runs in opt-in mode on this site: once any page carries
 * data-pagefind-body, pages without it are excluded from the index entirely.
 * A consultation page nobody can find by searching defeats its own purpose. */
test("the page opts into the Pagefind index", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  assert.match(source, /data-pagefind-body/);
});

test("the page declares its own stylesheet and permalink", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  const frontmatter = source.split("---")[1] ?? "";
  assert.match(frontmatter, /^permalink: \/konsultasi\/$/m);
  assert.match(frontmatter, /^pageCss: konsultasi\.css$/m);
  assert.match(frontmatter, /^layout: main$/m);
});

/* The spec's central constraint. /kelas/ is unmerged and may never ship;
 * a link to an unbuilt page also fails scripts/audit-site.mjs. */
test("the page never references /kelas/", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  assert.doesNotMatch(source, /\/kelas\//);
});

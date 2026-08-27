import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

// /kerjasama/ shipped unlinked: the page existed and built, but nothing on the
// site pointed at it, so the only way to reach it was to already know the URL.
// A sponsorship page nobody can find is the same as no page.
//
// The trap here is the one test/tips-nav.test.js documents: this site has five
// separate page chromes, and a link added to src/_includes/main.njk misses the
// homepage entirely, because the homepage does not use that layout. Both site
// navs have to carry the link.

const SITE_NAV_CHROMES = ["src/_includes/main.njk", "src/index.njk"];

test("both site navs link to /kerjasama/", () => {
  for (const file of SITE_NAV_CHROMES) {
    const source = readFileSync(file, "utf8");
    assert.match(
      source,
      /<a href="\/kerjasama\/">/,
      `${file} carries a site nav but does not link to /kerjasama/`,
    );
  }
});

test("the homepage also offers it among the contact routes", () => {
  // A brand scanning "HUBUNGI SAYA" for a way to work together should find it
  // beside Uses/Now/CV, not only in the top nav.
  const index = readFileSync("src/index.njk", "utf8");
  const start = index.indexOf('<div class="kontak-links">');
  assert.notEqual(start, -1, "the kontak-links block is gone — this test needs updating");
  // Slice to the </div> that closes THIS block, not the first one in the file.
  const kontak = index.slice(start, index.indexOf("</div>", start));
  assert.match(kontak, /<a href="\/kerjasama\/">/);
});

// Source templates can lie about what renders. dist/ cannot.
const BUILT_PAGES = [
  "dist/index.html",
  "dist/articles/index.html",
  "dist/tags/index.html",
  "dist/showcase/index.html",
];

test("the built pages really render an anchor to /kerjasama/", {
  skip: !existsSync("dist/index.html") && "no dist/ — run pnpm run build",
}, () => {
  for (const page of BUILT_PAGES) {
    if (!existsSync(page)) continue;
    const html = readFileSync(page, "utf8");
    assert.match(html, /<a href="\/kerjasama\/"/, `${page} renders no anchor to /kerjasama/`);
  }
});

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

// This site has THREE separate page chromes, not one. A nav link added to
// src/_includes/main.njk reaches only the pages that use that layout — and the
// homepage is not one of them. /tips shipped in #186 with a nav link that
// rendered on /articles, /tags and /showcase but was absent from the very page
// a visitor lands on first.
//
// The same shape as the footer.njk bug: a link in a partial is not a link on a
// page. These tests name each chrome so the next person adding a section has to
// confront all of them.

const CHROMES = {
  // Layout used by /articles, /tags, /topik, /showcase, /tips.
  "src/_includes/main.njk": { hasSiteNav: true },
  // Standalone: its own <!DOCTYPE> and its own hero nav.
  "src/index.njk": { hasSiteNav: true },
  // Standalone, deliberately minimal: only a "back to home" control.
  "src/search.njk": { hasSiteNav: false },
  // Article chrome. Its <nav> is a breadcrumb describing position, not a menu.
  "src/_includes/tulisan.njk": { hasSiteNav: false },
  // Print-focused CV chrome.
  "src/_includes/cv.njk": { hasSiteNav: false },
};

test("every chrome this test knows about still exists", () => {
  for (const file of Object.keys(CHROMES)) {
    assert.ok(existsSync(file), `${file} is gone — this test needs updating`);
  }
});

test("the homepage does not inherit main.njk, which is why it needs its own link", () => {
  const index = readFileSync("src/index.njk", "utf8");
  // If this ever becomes false, the homepage started using a layout and the
  // duplicate nav link below can be removed.
  assert.doesNotMatch(index.split("---")[1] ?? "", /^layout:/m);
  assert.match(index, /<!DOCTYPE html>/i);
});

test("both site navs link to /tips/", () => {
  for (const [file, { hasSiteNav }] of Object.entries(CHROMES)) {
    if (!hasSiteNav) continue;
    const source = readFileSync(file, "utf8");
    assert.match(
      source,
      /<a href="\/tips\/">/,
      `${file} carries a site nav but does not link to /tips/`,
    );
  }
});

test("the homepage puts /tips/ in its primary nav, not buried in the contact list", () => {
  const index = readFileSync("src/index.njk", "utf8");
  const nav = index.slice(index.indexOf('<nav class="hero-nav">'), index.indexOf("</nav>"));
  assert.match(nav, /<a href="\/tips\/">/);
});

// --- the assertion that would actually have caught this --------------------
// Source templates can lie about what renders. dist/ cannot. This runs only
// when a build is present; scripts/audit-site.mjs enforces it on every build.

const BUILT_PAGES = [
  "dist/index.html",
  "dist/articles/index.html",
  "dist/tags/index.html",
  "dist/showcase/index.html",
];

test("the built homepage really renders an anchor to /tips/", {
  skip: !existsSync("dist/index.html") && "no dist/ — run pnpm run build",
}, () => {
  for (const page of BUILT_PAGES) {
    if (!existsSync(page)) continue;
    const html = readFileSync(page, "utf8");
    assert.match(html, /<a href="\/tips\/"/, `${page} renders no anchor to /tips/`);
  }
});

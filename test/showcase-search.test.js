import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Pagefind found a `data-pagefind-body` element on this site, which switches it
// into opt-in mode: pages without the marker are silently skipped. /showcase is
// the only place the Open Source projects are listed, so it has to carry one.
const showcase = readFileSync("src/showcase.njk", "utf8");

test("/showcase opts itself into the Pagefind index", () => {
  assert.match(showcase, /data-pagefind-body/);
});

test("the Pagefind marker wraps the page's main content, not a fragment of it", () => {
  assert.match(showcase, /<main[^>]*\bdata-pagefind-body\b[^>]*>/);
});

test("/showcase gives Pagefind an explicit title, since it has no <h1> of its own", () => {
  assert.doesNotMatch(showcase, /<h1/);
  assert.match(showcase, /data-pagefind-meta="title:[^"]+"/);
});

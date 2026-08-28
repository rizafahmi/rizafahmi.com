import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import posters from "../src/_data/tipPosters.json" with { type: "json" };
import rawTips from "../src/_data/tips.json" with { type: "json" };
import { selectTips } from "../src/libs/tips.js";

/* src/_data/tipPosters.json and assets/images/tips/ are both produced by
 * scripts/fetch-tip-thumbnails.mjs and committed together. A manifest entry without its
 * file is the one failure mode that breaks a page: posterThumbnailFor trusts the
 * manifest, so the tip page would render a 404 as its LCP element. The reverse (a file
 * with no entry) is harmless, and a tip with neither just falls back to YouTube. */
test("every poster in the manifest is a file that exists", () => {
  const ids = Object.keys(posters);
  assert.ok(ids.length > 0, "expected the poster manifest to be populated");
  for (const id of ids) {
    assert.ok(
      existsSync(`assets/images/tips/${id}.webp`),
      `tipPosters.json lists ${id} but assets/images/tips/${id}.webp is missing`,
    );
  }
});

test("every poster records usable dimensions", () => {
  for (const [id, size] of Object.entries(posters)) {
    assert.ok(Number.isInteger(size.width) && size.width > 0, `bad width for ${id}`);
    assert.ok(Number.isInteger(size.height) && size.height > 0, `bad height for ${id}`);
  }
});

/* The whole point of hosting these is that no tip page's LCP image is a third-party
 * request. If the manifest drifts behind tips.json the page still works, but it
 * silently gives the LCP win back, so keep the two in step. */
test("every published tip resolves its poster to our own origin", () => {
  const missing = selectTips(rawTips, posters)
    .filter((tip) => !tip.posterThumbnail?.url.startsWith("/assets/images/tips/"))
    .map((tip) => tip.slug);
  assert.deepEqual(
    missing,
    [],
    `these tips still point their LCP image at YouTube; re-run scripts/fetch-tip-thumbnails.mjs: ${missing.join(", ")}`,
  );
});

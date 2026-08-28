import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import {
  FAMILIES,
  fileUrl,
  fontFaceCss,
  passthroughCopyMap,
  preloadFaces,
  preloadLinks,
  SUBSETS,
} from "../src/libs/webfonts.js";

/* The whole point of self-hosting is that no font request leaves our origin and none
 * 404s. A manifest entry naming a file @fontsource does not ship would silently drop
 * that face back to a system font, so check the sources really exist. */
test("every manifest face maps to a font file that exists in node_modules", () => {
  const map = passthroughCopyMap();
  assert.ok(Object.keys(map).length > 0, "expected at least one font to copy");
  for (const source of Object.keys(map)) {
    assert.ok(existsSync(source), `missing font source: ${source}`);
  }
});

test("copy map covers every family x face x subset combination", () => {
  const faceCount = FAMILIES.reduce((n, f) => n + f.faces.length, 0);
  assert.equal(Object.keys(passthroughCopyMap()).length, faceCount * Object.keys(SUBSETS).length);
});

test("every url in the inlined @font-face css is a file we copy", () => {
  const copied = new Set(Object.values(passthroughCopyMap()).map((dest) => `/${dest}`));
  const urls = [...fontFaceCss().matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]);
  assert.ok(urls.length > 0, "expected @font-face rules to reference font files");
  for (const url of urls) {
    assert.ok(copied.has(url), `@font-face references a file that is never copied: ${url}`);
  }
});

test("every preload points at a file we copy", () => {
  const copied = new Set(Object.values(passthroughCopyMap()).map((dest) => `/${dest}`));
  const hrefs = [...preloadLinks().matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(hrefs.length, preloadFaces().length);
  for (const href of hrefs) {
    assert.ok(copied.has(href), `preload points at a file that is never copied: ${href}`);
  }
});

/* A preloaded font the page never uses is the exact bug this change removed -- twice.
 * First a 31KB Wotfard file preloaded on every page with no font-family referencing it,
 * then Unbounded 700 when every h1-h6 in assets/global.css is 800. Both cost a download
 * and left the real face to be discovered late, which is where LCP went. */
test("preloads name a declared face and stay on the latin subset", () => {
  for (const { id, subset, weight, style } of preloadFaces()) {
    const family = FAMILIES.find((f) => f.id === id);
    assert.ok(family, `preload names an unknown family: ${id}`);
    assert.ok(
      family.faces.some((f) => f.weight === weight && f.style === style),
      `preload names a face ${id} is not built with: ${weight} ${style}`,
    );
    assert.equal(subset, "latin", `preload ${id} should stay on the latin subset`);
  }
});

/* Webfont bytes are the LCP budget on this site: Lighthouse's simulated mobile link
 * charges ~6ms per KB, and pages that pulled 9 faces measured LCP 2.11s against 1.50s
 * for the same markup pulling 5. Each face here is one an assets/*.css rule selects;
 * a new one needs a matching rule and a re-measure, not just an entry. */
test("the face list stays within the LCP budget", () => {
  const faces = FAMILIES.reduce((n, f) => n + f.faces.length, 0);
  assert.ok(faces <= 5, `expected at most 5 webfont faces, found ${faces}`);
});

/* DESIGN.md specifies fontWeight 800 for the display token. Shipping a second Unbounded
 * weight is what put /now/ and every article over the LCP budget. */
test("the display family ships exactly the one weight DESIGN.md specifies", () => {
  const unbounded = FAMILIES.find((f) => f.id === "unbounded");
  assert.deepEqual(unbounded.faces, [{ weight: 800, style: "normal" }]);
  assert.ok(preloadLinks().includes("unbounded-latin-800-normal.woff2"));
});

test("font faces are same-origin and declare a unicode-range", () => {
  const css = fontFaceCss();
  assert.equal(css.includes("//"), false, "no @font-face src may point at another origin");
  assert.equal(
    [...css.matchAll(/@font-face/g)].length,
    [...css.matchAll(/unicode-range:/g)].length,
    "every @font-face needs a unicode-range or the wrong subset gets downloaded",
  );
  assert.ok(css.includes("font-display:swap"));
});

test("fileUrl is served from the immutable /assets prefix", () => {
  assert.equal(
    fileUrl("unbounded", "latin", 700, "normal"),
    "/assets/fonts/unbounded-latin-700-normal.woff2",
  );
});

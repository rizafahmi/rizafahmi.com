import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

/* Netlify pairs a submission to a form by the hidden form-name input, not by the
 * form element's name attribute. When the two disagree it drops the submission
 * silently - manufacturing exactly the "nobody wants this" false negative that
 * this page exists to rule out. */
test("the hidden form-name input matches the form's name attribute", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  const formName = source.match(/<form[^>]*\sname="([^"]+)"/)?.[1];
  const hidden = source.match(/name="form-name"[^>]*value="([^"]+)"/)?.[1];
  assert.ok(formName, "no <form name=...> found");
  assert.ok(hidden, "no hidden form-name input found");
  assert.equal(hidden, formName);
});

/* audit-site.mjs checks <a href> links but not <form action>, so a lead who
 * converts and then hits a 404 is a gap nothing else catches. */
test("the form action points at a page that is actually built", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  const action = source.match(/<form[^>]*\saction="([^"]+)"/)?.[1];
  assert.ok(action, "no <form action=...> found");

  const target = readFileSync("src/konsultasi-terima-kasih.njk", "utf8");
  const frontmatter = target.split("---")[1] ?? "";
  assert.match(frontmatter, new RegExp(`^permalink: ${action}$`, "m"));
});

/* A required budget select with no escape hatch is a known conversion killer,
 * and making the field optional loses the willingness-to-pay signal entirely.
 * "Belum tahu" is the deliberate compromise; this guards it from a later edit. */
test("the budget select keeps its Belum tahu option", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  const select = source.match(/<select[^>]*\sname="budget"[\s\S]*?<\/select>/)?.[0];
  assert.ok(select, "no budget select found");
  assert.match(select, /Belum tahu/);
});

/* This site has several separate page chromes, each owning its own <head> and
 * nav. /tips shipped in #186 with a nav link that rendered on /articles and
 * /tags but was absent from the homepage, which does not use main.njk.
 * test/tips-nav.test.js documents that history. */
test("the shared chrome nav links to /konsultasi/", () => {
  const source = readFileSync("src/_includes/main.njk", "utf8");
  assert.match(source, /<a href="\/konsultasi\/">/);
});

/* Source templates can lie about what renders; dist/ cannot. The homepage is
 * standalone, so it needs its own link - here a body section rather than a
 * ninth nav item. */
test("the built homepage really renders an anchor to /konsultasi/", {
  skip: !existsSync("dist/index.html") && "no dist/ - run pnpm run build",
}, () => {
  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /<a href="\/konsultasi\/"/);
});

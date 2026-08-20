import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { extractHrefs, findBrokenLinks, isCheckableHref } from "../src/libs/internal-links.js";

async function mkFixture(files) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "internal-links-"));
  for (const [relative, contents] of Object.entries(files)) {
    const full = path.join(dir, relative);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, contents);
  }
  return dir;
}

test("isCheckableHref only claims literal internal page links", () => {
  assert.equal(isCheckableHref("/kerjasama/"), true);
  assert.equal(isCheckableHref("/articles"), true);

  assert.equal(isCheckableHref("https://rizafahmi.com/"), false);
  assert.equal(isCheckableHref("//cdn.example.com/x"), false);
  assert.equal(isCheckableHref("#main-content"), false);
  assert.equal(isCheckableHref("mailto:rizafahmi@gmail.com"), false);
  assert.equal(isCheckableHref("/assets/global.css"), false);
  assert.equal(isCheckableHref("/img/foo.png"), false);
  assert.equal(isCheckableHref("/pagefind/pagefind.js"), false);
});

test("isCheckableHref skips hrefs built from template expressions", () => {
  assert.equal(isCheckableHref("/tags/{{ tag | url }}/"), false);
  assert.equal(isCheckableHref("{{ article.url }}"), false);
  assert.equal(isCheckableHref("/assets/global.css?v={{ site.buildTime }}"), false);
  assert.equal(isCheckableHref("{% if x %}/a{% endif %}"), false);
});

test("extractHrefs reads every href in a document", () => {
  const html = '<a href="/a">A</a><link href="/b.css"><a class="x" href="/c/">C</a>';
  assert.deepEqual(extractHrefs(html), ["/a", "/b.css", "/c/"]);
});

test("findBrokenLinks catches a deliberately broken internal link", async () => {
  const dir = await mkFixture({
    "dist/index.html": '<a href="/nyata/">ok</a><a href="/tidak-ada">broken</a>',
    "dist/nyata/index.html": "<p>ada</p>",
  });
  const distDir = path.join(dir, "dist");

  const broken = findBrokenLinks({ dir: distDir, distDir, extensions: [".html"] });

  assert.equal(broken.length, 1);
  assert.equal(broken[0].href, "/tidak-ada");
  assert.match(broken[0].file, /index\.html$/);
});

test("findBrokenLinks catches dead links inside template partials", async () => {
  const dir = await mkFixture({
    "dist/articles/index.html": "<p>ada</p>",
    "src/_includes/footer.njk": '<a href="/articles">Tulisan</a> <a href="/service">Service</a>',
  });

  const broken = findBrokenLinks({
    dir: path.join(dir, "src/_includes"),
    distDir: path.join(dir, "dist"),
    extensions: [".njk"],
  });

  assert.deepEqual(
    broken.map((entry) => entry.href),
    ["/service"],
  );
});

test("findBrokenLinks accepts a page served from a directory index", async () => {
  const dir = await mkFixture({
    "dist/index.html": '<a href="/kerjasama/">a</a><a href="/articles">b</a>',
    "dist/kerjasama/index.html": "<p>ada</p>",
    "dist/articles/index.html": "<p>ada</p>",
  });
  const distDir = path.join(dir, "dist");

  assert.deepEqual(findBrokenLinks({ dir: distDir, distDir, extensions: [".html"] }), []);
});

test("no template partial links to a path the build does not produce", {
  skip: !existsSync("dist"),
}, () => {
  const broken = findBrokenLinks({
    dir: path.join("src", "_includes"),
    distDir: "dist",
    extensions: [".njk"],
  });

  assert.deepEqual(
    broken.map((entry) => `${entry.file} -> ${entry.href}`),
    [],
  );
});

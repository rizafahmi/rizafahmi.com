import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/prompts.njk", "utf8");

test("the prompt library groups saved material by use, not date", () => {
  for (const category of [
    "perencanaan",
    "review",
    "ide-dan-desain",
    "implementasi",
    "performa",
    "instruksi",
    "eksplorasi",
    "pola-kerja",
  ]) {
    assert.match(source, new RegExp(`id="${category}"`));
  }
  assert.doesNotMatch(source, /^##? \d{2}-\d{2}-\d{4}/m);
});

test("the prompt library keeps attribution, source gaps, and usage notes visible", () => {
  assert.match(source, /Rob Conery/);
  assert.match(source, /Ankur Sethi/);
  assert.match(source, /Sumber asli/);
  assert.match(source, /Hasil yang dicatat/);
});

test("the prompt library is searchable and the old journal URL redirects", {
  skip: !existsSync("dist/prompts/index.html") && "no dist/ - run pnpm run build",
}, () => {
  const html = readFileSync("dist/prompts/index.html", "utf8");
  assert.match(html, /data-pagefind-body/);
  assert.match(html, /Teknik Menghindari <em>brainrot<\/em>/);
  assert.match(html, /You are a senior PM that is an expert with GitHub/);
  assert.match(html, /Napolean Hill's Think and Grow Rich/);

  const redirects = readFileSync("dist/_redirects", "utf8");
  assert.match(redirects, /^\/prompt-journal \/prompts\/ 301$/m);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile("src/now.njk", "utf8");

// The captain stopped being an AWS Community Builder in July 2026. The whole
// point of the removal is that the claim must not come back on a later edit.
test("the now page no longer claims a retired credential", () => {
  assert.doesNotMatch(source, /AWS Community Builder/i);
});

test("the now page still lists the credential that is current", () => {
  assert.match(source, /Google Developer Expert \(GDE\)/);
});

// A /now page whose own stamp is stale undercuts the premise of the page.
test("the now page carries a hand-maintained last-updated stamp", () => {
  assert.match(source, /Terakhir diperbarui: [A-Z][a-z]+ \d{4}/);
});

// The Side Projects list was refreshed in August 2026: two entries were wrong
// (a podcast landing page miscategorised as a chat app, a project that matched
// no repository) and one duplicated an entry under "Sedang Dipelajari".
const sideProjects = source.match(/<h3>🛠️ Side Projects<\/h3>\s*<ul>([\s\S]*?)<\/ul>/)?.[1];

test("the side projects section is still present", () => {
  assert.ok(sideProjects, "expected a Side Projects list on the now page");
});

test("the retired side projects do not come back", () => {
  for (const retired of [/ngobrol\.in/i, /Vibe Check/i, /\bMBB\b/]) {
    assert.doesNotMatch(sideProjects, retired);
  }
});

test("the side projects are the four current ones, most recent first", () => {
  const names = [...sideProjects.matchAll(/<strong>.*?>([^<]+)<\/a><\/strong>/g)].map((m) => m[1]);
  assert.deepEqual(names, ["makan-dimana", "notable", "evalcode", "samarin"]);
});

test("every side project links somewhere and opens safely", () => {
  const links = [...sideProjects.matchAll(/<a href="([^"]+)"([^>]*)>/g)];
  assert.equal(links.length, 4);
  for (const [, href, attrs] of links) {
    assert.match(href, /^https:\/\//);
    assert.match(attrs, /target="_blank"/);
    assert.match(attrs, /rel="noopener noreferrer"/);
  }
});

// The captain retired MBB from the page entirely: it left Side Projects first,
// then "Building MBB" left Sedang Dipelajari once it was the only mention left.
test("MBB is gone from the whole now page, not just one section", () => {
  assert.doesNotMatch(source, /\bMBB\b/);
  assert.doesNotMatch(source, /rizafahmi\/mbb/i);
});

test("sedang dipelajari keeps the two entries that are still current", () => {
  const learning = source.match(/<h3>📚 Sedang Dipelajari<\/h3>\s*<ul>([\s\S]*?)<\/ul>/)?.[1];
  assert.ok(learning, "expected a Sedang Dipelajari list on the now page");
  assert.equal([...learning.matchAll(/<li>/g)].length, 2);
  assert.match(learning, /Agentic Coding/);
  assert.match(learning, /LLM Model/);
});

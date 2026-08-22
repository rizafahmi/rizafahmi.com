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

// Addendum 4 pins the definitive contents of both sections after four rounds
// of captain revisions, so these assert exact lists and order, not just presence.
const listItems = (heading) => {
  const body = source.match(new RegExp(`<h3>${heading}</h3>\\s*<ul>([\\s\\S]*?)</ul>`))?.[1];
  assert.ok(body, `expected a ${heading} list on the now page`);
  return [...body.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1].trim());
};

test("sedang ditonton is exactly the two current shows, in order", () => {
  const items = listItems("\u{1F4FA} Sedang Ditonton");
  assert.equal(items.length, 2);
  assert.match(items[0], /<strong>Alice in Borderland<\/strong>/);
  assert.match(items[1], /<strong>Outer Banks<\/strong>/);
  assert.doesNotMatch(source, /High Potential/);
});

test("sedang dibaca is exactly the two current books, in order", () => {
  const items = listItems("\u{1F4D6} Sedang Dibaca");
  assert.equal(items.length, 2);
  assert.match(items[0], /<strong>Purple Cow<\/strong> oleh Seth Godin/);
  assert.match(items[1], /<strong>The Alchemist<\/strong> oleh Paulo Coelho/);
  assert.doesNotMatch(source, /Storytelling with Data/);
});

test("neither list section links anything, matching how they already read", () => {
  for (const h of ["\u{1F4FA} Sedang Ditonton", "\u{1F4D6} Sedang Dibaca"]) {
    for (const item of listItems(h)) assert.doesNotMatch(item, /<a /);
  }
});

// Sedang Dipelajari was reworked once MBB left it: the Amp line became Loop
// Engineering, a build-from-scratch line was added, and the Agent Router entry
// (which carried an affiliate link) was removed.
test("sedang dipelajari is exactly the two current entries, in order", () => {
  const items = listItems("\u{1F4DA} Sedang Dipelajari");
  assert.equal(items.length, 2);
  assert.match(items[0], /<strong>.*>Loop Engineering<\/a><\/strong>/);
  assert.match(items[0], /https:\/\/www\.youtube\.com\/playlist\?list=PLUwP2tpG_l6s/);
  assert.match(items[1], /<strong>Coding Agent from Scratch<\/strong>/);
  // The captain moved from learning this to preparing teaching material about
  // it. A loose /dari awal/ match passes on either wording, so pin the verb.
  assert.match(items[1], /Sedang mempersiapkan materi membangun agentic coding dari awal/);
  assert.doesNotMatch(items[1], /Belajar membangun agentic coding/);
});

test("the retired sedang dipelajari entries do not come back", () => {
  for (const retired of [/Agent Router/i, /agentrouter\.org/i, /ampcode\.com/i]) {
    assert.doesNotMatch(source, retired);
  }
});

// Removing the Agent Router line removed the site's only affiliate link.
test("the now page carries no affiliate link", () => {
  assert.doesNotMatch(source, /[?&]aff=/);
});

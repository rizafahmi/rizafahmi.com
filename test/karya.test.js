import assert from "node:assert/strict";
import test from "node:test";

import karya from "../src/_data/karya.js";
import { normalizeProject, selectProjects } from "../src/libs/karya.js";

test("normalizeProject trims text and keeps the fields the card renders", () => {
  const project = normalizeProject({
    name: "  mbb  ",
    description: "  CLI assistant sederhana.  ",
    repo: " https://github.com/rizafahmi/mbb ",
    url: " https://mbb.dev ",
    tags: [" Elixir ", "CLI"],
  });

  assert.deepEqual(project, {
    name: "mbb",
    description: "CLI assistant sederhana.",
    repo: "https://github.com/rizafahmi/mbb",
    url: "https://mbb.dev",
    tags: ["Elixir", "CLI"],
  });
});

test("normalizeProject leaves the optional access url empty when there is none", () => {
  assert.equal(normalizeProject({ name: "x" }).url, null);
  assert.equal(normalizeProject({ name: "x", url: "" }).url, null);
  assert.equal(normalizeProject({ name: "x", url: "   " }).url, null);
  assert.equal(normalizeProject({ name: "x", url: null }).url, null);
});

test("normalizeProject rejects links that are not http(s)", () => {
  assert.equal(normalizeProject({ name: "x", url: "mbb.dev" }).url, null);
  assert.equal(normalizeProject({ name: "x", url: "javascript:alert(1)" }).url, null);
  assert.equal(normalizeProject({ name: "x", repo: "github.com/x/y" }).repo, null);
});

test("normalizeProject defaults description and tags", () => {
  const project = normalizeProject({ name: "solo" });
  assert.equal(project.description, null);
  assert.deepEqual(project.tags, []);
});

test("normalizeProject drops blank and non-string tags", () => {
  assert.deepEqual(normalizeProject({ name: "x", tags: ["Elixir", " ", null, 7] }).tags, [
    "Elixir",
  ]);
});

test("selectProjects preserves the hand-written order of the data file", () => {
  const list = selectProjects([{ name: "ketiga" }, { name: "pertama" }, { name: "kedua" }]);

  assert.deepEqual(
    list.map((p) => p.name),
    ["ketiga", "pertama", "kedua"],
  );
});

test("selectProjects skips entries without a usable name", () => {
  const list = selectProjects([{ name: "ok" }, { name: "  " }, null, {}, "bukan objek"]);

  assert.deepEqual(
    list.map((p) => p.name),
    ["ok"],
  );
});

test("selectProjects tolerates a non-array data file", () => {
  assert.deepEqual(selectProjects(null), []);
  assert.deepEqual(selectProjects({ name: "bukan array" }), []);
});

test("the curated Karya data file is a non-empty, valid list", () => {
  assert.ok(Array.isArray(karya), "karya.js must export an array");
  assert.ok(karya.length > 0, "karya.js must not be empty");

  const projects = selectProjects(karya);
  assert.equal(projects.length, karya.length, "every entry must have a usable name");

  for (const project of projects) {
    assert.ok(project.description, `"${project.name}" needs an Indonesian description`);
    assert.ok(project.repo, `"${project.name}" needs a usable GitHub URL`);
  }
});

test("the curated list carries an entry whose repo lives under another GitHub org", () => {
  const projects = selectProjects(karya);
  const ngobrolin = projects.find((p) => p.name === "Ngobrolin Web");

  assert.ok(ngobrolin, "Ngobrolin Web must be in the curated list");
  assert.equal(ngobrolin.repo, "https://github.com/ngobrolin/landing");
  assert.equal(ngobrolin.url, "https://ngobrol.in");
});

test("every curated repo url points at github.com, whatever the owner", () => {
  for (const project of selectProjects(karya)) {
    const { hostname } = new URL(project.repo);
    assert.equal(hostname, "github.com", `"${project.name}" must link to github.com`);
  }

  const owners = new Set(
    selectProjects(karya).map((p) => new URL(p.repo).pathname.split("/").filter(Boolean)[0]),
  );
  assert.ok(owners.has("rizafahmi"));
  assert.ok(owners.has("ngobrolin"), "the list is not limited to the captain's own account");
});

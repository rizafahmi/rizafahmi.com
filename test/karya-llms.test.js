import assert from "node:assert/strict";
import test from "node:test";

import nunjucks from "nunjucks";

import karya from "../src/_data/karya.js";
import { selectProjects } from "../src/libs/karya.js";

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("src/_includes"), {
  autoescape: true,
});

function renderConcise(rawProjects) {
  return env.renderString(
    '{% import "karya_llms.njk" as llms %}{{ llms.projectLines(projects) }}',
    { projects: selectProjects(rawProjects) },
  );
}

function renderInventory(rawProjects) {
  return env.renderString(
    '{% import "karya_llms.njk" as llms %}{{ llms.projectInventory(projects) }}',
    { projects: selectProjects(rawProjects) },
  );
}

const BASE = {
  name: "workspresso",
  description: "Cari coffee shop yang work-friendly.",
  repo: "https://github.com/rizafahmi/workspresso",
};

// --- concise entries, for /llms.txt ------------------------------------------

test("concise: one markdown line per project, matching the file's existing list shape", () => {
  const lines = renderConcise([BASE])
    .split("\n")
    .filter((line) => line.trim());

  assert.equal(lines.length, 1);
  assert.equal(
    lines[0],
    "- [workspresso](https://github.com/rizafahmi/workspresso): Cari coffee shop yang work-friendly.",
  );
});

test("concise: a project with an access url links there, not to the repo", () => {
  const line = renderConcise([{ ...BASE, url: "https://workspresso.app" }]).trim();

  assert.match(line, /^- \[workspresso\]\(https:\/\/workspresso\.app\):/);
});

test("concise: a project with no access url still renders one working link, never an empty one", () => {
  const line = renderConcise([BASE]).trim();

  assert.doesNotMatch(line, /\(\)/);
  assert.doesNotMatch(line, /\[\]/);
  assert.equal(line.match(/\]\(/g).length, 1);
});

test("concise: a name-only project prints a plain name, never an empty link", () => {
  const concise = renderConcise([{ name: "solo" }]);
  const inventory = renderInventory([{ name: "solo" }]);

  assert.match(concise.trim(), /^- solo: solo$/);
  assert.doesNotMatch(concise, /\[|\]|\(\)/);
  assert.match(inventory, /^### solo$/m);
  assert.doesNotMatch(inventory, /\[|\]|\(\)/);
});

test("concise: non-http(s) repo/url are nulled and never become empty links", () => {
  const concise = renderConcise([
    { name: "bare", repo: "github.com/x/y", url: "example.com/app" },
  ]);
  const inventory = renderInventory([
    { name: "bare", repo: "github.com/x/y", url: "example.com/app" },
  ]);

  assert.match(concise.trim(), /^- bare: bare$/);
  assert.doesNotMatch(concise, /\[|\]|\(\)/);
  assert.doesNotMatch(inventory, /Repository:|Access URL:|\[|\]|\(\)/);
});

test("concise: tags are appended in the same style the article entries use", () => {
  const line = renderConcise([{ ...BASE, tags: ["Astro", "Node.js", "SQLite"] }]).trim();

  assert.match(line, /\(tags: Astro, Node\.js, SQLite\)$/);
});

test("concise: a project with no tags renders no trailing tag suffix", () => {
  const line = renderConcise([BASE]).trim();

  assert.doesNotMatch(line, /tags:/);
  assert.match(line, /\.$/);
});

test("concise: entries keep the order of the data file", () => {
  const out = renderConcise([
    { ...BASE, name: "satu" },
    { ...BASE, name: "dua" },
  ]);

  assert.ok(out.indexOf("satu") < out.indexOf("dua"));
});

test("concise: plain text output is not HTML-escaped", () => {
  const line = renderConcise([{ ...BASE, description: "submit & voting" }]).trim();

  assert.match(line, /submit & voting/);
  assert.doesNotMatch(line, /&amp;/);
});

test("concise: nothing leaks from a missing optional field", () => {
  const out = renderConcise([{ name: "solo", repo: "https://github.com/x/solo" }]);

  assert.doesNotMatch(out, /undefined|\bnull\b/);
});

test("concise: an empty list renders nothing, not broken markup", () => {
  assert.equal(renderConcise([]).trim(), "");
});

// --- full inventory entries, for /llms-full.txt -------------------------------

test("inventory: renders a heading plus the fields the article inventory uses", () => {
  const out = renderInventory([{ ...BASE, tags: ["Astro", "SQLite"] }]);

  assert.match(out, /^### workspresso$/m);
  assert.match(out, /^- Repository: https:\/\/github\.com\/rizafahmi\/workspresso$/m);
  assert.match(out, /^- Tags: Astro, SQLite$/m);
  assert.match(out, /^- Description: Cari coffee shop yang work-friendly\.$/m);
});

test("inventory: a project with an access url lists it as its own field", () => {
  const out = renderInventory([{ ...BASE, url: "https://workspresso.app" }]);

  assert.match(out, /^- Access URL: https:\/\/workspresso\.app$/m);
});

test("inventory: a project with no access url renders no Access URL line at all", () => {
  const out = renderInventory([BASE]);

  assert.doesNotMatch(out, /Access URL/);
  assert.doesNotMatch(out, /undefined|\bnull\b/);
});

test("inventory: a project with no tags renders no Tags line", () => {
  assert.doesNotMatch(renderInventory([BASE]), /^- Tags:/m);
});

test("inventory: entries keep the order of the data file", () => {
  const out = renderInventory([
    { ...BASE, name: "satu" },
    { ...BASE, name: "dua" },
  ]);

  assert.ok(out.indexOf("### satu") < out.indexOf("### dua"));
});

test("inventory: an empty list renders nothing", () => {
  assert.equal(renderInventory([]).trim(), "");
});

// --- generated from the curated data file, never hardcoded -------------------

test("every project in src/_data/karya.js appears in both outputs", () => {
  const projects = selectProjects(karya);
  const concise = renderConcise(karya);
  const inventory = renderInventory(karya);

  assert.ok(projects.length > 0);
  for (const project of projects) {
    assert.ok(concise.includes(`[${project.name}]`), `${project.name} missing from /llms.txt`);
    assert.ok(
      inventory.includes(`### ${project.name}`),
      `${project.name} missing from /llms-full.txt`,
    );
    assert.ok(inventory.includes(project.description), `${project.name} description missing`);
  }
});

test("a project added to the data file flows through with no template change", () => {
  const extended = [
    ...karya,
    {
      name: "proyek-baru",
      description: "Proyek yang baru ditambahkan ke daftar.",
      repo: "https://github.com/rizafahmi/proyek-baru",
      url: "https://proyek-baru.example.com",
      tags: ["Elixir"],
    },
  ];

  const concise = renderConcise(extended);
  const inventory = renderInventory(extended);

  assert.match(concise, /- \[proyek-baru\]\(https:\/\/proyek-baru\.example\.com\)/);
  assert.match(inventory, /^### proyek-baru$/m);
  assert.match(inventory, /^- Access URL: https:\/\/proyek-baru\.example\.com$/m);
  assert.equal(
    renderConcise(extended)
      .split("\n")
      .filter((l) => l.trim()).length,
    selectProjects(karya).length + 1,
  );
});

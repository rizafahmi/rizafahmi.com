import assert from "node:assert/strict";
import test from "node:test";

import nunjucks from "nunjucks";

import { selectProjects } from "../src/libs/karya.js";

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("src/_includes"), {
  autoescape: true,
});

function render(rawProjects) {
  return env.renderString(
    '{% import "karya_open_source.njk" as karya %}{{ karya.openSourceCards(projects) }}',
    { projects: selectProjects(rawProjects) },
  );
}

const BASE = {
  name: "workspresso",
  description: "Cari coffee shop yang work-friendly.",
  repo: "https://github.com/rizafahmi/workspresso",
};

test("renders a card with the project name linked to its GitHub repo", () => {
  const html = render([BASE]);

  assert.match(html, /class="card-grid"/);
  assert.match(html, /class="card"/);
  assert.match(
    html,
    /<h3><a href="https:\/\/github\.com\/rizafahmi\/workspresso"[^>]*>workspresso<\/a><\/h3>/,
  );
  assert.match(html, /Cari coffee shop yang work-friendly\./);
});

test("renders tech tags as badges, in order", () => {
  const html = render([{ ...BASE, tags: ["Astro", "Node.js", "SQLite"] }]);

  assert.match(html, /<div class="badges" aria-label="Tech stack">/);
  assert.match(html, /<span class="badge">Astro<\/span>/);
  assert.ok(html.indexOf("Astro") < html.indexOf("SQLite"));
});

test("renders a second, separately labelled link when the project has an access url", () => {
  const html = render([{ ...BASE, url: "https://workspresso.app" }]);

  assert.match(html, /href="https:\/\/workspresso\.app"/);
  assert.match(html, /class="card-link"/);
  // The two links must read differently: repo is the title, the access url is labelled.
  assert.match(html, /Coba/);
});

test("renders only the GitHub link when the project has no access url", () => {
  const html = render([BASE]);

  assert.doesNotMatch(html, /card-link/);
  assert.doesNotMatch(html, /card-links/);
  assert.equal(html.match(/<a /g).length, 1);
});

test("a project with no tags renders no badges container", () => {
  const html = render([BASE]);

  assert.doesNotMatch(html, /badges/);
});

test("an empty list renders an empty grid, not broken markup", () => {
  const html = render([]);

  assert.match(html, /class="card-grid"/);
  assert.doesNotMatch(html, /class="card"/);
});

test("cards render in the order the data file lists them", () => {
  const html = render([
    { ...BASE, name: "satu" },
    { ...BASE, name: "dua" },
  ]);

  assert.ok(html.indexOf("satu") < html.indexOf("dua"));
});

test("escapes text so a stray character in the data file cannot break the page", () => {
  const html = render([{ ...BASE, description: "<script>alert(1)</script>" }]);

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test("never renders undefined or null leaking from a missing optional field", () => {
  const html = render([{ name: "solo", description: "Ada.", repo: "https://github.com/x/s" }]);

  assert.doesNotMatch(html, /undefined|\bnull\b/);
});

test("a repo under a different GitHub org renders exactly like any other card", () => {
  const html = render([
    {
      name: "Ngobrolin Web",
      description: "Situs Ngobrolin Web.",
      repo: "https://github.com/ngobrolin/landing",
      url: "https://ngobrol.in",
      tags: ["Astro", "TypeScript"],
    },
  ]);

  assert.match(
    html,
    /<h3><a href="https:\/\/github\.com\/ngobrolin\/landing"[^>]*>Ngobrolin Web<\/a><\/h3>/,
  );
  assert.match(html, /href="https:\/\/ngobrol\.in"/);
  assert.match(html, /class="card-link"/);
});

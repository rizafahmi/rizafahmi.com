import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("both site navs link to /kontribusi/", () => {
  const mainLayout = readFileSync("src/_includes/main.njk", "utf8");
  const homePage = readFileSync("src/index.njk", "utf8");

  assert.match(mainLayout, /<a href="\/kontribusi\/">/, "main.njk must link to /kontribusi/");
  assert.match(homePage, /<a href="\/kontribusi\/">/, "index.njk must link to /kontribusi/");
});

test("built /kontribusi/ page renders all four grounded examples with classification, outcome, and source links", {
  skip: !existsSync("dist/kontribusi/index.html") && "no dist/ — run pnpm run build",
}, () => {
  const html = readFileSync("dist/kontribusi/index.html", "utf8");
  const snapshot = JSON.parse(readFileSync("src/_data/githubContributions.json", "utf8"));

  // Observation timestamp and public-only notice
  assert.ok(html.includes(snapshot.observedAt), "must display recorded observedAt timestamp");
  assert.doesNotMatch(html, /gh[opsu]_[A-Za-z0-9_]+|github_pat_/);

  // Reconciled counts must match snapshot
  const out = snapshot.summary.outsideNamespace;
  const ext = out.byRelationship.external_contributor;
  const aff = out.byRelationship.affiliated_org;
  const unc = out.byRelationship.uncertain_or_collaborator;

  assert.ok(html.includes(`${ext.merged} / ${ext.total}`), "must display external merged/total");
  assert.ok(html.includes(`${aff.merged} / ${aff.total}`), "must display affiliated merged/total");
  assert.ok(html.includes(`${unc.merged} / ${unc.total}`), "must display uncertain merged/total");
  assert.ok(
    html.includes(`${snapshot.ownNamespace.mergedPrs} / ${snapshot.ownNamespace.totalPrs}`),
    "must display own-namespace merged/total",
  );

  // Verify all four named examples in rendered PR list items
  const expected = [
    {
      key: "phoenixframework/phoenix#323",
      url: "https://github.com/phoenixframework/phoenix/pull/323",
      rel: "external_contributor",
      outcome: "merged",
      kind: "docs",
      assoc: "CONTRIBUTOR",
    },
    {
      key: "reactjs/id.react.dev#40",
      url: "https://github.com/reactjs/id.react.dev/pull/40",
      rel: "external_contributor",
      outcome: "merged",
      kind: "translation",
      assoc: "CONTRIBUTOR",
    },
    {
      key: "gatsbyjs/gatsby#2385",
      url: "https://github.com/gatsbyjs/gatsby/pull/2385",
      rel: "external_contributor",
      outcome: "merged",
      kind: "listing",
      assoc: "CONTRIBUTOR",
    },
    {
      key: "ngobrolin/landing#147",
      url: "https://github.com/ngobrolin/landing/pull/147",
      rel: "affiliated_org",
      outcome: "merged",
      kind: "maintenance",
      assoc: "MEMBER",
    },
  ];

  for (const ex of expected) {
    assert.ok(html.includes(`data-pr-key="${ex.key}"`), `missing PR item ${ex.key}`);
    assert.ok(html.includes(`href="${ex.url}"`), `missing source link ${ex.url}`);
    const itemRegex = new RegExp(
      `data-pr-key="${ex.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?data-relationship="${ex.rel}"[\\s\\S]*?data-outcome="${ex.outcome}"[\\s\\S]*?data-kind="${ex.kind}"[\\s\\S]*?data-association="${ex.assoc}"`,
    );
    assert.match(html, itemRegex, `attributes mismatch for ${ex.key}`);
  }
});

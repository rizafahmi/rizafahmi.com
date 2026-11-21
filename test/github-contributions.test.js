import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  assessCoverage,
  buildDashboardView,
  CONTRIBUTION_KIND,
  classifyContributionKind,
  classifyOutcome,
  classifyRelationship,
  dedupeRecords,
  filterPublicOnly,
  OUTCOME,
  RELATIONSHIP,
  reconcileSnapshot,
} from "../src/libs/github-contributions.js";

test("classifyRelationship separates own, affiliated org (MEMBER), external (CONTRIBUTOR), and uncertain (COLLABORATOR/NONE)", () => {
  const own = classifyRelationship(
    { repo: "rizafahmi/notable", authorAssociation: "OWNER" },
    "rizafahmi",
  );
  assert.equal(own.relationship, RELATIONSHIP.OWN_PROJECT);

  const member = classifyRelationship(
    { repo: "ngobrolin/landing", authorAssociation: "MEMBER" },
    "rizafahmi",
  );
  assert.equal(member.relationship, RELATIONSHIP.AFFILIATED_ORG);
  assert.notEqual(member.relationship, RELATIONSHIP.EXTERNAL_CONTRIBUTOR);
  assert.match(member.reason, /tidak otomatis berarti maintainer/i);

  const external = classifyRelationship(
    { repo: "phoenixframework/phoenix", authorAssociation: "CONTRIBUTOR" },
    "rizafahmi",
  );
  assert.equal(external.relationship, RELATIONSHIP.EXTERNAL_CONTRIBUTOR);

  const collaborator = classifyRelationship(
    { repo: "awsugid/genaitour-website", authorAssociation: "COLLABORATOR" },
    "rizafahmi",
  );
  assert.equal(collaborator.relationship, RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR);
  assert.equal(collaborator.confidence, "uncertain");

  const mergedNone = classifyRelationship(
    {
      repo: "feedloop/qore-sdk",
      authorAssociation: "NONE",
      mergedAt: "2022-01-06T04:17:57Z",
      state: "closed",
    },
    "rizafahmi",
  );
  assert.equal(mergedNone.relationship, RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR);
  assert.equal(mergedNone.confidence, "uncertain");
});

test("classifyContributionKind distinguishes code, translation, docs, listing, and maintenance", () => {
  assert.equal(
    classifyContributionKind({
      repo: "phoenixframework/phoenix",
      title: "Update README add @post.id",
      files: [{ filename: "README.md" }],
    }),
    CONTRIBUTION_KIND.DOCS,
  );

  assert.equal(
    classifyContributionKind({
      repo: "reactjs/id.react.dev",
      title: "Translate typechecking-with-proptypes",
      files: [{ filename: "content/docs/typechecking-with-proptypes.md" }],
    }),
    CONTRIBUTION_KIND.TRANSLATION,
  );

  assert.equal(
    classifyContributionKind({
      repo: "gatsbyjs/gatsby",
      title: "Add randomscreencast site",
      files: [{ filename: "README.md" }],
    }),
    CONTRIBUTION_KIND.LISTING,
  );

  assert.equal(
    classifyContributionKind({
      repo: "ngobrolin/landing",
      title: "chore: update stats",
      files: [{ filename: "src/data/channel-subscribers.json" }],
    }),
    CONTRIBUTION_KIND.MAINTENANCE,
  );

  assert.equal(
    classifyContributionKind({
      repo: "VulcanJS/Vulcan",
      title: "Set counter name to category id instead of category slug",
      files: [{ filename: "packages/telescope-tags/lib/helpers.js" }],
    }),
    CONTRIBUTION_KIND.CODE,
  );
});

test("classifyOutcome distinguishes merged, open, and closed_unmerged", () => {
  assert.equal(
    classifyOutcome({ state: "closed", mergedAt: "2014-09-07T23:47:20Z" }),
    OUTCOME.MERGED,
  );
  assert.equal(classifyOutcome({ state: "open", mergedAt: null }), OUTCOME.OPEN);
  assert.equal(classifyOutcome({ state: "closed", mergedAt: null }), OUTCOME.CLOSED_UNMERGED);
});

test("dedupeRecords removes duplicate PR IDs and repo#number pairs", () => {
  const deduped = dedupeRecords([
    { id: 10, repo: "a/b", number: 1 },
    { id: 10, repo: "a/b", number: 1 },
    { id: 11, repo: "a/b", number: 2 },
  ]);
  assert.equal(deduped.length, 2);

  const fallback = dedupeRecords([
    { repo: "a/b", number: 5 },
    { repo: "A/B", number: 5 },
  ]);
  assert.equal(fallback.length, 1);
});

test("filterPublicOnly excludes private records", () => {
  const filtered = filterPublicOnly([
    { id: 1, private: false },
    { id: 2, private: true },
    { id: 3, isPrivate: true },
    { id: 4, repository: { private: true } },
    { id: 5, visibility: "private" },
    { id: 6, visibility: "public" },
  ]);
  assert.deepEqual(
    filtered.map((r) => r.id),
    [1, 6],
  );
});

test("assessCoverage flags incomplete_results, un-sliced 1000 cap, and partial fetches", () => {
  const ok = assessCoverage({
    totalCount: 167,
    fetchedCount: 167,
    incompleteResults: false,
    hitSearchCap: false,
  });
  assert.equal(ok.complete, true);
  assert.equal(ok.warnings.length, 0);

  const incomplete = assessCoverage({
    totalCount: 167,
    fetchedCount: 167,
    incompleteResults: true,
    hitSearchCap: false,
  });
  assert.equal(incomplete.complete, false);
  assert.ok(incomplete.warnings.some((w) => w.includes("incomplete_results")));

  const capped = assessCoverage({
    totalCount: 1250,
    fetchedCount: 1000,
    incompleteResults: false,
    hitSearchCap: true,
    dateSliced: false,
  });
  assert.equal(capped.complete, false);
  assert.ok(capped.warnings.some((w) => w.includes("1.000")));
});

test("committed src/_data/githubContributions.json reconciles cleanly and grounds the four required examples", () => {
  const raw = readFileSync("src/_data/githubContributions.json", "utf8");
  assert.doesNotMatch(raw, /gh[opsu]_[A-Za-z0-9_]+|github_pat_/);

  const snapshot = JSON.parse(raw);
  assert.equal(snapshot.account, "rizafahmi");
  assert.ok(snapshot.observedAt);
  assert.equal(snapshot.coverage.complete, true);

  const recon = reconcileSnapshot(snapshot);
  assert.equal(recon.ok, true, `Reconciliation mismatches: ${recon.mismatches.join("; ")}`);

  const byKey = new Map(snapshot.outsidePullRequests.map((pr) => [`${pr.repo}#${pr.number}`, pr]));

  const phoenix = byKey.get("phoenixframework/phoenix#323");
  assert.ok(phoenix, "phoenixframework/phoenix#323 must exist");
  assert.equal(phoenix.relationship, RELATIONSHIP.EXTERNAL_CONTRIBUTOR);
  assert.equal(phoenix.kind, CONTRIBUTION_KIND.DOCS);
  assert.equal(phoenix.outcome, OUTCOME.MERGED);
  assert.equal(phoenix.url, "https://github.com/phoenixframework/phoenix/pull/323");

  const reactId = byKey.get("reactjs/id.react.dev#40");
  assert.ok(reactId, "reactjs/id.react.dev#40 must exist");
  assert.equal(reactId.relationship, RELATIONSHIP.EXTERNAL_CONTRIBUTOR);
  assert.equal(reactId.kind, CONTRIBUTION_KIND.TRANSLATION);
  assert.equal(reactId.outcome, OUTCOME.MERGED);
  assert.equal(reactId.url, "https://github.com/reactjs/id.react.dev/pull/40");

  const gatsby = byKey.get("gatsbyjs/gatsby#2385");
  assert.ok(gatsby, "gatsbyjs/gatsby#2385 must exist");
  assert.equal(gatsby.relationship, RELATIONSHIP.EXTERNAL_CONTRIBUTOR);
  assert.equal(gatsby.kind, CONTRIBUTION_KIND.LISTING);
  assert.equal(gatsby.outcome, OUTCOME.MERGED);
  assert.equal(gatsby.url, "https://github.com/gatsbyjs/gatsby/pull/2385");

  const ngobrolin = byKey.get("ngobrolin/landing#147");
  assert.ok(ngobrolin, "ngobrolin/landing#147 must exist");
  assert.equal(ngobrolin.authorAssociation, "MEMBER");
  assert.equal(ngobrolin.relationship, RELATIONSHIP.AFFILIATED_ORG);
  assert.equal(ngobrolin.outcome, OUTCOME.MERGED);
  assert.equal(ngobrolin.url, "https://github.com/ngobrolin/landing/pull/147");

  const view = buildDashboardView(snapshot);
  assert.equal(view.outsidePullRequests.length, snapshot.summary.outsideNamespace.total);
  assert.equal(
    view.externalPrs.length,
    snapshot.summary.outsideNamespace.byRelationship.external_contributor.total,
  );
});

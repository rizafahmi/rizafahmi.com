#!/usr/bin/env node
/**
 * Fetch public GitHub contribution records for `rizafahmi` and write a
 * committed snapshot to `src/_data/githubContributions.json`.
 *
 * Run by hand (`pnpm run fetch:github`) and commit the result — never run
 * during `pnpm run build`, matching `fetch-youtube-shorts.mjs`.
 *
 * Safety & correctness guarantees:
 * - Public evidence ONLY: all search queries include `is:public`, GraphQL
 *   per-repo nodes are filtered by `isPrivate === false`, and private repo
 *   names/counts/tokens are never written.
 * - Handles pagination, deduplication by PR `id`, GitHub's 1,000-result
 *   search cap (via automatic date-window splitting), and `incomplete_results`.
 * - Reconciles all summary counts against the fetched records before writing.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  assessCoverage,
  dedupeRecords,
  filterPublicOnly,
  GITHUB_SEARCH_CAP,
  normalizePullRequest,
  reconcileSnapshot,
  summarizePullRequests,
} from "../src/libs/github-contributions.js";

const ACCOUNT = "rizafahmi";
const OUTPUT_PATH = path.resolve("src/_data/githubContributions.json");

// Curated evidence notes grounded in inspected diffs/bodies for key examples.
const GROUNDED_SUMMARIES = {
  "phoenixframework/phoenix#323":
    "Koreksi README dari `post.id` menjadi `@post.id` pada contoh form action.",
  "reactjs/id.react.dev#40":
    "Terjemahan dokumentasi React Bahasa Indonesia untuk halaman `typechecking-with-proptypes.md` melalui 16 aktivitas review.",
  "gatsbyjs/gatsby#2385":
    "Menambahkan tautan situs `randomscreencast` ke daftar di README (daftar situs, bukan perubahan kode).",
  "ngobrolin/landing#147":
    "Pembaruan data statistik kanal di `channel-subscribers.json` dengan status `author_association: MEMBER` (proyek organisasi, bukan kontribusi eksternal independen).",
  "VulcanJS/Vulcan#1229":
    "Perbaikan kode di `packages/telescope-tags/lib/helpers.js`: menggunakan category id alih-alih category slug untuk counter.",
  "VulcanJS/Vulcan#1242":
    "Perbaikan URL action link pada fitur undangan email (`invites.js` dan template Handlebars).",
  "rrrene/elixirstatus-web#14":
    "Menambahkan fitur autosave pada formulir submit (`app.js` + `jquery.autoSave.js`).",
  "google/WebFundamentals#7563":
    "Perbaikan terjemahan Bahasa Indonesia codelab Progressive Web App (`your-first-pwapp/index.md`).",
  "ivankristianto/eval#17":
    "Menambahkan dukungan Bun sebagai alternatif Node.js (`models.astro`, `README.md`, `bun.lock`).",
  "ariya/tinker-chat#1":
    "Perbaikan typo nama environment variable `OPENAPI_API_KEY` menjadi `OPENAI_API_KEY` di `main.cljs`.",
  "feedloop/qore-sdk#26":
    "Menambahkan proyek contoh JavaScript pada dokumentasi (di-merge ke branch `v1`, sehingga GitHub tetap mencatat `author_association: NONE`).",
  "prio/planet.elixir#6":
    "Memperbarui URL RSS feed ElixirDose di `elixir/config.ini` (di-merge, tercatat `author_association: NONE`).",
  "awsugid/genaitour-website#3":
    "Halaman coming soon situs AWS GenAI Tour Indonesia dengan status `author_association: COLLABORATOR`.",
};

function ghJson(args) {
  const stdout = execFileSync("gh", args, {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

/**
 * Paginate GitHub REST `search/issues` with explicit 1,000-result cap handling.
 * If a query exceeds 1,000 results and `splitByYear` is enabled, it splits by
 * calendar year on `created:` so partial coverage is avoided.
 */
function searchPullRequests(
  baseQuery,
  { startYear = 2011, endYear = new Date().getUTCFullYear() } = {},
) {
  const firstPage = ghJson([
    "api",
    `search/issues?q=${encodeURIComponent(baseQuery)}&per_page=100&page=1&sort=created&order=desc`,
  ]);

  const totalCount = firstPage.total_count ?? 0;
  let incompleteResults = Boolean(firstPage.incomplete_results);
  const hitSearchCap = totalCount > GITHUB_SEARCH_CAP;

  if (!hitSearchCap) {
    const items = [...(firstPage.items || [])];
    const totalPages = Math.min(10, Math.ceil(totalCount / 100));
    for (let page = 2; page <= totalPages; page += 1) {
      const next = ghJson([
        "api",
        `search/issues?q=${encodeURIComponent(baseQuery)}&per_page=100&page=${page}&sort=created&order=desc`,
      ]);
      if (next.incomplete_results) incompleteResults = true;
      if (Array.isArray(next.items)) items.push(...next.items);
    }
    const deduped = dedupeRecords(items);
    return {
      query: baseQuery,
      items: deduped,
      coverage: assessCoverage({
        totalCount,
        fetchedCount: deduped.length,
        incompleteResults,
        hitSearchCap: false,
        dateSliced: false,
      }),
    };
  }

  // Date-slice fallback when totalCount > 1,000
  const allItems = [];
  let sliceHitCap = false;
  for (let year = startYear; year <= endYear; year += 1) {
    const yearQuery = `${baseQuery} created:${year}-01-01..${year}-12-31`;
    const first = ghJson([
      "api",
      `search/issues?q=${encodeURIComponent(yearQuery)}&per_page=100&page=1&sort=created&order=desc`,
    ]);
    if (first.incomplete_results) incompleteResults = true;
    const yearTotal = first.total_count ?? 0;
    if (yearTotal > GITHUB_SEARCH_CAP) sliceHitCap = true;
    if (Array.isArray(first.items)) allItems.push(...first.items);
    const pages = Math.min(10, Math.ceil(yearTotal / 100));
    for (let page = 2; page <= pages; page += 1) {
      const next = ghJson([
        "api",
        `search/issues?q=${encodeURIComponent(yearQuery)}&per_page=100&page=${page}&sort=created&order=desc`,
      ]);
      if (next.incomplete_results) incompleteResults = true;
      if (Array.isArray(next.items)) allItems.push(...next.items);
    }
  }

  const deduped = dedupeRecords(allItems);
  return {
    query: baseQuery,
    items: deduped,
    coverage: assessCoverage({
      totalCount,
      fetchedCount: deduped.length,
      incompleteResults,
      hitSearchCap: sliceHitCap,
      dateSliced: true,
    }),
  };
}

function repoFromApiUrl(repositoryUrl) {
  return String(repositoryUrl || "").replace(/^https:\/\/api\.github\.com\/repos\//, "");
}

function fetchPrDetail(repo, number) {
  const pr = ghJson(["api", `repos/${repo}/pulls/${number}`]);
  // Double-check public visibility from the authoritative PR/repo record
  if (pr.base?.repo?.private === true) {
    return null;
  }
  let files = [];
  try {
    const rawFiles = ghJson(["api", `repos/${repo}/pulls/${number}/files?per_page=30`]);
    files = Array.isArray(rawFiles)
      ? rawFiles.map((f) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
        }))
      : [];
  } catch {
    files = [];
  }

  let reviews = [];
  try {
    const rawReviews = ghJson(["api", `repos/${repo}/pulls/${number}/reviews?per_page=50`]);
    reviews = Array.isArray(rawReviews) ? rawReviews : [];
  } catch {
    reviews = [];
  }

  const reviewers = [
    ...new Set(
      reviews
        .map((r) => r.user?.login)
        .filter((login) => login && login.toLowerCase() !== ACCOUNT.toLowerCase()),
    ),
  ];

  return {
    additions: pr.additions ?? null,
    deletions: pr.deletions ?? null,
    changedFiles: pr.changed_files ?? null,
    commits: pr.commits ?? null,
    reviewCount: reviews.length,
    reviewers,
    files,
    baseRef: pr.base?.ref || null,
    defaultBranch: pr.base?.repo?.default_branch || null,
    repoLanguage: pr.base?.repo?.language || null,
    repoArchived: Boolean(pr.base?.repo?.archived),
    repoDescription: pr.base?.repo?.description || "",
    authorAssociation: pr.author_association,
    mergedAt: pr.merged_at || null,
    closedAt: pr.closed_at || null,
  };
}

/**
 * Fetch public-only yearly PR counts via GraphQL `contributionsCollection`
 * by summing ONLY `pullRequestContributionsByRepository` nodes where
 * `repository.isPrivate === false`. Never stores private repo names or counts.
 */
function fetchPublicYearlyPrActivity(years) {
  const yearly = [];
  for (const year of years) {
    const from = `${year}-01-01T00:00:00Z`;
    const to = `${year}-12-31T23:59:59Z`;
    const query = `
      query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(from: $from, to: $to) {
            pullRequestContributionsByRepository(maxRepositories: 100) {
              repository {
                nameWithOwner
                isPrivate
                owner { login }
              }
              contributions { totalCount }
            }
          }
        }
      }
    `;
    const res = ghJson([
      "api",
      "graphql",
      "-f",
      `query=${query}`,
      "-f",
      `login=${ACCOUNT}`,
      "-f",
      `from=${from}`,
      "-f",
      `to=${to}`,
    ]);
    const nodes =
      res?.data?.user?.contributionsCollection?.pullRequestContributionsByRepository || [];
    let outsideCount = 0;
    let ownCount = 0;
    const outsideRepos = new Set();
    for (const node of nodes) {
      if (node?.repository?.isPrivate !== false) continue;
      const count = node.contributions?.totalCount ?? 0;
      const owner = String(node.repository.owner?.login || "").toLowerCase();
      if (owner === ACCOUNT.toLowerCase()) {
        ownCount += count;
      } else {
        outsideCount += count;
        outsideRepos.add(node.repository.nameWithOwner);
      }
    }
    if (outsideCount > 0 || ownCount > 0) {
      yearly.push({
        year,
        outsidePrs: outsideCount,
        ownPrs: ownCount,
        outsideRepoCount: outsideRepos.size,
      });
    }
  }
  return yearly.sort((a, b) => b.year - a.year);
}

async function main() {
  const observedAt = new Date().toISOString();
  console.log(`[github] Fetching public profile for ${ACCOUNT} at ${observedAt}…`);

  const profile = ghJson(["api", `users/${ACCOUNT}`]);
  const publicOrgs = ghJson(["api", `users/${ACCOUNT}/orgs?per_page=100`]);

  const outsideQuery = `is:pr author:${ACCOUNT} -user:${ACCOUNT} is:public`;
  const ownQuery = `is:pr author:${ACCOUNT} user:${ACCOUNT} is:public`;

  console.log(`[github] Searching outside-namespace public PRs…`);
  const outsideSearch = searchPullRequests(outsideQuery);

  console.log(`[github] Searching own-namespace public PRs…`);
  const ownSearch = searchPullRequests(ownQuery);

  // Enrich all non-MEMBER PRs (CONTRIBUTOR, COLLABORATOR, NONE) + key MEMBER examples
  const DETAIL_MEMBER_KEYS = new Set(["ngobrolin/landing#147"]);
  const enrichedOutside = [];

  for (const item of filterPublicOnly(outsideSearch.items)) {
    const repo = repoFromApiUrl(item.repository_url);
    const key = `${repo}#${item.number}`;
    const assoc = String(item.author_association || "NONE").toUpperCase();
    const shouldFetchDetail = assoc !== "MEMBER" || DETAIL_MEMBER_KEYS.has(key);

    let detail = null;
    if (shouldFetchDetail) {
      try {
        detail = fetchPrDetail(repo, item.number);
        if (detail === null) {
          // Skipped because repo is private
          continue;
        }
      } catch (err) {
        console.warn(`[github] Warning: could not fetch detail for ${key}: ${err.message}`);
      }
    }

    const baseRecord = {
      id: item.id,
      repo,
      repoOwner: repo.split("/")[0],
      number: item.number,
      title: item.title,
      url: item.html_url,
      state: item.state,
      createdAt: item.created_at,
      mergedAt: detail?.mergedAt ?? item.pull_request?.merged_at ?? null,
      closedAt: detail?.closedAt ?? item.closed_at ?? null,
      authorAssociation: detail?.authorAssociation ?? assoc,
      summary: GROUNDED_SUMMARIES[key] || "",
      ...(detail
        ? {
            additions: detail.additions,
            deletions: detail.deletions,
            changedFiles: detail.changedFiles,
            commits: detail.commits,
            reviewCount: detail.reviewCount,
            reviewers: detail.reviewers,
            files: detail.files,
            baseRef: detail.baseRef,
            defaultBranch: detail.defaultBranch,
            repoLanguage: detail.repoLanguage,
            repoArchived: detail.repoArchived,
            repoDescription: detail.repoDescription,
          }
        : {}),
    };

    enrichedOutside.push(normalizePullRequest(baseRecord, ACCOUNT));
  }

  const outsideSummary = summarizePullRequests(enrichedOutside);

  // Own-namespace summary (from search results, public only)
  const ownNormalized = filterPublicOnly(ownSearch.items).map((item) => {
    const repo = repoFromApiUrl(item.repository_url);
    return normalizePullRequest(
      {
        id: item.id,
        repo,
        repoOwner: repo.split("/")[0],
        number: item.number,
        title: item.title,
        url: item.html_url,
        state: item.state,
        createdAt: item.created_at,
        mergedAt: item.pull_request?.merged_at ?? null,
        closedAt: item.closed_at ?? null,
        authorAssociation: item.author_association || "OWNER",
      },
      ACCOUNT,
    );
  });
  const ownSummary = summarizePullRequests(ownNormalized);

  const ownTopReposMap = new Map();
  for (const pr of ownNormalized) {
    let entry = ownTopReposMap.get(pr.repo);
    if (!entry) {
      entry = { repo: pr.repo, url: `https://github.com/${pr.repo}`, total: 0, merged: 0 };
      ownTopReposMap.set(pr.repo, entry);
    }
    entry.total += 1;
    if (pr.outcome === "merged") entry.merged += 1;
  }
  const ownTopRepos = [...ownTopReposMap.values()]
    .sort((a, b) => b.merged - a.merged || b.total - a.total)
    .slice(0, 8);

  // Date range across outside PRs
  const createdDates = enrichedOutside
    .map((p) => p.createdAt)
    .filter(Boolean)
    .sort();
  const mergedDates = enrichedOutside
    .map((p) => p.mergedAt)
    .filter(Boolean)
    .sort();

  // Public-only yearly PR activity via GraphQL ContributionsCollection
  const currentYear = new Date().getUTCFullYear();
  const startYear = new Date(profile.created_at).getUTCFullYear();
  const years = [];
  for (let y = startYear; y <= currentYear; y += 1) years.push(y);
  console.log(
    `[github] Querying public-only GraphQL contributionsCollection (${startYear}..${currentYear})…`,
  );
  const yearlyActivity = fetchPublicYearlyPrActivity(years);

  const snapshot = {
    account: ACCOUNT,
    observedAt,
    profileCreatedAt: profile.created_at,
    publicReposCount: profile.public_repos,
    publicOrgsCount: Array.isArray(publicOrgs) ? publicOrgs.length : 0,
    queries: {
      outsideNamespace: outsideQuery,
      ownNamespace: ownQuery,
    },
    dateRange: {
      createdFrom: createdDates[0] || null,
      createdTo: createdDates[createdDates.length - 1] || null,
      mergedFrom: mergedDates[0] || null,
      mergedTo: mergedDates[mergedDates.length - 1] || null,
      basisNote:
        "Semua PR dicatat dengan tanggal pembuatan (created_at); PR yang diterima juga menyertakan tanggal merge (merged_at).",
    },
    coverage: {
      outsideNamespace: outsideSearch.coverage,
      ownNamespace: ownSearch.coverage,
      complete: outsideSearch.coverage.complete && ownSearch.coverage.complete,
    },
    summary: {
      outsideNamespace: outsideSummary,
      ownNamespace: {
        total: ownSummary.total,
        merged: ownSummary.merged,
        open: ownSummary.open,
        closedUnmerged: ownSummary.closedUnmerged,
        repoCount: ownSummary.repoCount,
      },
      allPublicPrs: {
        total: outsideSummary.total + ownSummary.total,
        merged: outsideSummary.merged + ownSummary.merged,
      },
    },
    ownNamespace: {
      publicReposCount: profile.public_repos,
      totalPrs: ownSummary.total,
      mergedPrs: ownSummary.merged,
      openPrs: ownSummary.open,
      closedUnmergedPrs: ownSummary.closedUnmerged,
      reposWithPrs: ownSummary.repoCount,
      topRepos: ownTopRepos,
    },
    yearlyActivity,
    outsidePullRequests: enrichedOutside,
  };

  // Reconcile before writing so bad data can never be committed
  const check = reconcileSnapshot(snapshot);
  if (!check.ok) {
    console.error("[github] Reconciliation failed:", check.mismatches);
    process.exit(1);
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `[github] Wrote ${OUTPUT_PATH} — outside: ${outsideSummary.total} (${outsideSummary.merged} merged; external=${outsideSummary.byRelationship.external_contributor.total}, affiliated=${outsideSummary.byRelationship.affiliated_org.total}, uncertain=${outsideSummary.byRelationship.uncertain_or_collaborator.total}), own: ${ownSummary.total} (${ownSummary.merged} merged).`,
  );
}

main();

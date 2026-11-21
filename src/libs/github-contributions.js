/**
 * GitHub Contributions — classification, coverage assessment, and reconciliation.
 *
 * Pure module (no network, no filesystem) so both the fetch script, Eleventy
 * templates, and unit tests share one source of truth.
 */

export const RELATIONSHIP = Object.freeze({
  EXTERNAL_CONTRIBUTOR: "external_contributor",
  AFFILIATED_ORG: "affiliated_org",
  UNCERTAIN_OR_COLLABORATOR: "uncertain_or_collaborator",
  OWN_PROJECT: "own_project",
});

export const OUTCOME = Object.freeze({
  MERGED: "merged",
  OPEN: "open",
  CLOSED_UNMERGED: "closed_unmerged",
});

export const CONTRIBUTION_KIND = Object.freeze({
  CODE: "code",
  TRANSLATION: "translation",
  DOCS: "docs",
  LISTING: "listing",
  MAINTENANCE: "maintenance",
});

export const GITHUB_SEARCH_CAP = 1000;

export const RELATIONSHIP_LABELS = Object.freeze({
  [RELATIONSHIP.EXTERNAL_CONTRIBUTOR]: "Kontributor Proyek Lain",
  [RELATIONSHIP.AFFILIATED_ORG]: "Organisasi / Terafiliasi",
  [RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR]: "Kolaborator / Belum Pasti",
  [RELATIONSHIP.OWN_PROJECT]: "Proyek Pribadi",
});

export const KIND_LABELS = Object.freeze({
  [CONTRIBUTION_KIND.CODE]: "Kode & Fitur",
  [CONTRIBUTION_KIND.TRANSLATION]: "Terjemahan",
  [CONTRIBUTION_KIND.DOCS]: "Dokumentasi",
  [CONTRIBUTION_KIND.LISTING]: "Direktori / Daftar",
  [CONTRIBUTION_KIND.MAINTENANCE]: "Pemeliharaan & Data",
});

export const OUTCOME_LABELS = Object.freeze({
  [OUTCOME.MERGED]: "Merged",
  [OUTCOME.OPEN]: "Open",
  [OUTCOME.CLOSED_UNMERGED]: "Closed (tidak di-merge)",
});

const LISTING_REPO_PATTERNS = [
  /^gatsbyjs\/gatsby$/i,
  /^PaulKinlan\/gdedeck$/i,
  /^frontend-id\/oss$/i,
  /^h4cc\/awesome-/i,
  /^sindresorhus\/amas$/i,
  /^svelteid\/website$/i,
  /^wayneashleyberry\/awesome-/i,
  /^prio\/planet\.elixir$/i,
];

const LISTING_TITLE_PATTERN =
  /\b(add\s+.+\s+site|add\s+my\s+|add\s+riza|add\s+course|menambahkan\s+pustaka|re-adding\s+.+board|rss\s+feed\s+url|update\s+rizafahmi\s+website)\b/i;

const TRANSLATION_PATTERN = /\b(translat|terjemah|bahasa\s+indones|id\.react\.dev|\/id\/)\b/i;

const DOCS_FILE_PATTERN =
  /(^|\/)(readme|contributing|changelog|license|docs?|content\/docs|guides?|cheatsheet)(\/|\.|$)|\.(md|mdx|rst|txt)$/i;

const CODE_FILE_PATTERN =
  /\.(js|jsx|ts|tsx|mjs|cjs|ex|exs|erl|py|rb|go|rs|java|kt|swift|c|cpp|h|cs|php|cljs|clj|elm|astro|svelte|vue|css|scss|html|handlebars|hbs|sh|bash|yml|yaml|toml|dockerfile)$/i;

const DATA_OR_MAINTENANCE_FILE_PATTERN =
  /(^|\/)(package-lock\.json|pnpm-lock\.yaml|bun\.lock|yarn\.lock|\.prettierrc|\.gitignore|\.envrc|channel-subscribers\.json|data\/|coverage\/)/i;

/**
 * Deduplicate PR records by numeric `id`, falling back to `repo#number`.
 * Preserves first occurrence order.
 */
export function dedupeRecords(records) {
  if (!Array.isArray(records)) return [];
  const seen = new Set();
  const result = [];
  for (const record of records) {
    if (!record) continue;
    const key =
      record.id != null
        ? `id:${record.id}`
        : `${String(record.repo || "").toLowerCase()}#${record.number}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(record);
  }
  return result;
}

/**
 * Filter out any private or potentially private repository record.
 * Only records explicitly marked public (`isPrivate === false` or `private === false`)
 * pass when visibility metadata is present.
 */
export function filterPublicOnly(records) {
  if (!Array.isArray(records)) return [];
  return records.filter((record) => {
    if (!record) return false;
    if (record.private === true || record.isPrivate === true) return false;
    if (record.repository?.private === true || record.repository?.isPrivate === true) return false;
    if (record.visibility && String(record.visibility).toLowerCase() !== "public") return false;
    return true;
  });
}

/**
 * Classify the merge/state outcome of a pull request.
 */
export function classifyOutcome(pr) {
  if (!pr) return OUTCOME.CLOSED_UNMERGED;
  if (pr.mergedAt || pr.merged_at || pr.merged === true) {
    return OUTCOME.MERGED;
  }
  if (String(pr.state || "").toLowerCase() === "open") {
    return OUTCOME.OPEN;
  }
  return OUTCOME.CLOSED_UNMERGED;
}

/**
 * Classify relationship between the author and the target repository.
 *
 * Rules:
 * - Never equate "outside personal namespace" with "independent external contributor".
 * - Never infer maintainer status from organization membership (`MEMBER`).
 * - Keep `COLLABORATOR` and `NONE` explicit as uncertain rather than guessing.
 */
export function classifyRelationship(pr, username = "rizafahmi") {
  const normalizedUser = String(username || "rizafahmi").toLowerCase();
  const repo = String(pr?.repo || "");
  const owner = String(pr?.repoOwner || repo.split("/")[0] || "").toLowerCase();
  const assoc = String(pr?.authorAssociation || pr?.author_association || "NONE").toUpperCase();

  if (owner === normalizedUser) {
    return {
      relationship: RELATIONSHIP.OWN_PROJECT,
      confidence: "confirmed",
      authorAssociation: assoc,
      reason: `Repositori berada di namespace pribadi ${username}.`,
    };
  }

  if (assoc === "MEMBER" || assoc === "OWNER") {
    return {
      relationship: RELATIONSHIP.AFFILIATED_ORG,
      confidence: "confirmed",
      authorAssociation: assoc,
      reason:
        "GitHub mencatat author_association: MEMBER/OWNER (anggota organisasi) — bukan kontribusi eksternal independen, dan tidak otomatis berarti maintainer penuh.",
    };
  }

  if (assoc === "CONTRIBUTOR" || assoc === "FIRST_TIME_CONTRIBUTOR" || assoc === "FIRST_TIMER") {
    return {
      relationship: RELATIONSHIP.EXTERNAL_CONTRIBUTOR,
      confidence: "confirmed",
      authorAssociation: assoc,
      reason:
        "Repositori milik pihak lain dan GitHub mencatat author_association: CONTRIBUTOR (tanpa status anggota organisasi atau kolaborator).",
    };
  }

  if (assoc === "COLLABORATOR") {
    return {
      relationship: RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR,
      confidence: "uncertain",
      authorAssociation: assoc,
      reason:
        "GitHub mencatat author_association: COLLABORATOR (diundang langsung ke repo). Hubungan kolaborasi bisa terafiliasi, sehingga dipisahkan dari kontributor eksternal independen.",
    };
  }

  // NONE or unknown
  const outcome = classifyOutcome(pr);
  const noneReason =
    outcome === OUTCOME.MERGED
      ? "PR ini di-merge namun GitHub mencatat author_association: NONE (misalnya merge ke branch non-default, email commit tidak tertaut, atau riwayat repo berubah). Hubungan dibiarkan eksplisit."
      : "GitHub mencatat author_association: NONE (belum ada commit yang terhubung di branch default). Hubungan proyek dibiarkan eksplisit.";

  return {
    relationship: RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR,
    confidence: "uncertain",
    authorAssociation: assoc,
    reason: noneReason,
  };
}

/**
 * Classify what kind of contribution a PR represents, grounded in changed files
 * (when fetched) and PR title/repo metadata.
 */
export function classifyContributionKind(pr) {
  const repo = String(pr?.repo || "");
  const title = String(pr?.title || "");
  const files = Array.isArray(pr?.files) ? pr.files : [];
  const filenames = files.map((f) => (typeof f === "string" ? f : String(f?.filename || "")));

  // 1. Translation PRs (e.g. reactjs/id.react.dev#40, google/WebFundamentals#7563)
  if (
    TRANSLATION_PATTERN.test(repo) ||
    TRANSLATION_PATTERN.test(title) ||
    filenames.some((name) => /\/id\/|bahasa|i18n/i.test(name))
  ) {
    return CONTRIBUTION_KIND.TRANSLATION;
  }

  // 2. Directory / listing additions (e.g. gatsbyjs/gatsby#2385 adding randomscreencast to README)
  if (
    LISTING_TITLE_PATTERN.test(title) ||
    (LISTING_REPO_PATTERNS.some((re) => re.test(repo)) &&
      (filenames.length === 0 ||
        filenames.every((name) => DOCS_FILE_PATTERN.test(name) || /\.ini$|\.json$/i.test(name))))
  ) {
    return CONTRIBUTION_KIND.LISTING;
  }

  // 3. When we have changed filenames, use file evidence first
  if (filenames.length > 0) {
    const allDocs = filenames.every((name) => DOCS_FILE_PATTERN.test(name));
    if (allDocs) {
      return CONTRIBUTION_KIND.DOCS;
    }

    const allDataOrMaintenance = filenames.every((name) =>
      DATA_OR_MAINTENANCE_FILE_PATTERN.test(name),
    );
    if (allDataOrMaintenance || /^chore(\(|:|\s|\/)/i.test(title)) {
      // If it's a chore/docs PR with only docs or example config, check docs first
      if (/chore\/docs/i.test(title)) {
        return CONTRIBUTION_KIND.DOCS;
      }
      if (allDataOrMaintenance) {
        return CONTRIBUTION_KIND.MAINTENANCE;
      }
    }

    const hasCode = filenames.some(
      (name) => CODE_FILE_PATTERN.test(name) && !DOCS_FILE_PATTERN.test(name),
    );
    if (hasCode) {
      return CONTRIBUTION_KIND.CODE;
    }
  }

  // 4. Fallback to title heuristics when file list wasn't fetched
  if (/^chore(\(|:|\s|\/)/i.test(title) || /\b(update stats|bump|deps|lockfile)\b/i.test(title)) {
    return CONTRIBUTION_KIND.MAINTENANCE;
  }
  if (/\b(readme|typo|docs?|documentation|link|cheatsheet|article|artikel)\b/i.test(title)) {
    return CONTRIBUTION_KIND.DOCS;
  }

  return CONTRIBUTION_KIND.CODE;
}

/**
 * Assess whether search coverage is complete or partial.
 * Never presents partial coverage as complete.
 */
export function assessCoverage({
  totalCount = 0,
  fetchedCount = 0,
  incompleteResults = false,
  hitSearchCap = false,
  dateSliced = false,
} = {}) {
  const warnings = [];
  if (incompleteResults) {
    warnings.push(
      "GitHub Search API mengembalikan incomplete_results: true — hasil mungkin tidak lengkap.",
    );
  }
  if (hitSearchCap && !dateSliced) {
    warnings.push(
      `Jumlah hasil (${totalCount}) melewati batas 1.000 item GitHub Search API tanpa pemecahan rentang tanggal.`,
    );
  }
  if (fetchedCount < totalCount) {
    warnings.push(
      `Baru ${fetchedCount} dari ${totalCount} PR yang berhasil diambil; cakupan bersifat parsial.`,
    );
  }

  return {
    complete: warnings.length === 0,
    totalCount,
    fetchedCount,
    incompleteResults: Boolean(incompleteResults),
    hitSearchCap: Boolean(hitSearchCap),
    dateSliced: Boolean(dateSliced),
    warnings,
  };
}

/**
 * Normalize a raw PR object into the canonical dashboard record shape.
 */
export function normalizePullRequest(raw, username = "rizafahmi") {
  const rel = classifyRelationship(raw, username);
  const outcome = classifyOutcome(raw);
  const kind = raw.kindOverride || classifyContributionKind(raw);

  return {
    id: raw.id,
    repo: raw.repo,
    repoOwner: raw.repoOwner || String(raw.repo || "").split("/")[0] || "",
    number: raw.number,
    title: raw.title,
    url: raw.url || raw.html_url,
    state: raw.state,
    outcome,
    createdAt: raw.createdAt || raw.created_at || null,
    mergedAt: raw.mergedAt || raw.merged_at || null,
    closedAt: raw.closedAt || raw.closed_at || null,
    authorAssociation: rel.authorAssociation,
    relationship: rel.relationship,
    relationshipConfidence: rel.confidence,
    relationshipReason: rel.reason,
    kind,
    summary: raw.summary || "",
    additions: raw.additions ?? null,
    deletions: raw.deletions ?? null,
    changedFiles: raw.changedFiles ?? null,
    commits: raw.commits ?? null,
    reviewCount: raw.reviewCount ?? null,
    reviewers: Array.isArray(raw.reviewers) ? raw.reviewers : [],
    files: Array.isArray(raw.files) ? raw.files : [],
    baseRef: raw.baseRef || null,
    defaultBranch: raw.defaultBranch || null,
    repoLanguage: raw.repoLanguage || null,
    repoArchived: Boolean(raw.repoArchived),
    repoDescription: raw.repoDescription || "",
  };
}

/**
 * Count PRs by outcome and relationship from an array of normalized PRs.
 */
export function summarizePullRequests(prs) {
  const byRelationship = {
    [RELATIONSHIP.EXTERNAL_CONTRIBUTOR]: {
      total: 0,
      merged: 0,
      open: 0,
      closedUnmerged: 0,
      repos: new Set(),
    },
    [RELATIONSHIP.AFFILIATED_ORG]: {
      total: 0,
      merged: 0,
      open: 0,
      closedUnmerged: 0,
      repos: new Set(),
    },
    [RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR]: {
      total: 0,
      merged: 0,
      open: 0,
      closedUnmerged: 0,
      repos: new Set(),
    },
    [RELATIONSHIP.OWN_PROJECT]: {
      total: 0,
      merged: 0,
      open: 0,
      closedUnmerged: 0,
      repos: new Set(),
    },
  };

  const byKindExternal = {
    [CONTRIBUTION_KIND.CODE]: { total: 0, merged: 0 },
    [CONTRIBUTION_KIND.TRANSLATION]: { total: 0, merged: 0 },
    [CONTRIBUTION_KIND.DOCS]: { total: 0, merged: 0 },
    [CONTRIBUTION_KIND.LISTING]: { total: 0, merged: 0 },
    [CONTRIBUTION_KIND.MAINTENANCE]: { total: 0, merged: 0 },
  };

  let total = 0;
  let merged = 0;
  let open = 0;
  let closedUnmerged = 0;
  const allRepos = new Set();

  for (const pr of prs) {
    total += 1;
    allRepos.add(pr.repo);
    const bucket = byRelationship[pr.relationship];
    if (bucket) {
      bucket.total += 1;
      bucket.repos.add(pr.repo);
    }

    if (pr.outcome === OUTCOME.MERGED) {
      merged += 1;
      if (bucket) bucket.merged += 1;
    } else if (pr.outcome === OUTCOME.OPEN) {
      open += 1;
      if (bucket) bucket.open += 1;
    } else {
      closedUnmerged += 1;
      if (bucket) bucket.closedUnmerged += 1;
    }

    if (pr.relationship === RELATIONSHIP.EXTERNAL_CONTRIBUTOR && byKindExternal[pr.kind]) {
      byKindExternal[pr.kind].total += 1;
      if (pr.outcome === OUTCOME.MERGED) {
        byKindExternal[pr.kind].merged += 1;
      }
    }
  }

  const formatBucket = (b) => ({
    total: b.total,
    merged: b.merged,
    open: b.open,
    closedUnmerged: b.closedUnmerged,
    repoCount: b.repos.size,
  });

  return {
    total,
    merged,
    open,
    closedUnmerged,
    repoCount: allRepos.size,
    byRelationship: {
      [RELATIONSHIP.EXTERNAL_CONTRIBUTOR]: formatBucket(
        byRelationship[RELATIONSHIP.EXTERNAL_CONTRIBUTOR],
      ),
      [RELATIONSHIP.AFFILIATED_ORG]: formatBucket(byRelationship[RELATIONSHIP.AFFILIATED_ORG]),
      [RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR]: formatBucket(
        byRelationship[RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR],
      ),
      [RELATIONSHIP.OWN_PROJECT]: formatBucket(byRelationship[RELATIONSHIP.OWN_PROJECT]),
    },
    byKindExternal,
  };
}

/**
 * Reconcile a full snapshot's declared summary counts against its underlying
 * `outsidePullRequests` array and `ownNamespace` summary.
 */
export function reconcileSnapshot(snapshot) {
  const mismatches = [];
  if (!snapshot || !Array.isArray(snapshot.outsidePullRequests)) {
    return {
      ok: false,
      mismatches: ["Snapshot missing outsidePullRequests array"],
      computed: null,
    };
  }

  const deduped = dedupeRecords(filterPublicOnly(snapshot.outsidePullRequests));
  if (deduped.length !== snapshot.outsidePullRequests.length) {
    mismatches.push(
      `outsidePullRequests contains ${snapshot.outsidePullRequests.length - deduped.length} duplicate or non-public entries`,
    );
  }

  const normalized = deduped.map((pr) => normalizePullRequest(pr, snapshot.account));
  const computed = summarizePullRequests(normalized);

  const declared = snapshot.summary?.outsideNamespace;
  if (!declared) {
    mismatches.push("Snapshot missing summary.outsideNamespace");
  } else {
    if (declared.total !== computed.total) {
      mismatches.push(
        `outsideNamespace.total: declared ${declared.total} !== computed ${computed.total}`,
      );
    }
    if (declared.merged !== computed.merged) {
      mismatches.push(
        `outsideNamespace.merged: declared ${declared.merged} !== computed ${computed.merged}`,
      );
    }
    if (declared.open !== computed.open) {
      mismatches.push(
        `outsideNamespace.open: declared ${declared.open} !== computed ${computed.open}`,
      );
    }
    if (declared.closedUnmerged !== computed.closedUnmerged) {
      mismatches.push(
        `outsideNamespace.closedUnmerged: declared ${declared.closedUnmerged} !== computed ${computed.closedUnmerged}`,
      );
    }

    for (const key of [
      RELATIONSHIP.EXTERNAL_CONTRIBUTOR,
      RELATIONSHIP.AFFILIATED_ORG,
      RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR,
    ]) {
      const decBucket = declared.byRelationship?.[key];
      const compBucket = computed.byRelationship[key];
      if (!decBucket) {
        mismatches.push(`Missing declared bucket ${key}`);
        continue;
      }
      if (decBucket.total !== compBucket.total || decBucket.merged !== compBucket.merged) {
        mismatches.push(
          `Bucket ${key}: declared (${decBucket.total}/${decBucket.merged}) !== computed (${compBucket.total}/${compBucket.merged})`,
        );
      }
    }

    const bucketSumTotal =
      computed.byRelationship[RELATIONSHIP.EXTERNAL_CONTRIBUTOR].total +
      computed.byRelationship[RELATIONSHIP.AFFILIATED_ORG].total +
      computed.byRelationship[RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR].total;
    if (bucketSumTotal !== computed.total) {
      mismatches.push(`Relationship bucket sum (${bucketSumTotal}) !== total (${computed.total})`);
    }
  }

  return {
    ok: mismatches.length === 0,
    mismatches,
    computed,
  };
}

/**
 * Group pull requests by repository, sorted by merged count desc then total desc.
 */
export function groupByRepository(prs) {
  const map = new Map();
  for (const pr of prs) {
    let entry = map.get(pr.repo);
    if (!entry) {
      entry = {
        repo: pr.repo,
        repoUrl: `https://github.com/${pr.repo}`,
        relationship: pr.relationship,
        authorAssociations: new Set(),
        total: 0,
        merged: 0,
        open: 0,
        closedUnmerged: 0,
        latestCreatedAt: pr.createdAt,
        latestMergedAt: pr.mergedAt,
        prs: [],
      };
      map.set(pr.repo, entry);
    }
    entry.total += 1;
    entry.authorAssociations.add(pr.authorAssociation);
    if (pr.outcome === OUTCOME.MERGED) entry.merged += 1;
    else if (pr.outcome === OUTCOME.OPEN) entry.open += 1;
    else entry.closedUnmerged += 1;
    if (pr.createdAt && (!entry.latestCreatedAt || pr.createdAt > entry.latestCreatedAt)) {
      entry.latestCreatedAt = pr.createdAt;
    }
    if (pr.mergedAt && (!entry.latestMergedAt || pr.mergedAt > entry.latestMergedAt)) {
      entry.latestMergedAt = pr.mergedAt;
    }
    entry.prs.push(pr);
  }

  return [...map.values()]
    .map((entry) => ({
      ...entry,
      authorAssociations: [...entry.authorAssociations],
    }))
    .sort((a, b) => {
      if (b.merged !== a.merged) return b.merged - a.merged;
      if (b.total !== a.total) return b.total - a.total;
      return a.repo.localeCompare(b.repo);
    });
}

/**
 * Build the complete view model consumed by the Eleventy /kontribusi/ template.
 */
export function buildDashboardView(snapshot, curatedKarya = []) {
  if (!snapshot) return null;

  const normalizedOutside = dedupeRecords(filterPublicOnly(snapshot.outsidePullRequests || []))
    .map((pr) => normalizePullRequest(pr, snapshot.account))
    .sort((a, b) => {
      const aDate = a.mergedAt || a.createdAt || "";
      const bDate = b.mergedAt || b.createdAt || "";
      return bDate.localeCompare(aDate);
    });

  const summary = summarizePullRequests(normalizedOutside);
  const externalPrs = normalizedOutside.filter(
    (pr) => pr.relationship === RELATIONSHIP.EXTERNAL_CONTRIBUTOR,
  );
  const affiliatedPrs = normalizedOutside.filter(
    (pr) => pr.relationship === RELATIONSHIP.AFFILIATED_ORG,
  );
  const uncertainPrs = normalizedOutside.filter(
    (pr) => pr.relationship === RELATIONSHIP.UNCERTAIN_OR_COLLABORATOR,
  );

  // Featured grounded examples (pinned order so visitors immediately see the range of evidence:
  // code, translation, docs fix, listing, and why org-member PRs are separated).
  const FEATURED_KEYS = [
    "phoenixframework/phoenix#323",
    "reactjs/id.react.dev#40",
    "gatsbyjs/gatsby#2385",
    "ngobrolin/landing#147",
    "VulcanJS/Vulcan#1229",
    "rrrene/elixirstatus-web#14",
    "google/WebFundamentals#7563",
    "ivankristianto/eval#17",
  ];

  const byKey = new Map(normalizedOutside.map((pr) => [`${pr.repo}#${pr.number}`, pr]));
  const featuredEvidence = FEATURED_KEYS.map((key) => byKey.get(key)).filter(Boolean);

  return {
    account: snapshot.account,
    profileUrl: `https://github.com/${snapshot.account}`,
    observedAt: snapshot.observedAt,
    dateRange: snapshot.dateRange,
    coverage: snapshot.coverage,
    publicOrgsCount: snapshot.publicOrgsCount ?? 0,
    summary,
    ownNamespace: snapshot.ownNamespace,
    yearlyActivity: snapshot.yearlyActivity || [],
    featuredEvidence,
    outsidePullRequests: normalizedOutside,
    externalPrs,
    affiliatedRepos: groupByRepository(affiliatedPrs),
    uncertainRepos: groupByRepository(uncertainPrs),
    externalRepos: groupByRepository(externalPrs),
    curatedOwnProjects: Array.isArray(curatedKarya) ? curatedKarya.slice(0, 6) : [],
    labels: {
      relationship: RELATIONSHIP_LABELS,
      kind: KIND_LABELS,
      outcome: OUTCOME_LABELS,
    },
  };
}

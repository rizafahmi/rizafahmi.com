// Build-time related articles selection for Eleventy.
// Deterministic: depends only on collection + current item data, never on current time.

const DEFAULT_STOPWORDS = new Set([
  // Indonesian (minimal)
  "dan",
  "yang",
  "di",
  "ke",
  "dari",
  "untuk",
  "pada",
  "dengan",
  "atau",
  "ini",
  "itu",
  "saya",
  "kamu",
  "kami",
  "kita",
  "ada",
  "akan",
  "bisa",
  "jadi",
  "lebih",
  "dalam",
  "sebagai",
  "karena",
  "juga",
  "agar",
  "tanpa",
  // English (minimal)
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "as",
]);

function toPlainText(input) {
  if (!input) return "";
  return String(input)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text, { stopwords = DEFAULT_STOPWORDS } = {}) {
  const s = toPlainText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  if (!s) return [];

  return s
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.length >= 3 && !stopwords.has(t));
}

const ITEM_TOKEN_CACHE = new WeakMap();

function getCachedTokens(item, buildTextFn) {
  if (!item || typeof item !== "object") return tokenize(buildTextFn());
  let cached = ITEM_TOKEN_CACHE.get(item);
  if (!cached) {
    cached = tokenize(buildTextFn());
    ITEM_TOKEN_CACHE.set(item, cached);
  }
  return cached;
}

function jaccard(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (!a.size || !b.size) return 0;

  let intersection = 0;
  for (const t of a) {
    if (b.has(t)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union ? intersection / union : 0;
}

function normalizeTags(tags, { hiddenTags = new Set() } = {}) {
  if (!tags) return [];
  let arr = tags;
  if (typeof arr === "string") arr = [arr];
  if (!Array.isArray(arr)) return [];
  return arr.filter((t) => t && !hiddenTags.has(t));
}

function getItemDateMs(item) {
  const d = item?.data?.date ? new Date(item.data.date) : null;
  return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
}

/**
 * Select related posts by combining multiple signals:
 * - shared tags (primary)
 * - content similarity (Jaccard token overlap for title/excerpt/content)
 * - recency (normalized within the collection)
 *
 * Fully deterministic for a given input set.
 */
export function getRelatedPosts(collection, current, opts = {}) {
  const {
    limit = 3,
    hiddenTags = new Set(["all", "nav", "post", "catatan"]),
    weights = { tags: 0.6, similarity: 0.3, recency: 0.1 },
    excludeUrl = current?.excludeUrl || "",
    onlyRelevant = Boolean(current?.onlyRelevant),
  } = opts;

  if (!Array.isArray(collection) || !collection.length) return [];

  const currentUrl = current?.url ? String(current.url) : "";
  const skipUrl = excludeUrl ? normalizeUrlPath(excludeUrl) : "";
  const rawCurrentTags = normalizeTags(current?.tags, { hiddenTags });
  const currentTags = new Set(rawCurrentTags);
  const currentConcepts = onlyRelevant ? expandConceptTokens(rawCurrentTags) : null;

  const currentText = [current?.title, current?.excerpt, current?.content]
    .filter(Boolean)
    .join(" ");
  const currentTokens = tokenize(currentText);

  // Recency normalization based on collection min/max dates.
  const dates = collection.filter((i) => i?.url && i.url !== currentUrl).map(getItemDateMs);
  const minDate = dates.length ? Math.min(...dates) : 0;
  const maxDate = dates.length ? Math.max(...dates) : 0;
  const span = maxDate - minDate;

  const scored = [];
  for (const item of collection) {
    if (!item?.url || item.url === currentUrl) continue;
    if (skipUrl && normalizeUrlPath(item.url) === skipUrl) continue;

    const itemTags = normalizeTags(item.data?.tags, { hiddenTags });
    let shared = 0;
    if (currentTags.size) {
      for (const t of itemTags) {
        if (currentTags.has(t)) shared++;
      }
    }
    if (shared === 0 && currentConcepts?.size) {
      for (const t of expandConceptTokens(itemTags)) {
        if (currentConcepts.has(t)) {
          shared += 0.5;
        }
      }
    }

    const itemTokens = getCachedTokens(item, () =>
      [item.data?.title, item.data?.description, item.templateContent].filter(Boolean).join(" "),
    );
    const sim = jaccard(currentTokens, itemTokens);

    if (onlyRelevant && shared === 0 && sim < 0.03) continue;

    const dateMs = getItemDateMs(item);
    const recency = span > 0 ? (dateMs - minDate) / span : 0;

    const tagNorm = currentTags.size ? Math.min(1, shared / currentTags.size) : 0;

    const total = weights.tags * tagNorm + weights.similarity * sim + weights.recency * recency;

    scored.push({ item, total, shared, sim, dateMs, url: item.url });
  }

  scored.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.shared !== a.shared) return b.shared - a.shared;
    if (b.sim !== a.sim) return b.sim - a.sim;
    if (b.dateMs !== a.dateMs) return b.dateMs - a.dateMs;
    return a.url.localeCompare(b.url);
  });

  // If any candidate shares at least one tag, prefer those.
  const withShared = scored.filter((x) => x.shared > 0);
  const pool = withShared.length ? withShared : scored;

  return pool.slice(0, limit).map((x) => x.item);
}

// Map canonical article/tip tags and prompt categories to shared domain concepts
// so cross-format matching connects e.g. "Elixir"/"Phoenix LiveView" <-> "elixir"/"phoenix",
// or prompt category "performa" <-> "web"/"frontend".
const CONCEPT_SYNONYMS = {
  ai: [
    "ai",
    "llm",
    "gpt",
    "claude",
    "gemini",
    "chatgpt",
    "copilot",
    "prompt",
    "anthropic",
    "generative",
    "eval",
    "llm-eval",
    "jev",
  ],
  "agentic-coding": [
    "agentic-coding",
    "agent",
    "agents",
    "agentic",
    "sub-agent",
    "claude-code",
    "cursor",
    "codex",
    "mcp",
    "pi",
    "cli",
    "spesifikasi",
    "planning",
    "perencanaan",
    "implementasi",
    "instruksi",
    "pola-kerja",
  ],
  elixir: ["elixir", "phoenix", "phoenix-liveview", "liveview", "otp", "beam", "ecto", "erlang"],
  otp: ["otp", "beam", "genserver", "supervisor", "elixir", "concurrency"],
  javascript: ["javascript", "js", "typescript", "ts", "nodejs", "node-js", "astro", "svelte"],
  web: [
    "web",
    "frontend",
    "html",
    "css",
    "astro",
    "performa",
    "performance",
    "core-web-vitals",
    "desain-ui",
    "local-first",
  ],
  produktivitas: [
    "produktivitas",
    "belajar",
    "menulis",
    "buku",
    "pola-kerja",
    "eksplorasi",
    "review",
    "karier",
  ],
  devops: ["devops", "docker", "self-hosting", "paas", "deploy", "bash"],
  database: ["database", "sqlite", "turso", "sql", "postgres"],
};

function expandConceptTokens(rawTags = []) {
  const normalized = rawTags
    .filter(Boolean)
    .map((t) =>
      String(t)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);

  const expanded = new Set(normalized);
  for (const tag of normalized) {
    if (CONCEPT_SYNONYMS[tag]) {
      for (const syn of CONCEPT_SYNONYMS[tag]) expanded.add(syn);
    }
    for (const [canonical, list] of Object.entries(CONCEPT_SYNONYMS)) {
      if (list.includes(tag)) {
        expanded.add(canonical);
      }
    }
  }
  return expanded;
}

function normalizeUrlPath(url) {
  if (!url) return "";
  return String(url).trim().replace(/\/+$/, "") || "/";
}

/**
 * Select related prompts from `collections.prompts` for an article, tip, or topic hub.
 * Signals:
 * - Explicit `relatedArticle` match (bidirectional link back from the article)
 * - Concept/keyword/category overlap with current tags
 * - Token Jaccard similarity over title, description, keywords, and prompt body
 */
export function getRelatedPrompts(prompts, current, opts = {}) {
  const {
    limit = 2,
    excludeUrl = "",
    hiddenTags = new Set(["all", "nav", "post", "catatan"]),
  } = opts;

  if (!Array.isArray(prompts) || !prompts.length) return [];

  const currentUrl = normalizeUrlPath(current?.url);
  const skipUrl = normalizeUrlPath(excludeUrl);
  const rawCurrentTags = normalizeTags(current?.tags, { hiddenTags });
  const currentConcepts = expandConceptTokens(rawCurrentTags);
  const currentText = [
    current?.title,
    current?.excerpt,
    current?.description,
    current?.content,
    rawCurrentTags.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
  const currentTokens = tokenize(currentText);

  const scored = [];
  for (const prompt of prompts) {
    if (!prompt?.url) continue;
    const promptUrl = normalizeUrlPath(prompt.url);
    if (promptUrl === currentUrl || (skipUrl && promptUrl === skipUrl)) continue;

    const explicitMatch =
      currentUrl && prompt.relatedArticle && normalizeUrlPath(prompt.relatedArticle) === currentUrl;

    const promptTags = [
      prompt.category,
      ...(Array.isArray(prompt.keywords) ? prompt.keywords : []),
    ];
    const promptConcepts = expandConceptTokens(promptTags);

    let sharedConcepts = 0;
    for (const c of promptConcepts) {
      if (currentConcepts.has(c)) sharedConcepts++;
    }

    const promptTokens = getCachedTokens(prompt, () =>
      [
        prompt.title,
        prompt.description,
        ...(prompt.keywords || []),
        prompt.prompt,
        prompt.templateContent,
      ]
        .filter(Boolean)
        .join(" "),
    );
    const sim = jaccard(currentTokens, promptTokens);

    const conceptScore = currentConcepts.size
      ? Math.min(1, sharedConcepts / Math.max(2, Math.min(currentConcepts.size, 4)))
      : 0;
    const total = (explicitMatch ? 2.0 : 0) + 0.55 * conceptScore + 0.45 * sim;

    if (explicitMatch || sharedConcepts > 0 || sim >= 0.035) {
      scored.push({
        item: prompt,
        explicitMatch: Boolean(explicitMatch),
        sharedConcepts,
        sim,
        total,
        order: prompt.order ?? 999,
        slug: prompt.slug || "",
      });
    }
  }

  scored.sort((a, b) => {
    if (a.explicitMatch !== b.explicitMatch) return a.explicitMatch ? -1 : 1;
    if (b.total !== a.total) return b.total - a.total;
    if (b.sharedConcepts !== a.sharedConcepts) return b.sharedConcepts - a.sharedConcepts;
    if (b.sim !== a.sim) return b.sim - a.sim;
    if (a.order !== b.order) return a.order - b.order;
    return a.slug.localeCompare(b.slug);
  });

  return scored.slice(0, limit).map((x) => x.item);
}

/**
 * Select related YouTube Shorts (`tipsLibrary.items`) for an article, prompt, tip, or topic hub.
 * Signals:
 * - Direct tag / concept overlap (`tip.tags`)
 * - Content similarity over title, cleaned description, and transcript
 * - Recency tie-breaker (`publishedAt`)
 */
export function getRelatedTips(tips, current, opts = {}) {
  const { limit = 3, hiddenTags = new Set(["all", "nav", "post", "catatan"]) } = opts;

  if (!Array.isArray(tips) || !tips.length) return [];

  const currentUrl = normalizeUrlPath(current?.url);
  const rawCurrentTags = normalizeTags(current?.tags, { hiddenTags });
  const currentTagSlugs = new Set(
    rawCurrentTags.map((t) =>
      String(t)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    ),
  );
  const currentConcepts = expandConceptTokens(rawCurrentTags);

  const currentText = [
    current?.title,
    current?.excerpt,
    current?.description,
    current?.content,
    rawCurrentTags.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
  const currentTokens = tokenize(currentText);

  const scored = [];
  for (const tip of tips) {
    if (!tip?.url) continue;
    if (normalizeUrlPath(tip.url) === currentUrl) continue;

    const tipTagList = (Array.isArray(tip.tags) ? tip.tags : []).map((t) =>
      typeof t === "string" ? t.toLowerCase() : (t?.slug || t?.label || "").toLowerCase(),
    );
    let directShared = 0;
    for (const t of tipTagList) {
      if (currentTagSlugs.has(t)) directShared++;
    }

    const tipConcepts = expandConceptTokens(tipTagList);
    let conceptShared = 0;
    for (const c of tipConcepts) {
      if (currentConcepts.has(c)) conceptShared++;
    }

    const tipTokens = getCachedTokens(tip, () =>
      [tip.title, tip.description, tip.transcript, tipTagList.join(" ")].filter(Boolean).join(" "),
    );
    const sim = jaccard(currentTokens, tipTokens);

    if (directShared === 0 && conceptShared === 0 && sim < 0.04) continue;

    const directNorm = currentTagSlugs.size ? directShared / currentTagSlugs.size : 0;
    const conceptNorm = currentConcepts.size
      ? Math.min(1, conceptShared / Math.max(2, Math.min(currentConcepts.size, 4)))
      : 0;
    const total = 0.5 * directNorm + 0.25 * conceptNorm + 0.25 * sim;

    scored.push({
      item: tip,
      total,
      directShared,
      conceptShared,
      sim,
      publishedAt: tip.publishedAt || "",
      url: tip.url,
    });
  }

  scored.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (b.directShared !== a.directShared) return b.directShared - a.directShared;
    if (b.sim !== a.sim) return b.sim - a.sim;
    if (b.publishedAt !== a.publishedAt) return b.publishedAt.localeCompare(a.publishedAt);
    return a.url.localeCompare(b.url);
  });

  const withDirect = scored.filter((x) => x.directShared > 0);
  const pool = withDirect.length >= limit ? withDirect : scored;

  return pool.slice(0, limit).map((x) => x.item);
}

/**
 * Select related open-source projects (`karya.js`) for an article, prompt, or topic hub.
 * Signals:
 * - Direct mention of the project name or GitHub repo in the current item
 * - Shared technology/concept tags
 * - Token similarity
 */
export function getRelatedProjects(projects, current, opts = {}) {
  const { limit = 2, hiddenTags = new Set(["all", "nav", "post", "catatan"]) } = opts;

  if (!Array.isArray(projects) || !projects.length) return [];

  const rawCurrentTags = normalizeTags(current?.tags, { hiddenTags });
  const currentConcepts = expandConceptTokens(rawCurrentTags);
  const currentPlain = toPlainText(
    [current?.title, current?.excerpt, current?.description, current?.content].join(" "),
  ).toLowerCase();
  const currentTokens = tokenize(`${currentPlain} ${rawCurrentTags.join(" ")}`);

  const scored = [];
  for (let index = 0; index < projects.length; index++) {
    const project = projects[index];
    if (!project?.name || !project?.repo) continue;

    const nameLower = project.name.toLowerCase();
    const repoSlug = project.repo.split("/").pop()?.toLowerCase() || "";

    const directMention =
      (nameLower.length >= 3 &&
        new RegExp(`\\b${nameLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
          currentPlain,
        )) ||
      (repoSlug.length >= 4 && currentPlain.includes(repoSlug));

    const projectTags = Array.isArray(project.tags) ? project.tags : [];
    const projectConcepts = expandConceptTokens(projectTags);

    let sharedConcepts = 0;
    for (const c of projectConcepts) {
      if (currentConcepts.has(c)) sharedConcepts++;
    }

    const projectText = [project.name, project.description, ...projectTags]
      .filter(Boolean)
      .join(" ");
    const sim = jaccard(currentTokens, tokenize(projectText));

    if (!directMention && sharedConcepts === 0 && sim < 0.05) continue;

    const conceptNorm = currentConcepts.size
      ? Math.min(1, sharedConcepts / Math.max(2, Math.min(currentConcepts.size, 4)))
      : 0;
    const total = (directMention ? 2.0 : 0) + 0.6 * conceptNorm + 0.4 * sim;

    scored.push({
      item: project,
      directMention,
      sharedConcepts,
      sim,
      total,
      index,
    });
  }

  scored.sort((a, b) => {
    if (a.directMention !== b.directMention) return a.directMention ? -1 : 1;
    if (b.total !== a.total) return b.total - a.total;
    if (b.sharedConcepts !== a.sharedConcepts) return b.sharedConcepts - a.sharedConcepts;
    if (b.sim !== a.sim) return b.sim - a.sim;
    return a.index - b.index;
  });

  return scored.slice(0, limit).map((x) => x.item);
}

// Internal exports for unit tests.
export const __test = { tokenize, jaccard, normalizeTags, toPlainText, expandConceptTokens };

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
  const d = item && item.data && item.data.date ? new Date(item.data.date) : null;
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
  } = opts;

  if (!Array.isArray(collection) || !collection.length) return [];

  const currentUrl = current && current.url ? String(current.url) : "";
  const currentTags = new Set(normalizeTags(current && current.tags, { hiddenTags }));

  const currentText = [current && current.title, current && current.excerpt, current && current.content]
    .filter(Boolean)
    .join(" ");
  const currentTokens = tokenize(currentText);

  // Recency normalization based on collection min/max dates.
  const dates = collection
    .filter((i) => i && i.url && i.url !== currentUrl)
    .map(getItemDateMs);
  const minDate = dates.length ? Math.min(...dates) : 0;
  const maxDate = dates.length ? Math.max(...dates) : 0;
  const span = maxDate - minDate;

  const scored = [];
  for (const item of collection) {
    if (!item || !item.url || item.url === currentUrl) continue;

    const itemTags = normalizeTags(item.data && item.data.tags, { hiddenTags });
    let shared = 0;
    if (currentTags.size) {
      for (const t of itemTags) {
        if (currentTags.has(t)) shared++;
      }
    }

    const itemText = [
      item.data && item.data.title,
      item.data && item.data.description,
      item.templateContent,
    ]
      .filter(Boolean)
      .join(" ");
    const sim = jaccard(currentTokens, tokenize(itemText));

    const dateMs = getItemDateMs(item);
    const recency = span > 0 ? (dateMs - minDate) / span : 0;

    const tagNorm = currentTags.size ? shared / currentTags.size : 0;

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

// Internal exports for unit tests.
export const __test = { tokenize, jaccard, normalizeTags, toPlainText };

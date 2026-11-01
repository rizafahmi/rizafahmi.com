/**
 * Helpers for /prompts/ and /prompts/<slug>/ — the curated prompt library.
 *
 * Each prompt lives in `src/prompts/<slug>.md` with structured frontmatter and
 * Markdown usage notes. This module normalizes those collection entries, groups
 * them by category, and builds the plain-text Markdown view served at
 * `/prompts/<slug>.md` for coding agents and CLI tools.
 */

import fs from "node:fs";

export const PROMPT_CATEGORIES = [
  {
    id: "perencanaan",
    label: "Perencanaan",
    shortLabel: "Perencanaan",
  },
  {
    id: "review",
    label: "Review dan pemeriksaan",
    shortLabel: "Review",
  },
  {
    id: "ide-dan-desain",
    label: "Ide dan desain",
    shortLabel: "Ide & desain",
  },
  {
    id: "implementasi",
    label: "Implementasi",
    shortLabel: "Implementasi",
  },
  {
    id: "performa",
    label: "Performa",
    shortLabel: "Performa",
  },
  {
    id: "instruksi",
    label: "Instruksi untuk asisten",
    shortLabel: "Instruksi",
  },
  {
    id: "eksplorasi",
    label: "Eksplorasi",
    shortLabel: "Eksplorasi",
  },
  {
    id: "pola-kerja",
    label: "Pola kerja dan referensi",
    shortLabel: "Pola kerja",
  },
];

const CATEGORY_MAP = new Map(PROMPT_CATEGORIES.map((cat, index) => [cat.id, { ...cat, index }]));

function cleanText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stripHtml(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract the Markdown body without accessing `item.templateContent` (which
 * throws `TemplateContentPrematureUseError` inside Eleventy 3 `addCollection`
 * callbacks).
 */
function extractMarkdownBody(item) {
  if (typeof item?.rawInput === "string") return item.rawInput.trim();
  if (typeof item?.page?.rawInput === "string") return item.page.rawInput.trim();
  if (typeof item?.inputPath === "string" && fs.existsSync(item.inputPath)) {
    const raw = fs.readFileSync(item.inputPath, "utf8");
    const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
    return (match ? match[1] : raw).trim();
  }
  return "";
}

/**
 * Ensure every prompt detail page has a meta description >= 50 chars for SEO
 * and `scripts/audit-site.mjs`.
 */
export function metaDescriptionForPrompt({ title, description }) {
  const base = cleanText(description) || cleanText(title) || "";
  if (base.length >= 55) return base;
  const suffix = "Koleksi prompt AI dan catatan penggunaan dari Riza Fahmi.";
  return base ? `${base.replace(/[.\s]+$/, "")}. ${suffix}` : suffix;
}

/**
 * Normalize Eleventy collection items from `src/prompts/*.md` into a stable,
 * deterministic list ordered by category and `order`.
 */
export function selectPrompts(collectionItems) {
  if (!Array.isArray(collectionItems)) return [];

  return collectionItems
    .map((item) => {
      const data = item?.data || {};
      if (data.draft) return null;

      const slug = cleanText(data.slug) || cleanText(item?.fileSlug);
      const title = cleanText(data.title);
      if (!slug || !title) return null;

      const categoryId = cleanText(data.category) || "pola-kerja";
      const categoryMeta = CATEGORY_MAP.get(categoryId) || {
        id: categoryId,
        label: categoryId,
        shortLabel: categoryId,
        index: PROMPT_CATEGORIES.length,
      };

      const displayTitle = cleanText(data.displayTitle) || title;
      const description = cleanText(data.description) || title;
      const prompt = cleanText(data.prompt) || "";
      const status = cleanText(data.status) || "Pernah dipakai";
      const attribution = cleanText(data.attribution);
      const sourceUrl = cleanText(data.sourceUrl);
      const sourceLabel = cleanText(data.sourceLabel) || "Sumber asli";
      const relatedArticle = cleanText(data.relatedArticle);
      const relatedArticleTitle = cleanText(data.relatedArticleTitle);
      const keywords = Array.isArray(data.keywords)
        ? data.keywords.map(cleanText).filter(Boolean)
        : [];
      const order = Number.isFinite(Number(data.order)) ? Number(data.order) : 999;
      const rawBody = extractMarkdownBody(item);

      const searchText = [
        title,
        description,
        categoryMeta.label,
        categoryMeta.shortLabel,
        status,
        attribution,
        prompt,
        keywords.join(" "),
        stripHtml(rawBody),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return {
        slug,
        url: `/prompts/${slug}/`,
        rawUrl: `/prompts/${slug}.md`,
        title,
        displayTitle,
        description,
        metaDescription: metaDescriptionForPrompt({ title, description }),
        category: categoryMeta.id,
        categoryLabel: categoryMeta.label,
        categoryShortLabel: categoryMeta.shortLabel,
        categoryIndex: categoryMeta.index,
        status,
        attribution,
        sourceUrl,
        sourceLabel,
        relatedArticle,
        relatedArticleTitle,
        keywords,
        prompt,
        order,
        date: data.date ? new Date(data.date) : null,
        searchText,
        templateContent: rawBody,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.categoryIndex - b.categoryIndex || a.order - b.order || a.slug.localeCompare(b.slug),
    );
}

/**
 * Group normalized prompts into canonical categories for navigation pills and
 * sectioned views. Only categories with at least one published prompt are
 * returned unless `includeEmpty` is set.
 */
export function promptCategories(prompts, { includeEmpty = false } = {}) {
  const list = Array.isArray(prompts) ? prompts : [];
  const byCategory = new Map();

  for (const cat of PROMPT_CATEGORIES) {
    byCategory.set(cat.id, {
      ...cat,
      count: 0,
      items: [],
    });
  }

  for (const item of list) {
    const group = byCategory.get(item.category);
    if (group) {
      group.items.push(item);
      group.count += 1;
    }
  }

  const groups = [...byCategory.values()];
  return includeEmpty ? groups : groups.filter((group) => group.count > 0);
}

/**
 * Previous and next prompts in library order for the detail page footer.
 */
export function promptNeighbors(prompts, currentUrl) {
  if (!Array.isArray(prompts) || !currentUrl) return { previous: null, next: null };
  const index = prompts.findIndex((item) => item.url === currentUrl);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: prompts[index - 1] || null,
    next: prompts[index + 1] || null,
  };
}

/**
 * Format a single prompt entry as clean, self-contained Markdown served at
 * `/prompts/<slug>.md` for AI agents, curl, or clipboard export.
 */
export function renderRawPromptMarkdown(item, siteUrl = "https://rizafahmi.com") {
  if (!item) return "";
  const lines = [
    `# ${item.title}`,
    "",
    `> ${item.description}`,
    "",
    `- Kategori: ${item.categoryLabel}`,
    `- Status: ${item.status}`,
  ];

  if (item.attribution) {
    lines.push(`- Atribusi: ${item.attribution}`);
  }
  if (item.sourceUrl) {
    lines.push(`- ${item.sourceLabel}: ${item.sourceUrl}`);
  }
  if (item.relatedArticle) {
    lines.push(`- Artikel terkait: ${siteUrl}${item.relatedArticle}`);
  }
  lines.push(`- URL Kanonis: ${siteUrl}${item.url}`);

  if (item.prompt) {
    lines.push("", "## Prompt", "", "```text", item.prompt, "```");
  }

  const notes = cleanText(item.templateContent);
  if (notes) {
    lines.push("", "## Catatan & Konteks", "", notes);
  }

  return `${lines.join("\n")}\n`;
}

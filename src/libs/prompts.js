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

/**
 * Default parameter definitions for prompts whose customizable tokens do not
 * use `[bracket]` syntax, ensuring every prompt in the library can be adapted
 * in the <30-second Parameter Workbench while keeping its canonical text intact.
 */
const DEFAULT_PROMPT_VARIABLES = {
  "agent-coordinator-dan-delegasi-sub-agent": [
    {
      token: "Haiku 5.5",
      label: "Model sub-agent hemat",
      placeholder: "mis. Haiku 5.5, Gemini Flash, atau GPT-4o-mini",
    },
    {
      token: "three tasks",
      label: "Jumlah / cakupan sub-tugas",
      placeholder: "mis. three tasks (atau daftar modul)",
    },
  ],
  "blueprint-dan-prompt-bertahap": [
    {
      token: "< SPEC >",
      label: "Isi atau tautan spesifikasi (< SPEC >)",
      placeholder: "Tempel ringkasan spec.md atau @spec.md di sini...",
    },
  ],
  "generator-teks-ke-gambar": [
    {
      token: "Google Nano Banana Model",
      label: "Model / endpoint AI target",
      placeholder: "mis. Imagen 3 / Gemini Flash Image API",
    },
    {
      token: "four different images",
      label: "Jumlah variasi keluaran",
      placeholder: "mis. four different images",
    },
  ],
  "isi-buku-jadi-skills": [
    {
      token: "Napolean Hill's Think and Grow Rich",
      label: "Judul buku atau kerangka metode",
      placeholder: "mis. Atomic Habits oleh James Clear",
    },
  ],
  "kompilasi-diskusi-jadi-spesifikasi": [
    {
      token: "a comprehensive, developer-ready specification",
      label: "Format dokumen keluaran",
      placeholder: "mis. docs/spec.md dengan arsitektur & rencana uji",
    },
  ],
  "rapikan-readme-tanpa-mengarang": [
    {
      token: "this README",
      label: "Berkas / repositori target",
      placeholder: "mis. README.md di repositori ini",
    },
  ],
  "rencana-dari-catatan-diskusi": [
    {
      token: "TODO.md",
      label: "Berkas catatan kasar / bahan diskusi",
      placeholder: "mis. TODO.md atau NOTES.md",
    },
  ],
  "review-dokumen-menyeluruh": [
    {
      token: "@phase-3-tools-and-web.md",
      label: "Berkas dokumen / spesifikasi yang direview",
      placeholder: "mis. @docs/architecture.md",
    },
  ],
  "teknik-menghindari-brainrot": [
    {
      token: "an experienced developer",
      label: "Profil / latar belakang developer",
      placeholder: "mis. an experienced Elixir & TypeScript developer",
    },
  ],
};

/**
 * Curated mapping from prompt slug to verifiable open-source proof-of-work in
 * `src/_data/karya.js`.
 */
const DEFAULT_PROMPT_KARYA = {
  "agent-coordinator-dan-delegasi-sub-agent": {
    name: "pi-jev-task-router",
    repo: "https://github.com/rizafahmi/pi-jev-task-router",
  },
  "blueprint-dan-prompt-bertahap": {
    name: "Balap Kode",
    repo: "https://github.com/rizafahmi/coderacer",
  },
  "generator-teks-ke-gambar": {
    name: "gemini-for-web-dev",
    repo: "https://github.com/rizafahmi/gemini-for-web-dev",
  },
  "isi-buku-jadi-skills": {
    name: "mbb",
    repo: "https://github.com/rizafahmi/mbb",
  },
  "kerangka-prompt-ptr-q": {
    name: "ai-workshop-material",
    repo: "https://github.com/rizafahmi/ai-workshop-material",
  },
  "kompilasi-diskusi-jadi-spesifikasi": {
    name: "notable",
    repo: "https://github.com/rizafahmi/notable",
  },
  "konfirmasi-stream-of-consciousness": {
    name: "samarin",
    repo: "https://github.com/rizafahmi/samarin",
  },
  "periksa-performa-halaman-web": {
    name: "Ngobrolin Web",
    repo: "https://github.com/ngobrolin/landing",
  },
  "rapikan-readme-tanpa-mengarang": {
    name: "workspresso",
    repo: "https://github.com/rizafahmi/workspresso",
  },
  "rencana-dari-catatan-diskusi": {
    name: "makan-dimana",
    repo: "https://github.com/rizafahmi/makan-dimana",
  },
  "review-dokumen-menyeluruh": {
    name: "clawdex",
    repo: "https://github.com/rizafahmi/clawdex",
  },
  "review-kode-konseptual-dan-kompleksitas": {
    name: "evalcode",
    repo: "https://github.com/rizafahmi/evalcode",
  },
  "teknik-menghindari-brainrot": {
    name: "mbb",
    repo: "https://github.com/rizafahmi/mbb",
  },
  "wawancara-spesifikasi-bertahap": {
    name: "slopcase",
    repo: "https://github.com/rizafahmi/slopcase",
  },
};

/**
 * Extract interactive variables from a prompt string (plus optional frontmatter
 * or curated defaults) for the <30-second Parameter Workbench.
 */
export function extractPromptVariables(promptText, customVariables = [], slug = "") {
  const text = typeof promptText === "string" ? promptText : "";
  const seenTokens = new Set();
  const variables = [];

  const addVar = ({ token, label, placeholder }) => {
    const cleanToken = cleanText(token);
    if (!cleanToken || seenTokens.has(cleanToken) || !text.includes(cleanToken)) return;
    seenTokens.add(cleanToken);
    const stripped = cleanToken.replace(/^\[|\]$|^<\s*|\s*>$|@/g, "").trim();
    variables.push({
      key: `var-${variables.length + 1}`,
      token: cleanToken,
      label: cleanText(label) || stripped,
      placeholder: cleanText(placeholder) || stripped,
    });
  };

  if (Array.isArray(customVariables)) {
    for (const v of customVariables) {
      if (v && typeof v === "object") addVar(v);
    }
  }

  // Auto-detect [variable] tokens that are not section headers like `[Persona]:`
  for (const match of text.matchAll(/\[([^\]\n]{1,70})\](?!:)/g)) {
    addVar({
      token: match[0],
      label: match[1].trim(),
      placeholder: match[1].trim(),
    });
  }

  // Auto-detect < SPEC > style angle-bracket placeholders
  for (const match of text.matchAll(/<\s*([A-Z_]{2,24})\s*>/g)) {
    addVar({
      token: match[0],
      label: match[1].trim(),
      placeholder: `Isi ${match[1].trim()}...`,
    });
  }

  // Auto-detect @file.md references
  for (const match of text.matchAll(/(@[a-zA-Z0-9_./-]+\.md)/g)) {
    addVar({
      token: match[1],
      label: "Berkas dokumen target",
      placeholder: match[1],
    });
  }

  if (slug && DEFAULT_PROMPT_VARIABLES[slug]) {
    for (const preset of DEFAULT_PROMPT_VARIABLES[slug]) {
      addVar(preset);
    }
  }

  return variables;
}

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

      const variables = extractPromptVariables(prompt, data.variables, slug);
      const karyaMeta = DEFAULT_PROMPT_KARYA[slug] || null;
      const relatedKarya = cleanText(data.relatedKarya) || karyaMeta?.name || null;
      const relatedKaryaUrl = cleanText(data.relatedKaryaUrl) || karyaMeta?.repo || null;
      const skillUrl = `/skills/${slug}/SKILL.md`;
      const installCommand = `mkdir -p .agents/skills/${slug} && curl -fsSL https://rizafahmi.com${skillUrl} -o .agents/skills/${slug}/SKILL.md`;

      return {
        slug,
        url: `/prompts/${slug}/`,
        rawUrl: `/prompts/${slug}.md`,
        skillUrl,
        installCommand,
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
        relatedKarya,
        relatedKaryaUrl,
        keywords,
        variables,
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
  const skillUrl = item.skillUrl || `/skills/${item.slug}/SKILL.md`;
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
  if (item.relatedKarya && item.relatedKaryaUrl) {
    lines.push(`- Bukti Karya (Repo): ${item.relatedKarya} (${item.relatedKaryaUrl})`);
  }
  lines.push(`- Agent Skill (SKILL.md): ${siteUrl}${skillUrl}`);
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

/**
 * Format a single prompt/workflow entry as a structured Agent Skill (`SKILL.md`)
 * served at `/skills/<slug>/SKILL.md` so coding agents (Claude Code, Cursor,
 * Antigravity, Amp, Pi) can pull it directly into `.agents/skills/<slug>/SKILL.md`.
 */
export function renderSkillMarkdown(item, siteUrl = "https://rizafahmi.com") {
  if (!item) return "";
  const safeDesc = (item.description || item.title || "").replace(/"/g, '\\"');
  const lines = [
    "---",
    `name: ${item.slug}`,
    `description: "${safeDesc}"`,
    `category: ${item.category}`,
    `status: "${(item.status || "").replace(/"/g, '\\"')}"`,
    `source: ${siteUrl}${item.url}`,
    `raw_prompt: ${siteUrl}${item.rawUrl}`,
    "---",
    "",
    `# ${item.title}`,
    "",
    `> ${item.description}`,
    "",
    "## When to Activate",
    "",
    `- **Category:** ${item.categoryLabel}`,
    `- **Status:** ${item.status}`,
    `- **Use Case:** ${item.description}`,
  ];

  if (Array.isArray(item.keywords) && item.keywords.length > 0) {
    lines.push(`- **Keywords:** ${item.keywords.join(", ")}`);
  }

  if (item.prompt) {
    lines.push("", "## Executable Prompt / Instructions", "", "```text", item.prompt, "```");
  }

  if (Array.isArray(item.variables) && item.variables.length > 0) {
    lines.push("", "## Customizable Parameters", "");
    for (const v of item.variables) {
      lines.push(`- \`${v.token}\` — **${v.label}** (contoh: *${v.placeholder}*)`);
    }
  }

  const notes = cleanText(item.templateContent);
  if (notes) {
    lines.push("", "## Field Notes & Execution Context", "", notes);
  }

  lines.push("", "## Provenance & Proof of Work", "");
  if (item.attribution) {
    lines.push(`- **Attribution:** ${item.attribution}`);
  }
  if (item.sourceUrl) {
    lines.push(`- **${item.sourceLabel || "Source"}:** ${item.sourceUrl}`);
  }
  if (item.relatedArticle) {
    lines.push(
      `- **Deep-Dive Article:** [${item.relatedArticleTitle || item.relatedArticle}](${siteUrl}${item.relatedArticle})`,
    );
  }
  if (item.relatedKarya && item.relatedKaryaUrl) {
    lines.push(`- **Proof-of-Work Repository:** [${item.relatedKarya}](${item.relatedKaryaUrl})`);
  }
  lines.push(`- **Interactive Workbench:** ${siteUrl}${item.url}`);

  return `${lines.join("\n")}\n`;
}

/**
 * Build a machine-readable JSON manifest of all agent skills served at
 * `/skills/index.json` for automated discovery by AI agents and CLI tools.
 */
export function buildSkillsManifest(prompts, siteUrl = "https://rizafahmi.com") {
  const list = Array.isArray(prompts) ? prompts : [];
  return {
    schemaVersion: "1.0",
    name: "rizafahmi-agent-skills",
    author: "Riza Fahmi",
    siteUrl,
    skillsHubUrl: `${siteUrl}/skills/`,
    promptsLibraryUrl: `${siteUrl}/prompts/`,
    count: list.length,
    skills: list.map((item) => ({
      name: item.slug,
      title: item.title,
      category: item.category,
      categoryLabel: item.categoryLabel,
      status: item.status,
      description: item.description,
      keywords: item.keywords || [],
      variables: (item.variables || []).map((v) => ({
        token: v.token,
        label: v.label,
        placeholder: v.placeholder,
      })),
      url: `${siteUrl}${item.url}`,
      rawPromptUrl: `${siteUrl}${item.rawUrl}`,
      skillUrl: `${siteUrl}${item.skillUrl}`,
      installCommand: item.installCommand,
      relatedArticle: item.relatedArticle ? `${siteUrl}${item.relatedArticle}` : null,
      relatedKarya:
        item.relatedKarya && item.relatedKaryaUrl
          ? { name: item.relatedKarya, repo: item.relatedKaryaUrl }
          : null,
    })),
  };
}

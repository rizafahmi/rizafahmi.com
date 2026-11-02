/**
 * Helpers for the Executable Workbench & Verifiable Proof-of-Work Gallery:
 * - Connects articles (`/catatan/<slug>/`) bidirectionally to executable prompts,
 *   agent skills (`/skills/<slug>/SKILL.md`), and open-source repositories (`karya.js`).
 * - Renders the raw Markdown endpoint `/catatan/<slug>.md` for AI agents and CLI tools.
 */

import fs from "node:fs";

const HIDDEN_TAGS = new Set(["all", "nav", "post", "catatan"]);

/**
 * Curated mappings from article URL to prompt slugs so readers on key articles
 * immediately get the matching executable prompt/skill in <30 seconds.
 */
const ARTICLE_PROMPT_SLUGS = {
  "/catatan/asisten-ngoding/": [
    "wawancara-spesifikasi-bertahap",
    "blueprint-dan-prompt-bertahap",
    "teknik-menghindari-brainrot",
  ],
  "/catatan/asisten-ngoding-2/": [
    "wawancara-spesifikasi-bertahap",
    "kompilasi-diskusi-jadi-spesifikasi",
    "konfirmasi-stream-of-consciousness",
  ],
  "/catatan/asisten-ngoding-3/": [
    "blueprint-dan-prompt-bertahap",
    "rencana-dari-catatan-diskusi",
    "review-dokumen-menyeluruh",
  ],
  "/catatan/asisten-ngoding-4/": [
    "kerangka-prompt-ptr-q",
    "periksa-performa-halaman-web",
    "wawancara-spesifikasi-bertahap",
  ],
  "/catatan/asisten-ngoding-5/": [
    "review-kode-konseptual-dan-kompleksitas",
    "teknik-menghindari-brainrot",
    "agent-coordinator-dan-delegasi-sub-agent",
  ],
  "/catatan/agentic-coding/": [
    "agent-coordinator-dan-delegasi-sub-agent",
    "kerangka-prompt-ptr-q",
    "rencana-dari-catatan-diskusi",
  ],
  "/catatan/agentic-coding-bag-2/": [
    "kerangka-prompt-ptr-q",
    "review-kode-konseptual-dan-kompleksitas",
    "agent-coordinator-dan-delegasi-sub-agent",
  ],
  "/catatan/agentic-coding-bag-3/": [
    "agent-coordinator-dan-delegasi-sub-agent",
    "review-dokumen-menyeluruh",
    "review-kode-konseptual-dan-kompleksitas",
  ],
  "/catatan/membangun-permainan-balap-kode-dgn-ai/": [
    "blueprint-dan-prompt-bertahap",
    "wawancara-spesifikasi-bertahap",
    "review-kode-konseptual-dan-kompleksitas",
  ],
  "/catatan/gemini/": ["generator-teks-ke-gambar", "kerangka-prompt-ptr-q"],
  "/gemini-web-dev/": ["generator-teks-ke-gambar", "kerangka-prompt-ptr-q"],
  "/catatan/gemini-3-review/": ["review-dokumen-menyeluruh", "periksa-performa-halaman-web"],
  "/catatan/notebooklm/": ["isi-buku-jadi-skills", "konfirmasi-stream-of-consciousness"],
  "/catatan/rangkuman-buku-how-to-write-a-book/": ["isi-buku-jadi-skills"],
  "/rangkuman-how-to-write-a-book/": ["isi-buku-jadi-skills"],
  "/catatan/panduan-menulis/": [
    "konfirmasi-stream-of-consciousness",
    "rapikan-readme-tanpa-mengarang",
  ],
  "/panduan-menulis/": ["konfirmasi-stream-of-consciousness", "rapikan-readme-tanpa-mengarang"],
  "/catatan/aplikasi-web/": ["periksa-performa-halaman-web", "rapikan-readme-tanpa-mengarang"],
  "/tampilan-web/": ["periksa-performa-halaman-web", "rapikan-readme-tanpa-mengarang"],
  "/catatan/ekosistemjs/": ["periksa-performa-halaman-web"],
  "/2020/02/03/ekosistemjs/": ["periksa-performa-halaman-web"],
  "/catatan/memahami-beam/": [
    "review-dokumen-menyeluruh",
    "review-kode-konseptual-dan-kompleksitas",
  ],
  "/2019/04/29/memahami-beam/": [
    "review-dokumen-menyeluruh",
    "review-kode-konseptual-dan-kompleksitas",
  ],
  "/catatan/bahasa-fungsional-elixir/": [
    "review-kode-konseptual-dan-kompleksitas",
    "teknik-menghindari-brainrot",
  ],
  "/catatan/paradigma-fungsional-elixir/": [
    "review-kode-konseptual-dan-kompleksitas",
    "teknik-menghindari-brainrot",
  ],
};

function cleanText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTags(tags) {
  if (!tags) return [];
  const raw = typeof tags === "string" ? [tags] : Array.isArray(tags) ? tags : [];
  return raw.map((t) => cleanText(String(t))).filter((t) => t && !HIDDEN_TAGS.has(t));
}

function extractArticleRawMarkdown(post) {
  if (typeof post?.rawInput === "string") return post.rawInput.trim();
  if (typeof post?.page?.rawInput === "string") return post.page.rawInput.trim();
  const inputPath = post?.inputPath || post?.page?.inputPath;
  if (typeof inputPath === "string" && fs.existsSync(inputPath)) {
    const raw = fs.readFileSync(inputPath, "utf8");
    const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
    return (match ? match[1] : raw).trim();
  }
  return cleanText(post?.content) || "";
}

/**
 * Compute connected executable prompts/skills and verifiable open-source
 * projects (`karya`) for a given article.
 */
export function workbenchForArticle(
  article,
  { prompts = [], karyaProjects = [], promptLimit = 3, karyaLimit = 2 } = {},
) {
  if (!article) return { prompts: [], karya: [] };

  const url = cleanText(article.url) || cleanText(article.page?.url) || "";
  const tags = new Set(
    normalizeTags(article.tags || article.data?.tags).map((t) => t.toLowerCase()),
  );
  const bodyLower = (
    cleanText(article.content) ||
    extractArticleRawMarkdown(article) ||
    ""
  ).toLowerCase();

  const promptBySlug = new Map((Array.isArray(prompts) ? prompts : []).map((p) => [p.slug, p]));
  const matchedPrompts = [];
  const seenPromptSlugs = new Set();

  const addPrompt = (item) => {
    if (!item?.slug || seenPromptSlugs.has(item.slug)) return;
    if (matchedPrompts.length >= promptLimit) return;
    seenPromptSlugs.add(item.slug);
    matchedPrompts.push(item);
  };

  // 1. Direct `relatedArticle` match from prompt frontmatter
  for (const p of Array.isArray(prompts) ? prompts : []) {
    if (url && p.relatedArticle === url) {
      addPrompt(p);
    }
  }

  // 2. Curated article -> prompt slug map
  if (url && ARTICLE_PROMPT_SLUGS[url]) {
    for (const slug of ARTICLE_PROMPT_SLUGS[url]) {
      addPrompt(promptBySlug.get(slug));
    }
  }

  // 3. Topic/tag-based fallback so AI, Elixir, Web, and Productivity articles
  //    always offer a relevant executable mental model
  if (matchedPrompts.length < promptLimit) {
    if (tags.has("ai") || tags.has("agentic-coding") || tags.has("machine-learning")) {
      addPrompt(promptBySlug.get("kerangka-prompt-ptr-q"));
      addPrompt(promptBySlug.get("wawancara-spesifikasi-bertahap"));
      addPrompt(promptBySlug.get("agent-coordinator-dan-delegasi-sub-agent"));
    }
    if (tags.has("elixir") || tags.has("beam") || tags.has("otp") || tags.has("phoenix")) {
      addPrompt(promptBySlug.get("review-kode-konseptual-dan-kompleksitas"));
      addPrompt(promptBySlug.get("teknik-menghindari-brainrot"));
    }
    if (tags.has("web") || tags.has("javascript") || tags.has("frontend")) {
      addPrompt(promptBySlug.get("periksa-performa-halaman-web"));
      addPrompt(promptBySlug.get("review-kode-konseptual-dan-kompleksitas"));
    }
    if (tags.has("menulis") || tags.has("buku") || tags.has("produktivitas")) {
      addPrompt(promptBySlug.get("konfirmasi-stream-of-consciousness"));
      addPrompt(promptBySlug.get("isi-buku-jadi-skills"));
    }
  }

  // --- Match Karya Proof-of-Work repositories ---
  const projectList = Array.isArray(karyaProjects) ? karyaProjects : [];
  const matchedKarya = [];
  const seenKaryaNames = new Set();

  const addKarya = (project) => {
    if (!project?.name || seenKaryaNames.has(project.name)) return;
    if (matchedKarya.length >= karyaLimit) return;
    seenKaryaNames.add(project.name);
    matchedKarya.push(project);
  };

  // 1. Direct `relatedArticle` match on karya entry
  for (const project of projectList) {
    if (url && project.relatedArticle === url) {
      addKarya(project);
    }
  }

  // 2. Mention of repo URL or project name in article body
  for (const project of projectList) {
    if (matchedKarya.length >= karyaLimit) break;
    const repoMatch = project.repo && bodyLower.includes(project.repo.toLowerCase());
    const nameMatch = project.name.length >= 4 && bodyLower.includes(project.name.toLowerCase());
    if (repoMatch || nameMatch) {
      addKarya(project);
    }
  }

  // 3. Topic/tag-based proof-of-work fallback
  if (matchedKarya.length < karyaLimit) {
    for (const project of projectList) {
      const pTags = (project.tags || []).map((t) => t.toLowerCase());
      if (
        (tags.has("elixir") || tags.has("beam") || tags.has("otp") || tags.has("phoenix")) &&
        pTags.includes("elixir")
      ) {
        addKarya(project);
      } else if (
        (tags.has("ai") || tags.has("agentic-coding") || tags.has("gemini")) &&
        (pTags.includes("llm") ||
          pTags.includes("ai") ||
          pTags.includes("gemini api") ||
          pTags.includes("anthropic") ||
          pTags.includes("llm eval"))
      ) {
        addKarya(project);
      } else if (
        (tags.has("web") || tags.has("javascript")) &&
        (pTags.includes("astro") || pTags.includes("typescript") || pTags.includes("node.js"))
      ) {
        addKarya(project);
      }
    }
  }

  return {
    prompts: matchedPrompts,
    karya: matchedKarya,
  };
}

/**
 * Format a published article as clean, self-contained Markdown served at
 * `/catatan/<slug>.md` for AI agents, LLMs, and CLI pipelines.
 */
export function renderRawArticleMarkdown(
  post,
  { prompts = [], karyaProjects = [], siteUrl = "https://rizafahmi.com" } = {},
) {
  if (!post) return "";
  const data = post.data || post;
  const slug = cleanText(post.fileSlug) || cleanText(data.slug) || "";
  const url = cleanText(post.url) || (slug ? `/catatan/${slug}/` : "/");
  const rawUrl = slug ? `/catatan/${slug}.md` : `${url.replace(/\/$/, "")}.md`;
  const title = cleanText(data.title) || slug;
  const description = cleanText(data.description) || title;
  const dateObj = data.date || post.date;
  const dateIso =
    dateObj && !Number.isNaN(new Date(dateObj).getTime())
      ? new Date(dateObj).toISOString().split("T")[0]
      : "";
  const tags = normalizeTags(data.tags);
  const rawBody = extractArticleRawMarkdown(post);

  const wb = workbenchForArticle({ url, tags, content: rawBody }, { prompts, karyaProjects });

  const lines = [
    "---",
    `title: "${title.replace(/"/g, '\\"')}"`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    `canonical_url: ${siteUrl}${url}`,
    `raw_markdown_url: ${siteUrl}${rawUrl}`,
  ];
  if (dateIso) lines.push(`published: ${dateIso}`);
  if (tags.length > 0) lines.push(`tags: [${tags.map((t) => `"${t}"`).join(", ")}]`);
  lines.push("---", "", `# ${title}`, "", `> ${description}`, "");

  lines.push(`- **URL Kanonis:** ${siteUrl}${url}`);
  if (dateIso) lines.push(`- **Diterbitkan:** ${dateIso}`);
  if (tags.length > 0) lines.push(`- **Topik:** ${tags.join(", ")}`);

  if (wb.prompts.length > 0 || wb.karya.length > 0) {
    lines.push("", "## Executable Workbench & Proof of Work");
    if (wb.prompts.length > 0) {
      lines.push("", "### Agent Skills & Prompts Terkait");
      for (const p of wb.prompts) {
        lines.push(
          `- **[${p.title}](${siteUrl}${p.url})** — Skill: \`${siteUrl}${p.skillUrl}\` | Raw: \`${siteUrl}${p.rawUrl}\``,
        );
      }
    }
    if (wb.karya.length > 0) {
      lines.push("", "### Bukti Karya (Open Source Repositories)");
      for (const k of wb.karya) {
        const qs = k.quickstart ? ` — Quickstart: \`${k.quickstart}\`` : "";
        lines.push(`- **[${k.name}](${k.repo})**: ${k.description}${qs}`);
      }
    }
  }

  if (rawBody) {
    lines.push("", "## Isi Catatan", "", rawBody);
  }

  return `${lines.join("\n")}\n`;
}

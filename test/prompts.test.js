import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PROMPT_CATEGORIES,
  promptCategories,
  promptNeighbors,
  renderRawPromptMarkdown,
  selectPrompts,
} from "../src/libs/prompts.js";

const PROMPTS_DIR = "src/prompts";
const promptFiles = readdirSync(PROMPTS_DIR).filter((file) => file.endsWith(".md"));

function parsePromptFile(file) {
  const fullPath = path.join(PROMPTS_DIR, file);
  const raw = readFileSync(fullPath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  assert.ok(match, `${fullPath} is missing frontmatter`);
  const [, fm, body] = match;

  const get = (key) => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
    return line ? line.replace(/^["']|["']$/g, "") : "";
  };

  const promptMatch = fm.match(/^prompt:\s*\|\r?\n((?: {2}.*\r?\n?)+)/m);
  const prompt = promptMatch
    ? promptMatch[1]
        .split(/\r?\n/)
        .map((line) => line.replace(/^ {2}/, ""))
        .join("\n")
        .trim()
    : "";

  return {
    fileSlug: path.basename(file, ".md"),
    data: {
      title: get("title"),
      displayTitle: get("displayTitle") || undefined,
      slug: get("slug"),
      category: get("category"),
      status: get("status"),
      attribution: get("attribution"),
      sourceUrl: get("sourceUrl"),
      sourceLabel: get("sourceLabel"),
      relatedArticle: get("relatedArticle"),
      relatedArticleTitle: get("relatedArticleTitle"),
      description: get("description"),
      order: Number(get("order") || 99),
      date: get("date"),
      prompt,
    },
    rawInput: body.trim(),
    inputPath: fullPath,
  };
}

const rawItems = promptFiles.map(parsePromptFile);
const normalized = selectPrompts(rawItems);

test("the prompt library lives in src/prompts/*.md and groups saved material by use, not date", () => {
  assert.ok(
    promptFiles.length >= 14,
    `expected at least 14 prompt files, found ${promptFiles.length}`,
  );

  const categories = promptCategories(normalized);
  const categoryIds = categories.map((cat) => cat.id);

  for (const expected of [
    "perencanaan",
    "review",
    "implementasi",
    "performa",
    "instruksi",
    "eksplorasi",
    "pola-kerja",
  ]) {
    assert.ok(categoryIds.includes(expected), `missing category ${expected}`);
  }

  // Commented-out ide-dan-desain entries remain skipped, while the taxonomy still supports the category
  assert.ok(PROMPT_CATEGORIES.some((cat) => cat.id === "ide-dan-desain"));

  for (const item of normalized) {
    assert.ok(item.title.length > 0, `${item.slug} is missing title`);
    assert.ok(
      item.description.length >= 50,
      `${item.slug} has a short description: ${item.description}`,
    );
    assert.ok(item.prompt.length > 0, `${item.slug} is missing copyable prompt text`);
    assert.doesNotMatch(item.title, /^\d{2}-\d{2}-\d{4}/);
  }
});

test("the prompt library preserves attribution, usage notes, and cross-pollinated Asisten Ngoding prompts", () => {
  const allContent = normalized
    .map((item) => `${item.title} ${item.attribution} ${item.sourceLabel} ${item.templateContent}`)
    .join("\n");

  assert.match(allContent, /Rob Conery/);
  assert.match(allContent, /Ankur Sethi/);
  assert.match(allContent, /Harper Reed/);
  assert.match(allContent, /Sumber asli/);
  assert.match(allContent, /Hasil yang dicatat/);

  const relatedSlugs = normalized.filter((item) => item.relatedArticle).map((item) => item.slug);
  assert.deepEqual(relatedSlugs.sort(), [
    "blueprint-dan-prompt-bertahap",
    "kompilasi-diskusi-jadi-spesifikasi",
    "wawancara-spesifikasi-bertahap",
  ]);
});

test("promptNeighbors and renderRawPromptMarkdown produce valid navigation and agent-ready markdown", () => {
  const first = normalized[0];
  const second = normalized[1];

  const firstNeighbors = promptNeighbors(normalized, first.url);
  assert.equal(firstNeighbors.previous, null);
  assert.equal(firstNeighbors.next?.slug, second.slug);

  const md = renderRawPromptMarkdown(first, "https://rizafahmi.com");
  assert.match(md, new RegExp(`^# ${first.title}`, "m"));
  assert.match(md, /## Prompt\n\n```text\n/);
  assert.match(md, new RegExp(`URL Kanonis: https://rizafahmi\\.com${first.url}`));
});

test("built /prompts/ index, detail pages, raw .md endpoints, and redirects are searchable and complete", {
  skip: !existsSync("dist/prompts/index.html") && "no dist/ - run pnpm run build",
}, () => {
  const indexHtml = readFileSync("dist/prompts/index.html", "utf8");
  assert.match(indexHtml, /data-pagefind-body/);
  assert.match(indexHtml, /data-prompt-search/);
  assert.match(indexHtml, /class="prompt-card-link"/);
  assert.match(indexHtml, /class="prompt-card-copy"[\s\S]*?Salin/);
  assert.match(indexHtml, /Teknik Menghindari <em>brainrot<\/em>/);
  assert.match(indexHtml, /You are a senior PM that is an expert with GitHub/);
  assert.match(
    indexHtml,
    /Napolean Hill&#39;s Think and Grow Rich|Napolean Hill's Think and Grow Rich/,
  );

  for (const item of normalized) {
    const detailPath = path.join("dist", "prompts", item.slug, "index.html");
    assert.ok(existsSync(detailPath), `missing detail page ${detailPath}`);
    const detailHtml = readFileSync(detailPath, "utf8");
    assert.match(detailHtml, /data-pagefind-body/);
    assert.match(detailHtml, /data-copy-target="prompt-primary-code"/);
    assert.match(detailHtml, new RegExp(`href="/prompts/${item.slug}\\.md"`));

    const rawMdPath = path.join("dist", "prompts", `${item.slug}.md`);
    assert.ok(existsSync(rawMdPath), `missing raw markdown endpoint ${rawMdPath}`);
    const rawMd = readFileSync(rawMdPath, "utf8");
    assert.match(rawMd, /## Prompt/);
  }

  const redirects = readFileSync("dist/_redirects", "utf8");
  assert.match(redirects, /^\/prompt-journal \/prompts\/ 301$/m);
});

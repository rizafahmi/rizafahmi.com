import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { interpolatePromptTemplate } from "../assets/prompts.js";
import karya from "../src/_data/karya.js";
import { selectProjects } from "../src/libs/karya.js";
import {
  buildSkillsManifest,
  extractPromptVariables,
  renderSkillMarkdown,
  selectPrompts,
} from "../src/libs/prompts.js";
import { renderRawArticleMarkdown, workbenchForArticle } from "../src/libs/workbench.js";

test("extractPromptVariables detects bracket, angle-bracket, @file, and preset parameters", () => {
  const ptrVars = extractPromptVariables(
    "[Persona]: You are a [peran dan keahlian spesifik].\n[Task]: Please examine [target berkas/masalah].",
    [],
    "kerangka-prompt-ptr-q",
  );
  assert.deepEqual(
    ptrVars.map((v) => v.token),
    ["[peran dan keahlian spesifik]", "[target berkas/masalah]"],
  );

  const specVars = extractPromptVariables(
    "Separate each prompt.\n< SPEC >",
    [],
    "blueprint-dan-prompt-bertahap",
  );
  assert.equal(specVars.length, 1);
  assert.equal(specVars[0].token, "< SPEC >");

  const docVars = extractPromptVariables(
    "Please do check and review @phase-3-tools-and-web.md check for flaws.",
    [],
    "review-dokumen-menyeluruh",
  );
  assert.equal(docVars.length, 1);
  assert.equal(docVars[0].token, "@phase-3-tools-and-web.md");
});

test("interpolatePromptTemplate live-updates tokens and leaves blank inputs untouched", () => {
  const template = "You are a [peran]. Please review [berkas] in [language].";
  const updated = interpolatePromptTemplate(template, {
    "[peran]": "Senior BEAM Architect",
    "[berkas]": "",
    "[language]": "Elixir",
  });
  assert.equal(updated, "You are a Senior BEAM Architect. Please review [berkas] in Elixir.");
});

test("renderSkillMarkdown and buildSkillsManifest produce structured Agent Skills and JSON manifest", () => {
  const sampleItems = selectPrompts([
    {
      fileSlug: "review-kode-konseptual-dan-kompleksitas",
      data: {
        title: "Review kode untuk masalah konseptual dan kompleksitas",
        slug: "review-kode-konseptual-dan-kompleksitas",
        category: "review",
        status: "Pernah dipakai",
        description:
          "Memeriksa basis kode untuk menemukan dead code, kesalahan konseptual halus, dan abstraksi berlebihan.",
        keywords: ["code-review", "refactoring"],
        prompt: "Please review all codes for idiomatic [language] code",
      },
      rawInput: "**Konteks:** Dipakai saat audit PR.",
    },
  ]);

  assert.equal(sampleItems.length, 1);
  const item = sampleItems[0];
  assert.equal(item.skillUrl, "/skills/review-kode-konseptual-dan-kompleksitas/SKILL.md");
  assert.equal(item.variables.length, 1);
  assert.equal(item.variables[0].token, "[language]");
  assert.equal(item.relatedKarya, "evalcode");

  const skillMd = renderSkillMarkdown(item, "https://rizafahmi.com");
  assert.match(skillMd, /^---\nname: review-kode-konseptual-dan-kompleksitas\n/m);
  assert.match(skillMd, /## When to Activate/);
  assert.match(skillMd, /## Executable Prompt \/ Instructions/);
  assert.match(skillMd, /## Customizable Parameters/);
  assert.match(skillMd, /`\[language\]`/);
  assert.match(skillMd, /## Provenance & Proof of Work/);
  assert.match(skillMd, /evalcode/);

  const manifest = buildSkillsManifest(sampleItems, "https://rizafahmi.com");
  assert.equal(manifest.schemaVersion, "1.0");
  assert.equal(manifest.count, 1);
  assert.equal(
    manifest.skills[0].skillUrl,
    "https://rizafahmi.com/skills/review-kode-konseptual-dan-kompleksitas/SKILL.md",
  );
  assert.match(manifest.skills[0].installCommand, /\.agents\/skills\//);
});

test("every curated project in karya.js carries verifiable proof-of-work and a <30s quickstart", () => {
  const projects = selectProjects(karya);
  assert.ok(projects.length >= 14);

  for (const project of projects) {
    assert.ok(
      project.proof && project.proof.length >= 20,
      `"${project.name}" is missing an engineering proof statement`,
    );
    assert.ok(
      project.quickstart && project.quickstart.length >= 15,
      `"${project.name}" is missing a <30s CLI quickstart command`,
    );
    assert.ok(
      project.relatedArticle?.startsWith("/"),
      `"${project.name}" is missing a relatedArticle link`,
    );
  }
});

test("workbenchForArticle and renderRawArticleMarkdown connect articles to prompts and karya", () => {
  const projects = selectProjects(karya);
  const prompts = selectPrompts([
    {
      fileSlug: "wawancara-spesifikasi-bertahap",
      data: {
        title: "Wawancara spesifikasi aplikasi satu pertanyaan per langkah",
        slug: "wawancara-spesifikasi-bertahap",
        category: "perencanaan",
        relatedArticle: "/catatan/asisten-ngoding-2/",
        description:
          "Meminta AI menggali ide aplikasi secara terstruktur lewat wawancara satu pertanyaan per langkah.",
        prompt: "Ask me one question at a time: [jelaskan ide aplikasi secara singkat]",
      },
      rawInput: "Catatan penggunaan.",
    },
  ]);

  const post = {
    fileSlug: "asisten-ngoding-2",
    url: "/catatan/asisten-ngoding-2/",
    data: {
      title: "Diskusi dan Menulis Spesifikasi dengan AI",
      description: "Panduan menyusun spesifikasi aplikasi bersama asisten AI sebelum menulis kode.",
      date: "2025-06-13",
      tags: ["catatan", "ai", "agentic-coding", "spesifikasi"],
    },
    rawInput: "Isi artikel tentang spesifikasi dan notable.",
  };

  const wb = workbenchForArticle(
    { url: post.url, tags: post.data.tags, content: post.rawInput },
    { prompts, karyaProjects: projects },
  );
  assert.ok(wb.prompts.length >= 1);
  assert.equal(wb.prompts[0].slug, "wawancara-spesifikasi-bertahap");
  assert.ok(wb.karya.some((k) => k.name === "notable"));

  const rawMd = renderRawArticleMarkdown(post, {
    prompts,
    karyaProjects: projects,
    siteUrl: "https://rizafahmi.com",
  });
  assert.match(rawMd, /^---\ntitle: "Diskusi dan Menulis Spesifikasi dengan AI"/m);
  assert.match(rawMd, /raw_markdown_url: https:\/\/rizafahmi\.com\/catatan\/asisten-ngoding-2\.md/);
  assert.match(rawMd, /## Executable Workbench & Proof of Work/);
  assert.match(rawMd, /\/skills\/wawancara-spesifikasi-bertahap\/SKILL\.md/);
  assert.match(rawMd, /notable/);
  assert.match(rawMd, /## Isi Catatan/);
});

test("built dist/ contains /skills/, /skills/index.json, SKILL.md files, and /catatan/<slug>.md endpoints", {
  skip: !existsSync("dist/skills/index.json") && "no dist/ — run pnpm run build",
}, () => {
  const skillsHtml = readFileSync("dist/skills/index.html", "utf8");
  assert.match(skillsHtml, /data-pagefind-body/);
  assert.match(skillsHtml, /\/skills\/index\.json/);

  const manifest = JSON.parse(readFileSync("dist/skills/index.json", "utf8"));
  assert.ok(manifest.count >= 14);

  for (const skill of manifest.skills) {
    const skillPath = path.join("dist", "skills", skill.name, "SKILL.md");
    assert.ok(existsSync(skillPath), `missing built ${skillPath}`);
    const content = readFileSync(skillPath, "utf8");
    assert.match(content, new RegExp(`^name: ${skill.name}$`, "m"));
  }

  const rawArticlePath = path.join("dist", "catatan", "agentic-coding-bag-3.md");
  assert.ok(existsSync(rawArticlePath), `missing built ${rawArticlePath}`);
  const rawArticle = readFileSync(rawArticlePath, "utf8");
  assert.match(rawArticle, /## Executable Workbench & Proof of Work/);
  assert.match(rawArticle, /https:\/\/github\.com\/rizafahmi\/mbb/);
});

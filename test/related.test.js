import assert from "node:assert/strict";
import test from "node:test";

import {
  __test,
  getRelatedPosts,
  getRelatedProjects,
  getRelatedPrompts,
  getRelatedTips,
} from "../src/libs/related.js";

function mkItem({ url, title, tags = [], date, templateContent = "" }) {
  return {
    url,
    templateContent,
    data: { title, tags, date },
  };
}

test("tokenize strips html + stopwords", () => {
  const tokens = __test.tokenize("<p>Ini adalah The test, untuk kamu!</p>");
  assert.deepEqual(tokens, ["adalah", "test"]);
});

test("prefers shared tags when available", () => {
  const collection = [
    mkItem({
      url: "/a/",
      title: "A",
      tags: ["catatan", "js"],
      date: "2024-01-01",
      templateContent: "Belajar JavaScript dasar",
    }),
    mkItem({
      url: "/b/",
      title: "B",
      tags: ["catatan", "js", "web"],
      date: "2024-02-01",
      templateContent: "JavaScript untuk web",
    }),
    mkItem({
      url: "/c/",
      title: "C",
      tags: ["catatan", "go"],
      date: "2024-03-01",
      templateContent: "Golang concurrency",
    }),
  ];

  const current = { url: "/a/", tags: ["js"], title: "Belajar JS", content: "Dasar JavaScript" };
  const [first] = getRelatedPosts(collection, current, { limit: 1 });
  assert.equal(first.url, "/b/");
});

test("falls back to similarity when no shared tags", () => {
  const collection = [
    mkItem({
      url: "/a/",
      title: "A",
      tags: ["catatan", "js"],
      date: "2024-01-01",
      templateContent: "Belajar JavaScript dasar",
    }),
    mkItem({
      url: "/b/",
      title: "B",
      tags: ["catatan", "go"],
      date: "2024-02-01",
      templateContent: "JavaScript tips and tricks",
    }),
    mkItem({
      url: "/c/",
      title: "C",
      tags: ["catatan", "python"],
      date: "2024-03-01",
      templateContent: "Python data analysis",
    }),
  ];

  const current = { url: "/a/", tags: ["js"], title: "JavaScript tips", content: "" };

  // Hide 'js' so that there are zero shared tags, forcing similarity fallback.
  const [first] = getRelatedPosts(collection, current, {
    limit: 1,
    hiddenTags: new Set(["all", "nav", "post", "catatan", "js"]),
  });

  assert.equal(first.url, "/b/");
});

test("deterministic tie-breakers: date then url", () => {
  const collection = [
    mkItem({
      url: "/current/",
      title: "Current",
      tags: ["catatan", "web"],
      date: "2024-01-01",
      templateContent: "web",
    }),
    mkItem({
      url: "/same-1/",
      title: "Same",
      tags: ["catatan", "web"],
      date: "2024-02-01",
      templateContent: "web",
    }),
    mkItem({
      url: "/same-0/",
      title: "Same",
      tags: ["catatan", "web"],
      date: "2024-02-01",
      templateContent: "web",
    }),
  ];

  const related = getRelatedPosts(
    collection,
    { url: "/current/", tags: ["web"], title: "web", content: "web" },
    { limit: 2 },
  );
  assert.deepEqual(
    related.map((i) => i.url),
    ["/same-0/", "/same-1/"],
  );
});

test("getRelatedPosts supports excludeUrl and onlyRelevant filtering for cross-format callers", () => {
  const collection = [
    mkItem({
      url: "/catatan/asisten-ngoding-2/",
      title: "Diskusi dan Menulis Spesifikasi dengan AI",
      tags: ["catatan", "ai", "spesifikasi"],
      date: "2025-01-01",
      templateContent: "Wawancara spesifikasi bertahap",
    }),
    mkItem({
      url: "/catatan/asisten-ngoding-3/",
      title: "Menyusun Rencana dengan Asisten Ngoding",
      tags: ["catatan", "ai", "planning"],
      date: "2025-01-02",
      templateContent: "Blueprint dan rencana bertahap",
    }),
    mkItem({
      url: "/catatan/resep-kopi/",
      title: "Cara Menyeduh Kopi",
      tags: ["catatan", "kopi"],
      date: "2025-01-03",
      templateContent: "Air panas dan biji kopi",
    }),
  ];

  const related = getRelatedPosts(
    collection,
    {
      url: "/prompts/wawancara-spesifikasi-bertahap/",
      excludeUrl: "/catatan/asisten-ngoding-2/",
      tags: ["perencanaan", "spesifikasi"],
      title: "Wawancara Spesifikasi",
      content: "Menyusun rencana spesifikasi",
      onlyRelevant: true,
    },
    { limit: 3 },
  );

  assert.deepEqual(
    related.map((i) => i.url),
    ["/catatan/asisten-ngoding-3/"],
  );
});

test("getRelatedPrompts prioritizes explicit relatedArticle backlinks and matches domain concepts", () => {
  const prompts = [
    {
      slug: "wawancara-spesifikasi-bertahap",
      url: "/prompts/wawancara-spesifikasi-bertahap/",
      title: "Wawancara Spesifikasi Bertahap",
      description: "Prompt wawancara untuk menyusun spesifikasi teknis.",
      category: "perencanaan",
      relatedArticle: "/catatan/asisten-ngoding-2/",
      keywords: ["spesifikasi", "perencanaan"],
      prompt: "Ask me one question at a time",
      order: 1,
    },
    {
      slug: "periksa-performa-halaman-web",
      url: "/prompts/periksa-performa-halaman-web/",
      title: "Periksa Performa Halaman Web",
      description: "Audit Core Web Vitals dan LCP pada halaman web.",
      category: "performa",
      relatedArticle: null,
      keywords: ["performa", "web", "lcp"],
      prompt: "Inspect Core Web Vitals",
      order: 2,
    },
  ];

  // 1. Explicit backlink from /catatan/asisten-ngoding-2/ surfaces wawancara-spesifikasi-bertahap first
  const forSpecArticle = getRelatedPrompts(
    prompts,
    {
      url: "/catatan/asisten-ngoding-2/",
      tags: ["ai", "spesifikasi"],
      title: "Diskusi dan Menulis Spesifikasi dengan AI",
      content: "Menulis spesifikasi dengan asisten ngoding",
    },
    { limit: 1 },
  );
  assert.equal(forSpecArticle[0]?.slug, "wawancara-spesifikasi-bertahap");

  // 2. Web article surfaces the web performance prompt via concept/keyword overlap
  const forWebArticle = getRelatedPrompts(
    prompts,
    {
      url: "/catatan/optimasi-web/",
      tags: ["web", "frontend"],
      title: "Optimasi Performa Web",
      content: "Meningkatkan Core Web Vitals dan LCP",
    },
    { limit: 1 },
  );
  assert.equal(forWebArticle[0]?.slug, "periksa-performa-halaman-web");
});

test("getRelatedTips matches shared tags, concept synonyms, and excludes the current tip", () => {
  const tips = [
    {
      id: "t1",
      slug: "elixir-pattern-matching",
      url: "/tips/elixir-pattern-matching/",
      title: "Pattern Matching di Elixir",
      description: "Cara kerja pattern matching di BEAM dan Elixir.",
      publishedAt: "2025-05-01T00:00:00Z",
      tags: [{ label: "elixir", slug: "elixir" }],
    },
    {
      id: "t2",
      slug: "otp-supervisor",
      url: "/tips/otp-supervisor/",
      title: "Supervisor di OTP",
      description: "Menjaga proses tetap hidup dengan OTP supervisor di Elixir.",
      publishedAt: "2025-06-01T00:00:00Z",
      tags: [{ label: "elixir", slug: "elixir" }],
    },
    {
      id: "t3",
      slug: "tips-git",
      url: "/tips/tips-git/",
      title: "Git Rebase",
      description: "Merapikan commit dengan git rebase.",
      publishedAt: "2025-07-01T00:00:00Z",
      tags: [{ label: "git", slug: "git" }],
    },
  ];

  const related = getRelatedTips(
    tips,
    {
      url: "/tips/elixir-pattern-matching/",
      tags: ["elixir"],
      title: "Pattern Matching di Elixir",
      description: "Elixir BEAM",
    },
    { limit: 2 },
  );

  assert.equal(related.length, 1);
  assert.equal(related[0].slug, "otp-supervisor");
});

test("getRelatedProjects boosts direct mentions and matches stack tags", () => {
  const projects = [
    {
      name: "mbb",
      description: "CLI assistant sederhana untuk prompt tools & agentic loop di terminal.",
      repo: "https://github.com/rizafahmi/mbb",
      tags: ["Elixir", "CLI", "Anthropic"],
    },
    {
      name: "Balap Kode",
      description: "Permainan adu cepat mengetik buat developer.",
      repo: "https://github.com/rizafahmi/coderacer",
      tags: ["Elixir", "Phoenix LiveView", "AI"],
    },
    {
      name: "maal",
      description: "Kalkulator zakat maal.",
      repo: "https://github.com/rizafahmi/maal",
      tags: ["Astro", "TypeScript", "Zakat"],
    },
  ];

  const byMention = getRelatedProjects(
    projects,
    {
      url: "/catatan/agentic-coding-bag-2/",
      tags: ["ai", "agentic-coding"],
      title: "Fondasi Agentic Coding",
      content: "Kita membangun proyek mbb dengan Elixir dan Anthropic API.",
    },
    { limit: 1 },
  );
  assert.equal(byMention[0]?.name, "mbb");

  const byStack = getRelatedProjects(
    projects,
    {
      url: "/topik/elixir/",
      tags: ["elixir", "otp"],
      title: "Elixir & OTP",
      content: "Belajar pemrograman fungsional",
    },
    { limit: 2 },
  );
  assert.deepEqual(
    byStack.map((p) => p.name),
    ["mbb", "Balap Kode"],
  );
});

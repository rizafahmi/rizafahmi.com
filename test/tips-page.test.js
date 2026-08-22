import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import nunjucks from "nunjucks";

import { selectTips, tipTagList } from "../src/libs/tips.js";

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("src/_includes"), {
  autoescape: true,
});

// The two filters the tips markup uses, matching eleventy.config.js.
env.addFilter("dateToISO", (date) => {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
});
env.addFilter("url", (value) => String(value));

const BASE = {
  id: "abc123",
  slug: "tips-elixir",
  title: "Tips Elixir",
  description: "Satu trik kecil di Elixir.",
  publishedAt: "2025-01-02T03:04:05Z",
  duration: "PT43S",
  durationSeconds: 43,
  thumbnail: "https://i.ytimg.com/vi/abc123/maxresdefault.jpg",
  tags: ["elixir"],
};

function renderTip(raw, newerHref = null, olderHref = null) {
  const [tip] = selectTips([{ ...BASE, ...raw }]);
  return env.renderString(
    '{% import "tip_body.njk" as t %}{{ t.tipBody(tip, newerHref, olderHref) }}',
    { tip, newerHref, olderHref },
  );
}

function renderGrid(rawTips) {
  const tips = selectTips(rawTips);
  return env.renderString('{% import "tips_grid.njk" as g %}{{ g.tipCards(tips) }}', { tips });
}

function renderTagNav(rawTips, activeTag = null) {
  const tags = tipTagList(selectTips(rawTips));
  return env.renderString('{% import "tips_grid.njk" as g %}{{ g.tagNav(tags, activeTag) }}', {
    tags,
    activeTag,
  });
}

// --- the tip page ----------------------------------------------------------

test("a tip page embeds the Short itself, not just a link to it", () => {
  const html = renderTip({});

  assert.match(html, /<iframe/);
  assert.match(html, /src="https:\/\/www\.youtube-nocookie\.com\/embed\/abc123"/);
  assert.match(html, /allowfullscreen/);
  assert.match(html, /title="Tips Elixir"/);
});

test("a tip page shows the title, description, tags, and a link to YouTube", () => {
  const html = renderTip({});

  assert.match(html, /<h2>Tips Elixir<\/h2>/);
  assert.match(html, /Satu trik kecil di Elixir\./);
  assert.match(html, /href="\/tips\/topik\/elixir\/"/);
  assert.match(html, /href="https:\/\/www\.youtube\.com\/shorts\/abc123"/);
  assert.match(html, /Tonton di YouTube/);
});

// --- the optional transcript, in both states -------------------------------
// The captain adds transcripts gradually. An absent one must render nothing at
// all: no heading, no "segera hadir" placeholder.

test("a tip with a transcript renders it under its own heading", () => {
  const html = renderTip({ transcript: "Halo semuanya.\n\nIni transkripnya." });

  assert.match(html, /class="tip-transcript"/);
  assert.match(html, /<h3>Transkrip<\/h3>/);
  assert.match(html, /<p>Halo semuanya\.<\/p>/);
  assert.match(html, /<p>Ini transkripnya\.<\/p>/);
});

test("a tip without a transcript renders no transcript markup whatsoever", () => {
  const html = renderTip({});

  assert.doesNotMatch(html, /Transkrip/i);
  assert.doesNotMatch(html, /tip-transcript/);
  assert.doesNotMatch(html, /segera|coming soon/i);
});

test("a blank transcript counts as no transcript, not an empty section", () => {
  const html = renderTip({ transcript: "   \n\n  " });

  assert.doesNotMatch(html, /Transkrip/i);
  assert.doesNotMatch(html, /tip-transcript/);
});

test("adding a transcript is a data-file edit and nothing more", () => {
  const without = renderTip({});
  const with_ = renderTip({ transcript: "Sebuah transkrip." });

  assert.notEqual(without, with_);
  assert.match(with_, /Sebuah transkrip\./);
});

test("a tip with no description renders no empty description block", () => {
  const html = renderTip({ description: "" });

  assert.doesNotMatch(html, /tip-description/);
  assert.doesNotMatch(html, /undefined|\bnull\b/);
});

test("a tip with no tags renders no empty topic list", () => {
  const html = renderTip({ tags: [] });

  assert.doesNotMatch(html, /article-topics/);
});

test("a tip page escapes the data file so a stray character cannot break it", () => {
  const html = renderTip({ description: "<script>alert(1)</script>" });

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test("the first and last tip get one-sided navigation, not a dead link", () => {
  const first = renderTip({}, null, "/tips/berikutnya/");
  assert.doesNotMatch(first, /Tips lebih baru/);
  assert.match(first, /Tips lebih lama/);

  const last = renderTip({}, "/tips/sebelumnya/", null);
  assert.match(last, /Tips lebih baru/);
  assert.doesNotMatch(last, /Tips lebih lama/);
});

// --- the index grid --------------------------------------------------------

test("the index links each thumbnail to its own page rather than embedding a player", () => {
  const html = renderGrid([BASE]);

  assert.match(html, /href="\/tips\/tips-elixir\/"/);
  assert.match(html, /<img src="https:\/\/i\.ytimg\.com\/vi\/abc123\/maxresdefault\.jpg"/);
  assert.doesNotMatch(html, /<iframe/);
});

test("every thumbnail carries alt text and lazy loading", () => {
  const html = renderGrid([BASE, { ...BASE, id: "def456", slug: "lain" }]);

  assert.equal((html.match(/alt="Cuplikan video: /g) || []).length, 2);
  assert.equal((html.match(/loading="lazy"/g) || []).length, 2);
});

test("the grid shows each tip's duration", () => {
  const html = renderGrid([BASE]);
  assert.match(html, /<span class="tip-duration">0:43<\/span>/);
});

test("an empty grid is still valid markup, not broken output", () => {
  const html = renderGrid([]);

  assert.match(html, /class="tips-grid"/);
  assert.doesNotMatch(html, /tip-card/);
});

// --- tag navigation --------------------------------------------------------

test("tag navigation links every tag with its count", () => {
  const html = renderTagNav([BASE, { ...BASE, id: "d", slug: "d", tags: ["elixir", "ai"] }]);

  assert.match(html, /href="\/tips\/topik\/elixir\/"/);
  assert.match(html, /href="\/tips\/topik\/ai\/"/);
  assert.match(html, /elixir <span>2<\/span>/);
});

test("tag navigation marks the tag currently being browsed", () => {
  const html = renderTagNav([BASE], "elixir");

  assert.match(html, /href="\/tips\/topik\/elixir\/" aria-current="page"/);
  assert.doesNotMatch(html, /href="\/tips\/" aria-current="page"/);
});

test("tag navigation marks the index itself when no tag is active", () => {
  const html = renderTagNav([BASE]);
  assert.match(html, /href="\/tips\/" aria-current="page"/);
});

// --- search ----------------------------------------------------------------
// Pagefind runs in opt-in mode on this site: a page without data-pagefind-body
// is silently skipped. /showcase sat unsearchable for exactly this reason.

const indexSource = readFileSync("src/tips.njk", "utf8");
const tipSource = readFileSync("src/tip.njk", "utf8");
const tagSource = readFileSync("src/tips-tag.njk", "utf8");

test("every tips page opts itself into the Pagefind index", () => {
  for (const source of [indexSource, tipSource, tagSource]) {
    assert.match(source, /<main[^>]*\bdata-pagefind-body\b[^>]*>/);
  }
});

// None of these pages has an <h1> of its own — the only <h1> on the page is the
// site logo in main.njk, which is what Pagefind would otherwise title them.
test("the tips pages that have no <h1> give Pagefind an explicit title", () => {
  for (const source of [indexSource, tipSource, tagSource]) {
    assert.doesNotMatch(source, /<h1/);
    assert.match(source, /data-pagefind-meta="title:[^"]+"/);
  }
});

test("a tip page uses the YouTube thumbnail as its OG image, not a generated one", () => {
  assert.match(tipSource, /image:\s*"\{\{ tip\.thumbnail \}\}"/);
  assert.doesNotMatch(tipSource, /\/og\//);
});

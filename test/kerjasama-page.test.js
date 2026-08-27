import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import nunjucks from "nunjucks";

import { renderableFormats } from "../src/libs/youtube-stats.js";

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("src/_includes"), {
  autoescape: true,
});

// Matches eleventy.config.js.
env.addFilter("localeString", (num, locale = "id-ID") => {
  const n = Number(num);
  if (!Number.isFinite(n)) return String(num);
  return n.toLocaleString(locale);
});
env.addFilter("localeDate", (value, locale = "id-ID") => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
});

const YOUTUBE = {
  channel: { url: "https://www.youtube.com/channel/UC123", handle: "@rizafahmi" },
  stats: { subscribers: 7170, totalViews: 364431, videoCount: 846 },
  momentum: {
    videosLast12Months: 138,
    viewsLast12Months: 49664,
    uploadsPerMonth: 10.6,
    monthsCovered: 13,
  },
  formats: {
    episode: { n: 79, median: 253, p25: 193, p75: 384, min: 109, max: 755 },
    shorts: { n: 53, median: 273, p25: 139, p75: 614, min: 84, max: 2406 },
    recorded: { n: 1, median: 161, p25: 161, p75: 161, min: 161, max: 161 },
  },
  ngobrolinWeb: { episodes: 59, median: 243, min: 109, max: 575 },
  topVideos: [
    {
      id: "t1",
      title: "Sebuah Short",
      url: "https://www.youtube.com/watch?v=t1",
      views: 2406,
      publishedAt: "2025-09-18T00:00:00Z",
    },
  ],
  recentVideos: [
    {
      id: "r1",
      title: "Video terbaru",
      url: "https://www.youtube.com/watch?v=r1",
      views: 378,
      publishedAt: "2026-08-26T00:00:00Z",
    },
  ],
  bestVideos: [
    {
      id: "old1",
      title: "AWS Free Tier",
      url: "https://www.youtube.com/watch?v=old1",
      views: 1473,
      publishedAt: "2022-07-13T00:00:00Z",
      tag: "DevTools",
    },
  ],
  window: {
    videosAnalyzed: 300,
    from: "2023-10-30",
    to: "2026-08-26",
    videosSummarized: 133,
    statsFrom: "2025-05-29",
    statsTo: "2026-08-05",
    matureMinDays: 21,
    statsMaxAgeDays: 456,
  },
  updatedAt: "2026-08-27T09:00:00.000Z",
};

function render(youtube = YOUTUBE) {
  const formatKeys = youtube.formats ? renderableFormats(youtube.formats) : [];
  return env.renderString(
    '{% import "kerjasama_body.njk" as k %}{{ k.kerjasamaBody(youtube, formatKeys) }}',
    { youtube, formatKeys },
  );
}

test("renders the headline reach figures in id-ID format", () => {
  const html = render();
  assert.match(html, /7\.170/);
  assert.match(html, /364\.431/);
  assert.match(html, /846/);
});

test("renders the momentum figures", () => {
  const html = render();
  assert.match(html, /138/);
  assert.match(html, /49\.664/);
  assert.match(html, /10,6/, "a decimal must use the Indonesian comma, not a period");
});

test("publishes no prices", () => {
  const html = render();
  assert.doesNotMatch(html, /Rp/, "the media kit must never quote a price");
});

test("omits the sections the spec dropped", () => {
  const html = render();
  assert.doesNotMatch(html, /Instagram/i);
  assert.doesNotMatch(html, /Narasumber/i);
  assert.doesNotMatch(html, /workshop/i);
});

test("suppresses a format bucket below the sample threshold", () => {
  const html = render();
  // recorded has n=1, so its median must not appear...
  assert.doesNotMatch(html, /161/);
  // ...while the two healthy buckets do.
  assert.match(html, /253/);
  assert.match(html, /273/);
});

// The page's central promise is that no median appears without its sample size
// and range. Asserting that against one row leaves the others free to lose a
// cell with the suite still green, so this walks every row the fixture renders
// and holds each one to the whole rule.
test("shows sample size and range beside every median", () => {
  const html = render();
  // id-ID groups thousands with a period, which is also a regex metacharacter.
  const id = (n) => Number(n).toLocaleString("id-ID").replace(/\./g, "\\.");

  const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
  assert.ok(tbody, "the format table should render for this fixture");
  const rows = tbody[1].match(/<tr>[\s\S]*?<\/tr>/g) || [];

  const expected = renderableFormats(YOUTUBE.formats);
  assert.ok(expected.length > 1, "the fixture must render more than one row to be worth checking");
  assert.equal(rows.length, expected.length, "every renderable format gets exactly one row");

  for (const [i, key] of expected.entries()) {
    const f = YOUTUBE.formats[key];
    const row = rows[i];
    assert.match(row, new RegExp(`<strong>${id(f.median)}</strong>`), `${key}: median`);
    assert.match(row, new RegExp(`${id(f.min)}\\s*–\\s*${id(f.max)}`), `${key}: range as a unit`);
    assert.match(row, new RegExp(`<td>${f.n}</td>`), `${key}: sample size`);
  }
});

// The medians are drawn from a recency-bounded slice of the fetched uploads
// (STATS_MAX_AGE_DAYS), while momentum is measured over everything fetched.
// The note under the table is the page's only disclosure of which sample the
// medians came from, so it must name that slice and not the wider fetch.
test("the format note discloses the summarised sample, not the fetched one", () => {
  const html = render();
  const note = html.match(/<p class="kerjasama-note">([\s\S]*?)<\/p>/);
  assert.ok(note, "the format section note should render for this fixture");

  assert.match(note[1], /133/, "the count of videos the medians came from");
  assert.match(note[1], /2025-05-29\s*–\s*2026-08-05/, "the range they came from");

  assert.doesNotMatch(note[1], /300/, "the fetch size describes momentum, not the medians");
  assert.doesNotMatch(note[1], /2023-10-30/, "the fetch range must not be claimed as the sample");
});

test("renders Ngobrolin WEB as a named series", () => {
  const html = render();
  assert.match(html, /Ngobrolin WEB/);
  assert.match(html, /59/);
});

test("renders curated best videos with hydrated titles and tags", () => {
  const html = render();
  assert.match(html, /AWS Free Tier/, "title comes from youtube.json, not the curated file");
  assert.match(html, /1\.473/);
  assert.match(html, /DevTools/, "the curated tag is kept");
});

test("omits the curated section entirely when nothing hydrated", () => {
  const html = render({ ...YOUTUBE, bestVideos: [] });
  assert.doesNotMatch(html, /Video terbaik/);
});

// Video terbaru shows any recent upload, mature or not — it exists to
// demonstrate cadence and topic mix. Showing its raw view count would
// undercut the rest of the page, which never shows a view count without
// maturity filtering and a sample size beside it.
test("the recency section shows cadence, not view counts", () => {
  const html = render();
  const section = html.match(/<h2>Video terbaru<\/h2>[\s\S]*?<\/ul>/);
  assert.ok(section, "the recency section should render for this fixture");
  assert.doesNotMatch(section[0], /penonton/, "no view count belongs in this section");
  assert.doesNotMatch(section[0], /378/, "the recent video's raw view count must not render");
});

test("lists Domainesia among past collaborators", () => {
  const html = render();
  for (const brand of ["AWS", "BenQ", "Domainesia", "Niagahoster", "Feedloop", "DeepTech"]) {
    assert.match(html, new RegExp(brand), `${brand} must be listed`);
  }
});

test("dates the numbers as text a person can read, not a machine timestamp", () => {
  const html = render();
  assert.match(html, /27 Agustus 2026/, "the last-updated date must read as Indonesian text");
  assert.doesNotMatch(
    html,
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,
    "no raw ISO timestamp should leak onto the page",
  );
});

test("falls back gracefully when statistics are missing", () => {
  const html = render({ stats: {} });
  assert.match(html, /belum tersedia/i);
  assert.doesNotMatch(html, /NaN/);
  assert.doesNotMatch(html, /undefined/);
});

test("still renders the contact route with no statistics", () => {
  const html = render({ stats: {} });
  assert.match(html, /mailto:rizafahmi@gmail\.com/);
});

// The top-level `{% if youtube.stats.subscribers %}` gate is not the only
// place data can go missing. Reach can be known while the rest of the
// pipeline (momentum, formats, window, the curated/recent video lists) is
// not — the fetch script does not guarantee they arrive together — and each
// of those must degrade on its own rather than assume its neighbours exist.
test("degrades gracefully when only some statistics are present", () => {
  const partial = {
    stats: { subscribers: 500, totalViews: 1000, videoCount: 20 },
    // momentum, formats, window, ngobrolinWeb, bestVideos, recentVideos,
    // and updatedAt are all deliberately absent.
  };
  const html = render(partial);
  assert.doesNotMatch(html, /NaN/);
  assert.doesNotMatch(html, /undefined/);
  // Reach is known, so it still renders...
  assert.match(html, /500/);
  // ...but a section with no backing data must not appear at all, rather
  // than rendering an empty or broken shell.
  assert.doesNotMatch(html, /Momentum/);
  assert.doesNotMatch(html, /Performa per format/);
  assert.doesNotMatch(html, /Ngobrolin WEB/);
  assert.doesNotMatch(html, /Video terbaik/);
  assert.doesNotMatch(html, /Video terbaru/);
});

// formatKeys being non-empty only tells us `formats` survived renderableFormats'
// sample-size filter — it says nothing about whether `window` (the note's
// "tayang minimal N hari" / "N unggahan terakhir" / date range text) is
// present. Before this test, a formats-present-but-window-absent payload
// rendered the section with blank gaps instead of skipping it, because the
// gate only checked formatKeys.length.
test("degrades gracefully when formats are present but the analysis window is not", () => {
  const partial = {
    stats: { subscribers: 500, totalViews: 1000, videoCount: 20 },
    formats: {
      episode: { n: 10, median: 200, p25: 150, p75: 250, min: 100, max: 300 },
    },
    // window is deliberately absent, even though formats/formatKeys are present.
  };
  const html = render(partial);
  assert.doesNotMatch(
    html,
    /Performa per format/,
    "the section must not render with holes when window is missing",
  );
  assert.doesNotMatch(html, /NaN/);
  assert.doesNotMatch(html, /undefined/);
});

// --- The pageCss hook ------------------------------------------------------
//
// /kerjasama/ is the first page to use `pageCss`, the front-matter hook in
// src/_includes/main.njk that loads one page-specific stylesheet after the
// globals. A typo in the key ships a silently unstyled page behind a 404
// stylesheet, and an undocumented hook gets reinvented by the next page that
// needs one — so both the wiring and its DESIGN.md entry are pinned here.

test("every page declaring pageCss ships the stylesheet it names", () => {
  const pages = readdirSync("src", { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.(njk|md|html)$/.test(e.name))
    .map((e) => join(e.parentPath ?? e.path, e.name));

  const declared = pages
    .map((file) => [file, readFileSync(file, "utf8").match(/^pageCss:\s*(\S+)\s*$/m)?.[1]])
    .filter(([, css]) => css);

  assert.ok(declared.length > 0, "at least /kerjasama/ should be using the hook");
  for (const [file, css] of declared) {
    assert.ok(
      existsSync(join("assets", css)),
      `${file} declares pageCss: ${css}, which is missing`,
    );
  }
});

test("the main layout actually links a declared pageCss", () => {
  const layout = readFileSync("src/_includes/main.njk", "utf8");
  assert.match(layout, /\{% if pageCss %\}/, "the hook must be opt-in, not always-on");
  assert.match(layout, /rel="stylesheet" href="\/assets\/\{\{ pageCss \}\}/);
});

test("DESIGN.md documents the pageCss hook and the media kit component group", () => {
  const design = readFileSync("DESIGN.md", "utf8");
  assert.match(design, /pageCss/, "the next page-specific stylesheet must not reinvent the hook");
  assert.match(design, /\.kerjasama-\*/, "the media kit is a component group, so it is documented");
});

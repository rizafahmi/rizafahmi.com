import assert from "node:assert/strict";
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
  window: { videosAnalyzed: 150, from: "2025-06-11", to: "2026-08-26", matureMinDays: 21 },
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

test("shows sample size and range beside every median", () => {
  const html = render();
  assert.match(html, /79/, "episode sample size");
  assert.match(html, /109/, "episode range floor");
  assert.match(html, /755/, "episode range ceiling");
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

test("lists Domainesia among past collaborators", () => {
  const html = render();
  for (const brand of ["AWS", "BenQ", "Domainesia", "Niagahoster", "Feedloop", "DeepTech"]) {
    assert.match(html, new RegExp(brand), `${brand} must be listed`);
  }
});

test("dates the numbers", () => {
  const html = render();
  assert.match(html, /2026-08-27/);
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

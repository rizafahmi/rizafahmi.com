# Dynamic YouTube Media Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/kerjasama/` as a YouTube media kit whose numbers are current, honest, and refreshed automatically by a scheduled workflow.

**Architecture:** Pure statistics functions live in `src/libs/youtube-stats.js` and are unit-tested without network access. `scripts/fetch-youtube-stats.mjs` does I/O only — it walks the uploads playlist, calls those functions, and writes `src/_data/youtube.json`. A weekly GitHub Actions workflow runs the script and commits the JSON; the Eleventy build only ever reads that file, so it stays offline-safe. The page renders from a `src/_includes/kerjasama_body.njk` macro so it can be tested with Nunjucks directly, matching the existing `tip_body.njk` pattern.

**Tech Stack:** Eleventy 3.x (ESM), Nunjucks, pnpm, `node:test` + `node:assert/strict`, Biome, YouTube Data API v3, GitHub Actions.

## Global Constraints

- **Package manager is pnpm only.** Never `npm` or `bun`. `pnpm-lock.yaml` is the single lockfile.
- **No prices anywhere on the page.** No `Rp` string in rendered output. This is a media kit, not a price list.
- **No Instagram, no X, no Narasumber/Acara (speaking) section.** All three are out of scope.
- **The build must never call the YouTube API.** `pnpm run build` reads committed JSON only.
- **Design system is `DESIGN.md` (Neo-Acid Gallery).** No new color tokens. No shadows, no gradients, no rounded corners. Borders: `4px` major splits, `2px` groups. Body copy left-aligned, capped `65ch`.
- **Maturity threshold is 21 days.** Videos younger than that are excluded from every median, percentile, and range — but still counted in cadence.
- **Median, never mean**, for per-format performance figures.
- **Small-sample suppression threshold is 5.** A format with fewer than 5 mature videos renders no median.
- **Format bucketing, in this exact order:** duration ≤ `180`s → `shorts`; else live or duration ≥ `2700`s → `episode`; else → `recorded`.
- **Ngobrolin WEB detection:** case-insensitive `"ngobrolin"` in the video title.
- **Analysis window:** the most recent 150 uploads.
- **Reuse `parseIsoDuration` from `src/libs/tips.js`.** Do not write a second duration parser.
- **Locale:** numbers render through the existing `localeString` filter (`id-ID`). Page copy is Indonesian.
- **Node version is `v22`** (`.nvmrc`).
- Every task ends green on `pnpm run check` (Biome + unit tests).

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/libs/youtube-stats.js` *(create)* | Pure stats: bucketing, maturity, summaries, momentum, assembly. No I/O. |
| `test/youtube-stats.test.js` *(create)* | Unit tests for the above, fixture-driven, no network. |
| `scripts/fetch-youtube-stats.mjs` *(rewrite)* | I/O only: fetch uploads playlist + video records, call libs, write JSON. |
| `package.json` *(modify)* | Add `fetch:youtube` script. |
| `src/_includes/main.njk` *(modify)* | Add optional `pageCss` front-matter hook. |
| `assets/kerjasama.css` *(create)* | Page-specific Neo-Acid styling. |
| `src/_includes/kerjasama_body.njk` *(create)* | The page markup, as a testable macro. |
| `src/ratecard.njk` *(rewrite)* | Thin page: front matter, `<main>` wrapper, macro call. |
| `test/kerjasama-page.test.js` *(create)* | Renders the macro; asserts content, no prices, fallbacks. |
| `src/_data/ratecardBestVideos.json` *(modify)* | Curated ids + tags only; titles hydrated at build. |
| `.github/workflows/youtube-stats.yml` *(create)* | Weekly refresh + commit. |
| `src/_data/cv.js` *(modify)* | Repoint the dangling source comment on line 347. |

---

### Task 1: Stats primitives — bucketing, maturity, summaries

**Files:**
- Create: `src/libs/youtube-stats.js`
- Test: `test/youtube-stats.test.js`

**Interfaces:**
- Consumes: `parseIsoDuration` from `src/libs/tips.js`
- Produces:
  - `MATURE_MIN_DAYS = 21`
  - `MIN_FORMAT_SAMPLE = 5`
  - `normalizeVideo(apiItem) -> { id, title, publishedAt, url, views, durationSeconds, isLive } | null`
  - `bucketFormat({ durationSeconds, isLive }) -> "shorts" | "episode" | "recorded"`
  - `isMature(publishedAt, now, minDays = MATURE_MIN_DAYS) -> boolean`
  - `summarize(viewCounts) -> { n, median, p25, p75, min, max } | null`

- [ ] **Step 1: Write the failing test**

Create `test/youtube-stats.test.js`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import {
  MATURE_MIN_DAYS,
  MIN_FORMAT_SAMPLE,
  bucketFormat,
  isMature,
  normalizeVideo,
  summarize,
} from "../src/libs/youtube-stats.js";

test("bucketFormat: 180s and shorter is a Short", () => {
  assert.equal(bucketFormat({ durationSeconds: 45, isLive: false }), "shorts");
  assert.equal(bucketFormat({ durationSeconds: 180, isLive: false }), "shorts");
});

test("bucketFormat: 181s is not a Short", () => {
  assert.equal(bucketFormat({ durationSeconds: 181, isLive: false }), "recorded");
});

test("bucketFormat: 2700s and longer is an episode", () => {
  assert.equal(bucketFormat({ durationSeconds: 2700, isLive: false }), "episode");
  assert.equal(bucketFormat({ durationSeconds: 6890, isLive: false }), "episode");
  assert.equal(bucketFormat({ durationSeconds: 2699, isLive: false }), "recorded");
});

test("bucketFormat: a live broadcast is an episode at any length above Shorts", () => {
  assert.equal(bucketFormat({ durationSeconds: 600, isLive: true }), "episode");
});

test("bucketFormat: a live video under 180s is still a Short", () => {
  assert.equal(bucketFormat({ durationSeconds: 60, isLive: true }), "shorts");
});

test("isMature: the 21-day boundary is inclusive", () => {
  const now = new Date("2026-08-27T00:00:00Z");
  assert.equal(isMature("2026-08-06T00:00:00Z", now), true); // exactly 21 days
  assert.equal(isMature("2026-08-07T00:00:00Z", now), false); // 20 days
});

test("isMature: rejects unparseable dates", () => {
  assert.equal(isMature("not-a-date", new Date("2026-08-27T00:00:00Z")), false);
});

test("summarize: odd-length set takes the middle value", () => {
  assert.deepEqual(summarize([1, 5, 100]), { n: 3, median: 5, p25: 1, p75: 100, min: 1, max: 100 });
});

test("summarize: even-length set averages the two middle values, rounded", () => {
  assert.deepEqual(summarize([10, 20, 30, 41]), {
    n: 4,
    median: 25,
    p25: 20,
    p75: 41,
    min: 10,
    max: 41,
  });
});

test("summarize: single element", () => {
  assert.deepEqual(summarize([161]), { n: 1, median: 161, p25: 161, p75: 161, min: 161, max: 161 });
});

test("summarize: empty input returns null, never NaN", () => {
  assert.equal(summarize([]), null);
  assert.equal(summarize(undefined), null);
});

test("summarize: reproduces the measured Shorts distribution", () => {
  // The real mature-Shorts view counts as measured on 2026-08-27. These are the
  // numbers the spec publishes, so this test pins them: n=53, median=273,
  // p25=139, p75=614, range 84-2406. Do not substitute invented values here —
  // a fabricated array that merely looks plausible will not reproduce them.
  const views = [
    84, 85, 87, 88, 102, 104, 107, 113, 125, 131, 132, 136, 137, 139, 151, 153, 160, 163, 171,
    172, 180, 182, 193, 208, 222, 240, 273, 282, 288, 289, 308, 323, 455, 461, 475, 504, 528,
    528, 583, 614, 793, 804, 819, 853, 915, 941, 1096, 1143, 1198, 1298, 1574, 1700, 2406,
  ];
  assert.deepEqual(summarize(views), {
    n: 53,
    median: 273,
    p25: 139,
    p75: 614,
    min: 84,
    max: 2406,
  });
});

test("normalizeVideo: maps an API item and derives duration and liveness", () => {
  const v = normalizeVideo({
    id: "abc123",
    snippet: { title: "Ngobrolin Elixir", publishedAt: "2026-07-03T00:00:00Z" },
    statistics: { viewCount: "889" },
    contentDetails: { duration: "PT1H31M4S" },
    liveStreamingDetails: { actualStartTime: "2026-07-03T00:00:00Z" },
  });
  assert.deepEqual(v, {
    id: "abc123",
    title: "Ngobrolin Elixir",
    publishedAt: "2026-07-03T00:00:00Z",
    url: "https://www.youtube.com/watch?v=abc123",
    views: 889,
    durationSeconds: 5464,
    isLive: true,
  });
});

test("normalizeVideo: missing view count becomes 0, not null", () => {
  const v = normalizeVideo({
    id: "x",
    snippet: { title: "T", publishedAt: "2026-01-01T00:00:00Z" },
    statistics: {},
    contentDetails: { duration: "PT45S" },
  });
  assert.equal(v.views, 0);
  assert.equal(v.isLive, false);
});

test("normalizeVideo: an item with no id is rejected", () => {
  assert.equal(normalizeVideo({ snippet: { title: "T" } }), null);
  assert.equal(normalizeVideo(null), null);
});

test("thresholds are the values the spec fixed", () => {
  assert.equal(MATURE_MIN_DAYS, 21);
  assert.equal(MIN_FORMAT_SAMPLE, 5);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec node --test test/youtube-stats.test.js`
Expected: FAIL — `Cannot find module '../src/libs/youtube-stats.js'`

- [ ] **Step 3: Write minimal implementation**

Create `src/libs/youtube-stats.js`:

```js
/**
 * Statistics for the /kerjasama/ media kit.
 *
 * Everything here is pure. The numbers on that page are shown to sponsors, so
 * they have to be reproducible and testable without a network round trip —
 * scripts/fetch-youtube-stats.mjs owns the I/O and calls into this module.
 *
 * Two rules drive the shape of this file. Views are summarised with a median
 * rather than a mean, because one breakout Short should not speak for a year of
 * uploads. And a video younger than MATURE_MIN_DAYS is excluded from every
 * summary, because a video published on Tuesday has not had time to earn its
 * views and would otherwise drag the figure down.
 */

import { parseIsoDuration } from "./tips.js";

/** A video needs this many days before its view count means anything. */
export const MATURE_MIN_DAYS = 21;

/** Below this many mature videos, a format gets no median rendered. */
export const MIN_FORMAT_SAMPLE = 5;

/** Longest a video can be and still count as a Short. */
const SHORTS_MAX_SECONDS = 180;

/** Shortest a video can be and still count as a full episode. */
const EPISODE_MIN_SECONDS = 2700;

const MS_PER_DAY = 86_400_000;

/** One raw YouTube API `videos.list` item to the shape this module works in. */
export function normalizeVideo(item) {
  const id = item?.id;
  if (!id) return null;
  const views = Number(item?.statistics?.viewCount);
  return {
    id,
    title: item?.snippet?.title || "",
    publishedAt: item?.snippet?.publishedAt || "",
    url: `https://www.youtube.com/watch?v=${id}`,
    views: Number.isFinite(views) ? views : 0,
    durationSeconds: parseIsoDuration(item?.contentDetails?.duration) ?? 0,
    isLive: Boolean(item?.liveStreamingDetails),
  };
}

/**
 * Which format bucket a video belongs to. Order matters: length decides first,
 * so a 60-second clip cut from a livestream is a Short, not an episode.
 */
export function bucketFormat({ durationSeconds, isLive }) {
  if (durationSeconds <= SHORTS_MAX_SECONDS) return "shorts";
  if (isLive || durationSeconds >= EPISODE_MIN_SECONDS) return "episode";
  return "recorded";
}

/** Has this video been up long enough for its view count to be worth reading? */
export function isMature(publishedAt, now, minDays = MATURE_MIN_DAYS) {
  const published = new Date(publishedAt);
  if (Number.isNaN(published.getTime())) return false;
  return (now.getTime() - published.getTime()) / MS_PER_DAY >= minDays;
}

/** Nearest-rank quantile over an ascending array. */
function quantile(sorted, q) {
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * q));
  return sorted[index];
}

/** Median, percentiles and range for a set of view counts. */
export function summarize(viewCounts) {
  if (!Array.isArray(viewCounts) || viewCounts.length === 0) return null;
  const sorted = [...viewCounts].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  return {
    n: sorted.length,
    median,
    p25: quantile(sorted, 0.25),
    p75: quantile(sorted, 0.75),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec node --test test/youtube-stats.test.js`
Expected: PASS, all tests green.

- [ ] **Step 5: Lint and commit**

```bash
pnpm run lint:fix && pnpm run format:fix
pnpm run check
git add src/libs/youtube-stats.js test/youtube-stats.test.js
git commit -m "feat(kerjasama): add YouTube stats primitives"
```

---

### Task 2: Momentum, format suppression, and assembly

**Files:**
- Modify: `src/libs/youtube-stats.js`
- Test: `test/youtube-stats.test.js`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces:
  - `computeMomentum(videos, now) -> { videosLast12Months, viewsLast12Months, uploadsPerMonth, monthsCovered }`
  - `renderableFormats(formats) -> string[]` — bucket keys with `n >= MIN_FORMAT_SAMPLE`, ordered `episode`, `shorts`, `recorded`
  - `hydrateCurated(picks, videos) -> [{ id, title, url, views, publishedAt, tag }]` — joins curated `{ id, tag }` entries to full records by id, preserving the curated order and dropping picks with no match
  - `buildYoutubeStats({ videos, now, topCount = 6, recentCount = 6 }) -> { momentum, formats, ngobrolinWeb, topVideos, recentVideos, window }`
    - `formats` is `{ shorts, episode, recorded }`, each a `summarize()` result or `null`
    - `ngobrolinWeb` is `{ episodes, median, min, max }` or `null`
    - `window` is `{ videosAnalyzed, from, to, matureMinDays }` with `from`/`to` as `YYYY-MM-DD`

- [ ] **Step 1: Write the failing test**

Extend the existing import at the top of `test/youtube-stats.test.js` — merge the new names into
it rather than adding a second `import` from the same module, which Biome flags:

```js
import {
  MATURE_MIN_DAYS,
  MIN_FORMAT_SAMPLE,
  buildYoutubeStats,
  bucketFormat,
  computeMomentum,
  hydrateCurated,
  isMature,
  normalizeVideo,
  renderableFormats,
  summarize,
} from "../src/libs/youtube-stats.js";
```

Then append these tests:

```js
const NOW = new Date("2026-08-27T00:00:00Z");

/** A mature video, `daysAgo` old, so tests read as intent not arithmetic. */
function vid({ id = "v", title = "T", daysAgo = 100, views = 100, seconds = 60, live = false }) {
  const publishedAt = new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString();
  return {
    id,
    title,
    publishedAt,
    url: `https://www.youtube.com/watch?v=${id}`,
    views,
    durationSeconds: seconds,
    isLive: live,
  };
}

test("computeMomentum: counts uploads and views inside the 12-month window", () => {
  const m = computeMomentum(
    [
      vid({ id: "a", daysAgo: 10, views: 100 }),
      vid({ id: "b", daysAgo: 200, views: 200 }),
      vid({ id: "c", daysAgo: 400, views: 999 }), // outside the window
    ],
    NOW,
  );
  assert.equal(m.videosLast12Months, 2);
  assert.equal(m.viewsLast12Months, 300);
});

test("computeMomentum: uploads per month divides by months actually present", () => {
  // Six videos across two calendar months -> 3.0, not 6/12.
  const m = computeMomentum(
    [
      vid({ id: "a", daysAgo: 5 }),
      vid({ id: "b", daysAgo: 6 }),
      vid({ id: "c", daysAgo: 7 }),
      vid({ id: "d", daysAgo: 40 }),
      vid({ id: "e", daysAgo: 41 }),
      vid({ id: "f", daysAgo: 42 }),
    ],
    NOW,
  );
  assert.equal(m.monthsCovered, 2);
  assert.equal(m.uploadsPerMonth, 3);
});

test("computeMomentum: counts a brand-new video, unlike the medians", () => {
  const m = computeMomentum([vid({ id: "fresh", daysAgo: 2, views: 0 })], NOW);
  assert.equal(m.videosLast12Months, 1);
});

test("computeMomentum: empty input is all zeros, never NaN", () => {
  const m = computeMomentum([], NOW);
  assert.deepEqual(m, {
    videosLast12Months: 0,
    viewsLast12Months: 0,
    uploadsPerMonth: 0,
    monthsCovered: 0,
  });
});

test("renderableFormats: suppresses a bucket with 4 mature videos, keeps one with 5", () => {
  const formats = { shorts: { n: 5 }, episode: { n: 4 }, recorded: null };
  assert.deepEqual(renderableFormats(formats), ["shorts"]);
});

test("renderableFormats: orders episode before shorts before recorded", () => {
  const formats = { shorts: { n: 9 }, episode: { n: 9 }, recorded: { n: 9 } };
  assert.deepEqual(renderableFormats(formats), ["episode", "shorts", "recorded"]);
});

test("buildYoutubeStats: a young video is counted in cadence but excluded from medians", () => {
  const videos = [
    ...Array.from({ length: 5 }, (_, i) =>
      vid({ id: `s${i}`, daysAgo: 100, views: 300, seconds: 60 }),
    ),
    vid({ id: "fresh", daysAgo: 2, views: 0, seconds: 60 }),
  ];
  const out = buildYoutubeStats({ videos, now: NOW });
  assert.equal(out.formats.shorts.n, 5, "the 2-day-old video must not be summarised");
  assert.equal(out.formats.shorts.median, 300, "a 0-view newborn must not drag the median down");
  assert.equal(out.momentum.videosLast12Months, 6, "but it still counts as output");
});

test("buildYoutubeStats: buckets by duration and liveness", () => {
  const videos = [
    vid({ id: "s", seconds: 60, views: 500 }),
    vid({ id: "e", seconds: 5400, views: 250 }),
    vid({ id: "r", seconds: 600, views: 161 }),
  ];
  const out = buildYoutubeStats({ videos, now: NOW });
  assert.equal(out.formats.shorts.n, 1);
  assert.equal(out.formats.episode.n, 1);
  assert.equal(out.formats.recorded.n, 1);
});

test("buildYoutubeStats: Ngobrolin WEB is matched case-insensitively on title", () => {
  const videos = [
    vid({ id: "n1", title: "Ngobrolin Elixir - Ngobrolin WEB", seconds: 5400, views: 889 }),
    vid({ id: "n2", title: "ngobrolin database", seconds: 5400, views: 565 }),
    vid({ id: "other", title: "Sesuatu yang lain", seconds: 5400, views: 100 }),
  ];
  const out = buildYoutubeStats({ videos, now: NOW });
  assert.equal(out.ngobrolinWeb.episodes, 2);
  assert.equal(out.ngobrolinWeb.median, 727);
  assert.equal(out.ngobrolinWeb.min, 565);
  assert.equal(out.ngobrolinWeb.max, 889);
});

test("buildYoutubeStats: no Ngobrolin episodes yields null, not a zero summary", () => {
  const out = buildYoutubeStats({ videos: [vid({ id: "x", title: "Lain" })], now: NOW });
  assert.equal(out.ngobrolinWeb, null);
});

test("buildYoutubeStats: topVideos are mature, view-sorted, and capped", () => {
  const videos = [
    vid({ id: "low", views: 10 }),
    vid({ id: "high", views: 9000 }),
    vid({ id: "mid", views: 500 }),
    vid({ id: "newborn", daysAgo: 1, views: 99999 }),
  ];
  const out = buildYoutubeStats({ videos, now: NOW, topCount: 2 });
  assert.deepEqual(
    out.topVideos.map((v) => v.id),
    ["high", "mid"],
  );
});

test("buildYoutubeStats: recentVideos are newest-first and capped", () => {
  const videos = [
    vid({ id: "old", daysAgo: 300 }),
    vid({ id: "newest", daysAgo: 1 }),
    vid({ id: "middle", daysAgo: 50 }),
  ];
  const out = buildYoutubeStats({ videos, now: NOW, recentCount: 2 });
  assert.deepEqual(
    out.recentVideos.map((v) => v.id),
    ["newest", "middle"],
  );
});

test("buildYoutubeStats: window reports the analysed range", () => {
  const videos = [vid({ id: "a", daysAgo: 400 }), vid({ id: "b", daysAgo: 1 })];
  const out = buildYoutubeStats({ videos, now: NOW });
  assert.equal(out.window.videosAnalyzed, 2);
  assert.equal(out.window.from, "2025-07-23");
  assert.equal(out.window.to, "2026-08-26");
  assert.equal(out.window.matureMinDays, 21);
});

test("hydrateCurated: joins picks to records and keeps the curated order", () => {
  const videos = [
    vid({ id: "b", title: "Kedua", views: 200 }),
    vid({ id: "a", title: "Pertama", views: 100 }),
  ];
  const out = hydrateCurated([{ id: "a", tag: "Elixir" }, { id: "b", tag: "Web" }], videos);
  assert.deepEqual(
    out.map((v) => [v.id, v.title, v.tag]),
    [
      ["a", "Pertama", "Elixir"],
      ["b", "Kedua", "Web"],
    ],
  );
});

test("hydrateCurated: drops a pick with no matching record rather than rendering a blank", () => {
  const out = hydrateCurated([{ id: "gone", tag: "Lama" }], [vid({ id: "a" })]);
  assert.deepEqual(out, []);
});

test("hydrateCurated: an old curated video hydrates fine, regardless of age", () => {
  // The curated list points at 2022-2024 videos on purpose; age must not matter.
  const out = hydrateCurated(
    [{ id: "old", tag: "DevTools" }],
    [vid({ id: "old", title: "AWS Free Tier", daysAgo: 1500, views: 1473 })],
  );
  assert.equal(out.length, 1);
  assert.equal(out[0].views, 1473);
});

test("hydrateCurated: tolerates empty or missing inputs", () => {
  assert.deepEqual(hydrateCurated([], []), []);
  assert.deepEqual(hydrateCurated(undefined, undefined), []);
});

test("buildYoutubeStats: empty input produces a well-formed empty result", () => {
  const out = buildYoutubeStats({ videos: [], now: NOW });
  assert.equal(out.formats.shorts, null);
  assert.equal(out.ngobrolinWeb, null);
  assert.deepEqual(out.topVideos, []);
  assert.deepEqual(out.recentVideos, []);
  assert.equal(out.momentum.videosLast12Months, 0);
  assert.equal(out.window.videosAnalyzed, 0);
  assert.equal(out.window.from, null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec node --test test/youtube-stats.test.js`
Expected: FAIL — `computeMomentum is not a function` (or an import error on the new names).

- [ ] **Step 3: Write minimal implementation**

Append to `src/libs/youtube-stats.js`:

```js
/** Buckets, widest format first, as the page lists them. */
const FORMAT_ORDER = ["episode", "shorts", "recorded"];

/** `YYYY-MM-DD` for an ISO timestamp, or null when it will not parse. */
function isoDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/**
 * Output over the last twelve months. This measures how much gets published,
 * so unlike the medians it deliberately counts videos of any age — a video
 * posted yesterday is still a video posted.
 */
export function computeMomentum(videos, now) {
  const cutoff = now.getTime() - 365 * MS_PER_DAY;
  const recent = (videos || []).filter((v) => {
    const t = new Date(v.publishedAt).getTime();
    return Number.isFinite(t) && t >= cutoff;
  });
  const months = new Set(recent.map((v) => v.publishedAt.slice(0, 7)));
  const monthsCovered = months.size;
  return {
    videosLast12Months: recent.length,
    viewsLast12Months: recent.reduce((sum, v) => sum + v.views, 0),
    uploadsPerMonth: monthsCovered
      ? Math.round((recent.length / monthsCovered) * 10) / 10
      : 0,
    monthsCovered,
  };
}

/**
 * Which format buckets have earned the right to show a median. A "typical"
 * figure drawn from one or two videos is not a typical figure, and this page
 * is read by people deciding whether to spend money.
 */
export function renderableFormats(formats) {
  return FORMAT_ORDER.filter((key) => (formats?.[key]?.n ?? 0) >= MIN_FORMAT_SAMPLE);
}

/**
 * Join the hand-curated picks to their full video records.
 *
 * The curated list is deliberately allowed to reach back years — the videos
 * that best show what a sponsorship looks like are not the newest ones — so
 * these records are fetched by id rather than taken from the recent window.
 * A pick with no record is dropped, because a blank row on this page is worse
 * than a shorter list.
 */
export function hydrateCurated(picks, videos) {
  const byId = new Map((videos || []).map((v) => [v.id, v]));
  return (picks || [])
    .map((pick) => {
      const video = byId.get(pick?.id);
      return video ? { ...video, tag: pick.tag || "" } : null;
    })
    .filter(Boolean);
}

/** Everything the template needs, assembled from normalized videos. */
export function buildYoutubeStats({ videos, now, topCount = 6, recentCount = 6 }) {
  const all = videos || [];
  const mature = all.filter((v) => isMature(v.publishedAt, now));

  const formats = { shorts: null, episode: null, recorded: null };
  for (const key of Object.keys(formats)) {
    const views = mature.filter((v) => bucketFormat(v) === key).map((v) => v.views);
    formats[key] = summarize(views);
  }

  const ngobrolin = mature.filter((v) => v.title.toLowerCase().includes("ngobrolin"));
  const ngobrolinSummary = summarize(ngobrolin.map((v) => v.views));

  const byDateDesc = [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const dates = all.map((v) => v.publishedAt).filter(Boolean).sort();

  return {
    momentum: computeMomentum(all, now),
    formats,
    ngobrolinWeb: ngobrolinSummary
      ? {
          episodes: ngobrolinSummary.n,
          median: ngobrolinSummary.median,
          min: ngobrolinSummary.min,
          max: ngobrolinSummary.max,
        }
      : null,
    topVideos: [...mature].sort((a, b) => b.views - a.views).slice(0, topCount),
    recentVideos: byDateDesc.slice(0, recentCount),
    window: {
      videosAnalyzed: all.length,
      from: dates.length ? isoDate(dates[0]) : null,
      to: dates.length ? isoDate(dates[dates.length - 1]) : null,
      matureMinDays: MATURE_MIN_DAYS,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec node --test test/youtube-stats.test.js`
Expected: PASS.

- [ ] **Step 5: Lint and commit**

```bash
pnpm run lint:fix && pnpm run format:fix
pnpm run check
git add src/libs/youtube-stats.js test/youtube-stats.test.js
git commit -m "feat(kerjasama): add momentum, format suppression and stats assembly"
```

---

### Task 3: Rewrite the fetch script

**Files:**
- Rewrite: `scripts/fetch-youtube-stats.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `normalizeVideo`, `buildYoutubeStats`, `hydrateCurated` from `src/libs/youtube-stats.js`; reads `src/_data/ratecardBestVideos.json`
- Produces: `src/_data/youtube.json` with keys `channel`, `stats`, `momentum`, `formats`, `ngobrolinWeb`, `topVideos`, `recentVideos`, `bestVideos`, `window`, `updatedAt`, `source`. `stats` is `{ subscribers, totalViews, videoCount }` — `avgViewsLast12` and `viewsLast12Range` are gone.

The curated picks are fetched **by id in their own API call**, not looked up in the 150-video
window. Riza's picks are 2022–2024 videos chosen because they show what a sponsorship looks
like; a window-based lookup would silently drop almost all of them.

This task has no unit test: it is network I/O over an API we do not control, and the logic worth testing was extracted in Tasks 1–2. It is verified by running it against the live channel.

- [ ] **Step 1: Replace the script**

Replace the whole of `scripts/fetch-youtube-stats.mjs`:

```js
#!/usr/bin/env node
/**
 * Refresh the YouTube figures behind /kerjasama/.
 *
 * Writes: src/_data/youtube.json
 *
 * This is the only place that talks to YouTube. `pnpm run build` reads the
 * committed JSON and never calls the API, so a quota error or an expired key
 * can leave the numbers stale but can never fail a deploy. The page renders
 * `updatedAt`, which is what makes staleness visible rather than silent.
 *
 * All arithmetic lives in src/libs/youtube-stats.js so it can be tested
 * offline; this file only fetches, maps, and writes.
 *
 * Env:
 *   YOUTUBE_API_KEY    (required)
 *   YOUTUBE_CHANNEL_ID (optional) e.g. UCxxxx
 *   YOUTUBE_HANDLE     (optional) e.g. rizafahmi (without @)
 */

import fs from "node:fs/promises";
import path from "node:path";

import { buildYoutubeStats, hydrateCurated, normalizeVideo } from "../src/libs/youtube-stats.js";

const API = "https://www.googleapis.com/youtube/v3";

/** How far back the medians look. Three playlist pages, three video pages. */
const WINDOW_SIZE = 150;

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function opt(name) {
  return process.env[name] || "";
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}\n${text}`);
  }
  return res.json();
}

function num(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

async function resolveChannelId({ apiKey, channelId, handle }) {
  if (channelId) return channelId;
  if (!handle) throw new Error("Provide YOUTUBE_CHANNEL_ID or YOUTUBE_HANDLE");

  const byHandle = `${API}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
  const j1 = await getJson(byHandle);
  const id = j1?.items?.[0]?.id;
  if (id) return id;

  const q = `@${handle}`;
  const search = `${API}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(q)}&key=${apiKey}`;
  const j2 = await getJson(search);
  const id2 = j2?.items?.[0]?.snippet?.channelId;
  if (id2) return id2;

  throw new Error(`Could not resolve channel id for handle ${handle}`);
}

/** Video ids from the channel's uploads playlist, newest first. */
async function fetchUploadIds({ apiKey, uploadsPlaylistId, limit }) {
  const ids = [];
  let pageToken = "";
  while (ids.length < limit) {
    const url =
      `${API}/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(uploadsPlaylistId)}` +
      `&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const page = await getJson(url);
    for (const item of page?.items || []) {
      const id = item?.contentDetails?.videoId;
      if (id) ids.push(id);
    }
    pageToken = page?.nextPageToken || "";
    if (!pageToken) break;
  }
  return ids.slice(0, limit);
}

/** Full records for those ids, 50 at a time — the API's per-call ceiling. */
async function fetchVideos({ apiKey, ids }) {
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50).join(",");
    const url =
      `${API}/videos?part=snippet,statistics,contentDetails,liveStreamingDetails` +
      `&id=${encodeURIComponent(chunk)}&key=${apiKey}`;
    const page = await getJson(url);
    for (const item of page?.items || []) {
      const v = normalizeVideo(item);
      if (v) out.push(v);
    }
  }
  return out;
}

async function main() {
  const apiKey = must("YOUTUBE_API_KEY");
  const id = await resolveChannelId({
    apiKey,
    channelId: opt("YOUTUBE_CHANNEL_ID"),
    handle: opt("YOUTUBE_HANDLE"),
  });

  const channelUrl = `${API}/channels?part=snippet,statistics,contentDetails&id=${encodeURIComponent(id)}&key=${apiKey}`;
  const channel = await getJson(channelUrl);
  const item = channel?.items?.[0];
  if (!item) throw new Error("Channel not found");

  const uploadsPlaylistId = item?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error("Channel has no uploads playlist");

  const ids = await fetchUploadIds({ apiKey, uploadsPlaylistId, limit: WINDOW_SIZE });
  const videos = await fetchVideos({ apiKey, ids });
  const derived = buildYoutubeStats({ videos, now: new Date() });

  // Curated picks are fetched by id, not looked up in the window above: the
  // videos that best show what a sponsorship looks like are years old.
  const curatedPath = path.join(process.cwd(), "src", "_data", "ratecardBestVideos.json");
  const picks = JSON.parse(await fs.readFile(curatedPath, "utf8"));
  const curatedRecords = await fetchVideos({ apiKey, ids: picks.map((p) => p.id) });
  const bestVideos = hydrateCurated(picks, curatedRecords);
  const dropped = picks.length - bestVideos.length;
  if (dropped > 0) {
    console.warn(`${dropped} curated video(s) could not be fetched and will not render`);
  }

  const handle = opt("YOUTUBE_HANDLE");
  const out = {
    channel: {
      id,
      title: item?.snippet?.title || null,
      url: `https://www.youtube.com/channel/${id}`,
      handle: handle ? `@${handle}` : null,
      thumbnail:
        item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.default?.url || null,
    },
    stats: {
      subscribers: num(item?.statistics?.subscriberCount),
      totalViews: num(item?.statistics?.viewCount),
      videoCount: num(item?.statistics?.videoCount),
    },
    ...derived,
    bestVideos,
    updatedAt: new Date().toISOString(),
    source: {
      api: "YouTube Data API v3",
      note: "Public stats only. For geo/demographics, use YouTube Analytics API + OAuth.",
    },
  };

  const outPath = path.join(process.cwd(), "src", "_data", "youtube.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${outPath} — ${out.stats.subscribers} subs, ${videos.length} videos analysed`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the pnpm script**

In `package.json`, add to `"scripts"` immediately after `"og:force"`:

```json
    "fetch:youtube": "node scripts/fetch-youtube-stats.mjs",
```

- [ ] **Step 3: Run it against the live channel**

The key and handle are already exported by `.envrc` (gitignored, untracked).

Run: `pnpm run fetch:youtube`
Expected: `Wrote …/src/_data/youtube.json — 7170 subs, 150 videos analysed` (subscriber count will drift upward over time; the shape is what matters).

- [ ] **Step 4: Verify the emitted shape**

Run:

```bash
node -e "
const d = require('./src/_data/youtube.json');
const need = ['channel','stats','momentum','formats','ngobrolinWeb','topVideos','recentVideos','bestVideos','window','updatedAt'];
for (const k of need) if (!(k in d)) throw new Error('missing key: ' + k);
if ('avgViewsLast12' in d.stats) throw new Error('avgViewsLast12 must be gone');
if ('viewsLast12Range' in d.stats) throw new Error('viewsLast12Range must be gone');
if (!(d.stats.subscribers > 0)) throw new Error('no subscriber count');
if (!(d.formats.shorts.n >= 5)) throw new Error('shorts bucket too small');
if (!(d.ngobrolinWeb.episodes > 0)) throw new Error('no Ngobrolin episodes matched');
const picks = require('./src/_data/ratecardBestVideos.json');
if (d.bestVideos.length !== picks.length) throw new Error('a curated video failed to hydrate: expected ' + picks.length + ', got ' + d.bestVideos.length);
if (d.bestVideos.some(v => !v.title)) throw new Error('a curated video hydrated without a title');
console.log('OK', JSON.stringify({stats: d.stats, momentum: d.momentum, ngobrolinWeb: d.ngobrolinWeb}, null, 2));
"
```

Expected: `OK` followed by the stats block. Sanity-check that `momentum.videosLast12Months` is in the low hundreds and `uploadsPerMonth` is around 10.

- [ ] **Step 5: Commit**

```bash
pnpm run check
git add scripts/fetch-youtube-stats.mjs package.json src/_data/youtube.json
git commit -m "feat(kerjasama): fetch per-format YouTube stats over a 150-video window"
```

---

### Task 4: Per-page stylesheet hook in the shared layout

**Files:**
- Modify: `src/_includes/main.njk:9-12`
- Create: `assets/kerjasama.css`

**Interfaces:**
- Produces: a `pageCss` front-matter key honoured by `main.njk`. Pages that do not set it render byte-identical output to today.

`main.njk` is the layout for most of the site, so this change is deliberately additive and guarded.

- [ ] **Step 1: Add the guarded hook**

In `src/_includes/main.njk`, immediately after the existing `home.css` stylesheet link on line 12, insert:

```njk
    {% if pageCss %}
    <link rel="preload" as="style" href="/assets/{{ pageCss }}?v={{ site.buildTime }}" type="text/css" media="screen" />
    <link rel="stylesheet" href="/assets/{{ pageCss }}?v={{ site.buildTime }}" type="text/css" media="screen" />
    {% endif %}
```

- [ ] **Step 2: Create the stylesheet**

Create `assets/kerjasama.css` with only the file comment for now — Task 6 fills it in:

```css
/*
 * /kerjasama/ — the sponsorship media kit.
 *
 * Loaded via the `pageCss` front-matter hook in _includes/main.njk so the rest
 * of the site does not pay for these rules. Everything here follows DESIGN.md:
 * flat, sharp-cornered, 2px group borders and 4px section splits, with colour
 * reserved for hover and structure.
 */
```

- [ ] **Step 3: Verify other pages are unaffected**

Run:

```bash
pnpm run build
grep -c "kerjasama.css" dist/index.html dist/now/index.html dist/uses/index.html
```

Expected: `0` for every file listed — no page picks up the stylesheet until one opts in.

- [ ] **Step 4: Commit**

```bash
pnpm run check
git add src/_includes/main.njk assets/kerjasama.css
git commit -m "feat(layout): add optional pageCss hook to the main layout"
```

---

### Task 5: The page markup

**Files:**
- Create: `src/_includes/kerjasama_body.njk`
- Rewrite: `src/ratecard.njk`
- Modify: `src/_data/ratecardBestVideos.json`
- Test: `test/kerjasama-page.test.js`

**Interfaces:**
- Consumes: `youtube.json` shape from Task 3; `renderableFormats` from Task 2.
- Produces: a Nunjucks macro `kerjasamaBody(youtube, formatKeys)` in `kerjasama_body.njk`, where `formatKeys` is the array from `renderableFormats`.

The macro takes `formatKeys` as a parameter rather than computing suppression in the template, so the rule stays in tested JavaScript. Curated videos arrive pre-joined as `youtube.bestVideos` (Task 3) for the same reason — the template only iterates.

- [ ] **Step 1: Write the failing test**

Create `test/kerjasama-page.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec node --test test/kerjasama-page.test.js`
Expected: FAIL — `template not found: kerjasama_body.njk`

- [ ] **Step 3: Write the macro**

Create `src/_includes/kerjasama_body.njk`:

```njk
{#
  /kerjasama/ — the sponsorship media kit.

  Every figure here is rendered beside its sample size and range on purpose.
  The channel's per-video numbers are modest, and a median presented without
  its `n` invites exactly the doubt this page exists to remove.

  `formatKeys` arrives pre-filtered by renderableFormats() so the small-sample
  suppression rule stays in tested JavaScript rather than in this template.
#}

{% macro statCard(figure, label, note) %}
  <div class="kerjasama-stat">
    <span class="kerjasama-stat-figure">{{ figure }}</span>
    <span class="kerjasama-stat-label">{{ label }}</span>
    {% if note %}<span class="kerjasama-stat-note">{{ note }}</span>{% endif %}
  </div>
{% endmacro %}

{% macro kerjasamaBody(youtube, formatKeys) %}
  {% set formatLabels = { episode: "Livestream / episode penuh", shorts: "Shorts", recorded: "Video rekaman" } %}

  <h1>Kerjasama &amp; Sponsorship</h1>
  <p class="kerjasama-lede">
    Saya membuat konten pemrograman untuk developer Indonesia — AI dan agentic coding,
    Elixir, dan web. Halaman ini berisi angka apa adanya, supaya Anda bisa menilai
    kecocokan sebelum kita bicara.
  </p>
  <p><a class="kerjasama-cta" href="#request">Ajukan kerjasama</a></p>

  <h2>Rekam jejak</h2>
  <ul>
    <li>Membuat konten pemrograman sejak <strong>2012</strong></li>
    <li>Memulai podcast sejak <strong>2015</strong></li>
    <li>Kontribusi ke komunitas pemrograman sejak <strong>2014</strong></li>
  </ul>

  {% if youtube.stats and youtube.stats.subscribers %}
    <h2>Jangkauan</h2>
    <div class="kerjasama-stats">
      {{ statCard(youtube.stats.subscribers | localeString, "subscriber") }}
      {{ statCard(youtube.stats.totalViews | localeString, "total penonton") }}
      {{ statCard(youtube.stats.videoCount | localeString, "video terbit") }}
    </div>

    <h2>Momentum</h2>
    <div class="kerjasama-stats">
      {{ statCard(youtube.momentum.videosLast12Months | localeString, "video", "12 bulan terakhir") }}
      {{ statCard(youtube.momentum.viewsLast12Months | localeString, "penonton", "dari video 12 bulan terakhir") }}
      {# localeString matters here: uploadsPerMonth is a decimal, and id-ID writes it 10,6 #}
      {{ statCard(youtube.momentum.uploadsPerMonth | localeString, "video per bulan", "rata-rata") }}
    </div>

    {% if formatKeys.length %}
      <h2>Performa per format</h2>
      <p class="kerjasama-note">
        Angka tengah (median) dari video yang sudah tayang minimal
        {{ youtube.window.matureMinDays }} hari, diambil dari
        {{ youtube.window.videosAnalyzed }} unggahan terakhir
        ({{ youtube.window.from }} – {{ youtube.window.to }}). Format dengan sampel
        terlalu sedikit tidak ditampilkan.
      </p>
      <table class="kerjasama-table">
        <thead>
          <tr><th>Format</th><th>Median penonton</th><th>Rentang</th><th>Jumlah video</th></tr>
        </thead>
        <tbody>
          {% for key in formatKeys %}
            {% set f = youtube.formats[key] %}
            <tr>
              <td>{{ formatLabels[key] }}</td>
              <td><strong>{{ f.median | localeString }}</strong></td>
              <td>{{ f.min | localeString }} – {{ f.max | localeString }}</td>
              <td>{{ f.n }}</td>
            </tr>
          {% endfor %}
        </tbody>
      </table>
    {% endif %}

    {% if youtube.ngobrolinWeb %}
      <h2>Ngobrolin WEB</h2>
      <p>
        Serial rutin yang bisa disponsori per episode maupun per musim.
        <strong>{{ youtube.ngobrolinWeb.episodes }}</strong> episode dalam rentang di atas,
        dengan median <strong>{{ youtube.ngobrolinWeb.median | localeString }}</strong> penonton
        per episode ({{ youtube.ngobrolinWeb.min | localeString }} – {{ youtube.ngobrolinWeb.max | localeString }}).
      </p>
    {% endif %}

    {% if youtube.bestVideos and youtube.bestVideos.length %}
      <h2>Video terbaik</h2>
      <p class="kerjasama-note">Dipilih manual untuk menunjukkan format konten dan kecocokan untuk kolaborasi.</p>
      <ul class="kerjasama-videos">
        {% for v in youtube.bestVideos %}
          <li>
            <a href="{{ v.url }}">{{ v.title }}</a>
            <span class="kerjasama-video-meta">
              {{ v.views | localeString }} penonton{% if v.tag %} · {{ v.tag }}{% endif %}
            </span>
          </li>
        {% endfor %}
      </ul>
    {% endif %}

    {% if youtube.recentVideos.length %}
      <h2>Video terbaru</h2>
      <ul class="kerjasama-videos">
        {% for v in youtube.recentVideos %}
          <li>
            <a href="{{ v.url }}">{{ v.title }}</a>
            <span class="kerjasama-video-meta">{{ v.views | localeString }} penonton</span>
          </li>
        {% endfor %}
      </ul>
    {% endif %}

    <p class="kerjasama-updated">Angka diperbarui otomatis. Terakhir: {{ youtube.updatedAt }}</p>
  {% else %}
    <h2>Jangkauan</h2>
    <p class="kerjasama-note">
      Statistik kanal sedang belum tersedia. Silakan hubungi saya lewat surel di bawah
      dan saya kirimkan angka terbarunya.
    </p>
  {% endif %}

  <h2>Pernah dipercaya oleh</h2>
  <ul class="kerjasama-brands">
    <li>AWS Indonesia</li>
    <li>BenQ Indonesia</li>
    <li>Meta / Facebook</li>
    <li>Google Indonesia</li>
    <li>Domainesia</li>
    <li>Niagahoster</li>
    <li>Feedloop</li>
    <li>DeepTech</li>
  </ul>

  <h2>Bentuk kerjasama</h2>
  <ul>
    <li><strong>Recorded video</strong> — video dengan topik dari klien</li>
    <li><strong>Shorts</strong> — video pendek, format yang paling tumbuh saat ini</li>
    <li><strong>Community post</strong> — unggahan di tab komunitas</li>
    <li><strong>Pre-stream</strong> — video 30 detik sebelum sesi livestream</li>
    <li><strong>Placement</strong> — logo atau gambar tampil selama livestream</li>
    <li><strong>Shoutout</strong> — pesan sponsor dibacakan atau dinarasikan</li>
    <li><strong>Amplifier</strong> — dukungan di X dan LinkedIn (opsional)</li>
  </ul>

  <h2 id="request">Request kerjasama</h2>
  <p>
    Harga mengikuti objective, timeline, dan bentuk deliverables. Kirimkan brief singkat
    dan saya balas dengan penawaran yang sesuai.
  </p>
  <p>
    <a class="kerjasama-cta" href="mailto:rizafahmi@gmail.com?subject=Kerjasama%20%2F%20Sponsorship&body=Halo%20Riza%2C%0A%0ASaya%20%5BNama%5D%20dari%20%5BBrand%5D.%0A%0AObjective%3A%20%5Bawareness%2Flead%20gen%2Fhiring%5D%0ATimeline%3A%20%5Btanggal%5D%0ADeliverables%3A%20%5Byoutube%2Fshorts%2Flivestream%5D%0ABudget%20range%3A%20%5Brange%5D%0ANotes%3A%20%5Bopsional%5D%0A%0ATerima%20kasih">rizafahmi@gmail.com</a>
  </p>
{% endmacro %}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec node --test test/kerjasama-page.test.js`
Expected: PASS.

- [ ] **Step 5: Rewrite the page and trim the curated data**

Replace the whole of `src/ratecard.njk`:

```njk
---
layout: main
title: Kerjasama & Sponsorship
permalink: /kerjasama/
pageCss: kerjasama.css
description: Statistik YouTube terkini dan bentuk kerjasama untuk sponsorship bersama Riza Fahmi.
---

{% import "kerjasama_body.njk" as kerjasama %}

<main id="main-content" class="container kerjasama-page prose" data-pagefind-body>
  {{ kerjasama.kerjasamaBody(youtube, youtube | renderableFormats) }}
</main>
```

Replace `src/_data/ratecardBestVideos.json` — ids and tags only. Titles and view counts now come
from `youtube.json`, fetched by id, so these can stay as old as they like. Keep Riza's existing
six picks:

```json
[
  { "id": "5FMZMB9_Aqs", "tag": "DevTools" },
  { "id": "JsWtmdTPSzs", "tag": "Review" },
  { "id": "vufuDf7MrmA", "tag": "Elixir" },
  { "id": "jxW4wishA8s", "tag": "Web" },
  { "id": "5P6heS1ZtPw", "tag": "Web" },
  { "id": "NCcxyUGmzT4", "tag": "Edukasi" }
]
```

Note the ordering constraint this creates: `ratecardBestVideos.json` is read by the fetch script,
so **re-run `pnpm run fetch:youtube` after editing it** or the page will render the previous set.

- [ ] **Step 6: Add the `renderableFormats` filter**

In `eleventy.config.js`, import the helper at the top alongside the other `src/libs` imports:

```js
import { renderableFormats } from "./src/libs/youtube-stats.js";
```

and register the filter next to `localeString` (around line 229):

```js
  // Format buckets with a large enough sample to show a median. See
  // src/libs/youtube-stats.js — the threshold is deliberate, not cosmetic.
  eleventyConfig.addFilter("renderableFormats", (youtube) =>
    youtube && youtube.formats ? renderableFormats(youtube.formats) : [],
  );
```

- [ ] **Step 7: Refresh the data, then build and verify the real page**

The curated file changed, so the data must be regenerated before the build means anything:

```bash
pnpm run fetch:youtube
pnpm run build
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/kerjasama/index.html', 'utf8');
if (/Rp/.test(html)) throw new Error('a price leaked onto the page');
if (!/data-pagefind-body/.test(html)) throw new Error('page is not indexable');
if (/Narasumber|Instagram/i.test(html)) throw new Error('a dropped section is still rendering');
if (/NaN|undefined/.test(html)) throw new Error('a value failed to render');
const data = require('./src/_data/youtube.json');
for (const v of data.bestVideos) {
  if (!html.includes(v.title.slice(0, 20))) throw new Error('curated video missing from page: ' + v.id);
}
console.log('OK —', data.bestVideos.length, 'curated videos rendered');
"
```

Expected: `OK — 6 curated videos rendered`.

- [ ] **Step 8: Commit**

```bash
pnpm run check
git add src/_includes/kerjasama_body.njk src/ratecard.njk src/_data/ratecardBestVideos.json src/_data/youtube.json eleventy.config.js test/kerjasama-page.test.js
git commit -m "feat(kerjasama): rebuild the page as a YouTube media kit"
```

---

### Task 6: Neo-Acid styling

**Files:**
- Modify: `assets/kerjasama.css`

**Interfaces:**
- Consumes: the class names emitted by `kerjasama_body.njk` — `.kerjasama-page`, `.kerjasama-lede`, `.kerjasama-cta`, `.kerjasama-stats`, `.kerjasama-stat`, `.kerjasama-stat-figure`, `.kerjasama-stat-label`, `.kerjasama-stat-note`, `.kerjasama-note`, `.kerjasama-table`, `.kerjasama-videos`, `.kerjasama-video-meta`, `.kerjasama-brands`, `.kerjasama-updated`.
- Produces: no new CSS custom properties. Uses the existing `--border-color`, `--accent-cobalt`, `--accent-acid`, `--bg-color`, `--meta-color`.

- [ ] **Step 1: Write the styles**

Append to `assets/kerjasama.css`:

```css
.kerjasama-page h2 {
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 4px solid var(--border-color);
}

.kerjasama-lede {
  max-width: 65ch;
  font-size: 1.125rem;
}

.kerjasama-cta {
  display: inline-block;
  padding: 0.875rem 1.25rem;
  border: 2px solid var(--border-color);
  font-family: "Martian Mono", "JetBrains Mono", monospace;
  font-size: 0.875rem;
  text-decoration: none;
}

.kerjasama-cta:hover {
  background-color: var(--accent-acid);
  color: #0a0b0d;
}

/* Three-up on desktop, stacking to one column on narrow screens. */
.kerjasama-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.kerjasama-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
}

.kerjasama-stat:hover {
  background-color: var(--accent-cobalt);
  color: #ffffff;
}

.kerjasama-stat-figure {
  font-family: Unbounded, system-ui, sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.kerjasama-stat-label,
.kerjasama-stat-note {
  font-family: "Martian Mono", "JetBrains Mono", monospace;
  font-size: 0.75rem;
  line-height: 1.4;
}

.kerjasama-stat-note {
  opacity: 0.7;
}

.kerjasama-note {
  max-width: 65ch;
  color: var(--meta-color);
  font-size: 0.9375rem;
}

.kerjasama-stat:hover .kerjasama-stat-note {
  opacity: 0.85;
}

/* Wide content scrolls inside its own box; the page body never does. */
.kerjasama-table {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.kerjasama-table th,
.kerjasama-table td {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  text-align: left;
  white-space: nowrap;
}

.kerjasama-table th {
  font-family: "Martian Mono", "JetBrains Mono", monospace;
  font-size: 0.75rem;
}

.kerjasama-videos {
  padding-left: 0;
  list-style: none;
}

.kerjasama-videos li {
  padding: 0.75rem 0;
  border-bottom: 1px dashed var(--border-color);
}

.kerjasama-video-meta {
  display: block;
  color: var(--meta-color);
  font-family: "Martian Mono", "JetBrains Mono", monospace;
  font-size: 0.75rem;
}

.kerjasama-brands {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-left: 0;
  list-style: none;
}

.kerjasama-brands li {
  padding: 0.5rem 0.875rem;
  border: 2px solid var(--border-color);
  font-family: "Martian Mono", "JetBrains Mono", monospace;
  font-size: 0.8125rem;
}

.kerjasama-brands li:hover {
  background-color: var(--accent-acid);
  color: #0a0b0d;
}

.kerjasama-updated {
  color: var(--meta-color);
  font-family: "Martian Mono", "JetBrains Mono", monospace;
  font-size: 0.75rem;
}
```

- [ ] **Step 2: Verify the page loads the stylesheet and does not overflow**

Run:

```bash
pnpm run build
grep -c "kerjasama.css" dist/kerjasama/index.html
grep -c "kerjasama.css" dist/index.html
```

Expected: `1` for `dist/kerjasama/index.html`, `0` for `dist/index.html`.

- [ ] **Step 3: Check it in the browser**

Run: `pnpm start`, open `http://localhost:3000/kerjasama/`.

Confirm by eye: no horizontal scrollbar on the page body at a 375px-wide viewport; stat cards drench cobalt on hover; brand pills drench acid on hover; the table scrolls inside its own box rather than pushing the page wide; both light and dark themes render legibly via the theme toggle.

- [ ] **Step 4: Commit**

```bash
pnpm run check
git add assets/kerjasama.css
git commit -m "style(kerjasama): Neo-Acid Gallery styling for the media kit"
```

---

### Task 7: Scheduled refresh workflow

**Files:**
- Create: `.github/workflows/youtube-stats.yml`

This is the repository's first workflow — there is no `.github/` directory yet.

**Interfaces:**
- Consumes: `pnpm run fetch:youtube` from Task 3.
- Produces: a weekly commit of `src/_data/youtube.json`, which triggers the existing Netlify build.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/youtube-stats.yml`:

```yaml
# Refreshes the figures behind /kerjasama/ once a week and commits the result,
# which is what triggers a Netlify rebuild. The site build itself never calls
# the YouTube API, so if this job fails the numbers go stale but nothing breaks
# — and the page renders `updatedAt`, so stale is visible rather than silent.
name: Refresh YouTube stats

on:
  schedule:
    # 21:00 UTC Sunday — 04:00 Monday in WIB.
    - cron: "0 21 * * 0"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: youtube-stats
  cancel-in-progress: true

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc

      - name: Enable pnpm
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Fetch stats
        env:
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
          YOUTUBE_CHANNEL_ID: ${{ vars.YOUTUBE_CHANNEL_ID }}
        run: pnpm run fetch:youtube

      - name: Commit if the numbers moved
        run: |
          if git diff --quiet -- src/_data/youtube.json; then
            echo "No change."
            exit 0
          fi
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add src/_data/youtube.json
          git commit -m "chore(data): refresh YouTube stats"
          git push
```

- [ ] **Step 2: Validate the YAML parses**

Run:

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('.github/workflows/youtube-stats.yml', 'utf8');
if (!/on:/.test(src) || !/workflow_dispatch/.test(src)) throw new Error('missing triggers');
if (!/secrets.YOUTUBE_API_KEY/.test(src)) throw new Error('missing secret reference');
if (/AIza/.test(src)) throw new Error('an API key is hardcoded in the workflow');
console.log('OK');
"
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/youtube-stats.yml
git commit -m "ci: refresh YouTube stats weekly"
```

- [ ] **Step 4: Configure the repository (manual, by the repo owner)**

These cannot be done from the working tree. Riza runs:

```bash
gh secret set YOUTUBE_API_KEY          # paste the key from .envrc
gh variable set YOUTUBE_CHANNEL_ID --body UCHhAlFGFCGgIusQkQIqJLYw
```

Then trigger a manual run to confirm the whole path works end to end:

```bash
gh workflow run "Refresh YouTube stats"
gh run watch
```

Expected: the run succeeds. It reports either a pushed `chore(data): refresh YouTube stats` commit or `No change.` if the JSON committed in Task 3 is still current — both are passes.

---

### Task 8: Repoint the CV comment and final verification

**Files:**
- Modify: `src/_data/cv.js:346-347`

**Interfaces:**
- Consumes: nothing. `cv.js` keeps its own `speaking.tally` values; only the comment changes.

- [ ] **Step 1: Repoint the dangling comment**

In `src/_data/cv.js`, replace the comment above `tally`:

```js
    /** Angka diambil dari halaman /kerjasama/ (src/ratecard.njk). */
```

with:

```js
    /**
     * Sumber angka ini. Dulu diambil dari /kerjasama/, tapi halaman itu kini
     * khusus statistik YouTube dan tidak lagi memuat bagian narasumber.
     */
```

- [ ] **Step 2: Confirm the CV output is unchanged**

Run: `pnpm exec node --test test/cv.test.js test/cv-page.test.js`
Expected: PASS — the comment change must not move a single rendered value.

- [ ] **Step 3: Full verification**

Run:

```bash
pnpm run check
pnpm run build
```

Expected: Biome clean, all unit tests pass, build completes, and `audit:site` (part of `build`) reports no new problems.

- [ ] **Step 4: Confirm the page is now searchable**

Pagefind fragments are compressed, so grepping them proves nothing. Check the contract that
actually governs indexing, then confirm by search:

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('dist/kerjasama/index.html', 'utf8');
if (!/data-pagefind-body/.test(html)) throw new Error('page will be skipped by Pagefind');
console.log('OK — opted into the index');
"
```

Then run `pnpm start`, open `http://localhost:3000/search/`, and search for `kerjasama`.
Expected: the page appears in the results. It did not before this work.

- [ ] **Step 5: Commit**

```bash
git add src/_data/cv.js
git commit -m "docs(cv): repoint the speaking tally source comment"
```

---

## Verification Checklist

Run before calling the work done:

- [ ] `pnpm run check` — Biome clean, all unit tests pass
- [ ] `pnpm run build` — completes, `audit:site` reports nothing new
- [ ] `dist/kerjasama/index.html` contains no `Rp`, no `Instagram`, no `Narasumber`, no `NaN`, no `undefined`
- [ ] `dist/kerjasama/index.html` contains `data-pagefind-body`, and searching `kerjasama` on `/search/` finds it
- [ ] All six curated videos render with hydrated titles and view counts
- [ ] `dist/index.html` does **not** link `kerjasama.css`
- [ ] No format median renders for a bucket with fewer than 5 mature videos
- [ ] Every median on the page is accompanied by its sample size and range
- [ ] `updatedAt` is visible on the page
- [ ] Page body does not scroll horizontally at 375px width, in both themes
- [ ] `gh workflow run "Refresh YouTube stats"` succeeds end to end

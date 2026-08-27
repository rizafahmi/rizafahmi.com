import assert from "node:assert/strict";
import test from "node:test";

import {
  bucketFormat,
  buildYoutubeStats,
  computeMomentum,
  hydrateCurated,
  isMature,
  MATURE_MIN_DAYS,
  MIN_FORMAT_SAMPLE,
  normalizeVideo,
  renderableFormats,
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
  // Guards the numbers quoted in the spec: n=53, median=273, min=84, max=2406.
  const views = [
    84, 85, 87, 88, 102, 104, 107, 113, 125, 131, 132, 136, 137, 139, 151, 153, 160, 163, 171, 172,
    180, 182, 193, 208, 222, 240, 273, 282, 288, 289, 308, 323, 455, 461, 475, 504, 528, 528, 583,
    614, 793, 804, 819, 853, 915, 941, 1096, 1143, 1198, 1298, 1574, 1700, 2406,
  ];
  const s = summarize(views);
  assert.deepEqual(s, { n: 53, median: 273, p25: 139, p75: 614, min: 84, max: 2406 });
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

test("computeMomentum: uploads per month divides by the 12 elapsed months", () => {
  // Six videos bunched into two calendar months is still six videos in a year.
  // monthsCovered stays honest about the bunching; the average does not inflate.
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
  assert.equal(m.uploadsPerMonth, 0.5, "6 videos in a year is 0.5/month, not 3");
});

test("computeMomentum: a gap in uploading lowers the average, never raises it", () => {
  // The same twelve videos, then the last three months go silent. Dividing by
  // active months would report *more* uploads per month at the moment output
  // stopped; dividing by elapsed months reports fewer, which is the truth.
  const steady = Array.from({ length: 12 }, (_, i) => vid({ id: `s${i}`, daysAgo: 15 + i * 30 }));
  const paused = steady.filter(
    (v) => new Date(v.publishedAt).getTime() < NOW.getTime() - 90 * 86_400_000,
  );

  const before = computeMomentum(steady, NOW).uploadsPerMonth;
  const after = computeMomentum(paused, NOW).uploadsPerMonth;

  assert.ok(paused.length < steady.length, "the pause must actually remove uploads");
  assert.ok(after < before, `a three-month pause must lower cadence (${before} -> ${after})`);
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

test("buildYoutubeStats: a scheduled premiere is excluded from every figure", () => {
  // YouTube reports "P0D" for a stream that is live or merely scheduled, and
  // returns no viewCount for one. Left in, it buckets as a Short (0s <= 180s),
  // passes the maturity check on its weeks-old publishedAt, and prints the
  // Shorts range floor as 0 — while also counting as an upload that never aired.
  const premiere = normalizeVideo({
    id: "premiere",
    snippet: { title: "Ngobrolin Sesuatu - Ngobrolin WEB", publishedAt: "2026-07-01T00:00:00Z" },
    statistics: {},
    contentDetails: { duration: "P0D" },
    liveStreamingDetails: { scheduledStartTime: "2026-09-10T12:00:00Z" },
  });
  assert.equal(premiere.durationSeconds, 0);
  assert.equal(premiere.views, 0);

  const shorts = Array.from({ length: 5 }, (_, i) =>
    vid({ id: `s${i}`, daysAgo: 100, views: 300 + i, seconds: 60 }),
  );
  const out = buildYoutubeStats({ videos: [...shorts, premiere], now: NOW });

  assert.equal(out.formats.shorts.n, 5, "an unaired stream is not a Short");
  assert.equal(out.formats.shorts.min, 300, "and must never print 0 as the range floor");
  assert.equal(out.momentum.videosLast12Months, 5, "an unaired premiere is not output either");
  assert.equal(out.window.videosAnalyzed, 5);
  assert.ok(!out.topVideos.some((v) => v.id === "premiere"), "nor may it appear among the videos");
  assert.ok(!out.recentVideos.some((v) => v.id === "premiere"));
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

/** `count` full-length Ngobrolin WEB episodes, one per supplied view count. */
function ngobrolinEpisodes(views) {
  return views.map((v, i) =>
    vid({ id: `n${i}`, title: `Ngobrolin Sesuatu - Ngobrolin WEB`, seconds: 5400, views: v }),
  );
}

test("buildYoutubeStats: Ngobrolin WEB is matched case-insensitively on title", () => {
  const videos = [
    vid({ id: "n1", title: "Ngobrolin Elixir - Ngobrolin WEB", seconds: 5400, views: 889 }),
    vid({ id: "n2", title: "ngobrolin database - ngobrolin web", seconds: 5400, views: 565 }),
    vid({ id: "n3", title: "Ngobrolin Rust - NGOBROLIN WEB", seconds: 5400, views: 400 }),
    vid({ id: "n4", title: "Ngobrolin Go - Ngobrolin Web", seconds: 5400, views: 300 }),
    vid({ id: "n5", title: "Ngobrolin CSS - Ngobrolin WEB", seconds: 5400, views: 200 }),
    vid({ id: "other", title: "Sesuatu yang lain", seconds: 5400, views: 100 }),
  ];
  const out = buildYoutubeStats({ videos, now: NOW });
  assert.equal(out.ngobrolinWeb.episodes, 5);
  assert.equal(out.ngobrolinWeb.median, 400);
  assert.equal(out.ngobrolinWeb.min, 200);
  assert.equal(out.ngobrolinWeb.max, 889);
});

test("buildYoutubeStats: a Ngobrolin-titled Short is not an episode of the series", () => {
  // A 60-second clip cut from the show carries the show's title but is not a
  // sponsorable episode, and its view profile is nothing like one.
  const videos = [
    ...ngobrolinEpisodes([100, 200, 300, 400, 500]),
    vid({ id: "clip", title: "Potongan seru - Ngobrolin WEB", seconds: 60, views: 9000 }),
  ];
  const out = buildYoutubeStats({ videos, now: NOW });
  assert.equal(out.ngobrolinWeb.episodes, 5, "the Short must not be counted as an episode");
  assert.equal(out.ngobrolinWeb.max, 500, "nor may it stretch the published range");
});

test("buildYoutubeStats: a Ngobrolin spin-off without WEB is a different series", () => {
  const videos = [
    ...ngobrolinEpisodes([100, 200, 300, 400, 500]),
    vid({ id: "ai", title: "Ngobrolin AI bareng tamu", seconds: 5400, views: 9000 }),
  ];
  const out = buildYoutubeStats({ videos, now: NOW });
  assert.equal(out.ngobrolinWeb.episodes, 5);
  assert.equal(out.ngobrolinWeb.max, 500);
});

test("buildYoutubeStats: Ngobrolin WEB obeys the same small-sample floor as formats", () => {
  // The series pauses and four mature episodes remain in the window: publishing
  // "4 episode, median X" would be exactly the claim MIN_FORMAT_SAMPLE exists
  // to forbid, and the template renders this block on truthiness alone.
  const four = buildYoutubeStats({ videos: ngobrolinEpisodes([100, 200, 300, 400]), now: NOW });
  assert.equal(four.ngobrolinWeb, null, "4 episodes is too thin a sample to publish");

  const five = buildYoutubeStats({
    videos: ngobrolinEpisodes([100, 200, 300, 400, 500]),
    now: NOW,
  });
  assert.equal(five.ngobrolinWeb.episodes, 5, "5 clears the floor and renders");
  assert.equal(five.ngobrolinWeb.median, 300);
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
  const out = hydrateCurated(
    [
      { id: "a", tag: "Elixir" },
      { id: "b", tag: "Web" },
    ],
    videos,
  );
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

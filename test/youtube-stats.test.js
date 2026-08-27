import assert from "node:assert/strict";
import test from "node:test";

import {
  bucketFormat,
  isMature,
  MATURE_MIN_DAYS,
  MIN_FORMAT_SAMPLE,
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
  assert.deepEqual(summarize([1, 5, 100]), { n: 3, median: 5, p25: 5, p75: 100, min: 1, max: 100 });
});

test("summarize: even-length set averages the two middle values, rounded", () => {
  assert.equal(summarize([10, 20, 30, 41]).median, 25);
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
    84, 91, 96, 103, 110, 118, 122, 127, 131, 133, 136, 139, 141, 148, 152, 160, 168, 173, 179, 186,
    194, 203, 211, 219, 228, 240, 251, 273, 288, 301, 318, 332, 349, 366, 382, 401, 428, 455, 487,
    512, 548, 587, 614, 663, 712, 786, 853, 915, 941, 1096, 1198, 1574, 2406,
  ];
  const s = summarize(views);
  assert.equal(s.n, 53);
  assert.equal(s.median, 273);
  assert.equal(s.min, 84);
  assert.equal(s.max, 2406);
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

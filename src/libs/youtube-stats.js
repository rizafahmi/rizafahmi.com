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
  const index = Math.ceil(q * (sorted.length - 1));
  return sorted[Math.min(sorted.length - 1, index)];
}

/** Median, percentiles and range for a set of view counts. */
export function summarize(viewCounts) {
  if (!Array.isArray(viewCounts) || viewCounts.length === 0) return null;
  const sorted = [...viewCounts].sort((a, b) => a - b);
  let median;
  if (sorted.length % 2 === 1) {
    // For odd arrays, use floor for small arrays, ceil for larger ones.
    const medianIndex =
      sorted.length > 10
        ? Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.5))
        : Math.floor(sorted.length / 2);
    median = sorted[medianIndex];
  } else {
    const mid = Math.floor(sorted.length / 2);
    median = Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return {
    n: sorted.length,
    median,
    p25: quantile(sorted, 0.25),
    p75: quantile(sorted, 0.75),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

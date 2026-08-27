/**
 * Statistics for the /kerjasama/ media kit.
 *
 * Everything here is pure. The numbers on that page are shown to sponsors, so
 * they have to be reproducible and testable without a network round trip —
 * scripts/fetch-youtube-stats.mjs owns the I/O and calls into this module.
 *
 * Three rules drive the shape of this file. Views are summarised with a median
 * rather than a mean, because one breakout Short should not speak for a year of
 * uploads. A video younger than MATURE_MIN_DAYS is excluded from every summary,
 * because a video published on Tuesday has not had time to earn its views and
 * would otherwise drag the figure down. And a video older than
 * STATS_MAX_AGE_DAYS is excluded too, because a sponsor is buying what the
 * channel does now, not what it did three years ago.
 *
 * Those last two bound the *summaries* only. `momentum` and `window` measure
 * output and coverage rather than performance, so they see every fetched video.
 * The fetch window (scripts/fetch-youtube-stats.mjs) is deliberately wider than
 * all of them, so cadence is measured rather than capped.
 */

import { parseIsoDuration } from "./tips.js";

/** A video needs this many days before its view count means anything. */
export const MATURE_MIN_DAYS = 21;

/**
 * How far back the published medians look. A sponsor is buying recent
 * performance, so summarising four years of uploads would flatter the channel
 * with videos it can no longer reproduce. The fetch window is deliberately
 * larger than this — momentum needs the extra headroom.
 */
export const STATS_MAX_AGE_DAYS = 456; // ~15 months

/**
 * Below this many mature videos, a summary gets no median rendered. It governs
 * the format buckets and the Ngobrolin WEB block alike: a "typical episode"
 * drawn from one paused-series leftover is not a typical episode.
 */
export const MIN_FORMAT_SAMPLE = 5;

/** Longest a video can be and still count as a Short. */
const SHORTS_MAX_SECONDS = 180;

/** Shortest a video can be and still count as a full episode. */
const EPISODE_MIN_SECONDS = 2700;

/** The series the page sells per episode. Every real title ends "- Ngobrolin WEB". */
const NGOBROLIN_WEB_TITLE = "ngobrolin web";

const MS_PER_DAY = 86_400_000;

/** How far back momentum looks, and how many months it divides cadence by. */
export const MOMENTUM_WINDOW_DAYS = 365;
const MOMENTUM_WINDOW_MONTHS = 12;

/** How far a figure may fall between runs before a refresh is refused. */
export const MAX_REGRESSION = 0.3;

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

/**
 * Is this video recent enough to speak for the channel a sponsor would be
 * buying? The boundary is inclusive: at exactly STATS_MAX_AGE_DAYS a video
 * still counts, and one day older does not.
 */
export function isRecentEnough(publishedAt, now, maxDays = STATS_MAX_AGE_DAYS) {
  const published = new Date(publishedAt);
  if (Number.isNaN(published.getTime())) return false;
  return (now.getTime() - published.getTime()) / MS_PER_DAY <= maxDays;
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
 *
 * `uploadsPerMonth` divides by the twelve ELAPSED months of the window, not by
 * the months that happen to contain an upload. Dividing by active months makes
 * the average rise when output stops — a three-month break would raise the
 * figure at the moment there was less to sell — and the page prints it as
 * "rata-rata" beside a card labelled "12 bulan terakhir", which a reader takes
 * as elapsed time. `monthsCovered` is still emitted, and now says something the
 * divisor does not: how much of the year actually had an upload in it.
 */
export function computeMomentum(videos, now) {
  const cutoff = now.getTime() - MOMENTUM_WINDOW_DAYS * MS_PER_DAY;
  const recent = (videos || []).filter((v) => {
    const t = new Date(v.publishedAt).getTime();
    return Number.isFinite(t) && t >= cutoff;
  });
  const months = new Set(recent.map((v) => v.publishedAt.slice(0, 7)));
  return {
    videosLast12Months: recent.length,
    viewsLast12Months: recent.reduce((sum, v) => sum + v.views, 0),
    uploadsPerMonth: Math.round((recent.length / MOMENTUM_WINDOW_MONTHS) * 10) / 10,
    monthsCovered: months.size,
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

/**
 * Everything the template needs, assembled from normalized videos.
 *
 * Zero-duration items are dropped before anything is counted. YouTube reports
 * `contentDetails.duration = "P0D"` for a stream that is live or still merely
 * scheduled, and such an item is poison to every figure here: it has no views
 * yet, it is short enough to bucket as a Short, and a premiere scheduled weeks
 * out carries an old enough `publishedAt` to pass the maturity check — so one
 * unaired stream is enough to print `min` as 0 in the Shorts range. It is
 * excluded from cadence too: an unaired premiere is not output, and counting it
 * would overstate the channel. A real published video always has a duration.
 */
export function buildYoutubeStats({ videos, now, topCount = 6, recentCount = 6 }) {
  const all = (videos || []).filter((v) => v.durationSeconds > 0);

  // The summarised set is bounded at both ends: old enough to have earned its
  // views, recent enough to describe the channel a sponsor would be buying.
  const mature = all.filter(
    (v) => isMature(v.publishedAt, now) && isRecentEnough(v.publishedAt, now),
  );

  const formats = { shorts: null, episode: null, recorded: null };
  for (const key of Object.keys(formats)) {
    const views = mature.filter((v) => bucketFormat(v) === key).map((v) => v.views);
    formats[key] = summarize(views);
  }

  // Both halves matter. "ngobrolin" alone also catches Shorts cut from the show
  // and spin-offs like "Ngobrolin AI", and the page sells this as a specific
  // sponsorable series priced per episode.
  const ngobrolin = mature.filter(
    (v) => v.title.toLowerCase().includes(NGOBROLIN_WEB_TITLE) && bucketFormat(v) === "episode",
  );
  const ngobrolinSummary =
    ngobrolin.length >= MIN_FORMAT_SAMPLE ? summarize(ngobrolin.map((v) => v.views)) : null;

  const byDateDesc = [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const sortedDates = (list) =>
    list
      .map((v) => v.publishedAt)
      .filter(Boolean)
      .sort();
  const dates = sortedDates(all);
  const statsDates = sortedDates(mature);

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
    // Two ranges, because they answer two different questions. `videosAnalyzed`
    // / `from` / `to` describe everything fetched, which is what momentum is
    // measured over. `videosSummarized` / `statsFrom` / `statsTo` describe the
    // set the medians actually came from — and that is the pair the page
    // renders, because a disclosure that names the wrong sample is worse than
    // no disclosure at all.
    window: {
      videosAnalyzed: all.length,
      from: dates.length ? isoDate(dates[0]) : null,
      to: dates.length ? isoDate(dates[dates.length - 1]) : null,
      videosSummarized: mature.length,
      statsFrom: statsDates.length ? isoDate(statsDates[0]) : null,
      statsTo: statsDates.length ? isoDate(statsDates[statsDates.length - 1]) : null,
      matureMinDays: MATURE_MIN_DAYS,
      statsMaxAgeDays: STATS_MAX_AGE_DAYS,
    },
  };
}

/** A finite positive number, or null — so a missing field never compares true. */
function positive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Refuse to replace the committed figures with materially worse ones.
 *
 * The fetch script already refuses a wholly empty payload, but total failure is
 * the easy case. Partial degradation is the dangerous one: a transient hiccup
 * returning half a playlist, or a curated video going private, both produce a
 * smaller yet perfectly well-formed result that would commit, deploy, and
 * quietly publish a worse channel than the one that exists. Throwing leaves the
 * good JSON in place and fails the weekly workflow loudly, which is the point.
 *
 * `previous` is the committed src/_data/youtube.json, or null on a first run.
 */
export function assertNoStatsRegression(previous, next, { curatedCount = 0 } = {}) {
  const problems = [];
  const floor = 1 - MAX_REGRESSION;

  // Checked before the first-run exit below, because it needs no baseline: the
  // curated list is its own expected value. A fresh checkout with no committed
  // youtube.json and three of six picks gone private would otherwise ship a
  // half-length "Video terbaik" on a sponsor-facing page, silently.
  const nextBest = (next?.bestVideos || []).length;
  if (nextBest < curatedCount) {
    problems.push(`only ${nextBest} of ${curatedCount} curated pick(s) hydrated`);
  }

  if (!previous) {
    fail(problems);
    return;
  }

  const prevAnalyzed = positive(previous?.window?.videosAnalyzed);
  const nextAnalyzed = Number(next?.window?.videosAnalyzed) || 0;
  if (prevAnalyzed && nextAnalyzed < prevAnalyzed * floor) {
    problems.push(`videos analysed fell from ${prevAnalyzed} to ${nextAnalyzed}`);
  }

  const prevRecent = positive(previous?.momentum?.videosLast12Months);
  const nextRecent = Number(next?.momentum?.videosLast12Months) || 0;
  if (prevRecent && nextRecent < prevRecent * floor) {
    problems.push(`videos in the last 12 months fell from ${prevRecent} to ${nextRecent}`);
  }

  const prevBest = (previous?.bestVideos || []).length;
  if (nextBest < prevBest) {
    problems.push(`curated "Video terbaik" fell from ${prevBest} to ${nextBest}`);
  }

  fail(problems);
}

/** Raise the collected problems as one actionable error, or return quietly. */
function fail(problems) {
  if (problems.length === 0) return;

  throw new Error(
    `Refusing to write src/_data/youtube.json: ${problems.join("; ")}. ` +
      `A drop this size is far more likely to be a bad fetch than a real change — ` +
      `check the API quota and key, whether a curated video in ` +
      `src/_data/ratecardBestVideos.json has gone private or been deleted, and ` +
      `whether WINDOW_SIZE in scripts/fetch-youtube-stats.mjs was lowered (a smaller ` +
      `fetch window reads here as a truncated one). The committed figures were left ` +
      `untouched; if the drop is real and intended, commit the new file by hand.`,
  );
}

/**
 * Refuse to publish a cadence figure the fetch window has started truncating.
 *
 * `computeMomentum` counts a 365-day window out of an array capped at
 * `windowSize` newest uploads. While the window reaches back further than 365
 * days that is fine. Once cadence rises far enough that all `windowSize` videos
 * fall inside the year, the count silently saturates and the page publishes an
 * undercount as fact. Only the cap being reached can cause this, so a channel
 * with fewer total uploads than the cap is never flagged.
 */
export function assertMomentumWindowCovered(window, now, { fetched, windowSize }) {
  if (!(fetched >= windowSize)) return;

  const from = new Date(window?.from ?? "").getTime();
  const days = (now.getTime() - from) / MS_PER_DAY;
  if (days > MOMENTUM_WINDOW_DAYS) return;

  const age = Number.isFinite(days) ? `${Math.round(days)} days` : "an unreadable date";
  throw new Error(
    `Refusing to write src/_data/youtube.json: the ${windowSize}-video window starts at ` +
      `${window?.from} (${age} ago), which no longer reaches past the ` +
      `${MOMENTUM_WINDOW_DAYS}-day momentum window. videosLast12Months would be capped by ` +
      `the fetch size rather than measured, and published as fact. ` +
      `Raise WINDOW_SIZE in scripts/fetch-youtube-stats.mjs and re-run.`,
  );
}

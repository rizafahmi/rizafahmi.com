#!/usr/bin/env node
/**
 * Fetch the channel's YouTube Shorts and write them to src/_data/tips.json,
 * the data file behind /tips.
 *
 * Run it by hand and commit the result:
 *
 *   node --env-file=.env scripts/fetch-youtube-shorts.mjs
 *
 * This is deliberately NOT part of `pnpm run build`, exactly like
 * scripts/fetch-youtube-stats.mjs: YouTube being slow or rate-limited must
 * never break a Netlify deploy.
 *
 * Re-running is safe. The script owns title, description, publishedAt,
 * duration, and thumbnail; everything else in an existing entry — `tags`,
 * `transcript`, `slug`, and any field added later by hand — is carried
 * through untouched. See mergeTips() in src/libs/tips.js.
 *
 * Env:
 *   YOUTUBE_API_KEY     (required)
 *   YOUTUBE_CHANNEL_ID  (optional) defaults to the channel below
 *   YOUTUBE_HANDLE      (optional) used only when no channel id is given
 */

import fs from "node:fs/promises";
import path from "node:path";

import {
  mergeTips,
  parseIsoDuration,
  readExistingTips,
  writeTipsAtomic,
} from "../src/libs/tips.js";

const API = "https://www.googleapis.com/youtube/v3";

/** Eksperimen Pemrograman. */
const DEFAULT_CHANNEL_ID = "UCHhAlFGFCGgIusQkQIqJLYw";

/**
 * Duration alone cannot identify a Short: YouTube raised the limit to three
 * minutes, so anything up to 180s is only a *candidate*. Each candidate is
 * confirmed with a HEAD on /shorts/<id>, which answers 200 for a real Short
 * and redirects (303) for a regular video.
 */
const CANDIDATE_MAX_SECONDS = 180;
const SHORTS_URL = "https://www.youtube.com/shorts";

/** Be a good citizen: a full run is ~240 probes. */
const PROBE_CONCURRENCY = 3;
const PROBE_DELAY_MS = 120;
const PROBE_RETRIES = 3;

const OUT_PATH = path.join(process.cwd(), "src", "_data", "tips.json");
const CACHE_PATH = path.join(process.cwd(), ".cache", "youtube-shorts", "probes.json");

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function opt(name) {
  return process.env[name] || "";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${redact(url)}\n${text}`);
  }
  return res.json();
}

/** Never let the API key reach a log line or an error message. */
function redact(url) {
  return String(url).replace(/([?&]key=)[^&]+/, "$1REDACTED");
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function resolveUploadsPlaylist({ apiKey, channelId, handle }) {
  const query = channelId
    ? `id=${encodeURIComponent(channelId)}`
    : `forHandle=${encodeURIComponent(handle)}`;
  const json = await getJson(`${API}/channels?part=contentDetails&${query}&key=${apiKey}`);
  const uploads = json?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error(`Could not resolve uploads playlist for ${channelId || handle}`);
  return uploads;
}

async function listUploadIds({ apiKey, playlistId }) {
  const ids = [];
  let pageToken = "";

  do {
    const url =
      `${API}/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(playlistId)}` +
      `&maxResults=50&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const json = await getJson(url);
    for (const item of json?.items || []) {
      const id = item?.contentDetails?.videoId;
      if (id) ids.push(id);
    }
    pageToken = json?.nextPageToken || "";
  } while (pageToken);

  return ids;
}

async function fetchVideoDetails({ apiKey, ids }) {
  const videos = [];

  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const url =
      `${API}/videos?part=snippet,contentDetails&id=${encodeURIComponent(batch.join(","))}` +
      `&key=${apiKey}`;
    const json = await getJson(url);

    for (const video of json?.items || []) {
      const duration = video?.contentDetails?.duration || null;
      const thumbnails = video?.snippet?.thumbnails || {};
      videos.push({
        id: video.id,
        title: video?.snippet?.title || "",
        description: video?.snippet?.description || "",
        publishedAt: video?.snippet?.publishedAt || null,
        duration,
        durationSeconds: parseIsoDuration(duration),
        thumbnail:
          thumbnails.maxres?.url ||
          thumbnails.standard?.url ||
          thumbnails.high?.url ||
          `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
      });
    }
  }

  return videos;
}

/**
 * Ask YouTube whether one video is really a Short.
 *
 * Returns true/false, or throws when the answer could not be established. A
 * throw is deliberate: guessing "not a Short" on a flaky network would silently
 * delete a published tip page and the transcript attached to it.
 */
async function probeIsShort(id) {
  let lastError = null;

  for (let attempt = 1; attempt <= PROBE_RETRIES; attempt += 1) {
    try {
      const res = await fetch(`${SHORTS_URL}/${id}`, {
        method: "HEAD",
        redirect: "manual",
      });

      if (res.status === 200) return true;
      if (res.status >= 300 && res.status < 400) return false;
      if (res.status === 404 || res.status === 410) return false;

      lastError = new Error(`unexpected HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(PROBE_DELAY_MS * 4 * attempt);
  }

  throw new Error(`Could not confirm ${id}: ${lastError?.message || "unknown error"}`);
}

/**
 * Confirm every candidate, reusing a local cache. Whether a video is a Short
 * never changes, so a cached answer is as good as a fresh one and a re-run
 * costs no probes at all.
 */
async function confirmShorts(candidates) {
  const cache = await readJson(CACHE_PATH, {});
  const pending = candidates.filter((video) => typeof cache[video.id] !== "boolean");

  if (pending.length) {
    console.log(`[tips] Probing ${pending.length} candidate(s) at ${SHORTS_URL}/<id> …`);
  } else {
    console.log(`[tips] All ${candidates.length} candidate(s) already cached, no probes needed.`);
  }

  const failures = [];
  let done = 0;

  const queue = [...pending];
  const worker = async () => {
    while (queue.length) {
      const video = queue.shift();
      try {
        cache[video.id] = await probeIsShort(video.id);
      } catch (error) {
        failures.push(`${video.id}: ${error.message}`);
      }
      done += 1;
      if (done % 25 === 0) console.log(`[tips]   ${done}/${pending.length}`);
      await sleep(PROBE_DELAY_MS);
    }
  };

  await Promise.all(Array.from({ length: PROBE_CONCURRENCY }, worker));

  // Cache whatever we learned even if some probes failed, so a re-run is cheap.
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf8");

  if (failures.length) {
    throw new Error(
      `${failures.length} probe(s) failed, refusing to write a partial tips.json:\n` +
        `${failures.slice(0, 10).join("\n")}\n` +
        "Re-run the script; confirmed answers are cached in .cache/youtube-shorts/.",
    );
  }

  return candidates.filter((video) => cache[video.id] === true);
}

async function main() {
  const apiKey = must("YOUTUBE_API_KEY");
  const channelId = opt("YOUTUBE_CHANNEL_ID") || (opt("YOUTUBE_HANDLE") ? "" : DEFAULT_CHANNEL_ID);
  const handle = opt("YOUTUBE_HANDLE");

  const playlistId = await resolveUploadsPlaylist({ apiKey, channelId, handle });
  console.log(`[tips] Uploads playlist: ${playlistId}`);

  const ids = await listUploadIds({ apiKey, playlistId });
  console.log(`[tips] ${ids.length} upload(s) in the playlist.`);

  const videos = await fetchVideoDetails({ apiKey, ids });
  const candidates = videos.filter(
    (video) => video.durationSeconds !== null && video.durationSeconds <= CANDIDATE_MAX_SECONDS,
  );
  console.log(`[tips] ${candidates.length} candidate(s) at <= ${CANDIDATE_MAX_SECONDS}s.`);

  const shorts = await confirmShorts(candidates);
  console.log(`[tips] ${shorts.length} confirmed Short(s).`);

  const existing = await readExistingTips(OUT_PATH);
  const removed = [];
  const merged = mergeTips(shorts, existing, { onRemoved: (tip) => removed.push(tip) });

  const seeded = merged.filter((tip) => !existing.some((old) => old.id === tip.id)).length;
  console.log(
    `[tips] ${seeded} new, ${merged.length - seeded} kept with their hand-edited fields.`,
  );

  if (removed.length) {
    console.warn(
      `[tips] ${removed.length} entry(ies) no longer confirm as Shorts and were dropped:\n` +
        removed.map((tip) => `  - /tips/${tip.slug}/ (${tip.id})`).join("\n"),
    );
  }

  await writeTipsAtomic(OUT_PATH, merged);
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(redact(err?.message || err));
  process.exit(1);
});

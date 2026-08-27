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
  console.log(`Wrote ${outPath} — ${out.stats.subscribers} subs, ${videos.length} videos analysed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

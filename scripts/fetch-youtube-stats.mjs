#!/usr/bin/env node
/**
 * Fetch basic public YouTube channel stats using YouTube Data API v3.
 *
 * Writes: src/_data/youtube.json
 *
 * Env:
 *   YOUTUBE_API_KEY   (required)
 *   YOUTUBE_CHANNEL_ID (optional) e.g. UCxxxx
 *   YOUTUBE_HANDLE     (optional) e.g. rizafahmi (without @)
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://www.googleapis.com/youtube/v3';

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function opt(name) {
  return process.env[name] || '';
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${url}\n${text}`);
  }
  return res.json();
}

async function resolveChannelId({ apiKey, channelId, handle }) {
  if (channelId) return channelId;
  if (!handle) throw new Error('Provide YOUTUBE_CHANNEL_ID or YOUTUBE_HANDLE');

  // Newer API supports forHandle.
  const byHandle = `${API}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
  const j1 = await getJson(byHandle);
  const id = j1?.items?.[0]?.id;
  if (id) return id;

  // Fallback: search for channel by handle/username.
  const q = `@${handle}`;
  const search = `${API}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(q)}&key=${apiKey}`;
  const j2 = await getJson(search);
  const id2 = j2?.items?.[0]?.snippet?.channelId;
  if (id2) return id2;

  throw new Error(`Could not resolve channel id for handle ${handle}`);
}

function num(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

async function main() {
  const apiKey = must('YOUTUBE_API_KEY');
  const channelId = opt('YOUTUBE_CHANNEL_ID');
  const handle = opt('YOUTUBE_HANDLE');

  const id = await resolveChannelId({ apiKey, channelId, handle });

  const channelUrl = `${API}/channels?part=snippet,statistics&id=${encodeURIComponent(id)}&key=${apiKey}`;
  const channel = await getJson(channelUrl);
  const item = channel?.items?.[0];
  if (!item) throw new Error('Channel not found');

  // Latest 12 videos: compute views range + avg views.
  const uploadsPlaylistId = item?.contentDetails?.relatedPlaylists?.uploads;
  // contentDetails not included; use search list instead (reliable for public).
  const searchUrl = `${API}/search?part=id&channelId=${encodeURIComponent(id)}&order=date&type=video&maxResults=12&key=${apiKey}`;
  const search = await getJson(searchUrl);
  const videoIds = (search?.items || []).map(it => it?.id?.videoId).filter(Boolean);

  let videos = [];
  if (videoIds.length) {
    const vidsUrl = `${API}/videos?part=snippet,statistics&id=${encodeURIComponent(videoIds.join(','))}&key=${apiKey}`;
    const vids = await getJson(vidsUrl);
    videos = (vids?.items || []).map(v => ({
      id: v.id,
      title: v?.snippet?.title,
      publishedAt: v?.snippet?.publishedAt,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      views: num(v?.statistics?.viewCount) || 0,
    })).sort((a,b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  }

  const viewCounts = videos.map(v => v.views).filter(v => typeof v === 'number');
  const avgViewsLast12 = viewCounts.length ? Math.round(viewCounts.reduce((a,b)=>a+b,0) / viewCounts.length) : null;
  const minViewsLast12 = viewCounts.length ? Math.min(...viewCounts) : null;
  const maxViewsLast12 = viewCounts.length ? Math.max(...viewCounts) : null;

  const out = {
    channel: {
      id,
      title: item?.snippet?.title || null,
      url: `https://www.youtube.com/channel/${id}`,
      handle: handle ? `@${handle}` : null,
      thumbnail: item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.default?.url || null,
    },
    stats: {
      subscribers: num(item?.statistics?.subscriberCount),
      totalViews: num(item?.statistics?.viewCount),
      videoCount: num(item?.statistics?.videoCount),
      // A few helpful, “ratecard-friendly” computed stats
      avgViewsLast12,
      viewsLast12Range: (minViewsLast12 != null && maxViewsLast12 != null) ? { min: minViewsLast12, max: maxViewsLast12 } : null,
    },
    recentVideos: videos.slice(0, 6),
    updatedAt: new Date().toISOString(),
    source: {
      api: 'YouTube Data API v3',
      note: 'Public stats only. For geo/demographics, use YouTube Analytics API + OAuth.',
    }
  };

  const outPath = path.join(process.cwd(), 'src', '_data', 'youtube.json');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

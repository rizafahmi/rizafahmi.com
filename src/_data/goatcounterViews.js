import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_CACHE_TTL_HOURS = 12;

function hoursToMs(h) {
  return h * 60 * 60 * 1000;
}

function getApiBase() {
  const explicit = process.env.GOATCOUNTER_API_BASE;
  if (explicit) return explicit.replace(/\/+$/, '');

  const site = process.env.GOATCOUNTER_SITE;
  if (!site) return null;

  // Accept:
  // - "mycode"              -> https://mycode.goatcounter.com/api/v0
  // - "mycode.goatcounter.com" -> https://mycode.goatcounter.com/api/v0
  // - "https://stats.example.com" -> https://stats.example.com/api/v0
  if (site.startsWith('http://') || site.startsWith('https://')) {
    return site.replace(/\/+$/, '') + '/api/v0';
  }

  if (site.includes('.')) {
    return `https://${site.replace(/\/+$/, '')}/api/v0`;
  }

  return `https://${site}.goatcounter.com/api/v0`;
}

async function readCache(cacheFile, ttlHours) {
  try {
    const raw = await fs.readFile(cacheFile, 'utf8');
    const parsed = JSON.parse(raw);
    const fetchedAt = parsed && parsed.fetchedAt ? new Date(parsed.fetchedAt).getTime() : 0;

    if (!fetchedAt) return null;

    const age = Date.now() - fetchedAt;
    if (age > hoursToMs(ttlHours)) return null;

    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(cacheFile, data) {
  await fs.mkdir(path.dirname(cacheFile), { recursive: true });
  await fs.writeFile(cacheFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function fetchJson(url, token) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GoatCounter API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export default async function goatcounterViews() {
  const token = process.env.GOATCOUNTER_API_TOKEN;
  const apiBase = getApiBase();

  // No secrets in repo: only enable when token + site/base are provided.
  if (!token || !apiBase) {
    return {};
  }

  const ttlHours = Number(process.env.GOATCOUNTER_CACHE_TTL_HOURS || DEFAULT_CACHE_TTL_HOURS);
  const cacheFile = path.join(process.cwd(), '.cache', 'goatcounter', 'views.json');

  const cached = await readCache(cacheFile, ttlHours);
  if (cached && cached.views) {
    return cached.views;
  }

  const end = new Date();
  const start = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const views = {};
  const exclude = [];

  while (true) {
    const qs = new URLSearchParams();
    qs.set('start', start.toISOString());
    qs.set('end', end.toISOString());
    qs.set('limit', '100');
    qs.set('path_by_name', 'true');

    for (const p of exclude) qs.append('exclude_paths', p);

    const url = `${apiBase}/stats/hits?${qs.toString()}`;
    const json = await fetchJson(url, token);

    const hits = Array.isArray(json && json.hits) ? json.hits : [];
    for (const h of hits) {
      if (!h || h.event) continue;
      const p = typeof h.path === 'string' ? h.path : null;
      if (!p || !p.startsWith('/')) continue;

      const count = Number(h.count);
      if (!Number.isFinite(count) || count < 0) continue;

      // Store both with and without trailing slash to match Eleventy URLs.
      views[p] = count;
      if (p.endsWith('/')) views[p.slice(0, -1)] = count;
      else views[p + '/'] = count;

      exclude.push(p);
    }

    if (!json || !json.more) break;

    // Safety valve: avoid endless loops.
    if (exclude.length > 5000) break;
  }

  await writeCache(cacheFile, { fetchedAt: new Date().toISOString(), views });
  return views;
}

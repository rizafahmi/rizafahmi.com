/**
 * Helpers for /tips — the library of YouTube Shorts.
 *
 * The content lives in src/_data/tips.json, seeded by
 * scripts/fetch-youtube-shorts.mjs and then owned by hand (see `tags` and
 * `transcript` there). This module never calls YouTube, so `pnpm run build`
 * stays offline; the only I/O here is reading and writing that data file.
 */

import fs from "node:fs/promises";
import path from "node:path";

/** ISO 8601 duration, as returned by the YouTube API, to whole seconds. */
export function parseIsoDuration(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
  if (!match) return null;
  const [, days, hours, minutes, seconds] = match;
  if (!days && !hours && !minutes && !seconds) return 0;
  return (
    Number(days || 0) * 86400 +
    Number(hours || 0) * 3600 +
    Number(minutes || 0) * 60 +
    Math.round(Number(seconds || 0))
  );
}

/** Seconds to the `m:ss` label shown on a thumbnail. */
export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds === "") return "";
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return "";
  const minutes = Math.floor(total / 60);
  const rest = Math.floor(total % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/**
 * Longest slug we will mint. Plenty of Short titles are whole sentences, and a
 * 99-character URL helps nobody; assignSlugs keeps the trimmed ones unique.
 */
export const MAX_SLUG_LENGTH = 70;

/**
 * Title to URL slug. Titles are Indonesian and often carry emoji or
 * punctuation, so everything outside [a-z0-9] becomes a separator and the
 * separators collapse. A sentence-length title is cut at a word boundary.
 * Returns "" when nothing sluggable is left; callers decide the fallback.
 */
export function slugifyTitle(title, maxLength = MAX_SLUG_LENGTH) {
  if (typeof title !== "string") return "";
  const slug = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut).replace(/-+$/, "");
}

/**
 * Give every tip a slug that is unique across the list and stable across runs.
 *
 * `known` maps video id -> already-published slug. Anything in there wins, so a
 * retitled video keeps its URL. New videos take the first free `slug`,
 * `slug-2`, `slug-3`, … in list order, which makes the result deterministic.
 */
export function assignSlugs(tips, known = {}) {
  const list = Array.isArray(tips) ? tips : [];
  const taken = new Set();
  const assigned = new Map();

  for (const tip of list) {
    const existing = tip?.id ? known[tip.id] : null;
    if (existing) {
      assigned.set(tip.id, existing);
      taken.add(existing);
    }
  }

  return list.map((tip) => {
    if (assigned.has(tip?.id)) return { ...tip, slug: assigned.get(tip.id) };

    const base = slugifyTitle(tip?.title) || String(tip?.id || "").toLowerCase();
    let slug = base;
    let n = 1;
    while (taken.has(slug)) {
      n += 1;
      slug = `${base}-${n}`;
    }
    taken.add(slug);
    return { ...tip, slug };
  });
}

/**
 * Strip the channel boilerplate off a YouTube description.
 *
 * Every description on this channel ends with the same block of membership,
 * merch, and course links, usually after a long line of dashes. That block is
 * not content: left in, it becomes the page's meta description and it drowns
 * deriveTags() in words like "javascript" and "struktur data" that the tip
 * itself never mentions.
 *
 * The raw description stays in src/_data/tips.json — this only decides how
 * much of it the site shows, so the rule can be sharpened without re-fetching.
 */
const SEPARATOR_LINE = /^[ \t]*[-\u2013\u2014_=*~]{6,}[ \t]*$/m;

export function cleanDescription(value) {
  if (typeof value !== "string") return "";

  const text = value.replace(/\r\n/g, "\n");
  const cut = text.search(SEPARATOR_LINE);
  const body = cut === -1 ? text : text.slice(0, cut);

  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .filter((paragraph) => !isLinkBlock(paragraph))
    .filter((paragraph) => !isHashtagBlock(paragraph));

  return paragraphs.join("\n\n").trim();
}

/** A paragraph that is mostly bare URLs is a link dump, not a sentence. */
function isLinkBlock(paragraph) {
  const lines = paragraph
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const linky = lines.filter((line) => /https?:\/\//.test(line)).length;
  return lines.length > 1 && linky * 2 >= lines.length;
}

function isHashtagBlock(paragraph) {
  return /^(#[^\s#]+[ \t]*)+$/.test(paragraph.trim());
}

/**
 * The `<meta name="description">` line for one tip.
 *
 * A lot of Shorts have a one-line description or none at all, and a two-word
 * meta description is worse than none: the site audit treats anything under 50
 * characters as missing. So a short one gets the channel sentence appended.
 */
export function metaDescriptionFor({ title, description }) {
  const base = excerptDescription(description) || (typeof title === "string" ? title.trim() : "");
  if (base.length >= 70) return base;
  const suffix = "Video pendek dari kanal Eksperimen Pemrograman oleh Riza Fahmi.";
  return base ? `${base.replace(/[.\s]+$/, "")}. ${suffix}` : suffix;
}

/** Collapse a cleaned description to the single line meta tags want. */
export function excerptDescription(value, length = 180) {
  const text = cleanDescription(value).replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length).replace(/\s+\S*$/, "")}\u2026`;
}

/**
 * Keyword map for machine-seeded tags.
 *
 * Left side is a tag from the site's own vocabulary (see TAGS.md); right side
 * is the words that imply it. Matching is whole-word and case-insensitive, so
 * `api` does not fire on "apinya". Extend this list freely — order here is the
 * order tags come out in.
 *
 * These are only a seed. Once a tip is in src/_data/tips.json its `tags` field
 * is yours to edit, and re-running the fetch will not touch it.
 */
export const TAG_KEYWORDS = [
  ["elixir", ["elixir", "ecto", "beam", "mix", "iex", "livebook", "otp", "genserver", "phoenix"]],
  ["phoenix", ["phoenix", "liveview", "live view"]],
  ["otp", ["otp", "genserver", "supervisor", "supervision"]],
  ["erlang", ["erlang"]],
  ["concurrency", ["concurrency", "konkurensi", "genstage", "broadway"]],
  ["javascript", ["javascript", "js", "typescript", "react", "svelte", "vue", "deno", "bun"]],
  ["nodejs", ["node", "nodejs", "npm", "pnpm", "yarn"]],
  ["web", ["web", "html", "css", "browser", "http", "websocket", "wasm", "webassembly", "cms"]],
  ["frontend", ["frontend", "tailwind", "desain ui"]],
  [
    "ai",
    [
      "ai",
      "llm",
      "gpt",
      "claude",
      "gemini",
      "chatgpt",
      "copilot",
      "prompt",
      "token",
      "context window",
      "generative",
      "minimax",
      "flux 1",
    ],
  ],
  [
    "agentic-coding",
    [
      "agent",
      "agents",
      "agentic",
      "agents md",
      "skill md",
      "claude code",
      "cursor",
      "codex",
      "mcp",
      "codingagent",
      "coding agent",
    ],
  ],
  ["machine-learning", ["machine learning", "deep learning"]],
  [
    "devops",
    [
      "devops",
      "deploy",
      "deployment",
      "github actions",
      "server",
      "load balancer",
      "virtual machine",
      "vm",
    ],
  ],
  ["docker", ["docker", "container", "kontainer"]],
  ["self-hosting", ["self hosting", "self hosted", "vps", "homelab"]],
  ["database", ["database", "sql", "postgres", "postgresql", "sqlite", "query"]],
  ["git", ["git", "github", "commit", "rebase", "pull request"]],
  ["tools", ["cli", "terminal", "shell", "vim", "neovim", "editor", "vscode", "zsh"]],
  ["computer-science", ["algoritma", "algorithm", "struktur data", "big o", "kompleksitas"]],
  ["produk-manajemen", ["agile", "scrum", "sprint", "product manager", "roadmap produk"]],
  [
    "public-speaking",
    ["public speaking", "presentasi", "speaker", "pembicara", "ngomong di depan"],
  ],
  ["konferensi", ["konferensi", "conference", "cfp", "proposal talk", "idsw", "seminar"]],
  ["komunitas", ["komunitas", "meetup", "devfest", "community"]],
  [
    "karier",
    [
      "karier",
      "karir",
      "resign",
      "interview",
      "wawancara",
      "gaji",
      "lamaran",
      "profesi",
      "talenta",
      "kultur",
      "kultur perusahaan",
      "pengalaman kerja",
    ],
  ],
  ["produktivitas", ["produktivitas", "produktif", "fokus", "kebiasaan", "workflow"]],
  ["motivasi", ["motivasi", "semangat", "mood", "introspeksi", "suri tauladan"]],
  ["belajar", ["belajar", "pemula", "beginner", "roadmap", "kursus"]],
  ["review", ["review", "unboxing", "monitor", "benq"]],
  ["tutorial", ["tutorial", "panduan", "step by step"]],
];

/** How many tags one machine-seeded tip may collect. Deliberately small. */
export const MAX_DERIVED_TAGS = 4;

function haystack(...parts) {
  return ` ${parts
    .filter((part) => typeof part === "string")
    .join(" ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

/**
 * Seed tags for a tip from its title and description, using the site's
 * existing vocabulary. Conservative on purpose: no match means no tag.
 */
export function deriveTags(title, description) {
  const text = haystack(title, cleanDescription(description));
  const found = [];

  for (const [tag, keywords] of TAG_KEYWORDS) {
    if (found.length >= MAX_DERIVED_TAGS) break;
    const hit = keywords.some((keyword) => text.includes(` ${keyword} `));
    if (hit) found.push(tag);
  }

  return found;
}

/**
 * Human-owned tip tag text → display label + URL slug.
 *
 * `tags` in tips.json is edited by hand; a space or capital must not break
 * `/tips/topik/<slug>/`. Every consumer (cards, detail, tipTagList) reads from
 * this shape so the href and the permalink cannot drift.
 */
export function normalizeTipTag(raw) {
  const label = cleanText(
    typeof raw === "string" ? raw : typeof raw?.label === "string" ? raw.label : null,
  );
  if (!label) return null;
  return { label, slug: slugifyTitle(label) || label };
}

/** Tag navigation for /tips: most-used first, alphabetical within a count. */
export function tipTagList(tips) {
  const counts = new Map();
  for (const tip of Array.isArray(tips) ? tips : []) {
    for (const tag of Array.isArray(tip?.tags) ? tip.tags : []) {
      const normalized = normalizeTipTag(tag);
      if (!normalized) continue;
      const prev = counts.get(normalized.label);
      if (prev) {
        prev.count += 1;
      } else {
        counts.set(normalized.label, { tag: normalized.label, slug: normalized.slug, count: 1 });
      }
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

function cleanText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Data-file entries to what the templates render. Newest first, and every
 * optional field is either a real value or null — never the string "null".
 */
export function selectTips(rawTips) {
  if (!Array.isArray(rawTips)) return [];

  return rawTips
    .map((raw) => {
      const id = cleanText(raw?.id);
      const slug = cleanText(raw?.slug);
      if (!id || !slug) return null;

      const durationSeconds = Number.isFinite(raw?.durationSeconds)
        ? raw.durationSeconds
        : parseIsoDuration(raw?.duration);

      return {
        id,
        slug,
        url: `/tips/${slug}/`,
        title: cleanText(raw?.title) || id,
        description: cleanDescription(raw?.description),
        excerpt: excerptDescription(raw?.description) || cleanText(raw?.title) || id,
        metaDescription: metaDescriptionFor({
          title: cleanText(raw?.title) || id,
          description: raw?.description,
        }),
        publishedAt: cleanText(raw?.publishedAt) || null,
        duration: cleanText(raw?.duration) || null,
        durationSeconds,
        durationLabel: formatDuration(durationSeconds),
        thumbnail: cleanText(raw?.thumbnail) || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        watchUrl: `https://www.youtube.com/shorts/${id}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        tags: (Array.isArray(raw?.tags) ? raw.tags : []).map(normalizeTipTag).filter(Boolean),
        transcript: cleanText(raw?.transcript),
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        (b.publishedAt || "").localeCompare(a.publishedAt || "") || a.id.localeCompare(b.id),
    );
}

/** Fields the fetch script owns; everything else in an entry is hand-owned. */
const MACHINE_FIELDS = [
  "title",
  "description",
  "publishedAt",
  "duration",
  "durationSeconds",
  "thumbnail",
];

/**
 * Fold a fresh fetch into the existing src/_data/tips.json.
 *
 * The rule the fetch script lives by: it refreshes what YouTube owns and keeps
 * everything else exactly as the file has it. `tags` is seeded once, on a
 * video's first appearance, and never re-derived — including when the captain
 * has emptied it. `transcript` and any field added later come through
 * untouched, and a published `slug` never moves.
 */
export function mergeTips(fetched, existing, { onRemoved } = {}) {
  const fresh = Array.isArray(fetched) ? fetched : [];
  const previous = Array.isArray(existing) ? existing : [];

  const byId = new Map(previous.filter((tip) => tip?.id).map((tip) => [tip.id, tip]));
  const known = Object.fromEntries(
    previous.filter((tip) => tip?.id && tip?.slug).map((tip) => [tip.id, tip.slug]),
  );

  const freshIds = new Set(fresh.map((tip) => tip?.id).filter(Boolean));
  if (typeof onRemoved === "function") {
    for (const tip of previous) {
      if (tip?.id && !freshIds.has(tip.id)) onRemoved(tip);
    }
  }

  const withSlugs = assignSlugs(fresh, known);

  return withSlugs
    .map((tip) => {
      const prior = byId.get(tip.id);
      const machine = {};
      for (const field of MACHINE_FIELDS) {
        if (tip[field] !== undefined) machine[field] = tip[field];
      }

      // id and slug lead so the data file is navigable by eye; tags trail so the
      // field the captain edits most sits next to the transcript.
      const { id: _id, slug: _slug, tags: _tags, ...carried } = prior || {};

      return {
        id: tip.id,
        slug: tip.slug,
        ...carried,
        ...machine,
        tags: Array.isArray(prior?.tags) ? prior.tags : deriveTags(tip.title, tip.description),
      };
    })
    .sort(
      (a, b) =>
        (b.publishedAt || "").localeCompare(a.publishedAt || "") ||
        String(a.id).localeCompare(String(b.id)),
    );
}

/** Every tip carrying `tag` (display label), in the order the list already has them. */
export function tipsWithTag(tips, tag) {
  if (!Array.isArray(tips) || typeof tag !== "string") return [];
  return tips.filter((tip) => {
    if (!Array.isArray(tip?.tags)) return false;
    return tip.tags.some((entry) => {
      if (typeof entry === "string") return entry === tag;
      return entry?.label === tag;
    });
  });
}

/**
 * True when a /shorts/<id> redirect's Location is the watch URL for that same
 * video. That is the definitive "not a Short" answer. Consent / login hosts
 * and any other target are not.
 */
export function isWatchRedirectForId(location, videoId) {
  if (typeof location !== "string" || !location || typeof videoId !== "string" || !videoId) {
    return false;
  }

  try {
    const url = new URL(location, `https://www.youtube.com/shorts/${videoId}`);
    if (!/^(www\.)?youtube\.com$/i.test(url.hostname)) return false;
    if (url.pathname !== "/watch") return false;
    return url.searchParams.get("v") === videoId;
  } catch {
    return false;
  }
}

/**
 * Classify one HEAD /shorts/<id> response.
 *
 * 200 → Short. 404/410 → gone, not a Short. A 3xx is only "not a Short" when
 * Location is the watch URL for that exact id; every other redirect (consent
 * walls, login, missing/unknown Location) is unresolved so the caller can
 * retry and must not cache a false negative.
 */
export function interpretShortsProbe(status, location, videoId) {
  if (status === 200) return { resolved: true, isShort: true };
  if (status === 404 || status === 410) return { resolved: true, isShort: false };

  if (status >= 300 && status < 400) {
    if (isWatchRedirectForId(location, videoId)) {
      return { resolved: true, isShort: false };
    }
    const target = typeof location === "string" && location ? location : "(missing Location)";
    return { resolved: false, reason: `unresolved redirect to ${target}` };
  }

  return { resolved: false, reason: `unexpected HTTP ${status}` };
}

/**
 * Refuse a merge that would drop most of an existing tips.json.
 *
 * Kept must be at least half of the prior tip ids. Zero overlap (empty
 * confirmation, cookie-wall 3xx probes, wrong channel) and any other wipe
 * larger than that fail closed — a fetch that erases hand edits is worse than
 * no fetch. Pass `force: true` (TIPS_ALLOW_MASS_REMOVAL=1) for a deliberate
 * mass removal.
 */
export function assertTipsOverlap(existing, confirmed, { force = false } = {}) {
  if (force) return;

  const previous = (Array.isArray(existing) ? existing : []).filter((tip) => tip?.id);
  if (previous.length === 0) return;

  const confirmedIds = new Set(
    (Array.isArray(confirmed) ? confirmed : []).map((tip) => tip?.id).filter(Boolean),
  );
  const kept = previous.filter((tip) => confirmedIds.has(tip.id)).length;
  if (kept * 2 >= previous.length) return;

  throw new Error(
    `Refusing to write tips.json: only ${kept} of ${previous.length} existing tip id(s) ` +
      `appear in this run's confirmed Shorts (need at least half). ` +
      `Delete .cache/youtube-shorts/ and re-run — a cookie-wall 3xx may have been ` +
      `cached as a false negative. If overlap is still too low, check YOUTUBE_CHANNEL_ID. ` +
      `tips.json was left untouched. To allow a deliberate mass removal, set ` +
      `TIPS_ALLOW_MASS_REMOVAL=1 (or pass --allow-mass-removal) and re-run.`,
  );
}

/**
 * Load the committed tips.json ahead of a merge. Missing file → first run ([]).
 * Anything else wrong aborts: a corrupt or non-array file must never look like
 * "no tips yet", or the next write would re-seed and erase hand edits.
 */
export async function readExistingTips(file) {
  let raw;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw new Error(`Could not read ${file}: ${error.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Could not parse ${file}: ${error.message}. Fix or restore the file before re-running; refusing to overwrite hand-edited tips.`,
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      `${file} must be a JSON array of tips, got ${parsed === null ? "null" : typeof parsed}. Refusing to overwrite hand-edited tips.`,
    );
  }

  return parsed;
}

/**
 * Write tips.json via temp + rename so a crash cannot leave a truncated file
 * that the next run would then refuse to read (or, previously, treat as []).
 */
export async function writeTipsAtomic(file, tips) {
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(file)}.${process.pid}.tmp`);
  try {
    await fs.writeFile(tmp, `${JSON.stringify(tips, null, 2)}\n`, "utf8");
    await fs.rename(tmp, file);
  } catch (error) {
    await fs.unlink(tmp).catch(() => {});
    throw error;
  }
}

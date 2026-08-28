#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import { findBrokenLinks, htmlPathForUrl as resolveHtmlPath } from "../src/libs/internal-links.js";

const DIST_DIR = "dist";
const CONTENT_DIR = path.join("src", "catatan");
const INCLUDES_DIR = path.join("src", "_includes");
const SITE_URL = "https://rizafahmi.com";
const INDEXABLE = "index,follow,max-image-preview:large";
const NOINDEX = "noindex,nofollow,noarchive";
const INTERNAL_TAGS = new Set(["all", "nav", "post", "catatan"]);

const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function fileExists(file) {
  return fs.existsSync(file);
}

function htmlPathForUrl(urlPath) {
  return resolveHtmlPath(urlPath, DIST_DIR);
}

function robotsMeta(html) {
  return html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? "";
}

function assertRobots(file, expected) {
  const html = readText(file);
  const robots = robotsMeta(html);
  if (robots !== expected) {
    fail(`${file} has robots "${robots}", expected "${expected}"`);
  }
}

function assertMetaDescription(file) {
  const html = readText(file);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
  if (description.length < 50) {
    fail(`${file} has a weak or missing meta description`);
  }
}

function assertJsonLd(file) {
  const html = readText(file);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) {
    fail(`${file} is missing JSON-LD`);
    return;
  }

  for (const block of blocks) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      fail(`${file} has invalid JSON-LD: ${error.message}`);
    }
  }
}

function assertFeed(file) {
  const xml = readText(file);
  if (!xml.includes("<feed ")) fail(`${file} is missing Atom feed root`);
  if (!xml.includes("<entry>")) fail(`${file} is missing feed entries`);
  if (/<category term="[^"]*,/.test(xml)) {
    fail(`${file} has comma-separated category terms`);
  }
  if (xml.includes('<category term="catatan"/>')) {
    fail(`${file} exposes internal catatan tag as a category`);
  }
  if (!/<updated>20\d\d-\d\d-\d\dT/.test(xml)) {
    fail(`${file} has missing or invalid updated timestamp`);
  }
  if (/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-fA-F]+;)/.test(xml)) {
    fail(`${file} contains unescaped ampersands`);
  }
}

function assertSitemap() {
  const sitemapFile = path.join(DIST_DIR, "sitemap.xml");
  const xml = readText(sitemapFile);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  for (const url of [
    `${SITE_URL}/`,
    `${SITE_URL}/articles/`,
    `${SITE_URL}/search/`,
    `${SITE_URL}/tags/`,
    `${SITE_URL}/topik/`,
  ]) {
    if (!urls.includes(url)) fail(`sitemap is missing ${url}`);
  }

  for (const url of urls) {
    const localPath = new URL(url).pathname;
    if (!fileExists(htmlPathForUrl(localPath))) {
      fail(`sitemap URL has no generated page: ${url}`);
    }
  }
}

// The homepage is the entry point, and it does NOT use src/_includes/main.njk —
// it is standalone with its own hero nav. A section added to main.njk therefore
// reaches /articles and /tags but not /. That is how /tips shipped unreachable
// from the homepage, and how footer.njk sat dead for two years. Assert against
// the built page: a link in a template is not a link on a page.
function assertHomepageReachesSections() {
  const file = path.join(DIST_DIR, "index.html");
  if (!fileExists(file)) {
    fail("dist/index.html is missing");
    return;
  }

  const html = readText(file);
  const hrefs = new Set(
    [...html.matchAll(/<a[^>]+href="([^"]+)"/g)].map((m) => m[1].replace(/\/$/, "")),
  );

  for (const section of ["/articles", "/tags", "/topik", "/tips", "/showcase", "/search"]) {
    if (!hrefs.has(section)) {
      fail(`homepage has no anchor to ${section}/ — readers cannot navigate to it`);
    }
  }
}

function assertInternalLinks() {
  for (const { file, href } of findBrokenLinks({
    dir: DIST_DIR,
    distDir: DIST_DIR,
    extensions: [".html"],
  })) {
    fail(`${file} links to missing ${href}`);
  }
}

// Rendered pages only reveal links that something actually includes. Partials
// that no layout renders stay invisible there, which is how /service and
// /experiment sat dead in footer.njk from 2024 until they were removed.
function assertPartialLinks() {
  for (const { file, href } of findBrokenLinks({
    dir: INCLUDES_DIR,
    distDir: DIST_DIR,
    extensions: [".njk"],
  })) {
    fail(`${file} links to missing ${href}`);
  }
}

function assertPagefind() {
  const pagefindDir = path.join(DIST_DIR, "pagefind");
  if (!fileExists(pagefindDir)) {
    fail("Pagefind output directory is missing");
    return;
  }

  const entryFile = path.join(pagefindDir, "pagefind-entry.json");
  if (!fileExists(entryFile)) fail("Pagefind entry file is missing");
}

function assertTextFileContains(file, expected) {
  if (!fileExists(file)) {
    fail(`${file} is missing`);
    return "";
  }

  const text = readText(file);
  for (const value of expected) {
    if (!text.includes(value)) fail(`${file} is missing ${value}`);
  }
  return text;
}

function assertRobotsTxt() {
  const robots = assertTextFileContains(path.join(DIST_DIR, "robots.txt"), [
    "User-agent: *",
    "Sitemap: https://rizafahmi.com/sitemap.xml",
    "User-agent: OAI-SearchBot",
    "User-agent: GPTBot",
    "User-agent: Claude-SearchBot",
    "User-agent: Claude-User",
    "User-agent: PerplexityBot",
    "User-agent: Google-Extended",
    "User-agent: Applebot-Extended",
  ]);

  if (!robots) return;

  const disallowAll = [...robots.matchAll(/User-agent:\s*([^\n]+)\nDisallow:\s*\/\s*(?:\n|$)/g)];
  if (disallowAll.length) {
    fail(`robots.txt blocks public crawlers: ${disallowAll.map((match) => match[1]).join(", ")}`);
  }
}

function assertLlmsTxt() {
  const llms = assertTextFileContains(path.join(DIST_DIR, "llms.txt"), [
    "# Riza Fahmi",
    "## Core context",
    "## Machine-readable indexes",
    "https://rizafahmi.com/llms-full.txt",
    "https://rizafahmi.com/sitemap.xml",
    "https://rizafahmi.com/topik/ai/",
  ]);

  if (llms) {
    if (llms.includes("{%") || llms.includes("{{"))
      fail("llms.txt contains unrendered template syntax");
    if ((llms.match(/https:\/\/rizafahmi\.com\/catatan\//g) || []).length < 10) {
      fail("llms.txt should expose at least 10 article links");
    }
  }

  const full = assertTextFileContains(path.join(DIST_DIR, "llms-full.txt"), [
    "# Riza Fahmi - Full LLM Content Index",
    "## Article inventory",
    "Concise index: https://rizafahmi.com/llms.txt",
  ]);

  if (full) {
    if (full.includes("{%") || full.includes("{{")) {
      fail("llms-full.txt contains unrendered template syntax");
    }
    if ((full.match(/^### /gm) || []).length < 20) {
      fail("llms-full.txt should expose the public article inventory");
    }
  }
}

/* The critical-path rules from AGENTS.md > Performance. Every page is held to a
 * Lighthouse score >= 92 and LCP < 1.8s, but nothing in CI runs Lighthouse, so these
 * guard the specific regressions that produced the worst measurements: a render-blocking
 * third-party stylesheet (~850ms of every page), eager third-party widgets, an
 * autoplaying video (one clip took its article from 1.58s to 2.25s), and preloading a
 * font face the page never paints. */
function eachHtmlFile(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) eachHtmlFile(full, visit);
    else if (entry.name.endsWith(".html")) visit(full);
  }
}

const EXPECTED_FONT_PRELOADS = [
  "martian-mono-latin-400-normal.woff2",
  "schibsted-grotesk-latin-400-normal.woff2",
  "unbounded-latin-800-normal.woff2",
];

function assertCriticalPath() {
  let tweetPages = 0;
  let checked = 0;

  eachHtmlFile(DIST_DIR, (file) => {
    // dist/pagefind ships vendored demo/search HTML that is not part of the site.
    if (file.includes(`${path.sep}pagefind${path.sep}`)) return;
    const html = readText(file);
    checked += 1;

    if (/<link[^>]+rel=["']stylesheet["'][^>]*href=["']https?:\/\//i.test(html)) {
      fail(`${file} loads a render-blocking third-party stylesheet`);
    }
    if (/fonts\.(googleapis|gstatic)\.com/.test(html)) {
      fail(`${file} requests a webfont from another origin; fonts ship from /assets/fonts/`);
    }
    if (
      /<script[^>]+src=["']https:\/\/(platform\.twitter\.com\/widgets\.js|utteranc\.es\/client\.js)["']/i.test(
        html,
      )
    ) {
      fail(`${file} eagerly loads a third-party widget; it belongs behind lazy-media.njk`);
    }
    // (?<![-\w]) so the rewritten `data-autoplay` does not read as a live autoplay.
    if (/<video\b[^>]*(?<![-\w])autoplay(?![-\w])/i.test(html)) {
      fail(`${file} autoplays a video, which downloads it during page load`);
    }
    for (const [, attrs] of html.matchAll(/<video\b([^>]*)>/gi)) {
      if (!/preload=["']none["']/i.test(attrs))
        fail(`${file} has a <video> without preload="none"`);
    }
    // A pasted YouTube/TED embed boots a whole web app on load; one held an article's
    // LCP at 1.80s. They live below the fold, so lazyIframe defers them.
    for (const [, attrs] of html.matchAll(/<iframe\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)) {
      if (!/loading=["']lazy["']/i.test(attrs)) fail(`${file} has an <iframe> that is not lazy`);
    }
    if (/class="twitter-tweet"/.test(html)) tweetPages += 1;

    const preloads = [...html.matchAll(/rel="preload"[^>]+href="([^"]+\.woff2)"/g)]
      .map((match) => match[1].split("/").pop())
      .sort();
    if (preloads.length && preloads.join() !== EXPECTED_FONT_PRELOADS.join()) {
      fail(
        `${file} preloads ${preloads.join(", ") || "nothing"}; expected the three above-the-fold faces`,
      );
    }
  });

  if (checked === 0) fail("no HTML files found to audit");
  // The eager <script> a pasted Twitter embed carries is stripped at build; the
  // blockquotes it belongs to must survive.
  if (tweetPages !== 3) {
    fail(`expected 3 pages with a tweet blockquote, found ${tweetPages}`);
  }
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const frontmatter = match[1];
  const get = (key) => {
    const value = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
    return value?.replace(/^["']|["']$/g, "") ?? "";
  };

  const tagsSection = frontmatter.match(/^tags:\s*\n((?:\s+-\s+.+\n?)*)/m);
  const tags = tagsSection
    ? [...tagsSection[1].matchAll(/^\s+-\s+(.+)$/gm)].map((m) => m[1].trim())
    : [];

  return {
    title: get("title"),
    date: get("date"),
    created: get("created"),
    description: get("description"),
    excluded: /^eleventyExcludeFromCollections:\s*true$/m.test(frontmatter),
    tags,
  };
}

function assertPublishedFrontmatter() {
  const files = fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const fullPath = path.join(CONTENT_DIR, file);
    const data = parseFrontmatter(readText(fullPath));
    if (data.excluded || !data.date) continue;

    if (!data.title) fail(`${fullPath} is missing title`);
    if (!data.created) fail(`${fullPath} is missing created`);
    if (data.description.length < 50) fail(`${fullPath} has a weak or missing description`);
    if (!data.tags.includes("catatan")) fail(`${fullPath} is missing catatan tag`);
    if (!data.tags.some((tag) => !INTERNAL_TAGS.has(tag))) {
      fail(`${fullPath} needs at least one public topic tag`);
    }
  }
}

for (const file of [
  "index.html",
  "articles/index.html",
  "tags/index.html",
  "search/index.html",
  "catatan/asisten-ngoding-5/index.html",
].map((file) => path.join(DIST_DIR, file))) {
  assertRobots(file, INDEXABLE);
  assertMetaDescription(file);
  assertJsonLd(file);
}

assertRobots(path.join(DIST_DIR, "catatan/gemini-3/index.html"), NOINDEX);
assertJsonLd(path.join(DIST_DIR, "catatan/asisten-ngoding-5/index.html"));
assertFeed(path.join(DIST_DIR, "feed.xml"));
assertFeed(path.join(DIST_DIR, "feed", "full.xml"));
assertSitemap();
assertHomepageReachesSections();
assertInternalLinks();
assertPartialLinks();
assertPagefind();
assertRobotsTxt();
assertLlmsTxt();
assertPublishedFrontmatter();
assertCriticalPath();

if (failures.length) {
  console.error("[site-audit] Failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[site-audit] OK");

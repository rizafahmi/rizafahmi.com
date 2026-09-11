import fs from "node:fs";
import path from "node:path";

// Paths that are copied assets rather than generated pages, so there is no
// index.html to resolve them against.
const ASSET_PREFIXES = ["/assets/", "/img/", "/pagefind/"];

const TEMPLATE_SYNTAX = /\{\{|\{%/;

function stripQueryAndHash(href) {
  return href.split("#")[0].split("?")[0];
}

/**
 * True for hrefs that name an internal page we can resolve against the build
 * output. Skips external links, fragments, copied assets, and any href whose
 * value is assembled by Nunjucks at render time.
 */
export function isCheckableHref(href) {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  if (TEMPLATE_SYNTAX.test(href)) return false;
  return !ASSET_PREFIXES.some((prefix) => href.startsWith(prefix));
}

export function extractHrefs(text) {
  return [...text.matchAll(/href="([^"]*)"/g)].map((match) => match[1]);
}

/** Map an internal URL path onto the file the build should have produced. */
export function htmlPathForUrl(urlPath, distDir) {
  const clean = stripQueryAndHash(urlPath);
  if (!clean || clean === "/") return path.join(distDir, "index.html");

  const decoded = decodeURIComponent(clean);
  const target = path.join(distDir, decoded.replace(/^\/+/, ""));
  if (decoded.endsWith("/")) return path.join(target, "index.html");

  if (fs.existsSync(target)) return target;
  if (fs.existsSync(`${target}.html`)) return `${target}.html`;
  return path.join(target, "index.html");
}

export function internalHrefExists(href, distDir) {
  const clean = stripQueryAndHash(href);
  if (!clean) return true;
  return fs.existsSync(htmlPathForUrl(clean, distDir));
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

/**
 * Scan every file under `dir` with one of `extensions` and report internal
 * links that `distDir` does not serve.
 *
 * Pointing `dir` at the build output checks rendered pages; pointing it at
 * `src/_includes` also catches dead links in partials that nothing renders
 * yet, which rendered-output checks cannot see.
 */
export function findBrokenLinks({ dir, distDir, extensions }) {
  if (!fs.existsSync(dir)) return [];

  const broken = [];
  for (const file of walk(dir).filter((f) => extensions.includes(path.extname(f)))) {
    for (const href of extractHrefs(fs.readFileSync(file, "utf8"))) {
      if (!isCheckableHref(href)) continue;
      if (!internalHrefExists(href, distDir)) broken.push({ file, href });
    }
  }
  return broken;
}

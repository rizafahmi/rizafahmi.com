import sharp from "sharp";
import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// --- Font embedding (base64) for SVG rendering ---
const FONTS_DIR = path.resolve("assets/fonts");

let wotfardB64 = null;
let jetbrainsB64 = null;

function loadFonts() {
  if (!wotfardB64) {
    wotfardB64 = readFileSync(
      path.join(FONTS_DIR, "wotfard-regular-webfont.ttf")
    ).toString("base64");
  }
  if (!jetbrainsB64) {
    jetbrainsB64 = readFileSync(
      path.join(FONTS_DIR, "JetBrainsMono-Regular.ttf")
    ).toString("base64");
  }
}

// --- Helpers ---

const HIDDEN_TAGS = new Set(["all", "nav", "post", "catatan"]);

function visibleTags(tags) {
  if (!tags) return [];
  const arr = typeof tags === "string" ? [tags] : tags;
  if (!Array.isArray(arr)) return [];
  return arr.filter((t) => t && !HIDDEN_TAGS.has(t));
}

/** Escape XML special chars */
function esc(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Strip HTML tags, emoji, and collapse whitespace */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
    .replace(/[\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Naive word-wrap: split text into lines that fit within `maxChars`.
 * Returns an array of strings (lines).
 */
function wrapText(text, maxChars, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    if (lines.length >= maxLines) break;
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  // If we hit maxLines and there's still text, add ellipsis to last line
  if (lines.length === maxLines && words.length > 0) {
    const lastLine = lines[maxLines - 1];
    if (lastLine && current !== lastLine) {
      lines[maxLines - 1] = lastLine + "\u2026";
    }
  }

  return lines;
}

// --- SVG Template ---
// Matches the site's clean, white aesthetic with Wotfard + JetBrainsMono,
// dark heading color (#211a1e), subtle borders, and pill-shaped tags.

function buildSvg({ title, excerpt, tags }) {
  loadFonts();

  const WIDTH = 1200;
  const HEIGHT = 630;
  const PAD = 72;

  // Colors from the site's CSS variables (light theme)
  const BG = "#ffffff";
  const HEADING = "#211a1e";
  const TEXT = "rgb(41, 38, 38)";
  const META = "rgba(33, 26, 30, 0.55)";
  const TAG_BG = "#292626";
  const TAG_TEXT = "#eaeaea";
  const BORDER = "rgba(33, 26, 30, 0.12)";

  // --- Title ---
  const titleFontSize = 48;
  const titleLineHeight = 62;
  const titleY = 88;
  const titleMaxChars = 36;
  const titleMaxLines = 3;
  const titleLines = wrapText(title || "Catatan Baru", titleMaxChars, titleMaxLines);

  const titleTspans = titleLines
    .map((line, i) =>
      `<tspan x="${PAD}" dy="${i === 0 ? 0 : titleLineHeight}">${esc(line)}</tspan>`
    )
    .join("\n      ");

  // --- Excerpt ---
  const excerptFontSize = 21;
  const excerptLineHeight = 32;
  const excerptY = titleY + titleLines.length * titleLineHeight + 24;
  const excerptMaxChars = 56;
  const excerptMaxLines = 3;
  const excerptLines = wrapText(excerpt || "", excerptMaxChars, excerptMaxLines);

  const excerptTspans = excerptLines
    .map((line, i) =>
      `<tspan x="${PAD}" dy="${i === 0 ? 0 : excerptLineHeight}">${esc(line)}</tspan>`
    )
    .join("\n      ");

  // --- Tags (pill-shaped, matching site's span.tags style) ---
  const tagList = visibleTags(tags).slice(0, 4);
  const tagsY = HEIGHT - 90;
  let tagsSvg = "";
  if (tagList.length > 0) {
    let tagX = PAD;
    const tagParts = tagList.map((t) => {
      const label = t;
      // Approximate width: ~8.5px per char + 20px horizontal padding
      const w = label.length * 8.5 + 24;
      const h = 28;
      const part = `
      <rect x="${tagX}" y="${tagsY}" width="${w}" height="${h}" rx="14" fill="${TAG_BG}" />
      <text x="${tagX + w / 2}" y="${tagsY + 19}" font-family="Wotfard, sans-serif" font-size="14" fill="${TAG_TEXT}" text-anchor="middle">${esc(label)}</text>`;
      tagX += w + 10;
      return part;
    });
    tagsSvg = tagParts.join("");
  }

  // --- Footer branding ---
  const footerY = HEIGHT - 36;

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Wotfard';
        src: url('data:font/ttf;base64,${wotfardB64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'JetBrainsMono';
        src: url('data:font/ttf;base64,${jetbrainsB64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    </style>
  </defs>

  <!-- White background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}" />

  <!-- Thin top border line (like the reading-progress bar) -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="${HEADING}" />

  <!-- Outer frame (subtle border like the existing OG image) -->
  <rect x="16" y="16" width="${WIDTH - 32}" height="${HEIGHT - 32}" rx="0" fill="none" stroke="${BORDER}" stroke-width="2" />

  <!-- Title -->
  <text x="${PAD}" y="${titleY}" font-family="Wotfard, sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="${HEADING}">
      ${titleTspans}
  </text>

  <!-- Excerpt -->
  <text x="${PAD}" y="${excerptY}" font-family="Wotfard, sans-serif" font-size="${excerptFontSize}" fill="${META}">
      ${excerptTspans}
  </text>

  <!-- Tags -->
  ${tagsSvg}

  <!-- Bottom separator -->
  <line x1="${PAD}" y1="${footerY - 16}" x2="${WIDTH - PAD}" y2="${footerY - 16}" stroke="${BORDER}" stroke-width="1" />

  <!-- Footer: site name (monospace, like the site's h2 style) -->
  <text x="${PAD}" y="${footerY + 4}" font-family="JetBrainsMono, monospace" font-size="16" fill="${META}">rizafahmi.com</text>

  <!-- Footer: catatan label on the right -->
  <text x="${WIDTH - PAD}" y="${footerY + 4}" font-family="JetBrainsMono, monospace" font-size="16" fill="${META}" text-anchor="end">catatan</text>
</svg>`;
}

// --- Public API ---

/**
 * Generate an OG image PNG for an article.
 *
 * @param {object} opts
 * @param {string} opts.title     - Article title
 * @param {string} opts.excerpt   - Plain-text excerpt (HTML will be stripped)
 * @param {string[]} opts.tags    - Article tags
 * @param {string} opts.outputPath - Absolute path for the output PNG
 */
export async function generateOgImage({ title, excerpt, tags, outputPath }) {
  const cleanExcerpt = stripHtml(excerpt);
  const svg = buildSvg({ title, excerpt: cleanExcerpt, tags });

  await mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(outputPath);
}

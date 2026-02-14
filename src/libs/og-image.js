import sharp from "sharp";
import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// --- Font embedding (base64) for SVG rendering ---
const FONTS_DIR = path.resolve("assets/fonts");

let wotfardB64 = null;

function loadFonts() {
  if (!wotfardB64) {
    wotfardB64 = readFileSync(
      path.join(FONTS_DIR, "wotfard-regular-webfont.ttf")
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

/** Truncate text to a max length, adding ellipsis */
function truncate(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "\u2026";
}

/** Strip HTML tags, emoji, and collapse whitespace */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    // Remove emoji and other non-BMP / symbol characters that crash Pango
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

// --- SVG Template (native <text> elements, no foreignObject) ---

function buildSvg({ title, excerpt, tags }) {
  loadFonts();

  const WIDTH = 1200;
  const HEIGHT = 630;
  const PAD = 60;
  const BG = "#211a1e";
  const TEXT_COLOR = "#f5f0eb";
  const MUTED = "#a8a0a0";
  const ACCENT = "#e8b931";

  // --- Branding ---
  const brandY = 70;

  // --- Title ---
  const titleFontSize = 46;
  const titleLineHeight = 58;
  const titleY = 140;
  const titleMaxChars = 38;
  const titleMaxLines = 3;
  const titleLines = wrapText(title || "Catatan Baru", titleMaxChars, titleMaxLines);

  const titleTspans = titleLines
    .map((line, i) =>
      `<tspan x="${PAD}" dy="${i === 0 ? 0 : titleLineHeight}">${esc(line)}</tspan>`
    )
    .join("\n      ");

  // --- Excerpt ---
  const excerptFontSize = 22;
  const excerptLineHeight = 34;
  const excerptY = titleY + titleLines.length * titleLineHeight + 30;
  const excerptMaxChars = 55;
  const excerptMaxLines = 3;
  const excerptLines = wrapText(excerpt || "", excerptMaxChars, excerptMaxLines);

  const excerptTspans = excerptLines
    .map((line, i) =>
      `<tspan x="${PAD}" dy="${i === 0 ? 0 : excerptLineHeight}">${esc(line)}</tspan>`
    )
    .join("\n      ");

  // --- Tags ---
  const tagList = visibleTags(tags).slice(0, 4);
  const tagsY = HEIGHT - 50;
  let tagsSvg = "";
  if (tagList.length > 0) {
    let tagX = PAD;
    const tagParts = tagList.map((t) => {
      const label = `#${t}`;
      // Approximate width: ~10px per char + 24px padding
      const w = label.length * 10 + 24;
      const part = `
      <rect x="${tagX}" y="${tagsY - 22}" width="${w}" height="32" rx="4" fill="${ACCENT}" fill-opacity="0.15" />
      <text x="${tagX + 12}" y="${tagsY}" font-family="Wotfard, sans-serif" font-size="18" fill="${ACCENT}">${esc(label)}</text>`;
      tagX += w + 12;
      return part;
    });
    tagsSvg = tagParts.join("");
  }

  // --- Separator line ---
  const sepY = excerptY + excerptLines.length * excerptLineHeight + 20;

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Wotfard';
        src: url('data:font/ttf;base64,${wotfardB64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}" />

  <!-- Top accent line -->
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${ACCENT}" />

  <!-- Bottom accent line -->
  <rect x="0" y="${HEIGHT - 6}" width="${WIDTH}" height="6" fill="${ACCENT}" />

  <!-- Branding: circle + text -->
  <circle cx="${PAD + 20}" cy="${brandY}" r="20" fill="${ACCENT}" />
  <text x="${PAD + 10}" y="${brandY + 7}" font-family="Wotfard, sans-serif" font-size="22" font-weight="bold" fill="${BG}" text-anchor="middle">R</text>
  <text x="${PAD + 52}" y="${brandY + 7}" font-family="Wotfard, sans-serif" font-size="22" fill="${MUTED}">rizafahmi.com</text>

  <!-- Title -->
  <text x="${PAD}" y="${titleY}" font-family="Wotfard, sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="${TEXT_COLOR}">
      ${titleTspans}
  </text>

  <!-- Separator -->
  <line x1="${PAD}" y1="${sepY}" x2="${PAD + 80}" y2="${sepY}" stroke="${ACCENT}" stroke-width="3" />

  <!-- Excerpt -->
  <text x="${PAD}" y="${excerptY}" font-family="Wotfard, sans-serif" font-size="${excerptFontSize}" fill="${MUTED}">
      ${excerptTspans}
  </text>

  <!-- Tags -->
  ${tagsSvg}
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

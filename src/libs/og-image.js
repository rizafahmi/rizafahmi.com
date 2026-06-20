import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const FONTS_DIR = path.resolve("assets/fonts");
const NODE_FONTS = path.resolve("node_modules/@fontsource");

const ID_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const HIDDEN_TAGS = new Set(["all", "nav", "post", "catatan"]);

let fontCache = null;

function loadFonts() {
  if (fontCache) return fontCache;

  fontCache = {
    unbounded: readFileSync(
      path.join(NODE_FONTS, "unbounded/files/unbounded-latin-800-normal.woff2"),
    ).toString("base64"),
    schibsted: readFileSync(
      path.join(NODE_FONTS, "schibsted-grotesk/files/schibsted-grotesk-latin-400-normal.woff2"),
    ).toString("base64"),
    mono: readFileSync(path.join(FONTS_DIR, "JetBrainsMono-Regular.ttf")).toString("base64"),
  };

  return fontCache;
}

export function visibleTags(tags) {
  if (!tags) return [];
  const arr = typeof tags === "string" ? [tags] : tags;
  if (!Array.isArray(arr)) return [];
  return arr.filter((t) => t && !HIDDEN_TAGS.has(t));
}

function esc(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

  if (lines.length === maxLines) {
    const consumed = lines.join(" ").split(/\s+/).length;
    if (consumed < words.length) {
      const lastLine = lines[maxLines - 1];
      lines[maxLines - 1] = lastLine.endsWith("\u2026") ? lastLine : `${lastLine}\u2026`;
    }
  }

  return lines;
}

export function formatOgDate(dateInput) {
  if (!dateInput) return "catatan";
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "catatan";
  return `catatan · ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function titleFontSize(title) {
  const len = (title || "").length;
  if (len <= 36) return 52;
  if (len <= 52) return 44;
  return 38;
}

export function buildSvg({ title, excerpt, tags, date }) {
  const fonts = loadFonts();

  const WIDTH = 1200;
  const HEIGHT = 630;
  const PAD = 64;
  const ACCENT_W = 48;

  const BG = "#f7f7f5";
  const HEADING = "#0a0b0d";
  const META = "#55585d";
  const TAG_BG = "#0a0b0d";
  const TAG_TEXT = "#f7f7f5";
  const BORDER = "#0a0b0d";
  const ACCENT = "#c5f82a";

  const titleFontSizePx = titleFontSize(title);
  const titleLineHeight = Math.round(titleFontSizePx * 1.15);
  const titleY = 108;
  const titleMaxChars = titleFontSizePx >= 52 ? 28 : titleFontSizePx >= 44 ? 34 : 40;
  const titleMaxLines = 3;
  const titleLines = wrapText(title || "Catatan Baru", titleMaxChars, titleMaxLines);

  const titleTspans = titleLines
    .map(
      (line, i) => `<tspan x="${PAD}" dy="${i === 0 ? 0 : titleLineHeight}">${esc(line)}</tspan>`,
    )
    .join("\n      ");

  const excerptFontSize = 22;
  const excerptLineHeight = 34;
  const excerptY = titleY + titleLines.length * titleLineHeight + 28;
  const excerptMaxChars = 58;
  const excerptMaxLines = 3;
  const excerptLines = wrapText(excerpt || "", excerptMaxChars, excerptMaxLines);

  const excerptTspans = excerptLines
    .map(
      (line, i) => `<tspan x="${PAD}" dy="${i === 0 ? 0 : excerptLineHeight}">${esc(line)}</tspan>`,
    )
    .join("\n      ");

  const tagList = visibleTags(tags).slice(0, 4);
  const tagsY = HEIGHT - 132;
  let tagsSvg = "";
  if (tagList.length > 0) {
    let tagX = PAD;
    tagsSvg = tagList
      .map((label) => {
        const w = label.length * 9 + 28;
        const h = 32;
        const part = `
      <rect x="${tagX}" y="${tagsY}" width="${w}" height="${h}" fill="${TAG_BG}" stroke="${BORDER}" stroke-width="2" />
      <text x="${tagX + w / 2}" y="${tagsY + 22}" font-family="SchibstedGrotesk, sans-serif" font-size="14" font-weight="500" fill="${TAG_TEXT}" text-anchor="middle">${esc(label)}</text>`;
        tagX += w + 12;
        return part;
      })
      .join("");
  }

  const footerY = HEIGHT - 56;
  const footerLabel = formatOgDate(date);
  const contentRight = WIDTH - PAD - ACCENT_W - 16;

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Unbounded';
        src: url('data:font/woff2;base64,${fonts.unbounded}') format('woff2');
        font-weight: 800;
        font-style: normal;
      }
      @font-face {
        font-family: 'SchibstedGrotesk';
        src: url('data:font/woff2;base64,${fonts.schibsted}') format('woff2');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'JetBrainsMono';
        src: url('data:font/ttf;base64,${fonts.mono}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    </style>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}" />
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${ACCENT}" />
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="${BORDER}" stroke-width="2" />
  <rect x="${WIDTH - ACCENT_W}" y="8" width="${ACCENT_W}" height="${HEIGHT - 8}" fill="${ACCENT}" />

  <text x="${PAD}" y="${titleY}" font-family="Unbounded, sans-serif" font-size="${titleFontSizePx}" font-weight="800" fill="${HEADING}">
      ${titleTspans}
  </text>

  <text x="${PAD}" y="${excerptY}" font-family="SchibstedGrotesk, sans-serif" font-size="${excerptFontSize}" fill="${META}">
      ${excerptTspans}
  </text>

  ${tagsSvg}

  <line x1="${PAD}" y1="${footerY - 20}" x2="${contentRight}" y2="${footerY - 20}" stroke="${BORDER}" stroke-width="2" />

  <text x="${PAD}" y="${footerY + 6}" font-family="JetBrainsMono, monospace" font-size="15" fill="${HEADING}">RIZA FAHMI · rizafahmi.com</text>
  <text x="${contentRight}" y="${footerY + 6}" font-family="JetBrainsMono, monospace" font-size="15" fill="${META}" text-anchor="end">${esc(footerLabel)}</text>
</svg>`;
}

export async function generateOgImage({ title, excerpt, tags, date, outputPath }) {
  const cleanExcerpt = stripHtml(excerpt);
  const svg = buildSvg({ title, excerpt: cleanExcerpt, tags, date });

  await mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(outputPath);
}

/* Webfont manifest — the single source of truth for the site's self-hosted fonts.
 *
 * The three families used to come from a Google Fonts <link> in the <head>. That
 * stylesheet was the only render-blocking resource on the site and Lighthouse put
 * it at ~850ms of the critical path on every page: a third-party connection had to
 * be opened and a stylesheet fetched before the browser even learned which font
 * files it needed, so the webfonts arrived after first paint and the text repainted
 * — pushing LCP past FCP by ~330ms on text-LCP pages.
 *
 * Now the files ship from /assets/fonts/ on our own origin, the @font-face rules are
 * inlined into every <head> (see src/_includes/fonts.njk), and the three faces that
 * paint above the fold are preloaded. No third-party request is left on the path.
 *
 * To change a weight or family: edit FAMILIES below. eleventy.config.js derives the
 * passthrough-copy map from it, so the files follow automatically. test/webfonts.test.js
 * asserts every URL the CSS references is a file that actually gets copied.
 */

/* Verbatim from the Google Fonts css2 API, so the browser downloads the same subset
 * for a given character as it did before. Indonesian text is pure `latin`; `latin-ext`
 * is only fetched when a page actually uses a character in its range. */
export const SUBSETS = {
  latin:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  "latin-ext":
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
};

/* Every face here is one a page can be made to download, and webfont bytes are what
 * decides LCP on this site: Lighthouse's simulated mobile link charges about 6ms per
 * KB, so the face list IS the LCP budget. Measured before this list was trimmed --
 * /showcase/ pulled 5 faces (87KB) and scored LCP 1.50s, /now/ pulled 9 faces (184KB)
 * and scored 2.11s, on identical markup and an otherwise empty critical path.
 *
 * So do not add a face without a rule in assets/*.css that selects it, and prefer
 * reusing a weight already listed. What was dropped, and why:
 *   - Unbounded 700 and 900: DESIGN.md specifies fontWeight 800 for the display token.
 *     The 900s in home.css/tulisan.css were drift and are now 800; nothing ever asked
 *     for 700 explicitly (it came from `font-weight: bold` inherited onto display text).
 *   - Schibsted Grotesk 500 and Martian Mono 500: declared but selected by no rule.
 *   - Schibsted Grotesk italics: 51KB to set two blockquote rules. The browser
 *     synthesises an oblique from the roman, which is standard for a grotesk.
 * Between them that is ~93KB off every content page. */
export const FAMILIES = [
  {
    id: "unbounded",
    family: "Unbounded",
    faces: [{ weight: 800, style: "normal" }],
  },
  {
    id: "schibsted-grotesk",
    family: "Schibsted Grotesk",
    faces: [
      { weight: 400, style: "normal" },
      { weight: 700, style: "normal" },
    ],
  },
  {
    id: "martian-mono",
    family: "Martian Mono",
    faces: [
      { weight: 400, style: "normal" },
      { weight: 700, style: "normal" },
    ],
  },
];

/* Preloaded on every page, so keep it to what paints above the fold: body text
 * (Schibsted Grotesk 400), the heading that is the LCP element on nearly every page
 * (Unbounded 800), and the nav/metadata mono (Martian Mono 400). Preloading a face the
 * page does not paint is worse than preloading nothing -- it spends bandwidth on the
 * wrong file AND leaves the real one to be discovered late. This site has shipped that
 * bug twice: a 31KB Wotfard file no font-family referenced, then Unbounded 700 when
 * every heading is 800. `latin` only: a preload whose unicode-range never matches is
 * pure waste. These three are the whole face list except the two bold variants. */
export const preloadFaces = () => [
  { id: "schibsted-grotesk", subset: "latin", weight: 400, style: "normal" },
  { id: "unbounded", subset: "latin", weight: 800, style: "normal" },
  { id: "martian-mono", subset: "latin", weight: 400, style: "normal" },
];

const basename = (id, subset, weight, style) => `${id}-${subset}-${weight}-${style}.woff2`;

export const fileUrl = (id, subset, weight, style) =>
  `/assets/fonts/${basename(id, subset, weight, style)}`;

const sourcePath = (id, subset, weight, style) =>
  `node_modules/@fontsource/${id}/files/${basename(id, subset, weight, style)}`;

/* Every (family x face x subset) combination, in one flat list. */
function* allFaces() {
  for (const { id, family, faces } of FAMILIES) {
    for (const subset of Object.keys(SUBSETS)) {
      for (const { weight, style } of faces) {
        yield { id, family, subset, weight, style };
      }
    }
  }
}

/** `{ "<node_modules path>": "<dist path>" }` for eleventyConfig.addPassthroughCopy. */
export function passthroughCopyMap() {
  const map = {};
  for (const { id, subset, weight, style } of allFaces()) {
    map[sourcePath(id, subset, weight, style)] =
      `assets/fonts/${basename(id, subset, weight, style)}`;
  }
  return map;
}

/** The @font-face block, inlined into every <head>. */
export function fontFaceCss() {
  const rules = [];
  for (const { id, family, subset, weight, style } of allFaces()) {
    rules.push(
      `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:swap;src:url(${fileUrl(id, subset, weight, style)}) format('woff2');unicode-range:${SUBSETS[subset]}}`,
    );
  }
  return rules.join("");
}

/** The <link rel="preload"> tags for the above-the-fold faces. */
export function preloadLinks() {
  return preloadFaces()
    .map(
      ({ id, subset, weight, style }) =>
        `<link rel="preload" href="${fileUrl(id, subset, weight, style)}" as="font" type="font/woff2" crossorigin="anonymous" />`,
    )
    .join("\n");
}

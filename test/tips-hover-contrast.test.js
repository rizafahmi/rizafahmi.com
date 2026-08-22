import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("assets/global.css", "utf8");

// --- WCAG contrast ---------------------------------------------------------

function channel(value) {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? [...m].map((c) => c + c).join("") : m;
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// The tip card title renders at 15.2px/700. WCAG "large text" starts at 18.66px
// bold, so this is normal text and the AA threshold is 4.5:1, not 3:1.
const AA_NORMAL_TEXT = 4.5;

// --- read the theme tokens straight out of the stylesheet ------------------

function block(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `no ${selector} block in assets/global.css`);
  return css.slice(start, css.indexOf("}", start));
}

const ROOT = block(":root");
const DARK = block('[data-theme="dark"]');

function token(name, scope) {
  const direct = scope.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!direct) return null;
  const value = direct[1].trim();
  const indirect = value.match(/^var\((--[\w-]+)\)$/);
  // One level of indirection is enough: --link-color: var(--accent-cobalt).
  if (indirect) return token(indirect[1], scope) ?? token(indirect[1], ROOT);
  return value.replace(/\s*\/\*.*$/, "").trim();
}

const THEMES = {
  light: {
    link: token("--link-color", ROOT),
    bg: token("--bg-color", ROOT),
    heading: token("--heading-color", ROOT),
  },
  dark: {
    link: token("--link-color", DARK),
    bg: token("--bg-color", DARK),
    heading: token("--heading-color", DARK),
  },
};

test("both themes resolve the tokens the tips hover states are built from", () => {
  for (const [name, t] of Object.entries(THEMES)) {
    for (const [key, value] of Object.entries(t)) {
      assert.match(value ?? "", /^#[0-9a-f]{3,6}$/i, `${name}.${key} did not resolve: ${value}`);
    }
  }
});

// --- the defect this file exists for ---------------------------------------
//
// `a:hover` swaps in a SOLID background of var(--link-color) site-wide. A link
// that wraps a whole card therefore paints that colour across the card. Any
// text inside it that also turns var(--link-color) becomes invisible: colour
// equals background, contrast 1.0. That shipped in #186 for both the card
// title and the per-card tag links, in both themes.

test("the global link hover still paints a solid background, which is why cards must opt out", () => {
  const rule = block("a:hover");
  assert.match(rule, /background-color:\s*var\(--link-color\)/);
});

test("whole-card tip links cancel the global hover background", () => {
  // The site already does this for .article / .featured-project-card /
  // .related-card. Tip cards belong in that same group.
  const start = css.indexOf(".article a:hover,");
  assert.notEqual(start, -1, "the card-link hover override group is gone");
  const group = css.slice(start, css.indexOf("}", start));

  assert.match(group, /\.tip-card-link:hover/);
  assert.match(group, /\.tip-card-tags a:hover/);
  assert.match(group, /background-color:\s*transparent\s*!important/);
});

test("a hovered tip title is readable against the page, in both themes", () => {
  for (const [name, t] of Object.entries(THEMES)) {
    const ratio = contrastRatio(t.link, t.bg);
    assert.ok(
      ratio >= AA_NORMAL_TEXT,
      `${name}: hovered title ${t.link} on ${t.bg} is ${ratio.toFixed(2)}:1, need ${AA_NORMAL_TEXT}:1`,
    );
  }
});

test("a resting tip title is readable against the page, in both themes", () => {
  for (const [name, t] of Object.entries(THEMES)) {
    const ratio = contrastRatio(t.heading, t.bg);
    assert.ok(
      ratio >= AA_NORMAL_TEXT,
      `${name}: resting title ${t.heading} on ${t.bg} is ${ratio.toFixed(2)}:1`,
    );
  }
});

test("the hovered tip title never matches the colour the global hover would paint behind it", () => {
  // The actual invariant. If someone re-points --link-color, or drops the
  // opt-out above, this is the assertion that fails.
  for (const [name, t] of Object.entries(THEMES)) {
    const ratio = contrastRatio(t.link, t.link);
    assert.equal(ratio, 1, "sanity: identical colours must measure 1:1");
    assert.notEqual(
      t.link.toLowerCase(),
      t.bg.toLowerCase(),
      `${name}: hovered title colour equals the background it sits on`,
    );
  }
});

// --- keyboard users get no hover at all ------------------------------------

test("tip cards keep a visible focus ring, since hover is their only other affordance", () => {
  // .tip-card-link suppresses the site's underline, so focus-visible is the
  // whole affordance for anyone navigating by keyboard.
  assert.match(css, /a:focus-visible,\s*\n?\s*button:focus-visible\s*{[^}]*outline:\s*3px solid/);
  assert.match(
    css,
    /\[data-theme="dark"\] a:focus-visible,[\s\S]{0,120}outline-color:\s*var\(--accent-acid\)/,
  );
  // Nothing in the tips styles may remove that ring.
  const tipsSection = css.slice(css.indexOf(".tips-index"));
  assert.doesNotMatch(tipsSection, /outline:\s*(none|0)/);
});

// --- tag navigation pills --------------------------------------------------

test("tagnav pills contrast against their accent fill, not the page background", () => {
  // These deliberately hardcode on-accent text colours rather than use
  // --text-color: the pill's background is the accent, and --text-color is
  // chosen for the page background (in dark it is #c2cad6, which would be
  // unreadable on cobalt). Same convention as .hero-nav a:hover and .card:hover.
  const acid = token("--accent-acid", ROOT);
  const cobalt = token("--accent-cobalt", ROOT);

  assert.ok(
    contrastRatio("#0a0b0d", acid) >= AA_NORMAL_TEXT,
    `light tagnav pill: #0a0b0d on ${acid}`,
  );
  assert.ok(
    contrastRatio("#ffffff", cobalt) >= AA_NORMAL_TEXT,
    `dark tagnav pill: #ffffff on ${cobalt}`,
  );

  // And the token that would be the "obvious" refactor is genuinely worse.
  const darkText = token("--text-color", DARK);
  assert.ok(
    contrastRatio(darkText, cobalt) < AA_NORMAL_TEXT,
    "if --text-color now passes on cobalt, revisit the hardcoded #ffffff",
  );
});

// WCAG 1.4.11: a non-text indicator needs 3:1. The hovered thumbnail border is
// a secondary cue — the title carries the affordance — but cobalt pinned across
// both themes measured 2.61:1 on the dark background.
const UI_COMPONENT = 3;

test("the hovered thumbnail border follows the theme instead of pinning one accent", () => {
  const start = css.indexOf(".tip-card-link:hover .tip-thumb");
  assert.notEqual(start, -1);
  const rule = css.slice(start, css.indexOf("}", start));
  assert.match(rule, /border-color:\s*var\(--link-color\)/);
  assert.doesNotMatch(rule, /var\(--accent-cobalt\)/);
});

test("the hovered thumbnail border is visible in both themes", () => {
  for (const [name, t] of Object.entries(THEMES)) {
    const ratio = contrastRatio(t.link, t.bg);
    assert.ok(
      ratio >= UI_COMPONENT,
      `${name}: thumb border ${t.link} on ${t.bg} is ${ratio.toFixed(2)}:1, need ${UI_COMPONENT}:1`,
    );
  }
});

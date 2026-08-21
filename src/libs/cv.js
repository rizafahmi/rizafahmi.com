/**
 * Helpers for the CV pages (/cv/ and /cv/en/).
 *
 * The content itself lives in src/_data/cv.js — this module only formats it.
 * No fetching, no inferring: whatever the data file says, in the order it says.
 *
 * Two rules drive the shapes here:
 *
 *   1. Dates are stored as "YYYY" or "YYYY-MM" and formatted at build time.
 *      The LinkedIn export's stated durations ("7 years 1 month") were computed
 *      the day it was exported and are already wrong, so nothing here reads a
 *      duration from the data. An open-ended role stores `end: null` and prints
 *      "Sekarang" / "Present", which stays honest however long the page sits.
 *
 *   2. Prose is stored as { id, en } and picked per page. Both language pages
 *      render from the same data, so neither can drift away from the other.
 */

const MONTHS = {
  id: [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

const PRESENT = { id: "Sekarang", en: "Present" };

const DEFAULT_LANG = "id";

function months(lang) {
  return MONTHS[lang] ?? MONTHS[DEFAULT_LANG];
}

/**
 * Pick one language out of a { id, en } pair. Plain strings (a technology name,
 * a school) pass straight through, so the data file only spells out both
 * languages where the two genuinely differ.
 */
export function translate(value, lang) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value[DEFAULT_LANG] ?? "";
}

/**
 * "2018-11" -> "November 2018". A year-only date stays a bare year: the export
 * only records year precision for the oldest roles, and inventing a month there
 * would be inventing a fact.
 */
export function formatMonth(value, lang) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4})(?:-(\d{2}))?$/);
  if (!match) return trimmed;

  const [, year, month] = match;
  if (!month) return year;

  const index = Number(month) - 1;
  const name = months(lang)[index];
  return name ? `${name} ${year}` : year;
}

/** "Maret 2016 – November 2018", or "November 2018 – Sekarang" when open-ended. */
export function formatPeriod(role, lang) {
  const start = formatMonth(role?.start, lang);
  const end = role?.end ? formatMonth(role.end, lang) : (PRESENT[lang] ?? PRESENT[DEFAULT_LANG]);
  if (!start) return end;
  return `${start} – ${end}`;
}

/**
 * Every skill across every group, flattened into plain strings — handy for
 * checks and indexes. Items are usually plain strings already (a technology
 * name reads the same in both languages); the bilingual ones get picked here.
 */
export function skillItems(cv, lang = DEFAULT_LANG) {
  if (!Array.isArray(cv?.skills)) return [];
  return cv.skills
    .flatMap((group) => (Array.isArray(group.items) ? group.items : []))
    .map((item) => translate(item, lang));
}

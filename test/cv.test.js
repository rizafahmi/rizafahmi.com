import assert from "node:assert/strict";
import test from "node:test";

import cv from "../src/_data/cv.js";
import { formatMonth, formatPeriod, skillItems, translate } from "../src/libs/cv.js";

test("formatMonth renders month precision in the page language", () => {
  assert.equal(formatMonth("2018-11", "id"), "November 2018");
  assert.equal(formatMonth("2018-11", "en"), "November 2018");
  assert.equal(formatMonth("2007-05", "id"), "Mei 2007");
  assert.equal(formatMonth("2007-05", "en"), "May 2007");
  assert.equal(formatMonth("2016-03", "id"), "Maret 2016");
  assert.equal(formatMonth("2016-03", "en"), "March 2016");
});

test("formatMonth keeps year-only dates as plain years", () => {
  assert.equal(formatMonth("2011", "id"), "2011");
  assert.equal(formatMonth("2011", "en"), "2011");
});

test("formatPeriod joins start and end with an en dash", () => {
  assert.equal(
    formatPeriod({ start: "2016-03", end: "2018-11" }, "id"),
    "Maret 2016 – November 2018",
  );
  assert.equal(formatPeriod({ start: "2003", end: "2007-05" }, "en"), "2003 – May 2007");
});

// "Present" must be rendered from an open-ended role, never baked into the data,
// so the page stays honest however long it sits on the site.
test("formatPeriod renders an open-ended role as Sekarang / Present", () => {
  assert.equal(formatPeriod({ start: "2018-11", end: null }, "id"), "November 2018 – Sekarang");
  assert.equal(formatPeriod({ start: "2018-11", end: null }, "en"), "November 2018 – Present");
});

test("translate picks the requested language and falls back to Indonesian", () => {
  assert.equal(translate({ id: "Halo", en: "Hello" }, "en"), "Hello");
  assert.equal(translate({ id: "Halo", en: "Hello" }, "id"), "Halo");
  assert.equal(translate({ id: "Halo" }, "en"), "Halo");
  assert.equal(translate("Elixir", "en"), "Elixir");
  assert.equal(translate(null, "en"), "");
});

test("the CV publishes Indonesian and English only", () => {
  assert.deepEqual(cv.languages, ["id", "en"]);
  assert.equal(cv.meta.id.permalink, "/cv/");
  assert.equal(cv.meta.en.permalink, "/cv/en/");
});

// The captain decided email is the only personal detail on this public,
// permanent page. A scraped address or phone number cannot be recalled.
test("the CV data carries no location and no phone number", () => {
  const serialized = JSON.stringify(cv);
  assert.doesNotMatch(serialized, /Banten/i);
  assert.doesNotMatch(serialized, /\btel:/i);
  assert.doesNotMatch(serialized, /\+62/);
  assert.doesNotMatch(serialized, /\b08\d{8,}\b/);
});

test("the CV data carries the email and the public profile links", () => {
  assert.equal(cv.identity.email, "rizafahmi@gmail.com");
  const urls = cv.identity.profiles.map((profile) => profile.url);
  assert.deepEqual(urls, [
    "https://rizafahmi.com",
    "https://github.com/rizafahmi",
    "https://linkedin.com/in/rizafahmi",
    "https://x.com/rizafahmi22",
    "https://youtube.com/rizafahmi",
  ]);
});

// LinkedIn's "Top Skills" are endorsement artifacts that misrepresent current
// work. They may appear as history inside an old role, never as a skill.
test("the skill list does not republish LinkedIn's endorsement artifacts", () => {
  const items = skillItems(cv).map((item) => item.toLowerCase());
  for (const banned of ["mysql", "postgresql", "php"]) {
    assert.ok(!items.includes(banned), `skills must not list ${banned}`);
  }
});

test("the skill list is drawn from the current, evidenced stack", () => {
  const items = skillItems(cv);
  for (const expected of ["Elixir", "Phoenix LiveView", "TypeScript", "Astro", "SQLite"]) {
    assert.ok(items.includes(expected), `skills should list ${expected}`);
  }
});

// Captain instruction, 2026-08-21: the AppsCO: Apps Colony role is off the CV
// entirely, and the dead appsco.id link with it. AppsCoast — a different thing,
// a podcast still listed on /showcase/ — is deliberately not covered by this.
test("the AppsCO employer and its dead domain are gone", () => {
  const serialized = JSON.stringify(cv);
  assert.doesNotMatch(serialized, /Apps\s*Colony/i);
  assert.doesNotMatch(serialized, /appsco\.id/i);
  assert.equal(cv.experience.filter((entry) => /^AppsCO\b/i.test(entry.org)).length, 0);
});

// Seven employers, eight roles — Hacktiv8 accounts for two of them.
test("the experience list is the eight roles the captain signed off", () => {
  assert.equal(cv.experience.length, 7);
  assert.equal(
    cv.experience.reduce((total, entry) => total + entry.roles.length, 0),
    8,
  );
});

// PT. IONSOFT and IYAA.com are one job under two names, not two jobs.
test("IONSOFT and IYAA are a single experience entry", () => {
  const matches = cv.experience.filter((entry) => /IONSOFT|IYAA/i.test(entry.org));
  assert.equal(matches.length, 1);
  assert.match(matches[0].org, /IONSOFT/);
  assert.match(matches[0].org, /IYAA/);
});

test("experience runs most recent first and every role has a start date", () => {
  const starts = cv.experience.map((entry) => entry.roles[0].start);
  const sorted = [...starts].sort().reverse();
  assert.deepEqual(starts, sorted);

  for (const entry of cv.experience) {
    assert.ok(entry.roles.length > 0, `${entry.org} needs at least one role`);
    for (const role of entry.roles) {
      assert.match(role.start, /^\d{4}(-\d{2})?$/, `${entry.org} has an unparseable start`);
    }
  }
});

// The export's stated durations were computed at export time and are stale.
test("no experience entry hard-codes a duration or the word Present", () => {
  const serialized = JSON.stringify(cv.experience);
  assert.doesNotMatch(serialized, /\d+\s+(year|month|tahun|bulan)/i);
  assert.doesNotMatch(serialized, /"Present"/);
  assert.doesNotMatch(serialized, /"Sekarang"/);
});

test("every experience entry carries both languages for its prose", () => {
  for (const entry of cv.experience) {
    assert.ok(entry.summary.id, `${entry.org} is missing Indonesian prose`);
    assert.ok(entry.summary.en, `${entry.org} is missing English prose`);
    for (const role of entry.roles) {
      assert.ok(role.title.id && role.title.en, `${entry.org} has an untranslated role title`);
    }
  }
});

// http://appsco.id no longer resolves; a CV advertising a dead link is worse
// than one without.
test("the dead appsco.id link is not published", () => {
  assert.doesNotMatch(JSON.stringify(cv), /appsco\.id/i);
});

test("publications are listed without guessed URLs", () => {
  assert.equal(cv.honours.publications.length, 4);
  for (const publication of cv.honours.publications) {
    assert.equal(typeof publication, "string");
  }
});

test("education lists both degrees, most recent first", () => {
  assert.equal(cv.education.length, 2);
  assert.match(cv.education[0].school, /University of Indonesia/);
  assert.match(cv.education[1].school, /BINUS/);
});

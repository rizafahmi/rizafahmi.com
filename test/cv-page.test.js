import assert from "node:assert/strict";
import test from "node:test";

import nunjucks from "nunjucks";
import cv from "../src/_data/cv.js";
import karya from "../src/_data/karya.js";
import { formatMonth, formatPeriod, orderedChannels, translate } from "../src/libs/cv.js";
import { selectProjects } from "../src/libs/karya.js";

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader("src/_includes"), {
  autoescape: true,
});
env.addFilter("translate", translate);
env.addFilter("cvPeriod", formatPeriod);
env.addFilter("cvMonth", formatMonth);
env.addFilter("orderedChannels", orderedChannels);

function render(lang) {
  return env.renderString(
    '{% import "cv_body.njk" as cvBody %}{{ cvBody.render(cv, lang, projects) }}',
    { cv, lang, projects: selectProjects(karya) },
  );
}

const pages = { id: render("id"), en: render("en") };

function sectionIds(html) {
  return [...html.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map((match) => match[1]);
}

function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

test("both language versions render", () => {
  for (const [lang, html] of Object.entries(pages)) {
    assert.ok(html.trim().length > 2000, `${lang} rendered suspiciously short`);
    assert.match(html, /Riza Fahmi/);
  }
});

// Two hand-maintained copies drift the moment one is edited. Both pages are
// rendered from one macro over one data file, so the shape must match exactly.
test("the two languages stay in sync structurally", () => {
  assert.deepEqual(sectionIds(pages.en), sectionIds(pages.id));
  assert.ok(sectionIds(pages.id).length >= 8, "the CV should have its full section set");

  for (const pattern of [/class="cv-entry"/g, /class="cv-role"/g, /class="cv-project"/g]) {
    assert.equal(
      count(pages.en, pattern),
      count(pages.id, pattern),
      `${pattern} count differs between languages`,
    );
  }
});

test("neither language leaks a location or a phone number", () => {
  for (const [lang, html] of Object.entries(pages)) {
    assert.doesNotMatch(html, /Banten/i, `${lang} leaks a location`);
    assert.doesNotMatch(html, /tel:/i, `${lang} leaks a phone link`);
    assert.doesNotMatch(html, /\+62/, `${lang} leaks a phone number`);
  }
});

test("both languages publish the email and every profile link", () => {
  for (const [lang, html] of Object.entries(pages)) {
    assert.match(html, /mailto:rizafahmi@gmail\.com/, `${lang} is missing the email`);
    for (const profile of cv.identity.profiles) {
      assert.ok(html.includes(profile.url), `${lang} is missing ${profile.url}`);
    }
  }
});

test("each language renders its own prose, not the other one's", () => {
  assert.match(pages.id, /Sekarang/);
  assert.match(pages.en, /Present/);
  assert.doesNotMatch(pages.en, /Pengalaman Kerja/);
  assert.doesNotMatch(pages.id, /Work Experience/);
});

test("every curated project from Karya reaches the CV", () => {
  const projects = selectProjects(karya);
  for (const [lang, html] of Object.entries(pages)) {
    assert.equal(count(html, /class="cv-project"/g), projects.length, `${lang} project count`);
    for (const project of projects) {
      assert.ok(html.includes(project.name), `${lang} is missing project ${project.name}`);
    }
  }
});

// On paper a link cannot be clicked, so every profile link spells out its own
// address as the link text. Inline links elsewhere keep human labels on purpose.
test("profile links read as their own address, so they survive being printed", () => {
  for (const [lang, html] of Object.entries(pages)) {
    for (const profile of cv.identity.profiles) {
      const address = profile.url.replace("https://", "");
      assert.ok(
        html.includes(`>${address}</a>`),
        `${lang} does not print the address for ${profile.url}`,
      );
    }
  }
});

test("both languages render a visible status for every content channel", () => {
  const channelCount = cv.content.channels.length;
  for (const [lang, html] of Object.entries(pages)) {
    assert.equal(
      count(html, /class="cv-status"/g),
      channelCount,
      `${lang} must show a status badge for every channel`,
    );
  }
  assert.match(pages.id, /Berjalan/);
  assert.match(pages.id, /Arsip/);
  assert.match(pages.en, /Running/);
  assert.match(pages.en, /Archive/);
  assert.doesNotMatch(pages.en, /Berjalan|Arsip/);
  assert.doesNotMatch(pages.id, /Running|Archive/);
});

function renderedChannelNames(html) {
  return [...html.matchAll(/>([^<]+)<\/a>\s*<span class="cv-status">/g)].map((match) => match[1]);
}

test("current channels render before retired ones on both language pages", () => {
  const expected = [
    ...cv.content.channels.filter((channel) => channel.status === "current").map((c) => c.name),
    ...cv.content.channels.filter((channel) => channel.status === "retired").map((c) => c.name),
  ];

  for (const [lang, html] of Object.entries(pages)) {
    assert.deepEqual(renderedChannelNames(html), expected, `${lang} channel order`);
  }
});

test("channel status count stays aligned across languages", () => {
  assert.equal(count(pages.en, /class="cv-status"/g), count(pages.id, /class="cv-status"/g));
});

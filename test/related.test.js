import test from "node:test";
import assert from "node:assert/strict";

import { getRelatedPosts, __test } from "../src/libs/related.js";

function mkItem({ url, title, tags = [], date, templateContent = "" }) {
  return {
    url,
    templateContent,
    data: { title, tags, date },
  };
}

test("tokenize strips html + stopwords", () => {
  const tokens = __test.tokenize("<p>Ini adalah The test, untuk kamu!</p>");
  assert.deepEqual(tokens, ["adalah", "test"]);
});

test("prefers shared tags when available", () => {
  const collection = [
    mkItem({ url: "/a/", title: "A", tags: ["catatan", "js"], date: "2024-01-01", templateContent: "Belajar JavaScript dasar" }),
    mkItem({ url: "/b/", title: "B", tags: ["catatan", "js", "web"], date: "2024-02-01", templateContent: "JavaScript untuk web" }),
    mkItem({ url: "/c/", title: "C", tags: ["catatan", "go"], date: "2024-03-01", templateContent: "Golang concurrency" }),
  ];

  const current = { url: "/a/", tags: ["js"], title: "Belajar JS", content: "Dasar JavaScript" };
  const [first] = getRelatedPosts(collection, current, { limit: 1 });
  assert.equal(first.url, "/b/");
});

test("falls back to similarity when no shared tags", () => {
  const collection = [
    mkItem({ url: "/a/", title: "A", tags: ["catatan", "js"], date: "2024-01-01", templateContent: "Belajar JavaScript dasar" }),
    mkItem({ url: "/b/", title: "B", tags: ["catatan", "go"], date: "2024-02-01", templateContent: "JavaScript tips and tricks" }),
    mkItem({ url: "/c/", title: "C", tags: ["catatan", "python"], date: "2024-03-01", templateContent: "Python data analysis" }),
  ];

  const current = { url: "/a/", tags: ["js"], title: "JavaScript tips", content: "" };

  // Hide 'js' so that there are zero shared tags, forcing similarity fallback.
  const [first] = getRelatedPosts(collection, current, {
    limit: 1,
    hiddenTags: new Set(["all", "nav", "post", "catatan", "js"]),
  });

  assert.equal(first.url, "/b/");
});

test("deterministic tie-breakers: date then url", () => {
  const collection = [
    mkItem({ url: "/current/", title: "Current", tags: ["catatan", "web"], date: "2024-01-01", templateContent: "web" }),
    mkItem({ url: "/same-1/", title: "Same", tags: ["catatan", "web"], date: "2024-02-01", templateContent: "web" }),
    mkItem({ url: "/same-0/", title: "Same", tags: ["catatan", "web"], date: "2024-02-01", templateContent: "web" }),
  ];

  const related = getRelatedPosts(collection, { url: "/current/", tags: ["web"], title: "web", content: "web" }, { limit: 2 });
  assert.deepEqual(related.map((i) => i.url), ["/same-0/", "/same-1/"]);
});

import pluginRss from "@11ty/eleventy-plugin-rss";
import shikiPlugin from "./src/libs/shiki.js";

function getRelativeTimeString(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "tahun", seconds: 31536000 },
    { label: "bulan", seconds: 2592000 },
    { label: "hari", seconds: 86400 },
    { label: "jam", seconds: 3600 },
    { label: "menit", seconds: 60 },
    { label: "detik", seconds: 1 },
  ];

  for (const interval of intervals) {
    const value = Math.floor(diffInSeconds / interval.seconds);
    if (value >= 1) {
      return `${value} ${interval.label} yang lalu`;
    }
  }
}

export default function (eleventyConfig) {
  eleventyConfig.setServerOptions({
    port: 3000,
  });

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(shikiPlugin);

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("src/_redirects");


  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return getRelativeTimeString(dateObj);
  });

  eleventyConfig.addFilter("dateToISO", (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  });

  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array)) return [];
    return array.slice(0, n);
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "1 menit baca";
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes + " menit baca";
  });

  const HIDDEN_TAGS = new Set(["all", "nav", "post", "catatan"]);

  function normalizeTags(tags) {
    if (!tags) return [];
    let arr = tags;
    if (typeof arr === "string") arr = [arr];
    if (!Array.isArray(arr)) return [];
    return arr.filter((t) => t && !HIDDEN_TAGS.has(t));
  }

  // Pick related posts by shared tags/topik.
  // Deterministic ordering: shared tag count (desc), date (desc), url (asc).
  eleventyConfig.addFilter("relatedByTags", (collection, tags, currentUrl, limit = 3) => {
    if (!Array.isArray(collection) || !collection.length) return [];

    const currentTags = new Set(normalizeTags(tags));

    const scored = [];
    for (const item of collection) {
      if (!item || item.url === currentUrl) continue;

      const itemTags = normalizeTags(item.data && item.data.tags);
      let shared = 0;
      if (currentTags.size) {
        for (const t of itemTags) {
          if (currentTags.has(t)) shared++;
        }
      }

      scored.push({
        item,
        shared,
        date: item.data && item.data.date ? new Date(item.data.date).getTime() : 0,
        url: item.url || "",
      });
    }

    scored.sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      if (b.date !== a.date) return b.date - a.date;
      return a.url.localeCompare(b.url);
    });

    // Prefer posts with at least 1 shared tag; otherwise fall back to latest.
    const withShared = scored.filter((x) => x.shared > 0);
    return (withShared.length ? withShared : scored)
      .slice(0, limit)
      .map((x) => x.item);
  });

  // Plain-text excerpt for meta description (social previews, SEO).
  eleventyConfig.addFilter("excerpt", (content, length = 180) => {
    if (!content) return "";
    const text = content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length <= length) return text;
    return text.slice(0, length).replace(/\s+\S*$/, "") + "…";
  });

  // Format number with locale string (e.g. 123456 -> "123.456" for id-ID).
  eleventyConfig.addFilter("localeString", (num, locale = "id-ID") => {
    const n = Number(num);
    if (!Number.isFinite(n)) return String(num);
    return n.toLocaleString(locale);
  });

  eleventyConfig.addCollection("catatan", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/catatan/*.md").filter(item => item.data.date);
  });

  eleventyConfig.addCollection("latestCatatan", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/catatan/*.md")
      .filter(item => item.data.date)
      .sort((a, b) => b.data.date - a.data.date)
      .slice(0, 4);
  });

  // Curated tag list for /tags and /tags/<tag>/ pages.
  // Eleventy automatically creates collections per tag; this collection
  // only defines which tags should be shown.
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagSet = new Set();
    for (const item of collectionApi.getAll()) {
      let tags = item.data && item.data.tags;
      if (!tags) continue;
      if (typeof tags === "string") tags = [tags];
      if (!Array.isArray(tags)) continue;

      for (const tag of tags) {
        if (!tag) continue;
        // Hide overly-generic/internal tags
        if (["all", "nav", "post", "catatan"].includes(tag)) continue;
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort((a, b) => a.localeCompare(b));
  });

  eleventyConfig.addTransform("lazyImages", function(content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      let first = true;
      return content.replace(
        /<img(?![^>]*loading=)([^>]*)>/gi,
        (match, attrs) => {
          if (first) {
            first = false;
            return match;
          }
          return `<img loading="lazy"${attrs}>`;
        }
      );
    }
    return content;
  });

  return {
    dir: { input: "src", output: "dist" },
    dataTemplate: "njk",
    markdownTemplateEngine: "njk",
  };
}

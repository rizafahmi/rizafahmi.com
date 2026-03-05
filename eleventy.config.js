import path from "node:path";
import { existsSync } from "node:fs";
import pluginRss from "@11ty/eleventy-plugin-rss";
import shikiPlugin from "./src/libs/shiki.js";
import Image from "@11ty/eleventy-img";
import { getRelatedPosts } from "./src/libs/related.js";
import { generateOgImage } from "./src/libs/og-image.js";

const isDev = process.env.ELEVENTY_ENV === "dev";

async function imageShortcode(src, alt, className = "", sizes = "100vw", widths = [300, 600, 1200]) {
  if (!src) {
    console.error(`[11ty/img] Missing src attribute. Alt: ${alt}`);
    return "";
  }

  if (isDev) {
    return `<img src="${src}" alt="${alt}"${className ? ` class="${className}"` : ""} loading="lazy" decoding="async">`;
  }

  try {
    let metadata = await Image(src, {
      widths: widths,
      formats: ["webp", "png"],
      outputDir: "./dist/img/",
      urlPath: "/img/",
      cacheOptions: {
        duration: "1y",
        directory: ".cache/eleventy-img",
      },
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      }
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    if (className) {
      imageAttributes.class = className;
    }

    if (!metadata) {
       console.warn(`[11ty/img] Warning: Metadata missing for ${src}. Fallback to default img.`);
       return `<img src="${src}" alt="${alt}" class="${className}" loading="lazy" decoding="async">`;
    }

    return Image.generateHTML(metadata, imageAttributes);

  } catch (error) {
    console.warn(`[11ty/img] Error processing ${src}: ${error.message}. Fallback to default img.`);
    return `<img src="${src}" alt="${alt}" class="${className}" loading="lazy" decoding="async">`;
  }
}


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

  eleventyConfig.addAsyncShortcode("image", imageShortcode);

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

  // Related articles (build-time, deterministic):
  // Combine signals: shared tags, content similarity, and recency.
  //
  // Usage (recommended):
  //   collections.catatan | relatedArticles({ url, tags, title, excerpt, content }, 3)
  eleventyConfig.addFilter("relatedArticles", (collection, current, limit = 3) => {
    return getRelatedPosts(collection, current, { limit, hiddenTags: HIDDEN_TAGS });
  });

  // Backwards-compatible filter (previously tag-only).
  eleventyConfig.addFilter("relatedByTags", (collection, tags, currentUrl, limit = 3) => {
    return getRelatedPosts(
      collection,
      { url: currentUrl, tags },
      { limit, hiddenTags: HIDDEN_TAGS }
    );
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

  // Sort a collection by view counts (descending) using GoatCounter data.
  // Usage: collections.catatan | popularByViews(goatcounterViews, 10)
  eleventyConfig.addFilter("popularByViews", (collection, views = {}, limit = 10) => {
    if (!Array.isArray(collection) || !collection.length) return [];

    const getViews = (url) => {
      if (!url) return 0;
      const v = views[url] ?? views[url.replace(/\/+$/, '')] ?? views[url + '/'];
      return Number.isFinite(Number(v)) ? Number(v) : 0;
    };

    return [...collection]
      .sort((a, b) => {
        const av = getViews(a && a.url);
        const bv = getViews(b && b.url);
        if (bv !== av) return bv - av;
        const ad = a && a.data && a.data.date ? new Date(a.data.date).getTime() : 0;
        const bd = b && b.data && b.data.date ? new Date(b.data.date).getTime() : 0;
        return bd - ad;
      })
      .slice(0, limit);
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

  eleventyConfig.addTransform("tableOfContents", function(content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    if (!content.includes('class="reading-progress"')) return content;

    const contentStart = content.indexOf('<div class="note-edit">');
    const contentEnd = content.indexOf('<section class="follow-cta"');
    if (contentStart === -1) return content;

    const endPos = contentEnd !== -1 ? contentEnd : content.length;
    const articleContent = content.slice(contentStart, endPos);

    const headingRegex = /<h([23])\b[^>]*(?:\s+id="([^"]*)")?[^>]*>(.*?)<\/h[23]>/gi;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(articleContent)) !== null) {
      const level = parseInt(match[1]);
      const text = match[3].replace(/<[^>]*>/g, "").trim();
      const id = match[2] || text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

      if (!match[2]) {
        const oldTag = match[0];
        const newTag = oldTag.replace(`<h${level}`, `<h${level} id="${id}"`);
        content = content.replace(oldTag, newTag);
      }

      headings.push({ level, id, text });
    }

    if (headings.length < 3) return content;

    let toc = `<nav class="toc" aria-label="Daftar Isi">\n`;
    toc += `<details open>\n<summary>📑 Daftar Isi</summary>\n<ol>\n`;

    let inSublist = false;
    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];
      const next = headings[i + 1];

      if (h.level === 2) {
        if (inSublist) {
          toc += `</ol></li>\n`;
          inSublist = false;
        }
        if (next && next.level === 3) {
          toc += `<li><a href="#${h.id}">${h.text}</a>\n<ol>\n`;
          inSublist = true;
        } else {
          toc += `<li><a href="#${h.id}">${h.text}</a></li>\n`;
        }
      } else if (h.level === 3) {
        toc += `<li><a href="#${h.id}">${h.text}</a></li>\n`;
      }
    }

    if (inSublist) {
      toc += `</ol></li>\n`;
    }

    toc += `</ol>\n</details>\n</nav>\n`;

    const seriRegex = /(<hr>\s*<p><strong>Seri\s.*?<\/strong><\/p>\s*<ol>[\s\S]*?<\/ol>\s*<hr>)/;
    const seriMatch = content.match(seriRegex);

    let seriBlock = "";
    if (seriMatch) {
      seriBlock = seriMatch[1];
      content = content.replace(seriBlock, "");
    }

    const markerRegex = /<div class="note-edit">\s*<\/div>/;
    const markerMatch = content.match(markerRegex);
    if (markerMatch) {
      content = content.replace(markerRegex, markerMatch[0] + "\n" + seriBlock + "\n" + toc);
    }

    return content;
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

  // --- Generate dynamic OG images for articles after build (prod only) ---
  eleventyConfig.on("eleventy.after", async ({ results }) => {
    if (isDev) return;
    const HIDDEN = new Set(["all", "nav", "post", "catatan"]);
    const outputDir = "dist";

    // Parse frontmatter from source files for articles that need OG images.
    // We use `results` which includes ALL rendered pages (even those excluded
    // from collections).
    const jobs = [];
    for (const result of results) {
      if (!result.inputPath || !result.inputPath.includes("src/catatan/")) continue;
      if (!result.inputPath.endsWith(".md")) continue;

      // Read frontmatter from the source file
      const srcPath = result.inputPath;
      let frontmatter = {};
      try {
        const { readFileSync } = await import("node:fs");
        const raw = readFileSync(srcPath, "utf-8");
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (fmMatch) {
          // Simple YAML-like parser for the fields we need
          const fmText = fmMatch[1];
          const titleMatch = fmText.match(/^title:\s*["']?(.+?)["']?\s*$/m);
          const descMatch = fmText.match(/^description:\s*["']?(.+?)["']?\s*$/m);
          const imageMatch = fmText.match(/^image:\s*["']?(.*?)["']?\s*$/m);
          const coverMatch = fmText.match(/^cover:\s*["']?(.*?)["']?\s*$/m);

          if (titleMatch) frontmatter.title = titleMatch[1];
          if (descMatch) frontmatter.description = descMatch[1];
          if (imageMatch) frontmatter.image = imageMatch[1];
          if (coverMatch) frontmatter.cover = coverMatch[1];

          // Parse tags
          const tagsSection = fmText.match(/^tags:\s*\n((?:\s+-\s+.+\n?)*)/m);
          if (tagsSection) {
            frontmatter.tags = [...tagsSection[1].matchAll(/^\s+-\s+(.+)$/gm)]
              .map((m) => m[1].trim());
          }
        }

        // Extract the markdown body (after frontmatter) for excerpt
        const bodyStart = raw.indexOf("---", raw.indexOf("---") + 3);
        if (bodyStart !== -1) {
          frontmatter._body = raw.slice(bodyStart + 3).trim();
        }
      } catch {
        // If we can't read the file, skip it
        continue;
      }

      // Skip articles that already have a custom image or cover
      if (frontmatter.image && frontmatter.image.length > 0) continue;
      if (frontmatter.cover && frontmatter.cover.length > 0) continue;

      const slug = path.basename(srcPath, path.extname(srcPath));

      // Build excerpt from markdown body (strip markdown syntax + HTML)
      const bodyText = (frontmatter._body || "")
        .replace(/<[^>]*>/g, " ")             // HTML tags first
        .replace(/!\[.*?\]\(.*?\)/g, "")      // images
        .replace(/\[([^\]]*)\]\(.*?\)/g, "$1") // links -> text
        .replace(/```[\s\S]*?```/g, " ")      // fenced code blocks
        .replace(/`[^`]+`/g, " ")             // inline code
        .replace(/^#{1,6}\s+/gm, "")          // heading markers
        .replace(/[*_~>]/g, "")               // markdown emphasis chars
        .replace(/\s+/g, " ")
        .trim();

      const excerpt = frontmatter.description || (bodyText.length > 200
        ? bodyText.slice(0, 200).replace(/\s+\S*$/, "") + "\u2026"
        : bodyText);

      const tags = Array.isArray(frontmatter.tags)
        ? frontmatter.tags.filter((t) => t && !HIDDEN.has(t))
        : [];

      const ogOutputPath = path.resolve(outputDir, "og", `${slug}.png`);

      // Skip if the OG image already exists (avoid re-generating on every rebuild)
      if (existsSync(ogOutputPath)) continue;

      jobs.push({
        title: frontmatter.title || slug,
        excerpt,
        tags,
        outputPath: ogOutputPath,
      });
    }

    if (jobs.length === 0) return;

    console.log(`[og-image] Generating ${jobs.length} OG images\u2026`);
    const start = Date.now();

    // Generate in parallel (batches of 8 to avoid memory pressure)
    const BATCH = 8;
    for (let i = 0; i < jobs.length; i += BATCH) {
      await Promise.all(
        jobs.slice(i, i + BATCH).map((job) => generateOgImage(job))
      );
    }

    console.log(`[og-image] Done in ${Date.now() - start}ms`);
  });

  return {
    dir: { input: "src", output: "dist" },
    dataTemplate: "njk",
    markdownTemplateEngine: "njk",
  };
}

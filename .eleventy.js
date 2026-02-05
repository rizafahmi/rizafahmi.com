const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.setServerOptions({
    port: 3000,
  });
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPlugin(require("./src/libs/shiki.js"), {});

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return getRelativeTimeString(dateObj);
  });

  eleventyConfig.addFilter("dateToISO", (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    if (!content) return "1 menit baca";
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes + " menit baca";
  });

  // Add catatan collection
  eleventyConfig.addCollection("catatan", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/catatan/*.md").filter(item => item.data.date);
  });

  // Pre-computed latest articles for performance (avoids O(N²) in templates)
  eleventyConfig.addCollection("latestCatatan", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/catatan/*.md")
      .filter(item => item.data.date)
      .sort((a, b) => b.data.date - a.data.date)
      .slice(0, 4);
  });

  return {
    dir: { input: "src", output: "dist" },
    dataTemplate: "njk",
    markdownTemplateEngine: "njk",
  };
};

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

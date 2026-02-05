export default function(eleventyConfig, options) {
  eleventyConfig.amendLibrary("md", () => {});

  eleventyConfig.on("eleventy.before", async () => {
    const shiki = await import("shiki");

    const highlighter = await shiki.createHighlighter({
      themes: ["light-plus", "dark-plus"],
      langs: [
        "shell",
        "html",
        "yaml",
        "sql",
        "xml",
        "javascript",
        "jsx",
        "json",
        "diff",
        "elixir",
        "typescript",
      ],
    });

    eleventyConfig.amendLibrary("md", (mdLib) =>
      mdLib.set({
        highlight: (code, lang) => {
          return highlighter.codeToHtml(code, {
            lang: lang,
            theme: "dark-plus",
          });
        },
      }),
    );
  });
}

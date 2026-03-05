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
        "markdown",
      ],
    });

    const shellLangs = ["shell", "bash", "sh"];

    eleventyConfig.amendLibrary("md", (mdLib) =>
      mdLib.set({
        highlight: (code, lang) => {
          const html = highlighter.codeToHtml(code, {
            lang: lang,
            theme: "dark-plus",
            transformers: shellLangs.includes(lang)
              ? [
                  (() => {
                    let continuation = false;
                    let inQuote = null;
                    return {
                      line(node, line) {
                        const isEmpty = node.children.every(
                          (child) =>
                            child.type === "text" && child.value.trim() === "" ||
                            child.type === "element" && child.children.every(
                              (c) => c.type === "text" && c.value.trim() === ""
                            )
                        );
                        if (isEmpty) return;

                        const textContent = node.children
                          .flatMap((child) =>
                            child.type === "text"
                              ? child.value
                              : (child.children || []).map((c) => c.value || "").join("")
                          )
                          .join("");

                        if (!continuation && !inQuote) {
                          const prefix = {
                            type: "element",
                            tagName: "span",
                            properties: { class: "line-prefix" },
                            children: [{ type: "text", value: "$ " }],
                          };
                          node.children.unshift(prefix);
                        }

                        continuation = textContent.trimEnd().endsWith("\\");

                        const unescaped = textContent.replace(/\\'/g, "").replace(/\\"/g, "");
                        for (const ch of unescaped) {
                          if (inQuote === ch) {
                            inQuote = null;
                          } else if (!inQuote && (ch === "'" || ch === '"')) {
                            inQuote = ch;
                          }
                        }
                      },
                    };
                  })(),
                ]
              : [],
          });
          const btn = `<button class="code-copy" aria-label="Salin kode">Salin</button>`;
          return `<div class="code-block">${btn}${html}</div>`;
        },
      }),
    );
  });
}

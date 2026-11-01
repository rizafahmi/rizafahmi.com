import { metaDescriptionForPrompt, PROMPT_CATEGORIES } from "../libs/prompts.js";

const CATEGORY_MAP = new Map(PROMPT_CATEGORIES.map((cat) => [cat.id, cat]));

export default {
  layout: "prompt",
  pageCss: "prompts.css",
  eleventyExcludeFromCollections: false,
  eleventyComputed: {
    permalink: (data) => (data.draft ? false : `/prompts/${data.slug || data.page.fileSlug}/`),
    description: (data) =>
      metaDescriptionForPrompt({
        title: data.title,
        description: data.description,
      }),
    categoryLabel: (data) => CATEGORY_MAP.get(data.category)?.label || data.category || "Prompt",
    categoryShortLabel: (data) =>
      CATEGORY_MAP.get(data.category)?.shortLabel || data.category || "Prompt",
  },
};

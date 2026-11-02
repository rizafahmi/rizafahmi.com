import {
  extractPromptVariables,
  metaDescriptionForPrompt,
  PROMPT_CATEGORIES,
} from "../libs/prompts.js";

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
    promptVariables: (data) =>
      extractPromptVariables(data.prompt, data.variables, data.slug || data.page.fileSlug),
    skillUrl: (data) => `/skills/${data.slug || data.page.fileSlug}/SKILL.md`,
    installCommand: (data) => {
      const s = data.slug || data.page.fileSlug;
      return `mkdir -p .agents/skills/${s} && curl -fsSL https://rizafahmi.com/skills/${s}/SKILL.md -o .agents/skills/${s}/SKILL.md`;
    },
  },
};

/**
 * Helpers for curated open source projects (showcase, CV, and LLM indexes).
 *
 * The content itself is hand-curated in src/_data/karya.js — this module only
 * cleans the entries up. No fetching and no inferring: whatever the data file
 * says, in the order it says.
 */

function cleanText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanUrl(value) {
  const text = cleanText(value);
  if (!text) return null;
  return /^https?:\/\//i.test(text) ? text : null;
}

function cleanInternalPath(value) {
  const text = cleanText(value);
  if (!text) return null;
  return text.startsWith("/") && !text.startsWith("//") ? text : null;
}

export function normalizeProject(raw) {
  const project = {
    name: cleanText(raw?.name) ?? "",
    description: cleanText(raw?.description),
    repo: cleanUrl(raw?.repo),
    url: cleanUrl(raw?.url),
    tags: (Array.isArray(raw?.tags) ? raw.tags : []).map(cleanText).filter(Boolean),
  };

  const quickstart = cleanText(raw?.quickstart);
  const proof = cleanText(raw?.proof);
  const relatedArticle = cleanInternalPath(raw?.relatedArticle);
  const relatedArticleTitle = cleanText(raw?.relatedArticleTitle);
  const relatedPrompt = cleanInternalPath(raw?.relatedPrompt);
  const relatedPromptTitle = cleanText(raw?.relatedPromptTitle);

  if (quickstart) project.quickstart = quickstart;
  if (proof) project.proof = proof;
  if (relatedArticle) project.relatedArticle = relatedArticle;
  if (relatedArticleTitle) project.relatedArticleTitle = relatedArticleTitle;
  if (relatedPrompt) project.relatedPrompt = relatedPrompt;
  if (relatedPromptTitle) project.relatedPromptTitle = relatedPromptTitle;

  return project;
}

export function selectProjects(rawProjects) {
  if (!Array.isArray(rawProjects)) return [];
  return rawProjects.map(normalizeProject).filter((project) => project.name.length > 0);
}

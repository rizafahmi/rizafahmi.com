/**
 * Helpers for curated open source projects (showcase cards and LLM indexes).
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

export function normalizeProject(raw) {
  return {
    name: cleanText(raw?.name) ?? "",
    description: cleanText(raw?.description),
    repo: cleanUrl(raw?.repo),
    url: cleanUrl(raw?.url),
    tags: (Array.isArray(raw?.tags) ? raw.tags : []).map(cleanText).filter(Boolean),
  };
}

export function selectProjects(rawProjects) {
  if (!Array.isArray(rawProjects)) return [];
  return rawProjects.map(normalizeProject).filter((project) => project.name.length > 0);
}

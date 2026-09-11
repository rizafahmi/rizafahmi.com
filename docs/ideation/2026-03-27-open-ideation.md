---
date: 2026-03-27
topic: open-ideation
focus: Reader Experience & Discovery (quick wins, new capabilities)
---

# Ideation: Reader Experience & Discovery Improvements

## Codebase Context

**Project Shape:**

- 11ty/Eleventy 3.x static site generator with Nunjucks templating and Markdown content
- Key directories: src/ (source), dist/ (output), assets/ (static), scripts/ (utilities)
- Main content: 52 blog posts in src/catatan/, templates in src/\_includes/, data in src/\_data/

**Notable Patterns:**

- 2-space indentation, JavaScript Standard Style, arrow functions, template literals
- kebab-case naming, Indonesian language for dates/time
- Frontmatter metadata, custom image processing (@11ty/eleventy-img)
- Shiki syntax highlighting, Pagefind search, GoatCounter analytics
- Auto-generated OG images, RSS/Atom feeds, SEO endpoints (robots.txt, sitemap.xml, llms.txt)

**Recent Improvements (Feb 2026):**

- Pagination, skip links, breadcrumbs, reading progress, lazy loading
- Enhanced focus styles, mobile touch targets, meta descriptions
- Optimized typewriter animation, Web Vitals tracking (prepared but not activated)

**Pain Points/Gaps:**

- Series navigation is manual (agentic-coding, asisten-ngoding, F8 trip)
- Search is functional but basic (no autocomplete, filters, keyboard shortcuts)
- Reading progress exists but not persisted across sessions
- Web Vitals tracking prepared but not activated
- No learning paths or structured content for education

**Leverage Points:**

- Pagefind already integrated - UI enhancement only
- Session storage already used for typewriter animation
- Multiple series exist with clear naming patterns
- Owner is educator (HACKTIV8 Co-Founder) - aligns with teaching mindset
- 52 articles provide rich content for structured learning paths

**Past Learnings:**

- docs/IMPROVEMENTS.md documents 10 completed improvements and prioritized roadmap
- High-priority recommendations: series navigation, Web Vitals activation, search improvements
- Site demonstrates sophisticated 11ty usage with advanced features

## Ranked Ideas

### 1. Enhanced Search with Autocomplete

**Description:** Add Cmd+K global shortcut, fuzzy matching, tag filters (e.g., `tag:elixir`), date filters (`after:2024`), and content previews to existing Pagefind search.

**Rationale:** Pagefind is already integrated - this is pure UI enhancement. Dramatically improves content discovery speed for technical readers. Cmd+K is a familiar pattern for developers (GitHub, VS Code, Linear). Leverages existing infrastructure without backend changes.

**Downsides:** Requires JavaScript for search modal (but minimal), may increase initial bundle size slightly.

**Confidence:** 90%
**Complexity:** Low
**Status:** Unexplored

---

### 2. Keyboard-Driven Navigation

**Description:** Implement global keyboard shortcuts for search (Cm d+K), series navigation (←/→), quick article access, and focus management throughout the site.

**Rationale:** Pure frontend enhancement with no backend changes. Power users expect keyboard-first navigation. Already have session storage for typewriter - can extend pattern. Reduces friction for technical audience familiar with keyboard shortcuts.

**Downsides:** Needs clear discoverability (help modal, visual hints), potential conflict with browser shortcuts.

**Confidence:** 85%
**Complexity:** Low
**Status:** Unexplored

---

### 3. Reading State Persistence

**Description:** Save reading progress (scroll position, completed articles) to localStorage and restore on return visits. Show "continue reading" indicators on homepage.

**Rationale:** Technical articles are long reference materials. Persistence reduces friction for returning readers. Already use sessionStorage for typewriter animation - same pattern. Improves user experience for readers who reference articles multiple times.

**Downsides:** Privacy considerations (local storage is fine), need graceful degradation if storage unavailable.

**Confidence:** 88%
**Complexity:** Low
**Status:** Unexplored

---

### 4. Series Navigation Automation

**Description:** Auto-detect series from file naming patterns (e.g., `asisten-ngoding-*.md`) and generate prev/next navigation with visual progress indicators.

**Rationale:** Multiple series exist (agentic-coding, asisten-ngoding, F8 trip). Pattern detection is simple transform in `eleventy.config.js`. Eliminates manual maintenance and prevents broken links. Builds on existing manual series blocks.

**Downsides:** Requires consistent naming conventions, may need manual override for edge cases.

**Confidence:** 82%
**Complexity:** Low
**Status:** Unexplored

---

### 5. Learning Path Pages

**Description:** Create curated learning journeys (e.g., "Elixir Journey", "AI Development Path") that guide readers through existing articles in logical sequences with progress tracking.

**Rationale:** Leverages 52 existing articles into structured curriculum. Owner is educator (HACKTIV8 Co-Founder) - aligns with teaching mindset. New capability that transforms scattered content into actionable learning experiences. Increases time-on-site and reader satisfaction.

**Downsides:** Requires manual curation of paths, ongoing maintenance as new articles added.

**Confidence:** 75%
**Complexity:** Medium
**Status:** Unexplored

---

### 6. Web Vitals Dashboard

**Description:** Build a readable performance dashboard over the Core Web Vitals already reported to GoatCounter (`src/_includes/webvitals.njk` + vendored `assets/web-vitals.js`, events under `web-vitals/<name>`).

**Rationale:** RUM is live (standard web-vitals build; name + value only). A dashboard would make those GoatCounter events actionable instead of only queryable in the analytics UI. Tracking itself is no longer the open work — see `webvitals.njk`.

**Downsides:** Dashboard adds maintenance overhead; GoatCounter's own UI may already be enough.

**Confidence:** 80%
**Complexity:** Low
**Status:** Tracking done; dashboard unexplored

---

## Rejection Summary

| #   | Idea                                 | Reason Rejected                                        |
| :-- | :----------------------------------- | :----------------------------------------------------- |
| 1   | Content Draft Management System      | Focus is content creation, not reader experience       |
| 2   | Smart Content Creation CLI           | Focus is content creation, not reader experience       |
| 3   | Automated Content Quality Checks     | Focus is content creation, not reader experience       |
| 4   | Advanced Code Block Features         | Medium complexity, less impact than navigation/search  |
| 5   | JSON Feed API                        | Developer-focused, less broad reader impact            |
| 6   | Automated Image Optimization         | Technical enhancement, already has WebP support        |
| 7   | Popular Content Dashboard            | Medium complexity, analytics already shown on homepage |
| 8   | Living Articles with Version History | Medium complexity, maintenance overhead                |
| 9   | Content Cross-Reference Suggestions  | Related articles already exist, diminishing returns    |
| 10  | Comment-Driven Content Ideas         | Low immediate reader impact                            |
| 11  | Concept Graph Explorer               | High complexity, experimental                          |
| 12  | Multi-Modal Content Remixing         | High complexity, maintenance overhead                  |
| 13  | Time-Travel Reading Experience       | High complexity, niche use case                        |
| 14  | Intent-Based Homepage Variants       | Medium complexity, homepage already well-structured    |

## Session Log

- 2026-03-27: Initial ideation — 40 ideas generated from 6 perspectives, 6 survived after adversarial filtering
- 2026-03-27: Prioritized Reader Experience & Discovery with quick wins and new capabilities

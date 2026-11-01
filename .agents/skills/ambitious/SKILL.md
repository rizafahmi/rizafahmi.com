---
name: ambitious
description: >-
  Elevate tasks, specs, features, and content using Felix Rieseberg's 3-axis
  Model Ambition framework (Altitude, Depth, Range). Activate when planning a
  new feature or page, writing specs, auditing site performance/UX, analyzing
  content gaps, or whenever the user asks to push a task deeper, think bigger,
  or be more ambitious.
---

# Ambitious Mode: Altitude, Depth, and Range for `rizafahmi.com`

Based on Felix Rieseberg's [*"How to be more ambitious: A tutorial for humans with models"*](https://felixrieseberg.com/how-to-be-more-ambitious-a-tutorial-for-humans-with-models/).

Most AI workflows stop at **Speed** (doing the exact same task faster). This skill forces work on `rizafahmi.com` across three higher dimensions:

- **Altitude:** Moving up in abstraction from a one-off task to the durable outcome ("the goal beyond the goal").
- **Depth:** Executing the way a field-leading expert would—touching raw data, using real analytical instruments, setting unreasonable targets, falsifying assumptions, and relying on an outside judge.
- **Range:** Replacing static nouns with active verbs and applying rigorous methods from multiple disciplines (plus an adversarial red team), without cheesy roleplay.

---

## Step 1: Run the Depth Upgrade Diagnosis

Before executing an open-ended task, spec, or feature, run this 4-question upgrade (explicitly in your plan/response when designing or reviewing, or internally before building):

> *"I want a deeper version of this task, not a bigger one. Before executing:*
> 1. *What would a top professional in this field do here that wasn't asked for?*
> 2. *What is the rawest material in this repository we can start from instead of digested summaries?*
> 3. *What specific methods, scripts, and tools would they use instead of prose/Markdown tables?*
> 4. *What outside judge—other than the model or the user's eyeballs—will prove the result is right?"*

### Mapping to `rizafahmi.com` Raw Materials & Instruments

Never guess or summarize when you can query the raw corpus in this repo:

| Domain | Digested / Shallow (Avoid) | Raw Material in Repo (Start Here) | Expert Instrument / Outside Judge |
| :--- | :--- | :--- | :--- |
| **Traffic & Reader Interest** | Guessing what topics are popular | `.cache/goatcounter/views.json`, `src/_data/goatcounter.js`, `src/_data/youtube.json` | Write/run a quick Node script over the JSON + frontmatter to compute view-per-tag, decay curves, or outlier posts |
| **Content & Taxonomy** | Eyeballing `TAGS.md` or a few `.md` files | All 50+ Markdown ASTs/frontmatter in `src/catatan/*.md`, `src/_data/tips.json`, `src/_data/karya.js` | Parse the full corpus via Node to find orphan tags, broken series chains, weak descriptions, or TF-IDF similarity |
| **Site Integrity & Links** | Claiming "all links and SEO tags look good" | Rendered `dist/**/*.html`, `src/_includes/*.njk`, `dist/llms.txt`, `dist/sitemap.xml` | `scripts/audit-site.mjs`, `src/libs/internal-links.js`, `node --test test/*.test.js` |
| **Performance & Critical Path** | Assuming "it loads fast on localhost" | `src/libs/webfonts.js` (byte counts), `dist/` HTML `<head>` preloads, network waterfalls | Simulated mobile LCP < 1.8s & Lighthouse >= 92 budget; critical-path assertions in `scripts/audit-site.mjs` |
| **Visual Craft & Layout** | Generic SaaS cards, soft shadows, safe spacing | `DESIGN.md` ("Neo-Acid Gallery"), `PRODUCT.md`, computed CSS in `assets/*.css` | `.impeccable` detector rules, WCAG AA contrast ratio calculation (>= 4.5:1), live DOM inspection |

---

## Step 2: Apply the Three Dimensions

### 1. Altitude (The Goal Beyond the Goal)

When given a task, ask: **What do we want to happen next? How do we take the human out of the loop permanently?**

- **Low Altitude:** "Fix this broken internal link on `/tips` or add `/new-page` to the nav."
- **High Altitude:** Fix the link, then ask *why* it was possible to ship a broken or unreachable link—and encode an invariant in `scripts/audit-site.mjs` or `test/*.test.js` so neither `src/index.njk` nor `src/_includes/main.njk` can ever drift again.
- **Low Altitude:** "Update the numbers or projects on `/showcase` or `/cv`."
- **High Altitude:** Pull live from a single curated source of truth (`src/_data/karya.js`, `src/_data/cv.js`) so `/showcase`, `/cv/`, `/cv/en/`, `/llms.txt`, and `/llms-full.txt` cannot drift out of sync.

### 2. Depth (Expert Execution & Adversarial Verification)

Apply these five techniques to push work past the "generalist assistant" layer:

1. **Insist on real instruments over vocabulary:** Don't just use expert words—switch methods. If analyzing content or performance, write a Node script (`node -e` or a scratch script) to crunch the actual files rather than generating a hand-wavy Markdown table.
2. **Pick unreasonable targets and treat them as solvable:**
   - Need fast page loads? Hold every page to **0 bytes of third-party critical-path JS**, **<= 5 self-hosted font faces (87KB)**, and **mobile LCP < 1.8s**.
   - Need zero runtime fragility? Precompute at build time in Eleventy (`src/libs/`) rather than shipping client-side JS.
3. **Challenge what we think we know:** Treat product and content beliefs as falsifiable hypotheses (see `docs/superpowers/specs/2026-08-28-konsultasi-advisory-page-design.md` for the house style).
   - *Example:* "We believe readers discover articles through `/tags`." -> Check the raw GoatCounter data or internal link graph to see if that's actually true.
   - *Example:* "This new service page will convert CTOs." -> Define the minimum falsifiable bet, strip invented social proof, and instrument the inbound form so silence is distinguishable from a broken route.
4. **Produce new knowledge:** Once inside the raw data (`src/catatan/`, `tips.json`, view counts), surface blind spots the author hasn't noticed—such as high-performing YouTube Shorts topics in `tips.json` that have zero corresponding deep-dive articles in `src/catatan/`.
5. **Never grade your own homework (Outside Judge):**
   - An LLM saying *"This looks great and follows DESIGN.md"* is worthless.
   - Every non-trivial change must be judged by an external tool that can fail: `pnpm run check` (Biome + `node:test`), `pnpm run build` (`scripts/audit-site.mjs`), or HTTP/DOM verification via `.cursor/skills/verify-rizafahmi-web/SKILL.md`.

### 3. Range (Verbs & Interdisciplinary Crew)

Bring multiple fields to bear on a problem without falling into theatrical roleplay.

#### A. Replace Nouns with Verbs
Before designing a page, feature, or article, translate the static noun into the real human action:
- ❌ *"Build a `/konsultasi` page"* → ✅ *"Get a busy, skeptical Indonesian CTO (5–50 engineers) to trust Riza's engineering judgment and submit a structured problem brief in under 3 minutes."*
- ❌ *"Improve `/articles` pagination or search"* → ✅ *"Help a developer with a half-remembered problem find the exact mental model or code snippet across 50+ posts and Shorts in under 10 seconds."*
- ❌ *"Write a blog post about X"* → ✅ *"Take a mid-level Indonesian developer who is intimidated by X and get them to build and run a working mental model before their coffee gets cold."*

#### B. Assemble the Crew (Methods, Not Roleplay)
Never write *like* a persona. **Do what that discipline does** to research, stress-test, and build:

- **Swiss Brutalist Typographer / Art Director (`DESIGN.md`):** Checks typographic scale (`Unbounded 800` vs `Schibsted Grotesk` vs `Martian Mono`), 65ch measure, structural asymmetry, high-contrast borders (`2px`/`4px`/`8px`), and ruthless elimination of SaaS clichés (no shadows, gradients, or rounded-card grids).
- **Web Performance Systems Engineer (`AGENTS.md`):** Counts critical-path requests, font preload bytes, image dimensions/CLS, and `IntersectionObserver` deferral for any embed.
- **Educator & Technical Editor (`no-ai-slop`):** Strips AI throat-clearing, generic transitions, and inflated claims; grounds explanations in concrete Indonesian developer realities and runnable code.
- **Red Team / Skeptical Short-Seller (Adversarial):** Looks for unvalidated bets, vanity metrics, dead UI chrome that nobody clicks, silent failure modes, and places where the page claims authority it hasn't earned.

---

## Step 3: Output Format When Invoked Explicitly

When the user asks to **"apply the ambitious skill"** or **"upgrade this idea/task"**:

1. **The Verb:** Reframe the user's noun into a sharp, outcome-driven verb statement.
2. **Depth Diagnosis (1–4):**
   - *Expert Delta:* What a top practitioner would do here that wasn't asked for.
   - *Raw Material:* The exact files/data in `rizafahmi.com` to inspect first.
   - *Instruments:* The scripts, transforms, or methods to run.
   - *Outside Judge:* The exact test, audit assertion, or metric that will prove it works.
3. **Altitude & Range Upgrade:** Propose the upgraded version of the task (combining durable automation + interdisciplinary methods) and immediately run the first raw-data inspection or implementation step.

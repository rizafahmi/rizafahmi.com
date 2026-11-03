# Article Reading

Reading individual blog articles with full rendered content, frontmatter metadata, reading time, table of contents (TOC), related articles, and navigation to adjacent articles. This is the core content consumption experience.

## Sub-features

- Full article content rendered from Markdown with syntax highlighting
- Article metadata: title, date, reading time, view count (if available)
- Table of contents (TOC) auto-generated from H2/H3 headings (if 3+ headings)
- Series navigation (if article is part of a series)
- Related articles suggestions (based on tags and content similarity)
- Navigation to newer/older articles
- Article is searchable (has `data-pagefind-body` attribute)
- Reading progress indicator (`.reading-progress` class)
- Comments section (utterances integration, gated by IntersectionObserver)
- Social share/edit links

## How to get to it (user POV)

**From homepage**: Click any article title in "CATATAN TERBARU" or "CATATAN POPULER" sections

**From article listing**: Navigate to `/articles/` and click any article title

**Direct URL**: `/catatan/<slug>/` where `<slug>` is the article filename without extension

**Example articles**:
- `/catatan/asisten-ngoding/` - "Produktif dengan Asisten Ngoding"
- `/catatan/bahasa-fungsional-elixir/` - "Berkenalan dengan Bahasa Pemrograman Elixir"
- `/catatan/agentic-coding/` - About agentic coding workflows

## Driving it with curl + grep

**Preconditions**:
- Dev server running on port 3000
- At least one article exists in `src/catatan/*.md` with `layout: tulisan` and valid `date`

### Step 1: Choose an article and verify it responds 200

```bash
ARTICLE_SLUG="asisten-ngoding"
ARTICLE_URL="http://localhost:3000/catatan/$ARTICLE_SLUG/"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ARTICLE_URL")
[ "$STATUS" = "200" ] && echo "✓ Article responds 200" || echo "✗ Article returned $STATUS (might be 404)"
```

**Expected result**: `✓ Article responds 200`

### Step 2: Capture article HTML

```bash
mkdir -p /tmp/verify-rizafahmi-web/article-reading
curl -s "$ARTICLE_URL" > /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html
echo "✓ Saved to /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html"
```

**Expected result**: File created successfully

### Step 3: Verify article structure with `<article>` tag

```bash
grep -q '<article' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ <article> tag present" || echo "✗ <article> tag missing"
```

**Expected result**: `✓ <article> tag present`

### Step 4: Verify article is searchable (Pagefind attribute)

```bash
grep -q 'data-pagefind-body' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Article marked as searchable" || echo "✗ Not searchable"
```

**Expected result**: `✓ Article marked as searchable`

### Step 5: Verify article title in H1

```bash
# The title should be in an H1 tag
grep -q '<h1>.*Produktif dengan Asisten Ngoding.*</h1>' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Article H1 title present" || echo "✗ H1 title missing or wrong"
```

**Expected result**: `✓ Article H1 title present`

### Step 6: Verify article metadata (date, reading time)

```bash
grep -q '🌱 Dibuat' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Created date present" || echo "✗ Created date missing"
grep -q 'menit baca' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Reading time present" || echo "✗ Reading time missing"
```

**Expected result**:
```
✓ Created date present
✓ Reading time present
```

### Step 7: Verify reading progress indicator

```bash
grep -q 'class="reading-progress"' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Reading progress bar present" || echo "✗ Progress bar missing"
```

**Expected result**: `✓ Reading progress bar present`

### Step 8: Verify table of contents (TOC) exists if article has 3+ headings

```bash
# TOC is in a <nav class="toc"> element
grep -q '<nav class="toc"' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Table of contents present" || echo "⚠ TOC not present (article might have < 3 headings)"
```

**Expected result**: `✓ Table of contents present` (or `⚠` if article is short)

### Step 9: Check for series navigation (if article is part of a series)

```bash
# Series navigation shows as "Seri <series-name>" with ordered list
grep -q '<p><strong>Seri' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Series navigation present" || echo "⚠ Not part of a series"
```

**Expected result**: `✓ Series navigation present` (for "Asisten Ngoding" article, which is series_index 1)

### Step 10: Verify related articles section

```bash
grep -q 'class="related-articles"' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Related articles section present" || echo "✗ Related articles missing"
```

**Expected result**: `✓ Related articles section present`

### Step 11: Verify navigation to newer/older articles

```bash
grep -q 'class="article-next"' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Article navigation present" || echo "⚠ Article navigation missing (might be newest/oldest)"
```

**Expected result**: `✓ Article navigation present` (or `⚠` if it's the first or last article)

### Step 12: Verify syntax highlighting (code blocks)

```bash
# Shiki generates <pre class="shiki"> for code blocks
grep -q 'class="shiki' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Syntax highlighting present" || echo "⚠ No code blocks in this article"
```

**Expected result**: `✓ Syntax highlighting present` (or `⚠` if article has no code blocks)

### Step 13: Verify article tags are listed

```bash
grep -q 'class="note-tags"' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Article tags section present" || echo "✗ Tags missing"
# Check specific tags for this article: ai, agentic-coding, workflow
grep -q 'href="/tags/ai/"' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Tag: ai" || echo "✗ Tag ai missing"
```

**Expected result**: `✓ Article tags section present` and specific tags found

### Step 14: Verify back link to articles listing

```bash
grep -q 'href="/articles/"' /tmp/verify-rizafahmi-web/article-reading/$ARTICLE_SLUG.html && echo "✓ Back link to /articles/ present" || echo "✗ Back link missing"
```

**Expected result**: `✓ Back link to /articles/ present`

## Gotchas

**Date icons differ from listing page**: Article detail pages use 🌱 (seedling) for created date and 🪴 (potted plant) for updated date, while the article listing page uses 📅 (calendar). This is intentional design differentiation.

**Table of Contents (TOC)**: Only generated if the article has 3 or more H2/H3 headings. Short articles or those with only one section won't show a TOC. This is by design, not a bug.

**Series navigation**: Only appears if the article frontmatter includes `series` and `series_index` fields. Most articles are not part of a series.

**View count**: The "🔥 X DIBACA" count only shows if GoatCounter data is available for that article's URL. Without the API configured, view counts are hidden.

**Related articles**: Uses a combination of shared tags, content similarity (TF-IDF), and recency. If the site has very few articles, the related list might be short or empty.

**Article navigation (newer/older)**: Articles are sorted by `date` descending. The newest article won't have a "newer" link, the oldest won't have an "older" link.

**Comments (utterances)**: The comments section uses `IntersectionObserver` to lazy-load the utterances widget. It won't appear in the HTML until after the user scrolls near it. Curl verification can only check for the container element, not the loaded iframe.

**Syntax highlighting**: Uses Shiki with Monokai theme. Code blocks in the markdown (triple backticks) are transformed into `<pre class="shiki">` elements with inline styles. No code blocks = no `.shiki` class.

**Images**: In dev mode, images are not optimized. The shortcode returns plain `<img>` tags. In production, they're wrapped in `<picture>` elements with WebP sources.

**Layout template**: Articles use `layout: tulisan` (defined in `src/_includes/tulisan.njk`). If an article has a different layout or no layout, it won't render with this structure.

**Lazy media transforms**: The site applies lazy loading to images, iframes, and videos during build. The first image on the page is not lazy-loaded (LCP optimization). Subsequent images get `loading="lazy"`.

**Indonesian dates**: Date formatting uses Indonesian locale ("hari yang lalu" for relative time, "DD Month YYYY" for absolute dates).

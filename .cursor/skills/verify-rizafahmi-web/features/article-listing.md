# Article Listing

Browsing all published articles in a paginated list (`/articles/`). Shows article title, excerpt, metadata (date, reading time, view count), and tags. Users can scan all content chronologically or filter by tag.

## Sub-features

- List of all published articles, newest first
- Article metadata per item: date, reading time, view count (if available)
- Article excerpt or description
- Up to 4 visible tags per article
- RSS/Atom feed links (excerpt and full-content feeds)
- Back link to homepage
- Articles are filterable via tags (click a tag to go to `/tags/<tag>/`)

## How to get to it (user POV)

**From homepage**: Click "Semua catatan →" link in either articles section

**From any article page**: Click "< KEMBALI KE ARTIKEL" or navigate to `/articles/`

**Direct URL**: `/articles/`

**From navigation**: Main nav has no direct link; users discover via homepage CTAs

## Driving it with curl + grep

**Preconditions**:
- Dev server running on port 3000
- At least one article published in `src/catatan/` with `layout: tulisan` and `date`

### Step 1: Verify article listing page responds 200

```bash
LISTING_URL="http://localhost:3000/articles/"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$LISTING_URL")
[ "$STATUS" = "200" ] && echo "✓ /articles/ responds 200" || echo "✗ /articles/ returned $STATUS"
```

**Expected result**: `✓ /articles/ responds 200`

### Step 2: Capture listing page HTML

```bash
mkdir -p /tmp/verify-rizafahmi-web/article-listing
curl -s "$LISTING_URL" > /tmp/verify-rizafahmi-web/article-listing/index.html
echo "✓ Saved to /tmp/verify-rizafahmi-web/article-listing/index.html"
```

**Expected result**: File created successfully

### Step 3: Verify page heading

```bash
grep -q '<h2>CATATAN</h2>' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Page heading present" || echo "✗ Heading missing"
```

**Expected result**: `✓ Page heading present`

### Step 4: Verify RSS/Atom feed links

```bash
grep -q 'href="/feed.xml"' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ RSS feed link present" || echo "✗ RSS link missing"
grep -q 'href="/feed/full.xml"' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Full feed link present" || echo "✗ Full feed link missing"
```

**Expected result**:
```
✓ RSS feed link present
✓ Full feed link present
```

### Step 5: Verify intro text mentions topics

```bash
grep -q 'Arsip tulisan' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Intro text present" || echo "✗ Intro text missing"
grep -q 'href="/topik/"' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Link to topics page" || echo "✗ Topics link missing"
```

**Expected result**:
```
✓ Intro text present
✓ Link to topics page
```

### Step 6: Count article items (should match number of published articles)

```bash
ARTICLE_COUNT=$(grep -c '<article class="article">' /tmp/verify-rizafahmi-web/article-listing/index.html)
echo "Found $ARTICLE_COUNT article items"
[ "$ARTICLE_COUNT" -ge 1 ] && echo "✓ At least 1 article listed" || echo "✗ No articles found"
```

**Expected result**: `✓ At least 1 article listed` (actual count should match published articles in `src/catatan/`)

### Step 7: Verify article metadata is present (date, reading time)

```bash
# Check for date icon and reading time in first article
grep -m1 '📅' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Date icon present in articles" || echo "✗ Date missing"
grep -m1 '⏱️' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Reading time icon present" || echo "✗ Reading time missing"
grep -m1 'menit baca' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Reading time text present" || echo "✗ Reading time text missing"
```

**Expected result**:
```
✓ Date icon present in articles
✓ Reading time icon present
✓ Reading time text present
```

### Step 8: Verify view count shows (if GoatCounter data available)

```bash
# This is optional - only shows if goatcounterViews data exists
grep -q '🔥.*DIBACA' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ View counts present" || echo "⚠ View counts not shown (GoatCounter data unavailable)"
```

**Expected result**: `✓` if configured, `⚠` if not (both are valid)

### Step 9: Verify article titles are links to full articles

```bash
# Pick a known article slug and check it's linked
SAMPLE_SLUG="asisten-ngoding"
grep -q "href=\"/catatan/$SAMPLE_SLUG/\"" /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Article link found: $SAMPLE_SLUG" || echo "⚠ Sample article not in listing"
```

**Expected result**: `✓` if that article exists

### Step 10: Verify article excerpts are shown

```bash
# Check for the excerpt paragraph
grep -q '<p class="article-excerpt">' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Article excerpts present" || echo "✗ Excerpts missing"
```

**Expected result**: `✓ Article excerpts present`

### Step 11: Verify article tags section

```bash
grep -q 'class="article-topics"' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Article tags section present" || echo "✗ Tags section missing"
# Check that tags are linked to tag pages
grep -q 'href="/tags/[^"]*/"' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Tag links present" || echo "✗ Tag links missing"
```

**Expected result**:
```
✓ Article tags section present
✓ Tag links present
```

### Step 12: Verify back link to homepage

```bash
grep -q 'href="/".*KEMBALI KE BERANDA' /tmp/verify-rizafahmi-web/article-listing/index.html && echo "✓ Back to homepage link present" || echo "✗ Back link missing"
```

**Expected result**: `✓ Back to homepage link present`

### Step 13: Verify articles are sorted newest first

```bash
# Extract first two article dates and check order (this is a simplified check)
# Full verification would require parsing all dates and comparing
echo "Manual check: Scroll through /tmp/verify-rizafahmi-web/article-listing/index.html and confirm dates descend"
grep -o '📅 [0-9-]*' /tmp/verify-rizafahmi-web/article-listing/index.html | head -5
```

**Expected result**: Dates should be in descending order (most recent first)

## Gotchas

**No pagination**: The current implementation shows all articles on one page. If the site grows to hundreds of articles, this could become a performance issue. The template (`src/articles.njk`) uses `{% for article in collections.catatan | reverse %}` which processes all articles at once.

**Tag limit**: Each article shows a maximum of 4 tags (via `| head(4)` filter). If an article has more tags, the rest are hidden from the listing. Full tags are visible on the article detail page.

**View counts**: Only show if `goatcounterViews` global data is populated. This requires `GOATCOUNTER_SITE` and `GOATCOUNTER_API_TOKEN` environment variables, and the data is fetched at build time and cached. Without this, view counts are simply not rendered.

**Excerpt source**: The excerpt comes from either the article's `description` frontmatter field (preferred) or is auto-generated from the first 180 characters of the rendered content (via the `excerpt` filter). If an article has neither frontmatter description nor body content, the excerpt will be empty.

**Article order**: Sorted by `date` field in frontmatter, descending. Articles without a `date` or with `date` in the future won't appear in the listing (Eleventy filters them out via `.filter((item) => item.data.date)`).

**Hidden tags**: Tags like "all", "nav", "post", and "catatan" are filtered out and never shown in the UI. These are internal collection tags used by Eleventy.

**RSS pill**: The "🔔 FEED: RSS / FULL" pill is a visual element with links to `/feed.xml` (excerpt feed) and `/feed/full.xml` (full-content feed). These feeds are generated by Eleventy at build time.

**Theme toggle**: The article listing page uses `layout: main`, which includes a theme toggle button in the header. This is consistent with other content pages but not the homepage (which has its own layout).

**Layout template**: Uses `src/_includes/main.njk` which provides the standard page chrome (header, back button, theme toggle). This is different from the homepage (`src/index.njk`) which is standalone.

**Mobile view**: The design is responsive. On mobile, the metadata (date, reading time, view count) wraps to multiple lines. Curl verification captures the HTML structure but not the CSS media query behavior.

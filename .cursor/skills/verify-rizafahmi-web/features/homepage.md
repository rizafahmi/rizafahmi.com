# Homepage

The landing page (`/`) that serves as the entry point to the site. Shows recent articles, popular articles, featured projects, highlights, and contact links. Users arrive here first and navigate to other sections.

## Sub-features

- Hero section with avatar, name, tagline, and main navigation links
- Latest 3 articles section (`#catatan`)
- Popular 3 articles section (based on GoatCounter views, or fallback static list)
- Featured projects section (`#karya`) - HACKTIV8 and Ngobrolin Web podcast
- Highlights section - external press/interview links
- Consultation CTA section (`#konsultasi`)
- Contact links section (`#kontak`) - social media, email, CV, etc.
- Theme toggle button (dark/light mode)
- Footer with AI assistance disclosure

## How to get to it (user POV)

**Direct access**: Navigate to `http://localhost:3000/` in browser or curl

**From other pages**: Click "BERANDA" link in navigation, or click logo/home link

**URL**: `/` (site root)

## Driving it with curl + grep

**Preconditions**:
- Dev server running on port 3000
- Dependencies installed (`node_modules/.bin/eleventy` exists)

### Step 1: Fetch homepage and verify it responds 200

```bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
[ "$STATUS" = "200" ] && echo "✓ Homepage responds 200" || echo "✗ Homepage returned $STATUS"
```

**Expected result**: `✓ Homepage responds 200`

### Step 2: Capture homepage HTML for inspection

```bash
mkdir -p /tmp/verify-rizafahmi-web/homepage
curl -s http://localhost:3000/ > /tmp/verify-rizafahmi-web/homepage/index.html
echo "✓ Saved to /tmp/verify-rizafahmi-web/homepage/index.html"
```

**Expected result**: File created, no curl errors

### Step 3: Verify hero section with H1 and tagline

```bash
grep -q '<h1>👋 Saya Riza!</h1>' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Hero H1 present" || echo "✗ Hero H1 missing"
grep -q 'Co-Founder.*HACKTIV8.*Content Creator' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Tagline present" || echo "✗ Tagline missing"
```

**Expected result**:
```
✓ Hero H1 present
✓ Tagline present
```

### Step 4: Verify navigation links in hero

```bash
grep -q 'href="#catatan"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Nav: Catatan link"
grep -q 'href="/topik/"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Nav: Mulai link"
grep -q 'href="/tags"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Nav: Topik link"
grep -q 'href="/tips/"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Nav: Tips link"
grep -q 'href="#karya"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Nav: Karya link"
grep -q 'href="/search"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Nav: Cari link"
```

**Expected result**: All 6 navigation links present

### Step 5: Verify latest articles section exists

```bash
grep -q 'id="catatan"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Articles section ID present" || echo "✗ Articles section missing"
grep -q '<h2>CATATAN TERBARU</h2>' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Latest articles heading" || echo "✗ Heading missing"
```

**Expected result**:
```
✓ Articles section ID present
✓ Latest articles heading
```

### Step 6: Count article items (should be at least 3 in each section)

```bash
ARTICLE_COUNT=$(grep -c 'class="catatan-item"' /tmp/verify-rizafahmi-web/homepage/index.html)
[ "$ARTICLE_COUNT" -ge 3 ] && echo "✓ At least 3 article items rendered ($ARTICLE_COUNT found)" || echo "✗ Only $ARTICLE_COUNT article items"
```

**Expected result**: `✓ At least 3 article items rendered (6 found)` (3 latest + 3 popular)

### Step 7: Verify popular articles section

```bash
grep -q '<h2>CATATAN POPULER</h2>' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Popular articles section" || echo "✗ Popular section missing"
```

**Expected result**: `✓ Popular articles section`

### Step 8: Verify projects section (Karya)

```bash
grep -q 'id="karya"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Projects section ID" || echo "✗ Projects section missing"
grep -q '<h2>KARYA UTAMA</h2>' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Projects heading" || echo "✗ Projects heading missing"
grep -q 'href="https://hacktiv8.com"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ HACKTIV8 link" || echo "✗ HACKTIV8 missing"
grep -q 'Ngobrolin Web' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Ngobrolin Web podcast" || echo "✗ Podcast missing"
```

**Expected result**: All 4 checks pass

### Step 9: Verify contact section

```bash
grep -q 'id="kontak"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Contact section ID" || echo "✗ Contact section missing"
grep -q '<h2>HUBUNGI SAYA</h2>' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Contact heading" || echo "✗ Contact heading missing"
grep -q 'href="https://youtube.com/rizafahmi"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ YouTube link" || echo "✗ YouTube missing"
grep -q 'href="https://github.com/rizafahmi"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ GitHub link" || echo "✗ GitHub missing"
grep -q 'href="mailto:rizafahmi@gmail.com"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Email link" || echo "✗ Email missing"
```

**Expected result**: All 5 checks pass

### Step 10: Verify theme toggle button exists

```bash
grep -q 'id="theme-toggle"' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Theme toggle button present" || echo "✗ Theme toggle missing"
```

**Expected result**: `✓ Theme toggle button present`

### Step 11: Verify footer with AI disclosure

```bash
grep -q 'Konten ditulis oleh manusia' /tmp/verify-rizafahmi-web/homepage/index.html && echo "✓ Footer AI disclosure" || echo "✗ Footer missing"
```

**Expected result**: `✓ Footer AI disclosure`

## Gotchas

**View counts**: The popular articles section shows view counts if `goatcounterViews` data is available. In dev mode without GoatCounter API configured, it falls back to a static list of 3 hardcoded popular articles. This is expected and not a failure.

**GoatCounter script**: The homepage loads `//gc.zgo.at/count.js` for analytics. This is async and doesn't block rendering, so you won't see it in the HTML until after page load. Not critical for verification.

**Theme toggle**: The button exists in HTML, but its behavior (toggling dark/light mode) requires JavaScript. To verify the JS works, you'd need browser automation (Puppeteer). For this curl-based verification, we only confirm the button HTML exists.

**Lazy images**: The dev server doesn't optimize images. In production, `<img>` tags might be wrapped in `<picture>` elements with WebP/AVIF sources. Dev mode keeps them as plain `<img>` tags.

**Homepage is standalone**: Unlike other pages which use `_includes/main.njk` layout, the homepage (`src/index.njk`) is a complete standalone HTML document. Changes to site-wide navigation must be made in both `main.njk` and `index.njk` to stay consistent.

**Article count**: If the site has fewer than 3 published articles, the count will be lower. Check `src/catatan/*.md` files with valid `date` and `layout: tulisan` frontmatter.

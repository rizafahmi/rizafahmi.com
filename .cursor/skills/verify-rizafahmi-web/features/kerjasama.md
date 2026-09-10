# Kerjasama (Partnership & Sponsorship)

Media kit and partnership page (`/kerjasama/`) showcasing YouTube channel statistics, audience metrics, and collaboration options for brands and sponsors.

## Sub-features

- YouTube channel statistics (subscribers, views, engagement)
- Audience demographics and reach metrics
- Content performance by format (Shorts, videos, podcasts)
- Historical track record section
- Contact information for partnership inquiries
- Page is searchable (`data-pagefind-body`)
- Back link to homepage

## How to get to it (user POV)

**From homepage**: Click "Kerjasama" in hero navigation

**Direct URL**: `/kerjasama/`

**From other pages**: Via main navigation on pages using `layout: main`

## Driving it with curl + grep

**Preconditions**:
- Dev server running on port 3000

### Step 1: Verify page responds 200

```bash
KERJASAMA_URL="http://localhost:3000/kerjasama/"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$KERJASAMA_URL")
[ "$STATUS" = "200" ] && echo "✓ Kerjasama page responds 200" || echo "✗ Page returned $STATUS"
```

**Expected result**: `✓ Kerjasama page responds 200`

### Step 2: Capture page HTML

```bash
mkdir -p /tmp/verify-rizafahmi-web/kerjasama
curl -s "$KERJASAMA_URL" > /tmp/verify-rizafahmi-web/kerjasama/index.html
echo "✓ Saved to /tmp/verify-rizafahmi-web/kerjasama/index.html"
```

**Expected result**: File created successfully

### Step 3: Verify main heading

```bash
grep -q '<h1>Kerjasama' /tmp/verify-rizafahmi-web/kerjasama/index.html && echo "✓ Main heading present" || echo "✗ Heading missing"
```

**Expected result**: `✓ Main heading present`

### Step 4: Verify page is searchable

```bash
grep -q 'data-pagefind-body' /tmp/verify-rizafahmi-web/kerjasama/index.html && echo "✓ Page is searchable" || echo "✗ Not searchable"
```

**Expected result**: `✓ Page is searchable`

### Step 5: Verify key sections

```bash
grep -q '<h2>Rekam jejak</h2>' /tmp/verify-rizafahmi-web/kerjasama/index.html && echo "✓ Track record section" || echo "✗ Section missing"
grep -q '<h2>Jangkauan</h2>' /tmp/verify-rizafahmi-web/kerjasama/index.html && echo "✓ Reach section" || echo "✗ Section missing"
grep -q '<h2>Momentum</h2>' /tmp/verify-rizafahmi-web/kerjasama/index.html && echo "✓ Momentum section" || echo "✗ Section missing"
grep -q '<h2>Performa per format</h2>' /tmp/verify-rizafahmi-web/kerjasama/index.html && echo "✓ Format performance section" || echo "✗ Section missing"
```

**Expected result**: All 4 sections present

### Step 6: Verify contact information exists

```bash
grep -q 'mailto:' /tmp/verify-rizafahmi-web/kerjasama/index.html && echo "✓ Email contact present" || echo "✗ No email found"
```

**Expected result**: `✓ Email contact present`

### Step 7: Verify back link to homepage

```bash
grep -q 'href="/"' /tmp/verify-rizafahmi-web/kerjasama/index.html && echo "✓ Homepage link present" || echo "✗ Link missing"
```

**Expected result**: `✓ Homepage link present`

## Gotchas

**Dynamic data**: The page pulls YouTube statistics from `youtube` global data (fetched at build time via YouTube API). Without API credentials, the page will show placeholder or cached data. This is not a bug - the page structure remains valid.

**Layout**: Uses `layout: main` consistent with other content pages. Custom styles via `kerjasama.css` (loaded through `pageCss` frontmatter).

**Shared template**: Uses `kerjasama_body.njk` macro imported as `{{ kerjasama }}` to render the main content. This separation allows reusability if needed.

**Build-time data**: YouTube stats are fetched during build, not on every page load. The page shows static data from the last build. To refresh stats, rebuild the site (or rely on cached data if API quota is exhausted).

**Formats mentioned**: The page specifically mentions performance metrics for Shorts, long-form videos, and podcast episodes - all formats present on the Eksperimen Pemrograman channel.

**Indonesian content**: All text is in Indonesian. No English translation currently exists.

**Alternative URL**: The page permalink is `/kerjasama/` but historically it may have been accessible via `/ratecard/`. Check for redirects if both URLs are expected to work.

**Searchability**: Has `data-pagefind-body` so users can find it via site search by searching "sponsor", "kerjasama", "partnership", etc.

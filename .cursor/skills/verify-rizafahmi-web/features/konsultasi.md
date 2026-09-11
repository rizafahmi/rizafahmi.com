# Konsultasi (Advisory Page)

Landing page for the agentic engineering consultation service (`/konsultasi/`). Describes the consultation offering for engineering leads and CTOs, presents three session types, explains qualifications, and includes a form submission call-to-action.

## Sub-features

- Main value proposition heading
- Three consultation session types (Arah, Pendapat kedua, Review cara kerja)
- "Kenapa saya" credibility section
- "Jujur dari awal" transparency section  
- "Bukan untuk siapa" disqualification criteria
- Brief submission form anchor (`#brief`)
- Back link to homepage
- Page is searchable (`data-pagefind-body`)

## How to get to it (user POV)

**From homepage**: Scroll to consultation section and click "Lihat detail konsultasi" button

**Direct URL**: `/konsultasi/`

**From other pages**: Navigation header on pages using `layout: main`

## Driving it with curl + grep

**Preconditions**:
- Dev server running on port 3000

### Step 1: Verify page responds 200

```bash
KONSULTASI_URL="http://localhost:3000/konsultasi/"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$KONSULTASI_URL")
[ "$STATUS" = "200" ] && echo "✓ Konsultasi page responds 200" || echo "✗ Page returned $STATUS"
```

**Expected result**: `✓ Konsultasi page responds 200`

### Step 2: Capture page HTML

```bash
mkdir -p /tmp/verify-rizafahmi-web/konsultasi
curl -s "$KONSULTASI_URL" > /tmp/verify-rizafahmi-web/konsultasi/index.html
echo "✓ Saved to /tmp/verify-rizafahmi-web/konsultasi/index.html"
```

**Expected result**: File created successfully

### Step 3: Verify main heading

```bash
grep -q '<h1>Profesi ini sedang berubah' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Main heading present" || echo "✗ Heading missing"
```

**Expected result**: `✓ Main heading present`

### Step 4: Verify page is searchable

```bash
grep -q 'data-pagefind-body' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Page is searchable" || echo "✗ Not searchable"
```

**Expected result**: `✓ Page is searchable`

### Step 5: Verify three session types

```bash
grep -q '<h3>Arah</h3>' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Session type: Arah" || echo "✗ Arah missing"
grep -q '<h3>Pendapat kedua</h3>' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Session type: Pendapat kedua" || echo "✗ Pendapat kedua missing"
grep -q '<h3>Review cara kerja</h3>' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Session type: Review cara kerja" || echo "✗ Review cara kerja missing"
```

**Expected result**: All 3 session types present

### Step 6: Verify key sections

```bash
grep -q '<h2>Kenapa saya</h2>' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Kenapa saya section" || echo "✗ Section missing"
grep -q '<h2>Jujur dari awal</h2>' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Jujur dari awal section" || echo "✗ Section missing"
grep -q '<h2>Bukan untuk siapa</h2>' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Bukan untuk siapa section" || echo "✗ Section missing"
```

**Expected result**: All 3 sections present

### Step 7: Verify brief form anchor

```bash
grep -q 'id="brief"' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Brief form anchor exists" || echo "✗ Anchor missing"
grep -q 'href="#brief"' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Link to brief form" || echo "✗ Link missing"
```

**Expected result**: Both checks pass

### Step 8: Verify back link to homepage

```bash
grep -q 'href="/"' /tmp/verify-rizafahmi-web/konsultasi/index.html && echo "✓ Homepage link present" || echo "✗ Link missing"
```

**Expected result**: `✓ Homepage link present`

## Gotchas

**Layout**: Uses `layout: main` which provides standard page chrome (breadcrumb navigation, theme toggle, back button). This is consistent with article listing and search pages.

**Form handling**: The brief submission form uses a form submission service (likely Formspree or similar). The form itself is embedded in the page, not a separate component. To verify form submission, you'd need browser automation - curl can only verify the form HTML exists.

**Page CSS**: Has custom stylesheet (`konsultasi.css`) for page-specific styles. This is loaded via `pageCss` frontmatter field.

**Indonesian content**: All content is in Indonesian, matching the site's primary language. No English version currently exists.

**Navigation placement**: The page is NOT in the hero navigation. It's linked from the consultation section on the homepage via a "Lihat detail konsultasi" button. The hero nav has "Kerjasama" which goes to the partnership page instead.

**Searchability**: Page has `data-pagefind-body` so it appears in site search results. Users can find it by searching for terms like "konsultasi", "engineering", "CTO", etc.

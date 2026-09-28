# Search

Searching articles via Pagefind-powered autocomplete interface. Users type a query, see live suggestions, and navigate to articles. The search page (`/search/`) loads Pagefind's browser API and provides a keyboard-navigable autocomplete dropdown.

## Sub-features

- Search input field with placeholder and aria labels
- Autocomplete panel with live suggestions as user types
- Keyboard navigation (↑/↓ arrows to select, Enter to navigate)
- Search status messages ("X saran" or "Tidak ditemukan hasil untuk \"{query}\"")
- Each suggestion shows title and highlighted excerpt
- Search index covers all articles with `data-pagefind-body` attribute
- Pagefind loads lazily (only when search page is visited)

## How to get to it (user POV)

**From homepage**: Click "Cari" in hero navigation

**From any page**: Click search icon/link in navigation (if present)

**Direct URL**: `/search/`

**Keyboard shortcut**: The site has keyboard shortcuts (`_includes/keyboard-shortcuts.njk`) - check if search has a shortcut bound

## Driving it with curl + grep

**Preconditions**:
- Dev server running on port 3000
- At least one article published with `data-pagefind-body` attribute

**Important limitation**: The dev server (`pnpm start`) does NOT build the Pagefind index. Full search functionality requires a production build (`pnpm run build`). Curl verification can check the search page structure and HTML elements, but not the actual search query/response cycle.

### Step 1: Verify search page responds 200

```bash
SEARCH_URL="http://localhost:3000/search/"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SEARCH_URL")
[ "$STATUS" = "200" ] && echo "✓ /search/ responds 200" || echo "✗ /search/ returned $STATUS"
```

**Expected result**: `✓ /search/ responds 200`

### Step 2: Capture search page HTML

```bash
mkdir -p /tmp/verify-rizafahmi-web/search
curl -s "$SEARCH_URL" > /tmp/verify-rizafahmi-web/search/index.html
echo "✓ Saved to /tmp/verify-rizafahmi-web/search/index.html"
```

**Expected result**: File created successfully

### Step 3: Verify page title and heading

```bash
grep -q '<title>.*Cari Artikel.*</title>' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Page title correct" || echo "✗ Page title missing"
grep -q '<h1>Cari Artikel</h1>' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Page H1 present" || echo "✗ H1 missing"
```

**Expected result**:
```
✓ Page title correct
✓ Page H1 present
```

### Step 4: Verify search input field exists with correct attributes

```bash
grep -q 'id="search-input"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Search input ID present" || echo "✗ Input ID missing"
grep -q 'data-search-input' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Search input data attribute" || echo "✗ Data attribute missing"
grep -q 'type="search"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Input type=search" || echo "✗ Type attribute missing"
grep -q 'placeholder="Ketik untuk mencari' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Placeholder text present" || echo "✗ Placeholder missing"
```

**Expected result**: All 4 checks pass

### Step 5: Verify ARIA attributes for accessibility

```bash
grep -q 'role="combobox"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Input has combobox role" || echo "✗ Combobox role missing"
grep -q 'aria-autocomplete="list"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ ARIA autocomplete attribute" || echo "✗ ARIA autocomplete missing"
grep -q 'aria-expanded="false"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ ARIA expanded state" || echo "✗ ARIA expanded missing"
grep -q 'aria-controls="search-panel"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ ARIA controls attribute" || echo "✗ ARIA controls missing"
```

**Expected result**: All 4 ARIA checks pass (ensures screen reader compatibility)

### Step 6: Verify search panel container exists

```bash
grep -q 'id="search-panel"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Search panel ID present" || echo "✗ Panel ID missing"
grep -q 'data-search-panel' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Search panel data attribute" || echo "✗ Panel data attribute missing"
grep -q 'hidden' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Panel initially hidden" || echo "✗ Panel not hidden"
```

**Expected result**: All 3 checks pass (panel should be hidden until user types)

### Step 7: Verify search status area exists

```bash
grep -q 'data-search-status' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Search status element present" || echo "✗ Status element missing"
grep -q 'aria-live="polite"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ ARIA live region for status" || echo "✗ ARIA live region missing"
```

**Expected result**: Both checks pass (status area announces results to screen readers)

### Step 8: Verify search suggestions list container

```bash
grep -q 'data-search-list' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Search list element present" || echo "✗ List element missing"
grep -q 'role="listbox"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Listbox role for suggestions" || echo "✗ Listbox role missing"
```

**Expected result**: Both checks pass

### Step 9: Verify help text for keyboard shortcuts

```bash
grep -q 'Tips:.*↑ ↓.*Enter' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Keyboard help text present" || echo "✗ Help text missing"
```

**Expected result**: `✓ Keyboard help text present`

### Step 10: Verify search client JavaScript is loaded

```bash
grep -q 'search-autocomplete.js' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Search autocomplete script loaded" || echo "✗ Script tag missing"
grep -q 'type="module"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Script is ES module" || echo "✗ Not a module"
```

**Expected result**: Both checks pass (script handles the Pagefind API interaction)

### Step 11: Verify back button to homepage

```bash
grep -q 'href="/".*BERANDA' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Back to homepage button" || echo "✗ Back button missing"
```

**Expected result**: `✓ Back to homepage button`

### Step 12: Verify theme toggle button exists

```bash
grep -q 'id="theme-toggle"' /tmp/verify-rizafahmi-web/search/index.html && echo "✓ Theme toggle present" || echo "✗ Theme toggle missing"
```

**Expected result**: `✓ Theme toggle present`

### Step 13: Check for Pagefind bundle (production build only)

```bash
# This will fail in dev mode - expected
curl -f -s http://localhost:3000/pagefind/pagefind.js > /dev/null 2>&1 && echo "✓ Pagefind bundle available" || echo "⚠ Pagefind not built (dev mode - run 'pnpm run build' for full search)"
```

**Expected result**: `⚠ Pagefind not built` in dev mode (this is normal)

## Production Build Verification (Full Search)

To verify the actual search functionality (query execution and results):

### Step 1: Build production site with Pagefind index

```bash
pnpm run build
```

**Expected result**: Build completes successfully, creates `dist/pagefind/` directory

### Step 2: Serve the production build

```bash
pnpm dlx serve dist -l 3002 &
SERVE_PID=$!
sleep 2
```

**Expected result**: Static server runs on port 3002

### Step 3: Verify Pagefind bundle exists in production

```bash
curl -f -s http://localhost:3002/pagefind/pagefind.js > /dev/null && echo "✓ Pagefind bundle built" || echo "✗ Pagefind bundle missing"
ls -lh dist/pagefind/ && echo "✓ Pagefind directory contents shown above"
```

**Expected result**: Bundle file exists, directory contains `.pagefind` data files

### Step 4: Test search via browser automation (requires Puppeteer)

```bash
# This requires Puppeteer to be installed: pnpm add -D puppeteer
# Create a test script: test-search.mjs
cat > /tmp/verify-rizafahmi-web/test-search.mjs << 'EOF'
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:3002/search/');
await page.waitForSelector('#search-input');

// Type a search query
await page.type('#search-input', 'elixir');

// Wait for results to appear
await page.waitForSelector('[data-search-panel]:not([hidden])', { timeout: 5000 });

// Check for results
const resultsExist = await page.$('.search-suggestion');
console.log(resultsExist ? '✓ Search returned results' : '✗ No results found');

// Take screenshot
await page.screenshot({ path: '/tmp/verify-rizafahmi-web/search/search-results.png' });
console.log('✓ Screenshot saved to /tmp/verify-rizafahmi-web/search/search-results.png');

await browser.close();
EOF

node /tmp/verify-rizafahmi-web/test-search.mjs
```

**Expected result**: Search returns results for "elixir", screenshot captured

### Step 5: Cleanup production server

```bash
kill $SERVE_PID 2>/dev/null || kill $(lsof -ti:3002)
```

**Expected result**: Server stopped

## Gotchas

**Dev mode has no search index**: The most important gotcha. `pnpm start` does not run Pagefind indexing (for speed). The search page loads, the UI renders, but queries return no results because `/pagefind/pagefind.js` doesn't exist. This is expected behavior, not a bug.

**Production build required for full test**: To verify search actually works, you must run `pnpm run build`, which runs Pagefind after Eleventy finishes. Then serve `dist/` on a different port and test there.

**Opt-in indexing**: Pagefind is configured in **opt-in mode**. Only pages with `data-pagefind-body` attribute are indexed. If an article is missing this attribute, it won't be searchable even in production. Check `src/_includes/tulisan.njk` for the attribute.

**Pagefind is a module**: The browser API is an ES module that exports functions. The search client (`assets/search-client.js`) handles importing it. Old references expecting `window.pagefind` will fail (there's a test for this: `test/search-client.test.js`).

**Lazy loading**: Pagefind only loads when the user visits `/search/`. It doesn't preload on other pages. This saves bandwidth for users who never search.

**Keyboard navigation**: The autocomplete dropdown is keyboard navigable (↑/↓ to move, Enter to select, Escape to close). This is JS-driven behavior that curl can't verify - you need browser automation or manual testing.

**Search query debouncing**: The autocomplete likely debounces keystrokes to avoid spamming the Pagefind API. Typing fast might result in fewer queries than characters typed. This is an implementation detail in `assets/search-autocomplete.js`.

**Excerpt highlighting**: Pagefind returns excerpts with `<mark>` tags around matched terms. The CSS styles these highlights (usually yellow background or bold). The search UI renders these highlights as-is.

**No search results page**: There's no dedicated "search results" page that lists all matches. The autocomplete dropdown IS the results interface. Clicking a suggestion navigates directly to that article.

**Indonesian language**: Pagefind is configured with `forceLanguage: "id"` (Indonesian) in `test/search-client.test.js`. This affects stemming and stop words. The production Pagefind build should use the same language setting.

**Browser caching**: Pagefind bundles include a hash in the filename for cache busting. If you rebuild and the index changes, browsers should pick up the new file. But local dev might require a hard refresh (Ctrl+Shift+R).

**IntersectionObserver not needed**: Unlike comments (utterances) and analytics (GoatCounter), the search functionality doesn't use `IntersectionObserver` lazy loading. The `/search/` page loads the script immediately (but only on that page).

// Lightweight Pagefind-powered search autocomplete
// Loads Pagefind lazily (only when the input is used).

const input = document.querySelector("[data-search-input]");
const panel = document.querySelector("[data-search-panel]");
const list = document.querySelector("[data-search-list]");
const status = document.querySelector("[data-search-status]");

if (!input || !panel || !list) {
  // Not on the search page (or markup changed)
  // eslint-disable-next-line no-console
  console.warn("search-autocomplete: missing required DOM elements");
} else {
  let pagefindPromise;
  let lastQuery = "";
  let activeIndex = -1;
  let items = [];
  let abortController;

  const MIN_QUERY = 2;
  const MAX_RESULTS = 6;
  const DEBOUNCE_MS = 120;

  function setExpanded(expanded) {
    input.setAttribute("aria-expanded", expanded ? "true" : "false");
    panel.hidden = !expanded;
  }

  function clearList() {
    items = [];
    activeIndex = -1;
    list.innerHTML = "";
    if (status) status.textContent = "";
    setExpanded(false);
  }

  function ensurePagefind() {
    if (!pagefindPromise) {
      // Pagefind is generated at build time into /pagefind/pagefind.js
      pagefindPromise = import("/pagefind/pagefind.js").then(() => {
        if (!window.pagefind) {
          throw new Error("Pagefind failed to load: window.pagefind is missing");
        }
        return window.pagefind;
      });
    }
    return pagefindPromise;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Pagefind excerpts contain <mark> tags. Allow only <mark> and escape the rest.
  function sanitizeExcerpt(html) {
    const escaped = escapeHtml(html || "");
    return escaped
      .replaceAll("&lt;mark&gt;", "<mark>")
      .replaceAll("&lt;/mark&gt;", "</mark>");
  }

  function render() {
    list.innerHTML = "";

    if (!items.length) {
      setExpanded(false);
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const li = document.createElement("li");
      li.className = "search-suggestion";
      li.id = `search-suggestion-${i}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === activeIndex ? "true" : "false");

      li.innerHTML = `
        <a class="search-suggestion__link" href="${escapeHtml(it.url)}" tabindex="-1">
          <div class="search-suggestion__title">${escapeHtml(it.title || it.url)}</div>
          ${it.excerpt ? `<div class="search-suggestion__excerpt">${sanitizeExcerpt(it.excerpt)}</div>` : ""}
        </a>
      `.trim();

      li.addEventListener("mousemove", () => {
        activeIndex = i;
        syncActiveDescendant();
        render();
      });

      li.addEventListener("mousedown", (e) => {
        // Prevent input blur before navigation
        e.preventDefault();
      });

      list.appendChild(li);
    }

    setExpanded(true);
    syncActiveDescendant();
  }

  function syncActiveDescendant() {
    if (activeIndex >= 0) {
      input.setAttribute("aria-activedescendant", `search-suggestion-${activeIndex}`);
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function selectActive() {
    const it = items[activeIndex];
    if (!it) return;
    window.location.href = it.url;
  }

  async function runSearch(query) {
    const q = query.trim();

    if (q.length < MIN_QUERY) {
      clearList();
      return;
    }

    lastQuery = q;

    if (abortController) abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    if (status) status.textContent = "Mencari…";

    try {
      const pagefind = await ensurePagefind();

      if (signal.aborted) return;

      const search = await pagefind.search(q, { limit: MAX_RESULTS });
      if (signal.aborted) return;

      // Fetch per-result data (title, url, excerpt)
      const results = await Promise.all(
        search.results.slice(0, MAX_RESULTS).map(async (r) => {
          const data = await r.data();
          return {
            url: data.url,
            title: data.meta?.title || data.meta?.name || data.title,
            excerpt: data.excerpt,
          };
        })
      );

      if (signal.aborted) return;

      // Only update if user hasn't typed something else
      if (input.value.trim() !== lastQuery) return;

      items = results;
      activeIndex = results.length ? 0 : -1;

      if (status) {
        status.textContent = results.length
          ? `${results.length} saran` // suggestions
          : `Tidak ditemukan hasil untuk “${q}”`;
      }

      render();
    } catch (err) {
      clearList();
      if (status) status.textContent = "Search tidak tersedia.";
      // eslint-disable-next-line no-console
      console.warn("search-autocomplete error:", err);
    }
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      window.clearTimeout(t);
      t = window.setTimeout(() => fn(...args), ms);
    };
  }

  const debouncedSearch = debounce(runSearch, DEBOUNCE_MS);

  input.addEventListener("input", () => debouncedSearch(input.value));

  input.addEventListener("focus", () => {
    if (input.value.trim().length >= MIN_QUERY) {
      debouncedSearch(input.value);
    }
  });

  input.addEventListener("keydown", (e) => {
    if (!items.length) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        activeIndex = Math.min(items.length - 1, activeIndex + 1);
        render();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        activeIndex = Math.max(0, activeIndex - 1);
        render();
        break;
      }
      case "Enter": {
        // If panel is open, go to selected suggestion
        if (input.getAttribute("aria-expanded") === "true") {
          e.preventDefault();
          selectActive();
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        clearList();
        break;
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target === input) return;
    if (panel.contains(e.target)) return;
    clearList();
  });
}

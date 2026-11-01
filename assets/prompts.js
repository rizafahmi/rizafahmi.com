// Interactive search, category filter, and one-click clipboard copy for /prompts/ and /prompts/<slug>/.

async function writeClipboard(text) {
  if (!navigator?.clipboard?.writeText) {
    throw new Error("Clipboard API unavailable");
  }
  await navigator.clipboard.writeText(text);
}

// 1. Card-level quick [Salin] buttons on /prompts/
for (const button of document.querySelectorAll("[data-copy-text]")) {
  const defaultLabel = button.textContent.trim();
  let resetTimer;

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const text = button.getAttribute("data-copy-text") || "";
    if (!text) return;

    try {
      await writeClipboard(text);
      button.textContent = "Tersalin!";
      button.setAttribute("data-copied", "true");
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        button.textContent = defaultLabel;
        button.removeAttribute("data-copied");
      }, 1800);
    } catch {
      button.textContent = "Gagal";
    }
  });
}

// 2. Detail-page hero [Salin Prompt] button on /prompts/<slug>/
for (const button of document.querySelectorAll("[data-copy-target]")) {
  const defaultLabel = button.dataset.copyLabel || button.textContent.trim();
  let resetTimer;

  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    const status = button.closest(".prompt-workbench")?.querySelector("[role=status]");
    if (!target) return;

    try {
      await writeClipboard(target.textContent.trim());
      button.textContent = "Tersalin!";
      if (status) status.textContent = "Prompt tersalin ke papan klip. Siap ditempel.";
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        button.textContent = defaultLabel;
        if (status) status.textContent = "";
      }, 2200);
    } catch {
      if (status)
        status.textContent = "Belum tersalin. Pilih teks di atas lalu salin secara manual.";
    }
  });
}

// 3. Instant search + category filter on /prompts/
const searchInput = document.querySelector("[data-prompt-search]");
const clearButton = document.querySelector("[data-prompt-clear]");
const resetAllButton = document.querySelector("[data-prompt-reset-all]");
const statusEl = document.querySelector("[data-prompt-status]");
const countPill = document.querySelector("[data-prompt-count-pill]");
const emptyEl = document.querySelector("[data-prompt-empty]");
const categoryLinks = [...document.querySelectorAll("[data-category-filter]")];
const sections = [...document.querySelectorAll("[data-category-section]")];
const cards = [...document.querySelectorAll("[data-prompt-card]")];

if (searchInput && cards.length > 0) {
  const totalCount = cards.length;
  let activeCategory = "all";

  function applyFilter() {
    const query = searchInput.value.trim().toLowerCase();
    const tokens = query ? query.split(/\s+/).filter(Boolean) : [];
    let visibleCount = 0;

    if (clearButton) {
      clearButton.hidden = query.length === 0 && activeCategory === "all";
    }

    for (const card of cards) {
      const cardCat = card.getAttribute("data-category") || "";
      const haystack = (card.getAttribute("data-search") || "").toLowerCase();
      const matchesCat = activeCategory === "all" || cardCat === activeCategory;
      const matchesQuery = tokens.every((token) => haystack.includes(token));
      const show = matchesCat && matchesQuery;

      card.hidden = !show;
      if (show) visibleCount += 1;
    }

    for (const section of sections) {
      const visibleInSection = section.querySelectorAll("[data-prompt-card]:not([hidden])").length;
      section.hidden = visibleInSection === 0;
    }

    for (const link of categoryLinks) {
      const linkCat = link.getAttribute("data-category-filter");
      if (linkCat === activeCategory) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    }

    if (emptyEl) {
      emptyEl.hidden = visibleCount > 0;
    }

    if (countPill) {
      countPill.textContent =
        visibleCount === totalCount
          ? `⚡ ${totalCount} PROMPT`
          : `⚡ ${visibleCount} / ${totalCount} PROMPT`;
    }

    if (statusEl) {
      if (query || activeCategory !== "all") {
        statusEl.textContent = `Menampilkan ${visibleCount} dari ${totalCount} prompt.`;
      } else {
        statusEl.textContent = "";
      }
    }
  }

  function syncCategoryFromHash() {
    const hash = window.location.hash.replace(/^#/, "").trim();
    if (!hash || hash === "semua") {
      activeCategory = "all";
    } else if (categoryLinks.some((link) => link.getAttribute("data-category-filter") === hash)) {
      activeCategory = hash;
    }
    applyFilter();
  }

  searchInput.addEventListener("input", applyFilter);

  for (const link of categoryLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const nextCat = link.getAttribute("data-category-filter") || "all";
      activeCategory = nextCat;
      const nextHash = nextCat === "all" ? "#semua" : `#${nextCat}`;
      history.replaceState(null, "", nextHash);
      applyFilter();
    });
  }

  function resetAll() {
    searchInput.value = "";
    activeCategory = "all";
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
    applyFilter();
    searchInput.focus();
  }

  clearButton?.addEventListener("click", resetAll);
  resetAllButton?.addEventListener("click", resetAll);
  window.addEventListener("hashchange", syncCategoryFromHash);

  syncCategoryFromHash();
}

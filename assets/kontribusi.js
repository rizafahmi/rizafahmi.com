/**
 * Client-side filtering for /kontribusi/ PR evidence ledger.
 * Progressive enhancement: the page renders usable HTML without JS.
 */
(() => {
  const controls = document.querySelector("[data-kontribusi-controls]");
  const list = document.querySelector("[data-pr-list]");
  if (!controls || !list) return;

  const relButtons = [...controls.querySelectorAll("[data-rel-filter]")];
  const outcomeSelect = controls.querySelector("[data-outcome-filter]");
  const kindSelect = controls.querySelector("[data-kind-filter]");
  const searchInput = controls.querySelector("[data-search-filter]");
  const liveCount = controls.querySelector("[data-live-count]");
  const emptyState = document.querySelector("[data-empty-state]");
  const items = [...list.querySelectorAll("[data-pr-item]")];

  const state = {
    rel: "external_contributor",
    outcome: "all",
    kind: "all",
    query: "",
  };

  function applyFilters() {
    let visible = 0;
    let merged = 0;
    const q = state.query.trim().toLowerCase();

    for (const item of items) {
      const rel = item.getAttribute("data-relationship") || "";
      const outcome = item.getAttribute("data-outcome") || "";
      const kind = item.getAttribute("data-kind") || "";
      const haystack = item.getAttribute("data-search") || "";

      const matchRel = state.rel === "all" || rel === state.rel;
      const matchOutcome = state.outcome === "all" || outcome === state.outcome;
      const matchKind = state.kind === "all" || kind === state.kind;
      const matchQuery = !q || haystack.includes(q);

      const show = matchRel && matchOutcome && matchKind && matchQuery;
      item.hidden = !show;
      if (show) {
        visible += 1;
        if (outcome === "merged") merged += 1;
      }
    }

    if (liveCount) {
      liveCount.innerHTML = `Menampilkan <strong>${visible}</strong> dari ${items.length} PR (<strong>${merged}</strong> di-merge)`;
    }
    if (emptyState) {
      emptyState.hidden = visible > 0;
    }
  }

  for (const btn of relButtons) {
    btn.addEventListener("click", () => {
      state.rel = btn.getAttribute("data-rel-filter") || "all";
      for (const b of relButtons) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      }
      applyFilters();
    });
  }

  if (outcomeSelect) {
    outcomeSelect.addEventListener("change", () => {
      state.outcome = outcomeSelect.value || "all";
      applyFilters();
    });
  }

  if (kindSelect) {
    kindSelect.addEventListener("change", () => {
      state.kind = kindSelect.value || "all";
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.query = searchInput.value || "";
      applyFilters();
    });
  }
})();

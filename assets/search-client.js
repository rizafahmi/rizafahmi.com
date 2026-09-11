// Pagefind loading + result mapping for the site search UI.
// Kept free of DOM access so it can be exercised directly in tests.

const PAGEFIND_URL = "/pagefind/pagefind.js";

/**
 * Finds the Pagefind search API on a freshly loaded module.
 *
 * Pagefind 1.x ships an ES module that *exports* its API (`search`,
 * `debouncedSearch`, `init`, ...). Older builds instead assigned
 * `window.pagefind` as a side effect of loading the script.
 *
 * Rather than pinning one of those shapes, look for the actual contract this
 * UI depends on: an object with a callable `search`. That keeps the check
 * meaningful across Pagefind upgrades instead of pinning today's packaging.
 *
 * @param {object} mod the resolved module namespace
 * @returns {object|undefined} the search API, or undefined if none is usable
 */
function resolveSearchApi(mod) {
  const candidates = [mod, mod?.default, globalThis.window?.pagefind];
  return candidates.find((candidate) => typeof candidate?.search === "function");
}

/**
 * Creates a loader for the Pagefind search API.
 *
 * Loading is lazy (nothing happens until the first call), cached, and
 * single-flight: concurrent callers share one in-flight import.
 *
 * @param {object} [deps]
 * @param {() => Promise<object>} [deps.importPagefind] Overridable for tests.
 * @returns {() => Promise<object>} resolves to the Pagefind search API
 */
export function createPagefindLoader({ importPagefind } = {}) {
  const load = importPagefind ?? (() => import(PAGEFIND_URL));
  let pagefindPromise;

  return function ensurePagefind() {
    if (!pagefindPromise) {
      pagefindPromise = load().then(async (mod) => {
        const pagefind = resolveSearchApi(mod);

        if (!pagefind) {
          // A genuine failure: the bundle loaded but exposes no search API.
          throw new Error(`Pagefind failed to load: no search API exported by ${PAGEFIND_URL}`);
        }

        // Optional per Pagefind's docs - it self-initialises on first search -
        // but calling it up front warms the index and surfaces a broken or
        // missing index here, where the UI can report it.
        if (typeof pagefind.init === "function") {
          await pagefind.init();
        }

        return pagefind;
      });
    }
    return pagefindPromise;
  };
}

/**
 * Maps a Pagefind search response into the shape the suggestion list renders.
 *
 * @param {{results: Array<{data: () => Promise<object>}>}} response
 * @param {number} limit
 * @returns {Promise<Array<{url: string, title: string, excerpt: string}>>}
 */
export async function toSuggestions(response, limit) {
  const results = response?.results ?? [];

  return Promise.all(
    results.slice(0, limit).map(async (r) => {
      const data = await r.data();
      return {
        url: data.url,
        title: data.meta?.title || data.meta?.name || data.title,
        excerpt: data.excerpt,
      };
    }),
  );
}

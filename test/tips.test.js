import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertTipsOverlap,
  assignSlugs,
  cleanDescription,
  deriveTags,
  formatDuration,
  interpretShortsProbe,
  isWatchRedirectForId,
  mergeTips,
  metaDescriptionFor,
  normalizeTipTag,
  parseIsoDuration,
  readExistingTips,
  selectTips,
  slugifyTitle,
  tipsWithTag,
  tipTagList,
  writeTipsAtomic,
} from "../src/libs/tips.js";

test("parseIsoDuration reads the ISO 8601 durations the YouTube API returns", () => {
  assert.equal(parseIsoDuration("PT43S"), 43);
  assert.equal(parseIsoDuration("PT1M29S"), 89);
  assert.equal(parseIsoDuration("PT3M"), 180);
  assert.equal(parseIsoDuration("PT1H2M3S"), 3723);
  assert.equal(parseIsoDuration("P0D"), 0);
  assert.equal(parseIsoDuration("garbage"), null);
  assert.equal(parseIsoDuration(null), null);
});

test("formatDuration renders a short clip as m:ss", () => {
  assert.equal(formatDuration(43), "0:43");
  assert.equal(formatDuration(89), "1:29");
  assert.equal(formatDuration(180), "3:00");
  assert.equal(formatDuration(null), "");
});

// --- slugs -----------------------------------------------------------------
// Slugs are URLs. Once published they must never move, so the rules here are
// pinned rather than left to whatever the implementation happens to do.

test("slugifyTitle lowercases and hyphenates an ordinary Indonesian title", () => {
  assert.equal(slugifyTitle("Cara Cepat Debug di Elixir"), "cara-cepat-debug-di-elixir");
});

test("slugifyTitle folds accented letters down to ASCII", () => {
  assert.equal(slugifyTitle("Café Coding Sesión"), "cafe-coding-sesion");
});

test("slugifyTitle drops emoji instead of leaving a gap or a stray hyphen", () => {
  assert.equal(slugifyTitle("🔥 Tips Elixir 🚀"), "tips-elixir");
  assert.equal(slugifyTitle("Belajar 💡 Ngoding"), "belajar-ngoding");
});

test("slugifyTitle drops punctuation and collapses the separators it leaves behind", () => {
  assert.equal(slugifyTitle("Elixir: apa itu #Ecto?!"), "elixir-apa-itu-ecto");
  assert.equal(slugifyTitle("Node.js  vs   Deno"), "node-js-vs-deno");
});

test("slugifyTitle falls back to a stable name when a title has nothing sluggable", () => {
  assert.equal(slugifyTitle("🔥🚀✨"), "");
  assert.equal(slugifyTitle(""), "");
});

test("assignSlugs gives two near-identical titles distinct, deterministic slugs", () => {
  const slugs = assignSlugs([
    { id: "aaa", title: "Tips Elixir" },
    { id: "bbb", title: "Tips Elixir!" },
    { id: "ccc", title: "Tips Elixir" },
  ]);

  assert.deepEqual(
    slugs.map((tip) => tip.slug),
    ["tips-elixir", "tips-elixir-2", "tips-elixir-3"],
  );
});

test("assignSlugs falls back to the video id when a title slugs to nothing", () => {
  const slugs = assignSlugs([{ id: "dQw4w9WgXcQ", title: "🚀🔥" }]);

  assert.equal(slugs[0].slug, "dQw4w9WgXcQ".toLowerCase());
});

test("assignSlugs keeps a slug already assigned to a video, even if its title changed", () => {
  const slugs = assignSlugs([{ id: "aaa", title: "Judul Yang Sudah Diganti" }], {
    aaa: "judul-lama",
  });

  assert.equal(slugs[0].slug, "judul-lama");
});

test("assignSlugs never hands a new video a slug an existing video already owns", () => {
  const slugs = assignSlugs(
    [
      { id: "aaa", title: "Tips Elixir" },
      { id: "bbb", title: "Tips Elixir" },
    ],
    { bbb: "tips-elixir" },
  );

  const bySlug = Object.fromEntries(slugs.map((tip) => [tip.id, tip.slug]));
  assert.equal(bySlug.bbb, "tips-elixir");
  assert.equal(bySlug.aaa, "tips-elixir-2");
});

test("assignSlugs is stable: the same input twice yields the same slugs", () => {
  const input = [
    { id: "aaa", title: "Tips Elixir" },
    { id: "bbb", title: "Tips Elixir" },
    { id: "ccc", title: "Belajar Phoenix" },
  ];

  assert.deepEqual(assignSlugs(input), assignSlugs(input));
});

test("assignSlugs keeps published slugs stable when a newer video is prepended", () => {
  const first = assignSlugs([
    { id: "aaa", title: "Tips Elixir" },
    { id: "bbb", title: "Tips Elixir" },
  ]);
  const known = Object.fromEntries(first.map((tip) => [tip.id, tip.slug]));

  const second = assignSlugs(
    [{ id: "zzz", title: "Tips Elixir" }, ...first.map(({ id, title }) => ({ id, title }))],
    known,
  );

  const bySlug = Object.fromEntries(second.map((tip) => [tip.id, tip.slug]));
  assert.equal(bySlug.aaa, known.aaa);
  assert.equal(bySlug.bbb, known.bbb);
  assert.equal(bySlug.zzz, "tips-elixir-3");
});

// --- tag derivation --------------------------------------------------------

test("deriveTags picks tags out of the site's existing vocabulary", () => {
  assert.deepEqual(deriveTags("Pattern matching di Elixir", ""), ["elixir"]);
});

test("deriveTags reads the description too, not just the title", () => {
  assert.deepEqual(deriveTags("Trik cepat", "Contoh pakai Phoenix LiveView."), [
    "elixir",
    "phoenix",
  ]);
});

test("deriveTags matches whole words only, so 'apinya' is not the 'api' tag", () => {
  assert.deepEqual(deriveTags("Menyalakan apinya", ""), []);
});

test("deriveTags is case- and punctuation-insensitive", () => {
  assert.deepEqual(deriveTags("ELIXIR, ecto!", ""), ["elixir"]);
});

test("deriveTags returns tags in the vocabulary's own order, deduplicated", () => {
  const tags = deriveTags("Elixir dan Phoenix", "Elixir lagi, plus Phoenix.");
  assert.deepEqual(tags, ["elixir", "phoenix"]);
});

test("deriveTags stays conservative and returns nothing rather than guessing", () => {
  assert.deepEqual(deriveTags("Sesuatu yang lain", "Tanpa kata kunci apa pun."), []);
});

test("deriveTags caps how many tags one tip can collect", () => {
  const noisy = "elixir phoenix javascript nodejs docker ai git vim elixir ecto";
  assert.ok(deriveTags(noisy, noisy).length <= 4);
});

test("tipTagList counts tags across tips and sorts by count then name", () => {
  const list = tipTagList([
    { tags: ["elixir", "phoenix"] },
    { tags: ["elixir"] },
    { tags: ["ai"] },
    { tags: [] },
  ]);

  assert.deepEqual(list, [
    { tag: "elixir", slug: "elixir", count: 2 },
    { tag: "ai", slug: "ai", count: 1 },
    { tag: "phoenix", slug: "phoenix", count: 1 },
  ]);
});

// --- selectTips ------------------------------------------------------------

const RAW_TIP = {
  id: "abc123",
  slug: "tips-elixir",
  title: "Tips Elixir",
  description: "Satu trik kecil di Elixir.",
  publishedAt: "2025-01-02T03:04:05Z",
  duration: "PT43S",
  durationSeconds: 43,
  thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  tags: ["elixir"],
};

test("selectTips pairs each human-owned tag with the same slug tipTagList uses", () => {
  const [tip] = selectTips([
    {
      ...RAW_TIP,
      tags: ["Public Speaking", "Café Coding!", "  "],
    },
  ]);

  assert.deepEqual(tip.tags, [
    { label: "Public Speaking", slug: "public-speaking" },
    { label: "Café Coding!", slug: "cafe-coding" },
  ]);

  assert.deepEqual(tipTagList([tip]), [
    { tag: "Café Coding!", slug: "cafe-coding", count: 1 },
    { tag: "Public Speaking", slug: "public-speaking", count: 1 },
  ]);
});

test("normalizeTipTag slugifies spaces, capitals, accents, and punctuation", () => {
  assert.deepEqual(normalizeTipTag("Public Speaking"), {
    label: "Public Speaking",
    slug: "public-speaking",
  });
  assert.deepEqual(normalizeTipTag("Café: Coding?!"), {
    label: "Café: Coding?!",
    slug: "cafe-coding",
  });
  assert.equal(normalizeTipTag("   "), null);
  assert.equal(normalizeTipTag(null), null);
});

test("selectTips normalizes an entry and derives the URLs the pages need", () => {
  const [tip] = selectTips([RAW_TIP]);

  assert.equal(tip.slug, "tips-elixir");
  assert.equal(tip.url, "/tips/tips-elixir/");
  assert.equal(tip.watchUrl, "https://www.youtube.com/shorts/abc123");
  assert.equal(tip.embedUrl, "https://www.youtube-nocookie.com/embed/abc123");
  assert.equal(tip.thumbnail, "https://i.ytimg.com/vi/abc123/hqdefault.jpg");
  assert.equal(tip.durationLabel, "0:43");
});

test("selectTips sorts newest first regardless of the file's order", () => {
  const older = { ...RAW_TIP, id: "old", slug: "lama", publishedAt: "2024-01-01T00:00:00Z" };
  const newer = { ...RAW_TIP, id: "new", slug: "baru", publishedAt: "2026-01-01T00:00:00Z" };

  assert.deepEqual(
    selectTips([older, newer]).map((tip) => tip.slug),
    ["baru", "lama"],
  );
});

test("selectTips drops entries with no id or no slug rather than emitting a broken page", () => {
  assert.equal(selectTips([{ ...RAW_TIP, id: "" }]).length, 0);
  assert.equal(selectTips([{ ...RAW_TIP, slug: "" }]).length, 0);
  assert.equal(selectTips("not an array").length, 0);
});

test("selectTips leaves transcript undefined when the data file has none", () => {
  const [tip] = selectTips([RAW_TIP]);
  assert.equal(tip.transcript, null);
});

test("selectTips keeps a transcript when one is present, trimmed", () => {
  const [tip] = selectTips([{ ...RAW_TIP, transcript: "  Halo semuanya.  " }]);
  assert.equal(tip.transcript, "Halo semuanya.");
});

test("selectTips treats a blank transcript as no transcript at all", () => {
  const [tip] = selectTips([{ ...RAW_TIP, transcript: "   \n  " }]);
  assert.equal(tip.transcript, null);
});

test("selectTips falls back to a generated thumbnail URL when the field is missing", () => {
  const { thumbnail, ...withoutThumb } = RAW_TIP;
  const [tip] = selectTips([withoutThumb]);
  assert.equal(tip.thumbnail, "https://i.ytimg.com/vi/abc123/hqdefault.jpg");
});

test("selectTips never leaks null into text fields", () => {
  const [tip] = selectTips([{ id: "x", slug: "x", title: null, description: null }]);
  assert.equal(tip.title, "x");
  assert.equal(tip.description, "");
});

// --- mergeTips: re-running the fetch must not clobber manual edits ----------

const FETCHED = {
  id: "abc123",
  title: "Judul Baru Dari YouTube",
  description: "Deskripsi baru.",
  publishedAt: "2025-01-02T03:04:05Z",
  duration: "PT43S",
  durationSeconds: 43,
  thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
};

test("mergeTips seeds tags for a video it has never seen before", () => {
  const merged = mergeTips([{ ...FETCHED, title: "Pattern matching di Elixir" }], []);
  assert.deepEqual(merged[0].tags, ["elixir"]);
});

test("mergeTips keeps hand-edited tags instead of re-deriving them", () => {
  const merged = mergeTips(
    [{ ...FETCHED, title: "Pattern matching di Elixir" }],
    [{ id: "abc123", slug: "pattern-matching", tags: ["otp", "concurrency"] }],
  );

  assert.deepEqual(merged[0].tags, ["otp", "concurrency"]);
});

test("mergeTips respects a tag list the captain deliberately emptied", () => {
  const merged = mergeTips(
    [{ ...FETCHED, title: "Pattern matching di Elixir" }],
    [{ id: "abc123", slug: "pattern-matching", tags: [] }],
  );

  assert.deepEqual(merged[0].tags, []);
});

test("mergeTips carries a hand-written transcript through untouched", () => {
  const merged = mergeTips(
    [FETCHED],
    [{ id: "abc123", slug: "judul-lama", transcript: "Transkrip tulisan tangan." }],
  );

  assert.equal(merged[0].transcript, "Transkrip tulisan tangan.");
});

test("mergeTips keeps the published slug even when the video title changed", () => {
  const merged = mergeTips([FETCHED], [{ id: "abc123", slug: "judul-lama" }]);
  assert.equal(merged[0].slug, "judul-lama");
});

test("mergeTips refreshes the machine-owned fields from the fetch", () => {
  const merged = mergeTips(
    [FETCHED],
    [{ id: "abc123", slug: "judul-lama", title: "Judul Lama", description: "Deskripsi lama." }],
  );

  assert.equal(merged[0].title, "Judul Baru Dari YouTube");
  assert.equal(merged[0].description, "Deskripsi baru.");
});

test("mergeTips preserves any unknown field a future hand-edit adds", () => {
  const merged = mergeTips(
    [FETCHED],
    [{ id: "abc123", slug: "judul-lama", catatan: "perlu direkam ulang" }],
  );

  assert.equal(merged[0].catatan, "perlu direkam ulang");
});

test("mergeTips is idempotent: merging its own output changes nothing", () => {
  const once = mergeTips([{ ...FETCHED, title: "Pattern matching di Elixir" }], []);
  const twice = mergeTips([{ ...FETCHED, title: "Pattern matching di Elixir" }], once);

  assert.deepEqual(twice, once);
});

// --- tips.json I/O: fail closed so a bad read cannot wipe hand edits --------

test("readExistingTips treats a missing file as the first run", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tips-read-"));
  try {
    assert.deepEqual(await readExistingTips(path.join(dir, "tips.json")), []);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("readExistingTips returns a valid tips array unchanged", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tips-read-"));
  const file = path.join(dir, "tips.json");
  try {
    await fs.writeFile(
      file,
      `${JSON.stringify([{ id: "abc123", slug: "a", tags: ["elixir"] }], null, 2)}\n`,
    );
    const tips = await readExistingTips(file);
    assert.equal(tips.length, 1);
    assert.equal(tips[0].id, "abc123");
    assert.deepEqual(tips[0].tags, ["elixir"]);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("readExistingTips aborts on corrupt JSON instead of falling back to []", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tips-read-"));
  const file = path.join(dir, "tips.json");
  try {
    await fs.writeFile(file, "<<<<<<< HEAD\n[{broken\n");
    await assert.rejects(() => readExistingTips(file), /Could not parse|refusing to overwrite/i);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("readExistingTips aborts when the file is not a JSON array", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tips-read-"));
  const file = path.join(dir, "tips.json");
  try {
    await fs.writeFile(file, `${JSON.stringify({ tips: [] }, null, 2)}\n`);
    await assert.rejects(
      () => readExistingTips(file),
      /must be a JSON array|refusing to overwrite/i,
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("writeTipsAtomic leaves a readable tips.json after a successful write", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tips-write-"));
  const file = path.join(dir, "tips.json");
  try {
    const tips = [{ id: "abc123", slug: "a", tags: ["elixir"], transcript: "keep me" }];
    await writeTipsAtomic(file, tips);
    assert.deepEqual(await readExistingTips(file), tips);
    const leftovers = await fs.readdir(dir);
    assert.deepEqual(leftovers, ["tips.json"]);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("assertTipsOverlap allows the first run when tips.json is empty", () => {
  assert.doesNotThrow(() => assertTipsOverlap([], [{ id: "new" }]));
  assert.doesNotThrow(() => assertTipsOverlap([], []));
});

test("assertTipsOverlap allows a few legitimate drops when most ids still confirm", () => {
  const existing = [
    { id: "a", slug: "a", transcript: "keep" },
    { id: "b", slug: "b", tags: ["elixir"] },
    { id: "c", slug: "c" },
    { id: "gone", slug: "d" },
  ];
  assert.doesNotThrow(() => assertTipsOverlap(existing, [{ id: "a" }, { id: "b" }, { id: "c" }]));
});

test("assertTipsOverlap refuses a zero-overlap wipe of hand-edited tips", () => {
  const existing = [
    { id: "a", slug: "a", transcript: "jangan hapus" },
    { id: "b", slug: "b", tags: ["elixir"] },
  ];
  assert.throws(
    () => assertTipsOverlap(existing, []),
    /Delete \.cache\/youtube-shorts\/|TIPS_ALLOW_MASS_REMOVAL=1|YOUTUBE_CHANNEL_ID/i,
  );
  assert.throws(
    () => assertTipsOverlap(existing, [{ id: "foreign-1" }, { id: "foreign-2" }]),
    /only 0 of 2|Delete \.cache\/youtube-shorts\/|TIPS_ALLOW_MASS_REMOVAL=1/i,
  );
});

test("assertTipsOverlap refuses when kept ids are under half of existing", () => {
  const existing = Array.from({ length: 10 }, (_, i) => ({ id: `id-${i}`, slug: `s-${i}` }));
  assert.throws(
    () =>
      assertTipsOverlap(existing, [{ id: "id-0" }, { id: "id-1" }, { id: "id-2" }, { id: "id-3" }]),
    /only 4 of 10|at least half|Delete \.cache\/youtube-shorts\/|TIPS_ALLOW_MASS_REMOVAL=1/i,
  );
  assert.doesNotThrow(() =>
    assertTipsOverlap(
      existing,
      Array.from({ length: 5 }, (_, i) => ({ id: `id-${i}` })),
    ),
  );
});

test("assertTipsOverlap force flag allows a deliberate mass removal", () => {
  const existing = [
    { id: "a", slug: "a", transcript: "ok to drop" },
    { id: "b", slug: "b" },
  ];
  assert.doesNotThrow(() => assertTipsOverlap(existing, [], { force: true }));
});

// --- shorts probe classification -------------------------------------------
// HEAD /shorts/<id> answers 200 for a Short and 303→watch for a regular video.
// Consent walls also 3xx, but must never be cached as false.

test("isWatchRedirectForId accepts only the watch URL for that exact id", () => {
  const id = "abc123XYZ";
  assert.equal(isWatchRedirectForId(`https://www.youtube.com/watch?v=${id}`, id), true);
  assert.equal(isWatchRedirectForId(`/watch?v=${id}`, id), true);
  assert.equal(isWatchRedirectForId(`https://youtube.com/watch?v=${id}&feature=share`, id), true);
  assert.equal(isWatchRedirectForId(`https://www.youtube.com/watch?v=other`, id), false);
  assert.equal(isWatchRedirectForId("https://consent.youtube.com/m?continue=1", id), false);
  assert.equal(isWatchRedirectForId("https://accounts.google.com/ServiceLogin", id), false);
  assert.equal(isWatchRedirectForId(null, id), false);
});

test("interpretShortsProbe keeps 200 true and 404/410 false", () => {
  const id = "vid1";
  assert.deepEqual(interpretShortsProbe(200, null, id), { resolved: true, isShort: true });
  assert.deepEqual(interpretShortsProbe(404, null, id), { resolved: true, isShort: false });
  assert.deepEqual(interpretShortsProbe(410, null, id), { resolved: true, isShort: false });
});

test("interpretShortsProbe treats a watch redirect as definitive not-a-Short", () => {
  const id = "regVid99";
  assert.deepEqual(interpretShortsProbe(303, `https://www.youtube.com/watch?v=${id}`, id), {
    resolved: true,
    isShort: false,
  });
});

test("consent-style redirect is unresolved and is not cached as false", () => {
  const id = "shortPoison";
  const cache = { keepMe: true };
  const consent = interpretShortsProbe(
    303,
    "https://consent.youtube.com/m?continue=https://www.youtube.com/shorts/shortPoison",
    id,
  );
  const login = interpretShortsProbe(
    302,
    "https://accounts.google.com/ServiceLogin?continue=1",
    id,
  );
  const missing = interpretShortsProbe(303, null, id);

  assert.equal(consent.resolved, false);
  assert.equal(login.resolved, false);
  assert.equal(missing.resolved, false);
  assert.match(consent.reason, /unresolved redirect/i);

  // Mirror confirmShorts: only persist a boolean after a resolved probe.
  for (const answer of [consent, login, missing]) {
    if (answer.resolved) cache[id] = answer.isShort;
  }
  assert.equal(Object.hasOwn(cache, id), false);
  assert.equal(cache.keepMe, true);
});

test("mergeTips drops a video that is no longer a Short, and says which", () => {
  const removed = [];
  const merged = mergeTips(
    [FETCHED],
    [
      { id: "abc123", slug: "a" },
      { id: "gone", slug: "b", transcript: "punya transkrip" },
    ],
    { onRemoved: (tip) => removed.push(tip.slug) },
  );

  assert.deepEqual(
    merged.map((tip) => tip.id),
    ["abc123"],
  );
  assert.deepEqual(removed, ["b"]);
});

test("mergeTips writes newest first so the data file reads in page order", () => {
  const merged = mergeTips(
    [
      { ...FETCHED, id: "old", title: "Lama", publishedAt: "2024-01-01T00:00:00Z" },
      { ...FETCHED, id: "new", title: "Baru", publishedAt: "2026-01-01T00:00:00Z" },
    ],
    [],
  );

  assert.deepEqual(
    merged.map((tip) => tip.id),
    ["new", "old"],
  );
});

// --- description cleanup ---------------------------------------------------
// Every YouTube description on this channel ends in the same block of channel
// links, merch, and course URLs. It is not content: left in, it would become
// the page's meta description and would drown the tag derivation in words like
// "javascript" and "web" that the actual tip never mentions.

test("cleanDescription cuts everything from the dashed separator onward", () => {
  const raw = [
    "Yang sudah ada ide, langsung ke situsnya.",
    "",
    "-----------------------------------------",
    "Bergabung menjadi anggota elit di kanal ini:",
    "https://www.youtube.com/channel/x/join",
  ].join("\n");

  assert.equal(cleanDescription(raw), "Yang sudah ada ide, langsung ke situsnya.");
});

test("cleanDescription drops a trailing block that is just links", () => {
  const raw = [
    "Cuplikan obrolan soal keamanan aplikasi web.",
    "",
    "Layanan VPS NEO Lite Pro:",
    "https://s.id/NEOLitePro",
    "https://s.id/NEOLite",
  ].join("\n");

  assert.equal(cleanDescription(raw), "Cuplikan obrolan soal keamanan aplikasi web.");
});

test("cleanDescription keeps a paragraph that merely mentions one link inline", () => {
  const raw = "Detailnya ada di https://rizafahmi.com dan sisanya dibahas di video.";
  assert.equal(cleanDescription(raw), raw);
});

test("cleanDescription drops a trailing hashtag-only block", () => {
  const raw = "Trik kecil di Elixir.\n\n#elixir #phoenix #shorts";
  assert.equal(cleanDescription(raw), "Trik kecil di Elixir.");
});

test("cleanDescription collapses the blank lines it leaves behind", () => {
  const raw = "Paragraf satu.\n\n\n\nParagraf dua.";
  assert.equal(cleanDescription(raw), "Paragraf satu.\n\nParagraf dua.");
});

test("cleanDescription returns an empty string for a description that is all boilerplate", () => {
  assert.equal(cleanDescription("-------------\nBergabung:\nhttps://x.test/"), "");
  assert.equal(cleanDescription(""), "");
  assert.equal(cleanDescription(null), "");
});

test("selectTips exposes the cleaned description, not the raw one", () => {
  const [tip] = selectTips([
    { ...RAW_TIP, description: "Isi asli.\n\n--------------\nhttps://x.test/join" },
  ]);

  assert.equal(tip.description, "Isi asli.");
  assert.doesNotMatch(tip.description, /x\.test/);
});

test("selectTips builds a one-line excerpt for meta tags", () => {
  const [tip] = selectTips([{ ...RAW_TIP, description: "Baris satu.\n\nBaris dua." }]);
  assert.equal(tip.excerpt, "Baris satu. Baris dua.");
});

test("selectTips falls back to the title when a tip has no usable description", () => {
  const [tip] = selectTips([{ ...RAW_TIP, description: "-------\nhttps://x.test/" }]);
  assert.equal(tip.description, "");
  assert.match(tip.excerpt, /Tips Elixir/);
});

test("deriveTags ignores the boilerplate link block, which names other topics", () => {
  const raw = [
    "Cara pakai pattern matching di Elixir.",
    "",
    "-------------------------------",
    "Nikmati juga karya saya lainnya:",
    "https://buildwithangga.com/kelas/struktur-data-javascript-improve-website-e-commerce",
  ].join("\n");

  assert.deepEqual(deriveTags("Pattern matching", raw), ["elixir"]);
});

test("deriveTags reads hashtags in a title as ordinary words", () => {
  assert.deepEqual(deriveTags("Penjelasan #shorts tentang #agile dan #scrum", ""), [
    "produk-manajemen",
  ]);
});

test("deriveTags recognises the channel's recurring non-code clusters", () => {
  assert.deepEqual(deriveTags("Public Speaking Tips 1: Menentukan Topik", ""), ["public-speaking"]);
  assert.deepEqual(deriveTags("Mending resign atau terus?", ""), ["karier"]);
});

test("tipsWithTag narrows the list without reordering it", () => {
  const list = [
    { slug: "a", tags: ["ai"] },
    { slug: "b", tags: ["elixir"] },
    { slug: "c", tags: ["ai", "elixir"] },
  ];

  assert.deepEqual(
    tipsWithTag(list, "ai").map((tip) => tip.slug),
    ["a", "c"],
  );
  assert.deepEqual(tipsWithTag(list, "tidak-ada"), []);
  assert.deepEqual(tipsWithTag(null, "ai"), []);
});

test("tipsWithTag matches the display label on selectTips tag objects", () => {
  const tips = selectTips([
    { ...RAW_TIP, id: "a", slug: "a", tags: ["Public Speaking"] },
    { ...RAW_TIP, id: "b", slug: "b", tags: ["elixir"] },
  ]);

  assert.deepEqual(
    tipsWithTag(tips, "Public Speaking").map((tip) => tip.slug),
    ["a"],
  );
});

// --- meta description ------------------------------------------------------
// scripts/audit-site.mjs fails the build on a description under 50 characters,
// and plenty of Shorts have a one-line description or none at all.

test("metaDescriptionFor uses the description when there is enough of it", () => {
  const long =
    "Cuplikan obrolan soal keamanan aplikasi web bersama seorang praktisi yang sudah lama menekuninya.";
  assert.equal(metaDescriptionFor({ title: "Judul", description: long }), long);
});

test("metaDescriptionFor pads a one-liner instead of shipping a two-word meta tag", () => {
  const meta = metaDescriptionFor({ title: "Satu sesi per task", description: "Satu sesi." });

  assert.ok(meta.length >= 50);
  assert.match(meta, /^Satu sesi\./);
  assert.match(meta, /Eksperimen Pemrograman/);
});

test("metaDescriptionFor falls back to the title when the description is all boilerplate", () => {
  const meta = metaDescriptionFor({
    title: "Satu sesi per task",
    description: "----------\nhttps://x.test/join",
  });

  assert.ok(meta.length >= 50);
  assert.match(meta, /Satu sesi per task/);
});

test("every tip gets a meta description long enough for the site audit", () => {
  const [tip] = selectTips([{ id: "abc123", slug: "s", title: "Ok", description: "" }]);
  assert.ok(tip.metaDescription.length >= 50, tip.metaDescription);
});

test("slugifyTitle caps a sentence-length title at a word boundary", () => {
  const title =
    "Akhirnya sampailah kita ke era kontainer dan Docker sebagai merk yang paling populer";
  const slug = slugifyTitle(title);

  assert.ok(slug.length <= 70, `${slug.length} chars: ${slug}`);
  assert.doesNotMatch(slug, /-$/);
  // Cut at a word boundary, never mid-word.
  assert.ok(
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .startsWith(slug),
  );
  assert.match(slug, /^akhirnya-sampailah-kita-ke-era-kontainer-dan-docker-sebagai-merk/);
});

test("slugifyTitle still returns something when the first word is longer than the cap", () => {
  const slug = slugifyTitle("a".repeat(120));
  assert.equal(slug.length, 70);
});

test("assignSlugs keeps capped slugs unique when two long titles share a prefix", () => {
  const long = "Penjelasan panjang sekali tentang bagaimana caranya memakai kontainer dengan";
  const slugs = assignSlugs([
    { id: "a", title: `${long} Docker` },
    { id: "b", title: `${long} Podman` },
  ]);

  assert.notEqual(slugs[0].slug, slugs[1].slug);
  assert.match(slugs[1].slug, /-2$/);
});

// --- the fetch script stays out of the build -------------------------------
// YouTube being slow or rate-limited must never break a Netlify deploy, which
// is why src/_data/tips.json is fetched by hand and committed.

test("the Shorts fetch is not wired into any build script", async () => {
  const { readFile } = await import("node:fs/promises");
  const pkg = JSON.parse(await readFile("package.json", "utf8"));

  for (const [name, command] of Object.entries(pkg.scripts)) {
    if (name === "test" || name === "check") continue;
    assert.doesNotMatch(
      command,
      /fetch-youtube/,
      `package.json script "${name}" would fetch YouTube during a build`,
    );
  }

  const config = await readFile("eleventy.config.js", "utf8");
  assert.doesNotMatch(config, /fetch-youtube/);
});

test("the tips data file is plain committed JSON, read without any network call", async () => {
  const { readFile } = await import("node:fs/promises");
  const dataFile = await readFile("src/_data/tipsLibrary.js", "utf8");

  assert.doesNotMatch(dataFile, /\bfetch\s*\(/);
  assert.match(dataFile, /tips\.json/);
});

test("mergeTips writes id and slug first so the data file is navigable by eye", () => {
  const merged = mergeTips([FETCHED], []);
  assert.deepEqual(Object.keys(merged[0]).slice(0, 2), ["id", "slug"]);
  assert.equal(Object.keys(merged[0]).at(-1), "tags");
});

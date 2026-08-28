# /konsultasi/ Consultation Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single Indonesian-language page at `/konsultasi/` that lets an engineering lead submit a structured consultation brief, and that produces interpretable data whether or not anyone does.

**Architecture:** One static Nunjucks template using the existing `main.njk` layout, one page-scoped stylesheet loaded through the `pageCss` front-matter hook, and a native HTML form posting to Netlify Forms with a separate thank-you page as its success target. No JavaScript, no new webfont face, no third-party origin. Navigation is wired into both site chromes that carry a nav, and `scripts/audit-site.mjs` is extended so the homepage link cannot silently die.

**Tech Stack:** Eleventy 3.x (ESM config), Nunjucks templates, plain CSS with the site's custom properties, Netlify Forms, Node.js built-in test runner (`node:test` + `node:assert/strict`), Biome for lint/format, pnpm.

**Design spec:** `docs/superpowers/specs/2026-08-28-konsultasi-advisory-page-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Package manager is pnpm only.** Never `npm` or `bun`. `pnpm-lock.yaml` is the single lockfile.
- **All page copy is Indonesian.** Site chrome and `<html lang="id">` are already correct; no `pageLocale` or `alternates` fields are needed.
- **No reference to `/kelas/` anywhere** — not a link, not a mention. That page is on an unmerged branch and may never ship; a link to an unbuilt page fails the audit's broken-internal-link check.
- **No prices on the page.** Pricing is per case, requested through the form's `budget` band only.
- **No client logos, testimonials, or case studies.** There are no clients yet.
- **No new webfont face.** `src/libs/webfonts.js` ships exactly five faces and that list is not touched.
- **No JavaScript and no third-party origin on this page.** The form is native HTML.
- **DESIGN.md bans:** no shadows, no gradients, no glassmorphism, no neon-on-black. Sharp corners, flat solid borders (`2px` default).
- **Code conventions:** 2-space indentation, kebab-case filenames, template literals, arrow functions for callbacks. Import order in test files: built-ins → dependencies → local modules.
- **Copy is a first draft in Riza's voice and is expected to be edited.** Editing prose is fine; changing the `name` attributes, the `form-name` value, the form `action`, the `data-pagefind-body` attribute, or removing the `Belum tahu` budget option will fail tests — by design.
- **Verification before done:** `pnpm run check` (Biome + unit tests) must pass. `pnpm run build` must pass, since it runs `scripts/audit-site.mjs`.

## File Structure

| File | Responsibility |
| --- | --- |
| `src/konsultasi.njk` | The page: hero, three session types, credibility, honesty block, exclusion note, brief form, FAQ |
| `src/konsultasi-terima-kasih.njk` | Form success target at `/konsultasi/terima-kasih/`; sets the reply-time expectation |
| `assets/konsultasi.css` | Page-scoped styles: section rules, session cards, form fields. Loaded only on this page via `pageCss` |
| `test/konsultasi.test.js` | Structural assertions for the failures that would otherwise be silent |
| `src/_includes/main.njk` | Modified: adds `Konsultasi` to the shared hero nav |
| `src/index.njk` | Modified: adds a `#konsultasi` body section (homepage does not use `main.njk`) |
| `src/sitemap.njk` | Modified: adds `/konsultasi/` to the hand-maintained `staticPages` list |
| `assets/home.css` | Modified: styles for the homepage section (the homepage does not load `pageCss`) |
| `scripts/audit-site.mjs` | Modified: adds `/konsultasi` to the homepage-reachability list |

Three tasks, in order. Task 3 must land as one unit: adding `/konsultasi` to the audit list without the homepage anchor fails the build.

---

### Task 1: Page shell, content, and stylesheet

Creates the page with everything except the form. Deliverable: `/konsultasi/` builds, is styled, and is indexed by search.

**Files:**
- Create: `src/konsultasi.njk`
- Create: `assets/konsultasi.css`
- Test: `test/konsultasi.test.js`

**Interfaces:**
- Consumes: `main.njk` layout (provides `<html lang="id">`, header nav, and the `pageCss` stylesheet hook at `src/_includes/main.njk:15`); the global `.button` and `.container` classes from `assets/global.css`; CSS custom properties `--border-color`, `--meta-color`, `--accent-acid`, `--font-mono`.
- Produces: the page at permalink `/konsultasi/` with `<main class="container konsultasi-page prose" data-pagefind-body>`; the CSS class prefix `konsultasi-` reserved for this page; the anchor id `brief` used by Task 2's form.

- [ ] **Step 1: Write the failing test**

Create `test/konsultasi.test.js`:

```javascript
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/* Pagefind runs in opt-in mode on this site: once any page carries
 * data-pagefind-body, pages without it are excluded from the index entirely.
 * A consultation page nobody can find by searching defeats its own purpose. */
test("the page opts into the Pagefind index", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  assert.match(source, /data-pagefind-body/);
});

test("the page declares its own stylesheet and permalink", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  const frontmatter = source.split("---")[1] ?? "";
  assert.match(frontmatter, /^permalink: \/konsultasi\/$/m);
  assert.match(frontmatter, /^pageCss: konsultasi\.css$/m);
  assert.match(frontmatter, /^layout: main$/m);
});

/* The spec's central constraint. /kelas/ is unmerged and may never ship;
 * a link to an unbuilt page also fails scripts/audit-site.mjs. */
test("the page never references /kelas/", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  assert.doesNotMatch(source, /\/kelas\//);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/konsultasi.test.js`

Expected: FAIL — `ENOENT: no such file or directory, open 'src/konsultasi.njk'`.

- [ ] **Step 3: Create the page template**

Create `src/konsultasi.njk`. Copy is a first draft; the attributes are not.

```njk
---
layout: main
title: Konsultasi Agentic Engineering untuk Tim
permalink: /konsultasi/
pageCss: konsultasi.css
description: Sesi konsultasi sekali duduk untuk engineering lead dan CTO tim 5-50 developer di Indonesia yang sedang menata cara kerja timnya bareng AI coding tool.
---

<main id="main-content" class="container konsultasi-page prose" data-pagefind-body>
  <h1>Profesi ini sedang berubah, dan belum ada yang benar-benar tahu jadi apa</h1>

  <p class="konsultasi-lede">
    Saya juga tidak tahu. Bedanya, saya mengerjakannya di depan umum tiap Senin.
  </p>

  <p>
    Yang harus kamu putuskan bulan ini jauh lebih konkret: tim kamu sudah pakai AI coding
    tool, PR makin banyak, review makin lambat, dan kamu belum yakin timnya jadi lebih baik.
    Sesi ini untuk memikirkan itu bareng - sekali duduk, tanpa ikatan lanjutan.
  </p>

  <p><a class="button" href="#brief">Ajukan brief</a></p>

  <h2>Tiga bentuk sesi</h2>

  <div class="konsultasi-sesi">
    <article class="konsultasi-sesi-item">
      <h3>Arah</h3>
      <p class="konsultasi-sesi-q">&ldquo;Kami baru coba-coba. Mulai dari mana?&rdquo;</p>
      <p>
        Kita petakan kondisi tim kamu, lalu keluar dengan tiga hal yang layak dikerjakan
        kuartal ini - dan daftar yang sebaiknya diabaikan dulu. Daftar yang diabaikan
        biasanya lebih panjang, dan itu memang gunanya.
      </p>
    </article>

    <article class="konsultasi-sesi-item">
      <h3>Pendapat kedua</h3>
      <p class="konsultasi-sesi-q">&ldquo;Rencananya sudah ada. Tahan nggak?&rdquo;</p>
      <p>
        Standardisasi satu tool untuk semua tim, rebuild dengan agent, hire orang baru
        atau melatih yang ada. Kamu sudah punya jawabannya; sesi ini untuk mengujinya,
        plus cara gagal yang belum kamu temui.
      </p>
    </article>

    <article class="konsultasi-sesi-item">
      <h3>Review cara kerja</h3>
      <p class="konsultasi-sesi-q">&ldquo;Lihat cara tim kami benar-benar kerja.&rdquo;</p>
      <p>
        Saya lihat repo, file aturan agent, dan alur review kamu apa adanya - lalu
        bilang bagian mana yang sebenarnya rusak. Perlu akses baca dan sedikit persiapan
        dari sisi kamu.
      </p>
    </article>
  </div>

  <h2>Kenapa saya</h2>

  <ul class="konsultasi-fakta">
    <li>
      <strong>Co-Founder HACKTIV8.</strong> Ikut membangun bootcamp yang sudah melatih
      ribuan engineer di Indonesia. Kalau masalahmu ada di kemampuan tim, itu pekerjaan
      yang sudah lama saya lakukan.
    </li>
    <li>
      <strong>14 tahun membuat dan mengajarkan software.</strong> Menulis dan bikin konten
      pemrograman sejak 2012, podcast sejak 2015.
    </li>
    <li>
      <strong>Kerjanya kelihatan, bukan slide.</strong> Tiap Senin saya bereksperimen dengan
      agentic coding di
      <a href="{{ site.social.youtube }}" target="_blank" rel="noopener noreferrer">livestream Eksperimen Pemrograman</a>,
      termasuk waktu gagal.
    </li>
    <li>
      <strong>Nilai dulu sebelum bayar.</strong> Cara berpikir saya soal ini terkumpul gratis
      di <a href="/topik/agentic-coding/">topik agentic coding</a>. Baca dulu, baru putuskan.
    </li>
  </ul>

  <h2>Jujur dari awal</h2>

  <ul>
    <li>Layanan ini <strong>baru</strong>. Belum ada klien, jadi belum ada testimoni atau logo untuk dipajang.</li>
    <li>Saya tidak menjual kepastian. Tidak ada yang tahu bentuk profesi ini tiga tahun lagi.</li>
    <li>Yang saya jual: penilaian dari orang yang benar-benar mengerjakannya tiap minggu.</li>
    <li>Harga per kasus, karena tim 8 orang dan tim 40 orang bukan masalah yang sama. Isi brief, saya balas dengan angka.</li>
    <li>Kalau setelah ngobrol ternyata kamu tidak butuh saya, saya bilang.</li>
  </ul>

  <h2>Bukan untuk siapa</h2>

  <p>
    Sesi ini disiapkan untuk yang memimpin tim engineering 5-50 orang. Kalau kamu developer
    yang ingin menata cara kerjamu sendiri, jangan bayar untuk ini dulu - materinya sudah
    saya tulis gratis di <a href="/topik/agentic-coding/">topik agentic coding</a>, dan
    pertanyaan dijawab langsung di
    <a href="{{ site.social.youtube }}" target="_blank" rel="noopener noreferrer">livestream Senin</a>.
  </p>
</main>
```

- [ ] **Step 4: Create the stylesheet**

Create `assets/konsultasi.css`:

```css
/*
 * /konsultasi/ - the consultation brief page.
 *
 * Loaded via the `pageCss` front-matter hook in _includes/main.njk so no other
 * page pays for these rules. Follows DESIGN.md: flat 2px borders, sharp corners,
 * no shadows or gradients, colour reserved for hover and structure. The section
 * rule matches kerjasama.css so the two commercial pages read as siblings.
 */

.konsultasi-page h2 {
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 2px solid var(--border-color);
}

.konsultasi-lede {
  max-width: 65ch;
  font-size: 1.125rem;
}

/* Three-up on desktop, one column on narrow screens. min-width:0 on the item
   keeps long unbroken words from forcing the grid wider than the viewport. */
.konsultasi-sesi {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.konsultasi-sesi-item {
  min-width: 0;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
}

.konsultasi-sesi-item h3 {
  margin-top: 0;
}

.konsultasi-sesi-q {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--meta-color);
}

.konsultasi-fakta {
  max-width: 65ch;
}

.konsultasi-fakta li {
  margin-bottom: 0.75rem;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test test/konsultasi.test.js`

Expected: PASS, 3 tests.

- [ ] **Step 6: Build and view the page**

Run: `pnpm run build`

Expected: build succeeds. Confirm `dist/konsultasi/index.html` exists and contains `data-pagefind-body`:

```bash
grep -c 'data-pagefind-body' dist/konsultasi/index.html
```

Expected: `1`.

- [ ] **Step 7: Run the formatter and full check**

Run: `pnpm run format:fix && pnpm run check`

Expected: PASS. `pnpm run check` is Biome plus the full unit test suite.

- [ ] **Step 8: Commit**

```bash
git add src/konsultasi.njk assets/konsultasi.css test/konsultasi.test.js
git commit -m "feat(konsultasi): add the consultation page and its stylesheet"
```

---

### Task 2: Brief form and thank-you page

Adds the Netlify form and its success target. Deliverable: a visitor can submit a brief and land on a page that tells them what happens next.

**Files:**
- Modify: `src/konsultasi.njk` — insert the form section and FAQ before `</main>`
- Create: `src/konsultasi-terima-kasih.njk`
- Modify: `assets/konsultasi.css` — append form styles
- Test: `test/konsultasi.test.js` — append three tests

**Interfaces:**
- Consumes: the `brief` anchor id and `konsultasi-` class prefix from Task 1; the global `.button` class.
- Produces: a Netlify form named `konsultasi-brief` posting to `/konsultasi/terima-kasih/`, with fields `nama`, `email`, `perusahaan`, `tim`, `situasi`, `sesi`, `budget`, `kapan`.

- [ ] **Step 1: Write the failing tests**

Append to `test/konsultasi.test.js`:

```javascript
/* Netlify pairs a submission to a form by the hidden form-name input, not by the
 * form element's name attribute. When the two disagree it drops the submission
 * silently - manufacturing exactly the "nobody wants this" false negative that
 * this page exists to rule out. */
test("the hidden form-name input matches the form's name attribute", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  const formName = source.match(/<form[^>]*\sname="([^"]+)"/)?.[1];
  const hidden = source.match(/name="form-name"[^>]*value="([^"]+)"/)?.[1];
  assert.ok(formName, "no <form name=...> found");
  assert.ok(hidden, "no hidden form-name input found");
  assert.equal(hidden, formName);
});

/* audit-site.mjs checks <a href> links but not <form action>, so a lead who
 * converts and then hits a 404 is a gap nothing else catches. */
test("the form action points at a page that is actually built", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  const action = source.match(/<form[^>]*\saction="([^"]+)"/)?.[1];
  assert.ok(action, "no <form action=...> found");

  const target = readFileSync("src/konsultasi-terima-kasih.njk", "utf8");
  const frontmatter = target.split("---")[1] ?? "";
  assert.match(frontmatter, new RegExp(`^permalink: ${action}$`, "m"));
});

/* A required budget select with no escape hatch is a known conversion killer,
 * and making the field optional loses the willingness-to-pay signal entirely.
 * "Belum tahu" is the deliberate compromise; this guards it from a later edit. */
test("the budget select keeps its Belum tahu option", () => {
  const source = readFileSync("src/konsultasi.njk", "utf8");
  const select = source.match(/<select[^>]*\sname="budget"[\s\S]*?<\/select>/)?.[0];
  assert.ok(select, "no budget select found");
  assert.match(select, /Belum tahu/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/konsultasi.test.js`

Expected: FAIL — the first new test fails with "no `<form name=...>` found", and the second fails with `ENOENT ... src/konsultasi-terima-kasih.njk`.

- [ ] **Step 3: Add the form and FAQ to the page**

In `src/konsultasi.njk`, insert immediately before the closing `</main>` tag:

```njk
  <h2 id="brief">Ajukan brief</h2>

  <p>
    Isi sebentar, dan saya balas dalam 1x24 jam kerja dengan angka dan usulan bentuk sesi.
    Belum tentu cocok, dan itu tidak apa-apa - kalau menurut saya kamu tidak butuh sesi ini,
    saya bilang di balasan yang sama.
  </p>

  <form
    class="konsultasi-form"
    name="konsultasi-brief"
    method="POST"
    action="/konsultasi/terima-kasih/"
    data-netlify="true"
    netlify-honeypot="bot-field"
  >
    <input type="hidden" name="form-name" value="konsultasi-brief" />
    <input type="hidden" name="subject" value="Brief konsultasi - rizafahmi.com" />
    <p hidden aria-hidden="true">
      <label>Jangan diisi kalau kamu manusia: <input name="bot-field" /></label>
    </p>

    <p>
      <label for="nama">Nama</label>
      <input type="text" id="nama" name="nama" autocomplete="name" />
    </p>

    <p>
      <label for="email">Email <span class="konsultasi-wajib">wajib</span></label>
      <input type="email" id="email" name="email" required autocomplete="email" />
    </p>

    <p>
      <label for="perusahaan">Perusahaan</label>
      <input type="text" id="perusahaan" name="perusahaan" autocomplete="organization" />
    </p>

    <p>
      <label for="tim">Ukuran tim engineering</label>
      <select id="tim" name="tim" required>
        <option value="">Pilih salah satu</option>
        <option value="&lt;5">Di bawah 5 orang</option>
        <option value="5-15">5-15 orang</option>
        <option value="16-50">16-50 orang</option>
        <option value="&gt;50">Di atas 50 orang</option>
      </select>
    </p>

    <p>
      <label for="situasi">Apa yang sedang kamu hadapi? <span class="konsultasi-wajib">wajib</span></label>
      <textarea id="situasi" name="situasi" rows="6" required></textarea>
      <span class="konsultasi-bantuan">
        Makin spesifik makin berguna. Contoh: sudah pakai tool apa, sejak kapan, dan apa
        yang bikin kamu ragu hasilnya.
      </span>
    </p>

    <p>
      <label for="sesi">Bentuk sesi yang dicari</label>
      <select id="sesi" name="sesi" required>
        <option value="">Pilih salah satu</option>
        <option value="arah">Arah - belum tahu mulai dari mana</option>
        <option value="pendapat-kedua">Pendapat kedua - rencana sudah ada</option>
        <option value="review">Review cara kerja tim</option>
        <option value="belum-tahu">Belum tahu, bantu pilihkan</option>
      </select>
    </p>

    <p>
      <label for="budget">Perkiraan budget untuk satu sesi</label>
      <select id="budget" name="budget" required>
        <option value="">Pilih salah satu</option>
        <option value="&lt;2jt">Di bawah Rp2 juta</option>
        <option value="2-5jt">Rp2-5 juta</option>
        <option value="5-10jt">Rp5-10 juta</option>
        <option value="&gt;10jt">Di atas Rp10 juta</option>
        <option value="belum-tahu">Belum tahu</option>
      </select>
      <span class="konsultasi-bantuan">
        Tidak mengikat, dan &ldquo;belum tahu&rdquo; jawaban yang sah. Ini cuma supaya saya
        tidak mengusulkan bentuk sesi yang jauh dari perkiraanmu.
      </span>
    </p>

    <p>
      <label for="kapan">Kapan butuhnya</label>
      <select id="kapan" name="kapan" required>
        <option value="">Pilih salah satu</option>
        <option value="minggu-ini">Minggu ini</option>
        <option value="bulan-ini">Bulan ini</option>
        <option value="riset">Masih riset</option>
      </select>
    </p>

    <p><button type="submit" class="button">Kirim brief</button></p>
  </form>

  <p class="konsultasi-bantuan">
    Data ini cuma dipakai untuk membalas brief kamu. Tanpa newsletter, tanpa diteruskan
    ke siapa pun.
  </p>

  <h2>Pertanyaan yang sering muncul</h2>

  <h3>Berapa harganya?</h3>
  <p>
    Per kasus, dan angkanya saya kirim setelah baca brief kamu - dalam 1x24 jam kerja.
    Belum ada harga yang dipajang karena layanan ini baru, dan memasang angka sebelum
    satu sesi pun terjadi cuma jadi tebakan yang susah dikoreksi belakangan.
  </p>

  <h3>Apa yang tidak termasuk?</h3>
  <p>
    Saya tidak mengerjakan implementasinya untuk kamu, dan belum ada paket retainer
    bulanan. Ini sesi sekali duduk. Kalau ternyata yang kamu butuhkan pendampingan
    jangka panjang, saya bilang - dan itu obrolan terpisah.
  </p>

  <h3>Online atau harus ketemu?</h3>
  <p>
    Online, bahasa Indonesia. Kalau timmu di Jakarta dan lebih enak ketemu langsung,
    tulis di brief.
  </p>

  <h3>Kalau ternyata kamu bukan orang yang tepat?</h3>
  <p>
    Saya bilang di balasan brief, sebelum ada uang berpindah. Kalau saya kenal orang yang
    lebih cocok, saya rujuk.
  </p>

  <h3>Perlu menyiapkan apa sebelum sesi?</h3>
  <p>
    Untuk Arah dan Pendapat kedua: tidak ada, cukup brief yang jujur. Untuk Review cara
    kerja: akses baca ke repo yang mau dilihat, plus contoh dua-tiga PR terakhir yang
    prosesnya terasa berat.
  </p>
```

- [ ] **Step 4: Create the thank-you page**

Create `src/konsultasi-terima-kasih.njk`:

```njk
---
layout: main
title: Brief konsultasi terkirim
permalink: /konsultasi/terima-kasih/
pageCss: konsultasi.css
description: Konfirmasi bahwa brief konsultasi sudah masuk.
eleventyExcludeFromCollections: true
---

<main id="main-content" class="container konsultasi-page prose">
  <h1>Brief kamu masuk</h1>

  <p class="konsultasi-lede">
    Saya balas dalam 1x24 jam kerja lewat email, dengan angka dan usulan bentuk sesi
    yang paling masuk akal untuk situasi kamu.
  </p>

  <p>
    Kalau menurut saya kamu belum butuh sesi ini, saya bilang juga - lengkap dengan
    alasannya. Sementara menunggu, tulisan gratisnya ada di
    <a href="/topik/agentic-coding/">topik agentic coding</a>.
  </p>

  <p><a class="button" href="/">Kembali ke beranda</a></p>
</main>
```

Note: `eleventyExcludeFromCollections: true` keeps a bare confirmation page out of listings and feeds. It still builds to `dist/konsultasi/terima-kasih/index.html`, which is what the form action needs. It is deliberately **not** added to `src/sitemap.njk` — that file uses a hand-maintained `staticPages` list, and a thank-you page has no business in search results.

- [ ] **Step 5: Append the form styles**

Append to `assets/konsultasi.css`:

```css
/* Form fields get real rules here rather than inline style attributes.
   Square corners and 2px borders per DESIGN.md; the focus outline is thick
   and high-visibility per the accessibility rules in PRODUCT.md. */
.konsultasi-form {
  max-width: 34rem;
}

.konsultasi-form label {
  display: block;
  margin-bottom: 0.375rem;
  font-weight: 700;
}

.konsultasi-form input,
.konsultasi-form select,
.konsultasi-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 0;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 1rem;
}

.konsultasi-form textarea {
  resize: vertical;
}

.konsultasi-form input:focus-visible,
.konsultasi-form select:focus-visible,
.konsultasi-form textarea:focus-visible {
  outline: 3px solid var(--accent-cobalt);
  outline-offset: 2px;
}

.konsultasi-wajib {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 400;
  text-transform: uppercase;
  color: var(--meta-color);
}

.konsultasi-bantuan {
  display: block;
  margin-top: 0.375rem;
  max-width: 65ch;
  font-size: 0.875rem;
  color: var(--meta-color);
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node --test test/konsultasi.test.js`

Expected: PASS, 6 tests.

- [ ] **Step 7: Build and verify the form survives rendering**

Run: `pnpm run build`

Then confirm Netlify will see a complete form in the deployed HTML:

```bash
grep -o 'name="form-name" value="[^"]*"' dist/konsultasi/index.html
grep -c 'data-netlify' dist/konsultasi/index.html
test -f dist/konsultasi/terima-kasih/index.html && echo "thank-you page built"
```

Expected: `name="form-name" value="konsultasi-brief"`, then `1`, then `thank-you page built`.

- [ ] **Step 8: Run the formatter and full check**

Run: `pnpm run format:fix && pnpm run check`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/konsultasi.njk src/konsultasi-terima-kasih.njk assets/konsultasi.css test/konsultasi.test.js
git commit -m "feat(konsultasi): add the brief form and its thank-you page"
```

---

### Task 3: Navigation, homepage section, and audit guard

Wires the page into both site chromes and makes the homepage link permanent. This lands as one unit: adding `/konsultasi` to the audit list before the homepage anchor exists fails the build.

**Files:**
- Modify: `src/_includes/main.njk:24-30` — hero nav
- Modify: `src/index.njk:198-201` — insert a section between `highlight-section` and `kontak-section`
- Modify: `assets/home.css` — styles for the new homepage section
- Modify: `src/sitemap.njk` — add `/konsultasi/` to `staticPages`
- Modify: `scripts/audit-site.mjs:130` — homepage-reachability list
- Test: `test/konsultasi.test.js` — append two tests

**Interfaces:**
- Consumes: the built page at `/konsultasi/` from Tasks 1 and 2.
- Produces: an anchor to `/konsultasi/` in `src/_includes/main.njk` and in the built `dist/index.html`.

- [ ] **Step 1: Write the failing tests**

Append to `test/konsultasi.test.js` — note the added `existsSync` import at the top of the file:

```javascript
/* This site has several separate page chromes, each owning its own <head> and
 * nav. /tips shipped in #186 with a nav link that rendered on /articles and
 * /tags but was absent from the homepage, which does not use main.njk.
 * test/tips-nav.test.js documents that history. */
test("the shared chrome nav links to /konsultasi/", () => {
  const source = readFileSync("src/_includes/main.njk", "utf8");
  assert.match(source, /<a href="\/konsultasi\/">/);
});

/* Source templates can lie about what renders; dist/ cannot. The homepage is
 * standalone, so it needs its own link - here a body section rather than a
 * ninth nav item. */
test("the built homepage really renders an anchor to /konsultasi/", {
  skip: !existsSync("dist/index.html") && "no dist/ - run pnpm run build",
}, () => {
  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /<a href="\/konsultasi\/"/);
});
```

Change the import line at the top of `test/konsultasi.test.js` from:

```javascript
import { readFileSync } from "node:fs";
```

to:

```javascript
import { existsSync, readFileSync } from "node:fs";
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/konsultasi.test.js`

Expected: FAIL on the nav test. The `dist/` test either fails (if a build from Task 2 is present) or reports as skipped — both are acceptable at this step.

- [ ] **Step 3: Add the nav link to the shared chrome**

In `src/_includes/main.njk`, change the nav block:

```njk
        <nav class="hero-nav" style="margin-left: .25rem;">
          <a href="/articles">Catatan</a>
          <a href="/tips/">Tips</a>
          <a href="/tags">Topik</a>
          <a href="/kerjasama/">Kerjasama</a>
          <a href="/search">Cari</a>
        </nav>
```

to:

```njk
        <nav class="hero-nav" style="margin-left: .25rem;">
          <a href="/articles">Catatan</a>
          <a href="/tips/">Tips</a>
          <a href="/tags">Topik</a>
          <a href="/konsultasi/">Konsultasi</a>
          <a href="/kerjasama/">Kerjasama</a>
          <a href="/search">Cari</a>
        </nav>
```

- [ ] **Step 4: Add the homepage section**

The homepage does not use `main.njk` — it is standalone with its own hero nav, which already carries eight entries. A ninth sitting beside the visually similar "Kerjasama" would degrade the whole nav, so the homepage gets a body section instead, matching how `#karya` and `#kontak` already work.

In `src/index.njk`, insert between the closing `</section>` of `highlight-section` (line 198) and the `<!-- Kontak Section -->` comment (line 200):

```njk
    <section class="konsultasi-section" id="konsultasi">
      <h2>KONSULTASI</h2>
      <p>
        Tim kamu sudah pakai AI coding tool, tapi belum yakin hasilnya lebih baik?
        Saya buka sesi konsultasi sekali duduk untuk engineering lead dan CTO tim 5-50 orang.
      </p>
      <p><a class="button" href="/konsultasi/">Lihat detail konsultasi</a></p>
    </section>
```

- [ ] **Step 5: Style the homepage section**

Append to `assets/home.css`:

```css
/* Homepage consultation block. The heading treatment is copied from
   .highlight-section h2 so the homepage rhythm stays even: Unbounded 800,
   uppercase, letter-spaced, with the 3px underline the other sections use.
   Sections here separate with margin and that heading rule, not a border-top. */
.konsultasi-section {
  margin-top: 4rem;
  margin-bottom: 4rem;
}

.konsultasi-section h2 {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--heading-color);
  border-bottom: 3px solid var(--border-color);
  padding-bottom: 0.75rem;
  margin-bottom: 2rem;
}

.konsultasi-section p {
  max-width: 65ch;
}
```

All four custom properties used here are defined in `assets/global.css` and have dark-mode
values: `--font-display` (Unbounded 800, already in the five-face budget — no new font is
introduced), `--heading-color`, and `--border-color`.

- [ ] **Step 6: Add the page to the sitemap**

`src/sitemap.njk` uses a hand-maintained `staticPages` list, so a new page is absent from
the sitemap until it is added by hand. Add `"/konsultasi/"` to that array, after `"/tips/"`:

```njk
    "/showcase/",
    "/tips/",
    "/konsultasi/",
    "/cv/",
```

Do **not** add `/konsultasi/terima-kasih/`. The audit asserts that every sitemap URL has a
generated page, not the reverse, so omitting the thank-you page is safe — and a confirmation
page does not belong in search results.

- [ ] **Step 7: Add the audit guard**

In `scripts/audit-site.mjs`, in `assertHomepageReachesSections()`, change:

```javascript
  for (const section of ["/articles", "/tags", "/topik", "/tips", "/showcase", "/search"]) {
```

to:

```javascript
  for (const section of [
    "/articles",
    "/tags",
    "/topik",
    "/tips",
    "/showcase",
    "/search",
    "/konsultasi",
  ]) {
```

- [ ] **Step 8: Build, then run the tests**

Run: `pnpm run build && node --test test/konsultasi.test.js`

Expected: build succeeds (the audit now checks `/konsultasi` and finds it), then PASS, 8 tests with none skipped.

- [ ] **Step 9: Verify the nav renders on a page that uses the shared chrome**

```bash
grep -c '<a href="/konsultasi/"' dist/articles/index.html dist/index.html
```

Expected: `1` or more for each file.

- [ ] **Step 10: Run the formatter and full check**

Run: `pnpm run format:fix && pnpm run check`

Expected: PASS. This runs the whole suite, including `test/tips-nav.test.js`, which must stay green — the nav edit touches a file it asserts against.

- [ ] **Step 11: Commit**

```bash
git add src/_includes/main.njk src/index.njk assets/home.css scripts/audit-site.mjs test/konsultasi.test.js
git commit -m "feat(konsultasi): link the consultation page from both site navs"
```

---

## After the code: the two steps that decide whether this worked

Neither is a code change, and the spec treats both as part of shipping.

- [ ] **Enable Netlify form notifications.** `Project configuration → Notifications → Emails and webhooks → Form submission notifications`. Add an email notification for the `konsultasi-brief` form. Mail arrives from `formresponses@netlify.com`, and because the form has a field named `email`, replies go straight to the sender.

- [ ] **Submit the form once on the live site, confirm the email arrives, then delete the test submission.** Without this, a "zero briefs" result is uninterpretable and could kill an offer whose only defect was a broken pipe. Notifications fire only for *verified* submissions, so also check the Forms dashboard's spam bucket weekly while volume is low.

- [ ] **Send it.** Within one week of deploy: twenty named engineering leads, messaged directly with the link. The spec's Distribution section is explicit that the page is not the experiment — sending it is. A page with no traffic producing no leads teaches nothing, and sixty days of silence would look like an answer without being one.

## Self-Review

**Spec coverage.** Page structure items 1–7 → Tasks 1 and 2. Brief form table and both deliberate decisions → Task 2. Thank-you page → Task 2. Notifications and verification → the post-code checklist. Implementation file table → Tasks 1–3. Testing items 1–5 → Task 1 (pagefind), Task 2 (form-name, form action, budget option), Task 3 (both nav assertions). Performance → Global Constraints, no new face and no JS. Success criteria and Distribution → the post-code checklist. Non-goals → Global Constraints.

**Two spec requirements deliberately not given their own task:** the "no prices" and "no logos" non-goals are constraints on content rather than work items, and they are enforced by the copy in Task 1 plus the Global Constraints block. The "no `/kelas/` reference" non-goal *is* tested, in Task 1 Step 1, because it is the one a well-meaning editor is most likely to violate later.

**Type and name consistency.** `konsultasi-brief` is the form name in the `<form>` element, the hidden `form-name` value, and the Netlify dashboard reference in the post-code checklist. The `email` field name is spelled the same in the form and in the notification note that depends on it. The `konsultasi-` class prefix is used consistently; `konsultasi-section` on the homepage is the one class that lives in `home.css` rather than `konsultasi.css`, because the homepage does not load `pageCss`. Task 1 declares the `brief` anchor id that Task 1's CTA links to and Task 2's heading provides — the CTA therefore dangles between Task 1 and Task 2, which is intentional and closed by Task 2 Step 3.

**Two errors caught by the self-review and fixed inline, worth naming so they are not reintroduced:**

1. The homepage section originally specified `border-top: 2px` with a bare `font-family` heading. That is the `/kerjasama/` *page* idiom, not the homepage idiom — `assets/home.css` separates sections with margin plus a heading that carries its own `border-bottom: 3px`. Corrected to match `.highlight-section`, its immediate neighbour.
2. `src/sitemap.njk` uses a hand-maintained `staticPages` array, not a collection, so the page would have shipped absent from the sitemap. The plan originally claimed the opposite. Task 3 Step 6 now adds it; the thank-you page is deliberately left out.

Both came from reading the files rather than trusting the pattern the sibling page used. The audit would not have caught either one: it asserts that sitemap URLs have pages, not that pages have sitemap URLs, and it has no opinion about CSS.

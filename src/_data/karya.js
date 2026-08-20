/**
 * DAFTAR OPEN SOURCE — isi bagian "Open Source" di halaman /showcase (Karya)
 * ==========================================================================
 *
 * File ini murni daftar, tidak ada logika apa pun. Cukup edit isinya lalu
 * jalankan `npm run build` (atau `npm start`), halaman Karya langsung ikut.
 *
 * CARA MENAMBAH PROYEK
 *   Salin satu blok `{ ... }` di bawah, tempel di posisi yang diinginkan,
 *   lalu ganti isinya. Jangan lupa koma di akhir blok.
 *
 * CARA MENGHAPUS PROYEK
 *   Hapus seluruh blok `{ ... }` milik proyek itu.
 *
 * CARA MENGATUR URUTAN
 *   Urutan kartu di halaman = urutan tulis di file ini, dari atas ke bawah.
 *   Pindahkan blok ke atas kalau ingin proyeknya tampil lebih dulu.
 *
 * ISI SATU BLOK
 *   name        (wajib) Nama proyek. Tampil sebagai judul kartu, sekaligus
 *               tautan ke repo GitHub-nya.
 *   description (wajib) Satu kalimat bahasa Indonesia. Ringkas saja.
 *   repo        (wajib) Tautan lengkap ke repo GitHub, diawali https://
 *   url         (opsional) Tautan tempat proyeknya bisa langsung dipakai atau
 *               dicoba — misal https://workspresso.app. Tampil sebagai tautan
 *               kedua di kartu, terpisah dari tautan kode. Kalau proyeknya
 *               memang tidak punya (CLI, materi workshop, dsb.), hapus saja
 *               barisnya — tidak akan ada tautan kosong di halaman.
 *   tags        (opsional) Daftar teknologi, contoh: ["Elixir", "SQLite"]
 *
 * Bagian "Lainnya" di halaman Karya tidak diatur dari sini; itu masih ditulis
 * tangan langsung di src/showcase.njk.
 */
export default [
  {
    name: "slopcase",
    description: "Showcase untuk proyek AI-generated: submit & voting, “slop atau bukan?”",
    repo: "https://github.com/rizafahmi/slopcase",
    // TODO(riza): isi `url` kalau slopcase sudah bisa diakses online.
    tags: ["Elixir", "Phoenix LiveView", "SQLite"],
  },
  {
    name: "mbb",
    description: "CLI assistant sederhana untuk prompt tools & agentic loop di terminal.",
    repo: "https://github.com/rizafahmi/mbb",
    // TODO(riza): isi `url` kalau mbb punya halaman/dokumentasi yang bisa dibuka.
    tags: ["Elixir", "CLI", "Anthropic"],
  },
  {
    name: "gemini-for-web-dev",
    description: "Contoh app Gemini API untuk kebutuhan web developer (#geminisprint).",
    repo: "https://github.com/rizafahmi/gemini-for-web-dev",
    // TODO(riza): isi `url` kalau demo app-nya sudah di-deploy.
    tags: ["Node.js", "Gemini API", "Turso"],
  },
  {
    name: "workspresso",
    description: "Cari coffee shop yang work-friendly, dengan data Wi‑Fi, colokan, noise, dll.",
    repo: "https://github.com/rizafahmi/workspresso",
    // TODO(riza): isi `url` kalau workspresso sudah online.
    tags: ["Astro", "Node.js", "SQLite"],
  },
  {
    name: "ai-workshop-material",
    description: "Materi workshop AI (DevFest GDG Jogja 2025): skenario AI di luar chatbot.",
    repo: "https://github.com/rizafahmi/ai-workshop-material",
    // TODO(riza): isi `url` kalau materinya dipublikasikan di web.
    tags: ["Workshop", "JavaScript", "LLM"],
  },
];

/**
 * DAFTAR OPEN SOURCE — isi bagian "Open Source" di halaman /showcase (Karya)
 * ==========================================================================
 *
 * File ini murni daftar, tidak ada logika apa pun. Cukup edit isinya lalu
 * jalankan `pnpm run build` (atau `pnpm start`): kartu Open Source di halaman
 * Karya, plus entri proyek di `/llms.txt` dan `/llms-full.txt`, ikut berubah.
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
    tags: ["Elixir", "Phoenix LiveView", "SQLite"],
  },
  {
    name: "mbb",
    description: "CLI assistant sederhana untuk prompt tools & agentic loop di terminal.",
    repo: "https://github.com/rizafahmi/mbb",
    tags: ["Elixir", "CLI", "Anthropic"],
  },
  {
    name: "gemini-for-web-dev",
    description: "Contoh app Gemini API untuk kebutuhan web developer (#geminisprint).",
    repo: "https://github.com/rizafahmi/gemini-for-web-dev",
    tags: ["Node.js", "Gemini API", "Turso"],
  },
  {
    name: "workspresso",
    description: "Cari coffee shop yang work-friendly, dengan data Wi‑Fi, colokan, noise, dll.",
    repo: "https://github.com/rizafahmi/workspresso",
    tags: ["Astro", "Node.js", "SQLite"],
  },
  {
    name: "ai-workshop-material",
    description: "Materi workshop AI (DevFest GDG Jogja 2025): skenario AI di luar chatbot.",
    repo: "https://github.com/rizafahmi/ai-workshop-material",
    url: "https://workshop.rizafahmi.com",
    tags: ["Workshop", "JavaScript", "LLM"],
  },
  {
    name: "makan-dimana",
    description: "Voting bareng buat nentuin “mau makan di mana?”, dibangun local-first.",
    repo: "https://github.com/rizafahmi/makan-dimana",
    url: "https://vote.rizafahmi.com",
    tags: ["Astro", "TypeScript", "Local-first"],
  },
  {
    name: "Ngobrolin Web",
    description: "Landing page podcast Ngobrolin Web: daftar episode dan tautan dengarnya.",
    repo: "https://github.com/ngobrolin/landing",
    url: "https://ngobrol.in",
    tags: ["Astro", "TypeScript", "Podcast"],
  },
  {
    name: "notable",
    description: "Kotak masukan & tip QRIS buat streamer, lengkap dengan overlay alert untuk OBS.",
    repo: "https://github.com/rizafahmi/notable",
    url: "https://feedback.rizafahmi.com",
    tags: ["Elixir", "Phoenix LiveView", "SQLite"],
  },
  {
    name: "samarin",
    description:
      "Samarkan NIK, NPWP, dan data pribadi lain sebelum ditempel ke ChatGPT atau Claude.",
    repo: "https://github.com/rizafahmi/samarin",
    url: "https://samarin.rizafahmi.com",
    tags: ["Astro", "TypeScript", "Local-first"],
  },
  {
    name: "clawdex",
    description:
      "Gateway asisten AI pribadi di atas BEAM: ngobrol lewat Telegram, riwayat aman di SQLite.",
    repo: "https://github.com/rizafahmi/clawdex",
    tags: ["Elixir", "OTP", "Telegram"],
  },
  {
    name: "evalcode",
    description:
      "Contoh utuh bikin eval coding sendiri, dinilai pakai test yang belum pernah dilihat model.",
    repo: "https://github.com/rizafahmi/evalcode",
    tags: ["Elixir", "Bash", "LLM Eval"],
  },
  {
    name: "maal",
    description: "Kalkulator zakat maal dengan harga emas real-time sebagai acuan nisab.",
    repo: "https://github.com/rizafahmi/maal",
    url: "https://maal.rizafahmi.com",
    tags: ["Astro", "TypeScript", "Zakat"],
  },
];

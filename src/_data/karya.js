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
 *   quickstart  (opsional) Perintah CLI <30 detik untuk klon/jalankan proyek.
 *   proof       (opsional) Bukti teknis/arsitektur yang bisa diverifikasi di repo.
 *   relatedArticle      (opsional) Path internal ke catatan terkait (/catatan/.../).
 *   relatedArticleTitle (opsional) Judul catatan terkait.
 *   relatedPrompt       (opsional) Path internal ke prompt/skill terkait (/prompts/.../).
 *   relatedPromptTitle  (opsional) Judul prompt/skill terkait.
 *
 * Bagian "Lainnya" di halaman Karya tidak diatur dari sini; itu masih ditulis
 * tangan langsung di src/showcase.njk.
 */
export default [
  {
    name: "elixir_canvas",
    description:
      "Kanvas pemikiran spasial local-file-first di mana berkas JSON lokal adalah dokumen utamanya, tanpa database.",
    repo: "https://github.com/rizafahmi/elixir_canvas",
    tags: ["Elixir", "Phoenix LiveView", "Local-first"],
    proof:
      "Editor kanvas spasial tanpa database atau langkah npm: berkas JSON lokal diedit langsung via Phoenix LiveView + Hakushi",
    quickstart:
      "git clone https://github.com/rizafahmi/elixir_canvas && cd elixir_canvas && mix setup && mix phx.server",
    relatedArticle: "/catatan/prototipe-dengan-phoenix/",
    relatedArticleTitle: "Membangun Prototipe Aplikasi dengan Elixir Phoenix",
    relatedPrompt: "/prompts/blueprint-dan-prompt-bertahap/",
    relatedPromptTitle: "Blueprint & Prompt Bertahap",
  },
  {
    name: "eval_leaderboard",
    description:
      "Papan peringkat pengujian coding agent & LLM dalam membangun aplikasi CLI sederhana",
    repo: "https://github.com/rizafahmi/eval_leaderboard",
    url: "https://eval.rizafahmi.com",
    tags: ["Astro", "TypeScript", "LLM Eval"],
    proof:
      "Evaluasi 7 tahap rekayasa CLI Elixir/OTP terukur (penyelesaian rencana, rasio tes lulus, efisiensi token, durasi, & biaya riil)",
    quickstart:
      "git clone https://github.com/rizafahmi/eval_leaderboard && cd eval_leaderboard && pnpm install && pnpm run dev",
    relatedArticle: "/catatan/agentic-coding/",
    relatedArticleTitle: "Fondasi Agentic Coding - Apa itu Agent?",
    relatedPrompt: "/prompts/review-kode-konseptual-dan-kompleksitas/",
    relatedPromptTitle: "Review Kompleksitas Kode",
  },
  {
    name: "pi-jev-task-router",
    description:
      "Extension Pi: klasifikasi prompt dengan Jev (TypeSafe System One) lalu ganti model per turn.",
    repo: "https://github.com/rizafahmi/pi-jev-task-router",
    tags: ["TypeScript", "Pi", "Jev"],
    proof:
      "Router deterministik per-turn di atas Pi coding agent dengan skema klasifikasi TypeSafe",
    quickstart:
      "git clone https://github.com/rizafahmi/pi-jev-task-router && cd pi-jev-task-router && npm install",
    relatedArticle: "/catatan/agentic-coding/",
    relatedArticleTitle: "Fondasi Agentic Coding - Apa itu Agent?",
    relatedPrompt: "/prompts/agent-coordinator-dan-delegasi-sub-agent/",
    relatedPromptTitle: "Koordinator & Sub-Agent",
  },
  {
    name: "slopcase",
    description: "Showcase untuk proyek AI-generated: submit & voting, “slop atau bukan?”",
    repo: "https://github.com/rizafahmi/slopcase",
    tags: ["Elixir", "Phoenix LiveView", "SQLite"],
    proof: "Real-time voting & kurasi proyek AI dengan Phoenix LiveView + Ecto SQLite3",
    quickstart:
      "git clone https://github.com/rizafahmi/slopcase && cd slopcase && mix setup && mix phx.server",
    relatedArticle: "/catatan/prototipe-dengan-phoenix/",
    relatedArticleTitle: "Membangun Prototipe Aplikasi dengan Elixir Phoenix",
    relatedPrompt: "/prompts/wawancara-spesifikasi-bertahap/",
    relatedPromptTitle: "Wawancara Spesifikasi",
  },
  {
    name: "mbb",
    description: "CLI assistant sederhana untuk prompt tools & agentic loop di terminal.",
    repo: "https://github.com/rizafahmi/mbb",
    tags: ["Elixir", "CLI", "Anthropic"],
    proof:
      "Implementasi utuh agentic loop + tool calling di atas Elixir escript tanpa framework berat",
    quickstart:
      "git clone https://github.com/rizafahmi/mbb && cd mbb && mix deps.get && mix escript.build",
    relatedArticle: "/catatan/agentic-coding-bag-3/",
    relatedArticleTitle: "Memberi LLM Akses - Tool Calling",
    relatedPrompt: "/prompts/teknik-menghindari-brainrot/",
    relatedPromptTitle: "Teknik Menghindari Brainrot",
  },
  {
    name: "gemini-for-web-dev",
    description: "Contoh app Gemini API untuk kebutuhan web developer (#geminisprint).",
    repo: "https://github.com/rizafahmi/gemini-for-web-dev",
    tags: ["Node.js", "Gemini API", "Turso"],
    proof: "Integrasi multimodal Gemini API dengan penyimpanan edge SQLite (Turso)",
    quickstart:
      "git clone https://github.com/rizafahmi/gemini-for-web-dev && cd gemini-for-web-dev && npm install",
    relatedArticle: "/gemini-web-dev/",
    relatedArticleTitle: "Gemini API untuk Web Developer",
    relatedPrompt: "/prompts/generator-teks-ke-gambar/",
    relatedPromptTitle: "Generator Teks ke Gambar",
  },
  {
    name: "workspresso",
    description: "Cari coffee shop yang work-friendly, dengan data Wi‑Fi, colokan, noise, dll.",
    repo: "https://github.com/rizafahmi/workspresso",
    tags: ["Astro", "Node.js", "SQLite"],
    proof:
      "Direktori terindeks cepat untuk developer remote dengan metrik Wi-Fi, colokan, & akustik",
    quickstart:
      "git clone https://github.com/rizafahmi/workspresso && cd workspresso && npm install && npm run dev",
    relatedArticle: "/tampilan-web/",
    relatedArticleTitle: "Membangun Tampilan Web dengan HTML, CSS & JS",
    relatedPrompt: "/prompts/rapikan-readme-tanpa-mengarang/",
    relatedPromptTitle: "Rapikan README",
  },
  {
    name: "ai-workshop-material",
    description: "Materi workshop AI (DevFest GDG Jogja 2025): skenario AI di luar chatbot.",
    repo: "https://github.com/rizafahmi/ai-workshop-material",
    url: "https://workshop.rizafahmi.com",
    tags: ["Workshop", "JavaScript", "LLM"],
    proof: "Modul hands-on pola integrasi LLM terstruktur di luar antarmuka chat biasa",
    quickstart:
      "git clone https://github.com/rizafahmi/ai-workshop-material && cd ai-workshop-material && npm install",
    relatedArticle: "/catatan/asisten-ngoding/",
    relatedArticleTitle: "Produktif dengan Asisten Ngoding",
    relatedPrompt: "/prompts/kerangka-prompt-ptr-q/",
    relatedPromptTitle: "Kerangka P-T-R | Q",
  },
  {
    name: "makan-dimana",
    description: "Voting bareng buat nentuin “mau makan di mana?”, dibangun local-first.",
    repo: "https://github.com/rizafahmi/makan-dimana",
    url: "https://vote.rizafahmi.com",
    tags: ["Astro", "TypeScript", "Local-first"],
    proof: "Sinkronisasi state voting grup dengan arsitektur local-first di browser",
    quickstart:
      "git clone https://github.com/rizafahmi/makan-dimana && cd makan-dimana && npm install && npm run dev",
    relatedArticle: "/catatan/asisten-ngoding-4/",
    relatedArticleTitle: "Desain Antarmuka dengan Asisten Ngoding",
    relatedPrompt: "/prompts/rencana-dari-catatan-diskusi/",
    relatedPromptTitle: "Rencana dari Diskusi",
  },
  {
    name: "Ngobrolin Web",
    description: "Landing page podcast Ngobrolin Web: daftar episode dan tautan dengarnya.",
    repo: "https://github.com/ngobrolin/landing",
    url: "https://ngobrol.in",
    tags: ["Astro", "TypeScript", "Podcast"],
    proof:
      "Situs statis berkinerja tinggi untuk katalog lintas musim podcast komunitas web Indonesia",
    quickstart:
      "git clone https://github.com/ngobrolin/landing && cd landing && npm install && npm run dev",
    relatedArticle: "/2020/02/03/ekosistemjs/",
    relatedArticleTitle: "Ekosistem JavaScript Di Indonesia",
    relatedPrompt: "/prompts/periksa-performa-halaman-web/",
    relatedPromptTitle: "Audit Performa Web",
  },
  {
    name: "notable",
    description: "Kotak masukan & tip QRIS buat streamer, lengkap dengan overlay alert untuk OBS.",
    repo: "https://github.com/rizafahmi/notable",
    url: "https://feedback.rizafahmi.com",
    tags: ["Elixir", "Phoenix LiveView", "SQLite"],
    proof: "PubSub real-time dari form penonton langsung ke browser source OBS tanpa reload",
    quickstart:
      "git clone https://github.com/rizafahmi/notable && cd notable && mix setup && mix phx.server",
    relatedArticle: "/catatan/asisten-ngoding-2/",
    relatedArticleTitle: "Diskusi dan Menulis Spesifikasi dengan AI",
    relatedPrompt: "/prompts/kompilasi-diskusi-jadi-spesifikasi/",
    relatedPromptTitle: "Kompilasi Spesifikasi",
  },
  {
    name: "samarin",
    description:
      "Samarkan NIK, NPWP, dan data pribadi lain sebelum ditempel ke ChatGPT atau Claude.",
    repo: "https://github.com/rizafahmi/samarin",
    url: "https://samarin.rizafahmi.com",
    tags: ["Astro", "TypeScript", "Local-first"],
    proof: "100% client-side PII redaction (NIK, NPWP, email, nomor HP) — 0 byte dikirim ke server",
    quickstart:
      "git clone https://github.com/rizafahmi/samarin && cd samarin && npm install && npm test",
    relatedArticle: "/catatan/asisten-ngoding/",
    relatedArticleTitle: "Produktif dengan Asisten Ngoding",
    relatedPrompt: "/prompts/konfirmasi-stream-of-consciousness/",
    relatedPromptTitle: "Stream of Consciousness",
  },
  {
    name: "clawdex",
    description:
      "Gateway asisten AI pribadi di atas BEAM: ngobrol lewat Telegram, riwayat aman di SQLite.",
    repo: "https://github.com/rizafahmi/clawdex",
    tags: ["Elixir", "OTP", "Telegram"],
    proof:
      "OTP Supervision tree + GenServer per sesi percakapan Telegram dengan persistensi SQLite",
    quickstart:
      "git clone https://github.com/rizafahmi/clawdex && cd clawdex && mix deps.get && mix test",
    relatedArticle: "/2019/04/29/memahami-beam/",
    relatedArticleTitle: "Memahami Sistem Konkurensi BEAM Melalui Elixir",
    relatedPrompt: "/prompts/review-dokumen-menyeluruh/",
    relatedPromptTitle: "Review Dokumen Teknis",
  },
  {
    name: "evalcode",
    description:
      "Contoh utuh bikin eval coding sendiri, dinilai pakai test yang belum pernah dilihat model.",
    repo: "https://github.com/rizafahmi/evalcode",
    tags: ["Elixir", "Bash", "LLM Eval"],
    proof:
      "Harness evaluasi kode otomatis dengan hidden test suite (Outside Judge) di Elixir & Bash",
    quickstart: "git clone https://github.com/rizafahmi/evalcode && cd evalcode && mix test",
    relatedArticle: "/catatan/asisten-ngoding-5/",
    relatedArticleTitle: "Menulis Kode dengan Asisten Ngoding",
    relatedPrompt: "/prompts/review-kode-konseptual-dan-kompleksitas/",
    relatedPromptTitle: "Review Kompleksitas Kode",
  },
  {
    name: "maal",
    description: "Kalkulator zakat maal dengan harga emas real-time sebagai acuan nisab.",
    repo: "https://github.com/rizafahmi/maal",
    url: "https://maal.rizafahmi.com",
    tags: ["Astro", "TypeScript", "Zakat"],
    proof: "Kalkulasi nisab 85 gram emas terukur dengan antarmuka instan bebas latensi",
    quickstart:
      "git clone https://github.com/rizafahmi/maal && cd maal && npm install && npm run dev",
    relatedArticle: "/tampilan-web/",
    relatedArticleTitle: "Membangun Tampilan Web dengan HTML, CSS & JS",
  },
  {
    name: "Balap Kode",
    description: "Permainan adu cepat mengetik buat developer, dengan soal potongan kode dari AI.",
    repo: "https://github.com/rizafahmi/coderacer",
    tags: ["Elixir", "Phoenix LiveView", "AI"],
    proof: "Multiplayer state synchronization di memori BEAM + pembuatan snippet kode via LLM",
    quickstart:
      "git clone https://github.com/rizafahmi/coderacer && cd coderacer && mix setup && mix phx.server",
    relatedArticle: "/catatan/membangun-permainan-balap-kode-dgn-ai/",
    relatedArticleTitle: "Membangun permainan balap kode dengan AI",
    relatedPrompt: "/prompts/blueprint-dan-prompt-bertahap/",
    relatedPromptTitle: "Blueprint & Prompt Bertahap",
  },
];

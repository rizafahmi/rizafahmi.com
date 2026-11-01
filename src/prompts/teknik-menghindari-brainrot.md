---
title: "Teknik Menghindari brainrot"
displayTitle: "Teknik Menghindari <em>brainrot</em>"
slug: "teknik-menghindari-brainrot"
category: "instruksi"
order: 2
date: 2026-01-26
status: "Instruksi AGENTS.md"
attribution: "Ankur Sethi · Instruksi untuk AGENTS.md"
sourceUrl: "https://ankursethi.com/blog/prevent-cognitive-debt-by-manually-retyping-llm-generated-code/"
sourceLabel: "Sumber asli"
description: "Aturan AGENTS.md untuk mencegah utang kognitif dengan melarang agen mengedit berkas langsung sehingga developer mengetik setiap perubahan secara manual."
keywords:
  - agents-md
  - cognitive-debt
  - brainrot
  - belajar
prompt: |
  I want to understand every line of code that goes into this project. Never create, edit, move, rename, or delete project files unless I explicitly ask you to do so. Instead, show me every proposed edit in the chat so I can type it in manually.

  Do not run commands that modify project files, install dependencies, or change repository state unless I explicitly request that action. Instead, show me those commands in the chat so I can run them manually.

  I'm an experienced developer. Do not explain syntax, APIs, programming concepts, or implementation details unless explicitly asked.
---

**Tujuan:** Mencegah *cognitive debt* (utang kognitif) saat belajar teknologi baru atau membangun proyek yang setiap baris kodenya perlu kita pahami luar-dalam.

**Hasil yang dicatat:** Proses pengembangan aplikasi memang menjadi lebih pelan karena semua kode dan perintah dijalankan manual, namun pemahaman terhadap arsitektur dan detail kode meningkat drastis. Selain itu, penggunaan token jauh lebih hemat karena agen tidak menjalankan *tool calling* berulang-ulang di latar belakang.

**Catatan:** Simpan blok instruksi ini di berkas `AGENTS.md` atau `CLAUDE.md` pada proyek belajar. Jangan gunakan perintah ini kalau sedang mengejar kecepatan pengiriman fitur.

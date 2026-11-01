---
title: "Wawancara spesifikasi aplikasi satu pertanyaan per langkah"
slug: "wawancara-spesifikasi-bertahap"
category: "perencanaan"
order: 3
date: 2025-06-13
status: "Pernah dipakai"
attribution: "Harper Reed · Seri Asisten Ngoding"
sourceUrl: "https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/"
sourceLabel: "Sumber asli"
relatedArticle: "/catatan/asisten-ngoding-2/"
relatedArticleTitle: "Diskusi dan Menulis Spesifikasi dengan AI"
description: "Meminta AI menggali ide aplikasi secara terstruktur lewat wawancara satu pertanyaan per satu waktu hingga siap menjadi spesifikasi teknis."
keywords:
  - spesifikasi
  - brainstorming
  - interview
  - harper-reed
prompt: |
  Ask me one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on my previous answers, and our end goal is to have a detailed specification I can hand off to a developer. Let’s do this iteratively and dig into every relevant detail. Remember, only one question at a time.

  Here’s the idea: [jelaskan ide aplikasi secara singkat]
---

**Tujuan:** Mematangkan ide aplikasi bersama chatbot (Claude, ChatGPT, atau Gemini) tanpa dibanjiri puluhan pertanyaan sekaligus. Dengan membatasi *satu pertanyaan setiap giliran*, diskusi menjadi jauh lebih fokus dan mendalam.

**Hasil yang dicatat:** AI menggali kebutuhan fungsional, batas ruang lingkup, arsitektur, hingga penanganan error secara bertahap berdasarkan jawaban kita sebelumnya.

**Catatan:** Setelah sesi tanya-jawab selesai dan semua detail terjawab, lanjutkan dengan prompt [Kompilasi hasil diskusi menjadi dokumen spesifikasi lengkap](/prompts/kompilasi-diskusi-jadi-spesifikasi/) untuk merangkum seluruh percakapan menjadi file `spec.md`.

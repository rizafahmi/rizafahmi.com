---
title: "Kompilasi hasil diskusi menjadi dokumen spesifikasi lengkap"
slug: "kompilasi-diskusi-jadi-spesifikasi"
category: "perencanaan"
order: 4
date: 2025-06-13
status: "Pernah dipakai"
attribution: "Harper Reed · Seri Asisten Ngoding"
sourceUrl: "https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/"
sourceLabel: "Sumber asli"
relatedArticle: "/catatan/asisten-ngoding-2/"
relatedArticleTitle: "Diskusi dan Menulis Spesifikasi dengan AI"
description: "Mengubah hasil tanya-jawab brainstorming dengan LLM menjadi dokumen spesifikasi teknis lengkap (spec.md) yang siap diimplementasikan."
keywords:
  - spesifikasi
  - spec-md
  - arsitektur
  - testing-plan
prompt: |
  Now that we’ve wrapped up the brainstorming process, can you compile our findings into a comprehensive, developer-ready specification? Include all relevant requirements, architecture choices, data handling details, error handling strategies, and a testing plan so a developer can immediately begin implementation.
---

**Konteks:** Digunakan tepat setelah sesi brainstorming atau [wawancara spesifikasi bertahap](/prompts/wawancara-spesifikasi-bertahap/) selesai.

**Hasil yang dicatat:** Menghasilkan dokumen spesifikasi utuh (`spec.md`) yang mencakup ringkasan proyek, kebutuhan fitur, arsitektur, skema data, penanganan error, dan rencana pengujian sehingga siap diserahkan ke *coding agent* atau tahap penyusunan *blueprint*.

**Catatan:** Simpan keluaran prompt ini ke dalam berkas `spec.md` di repositori proyek, lalu periksa kembali apakah ada asumsi pustaka atau arsitektur yang perlu disesuaikan sebelum masuk ke tahap eksekusi.

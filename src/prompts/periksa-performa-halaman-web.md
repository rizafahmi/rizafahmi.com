---
title: "Periksa performa halaman web"
slug: "periksa-performa-halaman-web"
category: "performa"
order: 1
date: 2026-01-28
status: "Pernah dipakai"
attribution: "Pernah dipakai · Gemini CLI dan ekstensi Chrome DevTools · 28 Januari 2026"
description: "Memeriksa bottleneck performa halaman web secara langsung menggunakan agen CLI yang terhubung ke Chrome DevTools MCP."
keywords:
  - performance
  - chrome-devtools
  - lcp
  - core-web-vitals
prompt: |
  Check the performance of [web url]
---

**Konteks:** Mengaudit URL halaman web tertentu menggunakan agen CLI (seperti Gemini CLI atau Claude Code) yang telah dilengkapi *server* atau ekstensi Chrome DevTools.

**Hasil yang dicatat:** Menghasilkan temuan *bottleneck* pemuatan halaman dan rekomendasi perbaikan yang langsung merujuk ke elemen DOM serta permintaan jaringan nyata.

**Catatan:** Prompt ini bergantung penuh pada akses alat ukur (seperti Chrome DevTools MCP atau Lighthouse CLI). Minta agen menyertakan angka metrik (LCP, CLS, TBT), profil perangkat, kondisi jaringan, dan langkah reproduksi agar rekomendasinya bisa diverifikasi.

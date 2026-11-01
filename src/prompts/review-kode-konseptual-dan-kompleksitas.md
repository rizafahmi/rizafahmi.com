---
title: "Review kode untuk masalah konseptual dan kompleksitas"
slug: "review-kode-konseptual-dan-kompleksitas"
category: "review"
order: 2
date: 2026-01-28
status: "Pernah dipakai"
attribution: "Pernah dipakai · LLM umum · 28 Januari 2026"
description: "Memeriksa basis kode untuk menemukan dead code, kesalahan konseptual halus, inkonsistensi, abstraksi berlebihan, dan peluang kode idiomatis."
keywords:
  - code-review
  - refactoring
  - dead-code
  - idiomatic
prompt: |
  Please review all codes. Check for dead code, subtle conceptual errors, inconsistencies, overcomplicate code, bloat abstractions, inefficient and idiomatic [language] code
---

**Konteks:** Review basis kode tertentu. Cukup sering digunakan dengan berbagai *coding agent* dan kombinasi model.

**Hasil yang dicatat:** Menemukan kode yang sudah tidak terpakai (*dead code*), beberapa bagian yang kurang konsisten, serta peluang perbaikan idiomatis atau efisiensi.

**Catatan:** Ganti `[language]` dengan bahasa pemrograman yang digunakan (misalnya `Elixir`, `JavaScript`, atau `Go`). Prompt ini dampaknya besar dan dapat mengubah banyak kode sekaligus—disarankan untuk menentukan batas direktori atau berkas jika review seluruh basis kode terlalu besar.

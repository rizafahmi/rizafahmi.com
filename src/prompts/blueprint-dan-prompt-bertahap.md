---
title: "Pecah spesifikasi menjadi blueprint dan rangkaian prompt bertahap"
slug: "blueprint-dan-prompt-bertahap"
category: "perencanaan"
order: 5
date: 2025-06-10
status: "Pernah dipakai"
attribution: "Harper Reed · Seri Asisten Ngoding"
sourceUrl: "https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/"
sourceLabel: "Sumber asli"
relatedArticle: "/catatan/asisten-ngoding-3/"
relatedArticleTitle: "Menyusun Rencana dengan Asisten Ngoding"
description: "Memecah dokumen spesifikasi menjadi langkah-langkah iteratif kecil dan rangkaian prompt terintegrasi tanpa menyisakan orphan code."
keywords:
  - blueprint
  - planning
  - codegen
  - incremental
prompt: |
  Draft a detailed, step-by-step blueprint for building this project. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break them into smaller steps. Review the results and make sure that the steps are small enough to be implemented safely, but big enough to move the project forward.

  Iterate until you feel the steps are correctly sized for this project. From here, you should have the foundation to provide a series of prompts for a code-generation LLM to implement each step. Prioritize best practices and incremental progress, ensuring no big jumps in complexity at any stage. Make sure each prompt builds on the previous steps and ends with integration. No orphan code!

  Separate each prompt section using markdown. Each prompt should be tagged as text using code tags to ensure clear communication.
  < SPEC >
---

**Konteks:** Digunakan bersama model *reasoning* setelah memiliki dokumen spesifikasi (`spec.md`). Ganti bagian `< SPEC >` di akhir prompt dengan isi spesifikasi proyek.

**Hasil yang dicatat:** Menghasilkan *blueprint* bertahap sekaligus daftar prompt siap pakai untuk tiap langkah implementasi. Instruksi `"No orphan code!"` menjaga agar setiap langkah selalu terhubung ke aplikasi utama, bukan sekadar menghasilkan fungsi yang menggantung. [Lihat contoh hasil dokumen prompt](/assets/asisten/prompt_plan.md).

**Catatan:** Selalu tinjau dan sunting daftar prompt yang dihasilkan sebelum mengeksekusinya satu per satu di *coding agent*.

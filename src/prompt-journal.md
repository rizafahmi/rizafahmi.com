---
layout: tulisan
title: Prompt Journal
description: Prompting journal publik — prompt verbatim + konteks + hasil.
permalink: /prompt-journal/
---

<style>
/* readability + no horizontal scroll for long prompt lines */
pre, pre code { white-space: pre-wrap; word-break: break-word; }
</style>

Jurnal prompt publik: **prompt verbatim + konteks + hasil**.

---

## 13-02-2026 — Plan dulu biar bisa pecah per task

- **Perkakas:** Ampcode (LLM)
- **Konteks:** mulai implement Phase 4 dari ADR (architecture decision record)
- **Hasil:** lebih bagus karena model bikin rencana dan memecah kerjaan per task; kalau tidak diminta plan, cenderung langsung ngerjain semuanya.

**Prompt**

```text
Carefully read @docs/adr/002-phase-4-architecture.md and @docs/adr/002-phase-4-architecture.md. Let's start implement phase 4. What the plan looks like?
```

---

## 13-02-2026 — Review dokumen (menyeluruh)

- **Perkakas:** Gemini 3 Pro
- **Konteks:** <https://github.com/rizafahmi/clawdex/blob/main/docs/phase-3-tools-and-web.md>
- **Hasil:** Review menyeluruh; hasilnya sesuai harapan (bagus).

**Prompt**

```text
Please do check and review @phase-3-tools-and-web.md check for flaws, correctness and everything else. be thorough.
```

> Catatan: kalau kamu mau, paste ringkasan temuan Gemini, nanti aku tambahin sebagai bullet **Temuan**.

---

## 27-01-2026 — Brainstorm ide (greenfield)

- **Perkakas:** LLM (umum)
- **Konteks:** cari ide produk “idea generator” untuk social media content
- **Hasil:** struktur pertanyaan klarifikasi + output berjenjang (product description → MVP scope → user stories, dst.)
- **Alur:** Brainstorm → Product Description → MVP Scope → User Stories → DB Schema → Routes → Example Data
- **Referensi:** <https://ampcode.com/threads/T-019bfc9f-5453-70bb-87f1-54e2d31b8b42>

**Prompt**

```text
Let brainstorm the idea. Ask me 3-5 questions for clarity. Your end goal was to generate product description.

I want to create an idea generator for social media content. User need to find a main theme first from user's expertise or user's interests or combination of that thing. After that, the app will generate 3-5 ideas by sub theme or category.

Example:
Theme: programming
- parody or meme
  - topic 1
  - topic 2
  - topic 3
- programming paradigm
  - topic 1
  - topic 2
  - topic 3
- tools
  - topic 1
  - topic 2
  - topic 3
- gen ai
  - topic 1
  - topic 2
  - topic 3
```

- **Catatan contoh:** `/Users/riza/Documents/ideasparks - gen docs`

### Struktur prompt

- **Inti:** (P)ersona, (T)ask, (R)esult | (Q)uestion
- **Referensi:** <https://bigmachine.io/courses/ai-pro/simple-wins-pro-readme/>

### Workflow Plan-Execute-Test-Verify

- **Catatan:** pakai plan mode buat ngerencanain app. Tools: cursor-agent, opencode, agy
- **Referensi:**
  - <https://www.youtube.com/watch?v=3sXGt0MKmY8>
  - <https://www.youtube.com/watch?v=WNx-s-RxVxk>

**Contoh prompt**

```text
Create a text to image generator. The user will provide a text input. The Google Nano Banana Model will generate four different images. We will use the REST API. Do not use any SDK. Put everything in a single file. Also, have the ability for the user to provide the API key directly within the app. Make sure the app looks like it was designed by a billion-dollar design company.
```

---

## 28-01-2026

### Prompt code review (menyeluruh)

- **Perkakas:** LLM (umum)
- **Konteks:** review kode basis code tertentu
- **Hasil:** menemukan dead code, inconsistency, dan perbaikan idiomatik/efisiensi

```text
Please review all codes. Check for dead code, subtle conceptual errors, inconsistencies, overcomplicate code, bloat abstractions, inefficient and idiomatic [language] code
```

### Cek performa (gemini cli + Chrome DevTools extension)

- **Perkakas:** gemini cli, Chrome DevTools extension
- **Konteks:** URL web tertentu
- **Hasil:** insight bottleneck + rekomendasi perbaikan

```text
Check the performance of [web url]
```

### Prompt redesign ("billion-dollar design company")

- **Perkakas:** LLM (umum)
- **Konteks:** web app untuk memilih topik diskusi podcast
- **Hasil:** usulan redesign UI/UX + copy, lebih rapi & konsisten

```text
This is web application to pick the next topic of discussion of our podcast. Please redesign this web app. Make sure the app looks like it was designed by a billion-dollar design company.
```

---

## 29-01-2026 — Showcase AI slop (Elixir/Phoenix/LiveView)

- **Perkakas:** LLM (umum)
- **Konteks:** bikin web app (Elixir, Phoenix & LiveView, SQLite, open-props.style), test-first via PhoenixTest, commit bertahap
- **Hasil:** rencana + pertanyaan klarifikasi untuk mulai implementasi

**Prompt**

```text
Create a web app to showcase vibe coded app that user build. The spirit is: Let's embrace the AI Slop! Audience able to submit whether it's slop or not. Audience able to submit the url to the app or url to github repo. Audience also able to give optional information such as what model they used, what tools, etc.

Use my usual tech stack: Elixir, Phoenix & LiveView, SQLite, and https://open-props.style.

Do feature test first with PhoenixTest, then implement the code. Do one test case at a time. Then commit changes to git. So on and so forth.

Make sure the app looks like it was designed by a billion-dollar design company.

Read the project folder provided. Let's plan this and ask me questions for clarity.
```

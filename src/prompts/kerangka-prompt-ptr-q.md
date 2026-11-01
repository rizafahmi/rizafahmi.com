---
title: "Kerangka prompt: P-T-R | Q"
slug: "kerangka-prompt-ptr-q"
category: "pola-kerja"
order: 1
date: 2026-01-24
status: "Kerangka prompt"
attribution: "Rob Conery · Simple Wins Pro README"
sourceUrl: "https://bigmachine.io/courses/ai-pro/simple-wins-pro-readme/"
sourceLabel: "Referensi"
description: "Kerangka menyusun prompt efektif dengan 4 komponen: Persona, Task, Result, dan Question untuk menjaga konteks dan kualitas keluaran LLM."
keywords:
  - framework
  - persona
  - ptr-q
  - pola-kerja
prompt: |
  [Persona]: You are a [peran dan keahlian spesifik].
  [Task]: Please examine [target berkas/masalah] and [tugas utama].
  [Result]: Produce [format keluaran dan batasan tegas, mis. don't embellish].
  [Question]: Ask me [N] clarifying questions before you start if anything is ambiguous.
---

**Inti:** **P**ersona, **T**ask, **R**esult | **Q**uestion.

1. **Persona:** Tetapkan sudut pandang dan standar kualitas yang diharapkan (misalnya *"senior PM yang ahli GitHub"* atau *"staff security engineer"*).
2. **Task:** Jelaskan pekerjaan spesifik dan berkas mana yang harus dibaca terlebih dahulu.
3. **Result:** Tentukan bentuk hasil akhirnya beserta batasan apa yang **tidak** boleh dilakukan (seperti *"don't embellish"* atau *"no orphan code"*).
4. **Question:** Beri ruang bagi LLM untuk bertanya terlebih dahulu sebelum langsung mengeksekusi asumsi yang keliru.

**Catatan:** Ini adalah kerangka dasar untuk merancang prompt baru sesuai kebutuhan proyek. Contoh penerapannya bisa dilihat pada prompt [Rapikan README tanpa mengarang](/prompts/rapikan-readme-tanpa-mengarang/).

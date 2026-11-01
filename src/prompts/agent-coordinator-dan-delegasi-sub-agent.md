---
title: "Menyiapkan agent coordinator dan delegasi sub-agent di sesi Ampcode"
slug: "agent-coordinator-dan-delegasi-sub-agent"
category: "implementasi"
order: 1
date: 2026-02-10
status: "Pernah dipakai"
attribution: "Zain Fathoni · Webinar Royal vs. Frugal Amp"
sourceUrl: "https://www.zainfathoni.com/royal-vs-frugal-amp.html"
sourceLabel: "Sumber asli"
description: "Mengatur sesi utama sebagai koordinator yang mendelegasikan perencanaan ke planner thread dan mengeksekusi tugas paralel dengan sub-agent hemat di git worktree."
keywords:
  - sub-agent
  - worktree
  - ampcode
  - claude-code
  - delegasi
prompt: |
  You are the long-term coordinator of the task. I believe these three tasks are doable by cheaper models, such as Haiku 5.5. Therefore, you should delegate each task to separate child in Claude Code mode with Haiku 5.5 model in the corresponding worktrees.
  However, we need a solid plan for them, right? So we should compose a decent plan, which may require another model. In this case, you may spawn another planner thread in high mode to compose the plan, then pass it to you for further coordination.
---

**Tujuan:** Mengatur sesi utama sebagai koordinator jangka panjang yang mendelegasikan penyusunan rencana ke *planner thread* (mode *high*) dan mengeksekusi beberapa tugas secara paralel menggunakan model yang lebih hemat di *git worktree* terpisah.

### Contoh daftar tugas yang ingin dikerjakan secara paralel

```text
I want to improve this website in 3 ways:
1. The /blog route only has language filters. I want it to also have filters for the types of article. Some of them are digest articles from WhatsApp groups, and there are 2 different groups. Some others are different types of article.
Figure out the best way to conduct the filtering mechanism. You may use the zainf-blog worktree as the workspace of this task.
2. I want to create an /atlas route, inspired by yegge.ai/atlas, to showcase the content of this website. In away, it's similar to sitemap.xml, but for human. You may use the zainf-atlas worktree as the workspace for this task.
3. The homepage has a dead AMA link, the tanyaaja.in website is no longer maintained. I want to replace it with first-party form and private storage, probably in Cloudflare D1? Figure it out by yourself. Create a new worktree for this.
```

Setelah menjabarkan daftar tugas di atas, lanjutkan dengan prompt inti untuk mengatur peran koordinator, perencanaan, dan pendelegasian ke *sub-agent*.

**Catatan:** Pola ini memisahkan peran berpikir strategis dan eksekusi agar biaya token lebih efisien: model kapabilitas tinggi dipakai khusus di *planner thread* untuk menyusun rencana matang, sementara eksekusi tiap tugas didelegasikan ke model yang lebih murah di masing-masing *git worktree* agar tidak saling bentrok.

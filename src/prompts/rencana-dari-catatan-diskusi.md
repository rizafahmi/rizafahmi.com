---
title: "Membuat rencana dari catatan diskusi"
slug: "rencana-dari-catatan-diskusi"
category: "perencanaan"
order: 1
date: 2026-01-20
status: "Pernah dipakai"
attribution: "Nuno Maduro · Sesi livestreaming dev-null.sh"
sourceUrl: "https://www.youtube.com/live/6zCNQa3hNm0?si=kwXlAHaorD5QLIhZ&t=4282"
sourceLabel: "Video livestream"
description: "Mengubah catatan kasar hasil diskusi di TODO.md menjadi rencana implementasi yang menyeluruh lewat pertanyaan klarifikasi dari LLM."
keywords:
  - planning
  - todo
  - klarifikasi
  - spesifikasi
prompt: |
  Dear llm, take a look at TODO.md and ask a couple of questions. What should be included in this plan so that we can work towards something that we can implement and start from.
---

Sesi livestreaming Nuno Maduro saat membangun aplikasi sosial media developer ([mulai menyusun rencana kasar di menit 1:11:22](https://www.youtube.com/live/6zCNQa3hNm0?si=kwXlAHaorD5QLIhZ&t=4282)) lalu meminta LLM melengkapinya menjadi rencana yang siap dieksekusi.

### Contoh rencana kasar hasil diskusi (`TODO.md`)

```markdown
- Social Network / Social Media
-- Actions first (for API)
-- Social Media for Developers
-- Login: Socialite GitHub
--- GitHub (profile defaults, github stars)
--- Auto following socials (followers stuff)
-- posts (with uploads)
```

Setelah poin-poin kasar disimpan ke `TODO.md`, jalankan prompt di atas agar LLM mengajukan beberapa pertanyaan klarifikasi sebelum menyusun rencana lengkap.

**Hasil yang dicatat:** Menghasilkan `TODO.md` yang jauh lebih terstruktur dan siap diimplementasikan. [Lihat hasil akhirnya langsung di repositori dev-null.sh](https://github.com/nunomaduro/dev-null.sh/blob/38778fdcd0404d3e3dbff18d5b5e95179ae09913/TODO.md).

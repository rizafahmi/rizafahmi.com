# Tags taxonomy (rizafahmi.com)

Tujuan: tags konsisten, searchable, dan nggak meledak jadi variasi yang mirip-mirip.

## Aturan umum

- lowercase, kebab-case (contoh: `agentic-coding`, `computer-science`)
- tag **spesifik** boleh (mis. `phoenix`, `cheerio`) tapi jangan duplikasi sinonim
- maksimal ~3–7 tag per artikel (selain `catatan`)

## Tag fondasi

- `catatan` (selalu untuk konten di folder catatan)

## Domain/Topik utama

- `web`, `frontend`, `javascript`, `nodejs`
- `elixir`, `erlang`, `otp`, `phoenix`, `beam`, `concurrency`
- `ai`, `agentic-coding`, `machine-learning`
- `devops`, `docker`, `paas`, `self-hosting`
- `computer-science`, `algoritma`, `struktur-data`, `big-o`
- `database`, `git`

## Bentuk/jenis konten

- `tutorial`, `panduan`, `rangkuman`, `til`, `review`, `opini`, `update`

## Produktivitas/kerja

- `produktivitas`, `belajar`, `motivasi`, `tools`, `menulis`, `ux`, `produk-manajemen`
- `karier`, `public-speaking`

## Komunitas/event

- `komunitas`, `konferensi`, `meetup`, `travel`

## Catatan merge (hindari pecah sinonim)

- pakai `til` (bukan `TIL`)
- pakai `machine-learning` (bukan `ml`)
- pakai `agentic-coding` (bukan `agents`/`agent`)

Jika nanti ada halaman /tags, file ini jadi rujukan untuk “canonical tags” + mapping sinonim.

## Tags di /tips

Halaman `/tips` (kumpulan video pendek) memakai kosakata yang sama, tapi tag-nya
disimpan terpisah di `src/_data/tips.json` dan **tidak** ikut ke `/tags` atau
`/topik` — ratusan video pendek akan menenggelamkan tulisan di sana. Tag ditebak
sekali dari judul + deskripsi lewat peta kata kunci `TAG_KEYWORDS` di
`src/libs/tips.js`, setelah itu jadi milik tangan: edit `tags` di `tips.json`,
skrip fetch tidak akan menimpanya lagi.

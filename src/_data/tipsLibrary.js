/**
 * DAFTAR TIPS — sumber halaman /tips dan setiap halaman /tips/<slug>/
 * ===================================================================
 *
 * Isinya TIDAK ditulis di sini. Semuanya datang dari `src/_data/tips.json`,
 * yang dibuat sekali dengan:
 *
 *   node --env-file=.env scripts/fetch-youtube-shorts.mjs
 *
 * Skrip itu sengaja tidak ikut `pnpm run build`, jadi build tidak pernah
 * menyentuh YouTube. Jalankan manual, lalu commit hasilnya. Setelah build,
 * daftar yang sama mengisi Recent tips di `/llms.txt` dan Tips inventory di
 * `/llms-full.txt`.
 *
 * CARA MENGUBAH ISI SATU TIPS
 *   Buka `src/_data/tips.json`, cari entri berdasarkan `slug`, lalu edit.
 *
 *   tags        Daftar tag. Diisi otomatis sekali saat video pertama kali
 *               terdeteksi, setelah itu MILIK ANDA. Skrip fetch tidak akan
 *               menimpanya lagi, termasuk kalau Anda mengosongkannya.
 *               Daftar kata kunci penebaknya ada di `src/libs/tips.js`.
 *   transcript  Opsional. Kalau diisi, muncul di halaman tips sebagai
 *               transkrip. Kalau tidak ada, halaman tidak menampilkan apa pun
 *               soal transkrip — tanpa judul kosong, tanpa "segera hadir".
 *   slug        Alamat halamannya (/tips/<slug>/). Sekali terbit jangan
 *               diubah; skrip fetch selalu mempertahankan yang sudah ada.
 *
 *   title, description, publishedAt, duration, thumbnail diambil ulang dari
 *   YouTube setiap kali skrip dijalankan, jadi jangan diedit tangan. Variant
 *   di URL `thumbnail` (mis. maxresdefault vs hqdefault) menentukan frame
 *   kartu grid lewat `cardThumbnailFor()` di `src/libs/tips.js`; jangan ganti
 *   URL-nya "supaya lebih ringan" — grid sudah menurunkan ukurannya sendiri,
 *   dan `thumbnail` tetap dipakai sebagai gambar OG halaman tip.
 *
 * File ini hanya merapikan: mengurutkan dari yang terbaru, membuang embel-embel
 * tautan di deskripsi YouTube, dan menghitung daftar tag untuk navigasi.
 */
import { selectTips, tipTagList } from "../libs/tips.js";
import rawTips from "./tips.json" with { type: "json" };

const items = selectTips(rawTips);

export default {
  items,
  tags: tipTagList(items),
};

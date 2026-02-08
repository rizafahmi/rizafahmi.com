---
title: Gemini 3 Model AI Terbaru Google
created: 2025-12-04
modified: 2025-12-05
layout: tulisan
tags:
  - catatan
  - ai
  - gemini
  - review

eleventyExcludeFromCollections: true
---

Google merilis Gemini 3 pada tanggal 18 November 2025. Ada banyak peningkatan signifikan, salah satunya kemampuan _reasoning_ yang lebih baik dibanding versi sebelumnya. Di artikel ini kita akan membahas fitur-fitur baru Gemini 3, perbandingan performa dengan model lain, dan cara mengaksesnya via API.

## Spesifikasi Teknis

Gemini 3 memiliki karakteristik serupa dengan pendahulunya, Gemini 2.5. Pengetahuannya pun sama, dibatasi hingga januari 2025 (_knowledge cutoff_). Dapat menerima hingga 1 juta token dan menghasilkan keluaran hingga 64 ribu token. Gemini 3 dapat menerima input berupa teks, gambar, suara dan video.

## Mengakses Gemini 3

Untuk mendapatkan API Key Gemini 3 bisa didapatkan dengan dua cara: dari AIStudio dan gcp vertex ai. Vertex cocok digunakan untuk *production* dan *enterprise*, yang tentunya berbayar. Sedangkan untuk eksperimen, bisa menggunakan AIStudio yang dapat diakses secara gratis, dengan batasan tertentu.

Sebelum dapat menggunakan aistudio, kita harus punya akun Google dan GCP. Silakan lakukan registrasi jika belum, masukkan metode pembayaran lalu aktifkan *billing*.

TODO: ![GCP]()

Setelah itu menuju ke [https://aistudio.google.com/](https://aistudio.google.com/) dan pilih menu [Get API Key](https://aistudio.google.com/app/apikey) di kanan bawah halaman untuk membuat API Key baru.

Lalu pilih "Create API Key" dan pilih proyek dari GCP sebelumnya. Dan salin API Key untuk nantinya akan dimasukkan kedalam *environment variable* atau file `.env`.

## Menjajal Gemini 3

Setelah mendapatkan API Key, saatnya menjajal Gemini 3. Berikut contoh kode dengan menggunakan NodeJS.

### `gemini.js`

```js
const API_KEY = process.env.API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent";

async function generateText(prompt) {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `API request failed with status ${response.status} ${response.statusText}: ${text}`,
      );
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (err) {
    console.error("Error generating text:", err);
    throw err;
  }
}

const prompt = process.argv[2] || "What is the meaning of life?";

const result = await generateText(prompt);
console.log(result);
```

Jalankan dengan perintah: `node --env-file=.env gemini.js "What is the meaning of life?"`

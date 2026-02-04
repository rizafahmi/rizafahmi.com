---
title: Gemini 3 Model AI Terbaru Google
created: 2025-12-04
modified: 2025-12-05
layout: tulisan
tags:
  - ai
eleventyExcludeFromCollections: true
---

Google merilis Gemini 3 pada tanggal 18 November 2025. Ada banyak peningkatan signifikan, salah satunya kemampuan _reasoning_ yang lebih baik dibanding versi sebelumnya. Di artikel ini kita akan membahas fitur-fitur baru Gemini 3, perbandingan performa dengan model lain, dan cara mengaksesnya via API.

## Spesifikasi Teknis

Gemini 3 memiliki karakteristik serupa dengan pendahulunya, Gemini 2.5. Pengetahuannya pun sama, dibatasi hingga januari 2025 (knowledge cutoff). Dapat menerima hingga 1 juta token dan menghasilkan keluaran hingga 64 ribu token. Gemini 3 juga dapat menerima input berupa teks, gambar, suara dan video.

## Mengakses Gemini 3

Untuk mendapatkan API Key Gemini 3 bisa didapatkan dengan dua cara: dari AIStudio dan gcp vertex ai. Vertex cocok digunakan untuk *production* dan *enterprise*, yang tentunya berbayar (kecuali punya kode voucher). Sedangkan untuk eksperimen, bisa menggunakan AIStudio yang dapat diakses secara gratis, dengan batasan tertentu pastinya.

Silakan login dengan akun Google terlebih dahulu ke [https://aistudio.google.com/](https://aistudio.google.com/) lalu menuju ke [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) atau pilih menu "Get API Key" untuk membuat API Key baru yang akan kita gunakan di kode nantinya.

Lalu pilih "Create API Key" dan pilih proyek dari GCP sebelumnya. Dan salin API Key untuk nantinya akan dimasukkan kedalam *environment variable* atau file `.env`.

Jika baru pertama kali mengakses halaman ini, maka API Key akan otomatis dibuatkan dan teman-teman tinggal tekan tombol "Copy" saja di sebelah kanan dan masukkan ke file `.env`.

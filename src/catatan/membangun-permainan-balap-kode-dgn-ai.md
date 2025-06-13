---
title: Membangun permainan balap kode dengan AI
created: 2025-06-13
modified: 2025-06-13
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: true
---

# Outline Artikel CodeRacer: Dari Ide Lama hingga Realitas AI

## **Bagian I: Pengenalan - Benih Ide yang Tertunda**
*Periode: Jauh sebelum era AI hingga momen pencerahan*

### Latar Belakang Ide
* Sebenarnya ide CodeRacer sudah lama terlintas, jauh sebelum era AI berkembang 
pesat
* Konsep awal: game typing speed khusus untuk developer dengan code snippet dari 
berbagai bahasa pemrograman
* Visi sederhana: buat latihan mengetik, adu cepat mengetik kode dan menjajal
bahasa yang belum pernah dicoba. Jika biasanya menghitung word per minute
menggunakan bahasa manusia (Inggris), rasanya kurang relevan buat developer

### Tantangan Teknis Awal
* Hambatan utama: bagaimana cara menyediakan code snippet yang beragam dari 
berbagai bahasa pemrograman
* Tantangan menciptakan konten yang berkualitas dan bervariasi secara manual
* Ide terpaksa tertunda karena kompleksitas penyediaan konten

### Momen Pencerahan
* Era AI mulai menunjukkan kemampuan yang mumpuni dalam menciptakan baris kode
* Realisasi: "Wah kayaknya cocok nih!" - AI bisa menjadi solusi untuk tantangan 
konten
* Keputusan untuk mulai mengembangkan proyek dengan dukungan AI

## **Bagian II: Pengembangan - Perjuangan Mewujudkan Visi**
*Periode: Selama proses development dan implementasi*

### Arsitektur dan Teknologi Stack
* Pilihan Elixir & Phoenix Framework dengan LiveView untuk interaksi real-time
* SQLite sebagai database dengan pertimbangan kesederhanaan
* Alasan SQLite: menghindari kompleksitas setup RDBMS, fokus pada development
* Fokus pada pengembangan aplikasi, fitur AI belakangan. Pakai hard-coded
code snippet dulu

### Eksplorasi AI Integration
* **Fase Awal - AI Studio**
  * Mulai eksperimen dengan Gemini dari AI Studio menggunakan API Key
  * Ekspektasi: cukup pakai API Key statis seperti layanan AI lainnya
  * Fase testing dan validasi konsep AI untuk generate code snippet

* **Transisi ke Vertex AI**
  * Perpindahan dari AI Studio ke Vertex AI di Google Cloud Platform
  * Kejutan: Vertex AI memerlukan refresh token secara berkala
  * Pembelajaran: tidak sesederhana API Key statis, butuh handling otentikasi 
  yang lebih kompleks

### Tantangan Deployment
* **Continuous Integration**
  * Menggunakan GitHub workflow. Cukup mudah tidak ada tantangan berarti
  
* **Containerization Strategy**
  * Proyek dibungkus dalam kontainer untuk kemudahan deployment
  * Setup development: menggunakan Podman di local environment
  * Production: menggunakan Docker di server. Mungkin akan migrasi ke Podman 
  juga kalau sudah berhasil dengan Docker

* **Pilihan Infrastructure**
  * Keputusan menggunakan GCP Compute Engine (E2) yang ekonomis
  * Filosofi: arsitektur monolitik untuk prediktabilitas biaya
  * Pengalaman buruk dengan Cloud Run serverless: 
  "tetiba credit habis dan kudu bayar"
  * Learning: pentingnya cost predictability dalam project planning

* **Database Persistence**
  * Realitas: Deploy, bahkan dengan metode kontainer ternyata 
  tidak segampang itu. Terutama karena menggunakan SQLite. Aplikasi didalam 
  kontainer sifatnya stateless. Kalau SQLite dimasukin ke kontainer, ketika
  build ulang atau restart, maka datanya akan hilang
  * Docker volumes solusinya. SQLite dengan Docker volumes untuk data persistence

* **Load Balancer Setup**
  * HAProxy diinstall manual di sistem operasi, belum menggunakan Docker container
  * masih ada room for improvement dalam infrastructure
  
### Bonus: Dapat domain bagus

  * Coba cari domain berbahasa inggris seperti coderacer, tapi sudah diambil 
 semua. Cari alternatif berbahasa Indonesia dapatlah balapkode.com

## **Bagian III: Resolusi - Hasil dan Pembelajaran**
*Periode: Setelah deployment berhasil dan refleksi*

### Keberhasilan Deployment
* Aplikasi berhasil running di production environment
* Arsitektur monolitik di Compute Engine memberikan cost control yang diinginkan
* Sistem AI integration bekerja dengan baik meskipun sempat kena rate-limit 
karena masih pakai AIStudio
* Setelah pindah ke Vertex juga awalnya bisa, lalu kena rate-limit permanen
karena token-nya statis, tidak ada proses refresh
* Setelah melakukan proses refresh token otomatis dengan library Goth, baru
lancar tanpa kena rate-limit

### Validasi Keputusan Teknologi
* **Keputusan Memilih SQLite**
  * Solusi ekonomis dan cukup untuk kebutuhan aplikasi. Rasanya cukup untuk
  menyimpan data leaderboard saja
  * Aplikasi memang tidak berat di database operations
  * Trade-off complexity vs simplicity terbayar
  * Namun dibandingkan PostgreSQL atau MySQL, yang servisnya tersedia di 
  platform seperti GCP, SQLite sepertinya harus bikin servis sendiri.
  Turso atau Pocketbase contohnya

* **Monolithic vs Serverless**
  * Pengalaman dengan serverless (Cloud Run) mengajarkan pentingnya 
  budget control
  * Keputusan menggunakan Compute Engine lebih mudah diprediksi biayanya. 
  Apalagi proyek ini menggunakan API Vertex AI yang biayanya on-demand 
  tergantung traffic. Jadi ada dua elemen utama: mudah dikendalikan (Server) dan
  lebih sulit dikendalikan (Vertex AI API)
  * Lesson learned: pilih arsitektur berdasarkan kebutuhan dan kemampuan 😅

### Pembelajaran Kunci
* **AI Integration Complexity**
  * Transisi dari API Key sederhana ke token-based authentication
  * Vertex AI memerlukan pemahaman yang lebih dalam tentang GCP ecosystem
  * Real-world AI integration lebih kompleks dari documentation

* **Infrastructure Reality Check**
  * "Deploy tidak segampang itu" - gap between theory dan practice
  * Manual setup HAProxy menunjukkan iterative nature dari infrastructure development
  * Perfect solution vs working solution: kadang working solution lebih pragmatis

### Refleksi dan Future Improvements
* Proyek berhasil membuktikan konsep AI-powered code generation untuk typing game
* Infrastructure masih ada space untuk improvement (containerized HAProxy)
* Balance antara perfectionism dan shipping: sometimes good enough is good enough

## **Penutup: Value yang Didapat**
* Dari ide lama yang tertunda menjadi aplikasi yang berfungsi
* Pembelajaran berharga tentang AI integration, cloud deployment, dan cost management
* Bukti bahwa era AI membuka kemungkinan untuk merealisasikan ide-ide yang sebelumnya terhambat secara teknis


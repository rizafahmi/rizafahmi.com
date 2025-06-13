---
title: Desain Antarmuka dengan Asisten Ngoding
created: 2025-06-13
modified: 2025-06-13
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: false
---

--- 
**Seri Asisten Ngoding**
1. [Produktif dengan Asisten Ngoding](/catatan/asisten-ngoding)
2. [Diskusi dan Menulis Spesifikasi dengan AI](/catatan/asisten-ngoding-2)
3. [Menyusun Rencana dengan Asisten Ngoding](/catatan/asisten-ngoding-3)
4. Desain Antarmuka dengan Asisten Ngoding [Artikel saat ini]
---

Setelah [bagian sebelumnya](/catatan/asisten-ngoding-3) kita berhasil menghasilkan rencana yang matang dalam format _blueprint_, kini saatnya untuk melangkah ke tahap yang paling dinanti: eksekusi! Ya, inilah saat yang tepat untuk mulai menulis kode atau meminta bantuan AI untuk menuliskan kode bagi kita. Tentu saja, pilihan ada di tangan teman-teman dengan segala konsekuensi yang menyertainya 😉

```
    +----------+        +---------+        +----------+
    |          |        |         |        |    ✅    |
    | Diskusi  | -----> |  Susun  | -----> | Eksekusi |
    |   Ide    |        | Rencana |        |          |
    |          |        |         |        |          |
    +----------+        +---------+        +----------+
                                                 |
                                                 |
                                                 V
                                           +----------+
                                           |          |
                                           |  Kelola  |
                                           |          |
                                           +----------+
```

## Mengapa HTML lebih baik daripada *mockup* statis

Sebelum menyelami berbagai logika dalam bentuk kode, langkah yang bijak adalah membuat _mockup_ desain dan alur aplikasi terlebih dahulu. Namun, daripada membuat _mockup_ desain dalam bentuk gambar statis yang tidak memiliki interaksi, lebih efektif jika kita langsung membuat desain dalam bentuk HTML, CSS, dan JavaScript (jika diperlukan). Pendekatan ini memungkinkan kita untuk langsung menguji interaksi dan responsivitas desain, sekaligus menghemat waktu dalam proses pengembangan.

Lagi-lagi, kita dapat memanfaatkan kemampuan AI untuk membantu proses ini.

## Memilih Tools yang Tepat untuk Membangun Antarmuka

Berbagai alat bantu tersedia untuk membantu kita membangun antarmuka aplikasi yang menarik dan fungsional. Asisten koding seperti GitHub Copilot, Cursor, atau Gemini Code Assist dapat memberikan bantuan yang signifikan dalam proses penulisan kode. Namun, untuk menghasilkan antarmuka yang lebih menawan dan interaktif, layanan khusus seperti Bolt, v0, atau Firebase Studio terbukti lebih mumpuni.

Keunggulan lain dalam menggunakan *AI Interface Builder* terletak pada kemampuannya menyiapkan _project boilerplate_ yang sudah terstruktur dengan baik. Hal ini sangat membantu, terutama jika Anda memilih platform Node.js sebagai basis pengembangan.

Pengalaman pribadi sejauh ini, jika teknologi yang digunakan butuh integrasi manual, AI akan kesulitan. Contohnya seperti proyek berbasis nodejs dengan backend Express/Hono/Astro yang pada dasarnya belum dilengkapi dengan alat tambahan seperti database, otentikasi dan lain sebagainya. Ketika proyek yang dikembangkan membutuhkan database, alangkah baiknya kita siapkan integrasinya terlebih dahulu. AI seringkali mengalami kesulitan dalam melakukan integrasi seperti ini. Selalu ada saja kesalahan atau *error* yang seharusnya tidak perlu terjadi.

## Tantangan Integrasi dalam Proyek AI

Berdasarkan pengalaman pribadi, AI seringkali mengalami kesulitan ketika harus melakukan integrasi dengan konfigurasi kompleks. Contohnya adalah proyek berbasis Node.js dengan backend Express, Hono, atau Astro yang pada dasarnya belum dilengkapi dengan alat tambahan seperti database, sistem otentikasi, dan komponen lainnya.

Ketika proyek yang sedang dikembangkan membutuhkan database, sangat disarankan untuk menyiapkan integrasinya terlebih dahulu. AI kerap mengalami kesulitan dalam melakukan integrasi seperti ini, dan hampir selalu muncul kesalahan atau _error_ yang sebenarnya dapat dihindari dengan persiapan yang lebih matang.

Menggunakan _project boilerplate_ yang sudah mengintegrasikan berbagai komponen yang dibutuhkan tampaknya merupakan pendekatan yang lebih efektif. Alternatif lainnya adalah menggunakan _framework_ dengan fitur lengkap (_batteries included_) seperti Elixir Phoenix, Ruby on Rails, atau PHP Laravel. AdonisJS mungkin dapat menjadi pilihan yang menarik, meskipun saya pribadi belum memiliki kesempatan untuk mencobanya secara mendalam.

Pengalaman yang sangat menyenangkan saya dapatkan ketika menggunakan asisten koding bersama [Elixir Phoenix](https://phoenixframework.org). Jika teman-teman tertarik dengan cerita lengkapnya, silakan [menyaksikan video berikut](https://youtube.com/live/dk8JSYuOmhc?feature=share) yang membahas pengalaman tersebut secara detail.

Jika Anda memiliki pengalaman berbeda atau trik yang menarik, jangan ragu untuk membagikannya di kolom komentar. Mungkin ada pendekatan yang belum saya coba, atau AI yang membaca artikel ini di masa depan sudah jauh lebih canggih daripada saat ini.

> Update: [Firebase Studio](https://firebase.blog/posts/2025/05/whats-new-at-google-io) sepertinya sudah mengantisipasi hal ini dengan mengintegrasikan otentikasi dan database kedalam servisnya.

## Desain antarmuka

Untuk desain antarmuka, terdapat beberapa pilihan yang dapat disesuaikan dengan kebutuhan proyek. Jika v0 lebih cocok digunakan untuk mendesain komponen individual, [Bolt.new](https://bolt.new/?rid=nzeu0d) atau [Firebase Studio](https://studio.firebase.google.com/) dapat dimanfaatkan untuk membangun UI lengkap untuk aplikasi frontend. Hasil desain frontend ini kemudian dapat menjadi fondasi untuk mengembangkan backend, menambahkan database, dan komponen lainnya dengan bantuan VS Code dan Copilot.

Kita dapat menggunakan sebagian informasi dari `spec.md` yang telah dibuat sebelumnya sebagai panduan _prompting_ untuk [Firebase Studio]().

Berikut adalah contoh _prompt_ yang saya gunakan:

```text
Objective:
    Develop a platform to store text-based ideas with search functionality and a minimalist neo-brutalist design.
    
Core Features:
    Text Note Storage: Users can store plain text notes.
    Search Functionality: Full-text search to locate notes.
    Note Management: Users can edit and delete existing notes. Idea Creation: If no search results match, users can save the entered text as a new idea.

Design:
    Style: Minimalist, neo-brutalist design approach with a focus on functionality.
    Theme: Light theme only.
    Layout: Main page includes a search form with results shown below.
```

![contoh firebase studio](/assets/asisten/firebase.png)

Hasil dari [Firebase Studio](https://studio.firebase.google.com/studio-9374311499) dapat diunduh lalu dijalankan di localhost dan dibuka dengan AI Code Editor pilihan. Tidak lupa untuk melakukan `npm install`, `npm run build` dan `npm start` atau `npm run dev` tergantung instruksi dari proyeknya. Meskipun menulis kode langsung juga sangat memungkinkan karena Firebase Studio sudah dilengkapi editor kode yang mumpuni.

![download and zip](/assets/asisten/firebase-download.png)

Dan hasilnya dapat dilihat di tautan [Firebase Studio berikut](https://studio--plain-thoughts.us-central1.hosted.app).

Bagaimana jika kita tidak menggunakan Node.js atau Next.js? Mengingat berbagai alat desain berbasis AI sebagian besar menggunakan Node.js atau React sebagai fondasi, solusinya adalah meminta AI untuk mengonversi hasil desain ke platform lain yang diinginkan.

Topik konversi antar platform ini cukup kompleks dan menarik untuk dibahas secara terpisah di kesempatan mendatang, mengingat setiap platform memiliki karakteristik dan tantangan uniknya masing-masing.

## Kesimpulan

Artikel ini membahas langkah berikutnya setelah perencanaan matang dalam pengembangan perangkat lunak: **eksekusi kode**. Artikel ini menekankan pentingnya membuat _mockup_ desain dalam bentuk HTML, CSS, dan JavaScript langsung, ketimbang menggunakan gambar statis, untuk menghemat waktu dan memungkinkan pengujian interaksi.

Pembahasan kemudian beralih ke pemilihan _tools_ yang tepat. Meskipun asisten koding seperti GitHub Copilot, Cursor, atau Gemini Code Assist sangat membantu, layanan khusus seperti Bolt, v0, atau Firebase Studio direkomendasikan untuk antarmuka yang lebih menawan. Artikel ini juga menyoroti keuntungan **_AI Interface Builder_** dalam menyiapkan _project boilerplate_ yang terstruktur, terutama untuk pengembangan berbasis Node.js.

Namun, ada **tantangan integrasi manual** yang perlu diperhatikan. AI sering kesulitan dengan integrasi kompleks seperti database atau sistem otentikasi. Oleh karena itu, menyiapkan integrasi terlebih dahulu atau menggunakan _framework_ dengan fitur lengkap seperti Elixir Phoenix, Ruby on Rails, atau PHP Laravel dapat menjadi solusi yang lebih efektif.

Menarik ditunggu gebrakan dari Firebase Studio yang ingin mengintegrasikan beberapa alat tambahan seperti database, otentikasi dan lain sebagainya.

Terakhir, artikel ini menggunakan Firebase Studio atau Bolt untuk membangun UI frontend lengkap, dengan hasil yang dapat diunduh dan dijalankan secara lokal. 

Dan apabila hasil desain dan kode yang dihasilkan AI terlalu kompleks, teman-teman bisa jadikan hasil desain tersebut sebagai *mockup* saja. Lalu tiru desainnya dengan menulis kode versi kita sendiri.

## Referensi selanjutnya

- [Kumpulan artikel menarik seputar AI dan LLM dalam Bahasa Indonesia](https://dekontaminasi.substack.com)
-  [https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)
-  [https://danieldelaney.net/chat](https://danieldelaney.net/chat)
-  [https://learn.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agent](https://learn.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agent)
- [https://firebase.blog/posts/2025/05/whats-new-at-google-io](https://firebase.blog/posts/2025/05/whats-new-at-google-io)


---
title: Belajar Paradigma Fungsional dengan Elixir
permalink: /elixir/
date: 2024-07-16
layout: tulisan
description: Belajar bahasa fungsional Elixir
image: ""
eleventyExcludeFromCollections: true
tags: catatan
---

Mari kita memulai petualangan seru ke dunia Elixir, bahasa pemrograman yang semakin populer di kalangan developer. Elixir menawarkan kombinasi menarik antara fungsionalitas, konkurensi, dan dinamisme, menjadikannya pilihan yang tepat untuk membangun aplikasi modern yang tangguh dan skalabel.

Artikel ini merupakan ringkasan dari sesi _livestream_ belajar bareng Elixir.

<iframe style="max-width: 100%" width="560" height="315" src="https://www.youtube.com/embed/L5pG71cZPgA" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="allowfullscreen"> </iframe>

**Kenapa Elixir?**

Bayangkan sebuah aplikasi yang mampu menangani jutaan pengguna secara bersamaan tanpa mengalami _down_ sama sekali! Bayangkan pula proses pengembangan yang cepat dan efisien berkat sintaksis yang elegan dan mudah dipahami. Itulah Elixir!

Berikut beberapa alasan mengapa Elixir layak dipertimbangkan:

- **Fault-tolerance:** Elixir berjalan di atas mesin virtual Erlang (BEAM) yang terkenal dengan keandalannya. Aplikasi Elixir memiliki kemampuan bawaan untuk menangani kesalahan, memastikan aplikasi tetap berjalan meskipun terjadi kegagalan pada satu proses.
- **Concurrency:** Elixir dirancang untuk menangani konkurensi dengan mudah dan elegan. Model aktor yang diadopsi Elixir memungkinkan pengembangan aplikasi yang responsif dan berkinerja tinggi, ideal untuk aplikasi real-time seperti chat, game online, dan sistem terdistribusi.
- **Scalability:** Elixir sangat skalabel, membuatnya ideal untuk aplikasi dengan lalu lintas tinggi dan kebutuhan pemrosesan yang intensif. Aplikasi Elixir dapat dengan mudah didistribusikan ke beberapa server, memastikan kinerja yang optimal bahkan saat jumlah pengguna meningkat drastis.

**Dimana Elixir digunakan?**

Elixir telah diadopsi oleh berbagai perusahaan terkemuka seperti WhatsApp, Discord, Pinterest, Bleacher Report, dan Soundcloud. Di Indonesia sendiri, perusahaan seperti Qisqus, Mekari, dan Bhinneka kabarnya telah memanfaatkan kekuatan Elixir untuk membangun aplikasi mereka.

**Bagaimana cara memulai?**

Jangan khawatir, memulai dengan Elixir tidaklah sesulit yang dibayangkan. Dokumentasi resmi Elixir sangat lengkap dan mudah dipahami, bahkan untuk pemula sekalipun. Platform pembelajaran seperti Elixir School, Pragmatic Studio, dan berbagai video YouTube juga menyediakan berbagai pembelajaran Elixir yang komprehensif.

**Pada artikel ini, kita akan menjelajahi berbagai konsep penting dalam Elixir, termasuk tipe data dasar, fungsi, modul, dan fitur-fitur unggulannya seperti _pattern matching_ dan _fault tolerance_.**

### Menelusuri Tipe Data Dasar Elixir

Mari kita telusuri tiga tipe data dasar di Elixir:

**1. Atom:**

- **Konsep:** Bayangkan sebuah label yang merepresentasikan sebuah ide atau status. Itulah atom! Atom adalah konstanta yang nilainya sama dengan namanya. Atom biasanya digunakan untuk merepresentasikan kondisi atau status, seperti `:ok` dan `:error`.
- **Contoh Kode:**

```elixir
:ok
:error
:user
:success
```

- **Penjelasan:** Kode di atas menunjukkan contoh atom. Atom ditulis dengan diawali titik dua (`:`). Atom `:ok` sering digunakan untuk menunjukkan bahwa sebuah operasi berhasil, sementara `:error` mengindikasikan adanya kesalahan.

**2. String:**

- **Konsep:** String adalah untaian karakter yang membentuk teks. Di Elixir, string direpresentasikan sebagai binary, artinya setiap karakternya direpresentasikan oleh satu atau lebih byte. String diapit oleh tanda kutip ganda (`"`) dan mendukung karakter UTF-8, memungkinkan penggunaan berbagai bahasa dan simbol.
- **Contoh Kode:**

```elixir
"Hello World"
"Selamat Pagi"
"こんにちは世界"
```

- **Penjelasan:** Kode di atas menunjukkan contoh string. String pertama dan kedua menggunakan karakter Latin, sedangkan string ketiga menggunakan karakter Jepang.

**3. List:**

- **Konsep:** List adalah struktur data yang menyimpan urutan nilai. Bayangkan sebuah daftar belanjaan yang berisi berbagai item. Itulah list! List di Elixir adalah linked list, artinya setiap elemennya menunjuk ke elemen berikutnya.
- **Contoh Kode:**

```elixir
[1, 2, 3]
["apple", "banana", "orange"]
[1, "hello", :ok]
```

- **Penjelasan:** Kode di atas menunjukkan contoh list. List pertama berisi angka, list kedua berisi string, dan list ketiga berisi campuran angka, string, dan atom.

### Memahami Fungsi dan Modul di Elixir

**1. Fungsi:**

- **Konsep:** Fungsi adalah blok kode yang dirancang untuk melakukan tugas tertentu. Fungsi menerima input (argumen) dan menghasilkan output (nilai kembalian). Di Elixir, fungsi adalah _first-class citizen_, artinya fungsi dapat disimpan dalam variabel, diteruskan sebagai argumen, dan dikembalikan oleh fungsi lain.
- **Contoh Kode:**

```elixir
defmodule Calculator do
  def add(a, b) do
    a + b
  end
end
```

- **Penjelasan:** Kode di atas mendefinisikan modul `Calculator` dengan fungsi `add` yang menerima dua argumen (`a` dan `b`) dan mengembalikan hasil penjumlahannya.

**2. Modul:**

- **Konsep:** Modul adalah cara untuk mengelompokkan fungsi dan data terkait. Modul membantu mengorganisir kode dan mencegah konflik penamaan.
- **Contoh Kode:** (sama dengan contoh kode fungsi di atas)
- **Penjelasan:** Kode di atas mendefinisikan modul `Calculator` yang berisi fungsi `add`. Modul membantu mengorganisir kode dan mencegah konflik penamaan.

### Fitur Unggulan Elixir: Pattern Matching dan Fault Tolerance

**1. Pattern Matching:**

- **Konsep:** Pattern matching adalah fitur canggih di Elixir yang memungkinkan kita membandingkan data dengan pola tertentu. Pattern matching digunakan untuk mengekstrak data, mengontrol alur program, dan menangani berbagai kondisi.
- **Contoh Kode:**

```elixir
case status do
  :ok -> "Operasi berhasil"
  :error -> "Terjadi kesalahan"
  _ -> "Status tidak diketahui"
end
```

- **Penjelasan:** Kode di atas menggunakan `case` untuk melakukan pattern matching terhadap variabel `status`. Jika `status` adalah `:ok`, maka pesan "Operasi berhasil" akan ditampilkan. Jika `status` adalah `:error`, maka pesan "Terjadi kesalahan" akan ditampilkan. Jika `status` tidak cocok dengan pola yang didefinisikan, maka pesan "Status tidak diketahui" akan ditampilkan.

**2. Fault Tolerance:**

- **Konsep:** Fault tolerance adalah kemampuan sistem untuk tetap berjalan meskipun terjadi kesalahan. Elixir, yang berjalan di atas BEAM, memiliki kemampuan fault tolerance yang luar biasa. BEAM mengisolasi proses-proses yang berjalan, sehingga kesalahan pada satu proses tidak akan mempengaruhi proses lain.
- **Contoh Penerapan:** Bayangkan sebuah aplikasi chat yang dibangun dengan Elixir. Jika terjadi kesalahan pada proses yang menangani pesan dari satu pengguna, proses-proses lain yang menangani pesan dari pengguna lain tetap berjalan tanpa terpengaruh.

### Keuntungan Immutability dalam Elixir

Salah satu konsep penting di Elixir adalah immutability. Artinya, data di Elixir tidak dapat diubah setelah didefinisikan. Ketika kita "mengubah" sebuah list, Elixir sebenarnya membuat list baru dengan perubahan yang diinginkan, tanpa mengubah list aslinya. Konsep ini memastikan data tetap konsisten dan mencegah efek samping yang tidak diinginkan.

### Elixir: Membangun Aplikasi Modern yang Tangguh dan Skalabel

Elixir, dengan kombinasi fitur-fitur canggihnya, merupakan pilihan yang tepat untuk membangun aplikasi modern yang tangguh dan skalabel. Elixir ideal untuk aplikasi real-time, sistem terdistribusi, dan aplikasi dengan lalu lintas tinggi.

**Referensi:**

- [Dokumentasi Resmi Elixir](https://elixir-lang.org/docs.html)
- [Elixir School](https://elixirschool.com/)
- [Adopting Elixir](https://pragprog.com/titles/tvmelixir/adopting-elixir/)

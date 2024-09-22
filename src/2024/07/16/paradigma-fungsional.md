---
title: Belajar Paradigma Fungsional dengan Elixir
permalink: /fungsional-elixir/
date: 2024-07-16
layout: tulisan
description: Belajar bahasa fungsional Elixir
image: ""
eleventyExcludeFromCollections: true
---

Dunia pemrograman sangat dinamis perkembangannya. Selalu ada saja hal baru yang muncul kepermukaan. Mulai dari bahasa pemrograman baru, kerangka kerja baru, pustaka baru dan lain sebagainya. Hal ini terjadi salah satunya karena ditemukannya masalah-masalah baru yang mungkin belum terpikirkan atau belum pernah terjadi sebelumnya.

Beberapa tahun belakangan kita menjadi saksi munculnya beberapa bahasa pemrograman baru. Scala, Clojure, Groovy dan Kotlin yang berkembang dari ekosistem Java yang mengusung paradigma berbasis objek. Dengan Scala, kita dapat menggunakan paradigma fungsional dan paradigma berbasis objek. Clojure mengusung idealisme paradigma fungsional. Groovy dengan tipe dinamisnya, sedikit bertolak belakang dengan Java yang bertipe statis.

Swift yang muncul untuk ekosistem Apple sebagai solusi untuk beberapa masalah yang dihadapi para pengembang aplikasi iOS dan macOS yang sebelumnya menggunakan bahasa pemrograman Objective-C, turunan dari bahasa C dengan bumbu pemrograman berbasis objek.

Kecepatan dan performa yang dihasilkan oleh bahasa C dan C++ yang sampai saat ini belum ada tandingannya membuat beberapa pengembang bahasa dan perusahaan terkemuka tertantang untuk menciptakan bahasa pemrograman baru. Google mengembangkan bahasa pemrograman Go yang mengedepankan kemudahan sekaligus performa yang sangat baik. Mozilla juga mengembangkan bahasa pemrograman Rust yang memiliki kemampuan untuk mengeksekusi kode yang lebih cepat dibanding bahasa pemrograman lain.

Paradima pun terjadi pergeseran. Bahasa seperti Go menggunakan paradigma berbasis objek, namun berbeda dengan bahasa yang mengusung paradigma berbasis objek seperti Java dan C#. Tidak ada sintaksis `class`, tidak mengenal konsep _subtype inheritance_, dan lain sebagainya. Go menggunakan paradigma berbasis objek dengan menggunakan struktur data Struct.

Muncul juga gaya pemrograman yang berbeda-beda. Ada gaya imperatif yang menggunakan _control flow_ seperti kondisi dan perulangan. Lalu ada pula gaya deklaratif yang menggunakan konsep-konsep fungsional seperti pencocokan pola atau _pattern matching_ alih-alih menggunakan _control flow_ seperti gaya imperatif. Gaya deklaratif ini cukup populer digunakan untuk membangun antarmuka aplikasi. React di JavaScript, SwiftUI di Swift, dan Jetpack Compose di Kotlin menggunakan gaya deklaratif ini.

Perkembangan perangkat keras juga menjadi salah satu penyebab munculnya hal-hal baru tersebut. Kecepatan prosesor yang sudah 'mentok' dan sulit ditingkatkan menjadi lebih cepat lagi. Namun di sisi lain, jumlah inti prosesor bertambah banyak secara eksponensial menyebabkan perubahan cara mengeksekusi kode agar dapat memanfaatkan _multi-core_ dari prosesor. Jika sebelumnya jika aplikasi dirasa sudah mulai lambat, kita bisa _upgrade_ prosesor dengan _clock speed_ yang lebih tinggi. Sekarang sudah tidak bisa lagi dilakukan karena _clock speed_ sudah 'mentok'.

Referensi: http://www.gotw.ca/publications/concurrency-ddj.htm

Sehingga berkembang konsep _concurrent programming_ atau _parallel programming_, yang memungkinkan kita menggunakan banyak inti prosesor untuk mengeksekusi kode secara bersamaan. Beberapa bahasa mulai mengadopsi hal ini seperti Go dengan goroutine, Elixir dan Erlang dengan processes, dan Kotlin dengan coroutine.

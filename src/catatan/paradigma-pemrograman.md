---
title: 🪴 Catatan Tentang Paradigma Pemrograman
created: 2024-09-22
modified: 2024-09-21
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: false
---

Dunia pemrograman sangat dinamis perkembangannya. Selalu ada saja hal baru yang muncul kepermukaan. Mulai dari bahasa pemrograman baru, kerangka kerja baru, pustaka baru dan lain sebagainya. Hal ini terjadi salah satunya karena ditemukannya masalah-masalah baru yang mungkin belum terpikirkan atau belum pernah terjadi di era sebelumnya.

Beberapa tahun belakangan kita menjadi saksi munculnya beberapa bahasa pemrograman baru. [Scala](https://www.scala-lang.org/), [Clojure](https://clojure.org/), [Groovy](https://groovy-lang.org/) dan [Kotlin](https://kotlinlang.org/) yang berkembang dari ekosistem Java yang mengusung paradigma berbasis objek. Dengan Scala, kita dapat menggunakan paradigma fungsional dan paradigma berbasis objek. Clojure mengusung idealisme paradigma fungsional. Groovy dengan tipe dinamisnya, bertolak belakang dengan Java yang bertipe statis.

[Swift](https://www.swift.org/) yang muncul untuk ekosistem Apple sebagai solusi untuk beberapa masalah yang dihadapi para pengembang aplikasi iOS dan macOS yang sebelumnya menggunakan bahasa pemrograman [Objective-C](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/Introduction/Introduction.html), turunan dari bahasa C dengan bumbu pemrograman berbasis objek.

Kecepatan dan performa yang dihasilkan oleh bahasa C dan C++ yang sampai saat ini belum ada tandingannya membuat beberapa pengembang bahasa dan perusahaan terkemuka tertantang untuk menciptakan bahasa pemrograman baru. Google mengembangkan [bahasa pemrograman Go](https://go.dev/) yang mengedepankan kemudahan sekaligus performa yang sangat baik. Mozilla juga mengembangkan [bahasa pemrograman Rust](https://www.rust-lang.org/) yang memiliki kecepatan mendekati C/C++.

### Pergeseran Paradigma

Paradima pun terjadi pergeseran. Bahasa seperti Go yang menggunakan paradigma berbasis objek, namun berbeda dengan bahasa yang mengusung paradigma berbasis objek seperti Java dan C#. Tidak ada sintaksis `class`, tidak mengenal konsep _subtype inheritance_, dan lain sebagainya. Go menggunakan paradigma berbasis objek via struktur data Struct.

Muncul juga gaya pemrograman yang berbeda-beda. Ada gaya imperatif yang menggunakan _control flow_ seperti kondisi dan perulangan. Lalu ada pula gaya deklaratif yang menggunakan konsep-konsep fungsional seperti pencocokan pola atau _pattern matching_ alih-alih menggunakan _control flow_ seperti gaya imperatif. Gaya deklaratif ini cukup populer digunakan untuk membangun antarmuka aplikasi. React di JavaScript, SwiftUI di Swift, dan Jetpack Compose di Kotlin menggunakan gaya deklaratif ini karena sepertinya lebih cocok mendeklarasikan apa yang ingin kita lihat.

### Perkembangan Perangkat Keras

Perkembangan perangkat keras juga menjadi salah satu penyebab munculnya hal-hal baru tersebut. Kecepatan prosesor yang sudah mulai 'mentok' dan sulit ditingkatkan menjadi lebih cepat lagi. Namun di sisi lain, jumlah inti prosesor bertambah secara eksponensial menyebabkan perubahan cara mengeksekusi kode agar dapat memanfaatkan _multi-core_ dari prosesor. Jika sebelumnya jika aplikasi dirasa sudah mulai lambat, kita bisa _upgrade_ prosesor dengan _clock speed_ yang lebih tinggi. Sekarang sudah tidak bisa lagi dilakukan karena _clock speed_ sudah nyaris 'mentok'. Tren ini disebut sebagai [The Free Lunch is Over, A Fundamental Turn Toward Concurrency in Software](http://www.gotw.ca/publications/concurrency-ddj.htm) yang pertama kali dipopulerkan oleh Herb Sutter. _Free lunch_ disini maksudnya _scaling hardware_ (dalam hal ini CPU) sudah tidak semudah sebelumnya.

![Tren CPU Clock Speed](/assets/images/Microprocessor-clock-frequency-data-14-and-trend.png)
Gambar dikutip dari publikasi karya [Michael L. Rieger](https://www.researchgate.net/publication/338517514_Retrospective_on_VLSI_value_scaling_and_lithography).

> "Concurrency is the next major revolution in how we write software" -- Herb Sutter

Berkembanglah konsep _concurrent programming_ atau _parallel programming_ dalam mengembangkan aplikasi, yang memungkinkan kita menggunakan banyak inti prosesor untuk mengeksekusi kode secara bersamaan. Beberapa bahasa mulai mengadopsi hal ini seperti Go dengan goroutine, Elixir dan Erlang dengan processes, dan Kotlin dengan coroutine.

Kode berikut merupakan gambaran perbedaan antara kode yang belum menggunakan _concurrency_ dan kode yang memanfaatkkan _concurrency_ sehingga semua inti prosesor digunakan saat eksekusi kode.

## Kode Tanpa _Concurrency_
Mari kita coba kode tanpa memanfaatkan _concurrency_ lalu dibandingkan dengan _concurrency_. Kedua kode dibawah dikembangkan menggunakan bahasa Elixir.

```elixir
defmodule Sequence do
  # calculate function
  # ...

  def map([], _fun), do: []
  def map([head | tail], fun), do: [fun.(head) | map(tail, fun)]
end

IO.inspect(Sequence.map([35, 36, 37, 38, 39, 40, 41], fn n -> Sequence.calculate(n) end))

```

Jika kode diatas dijalankan, akan memakan waktu sekitar 78.33 detik. Hal ini karena proses kalkulasi dijalankan satu-per-satu dan inti prosesor yang digunakan hanya sebagian sedangkan beberapa inti prosesor lainnya _nganggur_.

![](/assets/images/elixir-seq-code.png)

## Kode dengan _concurrency_

Sekarang mari kita gunakan kode dengan _concurrency_.

```elixir
defmodule Sequence do
  def calculate(0), do: 1
  def calculate(1), do: 1
  def calculate(n), do: calculate(n - 1) + calculate(n - 2)

  def map([], _fun), do: []
  def map([head | tail], fun), do: [fun.(head) | map(tail, fun)]

  def pmap(collection, fun) do
    collection |> spawn_children(fun) |> collect_results
  end

  def spawn_children(collection, fun) do
    collection |> map(fn elem -> spawn_child(elem, fun) end)
  end

  def spawn_child(value, fun) do
    spawn(__MODULE__, :child, [value, fun, self()])
  end

  def child(value, fun, parent) do
    send(parent, {self(), fun.(value)})
  end

  def collect_results(pids) do
    pids |> map(fn pid -> collect_result_per_pid(pid) end)
  end

  def collect_result_per_pid(pid) do
    receive do
      {^pid, result} -> result
    end
  end
end

IO.inspect(
  Sequence.pmap([35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], fn n -> Sequence.calculate(n) end)
)
```

Dengan menggunakan fungsi `pmap`, iterasi dijalankan secara parallel masing-masing satu proses atau _worker_ untuk setiap angka yang akan dikalkulasi. Kemudian hasilnya dikumpulkan untuk dikembalikan. Kali ini eksekusinya memakan waktu 32,88 detik saja. Dan seperti gambar dibawah, semua inti prosesor laptop saya ikut bekerja.

![](/assets/images/pmap.png)

## Penutup

Sebenarnya ada beberapa lagi paradigma lainnya, dengan berbagai percabangan lainnya. Namun untuk sederhananya kita bisa gunakan pengelompokan seperti ilustrasi berikut.

![](/assets/images/paradigma.png)

Kurang tahu ilustrasi ini tepat atau tidak namun cukup masuk akal menurut saya. [Ilustrasi ini dikutip dari artikel berikut](https://blog.favouritejome.dev/the-world-of-programming-paradigms).

Menarik kali ya kalau kita bahas paradigma ini lebih lanjut dengan berbagai kelebihan dan kekurangannya masing-masing. Gimana menurut teman-teman? Boleh yuk sampaikan opininya di kolom komentar dibawah ini.

Dan kalau teman-teman penasaran dengan contoh kode Elixir, boleh cek sesi _livestreaming_ saya di kanal youtube setiap senin malam.

<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?si=H6OGMDRNmTmnIiTz&amp;list=PLTY2nW4jwtG8V_eYUz6qQp1ywP4wN3R4k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
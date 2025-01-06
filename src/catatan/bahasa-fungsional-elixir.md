---
title: 💧 Berkenalan dengan Bahasa Pemrograman Elixir
created: 2024-11-08
modified: 2024-12-03
layout: tulisan
tags:
  - catatan
  - elixir
eleventyExcludeFromCollections: false
---

Tulisan kali ini kita akan membahas tentang bahasa pemrograman Elixir. Elixir adalah bahasa pemrograman fungsional, dinamis, dan mudah dikelola.
Berjalan diatas BEAM (Erlang Virtual Machine) yang dikenal tangguh dan biasa digunakan untuk membangun sistem yang terdistribusi, atau hemat sumber daya dan *fault-tolerant* sehingga sistem yang dibuat tetap dapat digunakan meski terjadi kesalahan atau *error*. Istilah kerennya **let it crash!**

Setelah membaca tulisan ini, teman-teman akan mendapat gambaran tentang apa itu Elixir, keunggulan dan hal-hal menarik lainnya seputar bahasa pemrograman Elixir.

## Sejarah Singkat

Bahasa fungsional yang sudah cukup matang ini dikembangkan oleh Pak Jose Valim tahun 2012. Saat itu ia mengalami kesulitan melakukan *scaling* aplikasi Ruby yang sedang ia kerjakan. Terinspirasi dengan tangguhnya Erlang dan ErlangVM setelah membaca buku <a href="https://pragprog.com/titles/btlang/seven-languages-in-seven-weeks/" target="_blank">7 Languages in 7 Weeks</a>, ia lantas mengembangkan bahasa modern yang dapat berjalan diatas ErlangVM dengan berbagai alat bantu yang lebih modern.

Elixir menggunakan paradigma fungsional sehingga kode Elixir menjadi lebih jelas,  transformasi data yang transparan dan mudah diuji. Karena fungsional, melakukan concurrency di Elixir lebih mudah dicapai. Fitur *immutability* dalam bahasa fungsional memudahkan kita menjalankan instruksi secara paralel tanpa kendala *race condition*, *global state* dan sebagainya. 

Dan yang tak kalah penting, Elixir sudah memiliki ekosistem yang lengkap:
- **iex** — Interactive Elixir, REPL. Dapat digunakan untuk belajar, eksperimen dan debugging
- **mix** — Alat bantu untuk kompilasi, testing, generator dan mengelola pustaka tambahan
- **hex** — Kumpulan pustaka yang bisa digunakan di proyek Elixir
- **exunit** — Unit testing framework

Begitu pula dengan dukungan pustaka (library) dan kerangka kerja (framework) yang menanti untuk dicoba:
- **Phoenix** — framework modern untuk membangun aplikasi web interaktif, backend API, realtime, dan lengkap.
- **Ecto** — Alat untuk pemetaan data dan *database*. Terinspirasi dari LINQ di ekosistem C#
- **Nerves** — Platform dan infrastruktur untuk IoT. Karena Elixir hemat sumber daya, Elixir sangat mumpuni dijalankan di perangkat IoT
- **Membrane Framework** — Framework untuk mengelola multimedia stream, audio video transcoder, dsb
- **Nx** — Elixir juga dapat digunakan untuk kebutuhan *machine learning* dengan menggunakan Numerical framework yang namanya Nx.
- **Livebook** — Alat pencatatan interaktif yang dapat menjalankan kode Elixir dan berkolaborasi secara interaktif.

## Tipe data

Elixir menyediakan tipe data untuk merepresentasikan angka seperti integer, float. Ada pula tipe data atom yang merepresentasikan dirinya sendiri, string atau binary, charlist, dan boolean.

```elixir
product_name = "MacBook Pro"            # String
quantity = 157                          # Integer
stock_hex = 0x9D                        # Integer in Hex notation (157 in decimal)
price = 1299.99                         # Float
weight_sci = 1.4515e3                   # Float in scientific notation (1451.5)
available? = true                       # Boolean
category = :electronics                 # Atom
discount = nil                          # The 'None/null/Nil' value
IO.inspect([product_name, quantity, stock_hex, price, weight_sci, available?, category, discount])
```

### Struktur Data

Dalam pemrograman fungsional, struktur data memegang peranan yang sangat penting. Pemilihan struktur data dapat menentukan desain aplikasi secara keseluruhan. Elixir menyediakan beberapa struktur data seperti List, Tuple, Map dan Struct.

```elixir
message = "Hello, world!"
words = String.split(message, ", ")
list = [1, 2, 3]                                        # List
location = {1.5354, 3.325}                              # Tuple
person = %{name: "Riza", active: false}                 # Map
IO.inspect([message, words, list, location, person])
%{person | active: true}                                # update map
IO.inspect(person)                                      # immutable
%{active: false, name: "Riza"}
person = %{person | active: true}                       # rebinding
IO.inspect(person)
```

### Pencocokan Pola

Salah satu fitur andalan bahasa pemrograman fungsional yang belum tentu dipunyai oleh bahasa lainnya adalah fitur **pencocokan pola** atau *pattern matching*. Fitur ini akan sangat sering muncul dan digunakan di berbagai kesempatan.

```elixir
x = 22                                 # `=` adalah pattern matching
22 = x
x = 8                                  # re-binding variable
22 = x
** (MatchError) no match of right hand side value: 8

^x = 8                                 # pin x ke nilai sebelumnya

{:ok, grocery} = {:ok, ["sirop", "es batu", "cincau"]}  
[item0, item1, item2] = grocery
[head | tail] = grocery
IO.inspect(head)                        # "sirop"
IO.inspect(tail)                        # ["es batu", "cincau"]
case grocery do
  [1, 2, 3] -> "won't match"
  {"sirop", "es batu", "cincau"} -> "won't match, list vs tuple"
  ["sirop", item, "cincau"] -> "matches & binds '#{item}' to variable item"
  _ -> "default"
end
```

### Modul dan Fungsi

Modul dapat membantu mengelompokkan fungsi-fungsi. Fungsi harus didefinisikan didalam modul. Jika ingin mendefinisikan fungsi tanpa modul, dapat menggunakan fungsi anonim, yang tidak membutuhkan nama.

```elixir
defmodule Calc do                   # Modul dan Fungsi
  def add(a, b) do
    a + b                           # implicit return
  end
end
IO.inspect(Calc.add(2, 3))          # Eksekusi fungsi

add = fn (a, b) ->                  # Fungsi anonim
  a + b
end
IO.inspect(add.(1, 3))              # Eksekusi fungsi anonim
```
## Kesimpulan

Elixir adalah bahasa yang menarik untuk dicoba. Dengan paradigma fungsional yang juga sangat menarik untuk digunakan. Tulisan ini sudah membahas tentang apa itu bahasa pemrograman Elixir, sejarah singkatnya, dan beberapa topik dasar seperti tipe data, struktur data, pencocokan pola, modul dan fungsi.

Untuk materi perkenalannya sekian dulu. Ingin bahasan apa di tulisan berikutnya? Berikan masukan untuk materi ini di kolom komentar dibawah.

Jika teman-teman ingin belajar lebih lengkap dari dokumentasi Elixir, bisa cek playlist video berikut.

<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?si=hmi00jPXsoswQiik&amp;controls=0&amp;list=PLTY2nW4jwtG8V_eYUz6qQp1ywP4wN3R4k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Bisa juga bergabung ke grup telegram <a href="https://t.me/elixir_id" target="_blank">Elixir Indonesia</a>.

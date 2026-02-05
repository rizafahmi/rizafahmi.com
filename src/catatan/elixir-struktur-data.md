---
title: Struktur Data di Bahasa Pemrograman Elixir
created: 2024-12-21
modified: 2024-12-21
layout: tulisan
tags:
  - catatan
  - elixir
eleventyExcludeFromCollections: true
---
Elixir memiliki struktur data koleksi atau *collection types* yang biasanya dapat digunakan untuk mengoleksi berbagai bentuk data: List dan Tuple. Tulisan kali ini kita akan membahas tentang struktur data di bahasa pemrograman Elixir melanjutkan [perkenalan bahasa Elixir di artikel sebelumnya](https://rizafahmi.com/catatan/bahasa-fungsional-elixir/).

Setelah membaca tulisan ini, teman-teman akan mendapat gambaran lebih jelas dan lebih lancar menggunakan bahasa pemrograman Elixir. Karena bahasa fungsional seperti Elixir sangat menekankan transformasi data, sehingga pemilihan struktur data yang tepat akan sangat krusial.

## Struktur data List

List merupakan salah satu struktur data penting di Elixir. List, atau di beberapa bahasa lain disebut juga struktur data Array dapat menyimpan beragam tipe data yang didefinisikan dengan tanda kurung siku.

```elixir
numbers = [1, "two", 3, :four]
```

Untuk mengakses item dalam List bisa menggunakan fungsi `at` yang berada didalam modul `Enum`. Bisa juga menggunakan fungsi yang ada di module `List` seperti `List.first`, `List.last` dan sebagainya.

```elixir
Enum.at(numbers, 1)                  # "two"
List.first(numbers)                  # 1
List.last(numbers)                   # :four
```

Sedangkan untuk mengubah isi List dapat dilakukan dengan beberapa cara, salah satunya dengan `List.replace_at`.

```elixir
List.replace_at(numbers, 1, 2)        # [1, 2, 3, :four]
```


Jika ingin menambahkan item diawal bisa menggunakan notasi `|`. Namun jika ingin menambahkan item selain awal list, bisa menggunakan `List.insert_at`.

```elixir
[0 | numbers]                           # [0, 1, "two", 3, :four]
List.insert_at(numbers, 3, "x")         # [1, "two", 3, "x", :four]
List.insert_at(numbers, -1, "five")     # [1, "two", 3, :four, "five"]
```

Dua List dapat digabung dan dihapus isinya dengan `++` dan `--`.

```elixir
[1, 2, 3] ++ [4, 5]              # [1, 2, 3, 4, 5]
[1, 2, 3, 4, 5] -- [2, 3]        # [1, 4, 5]
```

Sedangkan untuk menghapus item dalam List dapat menggunakan `List.delete_at()` untuk menghapus berdasarkan urutan. Sedangkan untuk menghapus item berdasarkan isi atau nilainya, dapat menggunakan `List.delete()`

```elixir
List.delete_at(numbers, 3)        # [1, "two", 3]
List.delete(numbers, 3)           # [1, "two", :four]
```

Namun berbeda dengan struktur data Array, List berkaitan satu dengan item berikutnya, atau istilahnya *linked list*. List terdiri dari item pertama (head) dan List sisanya (tail).

TODO: Ilustrasi `[head | tail]`

```elixir
[head | tail] = numbers            # [0, 1, 2, 3]
IO.puts(head)                      # 0
IO.puts(tail)                      # [1, 2, 3]
[1 | [2 | [3 | []]]]               # [1, 2, 3]
```

Karena menggunakan format *linked list*, untuk menambah item diawal List merupakan operasi yang ringan sebaliknya menambahkan item diakhir merupakan operasi yang berat karena harus melakukan iterasi satu per satu sampai mendapatkan item terakhir (traversal).

TODO: Ilustrasi linked list traverse ke item terakhir

```elixir
numbers = [1, 2, 3]
numbers = [0 | numbers]            # fast
numbers = numbers ++ [4]           # slow
[1, 2, 3, 4]
```

## Struktur data Tuple

Struktur data Tuple menyimpan data secara *contiguously* dalam memori komputer. Hal ini memungkinkan kita untuk mengakses item dalam Tuple lebih cepat. Namun penggunaan Tuple lebih banyak memakan memori karena cara penyimpanan datanya yang *contiguously* tadi. Tuple cocok digunakan u
## Referensi
- [Elixir Full Course: 27 - Working with Lists, Shopping cart example](https://youtu.be/pUMgpFEbTBw?feature=shared)
- 
---
title: 'Rekursi: Fungsi Yang Memanggil Dirinya Sendiri'
date: 2020-03-26
slug: 'rekuris-atau-recursion'
cover: ''
---

Di artikel ini kita akan mempelajari salah satu dari konsep fundamental dari ilmu komputer, rekursi atau _recursion_. Rekursi sederhananya adalah fungsi yang memanggil fungsi tersebut atau dirinya sendiri. Namun tidak berhenti disitu saja, ada beberapa aspek yang harus dibahas sebelum kita menggunakan rekursi di kode kita.

Menurut saya pribadi, rekursi ini penting dan tidak penting. Penting karena kita bisa menciptakan solusi yang elegan untuk menerapkan D.R.Y atau (_don't repeat yourself_). Selain itu, rekursi adalah salah satu pengetahuan fundamental yang sangat diharapkan dikuasai oleh kita sebagai developer. Dan yang tidak kalah penting adalah banyak sekali algoritma diluar sana yang menggunakan rekursi sehingga dengan memahaminya, secara tidak langsung kita bisa mengerti algoritma yang menggunakan rekursi.

Namun sebenarnya pun tanpa rekursi pun kita bisa saja menggunakan perulangan untuk menciptakan solusi yang sama, namun dengan cara yang kurang elegan. Kembali menurut saya, setidaknya mengerti cara kerja rekursi adalah hal yang sangat krusial meskipun kita masih jarang menggunakannya.

Mari kita buat sebuah fungsi penghitung mundur. Tentu fungsi ini dapat dengan mudah kita buat dengan menggunakan perulangan, nanum untuk keperluan pembelajaran kita akan membuat versi rekursinya.

```javascript
function countdown(i) {
  console.log(i);
  countdown(i - 1);
}

countdown(10);
```

Jika dijalankan, maka akan menghasilkan keluaran sebagai berikut.

```txt
10
9
8
7
6
5
4
3
2
1
0
-1
-2
-3
-4
-5
-6
-7
-8
-9
-10
-11
-12
-13
-14
-15
-16
-17
....

RangeError: Maximum call stack size exceeded
```

Fungsi rekursi diatas akan menghasilkan _infinite loop_ hingga sumber daya komputer kita habis dan berhenti. Mengapa hal ini bisa terjadi? Karena kita berasumsi bahwa proses menghitung mundur akan berhenti jika mencapai angka 0 kan? Salah besar, karena contoh diatas akan terus berjalan menuju angka negatif.

Ada dua aspek yang harus dimiliki oleh fungsi rekursi. Sebuah fungsi rekursi harus _mengetahui kapan harus berhenti_ dan _kapan harus memanggil dirinya kembali_. Fungsi `countdown()` diatas sudah memanggil dirinya sendiri berulang kali hingga tak terhingga. Namun masih kurang aspek kapan harus berhenti. Sekarang kita akan menambahkan kondisi kapan fungsi `countdown()` ini harus berhenti.

```javascript
function countdown(i) {
  console.log(i);
  if (i <= 0) {
    return;
  } else {
    countdown(i - 1);
  }
}
countdown(10);
```

Dan jika kita eksekusi maka hasilnya akan sesuai keinginan kita.

```txt
$ node countdown.js
10
9
8
7
6
5
4
3
2
1
0
```

## Contoh Penggunaan Rekursi

### Fungsi Faktorial

Sekarang kita akan melihat salah satu contoh populer penggunaan rekursi, yaitu
faktorial. Faktorial adalah sebuah fungsi permutasi dari bilangan bulat positif
yang menggunakan notasi `n!`. Faktorial akan mengalikan bilangan dengan bilangan
berikutnya hingga terakhir dikalikan angka 1. Faktorial mengikuti rumus berkikut.

`n! = n * (n-1) * (n-2) * (n-3) * ... * 3 * 2 * 1`

Contoh, jika kita ingin mendapatkan faktorial dari 5.

`5! = 5 * 4 * 3 * 2 * 1 = 120`

Mari kita buat sebuah algoritma faktorial dengan perulangan terlebih dahulu.

```javascript
function computeFactorial(num) {
  let results = 1;

  for (let i = 2; i <= num; i++) {
    results = results * i;
  }

  return results;
}

console.log(computeFactorial(5));
```

Hasilnya tentu saja 120 apabila dijalankan. Dan sekarang mari kita membuat sebuah algoritma faktorial dengan menggunakan rekursi.

```javascript
function calculateFactorial(num) {
  if (num === 1) {
    return 1;
  } else {
    return num * calculateFactorial(num - 1);
  }
}

console.log(calculateFactorial(5));
```

Mari kita review penggunaan rekuris dari fungsi faktorial diatas. Fungsi rekursi
yang kita buat memiliki fungsi yang memanggil dirinya sendiri di baris ke-5
tepatnya dan juga fungsi juga mengetahui kapan harus berhenti, tepatnya ada di
baris ke-3.

Sayangnya JavaScript sebagai bahasa belum memiliki fitur semacam pencocokan pola
atau _pattern matching_ layaknya bahasa pemrograman fungsional. Jika punya, kode
diatas dapat kita buat menjadi lebih elegan 😎 seperti contoh dibawah ini dengan
menggunakan bahasa pemrograman [Elixir](https://elixir-lang.org) yang merupakan bahasa pemrograman fungsional.

```elixir
defmodule Factorial do
  def calculate(1) do
    1
  end

  def calculate(num) when num > 1 do
    num * calculate(num - 1)
  end
end

IO.inspect(Factorial.calculate(5))
```

### Fungsi Memutarbalikkan Array

Sebagai latihan, kita akan membuat sebuah fungsi yang menerima sebuah array dan
membalikkan isinya dari akhir ke awal dengan rekursi tentu saja. Misalkan saya
memiliki sebuah array `[1, 2, 3, 4, 5, 6]` dan akan menghasilkan `[6, 5, 4, 3, 2, 1]`. Untuk memudahkan proses pembuatan algoritma, saya akan menulis testing
terlebih dahulu.

```javascript
// reverse.test.js

const reverse = require('./reverse.js');

test('reverse array items, recursively', () => {
  expect(reverse([1, 2, 3, 4, 5, 6])).toEqual([6, 5, 4, 3, 2, 1]);
});
```

Dan sekarang kita akan menulis kode implementasinya seperti berikut.

```javascript
// reverse.js

function reverse(arr, newArr = []) {
  newArr.push(arr[arr.length - newArr.length - 1]);
  if (newArr.length === arr.length) {
    return newArr;
  }
  return reverse(arr, newArr);
}

module.exports = reverse;
```

Kode implementasi diatas bukanlah cara satu-satunya untuk menyelesaikan masalah
memutarbalikkan isi dari array. Ada banyak cara lainnya. Ini adalah cara yang
_kepikiran_ aja saat artikel ini ditulis 😃.

## Kesimpulan

Rekursi adalah sebuah cara elegan untuk menyelesaikan beberapa masalah dalam
pemrograman. Rekursi juga merupakan salah satu kemampuan fundamental yang
diharapkan sudah dikuasai oleh teman-teman yang ingin terjun ke dunia
pemrograman. Maka tak heran jika beberapa pertanyaan terkait rekursi akan muncul
ketika kita melakukan _coding interview_ di perusahaan teknologi.

Beberapa konsep struktur data pun seringkali menggunakan rekursi. Hal ini akan
kita bahas lain waktu.

Selamat belajar!

## Referensi

- [Buku 'Grokking Algorithms: An illustrated guide for programmers and other curious people'](https://www.manning.com/books/grokking-algorithms)
- [Video 'FrontendMasters Data Structures and Algorithms in JavaScript, Bianca Gandolfo'](https://frontendmasters.com/courses/data-structures-algorithms/)

---
title: "Notasi O Besar atau Big-O Notation"
date: 2020-03-21
permalink: /2020/03/21/notasi-o-besar-big-o-notation/
cover: "./valentin-lacoste-jNSJE8dMro0-unsplash.jpg"
layout: tulisan
tags:
  - catatan
  - computer-science
  - algoritma
  - javascript

---

Ketika kita memikirkan apakah barisan kode yang kita ciptakan sudah cukup "cepat" atau efisien dalam memecahkan masalah yang ingin kita pecahkan, maka kita butuh sebuah metodologi untuk menghitungnya. Salah satu alat bantu yang bisa kita gunakan adalah notasi O besar atau _Big-O Notation_.

Ini juga berarti kita ingin menghitung kompleksitas dari sebuah kode. Ada dua dimensi dalam menghitung kompleksitas kode. Pertama adalah kompleksitas ruang atau _space complexity_ yang berkaitan dengan berapa banyak ruang yang digunakan seperti memori ataupun harddisk komputer. Kedua adalah kompleksitas waktu atau _time complexity_ yang berkaitan berapa lama baris kode dijalankan.

Kenapa dibutuhkan sebuah metode untuk menghitung efisiensi kode? Karena kita tidak bisa hanya mengatakan bahwa kumpulan kode ini dapat dijalankan selama lima detik. Padahal sangat banyak faktor penentu lainnya seperti jumlah datanya, koneksi, latensi, jumlah memori, kecepatan prosesor dan masih banyak yang lainnya.

Karena itu kita butuh alat ukur untuk menghitung efisiensi kode secara relatif seperti notasi O besar ini.

# Sekilas Tentang Notasi O Besar

Notasi O besar atau yang lazim disebut dengan Big-O Notation adalah sebuah cara atau metode untuk melakukan analisa terhadap sebuah algoritma pemrograman terhadap waktu eksekusi. Tentang seberapa efisien dan kompleksitas barisan kode dalam dimensi waktu.

Di dalam sebuah program komputer pada umumnya, kita sudah lazim dengan istilah masukan-proses-keluaran.

![input, proses, output](/assets/images/notasi/input.png)

Notasi O besar merupakan skenario terburuk dari sebuah algoritma, dan biasanya terdapat notasi _n_ yang merepresentasikan jumlah masukan. Berikut adalah diagram notasi O besar dengan masukan yang dimulai dari 0 hingga tak terhingga.

![grafik](/assets/images/notasi/grafikcopy.png)

Dari diagram diatas dapat kita lihat beberapa notasi yang kerap muncul, yaitu: O<sub>(1)</sub>, O<sub>(log n)</sub>, O<sub>(n)</sub>, O<sub>(n<sup>2</sup>)</sub> atau O<sub>(n<sup>n</sup>)</sub>. Untuk membahasnya, mari kita berandai-andai membangun sebuah aplikasi travel. Dan kita diminta untuk membuat fitur baru yang menampilkan daftar kisaran harga dari hotel-hotel yang berada di area tertentu.

![kayak](/assets/images/notasi/kayak.png)

Untuk membuat fitur tersebut, sederhananya kita mencari harga terendah (min) dan harga tertinggi (max) dari daftar hotel. Tentunya semakin banyak datanya, akan semakin lama pula proses untuk mencari harga terendah dan tertinggi.

Dan berikut versi sederhana dari representasi data yang akan kita gunakan. Kita akan menggunakan JavaScript sebagai contoh. Dapat juga diaplikasikan ke bahasa pemrograman lain.

```javascript
const hotels = [
{ price: 180, brand: "Hotel Tugu Lombok" },
{ price: 78, brand: "Sheraton Senggigi Beach Resort" },
...
...
{ price: 317, brand: "The Oberio" }
]
```

## Pengulangan di Dalam Pengulangan: O<sub>(N<sup>2</sup>)</sub>

Sekarang, bagaimana caranya mencari harga terendah dan tertinggi? Cara yang paling naif adalah dengan membandingkan harga satu-per-satu. Berikut potongan kode sebagai ilustrasi.

```javascript
for (let i = 0; i < hotels.length; i++) {
  for (let j = 0; j < hotels.length; j++) {
    // kode untuk membandingkan satu harga dengan harga lainnya...
  }
}
```

Mari kita simulasikan ketika jumlah data semakin banyak.

| n              | 3   | 5   | 10  | 100   |
| -------------- | --- | --- | --- | ----- |
| Jumlah Operasi | 9   | 25  | 100 | 10000 |

Lihat tabel diatas, antara 3 dan 5 cukup dekat perbedaannya hanya dua. Namun jumlah operasi yang dijalankan sangat signifikan bedanya. Semakin banyak datanya semakin signifikan jumlah operasi yang dijalankan.

Dengan kata lain kita membutuhkan n<sup>2</sup> dan untuk mencari harga terendah (min) dan harga tertinggi (max). Itulah sebabnya kita menyebutnya dengan notasi <strong>O<sub>(n<sup>2</sup>)</sub></strong>. Algoritma seperti ini sangatlah lambat dan tidak optimal.

## Pengulangan Dari Sebuah Set: O<sub>(N)</sub>

Jika solusi pertama tidak optimal, adakah solusi lain? Tentu. Misalnya kita bisa mencari apakah harga adalah yang terendah atau tertinggi dalam satu kali pengulangan saja seperti ilustrasi kode berikut.

```javascript
for (let i = 0; i < hotels.length; i++) {
  // cari harga paling kecil...
  // cari harga paling besar...
}
```

Ketika kita membutuhkan proses "pengulangan untuk setiap item", merupakan notasi <strong>O<sub>(N)</sub></strong>.

## Hanya Satu Operasi: O<sub>(1)</sub>

Jika dengan asumsi bahwa data `hotels` sudah diurutkan berdasarkan harga terendah ke harga tertinggi, maka pencarian harga terendah dan tertinggi menjadi semakin efisien.

```javascript
const hotels = [
  { price: 78, brand: "Sheraton Senggigi Beach Resort" },
  { price: 180, brand: "Hotel Tugu Lombok" },
  ...
  ...
  { price: 317, brand: "The Oberio" }
]
```

Untuk mendapatkan harga terendah, kita tinggal memanggil `hotels[0].price`. Sementara untuk harga tertinggi kita bisa menggunakan `hotels[hotels.length-1].price`. Selain lebih mudah, eksekusi baris kode juga menjadi lebih cepat dan efisien.

Ketika kode menjalankan sebuah operasi, misalkan: _baris kode untuk mencari item barang teratas_ atau _mendapatkan nilai sebuah array dengan indeks ke-5_. Operasi seperti ini kita bisa sebut sebagai notasi O<sub>(1)</sub>.

Tidak masalah sebanyak apapun isi dari sebuah array atau sebanyak apapun jumlah baris di basis data, untuk mengambil nilai array dengan mengakses indeks maka algoritma berjalan secara konstan atau _constant time_.

Kita sudah melihat beberapa contoh algoritma untuk menampilkan kisaran harga dari yang terendah hingga tertinggi dan hasilnya sebagai berikut.

| Notasi O                    | Istilah Lain | Jumlah Operasi | Algoritma                                                                                 |
| --------------------------- | ------------ | -------------- | ----------------------------------------------------------------------------------------- |
| O<sub>(n<sup>2</sup>)</sub> | Quadratic    | n<sup>2</sup>  | Komparasi seluruh harga. Pengulangan dalam pengulangan                                    |
| O<sub>(n)</sub>             | Linear       | 2n             | Mencari harga terendah dan tertinggi. 1 kali pengulangan                                  |
| O<sub>(1)</sub>             | Constant     | 2              | Asumsi sudah diurut berdasarkan harga, tinggal mencari elemen pertama dan elemen terakhir |

Dan secara umum berikut urutan dari notasi O besar diurutkan dari yang tercepat hingga yang terpelan.

<--- Super Cepat --------------------------------------- Super Lambat --------->

| _Nama_   | Constant        | Logaritmic          | Linear          | Quadratic                   | Exponential                 |
| -------- | --------------- | ------------------- | --------------- | --------------------------- | --------------------------- |
| _Notasi_ | O<sub>(1)</sub> | O<sub>(log n)</sub> | O<sub>(n)</sub> | O<sub>(n<sup>2</sup>)</sub> | O<sub>(n<sup>n</sup>)</sub> |

![grafik](/assets/images/notasi/grafikcopy.png)

{% include 'kelas_struktur.njk' %}

## Beberapa Contoh Notasi O Besar

Mari kita melihat contoh notasi O besar dari fungsi, ekspresi dan operasi JavaScript yang sederhana.

### 1. Array.push()

`push()` merupakan sebuah metode untuk menambahkan item baru kedalam sebuah array. Item yang ditambahkan akan berada diakhir array tersebut. Contoh penggunaan dapat dilihat sebagai berikut.

```javascript
const animals = ["ants", "goats", "cows"];
animals.push("fish");
console.log(animals); // ['ants', 'goats', 'cows', 'fish']
```

Apakah notasi yang tepat untuk baris kode `animals.push('fish');`? Karena metode `push()` tidak peduli dengan seberapa banyak atau sedikit jumlah item yang ada, artinya operasi yang berjalan tetap sama, maka metode `push()` ini dapat diwakilkan dengan notasi <strong>O<sub>(1)</sub></strong> atau <strong>konstan</strong>.

### 2. Array.pop()

`pop()` merupakan sebuah metode yang mengambil item terakhir dari array sehingga jumlah item yang ada di array akan berkurang satu. Berikut contoh penggunaannya.

```javascript
const plants = ["broccoli", "cauliflower", "cabbage", "tomato"];
plants.pop();
console.log(plants); // ["broccoli", "cauliflower", "cabbage"]
```

Apakah notasi yang tepat untuk baris kode `plants.pop();`? Mirip seperti metode `push()` diatas, metode `pop()` juga tidak mempermasalahkan jumlah item yang ada, artinya operasi yang berjalan tetap sama, maka metode `pop()` ini juga dapat diwakilkan dengan notasi <strong>O<sub>(1)</sub></strong> atau <strong>konstan</strong>.

### 3. Array.unshift()

`unshift()` adalah sebuah metode untuk menambahkan satu atau beberapa item ke bagian awal dari sebuah array. Contoh penggunaannya sebagai berikut.

```javascript
const array1 = [1, 2, 3];
array1.unshift(4, 5);
console.log(array1); // [4, 5, 1, 2, 3]
```

Sekilas operasi `unshift()` ini terlihat seperti operasi yang konstan seperti `push()` dan `pop()` namun jika kita melakukan implementasi ulang metode ini, maka akan terlihat notasi yang sebenarnya. Berikut kira-kira implementasi dari `unshift()`, implementasi naif tentunya sekedar gambaran.

```javascript
function unshift(arr, newItem) {
  let newArr = [];
  newArr[0] = newItem;
  for (let i = 1; i < arr.length + 1; i++) {
    newArr[i] = arr[i - 1];
  }
  return newArr;
}
```

Hal yang menambah kompleksitas adalah ketika kita harus mengubah indeks dari array karena kita akan menempatkan item baru di indeks ke-0. Secara otomatis indeks akan bergeser sebanyak satu langkah. Dan karena itu kita menggunakan pengulangan `for` hingga menjadikan operasi `unshift()` dapat diwakilkan oleh notasi <strong>linear</strong> atau <strong>O<sub>(n)</sub></strong>. Kita harus menyadari apa yang dilakukan oleh sebuah fungsi, operasi ataupun pustaka sehingga kita dapat memprediksi kira-kira seberapa tingkat kompleksitasnya.

## Menghitung Total Kompleksitas Kode

Setelah sebelumnya kita sudah menghitung kompleksitas satu baris kode, sekarang kita akan menghitung total keseluruhan untuk beberapa baris kode. Kita akan mulai dari contoh sederhana terlebih dahulu.

```javascript
for (let i = 0; i < 10; i++) {
  // O(n)
  for (let j = 0; j < 10; j++) {
    // O(n)
    console.log(i); // O(1)
    console.log(j); // O(1)
  }
}
```

Kompleksitas potongan kode diatas dapat dihitung dengan mengalikan notasi-notasi setiap baris. Karena terdapat pengulangan bersarang, maka operasi yang digunakan adalah perkalian. Artinya hasil dari pengulangan bersarang tersebut adalah: <strong>O(n) \* O(n) = O<sub>(n<sup>2</sup>)</sub></strong>.

Jika perintah yang berada di level yang sama seperti:

```javascript
console.log(i); // O(1)
console.log(j); // O(1)
```

Maka operasi yang akan kita lakukan adalah menjumlahkan. Sehingga untuk kedua perintah diatas hasilnya adalah <strong>O<sub>(1)</sub> + O<sub>(1)</sub> = O<sub>(2)</sub></strong>. Jika digabungkan hasilnya menjadi <strong>O<sub>(n<sup>2</sup>)</sub> O<sub>(2)</sub></strong>. Namun biasanya untuk jenis kode diatas cukup dilambangkan dengan <strong>O<sub>(n<sup>2</sup>)</sub> \_ O<sub>(2)</sub></strong> karena <strong>O<sub>(2)</sub></strong> tidak signifikan perbedaannya.

Mari kita lihat contoh kode berikutnya.

```javascript
for (let i = 0; i < 10; i++) {
  // O(n)
  console.log(i);
}

for (let j = 0; j < 10; j++) {
  // O(n)
  console.log(j);
}
```

Potongan kode deiatas dapat dilambangkan sebagai <strong>O<sub>(n)</sub></strong> ditambah dengan <strong>O<sub>(n)</sub></strong> sehingga menjadi <strong>O<sub>(2n)</sub></strong>.

# Kesimpulan

Sebagai kesimpulan, notasi O besar atau _Big-O Notation_ merupakan metode untuk menghitung kompleksitas dari potongan kode yang kita buat. Sehingga dapat menumbuhkan kesadaran kita untuk mencari alternatif yang lebih baik sebelum data semakin besar dan berdampak kepada performa aplikasi yang kita buat.

Notasi O besar inipun tidak hanya semata berlaku di bagian kode yang kita tulis,
namun di _database_ pun berlaku. Jadi proses pengambilan data di database dengan
sintaksis SQL yang dapat dianggap sebagai proses perulangan akan sangat tidak
efektif jika di bagian algoritma kode kita kembali menggunakan perulangan. Maka
proses tersebut akan menjadi <strong>O<sub>(n<sup>2</sup>)</sub></strong> karena
akan terdapat perulangan didalam perulangan.

Begitu juga halnya jika kita mengambil data dengan tabel yang sudah diindeks.
Secara otomatis notasinya akan berubah dari <strong>O<sub>(n)</sub></strong>
menjadi <strong>O<sub>(log n)</sub></strong>.

![tanpa index](/assets/images/notasi/tanpa_index.png)

Tanpa menggunakan indeks database melakukan yang disebut dengan "Sequential
Scan". Beberapa yang lain menyebutnya dengan istilah "Full Table Scan" yang
kurang-lebih melakukan perulangan setiap barisnya dan membandingkan dengan
argumen query yang kita tentukan.

Dengan kata lain operasi _sequential_ seperti contoh diatas dapat kita beri
notasi <strong>O<sub>(n)</sub></strong>. Seiring bertambahnya jumlah data,
efisiensi akan semakin menurun.

Hal termudah untuk mengangkat performa untuk kasus ini adalah dengan menambahkan
indeks di tabel terkait dan kita dapat melihat perbedaan yang cukup signifikan
terutama ketika data sudah semakin banyak.

![dengan index](/assets/images/notasi/dengan_index.png)

Sehingga operasi diatas berubah notasinya menjadi <strong>O<sub>(log
n)</sub></strong>.

Hal yang menarik lainnya, [Redis](https://redis.io) sebuah _in-memory
database_ menyertakan notasi kompleksitas waktu di setiap perintah yang ada di
[dokumentasinya](https://redis.io/commands). Contohnya dapat dilihat seperti
perintah [append](https://redis.io/commands/append),
[del](https://redis.io/commands/del), [lpush](https://redis.io/commands/lpush),
dan masih banyak lagi yang lainnya.

Sebagai penutup, berikut daftar kompleksitas kode dari operasi-operasi yang umum kita jumpai.

| Kompleksitas                | Operasi                                                 |
| --------------------------- | ------------------------------------------------------- |
| O<sub>(1)</sub>             | Menjalankan sebuah perintah                             |
| O<sub>(1)</sub>             | Mendapatkan sebuah item dari array, objek atau variabel |
| O<sub>(log n)</sub>         | Pengulangan yang berkurang setengahnya setiap iterasi   |
| O<sub>(n<sup>2</sup>)</sub> | Pengulangan dalam pengulangan                           |
| O<sub>(n<sup>3</sup>)</sub> | Pengulangan dalam pengulangan dalam pengulangan         |

{% include 'kelas_struktur.njk' %}

# Referensi

- [Materi 'Four Semesters of Computer Science in Six Hours'](https://btholt.github.io/four-semesters-of-cs/)
- [Buku 'JavaScript Data Structures and Algorithms, Sammie Bae'](https://www.amazon.com/JavaScript-Data-Structures-Algorithms-Understanding/dp/1484239873)
- [Video 'FrontendMasters Data Structures and Algorithms in JavaScript, Bianca Gandolfo'](https://frontendmasters.com/courses/data-structures-algorithms/)

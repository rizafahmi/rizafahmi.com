---
title: "Perkenalan ReasonML, Sintaks Baru untuk OCaml"
date: 2018-12-10
permalink: /2018/12/10/perkenalan-reasonml/
cover: "./reason.jpeg"
layout: tulisan
tags: catatan
---

ReasonML adalah bahasa sintaks, ekstensi dan _toolchain_ yang berada diatas sebuah bahasa _jadul_ [OCaml](https://ocaml.org/). Selain dapat dikompilasi ke JavaScript dengan bantuan [BuckleScript](https://bucklescript.github.io/), Reason juga dapat dikompilasi menjadi aplikasi native melalui OCaml. Daripada membuat bahasa baru dari awal, tim Facebook memutuskan untuk membuat sintaks baru dan memperkaya _environment_ OCaml sehingga menjadi lebih modern dan kekinian. OCaml sendiri sudah digunakan lebih dari 20 tahun dan sudah teruji oleh industri sejak tahun 90-an.

Jika melihat sintaks Reason saat ini sudah mirip dan menyerupai ES6. Lihat perbandingan dibawah ini antara sintaks OCaml, Reason versi awal dan Reason terbaru. Semakin baru, sintaks nya semaki mirip ES6 atau JavaScript modern.

![Perbandingan sintaks OCaml, Reason lama, dan Reason terbaru.](https://cdn-images-1.medium.com/max/3860/1*i4DqT6krOCc5JH9Fk9CpmQ.png)_Perbandingan sintaks OCaml, Reason lama, dan Reason terbaru._

## Kenapa Menggunakan Reason

Ada beberapa alasan kenapa teman-teman perlu mempertimbangkan Reason sebagai platform yang layak untuk dipelajari. Selain proses kompilasi yang cepat dan sintaks yang familiar, ada beberapa keunggulan lainnya. Berikut beberapa diantaranya.

### Type System dan _Type Inference_

Seperti yang kita ketahui bersama, JavaScript bukanlah bahasa pemrograman yang memiliki _type system._ Dan semakin besar basis kode yang kita miliki akan semakin butuh kita akan _type system._ Makanya muncul beberapa solusi seperti TypeScript dan juga Flow.

TypeScript adalah sebuah bahasa pemrograman dari Microsoft yang merupakan _subset_ dari JavaScript dengan menambahkan _type system_. Jadi kita sebenarnya tetap bisa menulis JavaScript didalam file-file TypeScript.

Begitu juga dengan Flow, sebuah _static type checker_ untuk JavaScript yang juga berasal dari Facebook. Flow bertindak sebagai anotasi untuk kode JavaScript yang sudah ada. Uniknya, Flow dikembangkan menggunakan OCaml.

Dibandingkan dengan Reason? Pertama, Reason bukanlah sintaks baru untuk JavaScript. Reason adalah sintaks baru untuk OCaml, baru kemudian dari OCaml dikompilasi ke JavaScript. Kedua, fitur Reason lebih lengkap dan utamanya _type system_ jauh lebih **solid** berkat OCaml.

Dan yang bikin Reason lebih keren lagi adalah fitur _type inference_-nya. Reason dapat menebak _type_ dari kodingan kita tanpa harus mendefinisikan _type_-nya satu-per-satu. Dan fitur ini belum dapat ditandingi oleh TypeScript ataupun Flow. Mari kita lihat contohnya di rtop, REPL untuk Reason.

![Fungsi add menerima dua buah parameter integer dan fungsi add akan me-return integer juga.](https://cdn-images-1.medium.com/max/5760/1*nlpG7UlWXmAhIjF8FbgdyA.png)_Fungsi add menerima dua buah parameter integer dan fungsi add akan me-return integer juga._

Seperti bisa dilihat, kita membuat sebuah fungsi dengan nama add yang memiliki parameter a dan b dan menghasilkan penjumlahan a dengan b . Ketika mendeklarasikan fungsi add tersebut, kita tidak sama sekali mendefinisikan tipe data dari a, b dan juga hasil dari fungsi add. Akan tetapi setelah dievaluasi, menghasilkan kode berikut ini: `let add: (int, int) => int = <fun>;`. Artinya Reason dapat menebak bahwa tipe data a, b dan juga hasil dari add adalah integer.

Mari kita lihat satu contoh _type inference_ lagi yang lebih keren dengan menggunakan struktur data records.

![Reason mampu menebak records sesuai properti yang terkandung didalamnya.](https://cdn-images-1.medium.com/max/4612/1*GvIibB8iZCIUA2q879Bedg.png)_Reason mampu menebak tipe records sesuai properti yang terkandung didalamnya._

Ketika kita mendefinisikan sebuah record, disarankan untuk memberi anotasi atau catatan untuk mengarahkan sebuah variable kepada tipenya. Misalnya `let kuririn : person = { age: 31, name: "Kuririn" };`. Disini kita mendefinisikan record baru dengan tipe person seperti yang sudah kita definisikan sebelumnya. Tetapi sebenarnya kita tidak perlu melakukannya, seperti variable chiChi dan piccolo, kita tidak mendefinisikan sebagai tipe person, Reason dapat membedakan tipenya berdasarkan properti yang didefinisikan. Karena chiChi tidak memiliki properti species, maka chiChi dikategorikan sebagai person. Sementara piccolo karena memiliki properti species, maka ia termasuk nonPerson.

### Pesan Kesalahan yang Manusiawi

Dan karena _type system_ yang solid, Reason dapat menampilkan pesan kesalahan yang cukup detil dan manusiawi. Kita kembali ke contoh fungsi add sebelumnya yang menerima dua parameter integer. Bagaimana jika kita memanggil fungsi tersebut dengan parameter integer dan string?

![Pesan kesalahan yang detil dan manusiawi.](https://cdn-images-1.medium.com/max/3596/1*3VpX4PwJLhVS7e5ag_droQ.png)_Pesan kesalahan yang detil dan manusiawi._

Dari pesan kesalahan diatas sudah cukup jelas bahwa string “7” merupakan sumber kesalahan, karena diharapkan integer bukan string.

Jika kita menggunakan JavaScript fungsi tersebut akan dieksekusi dengan baik, meskipun hasilnya salah, yaitu menjadi “67”.

![Bukan pesan kesalahan yang kita dapatkan, akan tetapi bug yang akan muncul jika di JavaScript](https://cdn-images-1.medium.com/max/2000/1*zTMnImlX1yGVpZmAjp1WhA.png)

_Bukan pesan kesalahan yang kita dapatkan, akan tetapi bug yang akan muncul jika di JavaScript_

Hal ini cukup berbahaya, JavaScript dapat mengeksekusi pemanggilan fungsi diatas tanpa masalah, akan tetapi hasilnya nge-_bug_. Sebagai tambahan, Reason juga dapat mendeteksi _typo_ atau kesalahan pengetikan. Bayangkan berapa banyak bugs dan _typo_ yang dapat dihindari.

![Mendeteksi Typo.](https://cdn-images-1.medium.com/max/2000/1*6HeGFhbOkfMNG9saWV-FAA.png)_Mendeteksi Typo._

### Alat Bantu Yang Kompit

Meskipun tergolong baru, Reason sudah dilengkapi dengan alat bantu yang tergolong komplit. Hal ini juga terbantu dengan keputusan untuk menggunakan beberapa alat bantu yang sudah ada seperti yarn/npm, babel, create-react-app dan webpack. Sehingga selain melengkapi alat bantu lain, developer yang sudah terbiasa menggunakan yarn/npm dan webpack menjadi lebih mudah mempelajari Reason.

![Reason ‘meminjam’ beberapa alat bantu yang sudah ada di ekosistem JavaScript](https://cdn-images-1.medium.com/max/3888/1*eqqXemwsvNxetgfUFemx1Q.png)_Reason ‘meminjam’ beberapa alat bantu yang sudah ada di ekosistem JavaScript_

### Kemudahan Adopsi dan Kemudahan Untuk Dikelola

Reason berada di _sweet spot_ antara kemudahan adopsi dan kemudahan untuk dikelola. Dengan sintaks yang lebih familiar, terutama bagi modern JavaScript developer, mempelajari Reason akan menjadi lebih lancar. Dan dengan bantuan Type System dan fitur-fitur lainnya, kemudahan _maintenance_ pun dapat dicapai. Terutama dalam menghindari _bugs_ dan kesalahan yang umum terjadi ketika _runtime_ dipindah ke _compile time_ sehingga pengguna tidak terkena dampaknya. Ketika kode Reason berhasil dikompilasi, artinya kode kita sudah terbebas dari *silly mistakes *seperti _typo_ dan lain sebagainya. Jika tidak, maka proses kompilasi gagal.

![Grid yang diadaptasi dari *talk* Jared Forsyth ([https://jaredforsyth.com/](https://jaredforsyth.com/))](https://cdn-images-1.medium.com/max/3840/1*vktrkdYUCyeJQlTfvl7TUA.png)*Grid yang diadaptasi dari *talk* Jared Forsyth ([https://jaredforsyth.com/](https://jaredforsyth.com/))*

Seperti yang dapat dilihat dari ilustrasi diatas, JavaScript dan ES6 sangat mudah dipelajari. Lain halnya jika kita berbicara *maintenance *kode kita karena JavaScript tidak memiliki type system dan rentan _bugs_ dan kesalahan. TypeScript masih cenderung mudah dipelajari dan diadopsi. Proses _maintenance_ kodenya sendiri memang jauh lebih baik daripada JavaScript.

Dari sisi yang berbeda, maintenance kode di Haskell sangatlah mudah, bahkan jika sudah berjalan, kemungkinan besar kode Haskell tidak perlu dikelola lagi. Akan tetapi Haskell terkenal dengan bahasa yang sulit dimengerti dan dipelajari. Elm adalah versi _mainstream_ dari Haskell yang juga merupakan bahasa pemrograman yang dapat dikompilasi ke JavaScript.

Reason berada diposisi yang cukup strategis dimana kemudahan adopsi masih bisa ditoleransi dan kemudahan _maintenance_ juga masih tergolong cukup baik.

### Interopabilitas Dengan JavaScript

Seperti yang sudah dijelaskan sebelumnya, Reason menggunakan beberapa alat bantu yang juga digunakan oleh JavaScript seperti yarn/npm dan juga webpack. Sehingga ‘jarak’ dengan JavaScript terbilang masih cukup dekat apabila dibandingkan dengan Elm, misalnya.

Elm, menggunakan ekosistem dan _packages_ sendiri sehingga cukup menyulitkan apabila kita ingin memanfaatkan _library_ yang sudah tersedia di npm. Sementara dengan Reason menggunakan _library_ JavaScript masih sangat memungkinkan.

![Interopabilitas Reason dengan JavaScript masih cukup dekat.](https://cdn-images-1.medium.com/max/3212/1*zTSKdzAuvwzi61RQnUV47w.png)_Interopabilitas Reason dengan JavaScript masih cukup dekat._

### Komunitas Kecil Tapi Hangat

Karena memang masih tergolong baru, komunitas Reason masih cukup kecil untuk ukuran kuantitas, akan tetapi sangat hangat dan fokus.

> “The community is small but very focused on delivering a better experience for developers.” **Wojciech Bilicki**

Ngga percaya, berikut saya sertakan buktinya. Seorang teman di Facebook mem-post foto ini. Identitas disamarkan, tentunya.

![Disapa oleh Leader Komunitas ketika baru join grup discord.](https://cdn-images-1.medium.com/max/4148/1*gEXMwYk-7bq0LcPYBpHb8A.png)_Disapa oleh Leader Komunitas ketika baru join grup discord._

Bayangkan, seorang [Cheng Lou](https://twitter.com/_chenglou?lang=en), yang me-_lead_ project Reason punya waktu untuk _say hi_ kepada seseorang yang baru join komunitas adalah sebuah sentuhan yang hangat.

### Bahasa Fungsional Yang Permisif

Reason termasuk kedalam kategori bahasa fungsional nan deklaratif. Namun ia tidak melarang ketika kita ‘terpaksa’ menggunakan beberapa sintaks yang imperatif. Ketika kita kesulitan mendeklarasikan baris kode, kita masih dapat menggunakan _for loop_ yang imperatif atau bahkan variable pun dapat kita buat _mutable_.

![Penggunaan mutable variable dan imperative loop.](https://cdn-images-1.medium.com/max/2240/1*RsJilTLJ3joLfNEZG9C1Gw.png)_Penggunaan mutable variable dan imperative loop._

Jadi misalnya kita sedang belajar functional programming tetapi belum menguasai sepenuhnya, Reason tidak akan menghentikanmu menulis kode yang imperatif seperti diatas, sehingga produktifitas tetap terjaga.

## Memulai Reason

Untuk mulai menggunakan Reason, ada beberapa package yang kita butuhkan. Pertama, kita butuh reason-cli . Karena kita akan membuat aplikasi JavaScript di sisi client, kita juga butuh BuckleScript untuk melakukan kompilasi Reason atau OCaml ke JavaScript. Kedua _package_ tersebut dapat kita install menggunakan yarn atau npm.

    $ yarn global add reason-cli
    $ yarn global add bs-platform

Untuk membuat aplikasi sederhana, kita sekarang bisa menggunakan perintah:

```shell
    $ bsb -init nama-app -theme basic-reason
    $ cd nama-app
    $ tree
    ./reason-demo/
    ├── .vscode
    ├── src
    │   └── Demo.re
    ├── .gitignore
    ├── README.md
    ├── bsconfig.json
    └── package.json
```

Mari kita bahas satu-per-satu. Pertama ada folder src yang berisi kode Reason kita. Kemudian ada package.json yang merupakan daftar _dependencies_ sama seperti project JavaScript ataupun NodeJS.

![Isi file package.json](https://cdn-images-1.medium.com/max/2200/1*HCeyWrc1lpvI30BpCB2dbQ.png)_Isi file package.json_

Yang berbeda adalah bsconfig.json yang berisi *dependencies *dan konfigurasi untuk Reason dan BuckleScript seperti definisi source direktori, pengaturan penamaan dan lain sebagainya.

![Isi file bsconfig.json](https://cdn-images-1.medium.com/max/2200/1*T-UkFOCEFuCCYB5WOTm6yA.png)_Isi file bsconfig.json_

Sekarang mari kita coba buka file src/Demo.re . Isinya kodenya cukup sederhana, sebuah pesan Hello World.

![Placeholder kode Demo.re](https://cdn-images-1.medium.com/max/2240/1*G2-tutUVTQOX1K17E-2CCw.png)_Placeholder kode Demo.re_

Sekedar informasi, semua modul yang menggunakan Js.\* berasal dari BuckleScript. Contohnya Js.log, Js.Promise, Js.then\_ dan lain sebagainya. Dan untuk melakukan kompilasi dari Reason menjadi JavaScript, kita tinggal menjalankan perintah berikut.

```diff
    $ yarn build
    $ tree .
    .
    ├── .vscode
    ├── lib
    │   └── bs
    ├── src
    │   ├── Demo.bs.js
    │   └── Demo.re
    ├── .gitignore
    ├── .merlin
    ├── README.md
    ├── bsconfig.json
    └── package.json
```

Dan sekarang sudah ada sebuah file baru, Demo.bs.js . Mari kita lihat isinya.

![Hasil kompilasi BuckleScript](https://cdn-images-1.medium.com/max/2240/1*p8VliE5_MXpqGOWqbtKKJw.png)_Hasil kompilasi BuckleScript_

Seperti yang sudah bisa kita tebak, hasilnya adalah console.log . Script ini kemudian dapat kita gabungkan dengan file html, misalnya seperti ini.

![Load JavaScript file ke HTML](https://cdn-images-1.medium.com/max/2240/1*8C-dM0qfhXlGmoH7vSExkA.png)_Load JavaScript file ke HTML_

Dan kita buka file tersebut di browser dan jangan lupa buka _chrome console_ untuk melihat hasilnya.

![Dijalankan di browser](https://cdn-images-1.medium.com/max/3112/1*8ySipLVTgIAVtXWMgtZNRQ.png)_Dijalankan di browser_

Mari sekarang kita belajar sintaks Reason dengan membuat aplikasi perhitungan sederhana. Sekarang coba kita buat file baru src/Calc.re untuk membuat modul baru dengan nama Calc yang akan kita panggil nantinya dari src/Demo.re. Di Reason, file baru secara otomatis menjadi modul sendiri tanpa perlu export dan import. Mari lihat demonya.

## Mendeklarasikan Variable dan Fungsi

Untuk mendeklarasikan fungsi di Reason, mirip sekali dengan notasi yang biasa kita lihat di JavaScript modern. Dengan menggunakan sintaks let diikuti dengan nama fungsinya, notasi = lalu kemudian diikuti dengan pendefinisian argumen atau parameter dan dilanjutkan dengan tanda _arrow_ => terakhir diikuti dengan isi fungsinya. Jika isi fungsinya lebih dari satu baris, harus berada didalam _scope_ dengan {}. Jika hanya satu baris tidak perlu menggunakan _scope {}._

![Fungsi add di modul Calc](https://cdn-images-1.medium.com/max/2240/1*t8wSThN56mrG-q2smhNjYA.png)_Fungsi add di modul Calc_

Untuk memanggil fungsi add dari file Demo.re kita bisa lakukan dengan cukup mudah. Kita bisa menggunakan notasi titik atau _dot_. Reason secara otomatis memahami bahwa fungsi add berada didalam file Calc.re ketika kita memanggil dengan cara Calc.add().

Dan semua proses deklarasi variable menggunakan let . Lebih luas, let di Reason juga digunakan untuk _scoping_, mendeklarasikan fungsi, *pattern matching *dan banyak lagi.

![Memanggil modul Calc dan fungsi add dari modul Demo.](https://cdn-images-1.medium.com/max/2240/1*LAU7t8wv9JrjB2mIjZnPyg.png)_Memanggil modul Calc dan fungsi add dari modul Demo._

Untuk menjalankannya kita bisa lakukan perintah yarn build terlebih dahulu untuk konversi Reason ke JavaScript baru kemudian file JavaScript-nya kita eksekusi atau buka di file index.html yang sebelumnya sudah kita buat.

![Opps, error!](https://cdn-images-1.medium.com/max/2696/1*a-hgRCsAQNb1WktCrl7mIw.png)_Opps, error!_

Wah, ada _error_ di file Demo.bs.js di baris ke-empat. Mari kita lihat hasil konversinya.

![Error require di file Demo.bs.js](https://cdn-images-1.medium.com/max/2200/1*X1w2p1gQUCcFNBUmVjmLUg.png)_Error require di file Demo.bs.js_

Terjadi kesalahan di sintaks require. Hal ini terjadi karena browser belum mengerti sintaks exports dan juga require. Kita butuh bantuan _bundler_ seperti webpack, rollup ataupun parcel agar browser dapat mengeksekusinya. Jika Demo.bs.js kita eksekusi di sisi backend dengan NodeJS, semua bisa berjalan normal karena NodeJS sudah mendukung sintaks require dan juga exports. Mari kita lihat.

![Di NodeJS aplikasi berjalan normal](https://cdn-images-1.medium.com/max/2112/1*T9_NyXF8Gam1Z5-PuhZiNQ.png)_Di NodeJS aplikasi berjalan normal_

Karena kita ingin eksekusi di browser, mari kita buat project baru dan kita gunakan parcel sebagai bundler. Alasannya, karena parcel menerapkan _zero-configuration_ dibandingkan webpack yang harus melakukan konfigurasi terlebih dahulu. Jika belum, mari kita install parcel terlebih dahulu secara global dengan yarn atau npm. Kemudian kita akan buat folder baru untuk project kita dan buat file index.html.

    $ yarn global add parcel-bundler
    $ mkdir reason-parcel
    $ cd reason-parcel

![File index.html](https://cdn-images-1.medium.com/max/2240/1*6IHWwR3-_poLDzukl0Vs0g.png)_File index.html_

Buat juga file src/index.re dengan isi hello world terlebih dahulu untuk memastikan parcel berjalan sebagaimana mestinya. Kemudian untuk menjalankan, kita tinggal memanggil perintah parcel index.html.

![Placeholder index.re](https://cdn-images-1.medium.com/max/2240/1*JKgqgN1dSIHGnUKPB3AIHg.png)_Placeholder index.re_

Dan kita juga butuh file bsconfig.json sebagai penanda bahwa folder ini adalah project Reason. Kita samakan saja dengan konfigurasi di project sebelumnya.

![Konfigurasi bsconfig.json](https://cdn-images-1.medium.com/max/2200/1*9ExqMLUETZQH39UDGilbCQ.png)_Konfigurasi bsconfig.json_

Coba jalankan lagi perintah parcel index.html dan kemungkinan besar akan terjadi error karena project tidak mengetahui keberadaan package bs-platform yang kita install secara global sebelumnya. Dan dari pesan kesalahan seharusnya sudah cukup jelas apa yang harus kita lakukan selanjutnya.

![Package bs-platform tidak ditemukan](https://cdn-images-1.medium.com/max/4288/1*aB5Vpu42Gvtd1eTqqu2x8A.png)_Package bs-platform tidak ditemukan_

Kita tinggal menjalankan perintah npm link bs-platform sehingga npm akan me-_link_ project ini ke package bs-platform yang sudah kita install secara global sebelumnya.

    $ npm link bs-platform

Jalankan lagi perintah parcel index.html dan aplikasi kita sudah berjalan di [http://localhost:1234](http://localhost:1234) dan sudah dapat dibuka di browser dan mendapatkan pesan “Hello, world!” di browser console.

![Parcel sudah berhasil menjalankan project Reason!](https://cdn-images-1.medium.com/max/2000/1*FeU8LIKqPfWwkBslCb5DOw.png)_Parcel sudah berhasil menjalankan project Reason!_

Sip! Sekarang mari kita buat modul Calc seperti sebelumnya untuk memastikan dapat dieksekusi di browser dengan parcel. Agar berbeda dengan modul Calc sebelumnya, kali ini kita tambahkan _type annotation_ biar lebih jelas dan akan berguna sebagai dokumentasi juga.

![Modul Calc dengan fungsi add, dengan type annotation](https://cdn-images-1.medium.com/max/2240/1*2MPbvFjQLPv59EIt9f2Exw.png)_Modul Calc dengan fungsi add, dengan type annotation_

Sekarang, mari kita panggil fungsi add tersebut di file index.re sebelumnya. Secara otomatis ketika kita membuat file baru, Reason akan menjadikan file Calc sebagai modul sehingga pemanggilannya dapat dilakukan dengan notasi titik atau _dot._

![Melakukan pemanggilan Modul Calc dan fungsi add.](https://cdn-images-1.medium.com/max/2240/1*caekOhKGcbdLlZrhqjqzSg.png)_Melakukan pemanggilan Modul Calc dan fungsi add._

Hasilnya dapat kita nikmati di console browser seperti berikut.

![Hasil pemanggilan fungsi add.](https://cdn-images-1.medium.com/max/2000/1*GYlHR2jiPuxSGRHcY5wB2A.png)_Hasil pemanggilan fungsi add._

Sekarang mari kita belajar tentang variant dan pattern matching.

## Variant, Record dan Pattern Matching

Variant ini adalah salah satu fitur yang tidak semua bahasa pemrograman punya. JavaScript tidak memiliki fitur ini. Sederhananya, kita bisa membuat struktur data sendiri dengan menggunakan variant. Misalnya kita ingin membuat struktur data spesies yang muncul di komik Dragon Ball.

![Definisi spesies DragonBall](https://cdn-images-1.medium.com/max/2000/1*nYhg9HX7er4-1ejej1IVLg.png)_Definisi spesies DragonBall_

Kemudian jika kita ingin menciptakan karakter baru dengan spesies tertentu, kita bisa definisikan bentuknya dengan struktur data Record. Record ini mirip object di JavaScript dengan beberapa perbedaan: lebih ringan, cepat, immutable, bentuk dan jumlah _field_ yang baku, harus mendefinisikan tipe datanya.

Jadi untuk menggunakan record kita harus mendefinisikan tipe data dan bentuknya seperti berikut.

![Tipe Record characters.](https://cdn-images-1.medium.com/max/2240/1*PKmOQMieB9b6lNGUqpBVpw.png)_Tipe Record characters._

Setelah didefinisikan bentuk dan tipe datanya barulah kita dapat menggunakan record.

![Menggunakan record Bejita dengan tipe record characters.](https://cdn-images-1.medium.com/max/2200/1*N25teCKUFx-S0gZHLcfNjw.png)_Menggunakan record Bejita dengan tipe record characters._

Dan pattern matching adalah fitur yang sangat powerful. Misalnya untuk contoh diatas, kita ingin mencocokkan apakah karakter yang kita definisikan seorang Namek, Saiya, ataupun yang lain.

![Mencocokkan berdasarkan species.](https://cdn-images-1.medium.com/max/2200/1*LuERyXDd1HHbHEsWN5utOg.png)_Mencocokkan berdasarkan species._

Namun, jika kita lihat di editor, misalnya VS Code atau vim ada peringatan bahwa pattern matching masih ada yang kurang, atau _pattern matching is not exhaustive enough_. Hal seperti ini memang diizinkan di bahasa seperti JavaScript. Tapi bahasa dengan _strongly typed_ biasanya tidak memperbolehkannya. Solusinya kita harus menulis kasus untuk semua spesies. Atau, kita bisa menggunakan notasi _underscore_ untuk menyatakan _else_ atau spesies selain Saiyan atau Namekian.

![Support Other species](https://cdn-images-1.medium.com/max/2200/1*pLlJAkEbEfrdsK_xD5leww.png)_Support Other species_

### Binding dan Interop

Seperti yang sudah dijabarkan sebelumnya, interopabilitas Reason dengan JavaScript sangat mudah. Kita bahkan bisa menuliskan sintaks JavaScript dengan bantuan bs.raw().

![Interopabilitas dengan bs.raw](https://cdn-images-1.medium.com/max/2240/1*5gpTjelFVz5Hy3IAqJ7xQQ.png)_Interopabilitas dengan bs.raw_

Kita juga bisa menulis sintaks JavaScript yang setelah dievaluasi kemudian di _binding_ ke variable Reason.

![Dari JavaScript di binding ke Reason](https://cdn-images-1.medium.com/max/2240/1*xqMqys9wJyGVdUmbei8q4w.png)_Dari JavaScript di binding ke Reason_

Atau yang lebih mantap, kita bisa menggunakan fungsi di JavaScript dan kemudian di _binding_ atau di _mapping_ ke variable Reason.

![Menggunakan fungsi Math.PI JavaScript dan digunakan di Reason.](https://cdn-images-1.medium.com/max/2240/1*uRjDitMfTOiCAiTclrqIXQ.png)_Menggunakan fungsi Math.PI JavaScript dan digunakan di Reason._

## Kesimpulan

Reason merupakan pilihan menarik karena sintaks-nya yang modern dan pilihan alat bantu yang lengkap. Keunggulan utamanya dari Reason adalah _type system_ yang sangat _powerful_ serta bantuan _type inference_ sehingga kita tidak perlu mendefinisikan semua tipe data. Hal ini sangat membantu teman-teman yang baru belajar sehingga porsi ketikan menjadi lebih sedikit.

Reason dapat dikompilasi menjadi JavaScript dengan optimal dan hasilnya pun mudah dibaca, namun juga dapat dikompilasi ke _bytecode._ Proses kompilasinya cepat dan apabila terjadi kesalahan, pesan kesalahan sangat detil dan “manusiawi”.

Jadi, tunggu apalagi?! Tidak ada alasan lagi kan untuk tidak memilih Reason?!

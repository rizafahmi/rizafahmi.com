---
title: 'Setup Windows Bagian Pertama'
date: 2020-09-15
permalink: /2020/09/15/setup-windows-bagian-1/
cover: ''
layout: tulisan
tags: tulisan
---

Salah satu fitur menarik dari Windows 10 adalah kemampuan menjalankan Linux tanpa harus _reboot_ atau _dual boot_. Artinya sistem operasi Windows dan Linux dapat berjalan beriringan 🎉

Hal ini dimungkinkan karena teknologi yang diciptakan Microsoft yang diberi nama Windows Subsystem Linux atau disingkat WSL. Kita akan sedikit bereksperimen untuk menggunakan Windows sebagai mesin _ngoding_ dan nanti kita akan membuktikan apakah Windows 10 dengan WSL-nya layak menjadi alternatif sistem operasi untuk mengembangkan aplikasi yang modern.

Di artikel ini kita akan melakukan setup Windows 10 agar siap digunakan untuk pengembang perangkat lunak dengan melakukan instalasi Linux, _text editor_, Node.js, tmux dan alat bantu lainnya.

## Menyalakan Fitur WSL

Secara _default_, fitur wsl dalam keadaan tidak menyala dan untuk menggunakannya kita harus menyalakan fiturnya terlebih dahulu dengan menggunakan PowerShell dan dijalankan sebagai administrator.

![Alt Text](/assets/images/oxqn6ncshkfiqz0uopgg.png)

```
$ Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

Jangan lupa setelah menjalankan perintah diatas, kita harus melakukan restart sistem operasinya.

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/R1AC7UFFWp8" frameborder="0" allowfullscreen></iframe></center>

## Install Distribusi Linux

Selanjutnya buka Windows Store dan cari dengan kata kunci "Linux" dan pilih salah satu. Jika bingung, pilih saja Ubuntu, salah satu distribusi Linux yang populer. Tenang saja, kita bisa melakukan instalasi distribusi Linux sebanyak-banyaknya.

![Alt Text](/assets/images/xfd0mxqyqyzgkv24xxds.png)

Mumpung masih berada di Windows Store, sekalian install aplikasi Windows Terminal yang nantinya bisa kita gunakan untuk seluruh _command line_ yang ada di Windows termasuk mengakses berbagai distribusi Linux yang sudah terinstal.

![Alt Text](/assets/images/3eh8ubcdkzk8l3s42j4l.png)

## Menjalankan Linux

Untuk menjalankan linux, kita bisa menggunakan aplikasi yang ada di start menu dengan nama Ubuntu (atau distribusi lain yang diinstal), atau kita juga bisa menggunakan Windows Terminal yang tadi sudah kita install dengan membuka tab baru dan sudah muncul distribusi yang tadi kita install.

![Alt Text](/assets/images/wcqsiqevxuw0y4sg42a8.png)

Selanjutnya kita sudah bisa menggunakan Linux seperti biasa seperti beberapa perintah berikut.

```shell
$ sudo apt update
$ sudo apt upgrade
```

## Instalasi Node.js

Untuk menggunakan Node.js di Linux, kita bisa capai dengan beberapa cara. Salah satu cara yang direkomendasi adalah dengan menggunakan version manager. Version manager yang paling populer untuk Node saat ini adalah [nvm](https://github.com/nvm-sh/nvm#nvmrc). Namun sekitar setahun yang lalu saya menemukan sebuah Node version manager yang lebih cepat, namanya [fnm](https://github.com/Schniz/fnm). Untuk melakukan instalasi fnm ternyata dibutuhkan sebuah aplikasi unzip. Kita lakukan instalasi terlebih dahulu baru kemudian install fnm dengan bantuan curl.

```shell
$ sudo apt install unzip
$ curl -fsSL https://github.com/Schniz/fnm/raw/master/.ci/install.sh | bash
```

Setelah proses instalasi selesai, selanjutnya kita melakukan instalasi Node dengan versi terbaru (versi 14.9.0 saat artikel ini ditulis) dan langsung digunakan sebagai default dari versi nodejs kita.

```shell
$ fnm install latest
$ fnm default v14.9.0
$ node -v
```

## Instalasi Visual Studio Code

Berikutnya kita akan mengunduh dan menginstal editor kode pilihan, misalnya Visual Studio Code yang bisa diunduh [disini](https://code.visualstudio.com).

Setelah diinstal dan dibuka, secara otomatis VS Code medeteksi bahwa sistem operasi kita memiliki WSL dan menyarankan kita untuk melakukan instalasi plugin WSL.

## Membuat Proyek Node.js

Sekarang kita akan mencoba membuat proyek Node.js baru dengan menjalankan perintah seperti berikut.

```shell
$ mkdir node_on_wsl
$ cd node_on_wsl
$ npm init -y
$ npm install express
```

Kita akan mencoba membuat web server sederhana dengan Express.

```javascript
// app.js
const app = require('express')();

app.get('/', function(req, res) {
  res.send('Halo');
});

app.listen(3000);
```

Dan lalu kita buka browser dan ketikkan `http://localhost:3000`, dan tada!!!

## Selanjutnya

Ada beberapa alat bantu yang masih dibutuhkan seperti database, tmux, dan lain sebagainya yang ingin ditambahkan. Dan saya melakukan semua ini secara live yang bisa dipantengi di [kanal youtube berikut](https://www.youtube.com/channel/UCHhAlFGFCGgIusQkQIqJLYw?sub_confirmation=1).

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/2Lq-x_X_hXs" frameborder="0" allowfullscreen></iframe></center>

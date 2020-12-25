---
title: 'Menambahkan Video Watermark dengan ffmpeg'
date: 2020-11-30
slug: 'menambahkan-video-watermark-dengan-ffmpeg'
cover: './ruben-gregori-x-qLasX9kIo-unsplash.jpg'
---

Berikut adalah tips singkat untuk menambahkan _watermark_ di video yang sudah diproduksi, terutama untuk para pembuat konten video. Alat bantu yang dibutuhkan hanyalah sebuah aplikasi CLI atau _command-line interface_ [ffmpeg](https://ffmpeg.org). Instalasi ffmpeg dapat dilakukan dengan menggunakan [homebrew](https://brew.sh), [apt-get](https://linux.die.net/man/8/apt-get), ataupun manajemen aplikasi lainnya.

```shell
$ ffmpeg -i namafile.mp4 \
-vf "drawtext=text='pesan teks watermark':x=22:y=H-th-22:fontsize=34:
fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2" output.mp4
```

Berikut keterangan singkat dari perintah diatas:

- `-i namafile.mp4` input file dapat berupa ekstensi apa saja seperti mp4, avi, mov dll
- `-vf "drawtext=text='pesan teks watermark':"` menambahkan video filter (vf) dengan menggambarkan teks dan pesan tertentu
- `:x=22:y=H-th-22` posisi teks dengan format koordinat x dan y
- `:fontsize=34:fontcolor=white` ukuran font 34 pixel dan berwarna putih
- `:shadowcolor=black:shadowx=2:shadowy=2` teks diberikan efek bayangan dengan ofset 2 pixel di sumbu x dan y
- `output.mp4` merupakan nama file tujuan

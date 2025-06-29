---
title: Membangun permainan balap kode dengan AI
created: 2025-06-13
modified: 2025-06-13
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: true
---

Artikel berikut menceritakan tentang bagaimana saya membangun [permainan balap kode](https://balapkode.com/) berbasis web yang memanfaatkan AI sebagai salah satu fiturnya. Saya akan menceritakan mulai dari ide hingga peluncuran, dari awal hingga proses *deployment*, dengan berbagai pertimbangan dan keputusan teknis yang diambil sambil jalan.

Harapannya dengan menyimak artikel ini teman-teman bisa mendapatkan pelajaran dan memahami proses berfikir ketika menjalankan proyek atau membangun produk. Saya pribadi banyak belajar selama membangun permainan ini. Terutama tentang proses *deployment*, penggunaan AI dan keputusan *database* apa yang akan digunakan.
Harapannya, dengan menyimak artikel ini, teman-teman bisa mendapatkan pelajaran dan memahami proses berpikir ketika menjalankan proyek atau membangun produk.Saya pribadi banyak belajar selama membangun permainan ini. Terutama tentang proses *deployment*, penggunaan AI, dan keputusan *database* apa yang akan digunakan.
 


## Ide Balap Kode

Sebenarnya ide ini sudah lama kepikiran, bahkan jauh sebelum era AI berkembang pesat seperti saat ini. Sedari dulu ingin membuat permainan *typing game* menyerupai [monkeytype](https://monkeytype.com/) atau [typeracer](https://play.typeracer.com/) tapi spesifik buat developer.

Jika *typing game* pada umumnya menggunakan bahasa manusia (Inggris atau Indonesia) sebagai soal yang harus diketik, mungkin akan menarik kalau soal yang harus diketik itu berbentuk potongan kode dari bahasa pemrograman yang kita pilih.

Bisa digunakan untuk latihan mengetik, adu cepat dan bisa juga menjadi salah satu cara mencoba bahasa pemrograman baru untuk tahu apakah cocok dengan kita atau kurang cocok.

Saya teringat kembali dengan ide ini ketika menyadari bahwa sekarang AI sudah mumpuni menghasilkan baris kode dari banyak bahasa pemrograman. Walaupun masih sering *halu*, namun untuk menghasilkan potongan kode acak yang tidak perlu dijalankan di *server production*, rasanya penggunaan AI untuk ide ini akan cocok sekali.

![tangkapan layar](https://github.com/rizafahmi/coderacer/raw/main/priv/static/images/balapkode.com_.png)

## Pemilihan teknologi

Untuk mempercepat proses pengembangan aplikasi, saya memilih web framework dengan fitur lengkap. Memudahkan pula jika ingin meminta bantuan AI nantinya karena semua sudah terintegrasi.

Dan saya memilih [Phoenix](https://phoenixframework.org) dan bahasa fungsional [Elixir](https://elixir-lang.org) selain karena fiturnya lengkap dan dapat membangun aplikasi web real-time, kedua teknologi ini merupakan favorit saya.

Langkah berikutnya adalah memilih database yang ingin digunakan. Saya memilih SQLite sebagai database murni karena kesederhanaannya. Tidak membutuhkan konfigurasi apapun layaknya RDBMS lain, namun sudah cukup mumpuni. Terlebih dengan aplikasi ini penggunaan database tidak terlalu tinggi. Mungkin akan digunakan untuk membuat sesi baru (game dimulai) dan menyimpan data leaderboard saja, rasanya SQLite sudah lebih dari cukup.

Yang saat itu tidak terpikirkan adalah bagaimana caranya *deployment* SQLite. Berbeda dengan PostgreSQL yang biasanya sudah memiliki servis di platform komputasi awan seperti [Cloud SQL](https://cloud.google.com/sql), atau RDS. SQLite jarang ada yang menyediakan servis siap pakai. Sepengetahuan saya, baru ada [Turso](https://turso.tech/). Lebih lanjut mengenai ini akan dibahas dibagian berikutnya.

## *Deployment* dan berbagai tantangannya

### Continuous Integration

Mengikuti petuah [Mas Ariya Hidayat](https://www.threads.com/@ariya114/post/CvohuFTuoEP) agar selalu menggunakan *Continuous Integration* atau CI dalam proyek, sekaligus ajang belajar buat saya. Semua ini dipermudah dengan adanya GitHub workflow, konfigurasinya pun tidaklah sulit.

#### `.github/workflows/elixir.yml`

```yml
name: Elixir CI
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
permissions:
  contents: read
jobs:
  build:
    name: Build and test
    runs-on: ubuntu-22.04
    steps:
    - uses: actions/checkout@v4
    - name: Set up Elixir
      uses: erlef/setup-beam@61e01a43a562a89bfc54c7f9a378ff67b03e4a21 # v1.16.0
      with:
        elixir-version: '1.18.4' # [Required] Define the Elixir version
        otp-version: '27.3.4'      # [Required] Define the Erlang/OTP version
    - name: Restore dependencies cache
      uses: actions/cache@v3
      with:
        path: deps
        key: {% raw %}${{ runner.os }}-mix-${{ hashFiles('**/mix.lock') }}{% endraw %}
        restore-keys: {% raw %}${{ runner.os }}-mix-{% endraw %}
    - name: Install dependencies
      run: mix deps.get
    - name: Run tests
      env:
        GCP_SERVICE_ACCOUNT_JSON: {% raw %}${{ secrets.GCP_SERVICE_ACCOUNT_JSON }}{% endraw %}
      run: mix test

```

Saya konfigurasi ketika terjadi event push atau pull request, secara otomatis CI akan dijalankan dan akan memberi masukan jika ada pengujian yang tidak lulus, atau kesulitan instalasi *dependencies*. CI memastikan semua proses integrasi berhasil dan siap di *deploy* ke produksi.


### Menggunakan kontainer untuk *deployment*

Cara paling mudah dari sisi *developer experience* sebenarnya adalah menggunakan layanan seperti [Cloud Run](https://cloud.google.com/run?hl=en), yang juga pernah saya pakai di [proyek terdahulu](https://github.com/rizafahmi/gemini-for-web-dev#deployment).


Namun untuk proyek kali ini saya ingin menggunakan pendekatan berbeda. Jika servis seperti Cloud Run sangat fleksibel dengan fitur autoscaling yang menyebabkan tagihan bergantung kepada jumlah pengguna, kali ini saya ingin menggunakan servis yang tagihannya tetap meskipun belum bisa autoscaling.

Salah satu alasannya karena saya akan menggunakan API untuk servis LLM yang tagihannya bergantung kepada pengguna. Kalau saya *deploy* aplikasinya ke layanan seperti Cloud Run, maka saya harus *deg-degan* dua kali lipat. Sehingga saya memutuskan untuk menggunakan tagihan tetap untuk hosting aplikasi dan tagihan fleksibel untuk API agar tingkat *deg-degan* nya 1 kali saja 😉

Untuk mempersiapkan aplikasi Elixir Phoenix supaya siap di-*deploy* bisa dengan menggunakan perintah berikut untuk sekalian dibuatkan Dockerfile.

```sh
mix phx.gen.release --docker
```

Dockerfile sudah jadi, saatnya memilih servis apa yang ingin digunakan untuk *deployment*!

#### Memilih Servis untuk Deployment Kontainer

Ada beberapa pilihan *deployment* kontainer di GCP. Pilihan pertama adalah Cloud Run yang sudah kita bahas sebelumnya. Opsi kedua bisa menggunakan [Kubernetes Engine atau GKE](https://cloud.google.com/kubernetes-engine?hl=en). Opsi ketiga ada [App Engine Flexible Environment](https://cloud.google.com/appengine/docs/flexible). Opsi terahir menggunakan virtual machine (VM) dengan [Compute Engine](https://cloud.google.com/products/compute?hl=en).

Demi kesederhanaan dan biaya yang mudah diprediksi, saya memutuskan menggunakan Compute Engine. Berbeda dengan servis lain, agar dapat melakukan *deployment* kontainer, VM di Compute Engine harus disiapkan terlebih dahulu untuk beberapa hal:
- Menerima atau mengambil kode untuk di *deploy*. Mari gunakan Git dan GitHub untuk hal ini
- Menjalankan kontainer. Saya menggunakan Docker untuk saat ini. Bisa juga menggunakan Podman nantinya.
- Opsi tambahan, saya menambahkan *reverse proxy* HAProxy untuk berinteraksi dengan aplikasi. Sebenarnya bisa ditambahkan ke `docker-compose.yml` tapi belum saya lakukan 😬

Saya awalnya memilih mesin e2-micro, lalu setelah beberapa hari saya *update* ke mesin e2-small yang lebih mumpuni. Dan agar harganya menjadi lebih ekonomis lagi, saya memutuskan menggunakan tipe [Spot VM](https://cloud.google.com/compute/docs/instances/spot?hl=en) sebagai *provisioning model*.

*Spot VM* adalah tipe mesin virtual yang dapat kapan saja dihentikan oleh GCP agar sumberdayanya dapat digunakan servis lainnya. Harganya jadi 60-90% lebih murah namun resikonya aplikasi bisa saja tidak dapat diakses karena sedang dalam keadaan mati. Tidak disarankan digunakan untuk jenis aplikasi penting, namun untuk aplikasi ini rasanya tidak akan menjadi masalah.


#### Deployment untuk Database

Sebenarnya jika dari awal memilih database PostgreSQL, pembelajaran yang saya dapatkan tidak sebanyak ini 😉 Untuk database RDBMS seperti PostgreSQL atau MySQL cenderung lebih mudah karena bisa menggunakan servis seperti [Cloud SQL](https://cloud.google.com/sql), atau cara manual dengan instalasi RDBMS di mesin virtual.

Karena saya menggunakan SQLite, saya jadi belajar lebih banyak tentang bagaimana mengintegrasikannya dengan kontainer. Hal ini memberi pengalaman baru yang tidak saya dapatkan jika sejak awal menggunakan PostgreSQL. Karena kontainer sifatnya _stateless_, database tidak bisa dimasukkan begitu saja ke kontainer.

Akhirnya, saya belajar tentang Docker volumes yang bisa digunakan untuk menyimpan data. Bisa ditambahkan ke `docker-compose.yml` untuk volume dan jangan lupa arahkan konfigurasi ke volume tersebut.

##### `docker-compose.yml`

```yml
services:
  coderacer_deploy:
    image: coderacer_deploy:latest
    container_name: coderacer_deploy
    ports:
      - "4000:4000"
    environment:
      GCP_SERVICE_ACCOUNT_JSON: /app/config/gcp_credentials.json
    env_file:
      - .env
    volumes:
      - coderacer_sqlite:/app/priv/data
      - ~/gcp_credentials.json:/app/config/gcp_credentials.json:ro
    stdin_open: true # equivalent to -it
    tty: true # equivalent to -it
    restart: "no" # equivalent to --rm (no restart)

volumes:
  coderacer_sqlite:
```




### Bonus: Domain

Biar semakin keren, *ngide* cari domain. Berhubung coderacer.com dan variannya sudah tidak tersedia (atau super mahal), coba diterjemahkan menjadi balapkode. Dan ternyata [balapkode.com](https://balapkode.com) masih tersedia! Langsung beli dan disambungkan ke server.



## Servis AI sering kena *Rate-limit*

Setelah semuanya beres, woro-woro ke media sosial supaya teman-teman bisa mencoba. Tidak lama setelah itu dari laporan beberapa teman di media sosial, ketika ingin mencoba malah kena *rate-limit*. Wajar saja karena saya masih menggunakan servis AI dari AIStudio yang memang *freemium*.

Solusinya bisa menggunakan servis berbayar, salah satunya Vertex AI yang disediakan oleh GCP. Berhubung ini adalah pengalaman pertama menggunakan Vertex, dan sedikit keliru menterjemahkan maksud contoh kode yang ada di dokumentasi menyebabkan pengguna tetap kena *rate-limit* ketika menggunakan aplikasi.

![Vertex API Key](/assets/images/vertex-api-key.png)

Yang saya lakukan adalah menjalankan perintah `gcloud auth print-access-token` di terminal, kemudian copas hasilnya ke environment variable. Padahal,/ perintah ini seharusnya dijalankan setiap kali ada *request* masuk.

Setelah membaca ulang dokumentasi, saya baru menyadari kesalahan yang saya lakukan. Berbeda dengan AIStudio yang cukup menggunakan API Key yang sifatnya statis tidak berubah, Vertex AI menggunakan API Key yang berubah-ubah dan harus di-*refresh* secara berkala.

Alhasil, kodenya harus diubah kembali. Untungnya untuk berhubungan dengan operasi GCP seperti ini, sudah ada pustaka atau *library* [Goth](https://hex.pm/packages/goth) yang dibuat oleh komunitas.

### `lib/coderacer/ai.ex`

```diff

+ token = Goth.fetch!(Coderacer.Goth)

http_client.post!(
  url,Add commentMore actions
headers: [
      {"Content-Type", "application/json"},
-     {"Authorization", "Bearer #{System.get_env("VERTEX_API_KEY")}"}
+     {"Authorization", "Bearer #{token.token}"}
...
```
Sederhananya, setiap kali ada *request*, kita meminta token baru yang kemudian disertakan kedalam http header authorization. Untuk kode lengkapnya bisa [diintip langsung disini](https://github.com/rizafahmi/coderacer/commit/58d83051ec8131cbc0631fae721221e301c598cd#diff-6e80fe3819000b4fb2d60ae3ea36d0275e19a5b151aa68d71b8b4d9f5d8a0267).


## Penutup

Dari sebuah ide lama yang sempat tertunda, akhirnya saya berhasil membangun aplikasi/permainan [BalapKode](https://balapkode.com) ini — permainan balap mengetik kode dengan sentuhan AI. Sepanjang perjalanan membangun aplikasi ini, saya belajar banyak hal: dari memilih teknologi yang tepat, menyelesaikan berbagai tantangan *deployment*, memahami keterbatasan dan kekuatan SQLite, hingga mendalami cara kerja layanan AI seperti Vertex AI.

Saya juga belajar bahwa membangun produk bukan cuma soal menulis kode, tapi juga tentang mengambil keputusan teknis, mengelola risiko biaya, dan yang paling penting: terus belajar dari kesalahan.

Menggunakan pendekatan pragmatis dan fokus pada "good enough to launch", proyek ini akhirnya bisa dinikmati publik lewat [balapkode.com](https://balapkode.com).

Kalau kamu seorang developer (atau sedang belajar permrograman) dan ingin melatih kecepatan mengetik sambil mengenal berbagai bahasa pemrograman, yuk langsung coba main di:

👉 [**balapkode.com**](https://balapkode.com)

Kalau kamu menemukan bug, punya ide fitur baru, atau sekadar ingin lihat isi kode sumbernya, semua tersedia secara terbuka di:

🛠️ [**GitHub: rizafahmi/coderacer**](https://github.com/rizafahmi/coderacer)

Artikel diatas membahas proses pembuatan aplikasi dari awal hingga berhasil diluncurkan. Namun tidak membahas kodenya secara mendetil. Jika teman-teman tertarik untuk membahas kodenya, boleh ya ditulis di kolom komentar dibawah.

Terima kasih sudah membaca sampai akhir. Semoga perjalanan ini bisa menginspirasi kamu untuk mulai (atau menyelesaikan) ide-ide yang selama ini hanya ada di kepala. ✨

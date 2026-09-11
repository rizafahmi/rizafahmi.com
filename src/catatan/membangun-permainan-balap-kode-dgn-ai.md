---
title: Membangun permainan balap kode dengan AI
description: "Catatan membangun Balap Kode dengan Elixir, Phoenix, Docker, SQLite, deployment, dan fitur AI dari ide sampai peluncuran."
date: 2025-06-13
created: 2025-06-13
modified: 2025-06-13
layout: tulisan
tags:
  - catatan
  - elixir
  - ai
  - docker
  - tutorial

eleventyExcludeFromCollections: false
---

Artikel berikut menceritakan tentang bagaimana saya membangun [permainan balap kode](https://balapkode.com/) berbasis web yang memanfaatkan AI sebagai salah satu fiturnya. Saya akan menceritakan mulai dari ide hingga peluncuran, dari awal hingga proses _deployment_, dengan berbagai pertimbangan dan keputusan teknis yang diambil sambil jalan.

Harapannya dengan menyimak artikel ini teman-teman bisa mendapatkan pelajaran dan memahami proses berfikir ketika menjalankan proyek atau membangun produk. Saya pribadi banyak belajar selama membangun permainan ini. Terutama tentang proses _deployment_, penggunaan AI dan keputusan _database_ apa yang akan digunakan.

Semoga teman-teman bisa mendapatkan pelajaran dan memahami proses berpikir ketika menjalankan proyek atau membangun produk. Saya pribadi banyak belajar selama membangun permainan ini. Terutama tentang proses _deployment_, penggunaan AI, dan keputusan _database_ apa yang akan digunakan.

## Ide Balap Kode

Sebenarnya ide ini sudah lama kepikiran, bahkan jauh sebelum era AI berkembang pesat seperti saat ini. Sedari dulu ingin membuat permainan _typing game_ menyerupai [monkeytype](https://monkeytype.com/) atau [typeracer](https://play.typeracer.com/) tapi spesifik buat _developer_.

Jika _typing game_ pada umumnya menggunakan bahasa manusia (Inggris atau Indonesia) sebagai soal yang harus diketik, mungkin akan menarik kalau soal yang harus diketik itu berbentuk potongan kode dari bahasa pemrograman yang kita pilih.

Bisa digunakan untuk latihan mengetik, adu cepat dan bisa juga menjadi salah satu cara mencoba bahasa pemrograman baru untuk tahu apakah cocok dengan kita atau kurang cocok.

Saya teringat kembali dengan ide ini ketika menyadari bahwa sekarang AI sudah sangat mumpuni menghasilkan baris kode dari banyak bahasa pemrograman. Walaupun masih sering _halu_, namun untuk menghasilkan potongan kode acak yang tidak perlu dijalankan di _server production_, rasanya penggunaan AI untuk ide ini akan cocok sekali.

{% image "https://github.com/rizafahmi/coderacer/raw/main/priv/static/images/balapkode.com_.png", "tangkapan layar" %}

## Pemilihan teknologi

Untuk mempercepat proses pengembangan aplikasi, saya memilih web framework dengan fitur lengkap. Memudahkan pula jika ingin meminta bantuan AI nantinya karena semua sudah terintegrasi.

Dan saya memilih [Phoenix](https://phoenixframework.org) dan bahasa fungsional [Elixir](https://elixir-lang.org) selain karena fiturnya lengkap dan dapat membangun aplikasi web real-time, kedua teknologi ini merupakan favorit saya.

{% image "https://cdn-images-1.medium.com/max/2000/1*Gylsj_3ylGPyo-Ku7UoXRw.png", "Website Phoenix Framework" %}

Langkah berikutnya adalah memilih database yang ingin digunakan. Saya memilih SQLite sebagai database murni karena kesederhanaannya. Tidak membutuhkan konfigurasi apapun layaknya RDBMS lain, namun sudah cukup mumpuni. Terlebih aplikasi ini penggunaan database tidak terlalu tinggi. Mungkin akan digunakan untuk membuat sesi baru (game dimulai) dan menyimpan data _leaderboard_ saja, rasanya SQLite sudah lebih dari cukup.

Yang saat itu tidak terpikirkan adalah bagaimana caranya _deployment_ SQLite. Berbeda dengan PostgreSQL yang biasanya sudah memiliki servis di platform komputasi awan seperti [Cloud SQL](https://cloud.google.com/sql), atau RDS. SQLite jarang ada yang menyediakan servis siap pakai. Sepengetahuan saya, baru ada [Turso](https://turso.tech/). Lebih lanjut mengenai ini akan dibahas dibagian berikutnya.

## _Deployment_ dan berbagai tantangannya

### Continuous Integration

Mengikuti petuah [Mas Ariya Hidayat](https://www.threads.com/@ariya114/post/CvohuFTuoEP) agar selalu menggunakan _Continuous Integration_ atau CI dalam proyek, sekaligus ajang belajar buat saya. Semua ini dipermudah dengan adanya GitHub workflow, konfigurasinya pun tidaklah sulit.

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

Saya konfigurasi ketika terjadi event push atau pull request, secara otomatis CI akan dijalankan dan akan memberi masukan jika ada pengujian yang tidak lulus, atau kesulitan instalasi _dependencies_. CI memastikan semua proses integrasi berhasil dan siap di _deploy_ ke produksi.

{% image "https://cdn-images-1.medium.com/max/2000/1*tZsrIldyDs6-AT1PMslBYw.png", "Tangkapan layar ketika CI otomatis dijalankan" %}

### Menggunakan kontainer untuk _deployment_

Cara paling mudah dari sisi _developer experience_ sebenarnya adalah menggunakan layanan seperti [Cloud Run](https://cloud.google.com/run?hl=en), yang juga pernah saya pakai di [proyek #AISprint terdahulu](https://github.com/rizafahmi/gemini-for-web-dev#deployment).

Namun untuk proyek kali ini saya ingin menggunakan pendekatan berbeda. Jika servis seperti Cloud Run sangat fleksibel dengan fitur autoscaling yang menyebabkan tagihan bergantung kepada jumlah pengguna, kali ini saya ingin menggunakan servis yang tagihannya tetap meskipun belum bisa autoscaling.

Salah satu alasannya karena saya akan menggunakan API untuk servis LLM yang tagihannya bergantung kepada pengguna. Kalau saya menggunakan Cloud Run, maka saya harus _deg-degan_ dua kali lipat. Sehingga saya memutuskan untuk menggunakan tagihan tetap untuk hosting aplikasi dan tagihan fleksibel untuk AI agar tingkat _deg-degan_ nya 1 kali saja 😉

Untuk mempersiapkan aplikasi Elixir Phoenix supaya siap di-_deploy_ bisa dengan menggunakan perintah berikut untuk sekalian dibuatkan Dockerfile.

```sh
mix phx.gen.release --docker
```

Dengan menjalankan perintah diatas, hasil Dockerfile kurang lebih seperti cuplikan kode dibawah.

#### `Dockerfile`

```
ARG ELIXIR_VERSION=1.18.4
ARG OTP_VERSION=27.3.4
ARG DEBIAN_VERSION=bookworm-20250520-slim

ARG BUILDER_IMAGE="docker.io/hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-debian-${DEBIAN_VERSION}"
ARG RUNNER_IMAGE="docker.io/debian:${DEBIAN_VERSION}"

FROM ${BUILDER_IMAGE} AS builder

# install build dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential git \
  && rm -rf /var/lib/apt/lists/*

# prepare build dir
WORKDIR /app

# install hex + rebar
RUN mix local.hex --force \
  && mix local.rebar --force

# set build ENV
ENV MIX_ENV="prod"

# install mix dependencies
COPY mix.exs mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

# copy compile-time config files before we compile dependencies
# to ensure any relevant config change will trigger the dependencies
# to be re-compiled.
COPY config/config.exs config/${MIX_ENV}.exs config/
RUN mix deps.compile

RUN mix assets.setup

COPY priv priv

COPY lib lib

COPY assets assets

# compile assets
RUN mix assets.deploy

# Compile the release
RUN mix compile

# Changes to config/runtime.exs don't require recompiling the code
COPY config/runtime.exs config/

COPY rel rel
RUN mkdir -p /app/priv/data && chown nobody /app/priv/data
RUN mix release

# start a new build stage so that the final image will only contain
# the compiled release and other runtime necessities
FROM ${RUNNER_IMAGE} AS final

RUN apt-get update \
  && apt-get install -y --no-install-recommends libstdc++6 openssl libncurses5 locales ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Set the locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen \
  && locale-gen

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

WORKDIR "/app"
RUN chown nobody /app

# set runner ENV
ENV MIX_ENV="prod"

# Only copy the final release from the build stage
COPY --from=builder --chown=nobody:root /app/_build/${MIX_ENV}/rel/coderacer ./

COPY entrypoint.sh /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["/app/bin/start"]
```

Dockerfile sudah jadi, saatnya memilih servis apa yang ingin digunakan untuk _deployment_!

#### Memilih Servis untuk Deployment Kontainer

Ada beberapa pilihan _deployment_ kontainer di GCP. Pilihan pertama adalah Cloud Run yang sudah kita bahas sebelumnya. Opsi kedua bisa menggunakan [Kubernetes Engine atau GKE](https://cloud.google.com/kubernetes-engine?hl=en). Opsi ketiga ada [App Engine Flexible Environment](https://cloud.google.com/appengine/docs/flexible). Opsi terakhir menggunakan virtual machine (VM) dengan [Compute Engine](https://cloud.google.com/products/compute?hl=en).

Demi kesederhanaan dan biaya yang mudah diprediksi, saya memutuskan menggunakan Compute Engine. Berbeda dengan servis lain, agar dapat melakukan _deployment_ kontainer, VM di Compute Engine harus disiapkan terlebih dahulu untuk beberapa hal:

- Menerima atau mengambil kode untuk di _deploy_. Mari gunakan Git dan GitHub untuk hal ini
- Menjalankan kontainer. Saya menggunakan Docker untuk saat ini. Bisa juga menggunakan Podman nantinya.
- Opsi tambahan, saya menambahkan _reverse proxy_ HAProxy untuk berinteraksi dengan aplikasi. Sebenarnya bisa ditambahkan ke `docker-compose.yml` tapi belum saya lakukan 😬

{% image "https://cdn-images-1.medium.com/max/2000/1*lFbIqnzu-Y761o0Lub8YNA.jpeg", "Gambaran sederhana arsitektur aplikasai" %}

Saya awalnya memilih mesin dengan tipe _e2-micro_, lalu setelah beberapa hari saya _update_ ke mesin e2-small yang lebih mumpuni. Dan agar harganya menjadi lebih ekonomis lagi, saya memutuskan menggunakan tipe [Spot VM](https://cloud.google.com/compute/docs/instances/spot?hl=en) sebagai _provisioning model_.

_Spot VM_ adalah tipe mesin virtual yang dapat kapan saja dihentikan oleh GCP agar sumberdaya-nya dapat digunakan servis lainnya. Harganya jadi 60-90% lebih murah namun resikonya aplikasi bisa saja tidak dapat diakses karena sedang dalam keadaan mati. Tidak disarankan digunakan untuk jenis aplikasi penting, namun untuk aplikasi ini rasanya tidak akan menjadi masalah.

{% image "https://cdn-images-1.medium.com/max/2000/1*ZcmzJZmX0uiN_QIofNFzEw.png", "Konfigurasi SpotVM" %}

Saya juga menyiapkan servis agar setiap kali server restart akan otomatis menjalankan `docker compose up` supaya aplikasi otomatis menyala kembali. Servis ini juga dapat dijalankan dan dihentikan manual dengan perintah `sudo systemctl start coderacer` dan `sudo systemctl start coderacer`.

{% image "https://cdn-images-1.medium.com/max/2000/1*Rzj1_ZnguVCppeITZ-3p7Q.png", "File /etc/systemd/coderacer.service" %}

#### Deployment untuk Database

Sebenarnya jika dari awal memilih database PostgreSQL, pembelajaran yang saya dapatkan tidak sebanyak ini 😉 Untuk database RDBMS seperti PostgreSQL atau MySQL cenderung lebih mudah karena bisa menggunakan servis seperti [Cloud SQL](https://cloud.google.com/sql), atau cara manual dengan instalasi RDBMS di mesin virtual.

Karena saya menggunakan SQLite, saya jadi belajar tentang bagaimana mengintegrasikannya dengan kontainer. Hal ini memberi pengalaman baru yang tidak saya dapatkan jika sejak awal menggunakan PostgreSQL. Karena kontainer sifatnya _stateless_, database tidak bisa dimasukkan begitu saja ke kontainer.

Akhirnya, saya belajar tentang [ Docker volumes ](https://docs.docker.com/engine/storage/volumes/) yang bisa digunakan untuk menyimpan data. Bisa ditambahkan ke `docker-compose.yml` untuk volume dan jangan lupa arahkan konfigurasi ke volume tersebut.

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

Biar semakin keren, _ngide_ cari domain. Berhubung coderacer.com dan variannya sudah tidak tersedia (atau super mahal), coba diterjemahkan menjadi balapkode. Dan ternyata [balapkode.com](https://balapkode.com) masih tersedia! Langsung beli dan disambungkan ke server.

## Servis AI sering kena _Rate-limit_

Setelah semuanya beres, woro-woro ke media sosial supaya teman-teman bisa mencoba. Tidak lama setelah itu dari laporan beberapa teman di media sosial, ketika ingin mencoba malah kena _rate-limit_. Wajar saja karena saya masih menggunakan servis AI dari AIStudio yang memang _freemium_.

Solusinya bisa menggunakan servis berbayar, salah satunya Vertex AI yang disediakan oleh GCP. Berhubung ini adalah pengalaman pertama menggunakan Vertex, dan sedikit keliru menterjemahkan maksud contoh kode yang ada di dokumentasi menyebabkan pengguna tetap kena _rate-limit_ ketika menggunakan aplikasi.

{% image "./assets/images/vertex-api-key.png", "Vertex API Key" %}

Yang saya lakukan adalah menjalankan perintah `gcloud auth print-access-token` di terminal, kemudian copas hasilnya ke environment variable. Padahal, perintah ini seharusnya dijalankan setiap kali ada _request_ masuk.

Setelah membaca ulang dokumentasi, saya baru menyadari kesalahan yang saya lakukan. Berbeda dengan [AIStudio](https://aistudio.google.com/) yang cukup menggunakan API Key yang sifatnya statis tidak berubah, Vertex AI menggunakan API Key yang berubah-ubah dan harus di-_refresh_ secara berkala.

Alhasil, kodenya harus diubah kembali. Untungnya untuk berhubungan dengan operasi GCP seperti ini, sudah ada pustaka atau _library_ [Goth](https://hex.pm/packages/goth) yang dibuat oleh komunitas.

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

Sederhananya, setiap kali ada _request_, kita meminta token baru yang kemudian disertakan kedalam http header authorization. Untuk kode lengkapnya bisa [diintip langsung disini](https://github.com/rizafahmi/coderacer/commit/58d83051ec8131cbc0631fae721221e301c598cd#diff-6e80fe3819000b4fb2d60ae3ea36d0275e19a5b151aa68d71b8b4d9f5d8a0267).

## Penutup

Dari sebuah ide lama yang sempat tertunda, akhirnya saya berhasil membangun aplikasi/permainan [BalapKode](https://balapkode.com) ini — permainan balap mengetik kode dengan sentuhan AI. Sepanjang perjalanan membangun aplikasi ini, saya belajar banyak hal: dari memilih teknologi yang tepat, menyelesaikan berbagai tantangan _deployment_, memahami keterbatasan dan kekuatan SQLite, hingga mendalami cara kerja layanan AI seperti Vertex AI.

Saya juga belajar bahwa membangun produk bukan cuma soal menulis kode, tapi juga tentang mengambil keputusan teknis, mengelola risiko biaya, dan yang paling penting: terus belajar dari kesalahan.

Menggunakan pendekatan pragmatis dan fokus pada "good enough to launch", proyek ini akhirnya bisa dinikmati publik lewat [balapkode.com](https://balapkode.com).

Kalau kamu seorang developer (atau sedang belajar permrograman) dan ingin melatih kecepatan mengetik sambil mengenal berbagai bahasa pemrograman, yuk langsung coba mainkan di:

👉 [**balapkode.com**](https://balapkode.com)

Kalau kamu menemukan _bug_, punya ide fitur baru, atau sekadar ingin lihat isi kode sumbernya, semua tersedia secara terbuka di:

🛠️ [**GitHub: rizafahmi/coderacer**](https://github.com/rizafahmi/coderacer)

Artikel diatas membahas proses pembuatan aplikasi dari awal hingga berhasil diluncurkan. Namun tidak membahas kodenya secara mendetil. Jika teman-teman tertarik untuk membahas kodenya, boleh ya ditulis di kolom komentar dibawah.

Terima kasih sudah membaca sampai akhir. Semoga perjalanan ini bisa menginspirasi kamu untuk mulai (atau menyelesaikan) ide-ide yang selama ini hanya ada di kepala.

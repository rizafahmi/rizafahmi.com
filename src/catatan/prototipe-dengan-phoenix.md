---
title: 🌱 Membangun Prototipe Aplikasi dengan Elixir Phoenix
created: 2024-10-05
modified: 2025-09-04
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: true
---
## Pengantar

Artikel kali ini kita akan membangun prototipe aplikasi dengan Phoenix dan Elixir.

### Mau buat apa

EventFlow adalah aplikasi untuk mengelola komunitas. Dirancang untuk membantu komunitas mengelola dan berinteraksi dengan anggota, sekaligus menyediakan tempat untuk orang-orang menemukan komunitas yang relevan.

Fitur utama:
- Otentikasi
- Modul untuk mengelola komunitas
- Modul untuk mengelola acara atau event 
- Modul untuk mengelola RSVP acara atau event
- Eksplorasi dan pencarian komunitas
- Modul absensi/attendance
- Modul forum atau pesan/chat

![](/assets/images/prototipe/mindmap.png)

#### Tampilan Layar

![](/assets/images/prototipe/event-listing.png)

![](/assets/images/prototipe/event-detail.png)

![](/assets/images/prototipe/event-create.png)


![](/assets/images/prototipe/attendance.png)

![](/assets/images/prototipe/attendance-index.png)

![](/assets/images/prototipe/attendance-qr.png)

### Tujuan

Tujuannya untuk menunjukkan betapa mudahnya membangun aplikasi web ataupun prototipe dengan Phoenix. Tulisan ini lebih condong ke catatan daripada tutorial. Catatan dalam membangun sesuatu dari awal. Meskipun dapat juga dijadikan referensi untuk tutorial.

Harapannya, teman-teman yang membaca dapat mengikuti perjalanan mengembangkan aplikasi dari awal hingga akhir.

### Teknologi yang digunakan

*All in* menggunakan Phoenix dan Elixir.
- **Bahasa**: Elixir ~> 1.15
- **Framework**: Phoenix ~> 1.8.0
- **Database**: PostgreSQL with Ecto SQL
- **Frontend**: Phoenix LiveView with DaisyUI & Tailwind CSS
- **Otentikasi**: Passwordless with Phoenix Auth


## Persiapan Proyek

```shell
mix phx.new eventflow --binary-id --no-gettext
cd eventflow
```

Ubah konfigurasi database di `config/dev.exs` dan `config/test.exs`. Lalu pastikan servis databaase postgresql sudah dinyalakan.

### `config/dev.exs`

```diff
import Config

# Configure your database
config :eventflow, EventFlow.Repo,
- username: "postgres",
+ username: "riza",
- password: "postgres",
+ password: "",
  hostname: "localhost",
  database: "eventflow_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# ...
```

### `config/test.exs`

```diff
import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :eventflow, EventFlow.Repo,
- username: "postgres",
+ username: "riza",
- password: "postgres",
+ password: "",
  hostname: "localhost",
  database: "eventflow_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

```

```shell
mix ecto.create
```

```shell
mix phx.server
```

![](/assets/images/prototipe/phoenix.png)


```shell
git init
git add .
git commit -m "Init"
```

---

## Otentikasi



### Menambahkan Nama untuk User

## Deployment

### Kirim Email 


















---

## Catatan
- Express it as a model
- Map the model to a plan that is 1:1 with phx.live.gen
- Plan for less than 40 hours of work
	- Prioritize

### Filosofi
- Generator first, code second
- Generated code is the canonical representation of your app
- Generated code is complete, don't remove parts
- Don't change context module, make a module for commands
- Run mix test.watch < 5s
- Use liveview for everything
- phx.gen.auth
- Use component framework like petal.build or daisyui

## Sumber

```
https://youtu.be/BNmM2PyHs2c?feature=shared
```

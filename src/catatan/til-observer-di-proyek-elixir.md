---
title: "💡 TIL: Menjalankan Observer di Proyek Elixir"
date: 2024-12-03
created: 2024-12-03
layout: tulisan
tags:
  - catatan
  - TIL
eleventyExcludeFromCollections: false
---
Observer adalah tampilan grafis untuk observasi sistem Erlang dan Elixir. Menampilkan beberapa informasi penting seperti sistem, aplikasi, supervisor, proses dan lainnya. Untuk menjalankan observer, biasanya dilakukan melalui REPL yaitu iEX.

```text
$ iex -S mix
Interactive Elixir (1.17.3) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> :observer.start()
** (UndefinedFunctionError) function :observer.start/0 is undefined (module :observer is not available)
    :observer.start()
    iex:1: (file)
```

Meskipun observer sudah termasuk kedalam paket Erlang VM, tapi harus didefinisikan kedalam fungsi `application()` di file metadata proyek `mix.exs`.

```diff
defmodule Shortener.MixProject do
  use Mix.Project

  def project do
    [
      app: :shortener,
      version: "0.1.0",
      elixir: "~> 1.17",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
-       extra_applications: [:logger]
+       extra_applications: [:logger, :wx, :observer, :runtime_tools]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:mix_test_interactive, "~> 4.1", only: :dev, runtime: false}
    ]
  end
end

```

Keluar dari REPL dan jalankan kembali.

```text
$ iex -S mix
Erlang/OTP 25 [erts-13.2.2.11] [source] [64-bit] [smp:10:10] [ds:10:10:10] [async-threads:1]

Interactive Elixir (1.17.3) - press Ctrl+C to exit (type h() ENTER for help)
iex(1)> :observer.start()
```

Dan di desktop akan muncul aplikasi observer tersebut.

![](/assets/images/observer.png)

Informasi lebih lanjut tentang observer bisa dicek di dokumentasi [Erlang berikut](https://www.erlang.org/doc/apps/observer/observer.html).

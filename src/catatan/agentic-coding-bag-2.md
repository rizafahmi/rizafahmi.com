---
title: Mengulik Cara Kerja Agentic Coding Bagian 2
created: 2026-02-08
modified: 2026-02-08
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: true
---
## Recap dan pembuka
Setelah bagian pertama kita sudah mendapatkan ide bagaimana sebuah agentic ai bekerja. Sekarang saatnya membangun sebuah aplikasi sederhana. Namakan saja mbb atau model bahasa besar 😬
Sedikit demi sedikit kita akan mengembangkan mbb mulai nol sampai bisa menjadi agentic coding sederhana.

> *"Perjalanan membangun AI agent dimulai dengan satu API call."*

Setelah membaca artikel ini, kita akan sama-sama belajar bagaimana memanggil AI lewat REST API dan menterjemahkan respons.

## Mempersiapkan Proyek
Kita akan membangun aplikasi mbb ini dengan Elixir. Elixir adalah bahasa pemrograman fungsional yang elegan. Jika teman-teman ingin melihat implementasi dengan bahasa lain boleh tulis di kolom komentar ya.

Pertama, buat proyeknya dulu dengan `mix` dan jalankan `mix test` untuk memastikan semuanya berjalan sesuai harapan.

```shell
mix new mbb
cd mbb
mix test
```

### Menyiapkan Escript
Agar aplikasi kita bisa dijalankan dari command line, kita akan mengemasnya sebagai escript. Tambahkan konfigurasi escript di dalam `mix.exs`.

```elixir
# kode lainnya...
def project do
  [
    # kode lainnya...
    escript: [main_module: Mbb]
  ]
end
# kode lainnya...
end
```

### Hello world dulu kali ya

Sekarang kita akan menambahkan fungsi `main/1` di dalam modul `Mbb` untuk menampilkan "Hello, world!" saat aplikasi dijalankan dari command line.

### Menambahkan Pustaka Req

Untuk mengakses LLM, kita akan menggunakan REST API saja. Selain familiar, menggunakan REST API lebih agnostik dan tidak tergantung kepada *library* atau *framework* tertentu. Untuk itu kita butuh Req sebagai HTTP client.

Buka `mix.exs` dan tambahkan `:req` di dalam daftar dependensi.

```elixir
# kode lainnya...

defp deps do
  [
    {:req, "~> 0.3.0"}
  ]
end
```

Setelah itu jalankan `mix deps.get` untuk mengunduh dependensi yang baru ditambahkan.


## Membuat Panggilan Perdana ke LLM

Kali ini kita akan menggunakan model Gemini dari Google. Tenang saja, semua konsep yang kita bahas di sini bisa diterapkan ke model lain seperti Claude, GPT-5, atau lainnya. Hanya berbeda di endpoint, data yang dikirim dan data yang diterima.

Sebelum kita mengirim permintaan ke API, kita perlu mendapatkan API key dari penyedia layanan LLM. Saya contohkan menggunakan [AIStudio](https://aistudio.google.com/) dari Google. Silakan daftar dan dapatkan API key-nya. Tenang saja, ada *free tier*-nya kok. Setelah mendapatkan API key, simpan di `.env`.

### `.env`

```shell
export API_KEY="sk-..."
```

Lalu aktivasi dengan menjalankan:

```shell
source .env
```

Jangan lupa untuk menambahkan `.env` ke `.gitignore` agar API key tidak bocor.

Sekarang bagian yang seru. Ubah file `lib/mbb.ex`.

### `lib/mbb.ex`

```elixir
defmodule Mbb do
  @model "gemini-3-flash-preview"
  @system_prompt "You are a helpful assistant."
  
  defp api_url() do
    api_key = System.get_env("API_KEY") || ""
    "https://generativelanguage.googleapis.com/v1beta/models/#{@model}:generateContent?key=#{api_key}"
  end

end
```


    - The Simplest Call
        - Build the request: headers, model, messages
        - Req.post!/2 to api.anthropic.com/v1/messages
    - Anatomy of the Response
        - ```elixir
            %{
            "content" => [%{"type" => "text", "text" => "..."}],
            "stop_reason" => "end_turn"
            }
            ```
            
        - Explain: `stop_reason` will be important later
    - Handle Success and Errors
        - Pattern match on status codes
        - Extract text from response body
    - Wire It to CLI
        - `main/1` → call API → print result
        - `mix escript.build` && `./mbb "What is Elixir?"`
    - 🧪 Try It
        - `./mbb "Explain pattern matching in one sentence"`
    - 💡 Key Insight
        - This is the "traditional" pattern - one question, one answer, done
        - Next: we'll teach Claude to do things
    - 🏋️ Exercise
        - Add a --model flag to switch between claude-haiku and claude-sonnet
    - CTA - "Next: Teaching Your Agent to Use Tools"

## Bahasan Utama

## Kesimpulan

---
title: Mengulik Cara Kerja Agentic Coding Bagian 2
date: 2026-02-08
created: 2026-02-08
modified: 2026-02-09
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
Kita akan membangun aplikasi mbb ini dengan Elixir. Elixir adalah bahasa pemrograman fungsional yang elegan. Jika teman-teman ingin melihat implementasi dengan bahasa lain boleh tulis di kolom komentar ya 😉

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

### Menampilkan pesan legendaris

Sekarang kita akan menambahkan fungsi `main/1` di dalam modul `Mbb` untuk menampilkan pesan legendaris "Hello, world!" saat aplikasi dijalankan dari command line.

### `lib/mbb.ex`

```elixir
defmodule Mbb do
  def main(_args) do
    IO.puts("Hello, world!")
  end
end
```

Jalankan perintah berikut untuk membangun escript dan menjalankannya.

```shell
mix escript.build
./mbb
```

Tentu saja akan muncul pesan "Hello, world!" di terminal.

```
Hello, world!
```

Berhubung kita akan kita akan menggunakan argumen untuk mengirim instruksi ke LLM nanti, ubah sedikit fungsi `main/1` agar menampilkan argumen yang diterima. Dan apabila tidak ada argumen, tampilkan carapenggunaan aplikasi.

### `lib/mbb.ex`

```elixir
defmodule Mbb do
  def main([question]) do
    IO.puts("Hello, #{question}!")
  end

  def main([]) do
    IO.puts("Usage: ./mbb \"<your question>\"")
  end
end
```

Jalankan kembali escript-nya dengan argumen.

```shell
mix escript.build
./mbb "Elixir"
```

Hasilnya, tentu saja akan menampilkan:

```
Hello, Elixir!
```

Jika tidak ada argumen, maka akan menampilkan pesan penggunaan.

```shell
./mbb
```

```
Usage: ./mbb "<your question>"
```


### Menambahkan Pustaka Req

Untuk mengakses LLM, kita akan menggunakan REST API saja. Selain familiar, menggunakan REST API lebih agnostik dan tidak tergantung kepada *library* atau *framework* tertentu. Untuk itu kita butuh Req sebagai HTTP client.

Buka `mix.exs` dan tambahkan `:req` di dalam daftar dependensi.

#### `mix.exs`

```elixir
# kode lainnya...

defp deps do
  [
    {:req, ">= 0.0.0"}
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
  
  def main([question]) do
    IO.puts("Hello, #{question}!")
  end

  def main([]) do
    IO.puts("Usage: ./mbb \"<your question>\"")
  end
  
  def call(message) do
    api_key = System.fetch_env!("ANTHROPIC_API_KEY")
    url = api_url(api_key)
    body = %{
        system_instruction: %{parts: [%{text: @system_prompt}]},
        contents: [%{role: "user", parts: [%{text: message}]}],
        generationConfig: %{
          maxOutputTokens: 1_000,
          temperature: 0.0,
          thinkingConfig: %{
            thinkingLevel: "MEDIUM"
          }
        }
      }
    case Req.post(url, json: body) do
      {:ok, %{status: 200, body: body}} ->
        parse_response(body)
      {:ok, %{status: status, body: body}} ->
        {:error, "API error #{status}: #{inspect(body)}"}
      {:error, reason} ->
        {:error, "Request failed: #{inspect(reason)}"}
    end
  end

  defp api_url(api_key) do
    "https://generativelanguage.googleapis.com/v1beta/models/#{@model}:generateContent?key=#{api_key}"
  end
  
  defp parse_response(%{"candidates" => [%{"content" => %{"parts" => [%{"text" => text}]}} | _]}) do
    {:ok, text}
  end
    
  defp parse_response(body) do
    {:error, "Unexpected response format: #{inspect(body)}"}
  end

end
```

Kompilasi dan jalankan.

```shell
mix escript.build
./mbb "Tanggal dan jam berapa sekarang?"
```

```
Sekarang adalah hari **Rabu, 22 Mei 2024**.
Waktu saat ini menunjukkan pukul **08:44**.
```
                                         
Masih tetap sama, halu pastinya. Kalau kita bertanya hal lainnya, tentu jawabannya lebih akurat. Terutama jika pertanyaannya sudah masuk kedalam data _training_ LLM.

```shell
./mbb "Mengapa bahasa fungsional lebih unggul dibandingkan paradigma lain?"
Menyebut bahasa fungsional (seperti Haskell, Elixir, Scala, atau Clojure) "lebih unggul" mungkin subjektif, namun paradigma **Functional Programming (FP)** memang memiliki keunggulan teknis yang sangat signifikan dibandingkan paradigma **Imperatif** atau **Object-Oriented (OO)**, terutama dalam konteks pengembangan perangkat lunak modern yang kompleks.
Berikut adalah alasan mengapa paradigma fungsional dianggap lebih unggul dalam banyak aspek:

### 1. Immutability (Kekekalan Data)
Dalam FP, data bersifat *immutable* (tidak dapat diubah setelah dibuat). Jika Anda ingin mengubah nilai, Anda membuat data baru, bukan memodifikasi yang lama.
*   **Keunggulan:** Ini menghilangkan bug yang disebabkan oleh perubahan status (*state*) yang tidak terduga. Anda tidak perlu khawatir variabel "A" tiba-tiba berubah nilainya di tengah eksekusi karena dipengaruhi oleh fungsi lain.

### 2. Pure Functions (Fungsi Murni)
Fungsi murni adalah fungsi yang:
1. Menghasilkan output yang sama untuk input yang sama.
2. Tidak memiliki **Side Effects** (tidak mengubah variabel global, tidak menulis ke database, dll. secara tersembunyi).
*   **Keunggulan:** Kode menjadi sangat mudah diprediksi, diuji (*unit testing*), dan di-*debug*. Anda cukup melihat input dan output tanpa harus melacak status seluruh aplikasi.

### 3. Kemudahan Concurrency dan Parallelism
Ini adalah alasan utama mengapa FP populer di era prosesor multi-core. Dalam paradigma OO, menjalankan banyak *thread* secara bersamaan sangat sulit karena adanya "Shared State" (data yang diakses bersama), yang sering menyebabkan *race conditions*.
*   **Keunggulan:** Karena data dalam FP bersifat *immutable*, tidak ada risiko dua *thread* mengubah data yang

```

Selamat! Kita sudah berhasil memanggil API pertama ke Gemini.

## Anatomi Respons API

Gemini tidak serta-merta merespon dengan jawaban, namum menyertakan pula data dan metadata lainnya yang bisa saja penting untuk kita ketahui. Mari kita lihat hasil yang sebenarnya dikirimkan Gemini.

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Saat ini adalah hari **Kamis, 23 Mei 2024**. \nWaktu menunjukkan pukul **08:14** WIB (Waktu Indonesia Barat).",
            "thoughtSignature": "EswHCskHAb..."
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 7,
    "candidatesTokenCount": 38,
    "totalTokenCount": 329,
    "promptTokensDetails": [
      {
        "modality": "TEXT",
        "tokenCount": 7
      }
    ],
    "thoughtsTokenCount": 284
  },
  "modelVersion": "gemini-3-flash-preview",
  "responseId": "DR-PaZOINuX94-EPjqGjuQg"
}
```

Beberapa data penting yang patut dilihat, diantaranya:
- `content`: Objek yang berisi array. Ada respons dari LLM, tool_use untuk dibahas artikel berikutnya.
- `finishReason`: Alasan kenapa LLM memutuskan selesai. Idealnya, alasan selesai adalah STOP seperti contoh diatas. Alasan lainnya: MAX_TOKEN, SAFETY, OTHER.
- `totalTokenCount`: akumulasi seluruh unit data (token) yang diproses dalam satu kali transaksi API.

## Menangani Error

Kalau diperhatikan kode sebelumnya, sudah ada penanganan error. Mari buat menjadi lebih baik. Pertama, kita bisa buat supaya pesan kesalahan lebih "manusiawi" jika `API_KEY` tidak ditemukan. Apabila sebelumnya jika `API_KEY` tidak ada, maka akan muncul pesan seperti berikut.

```text
** (System.EnvError) could not fetch environment variable "API_KEY" because it is not set
    (elixir 1.18.4) lib/system.ex:705: System.fetch_env!/1
    (mbb 0.1.0) lib/mbb.ex:17: Mbb.call/1
    (mbb 0.1.0) lib/mbb.ex:6: Mbb.main/1
    (elixir 1.18.4) lib/kernel/cli.ex:137: anonymous fn/3 in Kernel.CLI.exec_fun/2
```

Kita akan ganti dengan pesan kurang lebih seperti berikut:

```text
API_KEY tidak ditemukan. Jalankan: export API_KEY=\"AIsKantT...\" terlebih dahulu sebelum menjalankan `./mbb`.
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

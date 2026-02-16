---
title: Fondasi Agentic Coding - Integrasi LLM
date: 2026-02-08
created: 2026-02-08
modified: 2026-02-09
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: false
---

Setelah membedah konsep AI Agent di [bagian pertama](/agentic-coding), kini saatnya kita mempraktikkan teori dalam barisan kode. Kita akan membangun `mbb`, sebuah aplikasi CLI fungsional menggunakan Elixir, bahasa yang sangat ideal untuk Agentic AI karena kemampuan konkurensi dan fault tolerance.
Kita akan belajar langkah demi langkah cara memanggil LLM melalui REST API dan menterjemahkan responsnya agar bisa dipahami oleh pengguna.

Sedikit demi sedikit kita akan mengembangkan mbb mulai nol sampai menjadi agentic coding sederhana.

> *"Perjalanan membangun AI agent dimulai dengan satu API call."*

Berikut adalah cuplikan aplikasi yang akan kita kembangkan di artikel ini. Setelah membaca artikel ini, kita akan sama-sama belajar bagaimana memanggil LLM lewat REST API dan menterjemahkan respons.

<video src="/assets/images/agentic/demo-opt.mp4" autoplay loop muted playsinline></video>

## Persiapan Proyek
Kita akan membangun aplikasi mbb ini dengan Elixir. Elixir adalah bahasa pemrograman fungsional yang elegan. Jika teman-teman ingin melihat implementasi dengan bahasa lain boleh tulis di kolom komentar.

Pertama, buat proyeknya dulu dengan `mix` dan jalankan `mix test` untuk memastikan semuanya berjalan sesuai harapan.

```shell
mix new mbb
cd mbb
mix test
```

```text
Compiling 1 file (.ex)
Generated mbb app
..

Finished in 0.03 seconds (0.03s async, 0.00s sync)
1 doctest, 1 test, 0 failures
```

### Konfigurasi aplikasi CLI dengan Escript
Agar aplikasi kita bisa dijalankan dari command line, kita akan mengemasnya sebagai escript. Tambahkan konfigurasi escript di dalam `mix.exs`. Escript melakukan kompilasi seluruh kode Elixir beserta pustaka tambahan menjadi satu file binary mandiri. Ini memudahkan distribusi aplikasi. Pengguna hanya memerlukan Erlang Runtime (ERTS) di sistem mereka tanpa harus mengunduh source code atau menjalankan mix secara manual.

#### `mix.exs`

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

Di kode ini kita mengarahkan escript untuk menggunakan modul `Mbb` sebagai pintu masuk utama aplikasi kita. Nantinya, fungsi `main/1` di dalam modul `Mbb` akan otomatis dieksekusi saat kita menjalankan file escript yang sudah dibangun.

Berikutnya, kita akan menulis fungsi `main/1` di dalam modul `Mbb` untuk menampilkan pesan legendaris "Hello, world!" saat aplikasi dijalankan dari command line.

### Menampilkan pesan legendaris

Sekarang kita akan menambahkan fungsi `main/1` di dalam modul `Mbb` untuk menampilkan pesan legendaris "Hello, world!" saat aplikasi dijalankan dari command line.

#### `lib/mbb.ex`

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

Berhubung kita akan kita akan menggunakan argumen untuk mengirim instruksi ke LLM nanti, ubah sedikit fungsi `main/1` agar menampilkan argumen yang diterima. Dan apabila tidak ada argumen, tampilkan cara penggunaan aplikasi.

#### `lib/mbb.ex`

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

Kode diatas mendemonstrasikan penggunaan *pattern matching* di Elixir, salah satu fitur menarik dari bahasa ini. Meski memiliki nama yang sama, fungsi `main/1` memiliki dua definisi fungsi yang berbeda. Elixir akan otomatis memilih definisi mana yang cocok berdasarkan struktur argumen yang diterima. Jika argumen berupa list/array dengan satu elemen `[question]`, definisi pertama yang akan dieksekusi. Jika list kosong `[]`, definisi kedua dipanggil. Ini membuat kode lebih deklaratif dibanding menggunakan `if/else`.

Jalankan kembali escript-nya dengan argumen.

```shell
mix escript.build
./mbb "Elixir"
```

Hasilnya, tentu saja akan menampilkan:

```
Hello, Elixir!
```

Sedangkan apabila program dijalankan tanpa memberikan argumen tambahan, maka akan menampilkan pesan penggunaan.

```shell
./mbb
```

```
Usage: ./mbb "<your question>"
```

Berikutnya kita akan mengganti pesan "Hello, <question>!" dengan respons dari LLM. Tapi sebelum itu, kita perlu menambahkan pustaka HTTP client untuk memanggil REST API terlebih dahulu.

## Memanggil LLM dengan REST API

### Menambahkan Pustaka Req

Untuk berinteraksi dengan LLM, kita akan menggunakan pendekatan REST API. Selain lebih familiar bagi sebagian besar teman-teman developer, cara ini bersifat lebih agnostik dan tidak mengikat kita dibandingkan menggunakan pustak atau SDK pihak ketiga tertentu. Hari ini Gemini, besok bisa Claude atau GPT-5 dengan perubahan minimal.

Untuk menangani pemanggilan REST API, kita akan menggunakan pustaka `Req`. `Req` adalah HTTP client Elixir modern dengan penggunaan yang lebih sederhana. Alternatif lain ada HTTPoison yang lebih *mature* tapi *verbose* atau Finch yang lebih *low-level*. Req cocok untuk proyek ini karena sederhana penggunaannya dibandingkan pustaka lain. Req juga mendukung `retry` otomatis, konfigurasi timeout, dan sudah dilengkapi dengan penanganan format JSON, yang akan berguna sepanjang pengembangan aplikasi.

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

Kode diatas memberitahu Elixir bahwa kita ingin menggunakan pustaka `Req` dengan versi berapa pun yang tersedia.

Setelah itu jalankan `mix deps.get` untuk mengunduh dependensi yang baru ditambahkan. Dan kita siap untuk memanggil LLM lewat REST API.

```shell
mix deps.get
```

```
Resolving Hex dependencies...
Resolution completed in 0.05s
New:
  req 0.5.0
* Getting req (Hex package)
```

### Membuat Panggilan API Perdana

Kali ini kita akan menggunakan model Gemini dari Google. Tenang saja, semua konsep yang kita bahas di sini bisa diterapkan ke model lain seperti Claude, GPT-5, atau lainnya. Hanya berbeda di endpoint, data yang dikirim dan data yang diterima.

Sebelum kita mengirim permintaan ke API, kita perlu mendapatkan API key dari penyedia layanan LLM. Saya contohkan menggunakan [AIStudio](https://aistudio.google.com/) dari Google. Silakan daftar dan dapatkan API key-nya. Tenang saja, ada *free tier*-nya kok sehingga tidak perlu mengeluarkan biaya. 

Setelah mendapatkan API key, simpan di file `.env`.

#### `.env`

```shell
export API_KEY="sk-..."
```

Lalu aktivasi dengan menjalankan:

```shell
source .env
```

Perintah diatas akan menambahkan variabel `API_KEY` ke dalam environment sehingga bisa diakses oleh aplikasi kita. Tidak semua sistem operasi dapat menjalankan perintah `source`, jadi pastikan untuk menyesuaikan dengan sistem operasi yang digunakan. Sistem operasi Linux dan macOS biasanya mendukung perintah `source`, sedangkan di Windows, Anda mungkin perlu menggunakan `set` atau `setx` untuk mengatur environment variable.

Jangan lupa untuk menambahkan file `.env` ke dalam `.gitignore` untuk mencegah kebocoran data rahasia ke repositori publik.

Sekarang bagian yang seru. Ubah file `lib/mbb.ex`.

#### `lib/mbb.ex`

```elixir
defmodule Mbb do
  @model "gemini-3-flash-preview"
  @system_prompt "You are a helpful assistant."

  def main([question]) do
    {:ok, response} = call(question)
    IO.puts(response)
  end

  def main([]) do
    IO.puts("Usage: ./mbb \"<your question>\"")
  end

  def call(message) do
    api_key = System.fetch_env!("API_KEY")
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

Fungsi `call/1` di atas bertanggung jawab untuk membangun permintaan API, mengirimkannya, dan menangani respons yang diterima. Kita menggunakan `Req.post/2` untuk mengirim permintaan POST ke endpoint API Gemini dengan payload yang sudah kita siapkan. Jika permintaan berhasil, kita akan memanggil fungsi `parse_response/1` untuk mengekstrak teks jawaban dari respons API. Jika terjadi kesalahan, kita akan mengembalikan pesan kesalahan.

Sedangkan untuk konfigurasi LLM, kita mengatur `thinkingLevel` menjadi "MEDIUM" yang memungkinkan model melakukan penalaran internal sebelum memberikan jawaban. Ini bisa membantu menghasilkan jawaban yang lebih baik untuk pertanyaan yang kompleks. `temperature` diatur ke 0.0 untuk memastikan jawaban yang lebih konsisten. Sedangkan `maxOutputTokens` diatur ke 1.000 untuk memberikan ruang yang cukup bagi model untuk menghasilkan jawaban yang panjang jika diperlukan. Teman-teman bebas mengubah konfigurasi ini sesuai kebutuhan. Konfigurasi yang saya gunakan hanya sebagai contoh untuk memulai.

Lakukan kompilasi ulang dan coba jalankan programnya.

```shell
mix escript.build
./mbb "Tanggal dan jam berapa sekarang?"
```

```
Sekarang adalah hari **Rabu, 22 Mei 2024**.
Waktu saat ini menunjukkan pukul **08:44**.
```

Seperti model bahasa besar lainnya, Gemini masih mengalami halusinasi jika ditanya sesuatu yang sifatnya data terkini. Lain halnya jika pertanyaan berkaitan dengan pengetahuan umum yang sudah masuk ke dalam data latihannya.

```shell
./mbb "Mengapa bahasa fungsional lebih unggul dibandingkan paradigma lain?"
```

```md
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

Selamat! Kita sudah berhasil memanggil API pertama ke Gemini. Berikutnya kita akan mengintip sedikit ke dalam respons API untuk memahami data apa saja yang kita dapatkan selain jawaban teks sehingga nantinya bisa kita manfaatkan untuk mengembangkan program kita lebih lanjut.

## Anatomi Respons API

Biasanya LLM seperti Gemini tidak hanya mengirimkan jawaban teks. API biasanya juga menyertakan metadata penting, seperti jumlah token dan alasan mengapa model berhenti menghasilkan teks, yang krusial untuk pemantauan biaya serta performa aplikasi.

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

Memahami struktur JSON ini krusial untuk pengembangan lebih lanjut:
- `content`: Objek yang berisi array. Ada respons dari LLM, tool_use untuk dibahas artikel berikutnya.
- `finishReason`: Alasan model berhenti. `STOP` berarti selesai secara normal, sementara `MAX_TOKEN` menandakan jawaban terpotong karena *rate limit*.
- `totalTokenCount`: Total konsumsi token keseluruhan, input dan output. Perhatikan bagian `thoughtsTokenCount` karena kita mengaktifkan `thinkingLevel: "MEDIUM"` di konfigurasi, yang memungkinkan model melakukan penalaran internal sebelum menjawab.

Setelah kita memahami apa yang API kirimkan, mari kita pastikan aplikasi kita handle error dengan graceful ketika sesuatu tidak berjalan sesuai rencana."

Bagian berikutnya kita akan menangani lebih lanjut kesalahan yang mungkin terjadi saat memanggil API, seperti API_KEY yang tidak ditemukan, input yang tidak valid, atau error dari sisi server penyedia LLM.

## Menangani Kesalahan

### Validasi `API_KEY`

Meskipun kode awal sudah memiliki penanganan kesalahan dasar, aplikasi yang kokoh membutuhkan respons yang lebih informatif. Mari kita tingkatkan pengalaman pengguna dengan membuat pesan kesalahan yang lebih "manusiawi", terutama saat variabel `API_KEY` belum ditemukan.

```text
** (System.EnvError) could not fetch environment variable "API_KEY" because it is not set
    (elixir 1.18.4) lib/system.ex:705: System.fetch_env!/1
    (mbb 0.1.0) lib/mbb.ex:17: Mbb.call/1
    (mbb 0.1.0) lib/mbb.ex:6: Mbb.main/1
    (elixir 1.18.4) lib/kernel/cli.ex:137: anonymous fn/3 in Kernel.CLI.exec_fun/2
```

Kita akan ganti dengan pesan kurang lebih seperti berikut:

```text
API_KEY tidak ditemukan. Jalankan: export API_KEY=\"AIsKantT...\" terlebih dahulu sebelum menjalankan ./mbb.
```

#### `lib/mbb.ex`

```diff
defmodule Mbb do
   @model "gemini-3-flash-preview"
   @system_prompt "You are a helpful assistant."

   def main([question]) do
-    {:ok, response} = call(question)
-    IO.puts(response)
+    case call(question) do
+      {:ok, response} ->
+        IO.puts(response)
+
+      {:error, reason} ->
+        IO.puts(reason)
+    end
   end
 
   def main([]) do
     IO.puts("Usage: ./mbb \"<your question>\"")
   end
 
   def call(message) do
-    api_key = System.fetch_env!("API_KEY")
+    api_key = System.get_env("API_KEY")
+
+    cond do
+      is_nil(api_key) or api_key == "" ->
+        {:error,
+         "API_KEY tidak ditemukan. Jalankan: export API_KEY=\"AIsKantT...\" terlebih dahulu sebelum menjalankan ./mbb."}
+
+      true ->
+        do_call(api_key, message)
+    end
+  end
+
+  defp do_call(api_key, message) do
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

  # Kode lainnya...

end

```

Kita mengganti penggunaan `System.fetch_env!/1` dengan `System.get_env/1` yang tidak akan melempar error jika environment variable tidak ditemukan. Sebagai gantinya, kita melakukan pengecekan manual untuk memastikan `API_KEY` ada dan tidak kosong. Jika tidak ditemukan, kita mengembalikan format `{:error, reason}` lalu menampilkan pesan kesalahan yang lebih informatif kepada pengguna.

Sekarang apabila dijalankan tanpa setup `API_KEY` terlebih dahulu, akan menghasilkan pesan kesalahan seperti berikut:

```shell
mix escript.build
./mbb "Tanggal dan jam berapa sekarang?"
```

```text
API_KEY tidak ditemukan. Jalankan: export API_KEY="AIsKantT..." terlebih dahulu sebelum menjalankan ./mbb.
```

### Validasi input

Berikutnya kita akan menangani input dari pengguna. Jika instruksi atau pertanyaan kosong atau hanya berisi spasi, sebaiknya tidak perlu dikirimkan ke LLM. Selain tidak ada gunanya, juga bisa menghemat token.

#### `lib/mbb.ex`

```diff
 defmodule Mbb do
   @model "gemini-3-flash-preview"
   @system_prompt "You are a helpful assistant."
+  @help_message "Usage: ./mbb \"<your question>\""
 
   def main([question]) do
     case call(question) do
       {:ok, response} ->
         IO.puts(response)

       {:error, reason} ->
         IO.puts(reason)
     end
   end
 
   def main([]) do
-    IO.puts("Usage: ./mbb \"<your question>\"")
+    IO.puts(@help_message)
   end
 
   def call(message) do
     api_key = System.get_env("API_KEY")

     cond do
       is_nil(api_key) or api_key == "" ->
         {:error,
          "API_KEY tidak ditemukan. Jalankan: export API_KEY=\"AIsKantT...\" terlebih dahulu sebelum menjalankan ./mbb."}
+      String.trim(message) == "" ->
+        {:error, @help_message}
       true ->
         do_call(api_key, message)
     end
   end
 
   # Kode lainnya...
 end
```

Pertama, kita menambahkan variabel `@help_message` untuk menyimpan pesan bantuan yang akan ditampilkan kepada pengguna sehingga dapat dipanggil berkali-kali tanpa harus menulis ulang string pesan bantuan. Kemudian, di dalam fungsi `call/1`, kita menambahkan kondisi untuk memeriksa apakah input `message` hanya berisi spasi atau kosong setelah dibersihkan dengan `String.trim/1`. Jika kondisi ini terjadi, kita mengembalikan format `{:error, @help_message}` yang akan menampilkan pesan bantuan kepada pengguna.

### Validasi HTTP Error

Kita juga akan menangani beberapa HTTP error seperti 401 jika `API_KEY` keliru, 429 jika kena *rate limit*, 500 jika kesalahan terjadi di sisi server penyedia LLM, dan juga penanganan jika koneksi lambat, terputus dsb.

#### `lib/mbb.ex`

```diff
 defmodule Mbb do
   @model "gemini-3-flash-preview"
   @system_prompt "You are a helpful assistant."
   @help_message "Usage: ./mbb \"<your question>\""
   
   # Kode lainnya...
 
   defp do_call(api_key, message) do
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
 
+      {:ok, %{status: 401}} ->
+        {:error, "401 Unauthorized: Periksa kembali API_KEY anda."}
+
+      {:ok, %{status: 429}} ->
+        {:error, "429 Rate Limit Exceeded: Tunggu beberapa menit, lalu coba lagi."}
+
+      {:ok, %{status: 500}} ->
+        {:error, "500 Server Error: Masalah di sisi LLM provider. Coba lagi dalam beberapa menit."}
+
       {:ok, %{status: status, body: body}} ->
-        {:error, "API error #{status}: #{inspect(body)}"}
+        {:error, "API Error #{status}: #{get_error_message(body)}"}
+
+      {:error, %{reason: :timeout}} ->
+        {:error, "Request timeout. Koneksi lambat atau terputus."}
 
       {:error, reason} ->
         {:error, "Request failed: #{inspect(reason)}"}
     end
   end
 
+  defp get_error_message(%{"error" => %{"message" => msg}}), do: msg
+  defp get_error_message(body), do: inspect(body)

   defp api_url(api_key) do
     "https://generativelanguage.googleapis.com/v1beta/models/#{@model}:generateContent?key=#{api_key}"
   end
```

Pada potongan kode di atas, kita menambahkan beberapa pola pencocokan untuk menangani status HTTP yang umum terjadi saat memanggil API. Untuk setiap status error yang kita tangani, kita mengembalikan pesan kesalahan yang lebih spesifik dan informatif kepada pengguna. Selain itu, kita juga menambahkan penanganan untuk kasus timeout yang mungkin terjadi jika koneksi internet lambat atau terputus. Tentunya kita juga akan menampilkan pesan kesalahan lain yang tidak secara spesifik ditangani oleh kode kita.

Bagian berikutnya kita akan menambahkan indikator status "Berpikir..." saat menunggu respons dari LLM, serta memberikan warna pada output untuk membedakan antara respons sukses dan pesan kesalahan.

## Status Indikator

Sekarang kita akan menambahkan indikator "Berpikir..." supaya pengguna tidak kebingungan. Tambahkan warna juga sebagai indikator kesuksesan atau kesalahan.

### `lib/mbb.ex`

```diff
 defmodule Mbb do
   @model "gemini-3-flash-preview"
   @system_prompt "You are a helpful assistant."
-  @help_message "Usage: ./mbb \"<your question>\""
+
+  # ANSI color codes
+  @green "\e[32m"
+  @red "\e[31m"
+  @cyan "\e[36m"
+  @reset "\e[0m"
 
   def main([question]) do
+    print_thinking()
+
     case call(question) do
-      {:ok, response} ->
-        IO.puts(response)
+      {:ok, text} ->
+        print_response(text)
 
       {:error, reason} ->
-        IO.puts(reason)
+        print_error(reason)
     end
   end
 
   def main([]) do
-    IO.puts(@help_message)
+    IO.puts(help_message())
   end
 
 def call(message) do
     api_key = System.get_env("API_KEY")
 
     cond do
       is_nil(api_key) or api_key == "" ->
         {:error,
          "API_KEY tidak ditemukan. Jalankan: export API_KEY=\"AIsKantT...\" terlebih dahulu sebelum menjalankan ./mbb."} 

       String.trim(message) == "" ->
-        {:error, @help_message}
+        {:error, help_message()}
 
       true ->
         do_call(api_key, message)
     end
   end

   # Kode lainnya...
 
+  defp print_thinking() do
+    IO.write("#{@cyan}🤖 Sedang berpikir...#{@reset}\r")
+  end
+
+  defp print_response(text) do
+    IO.write("\e[2K")
+    IO.puts("#{@green}#{text}#{@reset}")
+  end
+
+  defp print_error(reason) do
+    IO.write("\e[2K")
+    IO.puts("#{@red}❌ #{reason}#{@reset}")
+  end
+
+  defp help_message() do
+    """
+    #{@cyan}mbb#{@reset} - AI Coding Agent
+
+    Usage:
+      ./mbb "pertanyaan atau instruksi"
+
+    Examples:
+      ./mbb "Apa itu recursion?"
+      ./mbb "Jelaskan pattern matching di Elixir"
+    """
+  end
+
   defp get_error_message(%{"error" => %{"message" => msg}}), do: msg
   defp get_error_message(body), do: inspect(body)
   
   # Kode lainnya...
 end
```

Potongan kode di atas menambahkan beberapa fungsi baru agar pengalaman pengguna menjadi lebih baik. Fungsi `print_thinking/0` akan menampilkan indikator "Berpikir..." dengan warna cyan saat aplikasi sedang menunggu respons dari LLM. Fungsi `print_response/1` akan menampilkan respons sukses dengan warna hijau, sedangkan fungsi `print_error/1` akan menampilkan pesan kesalahan dengan warna merah. Selain itu, kita juga memperbarui fungsi `main/1` untuk memanggil fungsi-fungsi baru ini sesuai dengan hasil yang diterima dari fungsi `call/1`. Terakhir, kita memperbarui pesan bantuan di dalam fungsi `help_message/0` agar lebih informatif dan menarik.

## Kesimpulan

Kita mulai pengembangan aplikasi dari awal dengan program sederhana yang mencetak "Hello, world!". Sekarang, 100-an baris kode kemudian, kita punya program yang bisa:

- ✅ Berkomunikasi dengan LLM Gemini lewat REST API
- ✅ Parsing JSON response dengan pattern matching
- ✅ Menangani 5 jenis error berbeda (API_KEY, validation, HTTP errors, timeout, malformed response)
- ✅ Memberikan feedback visual dengan status indicator dan color coding

*Pattern matching* Elixir membuat kode kita deklaratif dan mudah dipahami. *Error handling* yang tadinya bisa menjadi potensial `if/else` bercabang, dapat ditangani dengan lebih elegan.

**Tapi ini baru fondasi awal.**

Aplikasi kita saat ini *stateless*. Setiap pertanyaan adalah *fresh start*. LLM tidak "mengingat" apa yang baru saja kita tanyakan. Akan kita lanjut di artikel berikutnya.

**Eksperimen mandiri**

1. Clone repository lengkap di [https://github.com/rizafahmi/mbb](https://github.com/rizafahmi/mbb)
2. Eksperimen dengan konfigurasi: naikkan `temperature` ke 0.7 untuk respons kreatif, atau ubah `thinkingLevel` ke "HIGH" untuk reasoning yang lebih dalam
3. Coba tanyakan pertanyaan pemrograman kompleks dan lihat bagaimana model merespons

Tulis di kolom komentar jika menemukan bug atau punya ide fitur baru.

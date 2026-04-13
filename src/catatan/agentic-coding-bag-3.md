---
title: Memberi LLM Akses - Tool Calling
date: 2026-02-19
modified: 2026-03-05
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: false
---

Aplikasi `mbb` yang kita kembangkan sejauh ini sudah mampu menjawab pertanyaan seputar sejarah, menjelaskan konsep, dan berdebat soal tab vs whitespace.

```shell
./mbb "Tanggal dan jam berapa sekarang?"
```

```
Sekarang adalah hari **Rabu, 22 Mei 2024**.
Jam menunjukkan pukul **10:19** WIB.
```


```shell
./mbb "baca file `mix.exs` dan beritahu dependencies apa saja yang digunakan proyek ini?"
```

```
Tentu, silakan **tempelkan (paste) isi file `mix.exs`** Anda di sini.
```

Tapi jika kita bertanya soal jam berapa sekarang, maka AI akan _ngarang_. Tanya soal isi file proyek? Malah minta kamu copy-paste manual.

Bukan karena LLM bodoh. Karena LLM buta: tidak punya akses ke dunia di luar teks yang kita kirim. Di artikel ini, kita beri dia "mata" lewat perkakas atau _tool_, dan lihat apa yang terjadi.

## _Tool Calling_

Sebelum terjun langsung menulis kode, penting untuk memahami bagaimana *tool calling* bekerja secara keseluruhan. Alurnya selalu sama untuk semua penyedia jasa LLM. Baik itu Gemini, Claude, GPT, da lain sebagainya:

1. Kita definisikan tool dan kirim daftarnya ke LLM bersama pertanyaan pengguna.
2. LLM memutuskan apakah perlu memanggil tool atau bisa menjawab langsung.
3. **Jika LLM memilih tool**, ia tidak menjalankannya sendiri. Ia hanya memberi tahu kita: "panggil tool ini, dengan argumen ini."
4. Kita yang mengeksekusi tool tersebut, lalu kirim hasilnya kembali ke LLM.
5. LLM merangkai jawaban akhir berdasarkan hasil tool tadi.

Poin ketiga adalah yang paling sering disalahpahami: LLM tidak punya kemampuan menjalankan kode apapun. Ia hanya bisa meminta. Kita yang menjadi eksekutornya.

<figure>
	{% image "./assets/images/agentic/tool_calling.png", "Tool calling" %}
	<figcaption>Tool calling</figcaption>
</figure>

Di artikel ini, kita hanya akan sampai di langkah 4. Langkah 5 (mengirim hasil kembali ke LLM untuk dirangkai menjadi jawaban) akan dibahas di bagian berikutnya tentang The Agentic Loop.

Cukup teorinya. Sekarang kita implementasikan langkah 1 sampai 4 dengan perkakas pertama: informasi tanggal dan waktu.

## Perkakas Tanggal dan Waktu

### Mendefinisikan Perkakas

Untuk memberikan akses informasi tanggal dan waktu, kita bisa membuat sebuah perkakas yang bisa digunakan oleh `mbb`. Perkakas ini akan memberikan informasi tanggal dan waktu saat ini ketika dipanggil. Berikut adalah contoh implementasi sederhana dalam bahasa Elixir.

#### `lib/mbb/tools.ex`

```elixir
defmodule Mbb.Tools do
  def get_current_datetime do
    %{
      name: "get_current_datetime",
      description: """
      Fungsi ini akan mengembalikan tanggal dan waktu saat ini dalam format ISO 8601.
      Gunakan tool ini ketika:
      - User bertanya tentang jam atau waktu saat ini.
      - User bertanya tentang tanggal saat ini.
      - User membutuhkan timestamp untuk logging atau catatan.
      """,
      input_schema: %{
        type: "object",
        properties: %{},
        required: []
      }
    }
  end
  
  def all_tools do
    [
      get_current_datetime()
    ]
  end
end
```

LLM tool didefinisikan dalam tiga bagian:
- `name`: Nama unik untuk perkakas ini, yang akan digunakan untuk memanggil perkakas ini.
- `description`: **Bagian terpenting**. LLM akan membaca deskripsi ini untuk memutuskan kapan harus menggunakan perkakas ini. Deskripsi yang bagus artinya LLM mengerti kapan harus menggunakan perkakas ini.
- `input_schema`: JSON schema yang mendefinisikan parameter yang dibutuhkan ketika memanggil perkakas ini. Dalam kasus ini, tidak ada parameter yang dibutuhkan, jadi kita bisa menggunakan objek kosong.

Perkakas sudah didefinisikan. LLM tahu namanya dan kapan memanggilnya. Tapi siapa yang menjalankan logikanya? Kode `mbb` itu sendiri. Tambahkan fungsi `execute/2` untuk melakukan eksekusi fungsi yang dibutuhkan.

### Eksekusi Perkakas

Setelah mendefinisikan perkakas, kita perlu menambahkan logika untuk dapat mengeksekusi perkakas yang dibutuhkan. Kita bisa menambahkan fungsi `execute/2` yang akan menerima nama perkakas dan parameter yang dibutuhkan, lalu menjalankan logika yang sesuai.

#### `lib/mbb/tools.ex`

```elixir
defmodule Mbb.Tools do
  # ... definisi perkakas sebelumnya ...

  def execute("get_current_datetime", _params) do
    {:ok, DateTime.utc_now() |> DateTime.to_iso8601()}
  end

  def execute(_tool_name, _params) do
    {:error, "Perkakas tidak ditemukan"}
  end
end
```

### Mengirim Perkakas ke LLM

`execute/2` sudah siap. Sekarang pastikan LLM tahu perkakas apa yang tersedia sebelum ia memproses pertanyaan apapun.

#### lib/mbb.ex

```diff
defmodule Mbb do
   def main([question]) do
     print_thinking()
 
-    case call(question) do
+    tools = Mbb.Tools.all_tools()
+
+    case call(question, tools) do
+      {:function_call, %{tool: tool, args: args}} ->
+        case Mbb.Tools.execute(tool, args) do
+          {:ok, result} ->
+            print_tool(tool, args, result)
+
+          {:error, reason} ->
+            print_error(reason)
+        end
+
       {:ok, text} ->
         print_response(text)
```

Respons yang dikirimkan akan berbeda antara ketika LLM memutuskan untuk menggunakan perkakas atau tidak. Jika LLM tidak butuh perkakas, responnya langsung berisi teks. Perhatikan baris 6-8: field `text` di dalam `parts` berisi jawaban final. Field lain seperti `usageMetadata` dan `responseId` tidak relevan untuk sekarang.

```shell
./mbb "tanggal berapa kemerdekaan Indonesia?"
```

```elixir {5-10}
%{
  "candidates" => [
    %{
      "content" => %{
        "parts" => [
          %{
            "text" => "Kemerdekaan Indonesia diproklamasikan pada tanggal **17 Agustus 1945**.",
            # ...
          }
        ],
        "role" => "model"
      },
      # ...
    }
  ],
  # ...
}
```

Jika LLM memutuskan butuh perkakas, strukturnya berbeda. Perhatikan baris 7-8: field `functionCall` menggantikan `text`, berisi `name` (perkakas yang diminta) dan `args` (argumennya). Baris 13 (`finishMessage`) mengkonfirmasi LLM berhenti untuk menunggu hasil eksekusi dari kita.

```shell
./mbb "tanggal dan jam berapa sekarang?"
```

```elixir {5-14}
%{
  "candidates" => [
    %{
      "content" => %{
        "parts" => [
          %{
            "functionCall" => %{"args" => %{}, "name" => "get_current_datetime"},
            # ...
          }
        ],
      },
      # ...
    }
  ],
  # ...
}
```

Dari respon di atas, dua field penting: `finishMessage` mengkonfirmasi LLM memutuskan untuk memanggil fungsi, dan `content.parts` berisi nama fungsi beserta argumennya.

Sedangkan untuk mengeksekusi fungsinya sendiri harus dilakukan oleh kita, atau dalam hal ini kita menyiapkan logika untuk mengeksekusi fungsi yang dibutuhkan oleh LLM tadi. Lalu hasilnya langsung dicetak ke layar.

Kita butuh dua perilaku berbeda dari satu fungsi: jika respons LLM berisi text, kembalikan teks. Jika berisi `functionCall`, kembalikan nama perkakas dan argumennya. Di Elixir, kita tidak membutuhkan kondisi `if/else`. Kita cukup tulis dua klausa `parse_response` dengan pola berbeda. Elixir akan menjalankan klausa pertama yang cocok dengan struktur data yang masuk.

#### `lib/mbb.ex`

```diff
 defmodule Mbb do
   # ... kode sebelumnya ...
   defp parse_response(%{"candidates" => [%{"content" => %{"parts" => [%{"text" => text}]}} | _]}) do
     {:ok, text}
   end

+  defp parse_response(%{
+         "candidates" => [
+           %{
+             "content" => %{"parts" => [%{"functionCall" => functionCall} | _]}
+           }
+           | _
+         ]
+       }) do
+    {:function_call, %{tool: functionCall["name"], args: functionCall["args"]}}
+  end

   defp parse_response(body) do
     {:error, "Unexpected response format: #{inspect(body)}"}
   end
 end
```

Kemudian fungsi yang diinginkan beserta argumen yang dibutuhkan dikirimkan dengan struktur data tuple `{:function_call, %{tool: tool_name, args: args}}`. Untuk kemudian fungsi tersebut dapat dieksekusi dan hasilnya ditampilkan ke layar dengan fungsi `print_tool/3`

#### `lib/mbb.ex`

```diff
 defmodule Mbb do
   def main([question]) do
     print_thinking()
 
-    case call(question) do
+    tools = Mbb.Tools.all_tools()
+
+    case call(question, tools) do
+      {:function_call, %{tool: tool, args: args}} ->
+        case Mbb.Tools.execute(tool, args) do
+          {:ok, result} ->
+            print_tool(tool, args, result)
+
+          {:error, reason} ->
+            print_error(reason)
+        end
+
       {:ok, text} ->
         print_response(text)
 
       {:error, reason} ->
         print_error(reason)
     end
   end

   def main([]) do
     IO.puts(help_message())
   end
```

Fungsi `print_tool/3` mencetak perkakas yang dipakai beserta hasilnya. `\e[2K` adalah ANSI escape code yang menghapus baris terminal saat ini, efeknya animasi "🤖 Sedang berpikir..." hilang begitu perkakas dipanggil.

#### `lib/mbb.ex`

```diff
+  defp print_tool(tool, args, result) do
+    IO.write("\e[2K")
+
+    IO.puts("#{@cyan}🔧 Menggunakan perkakas:#{@reset}")
+    IO.puts("    • #{tool}(#{inspect(args)})")
+    IO.puts("\n#{@green}📤 Hasil: #{result}#{@reset}")
+  end
+
   defp help_message() do
     """
     #{@cyan}mbb#{@reset} - AI Coding Agent

     Usage:
       ./mbb "pertanyaan atau instruksi"

     Examples:
       ./mbb "Apa itu recursion?"
       ./mbb "Jelaskan pattern matching di Elixir"
     """
   end
```

Semua bagian sudah terhubung. Sekarang kita uji dua skenario: pertanyaan yang tidak butuh perkakas, dan yang butuh.

### Uji Coba LLM dengan Perkakas

Jika kita mencoba dengan pertanyaan yang tidak membutuhkan informasi real-time, maka LLM akan langsung memberikan jawaban dalam format teks seperti sebelumnya.

```shell
./mbb "tanggal berapa kemerdekaan Indonesia?"
```

```text
🤖 Sedang berpikir...

Kemerdekaan Indonesia diproklamasikan pada tanggal **17 Agustus 1945**.
```

Namun jika kita mencoba dengan pertanyaan yang membutuhkan informasi tanggal dan waktu saat ini, maka LLM akan memutuskan untuk menggunakan perkakas `get_current_datetime` yang sudah kita definisikan sebelumnya.

```shell
./mbb "tanggal dan jam berapa sekarang?"
```

```text
🤖 Sedang berpikir...
🔧 Menggunakan perkakas:
    • get_current_datetime(%{})
📤 Hasil: 2024-05-22T03:19:00Z
```

LLM sudah meminta `get_current_datetime` dipanggil, dan kita sudah menjalankannya. Tapi hasilnya tidak pernah sampai ke LLM. Artinya LLM tidak bisa merangkai jawaban dari hasil perkakas itu.

Di bagian berikutnya, kita tutup loop ini: kirim hasil eksekusi perkakas kembali ke LLM, biarkan ia merangkai jawaban final, lalu kita bisa tambahkan perkakas berikutnya.

## Kesimpulan

Sekarang `mbb` sudah tidak sepenuhnya buta. Dengan menambahkan perkakas pertama, kita sudah:

- ✅ Mendefinisikan struktur perkakas: `name`, `description`, dan `input_schema`
- ✅ Mengirim daftar perkakas ke LLM bersama setiap permintaan
- ✅ Parsing dua jenis respons berbeda: teks langsung dan pemanggilan fungsi
- ✅ Mengeksekusi fungsi secara lokal dan menampilkan hasilnya

Tapi loop-nya belum tertutup. LLM meminta `get_current_datetime` dipanggil, kita menjalankannya, tapi hasilnya tidak pernah sampai ke LLM. Artinya LLM tidak bisa merangkai jawaban dari hasil perkakas itu.

Di bagian berikutnya, kita tutup loop ini: kirim hasil eksekusi perkakas kembali ke LLM, biarkan ia merangkai jawaban final, lalu tambahkan perkakas kedua yang lebih kompleks karena menerima argumen dari pengguna.

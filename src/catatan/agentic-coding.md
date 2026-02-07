---
title: Mengulik Cara Kerja Agentic Coding
date: 2026-02-06
modified: 2026-02-06
created: 2026-01-25
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: false
---

Jika akhir-akhir ini teman-teman menggunakan *agentic coding tool* seperti Claude Code, Codex, Cursor atau yang lainnya, kok rasanya seperti sihir? Mungkin agak sulit dipercaya, apalagi yang belum merasakan mafaatnya. Bagi yang belum menggunakan, cobain deh dalam jangka beberapa waktu. Cepat atau lambat teman-teman akan merasakan daya magisnya.

Tapi di balik layar, semua itu bukanlah sihir. Melainkan sebuah pola yang disebut *agentic coding*.
Di artikel ini, kita tidak hanya akan mengintip ke balik tirai, kita akan belajar bagaimana cara kerjanya dan mempelajari polanya.

Paham cara kerjanya tentu akan membantu kita menggunakan agentic coding dengan lebih efektif dan efisien. Semoga setelah membaca tulisan ini teman-teman bisa mendapat gambaran yang lebih jelas tentang apa itu agent dan apa yang membedakan AI agent dengan AI yang bukan agent.

Sebelum itu, mari kita lihat bagaimana perjalanan asisten ngoding dari awal hingga sekarang.

## Dari chatbot ke agentic coding

Perkakas ngoding dengan AI ini telah melewati evolusi yang cukup cepat. Mulai dari chatbot, autocomplete, coding assistant, hingga sekarang kita memasuki eranya agentic coding. Cara penggunaannya pun berbeda-beda.

Chatbot umumnya menggunakan antarmuka web. Ketika butuh bantuan, kita membuka chatgpt.com, claude.ai, gemini.google, dsb. Bertanya tentang topik pemrograman (atau topik apapun), si chatbot memberikan potongan kode yang dibutuhkan. Lalu kita sebagai developer menyalin kode tersebut dan melanjutkan proses pengembangan aplikasi. Dan begitu seterusnya.

<figure>
	<picture>
		<source srcset="/assets/images/agentic/chatbot.webp" type="image/webp">
		<img src="/assets/images/agentic/chatbot.png" alt="Chatbot Web">
		<figcaption>Chatbot web</figcaption>
	</picture>
</figure>
	
Berikutnya muncul fitur autocomplete. Diawali oleh munculnya GitHub Copilot yang diusung oleh Visual Studio Code. Biasanya kita mengetik sesuatu di editor kode lalu AI akan mencoba "menebak" kita maunya apa. Atau autocomplete bisa dipantik dengan menulis komentar kita ingin melakukan apa, lalu AI akan memberikan tebakan terbaiknya.

<figure>
	<picture>
		<source srcset="/assets/images/agentic/autocomplete.webp" type="image/webp">
		<img src="/assets/images/agentic/autocomplete.png" alt="Autocomplete">
		<figcaption>Fitur autocomplete</figcaption>
	</picture>
</figure>


Kemudian berkembang lagi. Dengan kemunculan code editor baru, Cursor, coding assistant mulai populer. Sederhananya, ini adalah chatbot yang tadinya diakses dengan web browser sekarang ada di code editor. Dengan tambahan konteks file yang sedang dibuka sehingga kita tidak perlu *copas* lagi. Dan beberapa fitur menarik lainnya seperti inline chat, hingga fitur yang mampu memahami proyek secara keseluruhan dengan berbagai metodenya seperti indexing code, repomap dan sebagainya.

Setiap kode yang ditambahkan, tetap ada peran kita sebagai manusia yang melakukan perubahan. Menyimpan perubahan file misalnya. Meskipun biasanya editor kita set untuk melakukan auto save. File baru pun harus kita yang buat.

<figure>
	<picture>
		<source srcset="/assets/images/agentic/assistant.webp" type="image/webp">
		<img src="/assets/images/agentic/assistant.png" alt="Coding assistant">
		<figcaption>Coding assistant</figcaption>
	</picture>
</figure>


Terakhir, tibalah kita ke era agentic. Jika menggunakan agentic coding, semuanya otomatis. Bikin file baru, baca, tulis dan ubah file, menjalankan perintah terminal dan sebagainya bisa dilakukan oleh llm. Dimulai dari Cursor dan dipopulerkan oleh Claude Code.

Salah satu ciri khas agentic coding ketika diberi perintah, LLM akan merencanakan, membuat langkah demi langkah untuk menyelesaikan perintah terus menerus sampai perintah dianggap sudah selesai. Jadi si agen ini bukan hanya berusahan menyelesaikan peritanh tapi seolah ia berfikir, berencana baru mengeksekusi hingga selesai.

<figure>
	<picture>
		<source srcset="/assets/images/agentic/agentic.webp" type="image/webp">
		<img src="/assets/images/agentic/agentic.png" alt="Agentic coding">
		<figcaption>Agentic coding</figcaption>
	</picture>
</figure>

Cara ini cocok sekali untuk tugas yang kompleks dan sulit dikerjakan dalam sekali tembak. Kok bisa ya tiba-tiba ada LLM yang bisa "mikir", buat rencana lalu eksekusi?

## Pola *Agentic*

*Agent* atau *Agentic* berasal dari kata *agency*. *Agency* secara harfiah berarti kemampuan untuk bertindak, bukan cuma berpikir atau memberi saran. Atau dengan kata lain punya inisiatif. 

LLM tanpa agent layaknya AI dalam tempurung. Jago ngomong, pengetahuan luas, walaupun terbatas (cut off). Meski pintar menjawab pertanyaan kita, tapi LLM tidak bisa berbuat apa-apa, tidak bisa mengingat apapun dan tidak mampu memutuskan jika diberi pilihan. Tidak bisa membaca file, menulis file bahkan tidak tahu tanggal dan jam berapa saat ini.

<figure>
	<picture>
		<source srcset="/assets/images/agentic/tempurung.webp" type="image/webp">
		<img src="/assets/images/agentic/tempurung.png" alt="Ilustrasi LLM">
		<figcaption>Ilustrasi LLM: AI dalam tempurung</figcaption>
	</picture>
</figure>

LLM adalah mesin prediksi token. Berusaha menyelesaikan teks dengan probabilitas tertinggi. Termasuk juga autocomplete kode, yang adalah teks. Kemampuan dasar LLM adalah menghasilkan teks, tidak dapat mengetahui apa yang terjadi disekitarnya. Tidak tahu tanggal dan jam saat ini, baca dan tulis file, bahkan percakapan terdahulu pun LLM tidak ingat. Kecuali diberi akses untuk mendapatkan informasi tanggal dan jam saat ini, akses untuk baca dan tulis file atau menyertakan percakapan terdahulu.

Jadi sebenarnya LLM itu bukan kurang pintar, cuma kurang diberi akses saja.


<figure>
	<picture>
		<source srcset="/assets/images/agentic/tool.webp" type="image/webp">
		<img src="/assets/images/agentic/tool.png" alt="LLM + Tools">
		<figcaption>LLM + Tools</figcaption>
	</picture>
</figure>


Jadi gimana caranya supaya LLM punya inisiatif? Persenjatai LLM dengan perkakas atau _tools_. Mulai dari yang sederhana seperti kasih akses untuk *ngecek* jam dan tanggal, *ngecek* kurs atau cuaca hingga memberikan akses untuk baca dan tulis file.

LLM dengan alat ini, ditambah perkakas untuk menyimpan percakapan dan kemampuan untuk menentukan pilihan perkakas mana yang cocok, itulah yang disebut sebagai AI Agent.

<figure>
	<picture>
		<source srcset="/assets/images/agentic/ai.webp" type="image/webp">
		<img src="/assets/images/agentic/ai.png" alt="Agentic looping">
		<figcaption>Agentic looping</figcaption>
	</picture>
</figure>


Dengan kata lain, LLM disebut sebagai agent atau agentic jika LLM berjalan terus-menerus (loop) yang dapat melakukan observasi apa yang sedang dikerjakan, disediakan perkakas untuk bekerja dan punya kemampuan untuk memutuskan kapan sebuah pekerjaan dinyatakan selesai.

![Agentic Looping](/assets/images/agentic/loop.gif)

## Tiga komponen utama

Sederhananya, agent adalah LLM yang diberikan alat bantu atau *tools*. Dan perkakas ini bisa melakukan sesuatu. Entah itu melakukan perubahan di komputer kita, atau mengirimkan data untuk memesan tiket kereta. Bisa juga menambahkan informasi yang belum ada di "otak" LLM. Misalnya kita bisa menambahkan dokumen internal yang tentu informasinya belum ada di LLM.

Selain perkakas seperti cek tanggal dan jam, baca file, tulis file dan lain sebagainya, kita juga harus menyediakan media penyimpanan atau memori untuk menyimpan histori percakapan dan memilih LLM yang punya kemampuan mengambil keputusan atau *reasoning*.

### *Tools*

Memberikan kemampuan kepada LLM. Misalnya kemampuan mendapatkan informasi tanggal dan jam saat ini, cuaca di sebuah kota, harga emas terkini, hingga mengoperasikan file seperti baca dan tulis bahkan kita bisa memberikan kemampuan untuk menjalanakan perintah bash.


### _Memory_

Setiap percakapan, perintah atau instruksi, akan disimpan sebagai memori yang dapat dijadikan referensi ketika diperlukan.

TODO: Contoh progress.txt Ralph
TODO Apakah ini yang dinamakan context engineering?

### *Reasoning Loop* 

Dan yang tidak kalah penting adalah kemampuan LLM dalam menentukan dan memilih perkakas yang mana yang cocok digunakan ketika ada permintaan dari pengguna. Misalnya, ketika pengguna bertanya tentang jam berapa, LLM dapat memutuskan untuk menggunakan perkakas jam dan tanggal, bukan malah baca atau tulis file.

Dan LLM juga punya kemampuan untuk terus menerus berusaha untuk menyelesaikan pekerjaannya. Hal inilah yang menjadi pembeda. Sebelum model Sonnet versi 3.7, LLM sulit sekali diajak *looping*. Meskipun sudah diinstruksikan secara eksplisit kadang LLM memutuskan berhenti sebelum tuntas.

Proses berpikir ini sering disebut sebagai **Chain of Thought**. LLM diinstruksikan untuk berfikir dan *ngomong* sendiri untuk merencanakan langkah-langah untuk menyelesaikan sebuah tugas. Ketika digabung dengan perkakas lainnya, bisa menjelma menjadi sebuah framework seperti ReAct (Reason + Act) yang lebih *powerful*.

## Praktek Membuat Agentic Coding Tool

Mari kita praktekkan langkah demi langkah. Berhubung LLM chatbot saat ini sudah dilengkapi oleh banyak perkakas, kita bisa bertanya tanggal dan jam saat ini dan LLM mampu menjawab dengan akurat. Karena itu kita akan membuat LLM chatbot dari awal dengan menggunakan REST API.

<figure>
	<picture>
		<source srcset="/assets/images/agentic/gemini.webp" type="image/webp">
		<img src="/assets/images/agentic/gemini.png" alt="Gemini">
		<figcaption>Bertanya tentang jam dan tanggal.</figcaption>
	</picture>
</figure>

```elixir
defmodule Mbb do
  @model "gemini-3-flash-preview"
  @system_prompt """
  You are an excellent principal engineer. You love programming language. \
  Your favorite language is Elixir and you always write code in functional paradigm. \
  You always answer in a concise and precise manner. Answer in 1-3 sentences maximum. No preamble, no summary.\
  """

  defp api_url do
    api_key = System.get_env("API_KEY") || ""

    "https://generativelanguage.googleapis.com/v1beta/models/#{@model}:generateContent?key=#{api_key}"
  end

  defp send(message) do
    api_url()
    |> Req.post(
      json: %{
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
    )
    |> handle_response()
  end
  
  # ... kode selanjutnya
  
end
```
	
Sekarang coba kita jalankan untuk menanyakan tanggal dan jam saat ini.

```text
$ mix escript.build # compile
$ ./mbb "Tanggal dan jam berapa sekarang?"
Saat ini adalah Rabu, 22 Mei 2024, pukul 08:50 UTC. Dalam Elixir, Anda dapat memperoleh data immutable ini secara presisi menggunakan fungsi `DateTime.utc_now()`.
```

Halu kan?! Saat menulis ini saya berada di tahun 2026. Ini bukanlah trik mesin waktu. Lebih kepad LLM belum diberi akses untuk mendapatkan informasi tanggal dan jam sehingga LLM terpaksa berbohong. Karena memang di desain seperti itu, untuk memastikan tugasnya selesai walaupun keliru.

## Kesimpulan

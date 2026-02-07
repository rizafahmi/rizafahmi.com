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

Tapi sebelum itu, mari kita lihat bagaimana perjalanan asisten ngoding dari awal hingga sekarang.

## Dari chatbot ke agentic coding

Alat bantu ngoding dengan AI ini telah melewati evolusi yang cukup cepat. Mulai dari chatbot, autocomplete, coding assistant, hingga sekarang kita memasuki eranya agentic coding. Cara penggunaannya pun berbeda-beda.

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

Tapi apa sih sebenarnya agents atau agentic ini? Kenapa kok tiba-tiba llm bisa melakukan banyak hal yang tadinya tidak bisa dilakukan?

<figure>
	<picture>
		<source srcset="/assets/images/agentic/agentic.webp" type="image/webp">
		<img src="/assets/images/agentic/agentic.png" alt="Agentic coding">
		<figcaption>Agentic coding</figcaption>
	</picture>
</figure>


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

TODO: LLM + Tools

<figure>
	<picture>
		<source srcset="/assets/images/agentic/tool.webp" type="image/webp">
		<img src="/assets/images/agentic/tool.png" alt="LLM + Tools">
		<figcaption>LLM + Tools</figcaption>
	</picture>
</figure>


Jadi gimana caranya supaya LLM punya inisiatif? Persenjatai LLM dengan alat bantu atau _tools_. Mulai dari yang sederhana seperti kasih akses untuk *ngecek* jam dan tanggal, *ngecek* kurs atau cuaca hingga memberikan akses untuk baca dan tulis file.

LLM dengan alat ini, ditambah alat untuk menyimpan percakapan dan kemampuan untuk menentukan pilihan alat mana yang cocok, itulah yang disebut sebagai AI Agent.

<figure>
	<picture>
		<source srcset="/assets/images/agentic/ai.webp" type="image/webp">
		<img src="/assets/images/agentic/ai.png" alt="Agentic looping">
		<figcaption>Agentic looping</figcaption>
	</picture>
</figure>

TODO Diagram: the loop

Dengan kata lain, LLM disebut sebagai agent atau agentic jika LLM berjalan terus-menerus (loop) yang dapat melakukan observasi apa yang sedang dikerjakan, disediakan alat untuk bekerja dan punya kemampuan untuk memutuskan kapan sebuah pekerjaan dinyatakan selesai.

## Tiga komponen utama

Yang membuat agent berbeda adalah alat bantu yang harus kita sediakan. Selain alat bantu seperti cek tanggal dan jam, baca file, tulis file dan lain sebagainya, kita juga harus menyediakan media penyimpanan atau memori untuk menyimpan histori percakapan dan memilih LLM yang punya kemampuan mengambil keputusan atau *reasoning*.

### *Tools*

Memberikan kemampuan kepada LLM. Misalnya kemampuan mendapatkan informasi tanggal dan jam saat ini, cuaca di sebuah kota, harga emas terkini, hingga mengoperasikan file seperti baca dan tulis bahkan kita bisa memberikan kemampuan untuk menjalanakan perintah bash.

### _Memory_

Setiap percakapan, perintah atau instruksi, akan disimpan sebagai memori yang dapat dijadikan referensi ketika diperlukan.

TODO: Contoh progress.txt Ralph
TODO Apakah ini yang dinamakan context engineering?

### *Reasoning Loop* 

Dan yang tidak kalah penting adalah kemampuan LLM dalam menentukan dan memilih perkakas yang mana yang digunakan ketika ada permintaan dari pengguna.

Dan LLM juga punya kemampuan untuk terus menerus berusaha untuk menyelesaikan pekerjaannya. Makanya sangat penting buat kita pemberi instruksi untuk secara eksplisit mendefinisikan kriteria apa saja sebuah tugas dapat dinyatakan selesai atau *definition of done*. Jika tidak ada instruksi eksplisit maka LLm yang akan memutuskan sendiri kapan tugasnya selesai, atau dia akan halu. Jadi penting buat kita untuk memastikan hal ini.

Proses berpikir ini sering disebut sebagai **Chain of Thought**. LLM diinstruksikan untuk berfikir dan *ngomong* sendiri untuk merencanakan langkah-langah untuk menyelesaikan sebuah tugas. Ketika digabung dengan alat lainnya, bisa menjelma menjadi sebuah framework seperti ReAct (Reason + Act) yang lebih *powerful*.

## Praktek Membuat Agentic Coding Tool

Mari kita praktekkan langkah demi langkah. Berhubung LLM chatbot saat ini sudah dilengkapi oleh banyak alat, kita bisa bertanya tanggal dan jam saat ini dan LLM mampu menjawab dengan akurat. Karena itu kita akan membuat LLM chatbot dari awal dengan menggunakan REST API.

[Screenshot chatbot]

[Kode hit ke llm service]
	
Sekarang coba kita jalankan untuk menanyakan tanggal dan jam saat ini.

```shell
./mbb "Tanggal dan jam berapa sekarang?"
```

## Kesimpulan

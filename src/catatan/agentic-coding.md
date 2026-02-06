---
title: 🌱 Catatan Tentang Agentic Coding
created: 2026-01-25
modified: 2026-01-25
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: true
---

Rasanya saat ini untuk sebagian besar developer, aktivitas mengembangkan aplikasi sudah tidak bisa dilepaskan dari peran serta AI.

Mulai dari chatbot, autocomplete, coding assistant, hingga agentic coding.

Tapi apakah teman-teman mengerti cara kerja agentic coding dibelakang layar? Apakah sekarang rasanya seperti kotak hitam yang secara ajaib bisa menghasilkan kode yang tidak hanya bagus tapi juga berjalan sesuai ekspektasi? Tulisan kali ini akan mengulik bagaimana cara kerja agentic coding dengan cara membuat agentic coding sederhana versi kita sendiri.

Saya sendiri juga belum terlalu paham makanya saya memutuskan untuk *ngulik* lebih lanjut biar bisa mempelajari cara kerjanya.

Paham cara kerjanya tentu akan membantu kita menggunakan agentic coding dengan lebih efektif dan efisien. Semoga setelah membaca tulisan ini teman-teman bisa mendapat gambaran yang lebih jelas tentang apa itu agent dan apa yang membedakan AI agent dengan AI yang bukan agent.

Tapi sebelum itu, mari kita lihat bagaimana perjalanan asisten ngoding dari awal hingga sekarang.

## Dari chatbot ke agentic coding

Alat bantu ngoding dengan AI ini telah melewati evolusi yang cukup cepat. Mulai dari chatbot, autocomplete, coding assistant, hingga sekarang kita memasuki eranya agentic coding. Cara penggunaannya pun berbeda-beda.

Chatbot umumnya menggunakan antarmuka web. Ketika butuh bantuan, kita membuka chatgpt.com, claude.ai, gemini.google, dsb. Bertanya tentang topik pemrograman (atau topik apapun), si chatbot memberikan potongan kode yang dibutuhkan. Lalu kita sebagai developer menyalin kode tersebut dan melanjutkan proses pengembangan aplikasi. Dan begitu seterusnya.

Berikutnya muncul fitur autocomplete. Diawali oleh munculnya GitHub Copilot yang diusung oleh Visual Studio Code. Biasanya kita mengetik sesuatu di editor kode lalu AI akan mencoba "menebak" kita maunya apa. Atau autocomplete bisa dipantik dengan menulis komentar kita ingin melakukan apa, lalu AI akan memberikan tebakan terbaiknya.

Kemudian berkembang lagi. Dengan kemunculan code editor baru, Cursor, coding assistant mulai populer. Sederhananya, ini adalah chatbot yang tadinya diakses dengan web browser sekarang ada di code editor. Dengan tambahan konteks file yang sedang dibuka sehingga kita tidak perlu copas lagi. Dan beberapa fitur menarik lainnya seperti inline chat, hingga fitur yang mampu memahami proyek secara keseluruhan dengan berbagai metodenya seperti indexing code, repomap dan sebagainya.

Setiap kode yang ditambahkan, tetap ada peran kita sebagai manusia yang melakukan perubahan. Menyimpan perubahan file misalnya. Meskipun biasanya editor kita set untuk melakukan auto save. File baru pun harus kita yang buat.

Terakhir, tibalah kita ke era agentic. Jika menggunakan agentic coding, semuanya otomatis. Bikin file baru, baca, tulis dan ubah file, menjalankan perintah terminal dan sebagainya bisa dilakukan oleh llm. Dimulai dari Cursor dan dipopulerkan oleh Claude Code.

Tapi apa sih sebenarnya agents atau agentic ini? Kenapa kok tiba-tiba llm bisa melakukan banyak hal yang tadinya tidak bisa dilakukan?

## Pola *Agentic*

*Agent* atau *Agentic* berasal dari kata *agency*. *Agency* secara harfiah berarti kemampuan untuk bertindak, bukan cuma berpikir atau memberi saran. Atau dengan kata lain punya inisiatif.

LLM tanpa agent layaknya AI dalam tempurung. Jago ngomong, pengetahuan luas, walaupun terbatas (cut off). Meski puntar menjawab pertanyaan kita, tapi LLM tidak bisa berbuat apa-apa, tidak bisa mengingat apapun dan tidak mampu memutuskan jika diberi pilihan. Tidak bisa membaca file, menulis file bahkan tidak tahu tanggal dan jam berapa saat ini.

Jadi gimana caranya supaya LLM punya inisiatif? Persenjatai LLM dengan alat bantu atau _tools_. Mulai dari yang sederhana seperti kasih akses untuk *ngecek* jam dan tanggal, *ngecek* kurs atau cuaca hingga memberikan akses untuk baca dan tulis file.

LLM dengan alat ini, ditambah alat untuk menyimpan percakapan dan kemampuan untuk menentukan pilihan alat mana yang cocok, itulah yang disebut sebagai AI Agent.

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

TODO: Apakah ini ada hubungannya dengan Chain of Thought, ReAct, dll?

## Praktek Membuat Agentic Coding Tool

Mari kita praktekkan langkah demi langkah. Berhubung LLM chatbot saat ini sudah dilengkapi oleh banyak alat, kita bisa bertanya tanggal dan jam saat ini dan LLM mampu menjawab dengan akurat. Karena itu kita akan membuat LLM chatbot dari awal dengan menggunakan REST API.

[Screenshot chatbot]

[Kode hit ke llm service]
	
Sekarang coba kita jalankan untuk menanyakan tanggal dan jam saat ini.

```shell
./mbb "Tanggal dan jam berapa sekarang?"
```

## Kesimpulan

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

Bayangkan teman-teman cukup menulis dan memberi perintah 'Buatkan aplikasi untuk mencatat pengeluaran', lalu tiba-tiba file baru muncul, terminal berjalan sendiri, dan beberapa menit berselang aplikasi sudah siap untuk digunakan. Apakah ini sihir? Bukan, ini *Agentic Coding*.

*Agentic coding tool* seperti [Claude Code](https://claude.com/product/claude-code), [Codex](https://openai.com/codex/), [Cursor](https://cursor.com/) atau yang lainnya, memang rasanya seperti sihir. Sedikit sulit dipercaya, apalagi yang belum merasakan manfaatnya. Bagi yang belum menggunakan, silakan dicoba dalam jangka beberapa waktu. Cepat atau lambat teman-teman akan merasakan daya magisnya.

Tapi di balik layar, semua itu bukanlah sihir. Melainkan sebuah pola yang disebut *agentic coding*.
Di artikel ini, kita tidak hanya akan mengintip ke balik tirai, kita akan belajar bagaimana cara kerjanya dan mempelajari polanya.

Paham cara kerjanya tentu akan membantu kita menggunakan agentic coding dengan lebih efektif dan efisien. Semoga setelah membaca tulisan ini teman-teman bisa mendapat gambaran yang lebih jelas tentang apa itu agent dan apa yang membedakan AI agent dengan AI yang bukan agent.

Sebelum itu, mari kita lihat bagaimana perjalanan asisten ngoding dari awal hingga sekarang.

## Dari Tukang Ketik ke Mandor Proyek

Perkakas ngoding dengan AI ini telah melewati evolusi yang cukup cepat. Mulai dari *chatbot* , *autocomplete* , *coding assistant*, hingga sekarang kita memasuki eranya *agentic coding*.

*Chatbot* umumnya menggunakan antarmuka web. Ketika butuh bantuan, kita membuka [chatgpt.com](https://chatgpt.com), [claude.ai](https://claude.ai), [gemini.google](https://gemini.google), dsb. Bertanya tentang topik pemrograman (atau topik apapun), si *chatbot* memberikan potongan kode yang dibutuhkan. Lalu kita sebagai developer menyalin kode tersebut dan melanjutkan proses pengembangan aplikasi. Dan begitu seterusnya.

<figure>
	{% image "./assets/images/agentic/chatbot.png", "Chatbot Web" %}
	<figcaption>Chatbot web</figcaption>
</figure>
	
Berikutnya muncul fitur *autocomplete*. Diawali oleh munculnya [GitHub Copilot](https://github.com/features/copilot) yang diusung oleh [Visual Studio Code](https://code.visualstudio.com/). Biasanya kita mengetik sesuatu di editor kode lalu AI akan mencoba "menebak" kita maunya apa. Atau *autocomplete* bisa dipantik dengan menulis komentar kita ingin melakukan apa, lalu AI akan memberikan tebakan terbaiknya.

<figure>
	{% image "./assets/images/agentic/autocomplete.png", "Autocomplete" %}
	<figcaption>Fitur autocomplete</figcaption>
</figure>


Kemudian berkembang lagi. Dengan kemunculan code editor baru, [Cursor](https://cursor.com/), asisten ngoding semakin populer. Sederhananya, ini adalah *chatbot* yang tadinya diakses dengan web browser sekarang ada langsung di editor kode. Dengan tambahan konteks file yang sedang dibuka sehingga kita tidak perlu *copas* lagi. Dan beberapa fitur menarik lainnya seperti *inline chat*, hingga fitur yang mampu memahami proyek secara keseluruhan dengan berbagai metodenya seperti *indexing code*, [repomap](https://aider.chat/2023/10/22/repomap.html) dan sebagainya.

Setiap kode yang ditambahkan, tetap ada peran kita sebagai manusia yang melakukan perubahan. Menyimpan perubahan file misalnya. Meskipun biasanya editor kita set untuk melakukan *auto save*. File baru pun harus kita yang buat.

<figure>
	{% image "./assets/images/agentic/assistant.png", "Coding assistant" %}
	<figcaption>Coding assistant</figcaption>
</figure>


Terakhir, tibalah kita ke era agentic. Jika menggunakan agen, semuanya serba otomatis. Bikin file baru, baca, tulis dan ubah file, menjalankan perintah terminal dan sebagainya bisa dilakukan oleh LLM. Dimulai dari [Cursor](https://cursor.com/learn/agents) dan dipopulerkan oleh [Claude Code](https://claude.com/product/claude-code).

Salah satu ciri khas *agentic coding* ketika diberi perintah, LLM akan merencanakan, membuat langkah demi langkah untuk menyelesaikan perintah terus menerus sampai perintah dianggap sudah selesai. Jadi si agen ini bukan hanya berusaha menyelesaikan perintah tapi seolah ia berpikir, berencana baru mengeksekusi hingga selesai.

<figure>
	{% image "./assets/images/agentic/agentic.png", "Agentic coding" %}
	<figcaption>Agentic coding</figcaption>
</figure>

Cara ini cocok sekali untuk tugas yang kompleks dan sulit dikerjakan dalam sekali tembak. Kok bisa ya tiba-tiba ada LLM yang bisa "mikir", buat rencana lalu eksekusi?

## Pola *Agentic*

*Agent* atau *Agentic* berasal dari kata *agency*. *Agency* secara harfiah berarti kemampuan untuk bertindak, bukan cuma berpikir atau memberi saran. Atau dengan kata lain punya inisiatif. 

LLM tanpa agen layaknya **AI dalam tempurung**. Jago ngomong, pengetahuan luas, walaupun terbatas (*cut off*). Meski pintar menjawab pertanyaan kita, tapi LLM tidak bisa berbuat apa-apa, tidak bisa mengingat apapun dan tidak mampu memutuskan jika diberi pilihan. Tidak bisa membaca file, menulis file bahkan tidak tahu tanggal dan jam berapa saat ini.

<figure>
	{% image "./assets/images/agentic/tempurung.png", "Ilustrasi LLM" %}
	<figcaption>Ilustrasi LLM: AI dalam tempurung</figcaption>
</figure>

LLM adalah mesin prediksi token. Berusaha menyelesaikan teks dengan probabilitas tertinggi. Termasuk juga *autocomplete* kode, yang adalah teks. Kemampuan dasar LLM adalah menghasilkan teks, tidak dapat mengetahui apa yang terjadi disekitarnya. Tidak tahu tanggal dan jam saat ini, baca dan tulis file, bahkan percakapan terdahulu pun LLM tidak ingat. Kecuali diberi akses untuk mendapatkan informasi tanggal dan jam saat ini, akses untuk baca dan tulis file atau menyertakan percakapan terdahulu.

Jadi sebenarnya LLM itu bukan kurang pintar, cuma kurang diberi akses saja.


<figure>
	{% image "./assets/images/agentic/tool.png", "LLM + Tools" %}
	<figcaption>LLM + Tools</figcaption>
</figure>


Jadi gimana caranya supaya LLM punya inisiatif? Persenjatai LLM dengan perkakas atau _tools_. Mulai dari yang sederhana seperti kasih akses untuk *ngecek* jam dan tanggal, *ngecek* kurs atau cuaca hingga memberikan akses untuk baca dan tulis file.

LLM dengan perkakas ini, ditambah perkakas untuk menyimpan percakapan dan kemampuan untuk menentukan pilihan perkakas mana yang cocok, dan berjalan terus-menerus hingga tugas selesai itulah yang disebut sebagai AI Agent.

<figure>
	{% image "./assets/images/agentic/ai.png", "Agentic looping" %}
	<figcaption>Agentic looping</figcaption>
</figure>


Dengan kata lain, LLM disebut sebagai agen atau *agentic* jika LLM berjalan terus-menerus (*loop*) yang dapat melakukan observasi apa yang sedang dikerjakan, disediakan perkakas untuk bekerja dan punya kemampuan untuk memutuskan kapan sebuah pekerjaan dinyatakan selesai.

{% image "./assets/images/agentic/loop.gif", "Agentic Looping" %}

## Tiga Komponen Utama

Ada tiga komponen utama dalam **Agentic AI**, yaitu: perkakas, memori dan reasoning loop. Mari kita bahas satu-per-satu.

### Perkakas
Memberikan kemampuan kepada LLM. Misalnya kemampuan mendapatkan informasi tanggal dan jam saat ini, cuaca di sebuah kota, harga emas terkini, hingga mengoperasikan file seperti baca dan tulis bahkan kita bisa memberikan kemampuan untuk menjalankan perintah bash.
### Memori
Memberikan daya ingat, jangka panjang ataupun jangka pendek akan membuat LLM semakin terlihat "pintar". LLM bisa paham siapa yang sedang berbicara, tugas apa yang ingin diselesaikan karena setiap percakapan baru ditambahkan ke dalam memori. Mulai dari yang paling sederhana, menambahkan ke struktur data array dan mengirimkan kembali histori percakapan hingga yang canggih seperti database eksternal.

Kita bisa saja setiap kali ingin mengirimkan perintah selalu menyertakan percakapan terdahulu. Namun dalam jangka panjang hal ini menjadi melelahkan dan membuat LLM menjadi terlihat "bodoh". Atau bahkan membuat LLM bingung karena kebanyakan konteks.

Hal ini terjadi karena LLM memiliki batasan pandangan yang disebut **Context Window**. Bayangkan *context window* seperti meja kerja. Memori adalah lemari arsip yang penuh dengan dokumen. Kita tidak bisa menumpuk semua isi lemari ke atas meja sekaligus karena mejanya akan penuh, berantakan, dan kita malah tidak bisa bekerja.

<figure>
	{% image "./assets/images/agentic/meja.png", "Ilustrasi meja yang penuh dokumen" %}
	<figcaption>Ilustrasi meja yang penuh dokumen. Dibuat oleh AI.</figcaption>
</figure>


Di sinilah **Context Engineering** berperan. Jika memori adalah tentang apa yang disimpan, maka *context engineering* adalah tentang bagaimana kita memilih dan menyusun informasi tersebut agar LLM tetap fokus. Tanpa pengelolaan konteks yang baik, LLM akan kehilangan arah, bingung lalu mulai mengabaikan instruksi yang berada di tengah-tengah percakapan yang terlalu panjang.

### *Reasoning Loop* 

Dan yang tidak kalah penting adalah kemampuan LLM dalam menentukan dan memilih perkakas yang mana yang cocok digunakan ketika ada permintaan dari pengguna. Misalnya, ketika pengguna bertanya tentang jam berapa, LLM dapat memutuskan untuk menggunakan perkakas jam dan tanggal, bukan malah baca atau tulis file.

Dan LLM juga punya kemampuan untuk terus menerus berusaha untuk menyelesaikan pekerjaannya. Hal inilah yang menjadi pembeda. Sebelum model Sonnet versi 3.7, LLM sulit sekali diajak *looping*. Meskipun sudah diinstruksikan secara eksplisit kadang LLM memutuskan berhenti sebelum tuntas.

Proses berpikir ini sering disebut sebagai **Chain of Thought**. LLM diinstruksikan untuk berpikir dan *ngomong* sendiri untuk merencanakan langkah-langkah untuk menyelesaikan sebuah tugas. Ketika digabung dengan perkakas lainnya, bisa menjelma menjadi sebuah framework seperti ReAct (Reason + Act) yang lebih *powerful*. Reasoning loop ini adalah "**nyawa**" dari agentic coding.

<figure>
	{% image "./assets/images/agentic/thinking.png", "Proses berpikir ala LLM" %}
	<figcaption>Proses berpikir ala LLM</figcaption>
</figure>


## Praktek Membuat Agentic Coding Tool

Mari kita praktekkan langkah demi langkah. Berhubung LLM chatbot saat ini sudah dilengkapi oleh banyak perkakas, kita bisa bertanya tanggal dan jam saat ini dan LLM mampu menjawab dengan akurat. Karena itu kita akan membuat LLM chatbot dari awal dengan menggunakan REST API.

<figure>
	{% image "./assets/images/agentic/gemini.png", "Gemini" %}
	<figcaption>Bertanya tentang jam dan tanggal.</figcaption>
</figure>

Untuk itu, kita akan mengirimkan data langsung ke penyedia jasa LLM melalui REST API seperti Google, Anthropic, OpenAI dan sebagainya. Untuk contoh disini akan menggunakan Google dan Gemini 3 Flash sebagai pilihan modelnya. Silakan ganti URL, model dan variable API_KEY jika ingin menggunakan penyedia jasa LLM lain.

```shell
export API_KEY=-AI...
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "contents": [
          {
            "role": "user",
            "parts": {
              "text": "Tanggal dan jam berapa sekarang?"
            }
          }
        ],
        "generationConfig": {
            "thinkingConfig": {
                "thinkingLevel": "LOW"
            }
        }
    }'
```
    
```
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Sekarang adalah hari **Jumat, 24 Mei 2024**.\n\nWaktu saat ini menunjukkan pukul **14:34 WIB** (Waktu Indonesia Barat).",
            ...
          },
        ]
      },
    }
  ]
}
```

<br />

Halu kan?! Saat menulis ini saya berada di tahun 2026. Ini bukanlah trik mesin waktu. Lebih kepada LLM belum diberi akses untuk mendapatkan informasi tanggal dan jam sehingga LLM terpaksa berbohong. Karena memang di desain seperti itu, untuk memastikan tugasnya selesai walaupun keliru.

## Kesimpulan

Agentic coding itu bukan sulap bukan sihir. Agentic merupakan pola kerja. LLM pada dasarnya hanyalah mesin prediksi token: jago menebak kelanjutan teks, tapi “buta” terhadap dunia nyata kalau tidak diberi akses apa pun. Begitu kita lengkapi LLM dengan perkakas (bisa baca/tulis file, cek waktu, jalanin perintah), kita beri daya ingat (supaya tidak gampang lupa), dan kita bantu LLM bekerja dalam reasoning loop (merencanakan → mengeksekusi → mengamati → mengulang), barulah ia terlihat punya agency: bisa bertindak, bukan cuma menjawab.

Contoh paling sederhana adalah pertanyaan “jam berapa sekarang?” Tanpa diberi akses untuk mendapatkan informasi waktu, LLM bisa saja menjawab dengan percaya diri tapi keliru. Bukan karena bodoh, melainkan karena tidak punya cara untuk memverifikasi. Di sinilah inti agentic: kualitas output bukan cuma ditentukan oleh “seberapa pintar modelnya”, tapi juga oleh akses, batasan, dan mekanisme verifikasi yang kita desain. Setelah paham pola ini, kita bisa menggunakan agentic coding tools lebih efektif.

Perkakas yang diberikan bisa apa saja, namun untuk "menyulap" LLM agar menjadi lebih punya inisiatif atau agentic, LLM perlu setidaknya tiga komponen utama:
- Perkakas. Layaknya manusia, bekali dengan perkakas sehingga dapat melakukan sesuatu, tidak hanya menjawab pertanyaan atau berbicara saja.
- Memori. Memberikan daya ingat agar LLM tetap relevan dan sesuai konteks.
- Reasoning loop. Mekanisme yang membantu LLM akan terus mencoba hingga tugasnya dianggap selesai.

Di bagian berikutnya kita akan bikin versi minimal agentic coding tool melanjutkan aplikasi chatbot sederhana yang tadi sudah kita bahas.

## Referensi
- 📺 [What Are AI Agents & How Do They Work by ByteByteAI](https://www.youtube.com/watch?v=oP6DS_x5K0Y)
- 🐦 [How to work with coding agent by @tyohan](https://x.com/tyohan/status/1992940420322799693)
- 📺 [Ngobrolin Web Episode Agentic AI](https://ngobrol.in/episodes/ZcYNuHirHOA-agentic-ai-ngobrolin-web/)
- 🎶 [Syntax.fm Episode Pi - The AI Harness That Powers OpenClaw W/ Armin Ronacher & Mario Zechner](https://syntax.fm/show/976/pi-the-ai-harness-that-powers-openclaw-w-armin-ronacher-and-mario-zechner/transcript)

---
title: Produktif dengan Asisten Ngoding
modified: 2025-06-13
created: 2025-04-03
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: false
---

--- 
**Seri Asisten Ngoding**
1. Produktif dengan Asisten Ngoding [Artikel saat ini]
2. [Diskusi dan Menulis Spesifikasi dengan AI](/catatan/asisten-ngoding-2)
3. [Menyusun Rencana dengan Asisten Ngoding](/catatan/asisten-ngoding-3) 
---

Dunia pengembangan perangkat lunak telah mengalami transformasi signifikan dalam alat bantu pemrograman. Bermula dari fitur *autocomplete* sederhana yang hanya menyelesaikan kata kunci atau nama fungsi yang sudah diketahui, kini berkembang menjadi sistem cerdas yang mampu memahami konteks kode secara menyeluruh. Pada era awal, IDE seperti Visual Studio atau Eclipse menawarkan saran secara statis berdasarkan pustaka yang telah didefinisikan, namun memiliki keterbatasan dalam memahami logika.

Kemajuan teknologi AI, khususnya model bahasa besar (LLM), telah merevolusi asisten koding menjadi alat yang jauh lebih canggih. Asisten koding modern seperti GitHub Copilot, Cursor, ChatGPT, v0, Aider.chat dan lain sebagainya tidak hanya melengkapi baris kode yang sedang ditulis, tetapi juga mampu menghasilkan fungsi lengkap, algoritma kompleks, dan bahkan seluruh modul berdasarkan penjelasan dengan bahasa manusia. Berbeda dengan cara tradisional, asisten berbasis AI punya kemampuan memahami pola penulisan kode dalam skala besar, menganalisis struktur proyek secara keseluruhan, dan menyesuaikan saran dengan gaya dari basis kode yang sudah ada. AI dapat memberikan penjelasan, mengusulkan refaktorisasi, mengidentifikasi potensi kesalahan (*bug*), dan bahkan menghasilkan kode pengujian (*testing*) — kemampuan yang jauh melampaui pencapaian generasi sebelumnya.

## Beberapa jenis asisten koding

### *AI Chatbot*

Meski bukan spesifik untuk membantu pemrograman, beberapa AI chatbot dapat digunakan untuk bertanya seputar kode dan pemrograman. Beberapa diantaranya:    
   - [ChatGpt.com](https://chatgpt.com/)
   - [Claude.ai](https://claude.ai)
   - [Gemini](https://gemini.google.com/)
   - [DeepSeek](https://chat.deepseek.com)
   - [Qwen Chat](https://chat.qwen.ai/)
    
   Selain untuk meminta saran untuk kode, AI berbasis chatbot seperti ini sangat cocok untuk diskusi atau *brainstorming*.
       
![contoh chatbot](/assets/asisten/claude.png)

###  *AI Code Completion*

Dibawah ini beberapa alat yang dapat membantu untuk melengkapi kode disaat kita sedang menulis kode di editor.
- [GitHub Copilot](https://github.com/features/copilot): Asisten koding untuk menghasilkan, melengkapi, dan menyarankan kode secara *real-time* berdasarkan konteks yang kita berikan. Dapat dijalankan sebagai ekstensi vscode, jetbrains, dan vim.
- [Tabnine](https://www.tabnine.com/): Secara *timeline* mungkin yang paling duluan, namun saat ini kalah pamor dibandingkan pesaingnya.
- [Supermaven](https://supermaven.com/): Dikenal sangat cepat dalam menghasilkan kode yang dapat digunakan di berbagai kode editor seperti vscode, vim, zed, dll.
- [Codeium](https://codeium.com/): Ekstensi vscode *open-source* yang dapat digunakan secara gratis untuk penggunaan personal.

![contoh code completion](/assets/asisten/completion.png)

###  *AI Code Editor*

Evolusi berikutnya dari *code completion*. Jika *code completion* mampu mengerti kode yang sedang dibuka saat itu, maka *AI Code Editor* mampu memahami proyek secara keseluruhan.    
AI yang "menyatu" dengan kode editor. Selain mampu memberi saran terhadap kode yang sedang kita tulis (sama halnya dengan *code completion*) *AI Code Editor* mampu membuat, mengubah atau menghapus satu atau beberapa file sekaligus dalam satu kali perintah.    
- [Cursor](https://www.cursor.com/): Pelopor AI Code Editor, populer dan punya UX terbaik saat ini. Fork dari vscode.
- [VSCode + Copilot](https://code.visualstudio.com/docs/copilot/overview): Meskipun dalam bentuk extensi, Copilot (chat, edit dan agent) punya kemampuan yang cukup mumpuni.
- [VSCode + Gemini](https://marketplace.visualstudio.com/items?itemName=Google.geminicodeassist): Ekstensi freemium dari Google Gemini yang sangat murah hati.
- [Zed](https://zed.dev/): Kode editor baru yang dikenal sangat cepat.
- [Aider](https://aider.chat/), [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview) & [Amazon Q Developer CLI](https://aws.amazon.com/blogs/devops/introducing-the-enhanced-command-line-interface-in-amazon-q-developer/): Menggunakan antarmuka teks (*cli*), dapat digunakan dengan editor kode apapun.

![Contoh coding assistant Claude Code](/assets/asisten/claude-code.jpg)

###  *AI interface builder*

AI yang spesifik digunakan untuk membangun *user interface* atau desain. Jika chatbot dapat digunakan untuk apa saja termasuk membangun UI, *AI code completion* dan *AI code editor* pun bisa, namun hasilnya bisa berbeda. Mungkin karena AI ini menggunakan model yang memang dilatih untuk mengembangkan UI. Ada beberapa alat yang bisa digunakan.
- [v0.dev](https://v0.dev/): Generative AI dengan *interface chat* yang dioptimasi untuk mengembangkan komponen React dan ekosistem Next.
- [bolt.new](https://bolt.new/?rid=nzeu0d): Generative AI dengan *interface chat* untuk mengembangkan aplikasi frontend.
- [lovable.dev](https://lovable.dev/): Aplikasi yang mampu membuat aplikasi fullstack. Cocok untuk konversi desain figma menjadi kode.

![contoh tangkapan layar dari v0](/assets/asisten/v0.png)

## Kesimpulan
Teknologi kecerdasan buatan (AI) telah mengubah pengembangan perangkat lunak secara fundamental, berkembang dari fitur *autocomplete* sederhana menjadi sistem cerdas yang memahami konteks kode secara menyeluruh. Kita mengidentifikasi empat kategori utama asisten koding berbasis AI: AI Chatbot untuk diskusi dan brainstorming, AI Code Completion untuk melengkapi kode secara real-time, AI Code Editor yang mampu memahami proyek secara keseluruhan, dan AI Interface Builder yang dioptimalkan khusus untuk pengembangan UI.

Sekian dulu artikel tentang asisten ngoding kali ini. Nantikan artikel berikutnya ya. Umpan balik sangat berharga buat saya sebagai pertanda apakah topik ini menarik atau tidak. Boleh ya tulis pendapat atau saran di kolom komentar dibawah.

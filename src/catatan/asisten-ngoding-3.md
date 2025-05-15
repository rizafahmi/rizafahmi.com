---
title: Menyusun Rencana dengan Asisten Ngoding
created: 2025-05-03
modified: 2025-05-15
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: false
---

Setelah [dibagian sebelumnya](/catatan/asisten-ngoding-2) kita sudah membahas penggunaan AI sebagai asisten untuk diskusi ide dan pembuatan spesifikasi aplikasi, berikutnya kita akan menggunakan AI untuk menyusun rencana. Biasanya kita punya tendensi untuk segera membuka kode editor dan segera menulis barisan kode. Padahal memiliki rencana yang jelas adalah hal yang sangat penting. Jika menulis kode tanpa rencana yang jelas akan mengakibatkan kebingungan di tengah jalan. Kadang dengan rencana yang jelas saja hasilnya kadang tidak sesuai, gimana kalau menulis kode tanpa rencana?!

> "Give me six hours to chop down a tree and I will spend the first four sharpening the axe." -- Abraham Lincoln

Untungnya sekarang kita bisa memanfaatkan AI untuk menyusun rencana. Mari kita lihat bagaimana caranya.


```text
    +----------+        +---------+        +----------+
    |          |        |         |        |          |
    | Diskusi  | -----> |  Susun  | -----> | Eksekusi |
    |   Ide    |        | Rencana |        |          |
    |          |        |         |        |          |
    +----------+        +---------+        +----------+
                                                 |
		                                 |
                                                 V
                                           +----------+
                                           |          |
                                           |  Kelola  |
                                           |          |
                                           +----------+
```

### Menyusun rencana dengan AI

Dengan berbekal file spesifikasi hasil dari proses pematangan ide kita bisa meminta bantuan AI untuk menyusun rencana. Untuk kebutuhan menyusun rencana ini, disarankan menggunakan model yang mampu berfikir (lebih panjang) seperti chatgpt o1, deepseek deepthink, Qwen Thinking, Gemini Pro 2.5 atau *reasoning model* lainnya. Sepertinya saat ini hampir semua model sudah punya kemampuan ini ya.

![DeepSeek Deepthink](/assets/asisten/deepseek-r1.png)

Kita bisa menggunakan perintah berikut untuk menghasilkan rencana eksekusi. Menariknya, setiap iterasi dilengkapi dengan *prompting* yang sesuai. Nantinya iterasi *prompting* ini akan kita gunakan sebagai perintah bagi AI Code Editor untuk menghasilkan barisan kode.

```text
    Draft a detailed, step-by-step blueprint for building this
    project. Then, once you have a solid plan, break it down
    into small, iterative chunks that build on each other.
    Look at these chunks and then go another round to break it
    into small steps. review the results and make sure that the
    steps are small enough to be implemented safely,
    but big enough to move the project forward.
    Iterate until you feel that the steps are right sized for
    this project.
    
    From here you should have the foundation to provide
    a series of prompts for a code-generation LLM that will
    implement each step. Prioritize best practices,
    and incremental progress, ensuring no big jumps in
    complexity at any stage. Make sure that each prompt builds
    on the previous prompts, and ends with wiring things
    together. There should be no hanging or orphaned code that
    isn't integrated into a previous step.
    
    Make sure and separate each prompt section. Use markdown.
    Each prompt should be tagged as text using code tags.
    The goal is to output prompts, but context, etc is important
    as well.
    
    <SPEC>
```

Intinya kita meminta AI untuk membuat rancang bangun (_blueprint_) secara bertahap. Setelah rencana disusun, pecah menjadi bagian-bagian kecil. Kemudian kita minta dibuatkan _prompt_ atau perintah untuk setiap bagian kecil tersebut yang nantinya akan digunakan untuk memerintahkan Copilot.

 Hasil dari *prompt* diatas bisa disimpan kedalam sebuah file untuk nantinya bisa di copas satu perintah per satu perintah. Jangan lupa, dibaca perlahan dan lakukan perubahan jika diperlukan. Ingat: AI punya sifat dasar **halusinasi**.

Contoh dokumen yang dihasilkan oleh chatbot dengan fitur _reasoning_ dapat dilihat di tautan berikut: [prompt_plan.md](/assets/asisten/prompt_plan.md)

Setelah rencana dan strategi sudah siap, saatnya eksekusi dan membangun aplikasi. Nantikan di artikel selanjutnya!

### Referensi selanjutnya

- [Artikel sebelumnya tentang diskusi ide](/catatan/asisten-ngoding-2)
- [Kumpulan artikel menarik seputar AI dan LLM dalam Bahasa Indonesia](https://dekontaminasi.substack.com)
-  https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
-  https://danieldelaney.net/chat
-  https://learn.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agent

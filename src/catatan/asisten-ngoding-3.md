---
title: Menyusun Rencana dengan Asisten Ngoding
created: 2025-05-03
modified: 2025-06-10
layout: tulisan
tags:
  - catatan
  - ai
  - agentic-coding
  - planning

eleventyExcludeFromCollections: false
---

--- 
**Seri Asisten Ngoding**
1. [Produktif dengan Asisten Ngoding](/catatan/asisten-ngoding)
2. [Diskusi dan Menulis Spesifikasi dengan AI](/catatan/asisten-ngoding-2)
3. ➡︎ Menyusun Rencana dengan Asisten Ngoding
4. [Desain Antarmuka dengan Asisten Ngoding](/catatan/asisten-ngoding-4)
5. [Menulis Kode dengan Asisten Ngoding](/catatan/asisten-ngoding-5)

---


Setelah [di bagian sebelumnya](asisten-ngoding-2.md) kita membahas penggunaan AI sebagai asisten untuk diskusi ide dan pembuatan spesifikasi aplikasi, kali ini kita akan fokus memanfaatkan AI untuk menyusun rencana. 

Sering kali, kita tergoda untuk langsung membuka kode editor dan mulai menulis tanpa mempersiapkan rencana terlebih dahulu. Padahal, rencana yang matang adalah kunci keberhasilan pembangunan sebuah aplikasi. Tanpa rencana yang jelas, kita berisiko mengalami kebingungan atau kesalahan di tengah jalan. Bahkan dengan strategi yang sudah matang sekalipun, hasilnya bisa saja meleset. Bayangkan apa yang terjadi jika kita menulis tanpa rencana!

> "Give me six hours to chop down a tree and I will spend the first four sharpening the axe." -- Abraham Lincoln

Kini dengan bantuan AI, proses menyusun rencana dapat dilakukan secara lebih efektif. Mari kita eksplorasi caranya di artikel kali ini. Sebagai pengingat, dibawah adalah ilustrasi tahapan dalam membangun aplikasi. Kini kita sampai ke tahapan kedua yaitu menyusun rencana.

```
    +----------+        +---------+        +----------+
    |          |        |    ✅   |        |          |
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

### Menyusun Rencana dengan AI

Dengan bekal spesifikasi hasil dari proses diskusi ide di artikel sebelumnya, kita dapat meminta bantuan AI untuk menyusun rencana beserta berbagai tahapannya. Untuk tugas ini, disarankan menggunakan model AI yang unggul dalam *reasoning*, seperti **ChatGPT-01**, **DeepSeek DeepThink**, **Qwen Thinking**, atau **Gemini Pro 2.5**. Sepertinya saat ini hampir semua model AI modern memiliki kemampuan ini.

![DeepSeek DeepThink](/assets/asisten/deepseek-r1.png)

### Langkah Membuat Rencana

Kita dapat memberikan perintah berikut kepada AI untuk menghasilkan rencana eksekusi:

```text
Draft a detailed, step-by-step blueprint for building this project. Then, once you have a solid plan, break it down into small, iterative chunks that build on each other. Look at these chunks and then go another round to break them into smaller steps. Review the results and make sure that the steps are small enough to be implemented safely, but big enough to move the project forward.

Iterate until you feel the steps are correctly sized for this project. From here, you should have the foundation to provide a series of prompts for a code-generation LLM to implement each step. Prioritize best practices and incremental progress, ensuring no big jumps in complexity at any stage. Make sure each prompt builds on the previous steps and ends with integration. No orphan code!

Separate each prompt section using markdown. Each prompt should be tagged as text using code tags to ensure clear communication.
< SPEC >
```

**Inti dari perintah diatas** adalah meminta AI menyusun _blueprint_ secara terstruktur, memecah rencana menjadi langkah-langkah kecil, lalu menghasilkan *prompt* untuk tiap langkah. Prompt ini kemudian dapat digunakan oleh AI Code Editor seperti *Copilot*.

Hasil dari langkah ini dapat disimpan ke dalam file sebagai panduan. Namun, pastikan untuk membaca dan melakukan penyuntingan jika diperlukan, mengingat AI cenderung memiliki sifat **halusinasi**.

Sebagai contoh, hasil dokumen yang dihasilkan oleh model AI *reasoning* dapat ditemukan di tautan berikut:
[Contoh Dokumen Prompt](/assets/asisten/prompt_plan.md)

Setelah memiliki rencana dan strategi, kita siap melangkah ke tahap eksekusi dan membangun aplikasi. Tunggu bagian selanjutnya di artikel mendatang!

---

### Referensi

- [Artikel sebelumnya tentang diskusi ide](asisten-ngoding-2.md)
- [Kumpulan artikel menarik tentang AI dan LLM dalam Bahasa Indonesia](https://dekontaminasi.substack.com)
- [My LLM Codegen Workflow ATM](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)
- [Daniel Delaney's Chat Workflow](https://danieldelaney.net/chat)
- [Build Apps with Windsurf's AI Coding Agent](https://learn.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agent)

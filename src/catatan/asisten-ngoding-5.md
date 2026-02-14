---
title: Menulis Kode dengan Asisten Ngoding
created: 2025-05-03
modified: 2025-11-13
layout: tulisan
tags:
  - catatan
  - ai
  - agentic-coding
  - coding

eleventyExcludeFromCollections: false
---

--- 
**Seri Asisten Ngoding**
1. [Produktif dengan Asisten Ngoding](/catatan/asisten-ngoding)
2. [Diskusi dan Menulis Spesifikasi dengan AI](/catatan/asisten-ngoding-2)
3. [Menyusun Rencana dengan Asisten Ngoding](/catatan/asisten-ngoding-3)
4. [Desain Antarmuka dengan Asisten Ngoding](/catatan/asisten-ngoding-4)
5. Menulis Kode dengan Asisten Ngoding [Artikel saat ini]
---

Setelah [bagian sebelumnya](asisten-ngoding-4.md) kita sudah mendapatkan desain yang dihasilkan *AI Interface Generator*, dalam hal ini menggunakan [Firebase Studio](https://studio.firebase.google.com/studio-9374311499). Sekarang saatnya menciptakan kode logika. Lalu kemudian kita akan melihat beberapa opsi untuk mengelola kode yang sudah dibuatkan AI. Tentu saja dengan bantuan AI.

```
    +----------+        +---------+        +----------+
    |          |        |         |        |    ✅    |
    | Diskusi  | -----> |  Susun  | -----> | Eksekusi |
    |   Ide    |        | Rencana |        |          |
    |          |        |         |        |          |
    +----------+        +---------+        +----------+
                                                 |
                                                 |
                                                 V
                                           +----------+
                                           |     ✅   |
                                           |  Kelola  |
                                           |          |
                                           +----------+
```


## Mengembangkan aplikasi

Kita akan menggunakan kombinasi vscode+copilot meskipun dapat juga menggunakan editor lain seperti Cursor, Windsurf, Zed dll. Tentu hasilnya akan berbeda. Bisa jadi hasilnya lebih baik, karena sampai tulisan ini dibuat, sepertinya copilot agak sedikit tertinggal dibandingkan Cursor ataupun Windsurf, khususnya fitur *agentic*.

Gunakan *prompt plan* yang sudah didapat dari bagian sebelumnya untuk mulai melakukan iterasi pengembangan aplikasi. Tidak perlu terlalu terpaku kepada prompt yang sudah disediakan, silakan diubah atau diganti jika kurang sesuai.

Karena prompt dibuat oleh AI juga ada kemungkinan keliru, jadi harap diteliti lebih lanjut.

Untuk copilot sendiri, saat ini ada 3 fitur utama:

-   *Code completion* yang akan membantu ketika kita menulis kode.
-   Copilot Chat yang dapat digunakan untuk diskusi dan bertanya dengan antarmuka chat. Contoh: "jelaskan alur kode dari proyek ini".
-   Copilot Edit mampu memodifikasi satu atau beberapa file sesuai dengan menggunakan instruksi yang diberikan. Atau istilah kerennya: *agentic* mode.

Jalankan iterasi satu-per-satu. Jika saat menjalankan sebuah iterasi dibutuhkan penyesuaian, lakukan terlebih dahulu sebelum menuju ke iterasi berikutnya.

{% image "./assets/asisten/contoh-iterasi.png", "img" %}

### Mengelola Kode dengan AI

Setelah proses pengembangan fitur sudah (dianggap) selesai, saatnya beralih ke tahap pengelolaan kode. Pada tahap ini, AI juga dapat menjadi _partner_ yang sangat membantu untuk meningkatkan kualitas kode yang telah dibuat.

#### Menambahkan Pengujian Otomatis

Salah satu manfaat penting dari asisten koding berbasis AI adalah kemampuannya untuk membantu membuat pengujian (_testing_). Dengan adanya pengujian yang baik, aplikasi yang kita kembangkan akan lebih tangguh dan minim kesalahan.

Strategi yang efektif saat bekerja dengan AI untuk membuat pengujian adalah dengan menerapkan pendekatan kolaboratif. Buatlah satu kasus uji (*test case*) secara manual terlebih dahulu, kemudian minta AI untuk mengembangkan kasus-kasus uji tambahan berdasarkan contoh tersebut. Pengalaman menunjukkan bahwa jika kita meminta AI membuat pengujian tanpa contoh sama sekali, hasilnya seringkali kurang relevan dengan kode spesifik yang kita miliki.

Pendekatan ini dalam dunia LLM dikenal dengan istilah *few-shot prompting* – teknik di mana kita memberikan satu atau beberapa contoh konkret agar AI dapat "belajar" dari pola tersebut dan menghasilkan konten serupa dengan kualitas yang lebih baik. Untuk penjelasan lebih mendalam tentang teknik ini, [teman-teman dapat membaca artikel ini](https://dekontaminasi.substack.com/p/menyundul-llm-dengan-contoh-nyata). 

{% image "./assets/asisten/testing.png", "Github Copilot" %}

Berhubung proyek belum disiapkan untuk pengujian, sebelum *prompting* untuk pembuatan pengujian atau *testing* sebaiknya kita konfigurasi terlebih dahulu. Bisa minta tolong AI juga, kali ini kita akan menggunakan fitur Copilot Chat. Tapi akan lebih baik jika kita setup sendiri dan berikan satu atau beberapa contoh *test case*.

```shell
npm install --save-dev vitest @testing-library/react @testing-library/dom jsdom @types/react @types/react-dom
```

#### 1.  `package.json`

```json
"scripts": {
	"test": "vitest"
},
```

#### 2.  `src/smoke.test.ts`

```typescript
import { describe, it, expect } from "vitest"

describe("smoke test", () => {
  it("should pass", () => {
	expect(true).toBe(true)
  })
});
```

#### 3.  `vite.config.ts`

```diff
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
	exclude: ['lucide-react'],
  },
+ test: {
+   environment: 'jsdom'
+ }
});
```

#### 4.  `src/App.test.tsx`

```typescript
import { expect, test } from "vitest"
import { render, screen } from '@testing-library/react'
import App from './App'

test('loads and displays greeting', async () => {
  // ARRANGE
  render(<App />)

  // ACT

  // ASSERT
  const header = screen.getByText("IDEA VAULT")
  expect(header).toBeDefined()
})

npm test
```

Setelah memastikan pengujian berjalan, kita bisa mulai meminta LLM untuk membuatkan pengujian untuk kita.

<a id="orgab720a1"></a>
#### Mendokumentasikan Kode

Sebagai seorang _developer_, menulis dokumentasi seringkali terasa seperti beban tambahan. Lebih menyenangkan rasanya fokus pada penulisan kode daripada menjelaskan cara kerjanya, bukan?! 😬 Di sinilah AI dapat mengambil alih tugas dokumentasi yang sering kali terbengkalai.

Misalnya, untuk mendokumentasikan sebuah fungsi, biasanya kita menggunakan format standar seperti JSDoc (JavaScript), JavaDoc (Java), docstring (Python) atau format lainnya sesuai bahasa. AI dapat dengan cepat menganalisis kode kita dan menghasilkan dokumentasi yang komprehensif dalam format yang sesuai.

{% image "./assets/asisten/jsdoc.png", "dokumentasi kode" %}

Yang menarik, jika AI menghasilkan dokumentasi yang kurang tepat atau terkesan "ngawur", ini bisa menjadi sinyal berharga. Jika asisten AI yang sudah dilatih dengan miliaran baris kode masih kesulitan memahami logika kode kita, kemungkinan besar kode tersebut memang kurang jelas atau terlalu kompleks. Anggap saja ini sebagai peringatan dini bahwa kode kita perlu disederhanakan.

<a id="org7e6516b"></a>
#### Melakukan Refactoring

Saat menulis kode, prioritas utama kita biasanya adalah membuat fitur berfungsi dengan benar. Filosofi "yang penting jalan dulu" sering diterapkan dengan rencana untuk merapikan kode di kemudian hari. Dengan adanya asisten AI, proses "beres-beres" ini bisa menjadi solusi.

Contoh sederhana: saat semua kode terkumpul dalam satu file seperti `App.tsx`, kita dapat meminta AI untuk memecahnya menjadi komponen-komponen terpisah yang lebih terorganisir.

{% image "./assets/asisten/refactor.png", "img" %}

Lebih dari itu, AI juga dapat membantu transformasi kode yang lebih kompleks, seperti:
-   Menerapkan prinsip _Clean Architecture_
-   Memeriksa apakah kode sudah menerapkan prinsip DRY (Don't Repeat Yourself)
-   Mengidentifikasi potensi masalah performa atau keamanan
-   Melakukan migrasi antar teknologi (_rewrite_), misalnya dari JavaScript ke TypeScript, React+Vite ke Astro, atau bahkan transformasi lebih radikal seperti dari Python ke JavaScript atau iOS ke Android

Pengalaman pribadi saya, pernah meminta bantuan desain melalui [Bolt](https://bolt.new/?rid=nzeu0d) dan v0, kemudian mengunduh kodenya sebagai referensi untuk proyek non-JavaScript/TypeScript. Selanjutnya, saya meminta AI untuk menganalisis _styling_ atau desain dari aplikasi tersebut dan menerapkannya ke aplikasi Elixir/Phoenix dengan *prompt* sederhana:

    I have this TypeScript app in /docs/references/v0. I want you to be able to access the TypeScript app, view the code of it inside the project. I don't want to break anything inside the Phoenix app. Then I want you to analyze the styles within that TypeScript app and apply those styles to our Elixir/Phoenix app

Selain membantu pengembangan dan perbaikan kode, AI juga sangat berguna untuk proses *onboarding* anggota tim baru. Saat menghadapi basis kode yang besar dan kompleks, AI dapat membantu menjelaskan struktur, logika, dan keputusan arsitektural yang mendasari proyek tersebut. Ini sangat berharga, terutama saat kita bergabung dengan proyek yang sudah berjalan dan perlu memahami sistem secara menyeluruh sebelum melakukan modifikasi.

## Penutup
### Tantangan

**Pemrogram berpengalaman menggunakan AI untuk mengakselerasi apa yang sudah diketahuinya**. AI membantu mengerjakan hal-hal yang sifatnya berulang yang sudah "ngelotok" dikepala.

Sedangkan teman-teman yang baru belajar biasanya cenderung menggunakan AI untuk menyelesaikan sebuah tugas atau *task* yang belum pernah dikerjakan sebelumnya. Sehingga terkadang ketika menerima saran berupa kode dari AI, karena belum bisa membedakan solusi yang tepat dengan solusi "ngawur", bisa saja yang ditambahkan malah kode yang "ngawur" itu. Hasilnya bisa melebar kemana-mana. Mulai dari aplikasi yang *ngebug*, performa aplikasi jadi terganggu, dan akan sulit melakukan *debugging* kode yang diciptakan AI tadi karena pada tahap ini teman-teman belum mengerti benar kode yang diberikan oleh AI.

**Pastikan teman-teman memahami sepenuhnya kode yang disarankan tersebut sebelum menerima solusinya** atau copy-paste ke code editor. Jika kesulitan memahami solusi yang diberikan, tanyakan kembali maksud dari baris kode yang diberikan itu apa. Karena ketika kode sudah masuk kedalam proyek, maka kode buatan AI tadi adalah tanggungjawab kita. Ngga mungkin kan ketika terjadi kesalahan kita menyalahkan AI?!

**Gunakan AI untuk membantu kita berfikir dalam menyelesaikan masalah atau tugas, bukan malah menggantikan kita berfikir**. Ketika ketemu masalah, pahami masalahnya apa sehingga kita bisa memikirkan solusi yang tepat, bukan hanya sekedar menemukan solusi untuk masalah yang kita belum paham benar. Lebih parah lagi, kita juga tidak mengerti solusi yang diberikan AI itu apa dan bagaimana cara kerjanya.

### Tips

Menggunakan AI untuk membangun aplikasi atau mengembangkan fitur, akan lebih efektif dengan menggunakan format dokumen seperti spec, PRD, dll dibandingkan format percakapan atau chat. Hal ini juga sempat dibahas di [artikel yang satu ini](https://danieldelaney.net/chat).

<a id="org8715591"></a>
### Referensi selanjutnya

- [Kumpulan artikel menarik seputar AI dan LLM dalam Bahasa Indonesia](https://dekontaminasi.substack.com)
-  [https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)
-  [https://learn.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agent](https://learn.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agent)

---
title: 🤖 Produktif dengan Asisten Ngoding bagian 3
created: 2025-04-16
modified: 2025-04-16
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: true
---

Nah tahapan berikut ini agak kurang diminati oleh sebagian dari kita: menyusun rencana. Biasanya kita punya tendensi untuk segera membuka kode editor dan segera menulis barisan kode. Padahal memiliki rencana yang jelas adalah hal yang sangat penting. Jika menulis kode tanpa rencana yang jelas akan mengakibatkan kebingungan di tengah jalan. Kadang dengan rencana yang jelas saja hasilnya tidak sesuai, gimana kalau menulis kode tanpa rencana?!

### Menyusun rencana dengan AI

Setelah ide dirasa cukup matang, saatnya merencanakan sebelum melakukan eksekusi rencana tersebut. Sebagai developer kadang kita lupa/malas menyusun rencana. Padahal menyusun rencana akan membuat eksekusi jauh lebih lancar. Untungnya sekarang kita bisa memanfaatkan AI untuk menyusun rencana untuk kita. Gunakan _spec_ dari proses pematangan ide diatas untuk kemudian meminta bantuan AI untuk menyusun rencana.

Untuk kebutuhan ini, disarankan menggunakan model yang mampu berfikir (lebih panjang) seperti chatgpt o1, deepseek deepthink, Qwen Thinking, Gemini Pro 2.5 atau *reasoning model* lainnya.

![DeepSeek Deepthink](/assets/asisten/deepseek-r1.png)

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

*Prompt* diatas menghasilkan rencana eksekusi dan tiap iterasi dilengkapi dengan *prompting* yang sesuai. Nantinya iterasi *prompting* ini akan kita gunakan sebagai perintah bagi AI Code Editor untuk menghasilkan barisan kode. Hasil dari *prompt* diatas bisa disimpan kedalam sebuah file untuk nantinya bisa di copas. Jangan lupa, dibaca perlahan dan lakukan perubahan jika diperlukan. Ingat: AI punya sifat dasar **halusinasi**.

Contoh dokumen yang dihasilkan oleh chatbot dengan fitur _reasoning_ dapat dilihat di tautan berikut: [prompt_plan.md](/assets/asisten/prompt_plan.md)

Setelah rencana dan strategi sudah siap, saatnya eksekusi dan membangun aplikasi.

### Menulis kode dengan AI

Dari rencana yang sudah dikembangkan, kita bisa mulai eksekusi. Bisa langsung dengan menggunakan AI Code Editor seperti vscode+copilot, Cursor atau yang serupa seperti yang sudah dibahas di bagian sebelumnya.

Pengalaman pribadi sejauh ini, jika teknologi yang digunakan butuh integrasi manual, AI akan kesulitan. Contohnya seperti proyek berbasis nodejs dengan backend Express/Hono/Astro ditambah database apapun. AI seringkali mengalami kesulitan dalam melakukan setup awal. Selalu ada saja kesalahan atau *error* yang seharusnya tidak perlu terjadi.

Menggunakan *project boilerplate* yang sudah mengintegrasikan berbagai hal berbeda sepertinya lebih cocok. Atau sekalian menggunakan fullstack framework seperti Elixir Phoenix, Ruby on Rails atau Laravel. AdonisJS mungkin bisa menjadi alternatif, tapi saya pribadi belum mencobanya. Saya punya pengalaman menyenangkan dengan asisten koding ketika menggunakan Elixir Phoenix. Cerita lengkapnya bisa [dicek melalui video berikut](https://youtube.com/live/dk8JSYuOmhc?feature=share).

Ada beberapa alasan yang menyebabkan hal ini (setidaknya menurut saya pribadi). _Scope_ yang terlalu besar untuk ditangani AI hingga kita harus memecah lagi tugas-tugas tersebut menjadi tugas yang lebih kecil.

Kita bisa langsung mulai dari fungsi-fungsi *backend*, atau bisa juga melakukan desain antarmuka terlebih dahulu. Semua tergantung jenis aplikasinya. Untuk contoh tulisan ini kita bisa mulai dari desain antarmuka terlebih dahulu. Hal ini juga membantu AI menyiapkan *project boilerplate* yang didapat dari *AI Interface Builder* seperti Bolt.

### Desain antarmuka

Jika v0 lebih cocok digunakan untuk mendesain komponen, [bolt.new](https://bolt.new/?rid=nzeu0d) dapat kita manfaatkan untuk membangun UI untuk aplikasi frontend. Dari hasil desain frontend ini dapat dilanjutkan untuk mengembangkan backend, menambahkan database dan seterusnya dengan vscode+copilot.

Kita bisa menggunakan sebagian informasi dari `spec.md` yang sudah dibuat sebagai *prompting* untuk [Bolt](https://bolt.new/?rid=nzeu0d) ini.

Berikut contohnya.

```text
    Objective:
    Develop a platform to store text-based ideas with search functionality and a minimalist neo-brutalist design.
    
    Core Features:
    
    Text Note Storage: Users can store plain text notes.
    Search Functionality: Full-text search to locate notes.
    Note Management: Users can edit and delete existing notes. Idea Creation: If no search results match, users can save the entered text as a new idea.
    Design:
    
    Style: Minimalist, neo-brutalist design approach with a focus on functionality.
    Theme: Light theme only.
    Layout: Main page includes a search form with results shown below.
```

![contoh bolt.new](/assets/asisten/bolt.png)

Hasil dari [Bolt](https://bolt.new/?rid=nzeu0d) dapat diunduh lalu dijalankan di localhost dan dibuka dengan AI Code Editor pilihan.

    cd ai-coding-assistant-workshop
    npm install
    npm run dev

### Mengembangka aplikasi

Untuk tulisan ini akan dicontohkan menggunakan vscode+copilot meskipun dapat juga menggunakan editor lain seperti cursor, windsurf dll. Tentu hasilnya akan berbeda. Bisa jadi hasilnya lebih baik, karena sampai tulisan ini dibuat copilot masih sedikit tertinggal dibandingkan Cursor ataupun Windsurf, khususnya fitur *agentic*.

Gunakan *prompt plan* yang sudah didapat dari bagian sebelumnya untuk mulai melakukan iterasi pengembangan aplikasi. Tidak perlu terlalu terpaku kepada prompt yang sudah disediakan, silakan diubah atau diganti jika kurang sesuai.

Karena prompt dibuat oleh AI juga ada kemungkinan keliru, jadi harap diteliti lebih lanjut.

Untuk copilot sendiri, saat ini ada 3 fitur utama:

-   *Code completion* yang akan membantu ketika kita menulis kode.
-   Copilot Chat yang dapat digunakan untuk diskusi dan bertanya dengan antarmuka chat. Contoh: "jelaskan alur kode dari proyek ini".
-   Copilot Edit mampu memodifikasi satu atau beberapa file sesuai dengan menggunakan instruksi yang diberikan.

Jalankan iterasi satu-per-satu. Jika saat menjalankan sebuah iterasi dibutuhkan penyesuaian, lakukan terlebih dahulu sebelum menuju ke iterasi berikutnya.

![img](/assets/asisten/contoh-iterasi.png)

### Mengelola Kode dengan AI

Setelah proses pengembangan fitur sudah (dianggap) selesai, saatnya beralih ke tahap pengelolaan kode. Pada tahap ini, AI juga dapat menjadi _partner_ yang sangat membantu untuk meningkatkan kualitas kode yang telah dibuat.

#### Menambahkan Pengujian Otomatis

Salah satu manfaat penting dari asisten koding berbasis AI adalah kemampuannya untuk membantu membuat pengujian (_testing_). Dengan adanya pengujian yang baik, aplikasi yang kita kembangkan akan lebih tangguh dan minim kesalahan.

Strategi yang efektif saat bekerja dengan AI untuk membuat pengujian adalah dengan menerapkan pendekatan kolaboratif. Buatlah satu kasus uji (*test case*) secara manual terlebih dahulu, kemudian minta AI untuk mengembangkan kasus-kasus uji tambahan berdasarkan contoh tersebut. Pengalaman menunjukkan bahwa jika kita meminta AI membuat pengujian tanpa contoh sama sekali, hasilnya seringkali kurang relevan dengan kode spesifik yang kita miliki.

Pendekatan ini dalam dunia LLM dikenal dengan istilah *few-shot prompting* – teknik di mana kita memberikan satu atau beberapa contoh konkret agar AI dapat "belajar" dari pola tersebut dan menghasilkan konten serupa dengan kualitas yang lebih baik. Untuk penjelasan lebih mendalam tentang teknik ini, [teman-teman dapat membaca artikel ini](https://dekontaminasi.substack.com/p/menyundul-llm-dengan-contoh-nyata). 

![Github Copilot](/assets/asisten/testing.png)

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

![dokumentasi kode](/assets/asisten/jsdoc.png)

Yang menarik, jika AI menghasilkan dokumentasi yang kurang tepat atau terkesan "ngawur", ini bisa menjadi sinyal berharga. Jika asisten AI yang sudah dilatih dengan miliaran baris kode masih kesulitan memahami logika kode kita, kemungkinan besar kode tersebut memang kurang jelas atau terlalu kompleks. Anggap saja ini sebagai peringatan dini bahwa kode kita perlu disederhanakan.

<a id="org7e6516b"></a>
#### Melakukan Refactoring

Saat menulis kode, prioritas utama kita biasanya adalah membuat fitur berfungsi dengan benar. Filosofi "yang penting jalan dulu" sering diterapkan dengan rencana untuk merapikan kode di kemudian hari. Dengan adanya asisten AI, proses "beres-beres" ini bisa menjadi solusi.

Contoh sederhana: saat semua kode terkumpul dalam satu file seperti `App.tsx`, kita dapat meminta AI untuk memecahnya menjadi komponen-komponen terpisah yang lebih terorganisir.

![img](/assets/asisten/refactor.png)

Lebih dari itu, AI juga dapat membantu transformasi kode yang lebih kompleks, seperti:
-   Menerapkan prinsip _Clean Architecture_
-   Memeriksa apakah kode sudah menerapkan prinsip DRY (Don't Repeat Yourself)
-   Mengidentifikasi potensi masalah performa atau keamanan
-   Melakukan migrasi antar teknologi (_rewrite_), misalnya dari JavaScript ke TypeScript, React+Vite ke Astro, atau bahkan transformasi lebih radikal seperti dari Python ke JavaScript atau iOS ke Android

Pengalaman pribadi saya, pernah meminta bantuan desain melalui [Bolt](https://bolt.new/?rid=nzeu0d) dan v0, kemudian mengunduh kodenya sebagai referensi untuk proyek non-JavaScript/TypeScript. Selanjutnya, saya meminta AI untuk menganalisis _styling_ atau desain dari aplikasi tersebut dan menerapkannya ke aplikasi Elixir/Phoenix dengan *prompt* sederhana:

    I have this TypeScript app in /docs/references/v0. I want you to be able to access the TypeScript app, view the code of it inside the project. I don't want to break anything inside the Phoenix app. Then I want you to analyze the styles within that TypeScript app and apply those styles to our Elixir/Phoenix app

Selain membantu pengembangan dan perbaikan kode, AI juga sangat berguna untuk proses *onboarding* anggota tim baru. Saat menghadapi basis kode yang besar dan kompleks, AI dapat membantu menjelaskan struktur, logika, dan keputusan arsitektural yang mendasari proyek tersebut. Ini sangat berharga, terutama saat kita bergabung dengan proyek yang sudah berjalan dan perlu memahami sistem secara menyeluruh sebelum melakukan modifikasi.

<a id="org96e1717"></a>
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
-  https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
-  https://danieldelaney.net/chat
-  https://learn.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agent## Kegiatan ngoding dengan AI

Perkembangan AI sudah sangat maju sampai-sampai sudah bisa diajak menjalankan proses membangun aplikasi dari ide hingga pengelolaan kode! Nah mari kita evaluasi sejauh mana AI bisa membantu kita dalam proses membangun aplikasi dari awal. 

Ketika ingin membangun aplikasi atau membuat sesuatu, umumnya dimulai dari memikirkan ide yang ingin dieksekusi, menyusun rencana, membangun aplikasi dan fitur hingga mengelola kode yang sudah dikembangkan. Kira-kira seperti ilustrasi dibawah.
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

### Diskusi ide dengan AI

Kita bisa memanfaatkan *chatbot* untuk mendiskusikan ide atau memilih ide yang menarik atau istilahnya *brainstorming*. Ketika ide sudah didapat, kita dapat kembali menggunakan *chatbot* untuk mematangkan ide kita.

Gunakan AI chatbot dengan prompt dibawah untuk mematangkan ide (misalnya menggunakan chatgp.com, claude.ai):

    Ask me one question at a time so we can develop a thorough,
    step-by-step spec for this idea. Each question should build on
    my previous answers, and our end goal is to have a detailed
    specification I can hand off to a developer. Let’s do this
    iteratively and dig into every relevant detail.
    Remember, only one question at a time.
    
    Here’s the idea:

Contoh ide:

    I want to develop a platform to store my ideas in one place.

![chatbot claude.ai](/assets/asisten/claude.png)

Setelah berdiskusi dengan AI Chatbot, hasil diskusi dikemas dalam format spesifikasi aplikasi atau spec.

    Now that we’ve wrapped up the brainstorming process,
    can you compile our findings into a comprehensive,
    developer-ready specification? Include all relevant
    requirements, architecture choices, data handling details,
    error handling strategies, and a testing plan so
    a developer can immediately begin implementation.

Hasilnya bisa disimpan ke dalam dokumen teks seperti `spec.md` misalnya. Berikut contoh spesifikasi yang dihasilkan oleh ChatGPT.

    # Idea Storage Web App Specification
    
    ## Project Overview
    A web application designed to capture and retrieve user-generated ideas using a clean and efficient user interface, built with a mobile-first, minimalist, neo-brutalist design approach.
    
    ## Tech Stack
    - **TypeScript:** Static typing for enhanced code reliability and maintainability.
    - **React:** Component-based library for building a responsive front-end.
    - **Vite:** For fast development and deployment environments.
    - **LocalStorage:** Client-side storage for persisting user data.
    - **Tailwind CSS:** Utility-first CSS framework to implement styling.
    
    ## Features and Requirements
    
    ### User Interface
    1. **Main Page Components:**
    - **Idea Input Form:** Simple text input with a submit button.
    - [ ] Text input field with a placeholder, e.g., "Enter your idea here..."
    - [ ] Submit button to save ideas.
    - **Search Functionality:**
    - [ ] Real-time search that filters ideas based on content as the user types.
    - **Idea Display Area:**
    - [ ] Ideas presented as cards beneath the input form.
    - [ ] Static display; no edit or delete options.
    
    2. **Design Guidelines:**
    - Mobile-first, responsive layout.
    - Light-themed neo-brutalist design using Tailwind CSS.
    - Minimalist style with intuitive UI components.
    
    ### Architecture
    - **Components:**
    - `MainPage.tsx`: Houses the form, search bar, and idea list.
    - `IdeaCard.tsx`: Renders each idea in card format.
    - **State Management:**
    - Use React hooks (`useState`, `useEffect`) for managing local state and effects.
    
    ### Data Handling
    - **localStorage:**
    - Store and retrieve ideas as plain text strings within `localStorage`.
    - Maintain a key-value structure for easy access and retrieval (e.g., `ideas` key for storing serialized array of ideas).
    - **Custom Hook:**
    - `useLocalIdeasStorage`: Handles reading from and writing to `localStorage`.
    
    ### Error Handling
    - Graceful Handling:
    - **Input Errors:** Prevent submission of empty ideas via form validation.
    - **Storage Errors:** Handle any potential storage issues with fallbacks and user notifications if localStorage is unavailable or unsupported.
    
    ### Testing Plan
    - **Unit Testing:**
    - Test components in isolation using a library like Jest and React Testing Library, ensuring correct rendering and functionality.
    - **Integration Testing:**
    - Validate that components work seamlessly together, particularly form input, search functionality, and data storage.
    - **UI/UX Testing:**
    - Ensure responsive and consistent behavior across devices and screen sizes.
    - Verify compliance of the UI with design specifications.
    - **User Testing:**
    - Conduct tests for edge cases, such as large input sizes and rapid successive inputs, to ensure reliability.
    
    ## Deployment
    - Use a platform like Netlify or Vercel for easy and continuous deployment.
    - Ensure configurations support responsive design and asset optimization.

<a id="org24bbecc"></a>
### Menyusun rencana dengan AI

Setelah ide dirasa cukup matang, saatnya merencanakan sebelum melakukan eksekusi rencana tersebut. Kita bisa menggunakan _spec_ dari proses pematangan ide diatas untuk kemudian meminta bantuan AI untuk membuat rencana.

Untuk kebutuhan menyusun rencana, sebaiknya menggunakan model yang mampu berfikir (lebih panjang) seperti chatgpt o1, deepseek deepthink, atau Qwen Thinking.

![DeepSeek Deepthink](/assets/asisten/deepseek-r1.png)

```
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

*Prompt* diatas menghasilkan rencana eksekusi dan tiap iterasi dilengkapi dengan prompting yang sesuai yang nantinya akan kita gunakan sebagai perintah di AI Code Editor. Hasil dari *prompt* diatas bisa disimpan kedalam sebuah file untuk nantinya digunakan. Jangan lupa, dibaca perlahan dan lakukan perubahan jika diperlukan. Ingat: AI punya sifat dasar **halusinasi**.

Berikut contoh dokumen yang dihasilkan oleh AI Chatbot dengan fitur _reasoning_. Contoh dibawah ini menggunakan ChatGPT.

```

  ## **Creating Prompts for Code-Generation LLM**
    
    Below are the prompts for each step, formatted with code tags using Markdown. Each prompt builds upon the previous steps and ensures all code is integrated.
    
    ---
    
    ### **Prompt for Step 2: Initialize the Project**
    
    ```text
    Please create a new Vite project using React and TypeScript. Open a terminal and run `npm create vite@latest`. When prompted, name the project "idea-storage-app" and select the React and TypeScript template. Navigate into the project directory and install dependencies with `npm install`. Initialize a Git repository with `git init`, add all files with `git add .`, and make the initial commit with the message "Initial commit".
    \```
    
    ---
    
    ### **Prompt for Step 3: Set Up Tailwind CSS**
    
    ```text
    In the "idea-storage-app" project, set up Tailwind CSS. Install Tailwind CSS and its dependencies by running `npm install -D tailwindcss postcss autoprefixer`. Initialize Tailwind by running `npx tailwindcss init -p`. In `tailwind.config.js`, set the `content` array to `["./index.html", "./src/**/*.{ts,tsx}"]`. In the `src` directory, create a new `index.css` file if it doesn't exist, and add the Tailwind directives:
    
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    \```
    
    Ensure that `index.css` is imported in your main application file.
    
    \```
    
    ---
    
    ### **Prompt for Step 4: Build the Basic Application Structure**
    
    ```text
    In the project, remove unnecessary files from the Vite template, such as default logos and styles. Create a `components` directory inside `src`. Within `components`, create two new files: `MainPage.tsx` and `IdeaCard.tsx`. Update `App.tsx` to import and render the `MainPage` component. Ensure that the application runs without errors by starting the development server with `npm run dev`.
    \```
    
    ---
    
    ### **Prompt for Step 5: Implement the Idea Input Form**
    
    ```text
    In `MainPage.tsx`, implement an idea input form. Inside the `MainPage` component, add a `<form>` element containing:
    
    - A text `<input>` field with the placeholder "Enter your idea here..." and appropriate Tailwind CSS classes for styling.
    - A submit `<button>` labeled "Add Idea", also styled with Tailwind CSS.
    
    Use React's `useState` hook to manage the state of the input field. Implement a `handleSubmit` function that:
    
    - Prevents the default form submission behavior.
    - Adds the new idea to a list of ideas.
    - Clears the input field after submission.
    
    Ensure the form calls `handleSubmit` on submission.
    \```
    
    ---
    
    ### **Prompt for Step 6: Implement LocalStorage Functionality**
    
    ```text
    Create a custom hook named `useLocalIdeasStorage` in a new `hooks` directory inside `src`. This hook should:
    
    - Use `useState` to manage the list of ideas.
    - On initialization, load any existing ideas from `localStorage` and set them in state.
    - Provide a function `addIdea` to add a new idea to the list and save it to `localStorage`.
    - Use `useEffect` to update `localStorage` whenever the list of ideas changes.
    
    In `App.tsx`, replace the local state management for ideas with this custom hook. Update `handleSubmit` to use `addIdea` from the hook to add new ideas.
    \```
    
    ---
    
    ### **Prompt for Step 7: Implement the Idea Display Area**
    
    ```text
    In `MainPage.tsx`, after the idea input form, display the list of ideas. Map over the list of ideas obtained from `useLocalIdeasStorage` and render an `IdeaCard` for each. Pass the idea text as a prop to `IdeaCard`.
    
    In `IdeaCard.tsx`, accept the idea text as a prop and display it within a styled card. Use Tailwind CSS classes to style the card with a neo-brutalist design, incorporating elements like bold borders, high-contrast colors, and simple typography. Ensure that the idea cards appear beneath the input form and are visually separated.
    \```
    
    ---
    
    ### **Prompt for Step 8: Implement Real-Time Search Functionality**
    
    ```text
    In `MainPage.tsx`, add a search `<input>` field above the list of ideas with the placeholder "Search ideas..." and style it appropriately with Tailwind CSS. Use `useState` to manage the search term state. Implement a function that filters the list of ideas based on the search term, updating the displayed ideas in real-time as the user types.
    
    Ensure that the filtering is case-insensitive and matches any part of the idea text. When the search field is empty, all ideas should be displayed. Test the search functionality to confirm it works smoothly without performance issues.
    \```
    
    ---
    
    ### **Prompt for Step 9: Apply Neo-Brutalist Styling**
    
    ```text
    Apply neo-brutalist styling to the entire application using Tailwind CSS, ensuring a minimalist, light theme. In particular:
    
    - **Input Fields and Buttons:**
    - Use simple, solid colors with high contrast.
    - Apply thick borders and sharp edges (no border-radius).
    - Use bold, sans-serif fonts for text.
    - **Idea Cards:**
    - Maintain a consistent card size.
    - Use minimal decoration—focus on content.
    - Implement hover effects that align with neo-brutalist aesthetics.
    - **Layout:**
    - Ensure elements are aligned and spaced consistently.
    - Design with a mobile-first approach, making sure the app looks good on small screens.
    - Use responsive utility classes in Tailwind CSS to adjust styles for larger screens.
    
    Review and adjust the styles as necessary to maintain visual consistency and adhere to neo-brutalist principles.
    \```
    
    ---
    
    ### **Prompt for Step 10: Testing and Deployment Preparation**
    
    ```text
    Perform thorough testing of the application:
    
    - **Functionality Testing:**
    - Test adding ideas, ensuring they appear in the list and are saved to `localStorage`.
    - Test the search functionality with various input cases.
    - Verify that ideas persist after refreshing the page.
    - **Responsive Design Testing:**
    - Use browser developer tools to test the app on different screen sizes.
    - Ensure that the layout adapts correctly on mobile, tablet, and desktop views.
    - **Cross-Browser Testing:**
    - Check compatibility with modern browsers like Chrome, Firefox, Safari, and Edge.
    
    Fix any issues discovered during testing. Once satisfied, prepare the app for deployment:
    
    - Build the production version of the app using `npm run build`.
    - Choose a deployment platform like Netlify or Vercel.
    - Follow the platform's instructions to deploy the app, ensuring that all environment configurations are correctly set.
    - Test the deployed app to confirm it works as expected in the live environment.
    \```
```

Setelah rencana dan strategi sudah siap, saatnya eksekusi dan membangun aplikasi.

<a id="orgea942d0"></a>
### Menulis kode dengan AI

Dari rencana yang sudah dikembangkan, kita bisa mulai eksekusi. Bisa langsung dengan menggunakan AI Code Editor seperti vscode+copilot, Cursor atau yang serupa.

Pengalaman pribadi sejauh ini, jika teknologi yang digunakan butuh integrasi manual, AI akan kesulitan. Contohnya seperti proyek berbasis nodejs dengan backend Express/Hono/Astro ditambah database apapun. AI seringkali mengalami kesulitan dalam melakukan setup awal. Selalu ada saja kesalahan atau *error* yang seharusnya tidak perlu terjadi.

Menggunakan *project boilerplate* yang sudah mengintegrasikan berbagai hal berbeda sepertinya lebih cocok. Atau sekalian menggunakan fullstack framework seperti Elixir Phoenix, Ruby on Rails atau Laravel. Adonis bisa menjadi alternatif, tapi saya pribadi belum mencobanya.

Ada beberapa alasan yang menyebabkan hal ini (setidaknya menurut saya pribadi). _Scope_ yang terlalu besar untuk ditangani AI hingga kita harus memecah lagi tugas-tugas tersebut menjadi tugas yang lebih kecil.
<a id="orgd4dd3e7"></a>
### Desain antarmuka

Jika v0 lebih cocok digunakan untuk mendesain komponen, [bolt.new](https://bolt.new/?rid=nzeu0d) dapat kita manfaatkan untuk membangun UI untuk aplikasi frontend. Dari hasil desain frontend ini dapat dilanjutkan untuk mengembangkan backend, menambahkan database dan seterusnya dengan vscode+copilot.

Kita bisa menggunakan informasi di `spec.md` yang sudah dibuat sebagai *prompting* untuk [Bolt](https://bolt.new/?rid=nzeu0d) ini.

Berikut contohnya.

    Objective:
    Develop a platform to store text-based ideas with search functionality and a minimalist neo-brutalist design.
    
    Requirements:
    
    Core Features:
    
    Text Note Storage: Users can store plain text notes.
    Search Functionality: Full-text search to locate notes.
    Note Management: Users can edit and delete existing notes. Idea Creation: If no search results match, users can save the entered text as a new idea.
    Design:
    
    Style: Minimalist, neo-brutalist design approach with a focus on functionality.
    Theme: Light theme only.
    Layout: Main page includes a search form with results shown below.

![contoh bolt.new](/assets/asisten/bolt.png)

Hasil dari [Bolt](https://bolt.new/?rid=nzeu0d) dapat diunduh lalu dijalankan di localhost dan dibuka dengan AI Code Editor pilihan.

    cd ai-coding-assistant-workshop
    npm install
    npm run dev

<a id="orgfc563c5"></a>
### Mengembangka aplikasi

Untuk tulisan ini akan dicontohkan menggunakan vscode+copilot meskipun dapat juga menggunakan editor lain seperti cursor, windsurf dll. Tentu hasilnya akan berbeda. Bisa jadi hasilnya lebih baik, karena sampai tulisan ini dibuat copilot masih sedikit tertinggal dibandingkan Cursor ataupun Windsurf.

Gunakan *prompt plan* yang sudah didapat dari bagian sebelumnya untuk mulai melakukan iterasi pengembangan aplikasi. Tidak perlu terlalu terpaku kepada prompt yang sudah disediakan, silakan diubah atau diganti jika kurang sesuai.

Karena prompt dibuat oleh AI juga ada kemungkinan keliru, jadi harap diteliti lebih lanjut.

Untuk copilot sendiri, saat ini ada 3 fitur utama:

-   *Code completion* yang akan membantu ketika kita menulis kode
-   Copilot Chat yang dapat digunakan untuk diskusi dan bertanya dengan antarmuka chat. Contoh: "jelaskan alur kode dari proyek ini".
-   Copilot Edit mampu memodifikasi satu atau beberapa file sesuai dengan menggunakan instruksi yang diberikan.

Jalankan iterasi satu-per-satu. Jika saat menjalankan sebuah iterasi dibutuhkan penyesuaian, lakukan terlebih dahulu sebelum menuju ke iterasi berikutnya.

![img](/assets/asisten/contoh-iterasi.png)

<a id="orge5570be"></a>
### Mengelola Kode dengan AI

Setelah proses pengembangan fitur sudah (dianggap) selesai, saatnya beralih ke tahap pengelolaan kode. Pada tahap ini, AI juga dapat menjadi _partner_ yang sangat membantu untuk meningkatkan kualitas kode yang telah dibuat.

<a id="org764c952"></a>
#### Menambahkan Pengujian Otomatis

Salah satu manfaat penting dari asisten koding berbasis AI adalah kemampuannya untuk membantu membuat pengujian (_testing_). Dengan adanya pengujian yang baik, aplikasi yang kita kembangkan akan lebih tangguh dan minim kesalahan.

Strategi yang efektif saat bekerja dengan AI untuk membuat pengujian adalah dengan menerapkan pendekatan kolaboratif. Buatlah satu kasus uji (*test case*) secara manual terlebih dahulu, kemudian minta AI untuk mengembangkan kasus-kasus uji tambahan berdasarkan contoh tersebut. Pengalaman menunjukkan bahwa jika kita meminta AI membuat pengujian tanpa contoh sama sekali, hasilnya seringkali kurang relevan dengan kode spesifik yang kita miliki.

Pendekatan ini dalam dunia LLM dikenal dengan istilah *few-shot prompting* – teknik di mana kita memberikan satu atau beberapa contoh konkret agar AI dapat "belajar" dari pola tersebut dan menghasilkan konten serupa dengan kualitas yang lebih baik. Untuk penjelasan lebih mendalam tentang teknik ini, [teman-teman dapat membaca artikel ini](https://dekontaminasi.substack.com/p/menyundul-llm-dengan-contoh-nyata). 

![Github Copilot](/assets/asisten/testing.png)

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

![dokumentasi kode](/assets/asisten/jsdoc.png)

Yang menarik, jika AI menghasilkan dokumentasi yang kurang tepat atau terkesan "ngawur", ini bisa menjadi sinyal berharga. Jika asisten AI yang sudah dilatih dengan miliaran baris kode masih kesulitan memahami logika kode kita, kemungkinan besar kode tersebut memang kurang jelas atau terlalu kompleks. Anggap saja ini sebagai peringatan dini bahwa kode kita perlu disederhanakan.

<a id="org7e6516b"></a>
#### Melakukan Refactoring

Saat menulis kode, prioritas utama kita biasanya adalah membuat fitur berfungsi dengan benar. Filosofi "yang penting jalan dulu" sering diterapkan dengan rencana untuk merapikan kode di kemudian hari. Dengan adanya asisten AI, proses "beres-beres" ini bisa menjadi solusi.

Contoh sederhana: saat semua kode terkumpul dalam satu file seperti `App.tsx`, kita dapat meminta AI untuk memecahnya menjadi komponen-komponen terpisah yang lebih terorganisir.

![img](/assets/asisten/refactor.png)

Lebih dari itu, AI juga dapat membantu transformasi kode yang lebih kompleks, seperti:
-   Menerapkan prinsip _Clean Architecture_
-   Memeriksa apakah kode sudah menerapkan prinsip DRY (Don't Repeat Yourself)
-   Mengidentifikasi potensi masalah performa atau keamanan
-   Melakukan migrasi antar teknologi (_rewrite_), misalnya dari JavaScript ke TypeScript, React+Vite ke Astro, atau bahkan transformasi lebih radikal seperti dari Python ke JavaScript atau iOS ke Android

Pengalaman pribadi saya, pernah meminta bantuan desain melalui [Bolt](https://bolt.new/?rid=nzeu0d) dan v0, kemudian mengunduh kodenya sebagai referensi untuk proyek non-JavaScript/TypeScript. Selanjutnya, saya meminta AI untuk menganalisis _styling_ atau desain dari aplikasi tersebut dan menerapkannya ke aplikasi Elixir/Phoenix dengan *prompt* sederhana:

```text
I have this TypeScript app in /docs/references/v0. I want you to be able to access the TypeScript app, view the code of it inside the project. I don't want to break anything inside the Phoenix app. Then I want you to analyze the styles within that TypeScript app and apply those styles to our Elixir/Phoenix app
```

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
-  https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
-  https://danieldelaney.net/chat
-  https://learn.deeplearning.ai/courses/build-apps-with-windsurfs-ai-coding-agent


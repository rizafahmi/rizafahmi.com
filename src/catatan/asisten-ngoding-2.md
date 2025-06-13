---
title: Diskusi dan Menulis Spesifikasi dengan AI
modified: 2025-06-13
created: 2025-04-11
layout: tulisan
tags:
  - catatan
eleventyExcludeFromCollections: false
---

--- 
**Seri Asisten Ngoding**
1. [Produktif dengan Asisten Ngoding](/catatan/asisten-ngoding)
2. Diskusi dan Menulis Spesifikasi dengan AI [Artikel saat ini]
3. [Menyusun Rencana dengan Asisten Ngoding](/catatan/asisten-ngoding-3) 
4. [Desain Antarmuka dengan Asisten Ngoding](/catatan/asisten-ngoding-4)
---

Setelah di [bagian sebelumnya](/catatan/asisten-ngoding) kita sudah melihat berbagai jenis AI yang dapat digunakan untuk membangun aplikasi—seperti AI Chatbot, AI Code Completion, AI Code Editor, dan AI Interface Builder—tulisan berikut akan mengajak teman-teman semua melakukan eksplorasi dan melihat sejauh mana AI dapat "diajak" untuk membangun aplikasi.


## Kegiatan ngoding dengan AI

Ketika ingin membangun aplikasi atau membuat sesuatu, umumnya dimulai dari memikirkan ide yang ingin dieksekusi, menyusun rencana, membangun aplikasi dan fitur hingga mengelola basis kode yang sudah dikembangkan.


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

Kita akan fokus pada tahap pertama yaitu diskusi ide dan pembuatan spesifikasi dengan bantuan AI. Tahapan berikutnya akan dibahas di artikel selanjutnya ✌🏼

### Diskusi ide dengan AI

Kita bisa memanfaatkan *chatbot* untuk mendiskusikan ide atau memilih ide yang menarik—atau dalam istilah asing disebut *brainstorming*. Ketika ide sudah didapat, kita dapat kembali menggunakan chatbot untuk mematangkan ide tersebut.

Berikut contoh *prompt* yang efektif untuk mematangkan ide dengan chatbot seperti ChatGPT, Claude, atau lainnya:

```text
    Ask me one question at a time so we can develop a thorough,
    step-by-step spec for this idea. Each question should build on
    my previous answers, and our end goal is to have a detailed
    specification I can hand off to a developer. Let’s do this
    iteratively and dig into every relevant detail.
    Remember, only one question at a time.
    
    Here’s the idea:
```

Prompt ini efektif karena meminta AI untuk melakukan pendekatan terstruktur dengan pertanyaan bertahap, sehingga membantu kita mengeksplorasi dan memperjelas ide secara mendalam.
Lanjutkan dengan melemparkan ide yang ingin didiskusikan, misalnya:

```text
    I want to develop a platform to store my ideas in one place.
```

![chatbot claude.ai](/assets/asisten/claude.png)

Setelah melakukan diskusi yang mendalam dengan *chatbot*, hasil diskusi kemudian perlu dikemas dalam format spesifikasi aplikasi atau "spec" agar dapat didelegasikan kepada developer atau—dalam konteks artikel ini—digunakan sebagai panduan untuk langkah berikutnya dengan meminta bantuan dari asisten koding.

Untuk mengubah hasil diskusi menjadi dokumen spesifikasi yang lengkap, gunakan prompt seperti ini:

```text
    Now that we’ve wrapped up the brainstorming process,
    can you compile our findings into a comprehensive,
    developer-ready specification? Include all relevant
    requirements, architecture choices, data handling details,
    error handling strategies, and a testing plan so
    a developer can immediately begin implementation.
```

Hasilnya bisa disimpan ke dalam dokumen teks atau markdown seperti `spec.md` misalnya. Berikut contoh spesifikasi yang dihasilkan oleh ChatGPT.

```text
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
```


## Kesimpulan

Artikel kali ini membahas penggunaan AI sebagai asisten dalam proses pengembangan aplikasi, dengan fokus pada tahap awal: diskusi ide dan pembuatan spesifikasi. Kita telah melihat bagaimana chatbot seperti ChatGPT atau Claude dapat berperan sebagai rekan diskusi yang efektif untuk melakukan brainstorming dan mematangkan ide aplikasi.

Selanjutnya kita fokus pada tahap pertama, yaitu diskusi ide dengan AI beserta contoh konkret bagaimana memanfaatkan *chatbot* seperti ChatGPT atau Claude untuk melakukan *brainstorming* dan mematangkan ide aplikasi hingga menghasilkan dokumen spesifikasi yang mencakup gambaran umum proyek, teknologi yang digunakan, fitur yang dibutuhkan, arsitektur aplikasi, penanganan data, strategi penanganan kesalahan, dan rencana pengujian—siap untuk diimplementasikan oleh pengembang atau digunakan sebagai panduan untuk langkah berikutnya dengan asisten koding.

Kita akan membahas bagaimana AI dapat membantu dalam penyusunan rencana pengembangan, eksekusi kode, dan pengelolaan basis kode di artikel berikutnya. Umpan balik sangat berharga bagi saya sebagai pertanda apakah topik ini menarik atau tidak. Silakan tulis pendapat atau saran di kolom komentar di bawah.

Catatan tambahan, semua contoh *prompt* saya catut dari [artikel super keren dari Pak Harper Reed](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/).



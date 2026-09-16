// Satu sumber untuk halaman panduan dan unduhan Markdown. Ubah prompt di sini.
const stages = [
  {
    id: "rencana",
    number: "01",
    title: "Rencana",
    description:
      "Mulai dari masalah kecil yang bisa kamu jelaskan. Tentukan siapa yang dibantu dan kapan versi pertamanya selesai.",
    steps: [
      {
        id: "ide",
        title: "Temukan ide sederhana",
        tool: "ChatGPT · percakapan baru",
        input: "Satu masalah yang pernah kamu atau orang di sekitarmu alami.",
        prompt: `Understand the problem, then generate three app ideas from it. For each idea, include a name, a concept summary, core features, who it helps, and one hypothesis to check with real people before treating demand as proven. Mark each idea as untested. Write for a solo founder.

Here's the idea: [IDE_APLIKASI]`,
        example: {
          IDE_APLIKASI:
            "A QR code generator for a presenter who needs to share a URL on a slide or a web page.",
        },
        output: "Tiga pilihan ide dengan pengguna dan manfaat yang jelas.",
        check:
          "Kamu bisa menjelaskan satu ide dalam satu kalimat. Ada masalah nyata yang bisa ditanyakan ke calon pengguna.",
        next: "Pilih satu ide untuk prompt 02. Simpan percakapan ini sampai tahap Desain selesai.",
      },
      {
        id: "scope",
        title: "Potong jadi versi pertama",
        tool: "ChatGPT · lanjutkan percakapan tadi",
        input: "Satu ide pilihan dari prompt 01.",
        prompt: `I choose this idea from our previous discussion: [IDE]. Help me narrow the first version to one useful end-to-end user journey.

Describe the target user, their problem, the steps from opening the page to getting a result, at most three essential features, and the features to postpone.
Use HTML, CSS, and JavaScript that run in the browser. Do not add accounts, a database, a back end, or payments.
Give me five acceptance criteria that I can check myself in a browser. Explain technical terms in plain language.
If this idea needs a server or secret data, explain why and suggest a smaller first version.`,
        example: {
          IDE: "SlideQR: a presenter enters a URL, sees a high-contrast QR code that is easy to scan, and downloads a PNG for a presentation slide",
        },
        output: "Batas fitur dan lima kriteria selesai.",
        check:
          "Kriteria selesai bisa diamati, misalnya tombol Unduh benar-benar menghasilkan file. Hapus fitur yang tidak mendukung alur utama.",
        next: "Koreksi daftar ini sampai masuk akal, lalu gunakan sebagai dasar brief di prompt 03.",
      },
      {
        id: "brief",
        title: "Tulis brief project",
        tool: "ChatGPT · percakapan yang sama",
        input: "Ide dan batas fitur yang sudah kamu setujui.",
        prompt: `Turn the decisions we agreed on into the full content of PROJECT.md for [PROJECT NAME], the project brief that my coding agent will read.

Include these sections: goal, target user, main user journey, essential features, out of scope, technology, and a checklist of acceptance criteria.
Cover the initial state, invalid input, successful result, and mobile layout.
Use HTML, CSS, and JavaScript in the browser so the finished files can be hosted as a static website. If you propose a library, explain its purpose and how its required assets will be included in the project.
Do not invent decisions we have not made. List unresolved points as questions.
Return the complete Markdown in one code block so I can save it. Do not implement the app yet.`,
        example: { "PROJECT NAME": "SlideQR" },
        output: "Isi PROJECT.md, yaitu brief project yang bisa dibaca manusia dan AI.",
        check:
          "Baca setiap kriteria selesai. Jawab pertanyaan yang masih terbuka sebelum melanjutkan.",
        next: "Simpan isi brief. Setelah Desain, bawa versi terakhir ke Codex. Jangan hanya menyalin nama project.",
      },
    ],
  },
  {
    id: "desain",
    number: "02",
    title: "Desain",
    description:
      "Gambarkan apa yang akan dilihat dan dilakukan pengguna sebelum meminta AI menulis kode.",
    steps: [
      {
        id: "alur",
        title: "Susun satu layar yang jelas",
        tool: "ChatGPT · percakapan yang sama",
        input: "Brief dari prompt 03. Jika pindah percakapan, tempel isi brief terlebih dahulu.",
        prompt: `Using the PROJECT.md we agreed on, design a single page for [PROJECT NAME].
List the sections from top to bottom, including the heading text, input labels, primary button, result area, and error messages.
Describe the journey from the initial state to entering information, then either a successful result or a clear error.
Make the same journey usable on a phone. Give every input a visible label, not placeholder text alone.
Present the design in plain text. Do not add features or write code yet.`,
        example: { "PROJECT NAME": "SlideQR" },
        output: "Urutan isi halaman dan perilaku tiap keadaan.",
        check:
          "Kamu tahu apa yang harus dilakukan saat pertama membuka halaman, dan apa yang terjadi jika input salah.",
        next: "Pilih atau koreksi susunan layar, lalu tentukan tampilannya di prompt 05.",
      },
      {
        id: "tampilan",
        title: "Tentukan arah tampilan",
        tool: "ChatGPT · percakapan yang sama",
        input: "Rancangan layar dan suasana visual yang kamu inginkan.",
        prompt: `The visual direction I want is: [VISUAL DIRECTION].
Turn that into a short design guide covering colors, text sizes and hierarchy, spacing, button appearance, and mobile layout.
Prioritize readable text, sufficient contrast, visible keyboard focus, and one clear primary action.
Add the page design and visual guide to PROJECT.md without changing the agreed feature scope.
Return the complete updated PROJECT.md in one Markdown code block, not only the changed sections.`,
        example: {
          "VISUAL DIRECTION":
            "SlideQR should feel like a clean presentation tool: white background, dark text, blue primary button, a black-and-white QR code with quiet space around it, and no decoration that interferes with scanning",
        },
        output: "Brief lengkap berisi kebutuhan, alur, dan arah visual.",
        check:
          "Brief masih memuat kriteria selesai dan fitur yang ditunda. QR contoh tetap memiliki kontras tinggi.",
        next: "Buka folder project di Codex. Minta Codex menyimpan isi brief ini sebagai PROJECT.md sebelum memakai prompt 06.",
      },
    ],
  },
  {
    id: "implementasi",
    number: "03",
    title: "Implementasi",
    description:
      "Bangun satu alur yang bisa dicoba. Lihat hasilnya di browser sebelum meminta perubahan berikutnya.",
    steps: [
      {
        id: "bangun",
        title: "Bangun versi pertama",
        tool: "Codex · folder project milikmu",
        input: "PROJECT.md versi terakhir tersimpan di folder project yang dipilih di Codex.",
        prompt: `Read PROJECT.md in this folder. I am a nontechnical beginner. Explain each action in plain English.
Build the first version of [PROJECT NAME] from the brief using HTML, CSS, and JavaScript. Implement only the essential features and one main user journey.
If a decision blocks implementation, ask a short question. Do not add accounts, a database, payments, or other services.
Save every file needed for static hosting. If a library already provides the algorithm, use it. Do not write that algorithm yourself. Explain any dependency you choose.
Run the available checks. Tell me what was and was not tested, which files you created, and how to open a local preview in my browser, including the command and address if needed.
Do not deploy yet.`,
        example: { "PROJECT NAME": "SlideQR" },
        output: "File aplikasi dan petunjuk membuka preview lokal.",
        check:
          "Buka alamat preview yang diberikan. Untuk SlideQR: masukkan URL, buat QR, unduh PNG, lalu pindai dengan ponsel.",
        next: "Catat satu hal yang perlu diubah untuk prompt 07. Jika aplikasi tidak berjalan, langsung gunakan prompt 09.",
      },
      {
        id: "ubah",
        title: "Ubah satu hal saja",
        tool: "Codex · project yang sama",
        input: "Hasil percobaanmu: keadaan sekarang dan keadaan yang diinginkan.",
        prompt: `I tried the app. Here is the change I need: [CHANGE].
Inspect the related code and make the smallest change that meets this need. Preserve the other working features and the scope in PROJECT.md.
If this expands the scope, explain that before making the change.
Then run relevant checks and give me steps to verify both the change and the main user journey. State clearly what you could not verify.`,
        example: {
          CHANGE:
            "In SlideQR, when the URL field is empty and I press Generate QR, show 'Enter a URL first' beside the field. Right now there is no clear message",
        },
        output: "Satu perubahan yang bisa dibandingkan sebelum dan sesudahnya.",
        check:
          "Coba keadaan yang kamu laporkan dan ulangi alur normal. Keduanya harus tetap bekerja.",
        next: "Saat alur utama sudah bekerja, lanjutkan checklist pengujian di prompt 08.",
      },
    ],
  },
  {
    id: "testing",
    number: "04",
    title: "Testing",
    description: "Coba sendiri dan catat hasil yang benar-benar kamu lihat.",
    steps: [
      {
        id: "uji",
        title: "Periksa alur utama",
        tool: "Codex + browser",
        input: "Aplikasi lokal yang berjalan dan PROJECT.md.",
        prompt: `Read PROJECT.md and the current app. Create a test checklist with columns for action, expected result, and an empty actual result.
Cover the main user journey, empty input, invalid input, repeated use, phone layout, and navigation with the Tab key.
Add this project-specific check: [PROJECT-SPECIFIC CHECK].
Run the available automated tests and report their actual results. Separate passed automated checks from manual checks that have not been done.
Do not mark a manual check as passed without trying it. Do not change code in this step.`,
        example: {
          "PROJECT-SPECIFIC CHECK":
            "In SlideQR, the PNG must download, and scanning the QR in that PNG with a phone must open the correct URL, including a URL with query parameters. When the URL changes, the QR and downloaded PNG must update too",
        },
        output: "Checklist dengan tindakan dan hasil yang diharapkan.",
        check:
          "Isi hasil aktual setelah mencoba. Untuk QR, pindai file unduhan. Jangan hanya menilai gambar di layar.",
        next: "Jika ada kegagalan, gunakan prompt 09. Jika semua kriteria utama lulus, siapkan hosting untuk prompt 10.",
      },
      {
        id: "debug",
        title: "Perbaiki dengan bukti",
        tool: "Codex · project yang sama",
        input:
          "Langkah kejadian, hasil yang diharapkan, dan yang benar-benar terjadi. Hapus data sensitif dari pesan error.",
        prompt: `There is a problem with the app.
Steps to reproduce it: [STEPS].
What I expected: [EXPECTED RESULT].
What actually happened: [ACTUAL RESULT].

Investigate the cause using the code and this evidence. If it is not enough, ask for the single most useful piece of information. Do not guess or change many things at once.
Reproduce the issue if possible, make the smallest fix, then repeat the failing steps and check the main user journey.
Report the cause, the change, and the verification result. If you could not test it, say so clearly.`,
        example: {
          STEPS:
            "Open SlideQR, make a QR for https://example.com, change the input to https://example.org, make another QR, then download the PNG",
          "EXPECTED RESULT": "The final PNG opens https://example.org",
          "ACTUAL RESULT":
            "Scanning the PNG still opens https://example.com. Replace this placeholder with what you observe",
        },
        output: "Perbaikan terarah dan penjelasan hasil pengujian.",
        check:
          "Ulangi langkah yang sebelumnya gagal. Pastikan AI tidak menyebut lulus untuk pengujian yang tidak dijalankan.",
        next: "Ulangi prompt 08 setelah perbaikan. Simpan salinan versi yang bekerja sebelum deploy.",
      },
    ],
  },
  {
    id: "deploy",
    number: "05",
    title: "Deploy",
    description:
      "Pindahkan versi yang sudah diuji ke hosting, lalu periksa kembali dari alamat publiknya.",
    steps: [
      {
        id: "koneksi",
        title: "Periksa koneksi dan tujuan",
        tool: "Codex · MCP DomaiNesia sudah terhubung",
        input:
          "Hosting aktif dan koneksi MCP dari panduan DomaiNesia. Pilih domain atau subdomain yang kamu kelola.",
        prompt: `Use the domainesia-hosting connection to check whether [PROJECT NAME] is ready to deploy.
Treat the step as read-only. Do not upload, change, or delete files.
Check whether the connection is active, which domains or subdomains are available, and each website's destination folder (document root).
Check whether the destination contains an existing website or files, and whether the hosting supports this static app.
Show me the possible destinations and the risk of overwriting files, then wait for me to choose the exact domain and folder.
Do not display passwords or tokens. If the connection is unavailable, explain what I need to set up. Do not claim that you connected.`,
        example: { "PROJECT NAME": "SlideQR" },
        output:
          "Domain dan folder tujuan yang benar-benar ditemukan, beserta keadaan file di sana.",
        check:
          "Pastikan itu hosting milikmu. Pilih folder atau subdomain khusus percobaan agar tidak menimpa website lain.",
        next: "Salin domain dan folder yang sudah kamu periksa ke prompt 11. Contoh tujuan dalam panduan ini bukan akun hosting yang bisa kamu pakai.",
      },
      {
        id: "unggah",
        title: "Publikasikan versi yang diuji",
        tool: "Codex · koneksi dan tujuan sudah diperiksa",
        input: "Domain dan document root dari prompt 10. Langkah ini akan mempublikasikan file.",
        prompt: `I choose the domain [DOMAIN] and document root [DESTINATION FOLDER] from the previous inspection.
Deploy this static app there using domainesia-hosting.
Confirm that the domain and folder match the inspected destination. If they do not match or were not verified, stop and ask me. Do not guess.
Upload only the app files and assets needed. Do not upload .env files, passwords, tokens, or private notes.
If existing files need to be overwritten, list them and explain the backup plan, then ask for approval first. Do not delete unrelated files or change DNS without approval.
After deployment, provide the public URL, a list of changes, and steps to restore the previous version. Do not call it finished until you inspect the page being served.`,
        example: {
          DOMAIN: "slideqr.example.com (replace with your domain from prompt 10)",
          "DESTINATION FOLDER":
            "/folder-from-prompt-10 (replace with the document root you inspected)",
        },
        output: "Alamat publik aplikasi dan catatan file yang diunggah.",
        check:
          "Buka alamat publik. Jika yang tampil halaman bawaan hosting, laporkan tampilannya. Jangan langsung menghapus file bawaan.",
        next: "Lakukan pemeriksaan terakhir di prompt 12. Jangan hanya mengandalkan pesan sukses upload.",
      },
      {
        id: "live",
        title: "Coba dari alamat publik",
        tool: "Codex + browser + ponsel",
        input: "URL publik dari deploy dan checklist prompt 08.",
        prompt: `Verify the app at [PUBLIC URL] against PROJECT.md.
Confirm that the correct app appears instead of the hosting provider's default page. Check its assets, main user journey, invalid input, and phone layout if tools are available.
An HTTP 200 response alone is not enough. Report which checks you actually ran, their results, and which manual checks I still need to do.
Do not change hosting configuration or code without explaining the finding and proposed fix.
After verification, help me draft a short invitation for one potential user to try it. Ask what they did and where they struggled, not whether they liked the idea. Do not send the message.`,
        example: {
          "PUBLIC URL": "https://slideqr.example.com (replace with your deployed URL)",
        },
        output: "Hasil pemeriksaan versi publik dan draf ajakan mencoba.",
        check:
          "Buka dari ponsel. Untuk SlideQR, buat QR dari situs publik, unduh, dan pindai. Minta satu orang mencoba tanpa kamu arahkan.",
        next: "Catat satu kesulitan pengguna. Kembali ke prompt 07 untuk memperbaikinya, lalu uji dan deploy ulang.",
      },
    ],
  },
];

let number = 0;
for (const stage of stages) {
  for (const step of stage.steps) {
    step.number = String(++number).padStart(2, "0");
    step.examplePrompt = step.prompt.replace(
      /\[([^\]]+)\]/g,
      (match, key) => step.example[key] ?? match,
    );
  }
}

export default {
  title: "Panduan Vibe Coding",
  subtitle: "Dari ide sampai online.",
  updated: "16 September 2026",
  description:
    "Prompt siap salin untuk membangun alat web pertamamu dengan AI. Ikuti contoh SlideQR, lalu coba dengan idemu sendiri.",
  responseTime: "24 jam kerja",
  prerequisites: [
    {
      title: "Laptop, browser, dan akun AI",
      text: "Siapkan laptop dengan internet, browser, dan akses ke ChatGPT serta Codex. Periksa ketersediaan aplikasi dan akses akunmu lewat panduan resmi. Biaya atau batas penggunaan tool mengikuti layanan masing-masing.",
    },
    {
      title: "Satu folder khusus project",
      text: "Buat folder baru bernama slideqr melalui Finder atau File Explorer, lalu buka sebagai project di Codex. Folder ini menyimpan semua file aplikasi. Gunakan folder kosong, terpisah dari pekerjaan lain.",
    },
    {
      title: "ChatGPT untuk merencanakan, Codex untuk membangun",
      text: "Kerjakan prompt 01–05 dalam satu percakapan ChatGPT. Salin brief akhir ke Codex dan minta, “Save the following text as PROJECT.md in this folder. Do not write the app code yet.” Tempel seluruh brief setelah kalimat itu. Lanjutkan prompt 06 di project yang sama.",
    },
    {
      title: "Hosting saat siap deploy",
      text: "Kamu bisa menyelesaikan tahap Rencana sampai Testing tanpa hosting. Untuk mengikuti tahap Deploy, siapkan hosting DomaiNesia aktif dan sambungkan Model Context Protocol (MCP), penghubung AI ke layanan hosting. Pilih tujuan khusus percobaan. Atur kredensial di konfigurasi lokal. Jangan masukkan ke prompt dalam panduan ini atau file website.",
    },
  ],
  howTo: [
    "Ikuti urutannya. Buka prompt saat kamu siap mengerjakan tahap itu. Tidak perlu menempelkan semuanya sekaligus.",
    "Prompt, contoh terisi, dan jawaban AI menggunakan bahasa Inggris. Petunjuk dan cek mandiri dalam panduan ini tetap berbahasa Indonesia.",
    "Pilih Ikuti SlideQR untuk melihat contoh terisi, atau Pakai ide saya lalu ganti bagian [DALAM KURUNG] dengan konteksmu sebelum dikirim.",
    "Baca hasil AI dan lakukan bagian Cek sendiri. Jika belum sesuai, perbaiki dulu sebelum lanjut. Hasil AI bisa berbeda dari contoh.",
    "Saat pindah dari ChatGPT ke Codex, bawa isi PROJECT.md terakhir. Jika memakai percakapan baru, berikan brief dan hasil sebelumnya yang diperlukan.",
  ],
  glossary: [
    {
      term: "Prototype",
      meaning:
        "Versi awal untuk mencoba satu manfaat. Belum otomatis siap dipakai banyak orang atau menyimpan data penting.",
    },
    {
      term: "PROJECT.md",
      meaning:
        "File teks berisi brief project. Akhiran .md berarti Markdown, format teks dengan judul dan daftar sederhana.",
    },
    {
      term: "Preview lokal",
      meaning:
        "Aplikasi berjalan di laptopmu. Alamat seperti localhost belum bisa dibuka orang lain dari internet.",
    },
    {
      term: "Deploy and document root",
      meaning:
        "Deploy berarti mempublikasikan aplikasi. Document root adalah folder di hosting yang isinya disajikan sebagai website.",
    },
  ],
  sources: [
    {
      label: "Panduan aplikasi dari OpenAI",
      url: "https://developers.openai.com/codex/app/",
    },
    {
      label: "Codex dan MCP DomaiNesia",
      url: "https://www.domainesia.com/panduan/koneksi-codex-dengan-mcp-domainesia/",
    },
  ],
  stages,
};

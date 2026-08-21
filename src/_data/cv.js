/**
 * ISI CV — dipakai oleh dua halaman sekaligus: /cv/ (Indonesia) dan /cv/en/ (Inggris)
 * =================================================================================
 *
 * File ini murni daftar, sama seperti src/_data/karya.js: tidak ada logika apa pun.
 * Edit isinya lalu jalankan `pnpm run build` (atau `pnpm start`), dan kedua halaman
 * CV ikut berubah. Formatnya (tanggal, urutan, terjemahan) diurus
 * src/libs/cv.js dan src/_includes/cv_body.njk.
 *
 * KENAPA SATU FILE UNTUK DUA BAHASA
 *   Kalau versi Indonesia dan Inggris ditulis terpisah, keduanya pasti melenceng
 *   begitu salah satunya diedit. Di sini setiap kalimat ditulis sebagai pasangan
 *   `{ id: "...", en: "..." }`, jadi menambah satu baris berarti menambahnya di
 *   kedua halaman sekaligus. Kalau isinya sama persis di dua bahasa (nama
 *   teknologi, nama perusahaan, nama sekolah), cukup tulis string biasa.
 *
 * ATURAN TANGGAL
 *   Tulis "YYYY-MM" kalau tahu bulannya, "YYYY" kalau cuma tahu tahunnya.
 *   Untuk peran yang masih berjalan, tulis `end: null` — halaman yang menuliskan
 *   "Sekarang"/"Present", jadi tidak ada durasi basi yang perlu diperbarui manual.
 *   JANGAN menulis durasi ("7 tahun 1 bulan") di sini; itu selalu jadi salah.
 *
 * ATURAN DATA PRIBADI
 *   Halaman ini publik dan permanen. Email adalah satu-satunya detail pribadi
 *   yang boleh tampil. TIDAK ADA nomor telepon dan TIDAK ADA lokasi/alamat —
 *   termasuk di meta tag dan structured data. Alamat yang sudah terlanjur
 *   di-scrape tidak bisa ditarik kembali. Ada test yang menjaga ini
 *   (test/cv.test.js dan test/cv-page.test.js).
 *
 * ATURAN TAUTAN
 *   Cek dulu tautannya masih hidup sebelum ditulis di sini. Satu CV yang
 *   memajang tautan mati lebih buruk daripada CV tanpa tautan sama sekali.
 *
 * DAFTAR PROYEK
 *   Proyek open source di halaman CV diambil langsung dari src/_data/karya.js,
 *   tidak disalin ke sini. Tambah proyek di sana, CV ikut terisi.
 *
 * STATUS (KANAL & KREDENSIAL)
 *   Label `status` ("current" / "retired") dipakai bersama: map-nya satu
 *   (`L.status` di cv_body.njk → Berjalan/Running, Arsip/Archive), jangan
 *   invent marker lain. Tiap entri di `content.channels` WAJIB punya status;
 *   halaman menampilkan yang masih berjalan dulu, lalu yang diarsip, dengan
 *   urutan relatif di dalam tiap kelompok tetap seperti di sini. Entri di
 *   `teaching` BOLEH opsional membawa `status: "retired"` untuk kredensial
 *   yang sudah tidak aktif (tetap dicantumkan karena pernah digapai) — tanpa
 *   tanggal masa aktif; podcast yang diarsip juga tanpa tanggal.
 */

export default {
  /** Bahasa yang diterbitkan. Menambah bahasa berarti menambah halaman di src/. */
  languages: ["id", "en"],

  /**
   * Judul, deskripsi, dan alamat tiap versi. `title` juga jadi nama berkas PDF
   * ketika halaman ini dicetak dari browser, jadi tulis yang enak dibaca.
   */
  meta: {
    id: {
      permalink: "/cv/",
      htmlLang: "id", // untuk atribut lang="" dan hreflang=""
      langTag: "id-ID", // untuk structured data (schema.org inLanguage)
      ogLocale: "id_ID",
      title: "CV Riza Fahmi",
      description:
        "Riwayat kerja, pendidikan, dan karya Riza Fahmi — co-founder Hacktiv8, pengajar, dan pembuat konten pemrograman. Siap dibaca di layar maupun dicetak jadi PDF.",
      languageName: "Bahasa Indonesia",
      // Teks tombol dan tautan di sekeliling CV (bukan isi CV-nya).
      ui: {
        print: "Cetak / simpan PDF",
        back: "Kembali ke halaman utama",
        toolbar: "Aksi halaman",
      },
    },
    en: {
      permalink: "/cv/en/",
      htmlLang: "en",
      langTag: "en-US",
      ogLocale: "en_US",
      title: "Riza Fahmi - CV",
      description:
        "The work history, education, and public work of Riza Fahmi — co-founder of Hacktiv8, educator, and programming content creator. Reads on screen and prints straight to PDF.",
      languageName: "English",
      ui: {
        print: "Print / save as PDF",
        back: "Back to the home page",
        toolbar: "Page actions",
      },
    },
  },

  /** Bulan terakhir isi CV ini disunting. Tampil sebagai "Diperbarui …". */
  updated: "2026-08",

  identity: {
    name: "Riza Fahmi",
    headline: {
      id: "Co-Founder di Hacktiv8 Indonesia",
      en: "Co-Founder at Hacktiv8 Indonesia",
    },
    email: "rizafahmi@gmail.com",
    // Semua tautan di bawah sudah publik. Urutannya = urutan tampil.
    profiles: [
      { label: { id: "Situs", en: "Website" }, url: "https://rizafahmi.com" },
      { label: "GitHub", url: "https://github.com/rizafahmi" },
      { label: "LinkedIn", url: "https://linkedin.com/in/rizafahmi" },
      { label: "X", url: "https://x.com/rizafahmi22" },
      { label: "YouTube", url: "https://youtube.com/rizafahmi" },
    ],
  },

  /** Ringkasan pembuka. Satu entri = satu paragraf. */
  summary: [
    {
      id: "Co-Founder Hacktiv8, coding bootcamp yang saya rintis sejak 2016 untuk menjawab kelangkaan developer yang menghambat tumbuhnya startup teknologi di Indonesia. Programnya imersif, 12 minggu, dan dirancang supaya orang dengan latar belakang teknis seadanya bisa sampai ke level junior developer yang layak dibayar.",
      en: "I co-founded Hacktiv8 in 2016 to close the developer hiring gap that was holding back Indonesia's tech startups. It runs a 12-week immersive curriculum built so that people with little or no technical background can reach a paid junior developer role.",
    },
    {
      id: "Sebelum itu saya menulis kode sejak 2003 dan naik pelan-pelan dari programmer ke team leader, head of R&D, sampai CTO — di portal berita, pendidikan online, dan civic tech. Sebagian besar pekerjaannya back-end, plus infrastruktur dan memimpin tim kecil.",
      en: "Before that I had been shipping software since 2003, moving from programmer to team leader, head of R&D, and CTO across news portals, online education, and civic technology. Mostly back-end work, plus infrastructure and leading small teams.",
    },
    {
      id: "Bagian yang paling saya nikmati adalah membagikan ulang apa yang saya pelajari: bikin konten pemrograman sejak 2012, ngobrol di podcast sejak 2015, dan ikut mengurus komunitas sejak 2014. Sekarang saya Google Developer Expert, pernah juga jadi AWS Community Builder, dan sebagian besar tulisan serta eksperimen saya berkutat di Elixir dan AI untuk ngoding.",
      en: "The part I enjoy most is handing back what I learn: programming content since 2012, podcasting since 2015, and community organising since 2014. I am a Google Developer Expert and a former AWS Community Builder, and most of my current writing and side projects sit where Elixir meets AI-assisted development.",
    },
  ],

  /**
   * Keahlian saat ini, bukan hasil endorsement LinkedIn. Isinya diambil dari
   * bukti yang ada: tag di src/_data/karya.js, halaman topik, dan tulisan terbaru.
   */
  skills: [
    {
      group: { id: "Bahasa & runtime", en: "Languages & runtimes" },
      items: ["Elixir", "JavaScript", "TypeScript", "Node.js", "Bash"],
    },
    {
      group: { id: "Framework & tooling", en: "Frameworks & tooling" },
      items: ["Phoenix LiveView", "OTP", "Astro", "Eleventy"],
    },
    {
      group: { id: "Data & infrastruktur", en: "Data & infrastructure" },
      items: ["SQLite", "Turso", "Local-first", "Linux"],
    },
    {
      group: { id: "AI & agentic coding", en: "AI & agentic coding" },
      items: ["Anthropic API", "Gemini API", "Agentic coding", "LLM evaluation"],
    },
    {
      group: { id: "Cara kerja", en: "Ways of working" },
      items: [
        { id: "Memimpin tim engineering", en: "Engineering leadership" },
        { id: "Perancangan kurikulum", en: "Curriculum design" },
        { id: "Menulis teknis", en: "Technical writing" },
        { id: "Berbicara di publik & workshop", en: "Public speaking & workshops" },
      ],
    },
  ],

  /**
   * Riwayat kerja, terbaru di atas. Satu perusahaan = satu blok, walaupun
   * jabatannya berganti (lihat Hacktiv8) — `roles` diisi dari yang terbaru.
   */
  experience: [
    {
      org: "Hacktiv8 Indonesia",
      url: "https://hacktiv8.com",
      roles: [
        { title: { id: "Co-Founder", en: "Co-Founder" }, start: "2018-11", end: null },
        {
          title: { id: "Curriculum Director, Co-Founder", en: "Curriculum Director, Co-Founder" },
          start: "2016-03",
          end: "2018-11",
        },
      ],
      summary: {
        id: "Coding bootcamp yang mengubah pemula jadi full-stack web developer dalam 12 minggu, termasuk mereka yang nyaris tanpa latar belakang teknis, sampai layak masuk posisi junior developer berbayar.",
        en: "A web development bootcamp that turns beginners into full-stack web developers in 12 weeks — including people with little or no technical background — up to the level of a paid junior developer role.",
      },
      highlights: [
        {
          id: "Menyusun dan menjalankan kurikulum imersif 12 minggu, dari nol sampai siap kerja.",
          en: "Built and ran the 12-week immersive curriculum, from zero to job-ready.",
        },
        {
          id: "Menjaga tiga kesepakatan yang jadi budaya kerja: integritas, kebaikan, dan datang sebagai diri sendiri seutuhnya.",
          en: "Held the three agreements the company runs on: integrity, kindness, and bringing your whole self.",
        },
      ],
    },
    {
      org: "CitizenLab",
      roles: [
        {
          title: { id: "Chief Technology Officer", en: "Chief Technology Officer" },
          start: "2015-08",
          end: "2016-02",
        },
      ],
      summary: {
        id: "SaaS civic engagement: warga ikut merancang kotanya sendiri — mengusulkan ide, memberi dukungan, dan pemerintah daerah menjalankan crowdvoting, misalnya untuk alokasi anggaran.",
        en: "A civic engagement SaaS where citizens co-create their city — posting and upvoting ideas — and governments run crowdvoting exercises such as budget allocation.",
      },
      highlights: [
        {
          id: "Memegang hampir seluruh sisi teknis: back-end sebagai porsi terbesar, sebagian front-end, pemeliharaan, dan infrastruktur.",
          en: "Owned essentially all technical aspects: mostly back-end, some front-end, maintenance, and infrastructure.",
        },
      ],
    },
    {
      org: "PT Haruka Edukasi Utama (HarukaEdu)",
      roles: [{ title: { id: "Developer", en: "Developer" }, start: "2013-07", end: "2015-09" }],
      summary: {
        id: "Platform pendidikan online untuk perguruan tinggi.",
        en: "An online education platform for higher education institutions.",
      },
      highlights: [
        {
          id: "Merencanakan pengembangan, mengelola proyek dan tim developer.",
          en: "Development planning, managing the project and the developer team.",
        },
        {
          id: "Membangun dan merawat platform, plus riset dan pengembangan untuk perbaikannya.",
          en: "Building and maintaining the platform, plus R&D for platform improvements.",
        },
      ],
    },
    {
      // Satu pekerjaan dengan dua nama. LinkedIn memecahnya jadi dua entri
      // dengan rentang tanggal yang persis sama; jangan dihitung dua kali.
      org: "PT. IONSOFT / IYAA.com (PT Indoportal Nusantara)",
      roles: [
        { title: { id: "Head of R&D", en: "Head of R&D" }, start: "2012-02", end: "2013-07" },
      ],
      summary: {
        id: "Portal media dan layanan digital IYAA.com.",
        en: "The IYAA.com media portal and its digital services.",
      },
      highlights: [
        {
          id: "Memimpin tim riset dan pengembangan.",
          en: "Managing the research and development team.",
        },
      ],
    },
    {
      org: "PT. Okezone Indonesia",
      roles: [
        {
          title: { id: "Team Leader Programmer", en: "Team Leader Programmer" },
          start: "2011",
          end: "2012",
        },
      ],
      summary: {
        id: "Memimpin dan mengembangkan portal berita serta aplikasi internal menggunakan PHP, XML, MySQL, dan Django/Python.",
        en: "Led and developed news portals and internal applications using PHP, XML, MySQL, and Django/Python.",
      },
      highlights: [
        { id: "Mendesain ulang kanal-kanal portal.", en: "Redesigned the portal channels." },
        { id: "Mengembangkan www.sindonews.com.", en: "Developed www.sindonews.com." },
        {
          id: "Membangun versi mobile sindonews dengan Django/Python.",
          en: "Built the sindonews mobile version in Django/Python.",
        },
      ],
    },
    {
      org: "Linuxindo",
      roles: [{ title: { id: "Programmer", en: "Programmer" }, start: "2007", end: "2011" }],
      summary: {
        id: "Mengembangkan dan menganalisis aplikasi web di berbagai framework PHP dan basis data.",
        en: "Developed and analysed web applications across various PHP frameworks and databases.",
      },
      highlights: [
        { id: "Sistem ERP berbasis web.", en: "A web-based ERP system." },
        { id: "Sistem MLM yang dirancang dengan UML.", en: "An MLM system designed with UML." },
        { id: "Sistem pelaporan fax server.", en: "A fax server reporting system." },
        { id: "Mengajar PostgreSQL.", en: "Lectured PostgreSQL." },
      ],
    },
    {
      org: "PT. Ainetworks Indonesia",
      roles: [{ title: { id: "Programmer", en: "Programmer" }, start: "2003", end: "2007-05" }],
      summary: {
        id: "Aplikasi web, sebagian besar dengan PHP dan PostgreSQL.",
        en: "Web applications, mainly in PHP and PostgreSQL.",
      },
      highlights: [
        { id: "Sistem administrasi sekolah.", en: "A school administration system." },
        { id: "Sistem SMS broadcast.", en: "An SMS broadcast system." },
        { id: "Sistem absensi.", en: "An attendance system." },
        { id: "Sistem delivery order.", en: "A delivery order system." },
        { id: "Sistem informasi rumah sakit.", en: "A hospital information system." },
        { id: "Sistem informasi perbankan.", en: "A banking information system." },
      ],
    },
  ],

  education: [
    {
      school: "University of Indonesia",
      degree: {
        id: "Magister (S2), Teknologi Informasi",
        en: "Master's degree, Information Technology",
      },
      start: "2008",
      end: "2010",
    },
    {
      school: "BINUS University",
      degree: {
        id: "Sarjana (S1), Teknologi Informasi",
        en: "Bachelor's degree, Information Technology",
      },
      start: "1999",
      end: "2003",
    },
  ],

  /** Mengajar, komunitas, dan peran yang bukan pekerjaan penuh waktu. */
  teaching: [
    {
      id: "Dosen di Universitas Budi Luhur.",
      en: "Lecturer at Universitas Budi Luhur.",
    },
    {
      id: "Google Developer Expert (GDE).",
      en: "Google Developer Expert (GDE).",
    },
    {
      id: "AWS Community Builder",
      en: "AWS Community Builder",
      status: "retired",
    },
    {
      id: "Organizer JakartaJS dan Meteor Jakarta.",
      en: "Organiser of JakartaJS and Meteor Jakarta.",
    },
    {
      id: "Merawat Awesome Speakers Indonesia, daftar terbuka developer yang berkenan diundang jadi narasumber.",
      en: "Maintains Awesome Speakers Indonesia, an open directory of developers happy to be invited to speak.",
    },
  ],

  speaking: {
    /** Angka diambil dari halaman /kerjasama/ (src/ratecard.njk). */
    tally: [
      { count: 41, label: { id: "acara seminar", en: "talks and seminars" } },
      { count: 19, label: { id: "workshop", en: "workshops" } },
    ],
    topics: {
      id: "Pengembangan perangkat lunak, komputasi awan, arsitektur, basis data, soft skill, dan topik teknologi lain.",
      en: "Software development, cloud computing, architecture, databases, soft skills, and other technology topics.",
    },
    /** Panggung yang benar-benar tercatat — jangan menambah yang tidak ada buktinya. */
    stages: [
      "JSDay Indonesia 2019 (keynote)",
      "DevFest GDG Jogja 2025 (workshop)",
      "Singapore Elixir Meetup",
      "GeekCamp",
      "Lambda Jakarta",
    ],
    collaborations: [
      "AWS Indonesia",
      "BenQ Indonesia",
      "Meta/Facebook",
      "Google Indonesia",
      "Domainesia",
      "Niagahoster",
      "Feedloop",
      "DeepTech",
    ],
  },

  content: {
    since: [
      {
        id: "Membuat konten pemrograman sejak 2012",
        en: "Creating programming content since 2012",
      },
      { id: "Memandu podcast sejak 2015", en: "Hosting podcasts since 2015" },
      {
        id: "Berkontribusi ke komunitas pemrograman sejak 2014",
        en: "Contributing to programming communities since 2014",
      },
    ],
    channels: [
      {
        name: "Ngobrolin Web",
        url: "https://ngobrol.in",
        status: "current",
        note: {
          id: "Podcast mingguan yang membahas segala hal tentang web.",
          en: "A weekly podcast about everything web.",
        },
      },
      {
        name: "YouTube",
        url: "https://youtube.com/rizafahmi",
        status: "current",
        note: {
          id: "Tutorial dan sesi livestream ngoding bareng seputar AI, Elixir, dan web.",
          en: "Tutorials and live coding streams on AI, Elixir, and the web.",
        },
      },
      {
        name: "Ceritanya Developer",
        url: "https://open.spotify.com/show/6grT1c7jDkhK4skm1YIsTs",
        status: "retired",
        note: { id: "Podcast.", en: "Podcast." },
      },
      {
        name: "Hikayat Punggawa Teknologi",
        url: "https://www.youtube.com/playlist?list=PLTY2nW4jwtG9IEUCDspLH0tAuF450DZz-",
        status: "retired",
        note: { id: "Serial podcast.", en: "Podcast series." },
      },
      {
        name: "AppsCoast",
        url: "https://open.spotify.com/show/6wjIRrIQ8yvAgCwXCUXKXI",
        status: "retired",
        note: {
          id: "Podcast tentang startup teknologi Indonesia.",
          en: "A podcast about Indonesian tech startups.",
        },
      },
    ],
    courses: [
      {
        name: "SvelteJS",
        url: "https://buildwithangga.com/kelas/sveltejs-front-end-javascript-development-web-donasi-online",
        note: {
          id: "Membangun aplikasi web donasi online dan integrasi payment gateway.",
          en: "Building an online donation web app and integrating a payment gateway.",
        },
      },
      {
        name: {
          id: "Struktur Data dengan JavaScript",
          en: "Data Structures with JavaScript",
        },
        url: "https://buildwithangga.com/kelas/struktur-data-javascript-improve-website-e-commerce",
        note: {
          id: "Fundamental struktur data lewat JavaScript.",
          en: "Data structure fundamentals through JavaScript.",
        },
      },
      {
        name: { id: "PWA dengan React", en: "PWA with React" },
        url: "https://buildwithangga.com/kelas/mastering-react-js-progressive-web-apps-e-commerce",
        note: {
          id: "Menerapkan progressive web app dengan React.",
          en: "Implementing progressive web apps with React.",
        },
      },
    ],
  },

  /**
   * Proyek di luar daftar open source yang sudah diambil dari karya.js.
   */
  projectsExtra: [
    {
      name: "Carikerja",
      url: "https://carikerja.deeptech.id/",
      note: {
        id: "Daftar developer yang terdampak COVID-19, supaya lebih mudah ditemukan perusahaan.",
        en: "A directory of developers affected by COVID-19, built so companies could find them.",
      },
    },
    {
      name: "Awesome Speakers Indonesia",
      url: "https://github.com/rizafahmi/awesome-speakers-id",
      note: {
        id: "Daftar terbuka developer Indonesia yang berkenan jadi narasumber.",
        en: "An open directory of Indonesian developers available to speak.",
      },
    },
  ],

  honours: {
    certifications: ["2023 Southeast Asia EdTech 50"],
    awards: ["Most Inspiring Lead"],
    /**
     * Judul saja. Ekspor LinkedIn tidak menyertakan tautan maupun tanggal, dan
     * menebak URL untuk sebuah CV lebih buruk daripada tidak menautkan apa pun.
     */
    publications: [
      "Reactive Programming Made Simple",
      "How I Met 10 Entrepreneurs In Asia And What Can We Learn From Them",
      "Startup Talks In Asia: Candid Interview With 10 Asian Start-up Founders About Their Entrepreneurial Journey",
      "Meteor Introduction at TokoPedia Tech A Break #4",
    ],
  },

  spokenLanguages: [
    {
      name: { id: "Bahasa Indonesia", en: "Indonesian" },
      level: { id: "Penutur asli / dwibahasa", en: "Native or bilingual" },
    },
    {
      name: { id: "Bahasa Inggris", en: "English" },
      level: { id: "Kemampuan kerja profesional", en: "Professional working" },
    },
  ],
};

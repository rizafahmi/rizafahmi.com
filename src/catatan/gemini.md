---
title: "Gemini API untuk Web Developer"
permalink: "/gemini-web-dev/"
date: 2023-10-22
created: 2023-10-22
layout: tulisan
description: Contoh penggunaan Gemini API untuk web developer
image: "/assets/images/gemini-web-dev/mendang-mending.png"
tags:
  - catatan
  - ai
  - tools

---
Gemini adalah model Generative AI andalan Google. Sudah dilatih dengan banyak teks, audio dan video dengan berbagai bahasa. Berbeda dengan model lainnya, Gemini dibangun dari awal dengan fitur multimodal, artinya dapat menerima beberapa jenis masukan seperti teks, gambar, kode, dan berbagai jenis file lainnya.

Ada tiga cara menggunakan Gemini: melalui interface [gemini.google.com](https://gemini.google.com/), Gemini API via Google AI Studio. Cara ketiga dengan menggunakan Vertex AI jika ingin melakukan penggelaran atau _deployment_ model sendiri via [Google Cloud Platform](https://cloud.google.com/vertex-ai?hl=en).

Untuk tutorial kali ini kita akan menggunakan Gemini API melalui [Google AI Studio](https://aistudio.google.com/), dan sama-sama belajar bagaimana menambahkan fitur AI kedalam aplikasi web.

## Pratinjau

Tutorial kali ini kita akan membuat aplikasi dengan AI sebagai bahan utamanya. Kita akan membuat aplikasi mendang-mending, membandingkan satu hal dengan hal lainnya.

Hasil perbandingan akan dihasilkan oleh AI, dalam hal ini Gemini API.

{% image "./assets/images/gemini-web-dev/mendang-mending.png", "" %}

## Persiapan

Di tutorial ini kita akan menggunakan NodeJS versi 18 atau yang lebih baru. Jika belum menginstall NodeJS, silakan download dan install dari [situs resminya](https://nodejs.org/).

Kita juga membutuhkan akun Google atau Google Cloud Platform untuk mendapatkan akses ke Gemini API. Jika belum memiliki akun, silakan daftar terlebih dahulu. Untuk memastikan silakan kunjungi [AI Studio](https://aistudio.google.com/) dan login dengan akun Google. Hingga tulisan ini dipublikasi, Gemini API lewat Google AI Studio dapat diakses secara gratis dengan batasan tertentu.

## Membangun Aplikasi Web

### Persiapan Proyek

Pertama-tama, siapkan terlebih dahulu folder untuk proyek ini sekaligus menjalankan `npm init` untuk menandai sebagai proyek NodeJS.

```bash
mkdir mendang-mending-gemini
cd mendang-mending-gemini
npm init -y
```

Lalu buatlah sebuah file yang akan digunakan sebagai server atau backend untuk aplikasi.

#### `server.js`

Di file ini kita akan membuat server sederhana dengan menggunakan modul `http` bawaan NodeJS dengan sebuah route untuk permulaan.

```javascript
import http from "http";

(async function () {
  const server = http.createServer(async function (request, response) {
    const { url } = request;
    if (url === "/health") {
      response.writeHead(200).end("OK");
    } else {
      console.error(`${url} is 404!`);
      response.writeHead(404);
      response.end();
    }
  });

  const port = process.env.PORT || 6789;
  console.log(`Server running on port ${port}`);
  server.listen(port);
})();
```

#### `package.json`

Tambahkan script untuk menjalankan server di `package.json`.

```json
{
  "name": "mendang-mending-gemini",
  "version": "1.0.0",
  "description": "",
  "main": "",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "keywords": [],
  "author": "Riza Fahmi",
  "license": "MIT",
  "type": "module"
}
```

Lalu jalankan server dengan perintah `npm start` atau `npm run dev`. Jika berhasil, buka browser dan akses `http://localhost:6789/health` dan akan muncul tulisan `OK` atau bisa dicek juga dengan alat bantu seperti curl dan pastikan mendapatkan hasil `OK`.

```bash
curl localhost:6789/health
OK⏎
```

### Membangun _Backend_

Mari persiapkan aplikasi dari sisi backend. Untuk _route_ utama akan menampilkan halaman utama dari aplikasi.

#### `server.js`

Ketika pengguna mengakses `http://localhost:6789/` atau `http://localhost:6789/index.html`, kita akan menampilkan halaman utama dari aplikasi yang berasal dari file `index.html` sebagai frontend.

```diff
import http from "http";
+ import fs from "fs";

(async () => {
    const {url} = request;
    if (url === "/health") {
      response.writeHead(200).end("OK");
+    } else if (url === "/" || url === "/index.html") {
+      response.writeHead(200, { "Content-Type": "text/html" });
+      response.end(fs.readFileSync("./public/index.html"));
```

### Membangun _Frontend_

Untuk sisi frontend, mulai dari yang paling sederhana saja, sebuah halaman `index.html` yang didalamnya akan ada CSS dan JavaScript.

#### `public/index.html`

CSS dan JavaScript sebagian besar sudah disediakan agar bisa lebih fokus pada bagian Gemini API. Sehingga mudah bila ingin melakukan copy-paste.

Sebagian besar kode JavaScript bertugas untuk menangani _form_, _state_ dan DOM.

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi buat kaum mendang-mending</title>

  <style>
    @import url('https://fonts.upset.dev/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

    html {
      background-color: #232946;
      font-family: Montserrat, proxima-nova, sans-serif;
    }

    body {
      font-size: 18px;
      line-height: 1.8;
      font-weight: 400;
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    section {
      background-color: #eebbc3;
      color: #232946;
      font-size: 1.5rem;
      font-weight: 600;
      padding: 2rem 1rem;
      text-align: center;
    }

    input[type="text"] {
      font-family: Montserrat, proxima-nova, sans-serif;
      font-size: 1.5rem;
      background-color: transparent;
      border-color: #fffffe;
      color: #232946;
      height: 2.5rem;
      margin-bottom: 0px;
      padding-left: 20px;
      border: 0;
      border-bottom: 3px dashed #232323;
      border-radius: 3px;
      font-weight: 500;
      font-size: 16px;
      line-height: 1.4;
      vertical-align: middle;
    }

    input[type="text"]:focus {
      outline: 0;
    }

    #topic {
      width: 36rem;
    }

    button {
      font-size: 1.25rem;
      background-color: #232946;
      color: #fffffe;
      width: 80%;
      padding: 0.7rem;
      margin: 1rem;
      border: 0;
      cursor: pointer;
      border-radius: 3px;
    }

    button:disabled {
      background-color: #b8c1ec;
    }

    .topic {
      padding-bottom: 0.5rem;
    }

    #topicText {
      text-transform: uppercase;
    }

    .options {
      padding-bottom: 0.5rem;
    }

    main {
      margin: 6rem 3rem;
      padding: 2.5rem;
      border-radius: 3px;
      background-color: #fffffe;
      opacity: 1;
      transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg);
      transform-style: preserve-3d;
    }
  </style>
</head>

<body>
  <section>
    <div class="topic"><input type="text" id="topic" name="topic" placeholder="Topik untuk dibandingkan..." required />
    </div>

    <div class="options">
      <span>mending</span> <input type="text" name="option1" id="option1" required />
      atau <input type="text" name="option2" id="option2" required />
    </div>

    <div class="action">
      <button id="compareButton"> 👇 mending mana? </button>
    </div>

  </section>

  <main id="suggestion">
    <h3 id="topicText">Topic</h3>
    <div id="responseText"></div>
  </main>

  <script>
    document.addEventListener('DOMContentLoaded', function () {
      console.log("Client side");
      suggestion.hidden = true;
      topic.focus();
      compareButton.disabled = true;

      option2.addEventListener('keydown', async function (e) {
        compareButton.disabled = false;
        if (e.key === 'Enter') {
          await runComparison();
        }
      });

      compareButton.addEventListener('click', async function (e) {
        await runComparison();
      });

    });

    async function runComparison() {
      compareButton.textContent = "🤔 mikir dulu..."
      compareButton.disabled = true;
      await compare(topic.value.trim(), option1.value.trim(), option2.value.trim());
      compareButton.textContent = "👇 mending mana?"
      topic.focus();
      compareButton.disabled = true;
    }

    async function compare(topic, opt1, opt2) {
      option2.blur();
      // get something from backend here...

    }

    function resetForm() {
      topic.value = '';
      option1.value = '';
      option2.value = '';

      topic.focus();
    }

  </script>
</body>

</html>
```

Mari alihkan fokus ke baris 148 sampai baris ke-152. Di sini kita akan menambahkan kode JavaScript untuk mengirimkan permintaan ke server kita ketika tombol ditekan untuk membandingkan opsi pertama dengan opsi kedua.

```javascript
async function compare(topic, opt1, opt2) {
  option2.blur();
  const url = `/compare?topic=${encodeURIComponent(topic)}&opt1=${encodeURIComponent(opt1)}&opt2=${encodeURIComponent(opt2)}`;

  try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error('Unable to get an answer!');
    }
    const result = await response.text();
    if (result) {
      topicText.textContent = topic;
      responseText.insertAdjacentHTML('beforeend', result);
      suggestion.hidden = false;
      resetForm();
    }

  } catch (err) {
    console.error(err);
  }

}

```

Dari sisi frontend, lakukan pemanggilan ke server dengan menggunakan `fetch` ke _route_ `/compare` dengan parameter `topic`, `opt1` dan `opt2`. Hasil dari permintaan ini akan ditampilkan di halaman web.

### Membangun _Backend_

#### `server.js`

Tambahkan _route_ baru untuk menangani permintaan dari _frontend_, `/compare` yang akan menerima parameter `topic`, `opt1` dan `opt2`. Untuk saat ini, kita akan mencacah parameter lalu mengembalikan hasilnya.

```diff
import fs from "fs";
import http from "http";

+ function parse_options(options) {
+   const topic = options[0].split("=")[1];
+   const opt1 = options[1].split("=")[1];
+   const opt2 = options[2].split("=")[1];
+   return { topic, opt1, opt2 };
+ }

 (async function() {
   const server = http.createServer(async function (request, response) {
     const {url} = request;
     if (url === "/health") {
       response.writeHead(200).end("OK");
     } else if (url === "/" || url === "/index.html") {
       response.writeHead(200, {"Content-Type": "text/html"});
       response.end(fs.readFileSync("./public/index.html"));
+    } else if (url.startsWith("/compare")) {
+      const parsedUrl = new URL(`http://localhost/${url}`);
+      const {search} = parsedUrl;
+      const options = decodeURIComponent(search.substring(1)).split("&");
+      const {topic, opt1, opt2} = parse_options(options);
+
+      console.log({ topic, opt1, opt2 });
+      response.writeHead(200).end(JSON.stringify({ topic, opt1, opt2 }));
    } else {
      console.error(`${url} is 404!`);
      response.writeHead(404);
      response.end();
    }
  });

  const port = process.env.PORT || 6789;
  console.log(`Server running on port ${port}`);
  server.listen(port);
})();

```

### Gemini API

Untuk mulai menggunakan silakan login dengan akun GCP terlebih dahulu ke [https://aistudio.google.com/](https://aistudio.google.com/) lalu menuju ke [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) atau pilih menu "Get API Key" untuk membuat API Key baru yang akan kita gunakan di kode nantinya.

Lalu pilih "Create API Key" dan pilih proyek dari GCP sebelumnya. Dan salin API Key untuk nantinya akan dimasukkan kedalam _environment variable_ atau file `.env`

{% image "./assets/images/gemini-web-dev/api-key.png", "api key" %}

#### `.env`

```text
API_KEY=ApiKEYDariAIStudio
```

Agar `API_KEY` bisa terbaca di kode `server.js` kita perlu mengubah sedikit _npm script_ yang ada.

#### `package.json`

```diff
{
  "name": "mendang-mending-gemini",
  "version": "1.0.0",
  "description": "",
  "main": "",
  "scripts": {
    "start": "node server.js",
-     "dev": "NODE_ENV=dev node --watch server.js"
+     "dev": "NODE_ENV=dev node --watch --env-file=.env server.js"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "type": "module"
}
```

Untuk memastikan `API_KEY` sudah dapat dibaca oleh kode backend, mari menjajalnya dengan mencetak `API_KEY` di sisi server.

#### `server.js`

```diff
import fs from "fs";
import http from "http";

+ console.log(`API_KEY: ${process.env.API_KEY}`);

function parse_options(options) {
  const topic = options[0].split("=")[1];
  const opt1 = options[1].split("=")[1];
  const opt2 = options[2].split("=")[1];
  return { topic, opt1, opt2 };
}
```

Jalankan `npm run dev` dan pastikan `API_KEY` sudah tercetak di terminal.

```shell
npm run dev

> mendang-mending-gemini@1.0.0 dev
> NODE_ENV=dev node --watch --env-file=.env server.js

(node:97065) ExperimentalWarning: Watch mode is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
API_KEY: ApiKEYDariAIStudio
Server running on port 6789
```

Selanjutnya lakukan instalasi pustaka `generative-ai` dari Google melalui `npm`.

```bash
npm i @google/generative-ai
```

#### `server.js`

Hal pertama yang perlu dilakukan adalah import beberapa fungsi dari pustaka `generative-ai` yang baru saja diinstal. Lalu tambahkan fungsi `compare` yang akan menerima tiga parameter, yaitu `topic`, `opt1`, dan `opt2` dan akan menghasilkan saran dari Gemini API. Terakhir, eksekusi fungsi `compare` ketika permintaan dari _frontend_ diterima.

```diff
import fs from "fs";
import http from "http";
+ import {
+   GoogleGenerativeAI,
+   HarmCategory,
+   HarmBlockThreshold
+ } from '@google/generative-ai';

+ async function compare(topic, opt1, opt2) {
+   // Generate suggestion
+   const MODEL_NAME = 'gemini-1.0-pro';
+   const { API_KEY } = process.env;
+   if (!API_KEY) {
+     console.error('Please provide the API_KEY..');
+     return;
+   }
+   const genAI = new GoogleGenerativeAI(API_KEY);
+   const model = genAI.getGenerativeModel({ model: MODEL_NAME });
+   const generationConfig = {
+     temperature: 0.9,
+     topK: 1,
+     topP: 1,
+     maxOutputTokens: 2048,
+   };

+   const safetySettings = [
+     {
+       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
+       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
+     },
+     {
+       category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
+       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
+     },
+     {
+       category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
+       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
+     },
+     {
+       category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
+       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
+     },
+   ];

+   const parts = [
+     {text: `Please choose your answer given by user delimited by triple dash below and give short reason why. You will answer in Bahasa Indonesia.\n\nExample:\nUser: Mending laptop atau rakit pc?\nAsisten: Mending merakit PC, karena:\n\n* Lebih hemat biaya\n* Lebih fleksibel dalam memilih komponen\n* Dapat di-upgrade dengan mudah\n* Lebih cocok untuk kebutuhan spesifik\n\n\n\n---\n\nUser: ${topic} mending ${opt1} atau ${opt2}?`},
+   ];

+   const result = await model.generateContent({
+     contents: [{role: 'user', parts}],
+     generationConfig,
+     safetySettings
+   });

+   const { response } = result;
+   return response.text();
+ }


function parse_options(options) {
  const topic = options[0].split("=")[1];
  const opt1 = options[1].split("=")[1];
  const opt2 = options[2].split("=")[1];
  return {topic, opt1, opt2};
}

(async function() {
  const server = http.createServer(async function(request, response) {
    const {url} = request;
    if (url === "/health") {
      response.writeHead(200).end("OK");
    } else if (url === "/" || url === "/index.html") {
      response.writeHead(200, {"Content-Type": "text/html"});
      response.end(fs.readFileSync("./public/index.html"));
    } else if (url.startsWith("/compare")) {
      const parsedUrl = new URL(`http://localhost/${url}`);
      const {search} = parsedUrl;
      const options = decodeURIComponent(search.substring(1)).split("&");
      const {topic, opt1, opt2} = parse_options(options);

-       console.log({topic, opt1, opt2});
+       const suggestion = await compare(topic, opt1, opt2);
-       response.writeHead(200).end(JSON.stringify({topic, opt1, opt2}));
+       response.writeHead(200).end(suggestion);
    } else {
      console.error(`${url} is 404!`);
      response.writeHead(404);
      response.end();
    }
  });

  const port = process.env.PORT || 6789;
  console.log(`Server running on por ${port}`);
  server.listen(port);
})();
```

Mari kita bahas beberapa bagian penting dari kode diatas satu-per-satu.

#### Import `@google/generative-ai`

```javascript
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
```

#### Fungsi `compare`

```javascript
async function compare(topic, opt1, opt2) {
  // Generate suggestion
  const MODEL_NAME = 'gemini-1.0-pro';
  const { API_KEY } = process.env;
  if (!API_KEY) {
    console.error('Please provide the API_KEY..');
    return;
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  let prompt = `Please choose your answer given by user delimited by triple dash below and give short reason why. You will answer in Bahasa Indonesia.\n\nExample:\nUser: Mending laptop atau rakit pc?\nAsisten: Mending merakit PC, karena:\n\n* Lebih hemat biaya\n* Lebih fleksibel dalam memilih komponen\n* Dapat di-upgrade dengan mudah\n* Lebih cocok untuk kebutuhan spesifik\n\n\n\n---\n\nUser: ${topic} mending belajar ${opt1} atau ${opt2}?`;

  const parts = [
      { text: prompt },
  ];

  const result = await model.generateContent({
    contents: [{role: 'user', parts}],
    generationConfig,
    safetySettings
  });

  const { response } = result;
  return response.text();
}
```

Berikut langkah-langkah yang dilakukan oleh fungsi `compare`:

- Pertama, inisiasi objek `genAI` dari `GoogleGenerativeAI` _class_ dengan `API_KEY` yang sudah disediakan seperti yang dapat dilihat di baris ke-9.
- Tentukan model yang ingin digunakan. Per tulisan ini dipublikasi, pilihan model yang tersedia melalui API adalah `gemini-1.0-pro`.
- Buat file untuk menampung konfigurasi seperti `temperature`, `topK`, `topP`, `maxOutputTokens` dan juga konfigurasi keamanan di baris ke-11 hingga baris ke-35.
- Lalu di baris ke-37 hingga baris ke-41 untuk mempersiapkan teks yang akan dikirim ke Gemini API dengan instruksi spesifik untuk membandingkan dua hal disertai dengan contoh. Salah satu cara efektif untuk _prompting_ dengan memberikan contoh keluarang yang diinginkan.
- Di baris ke-43 hingga baris ke-47, eksekusi fungsi `generateContent` dengan berbagai parameter yang sudah disiapkan dan hasilnya dikembalikan ke _frontend_.

{% image "./assets/images/gemini-web-dev/render-raw.png", "hasil mentah" %}

### Menampilkan Hasil sebagai HTML

Pabila dijalankan akan menghasilkan seperti ilustrasi diatas. Teks yang dihasilkan Gemini API mengikuti format dengan tanda `*` _list_ dan tidak diikuti dengan baris baru. Hal ini bisa _diakalin_ dengan menganggap teks yang dihasilkan sebagai markdown dan konversi ke HTML. Mari kita coba dengan melakukan instalasi pustaka `marked`.

```bash
npm i marked
```

Gunakan pustaka `marked` untuk mengkonversi teks yang dihasilkan oleh Gemini API menjadi HTML.

```diff
import fs from "fs";
import http from "http";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from "@google/generative-ai";
+ import { parse } from 'marked';

async function compare(topic, opt1, opt2) {
  // Generate suggestion
  const MODEL_NAME = "gemini-1.0-pro";
  const {API_KEY} = process.env;
  if (!API_KEY) {
    console.error("Please provide the API_KEY..");
    return;
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({model: MODEL_NAME});
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
  ];

  const parts = [
    {
      text: `Please choose your answer given by user delimited by triple dash below and give short reason why. You will answer in Bahasa Indonesia.\n\nExample:\nUser: Mending laptop atau rakit pc?\nAsisten: Mending merakit PC, karena:\n\n* Lebih hemat biaya\n* Lebih fleksibel dalam memilih komponen\n* Dapat di-upgrade dengan mudah\n* Lebih cocok untuk kebutuhan spesifik\n\n\n\n---\n\nUser: ${topic} mending belajar ${opt1} atau ${opt2}?`
    }
  ];

  const result = await model.generateContent({
    contents: [{role: "user", parts}],
    generationConfig,
    safetySettings
  });

  const {response} = result;
  return response.text();
}

function parse_options(options) {
  const topic = options[0].split("=")[1];
  const opt1 = options[1].split("=")[1];
  const opt2 = options[2].split("=")[1];
  return {topic, opt1, opt2};
}

(async function() {
  const server = http.createServer(async function(request, response) {
    const {url} = request;
    if (url === "/health") {
      response.writeHead(200).end("OK");
    } else if (url === "/" || url === "/index.html") {
      response.writeHead(200, {"Content-Type": "text/html"});
      response.end(fs.readFileSync("./public/index.html"));
    } else if (url.startsWith("/compare")) {
      const parsedUrl = new URL(`http://localhost/${url}`);
      const {search} = parsedUrl;
      const options = decodeURIComponent(search.substring(1)).split("&");
      const {topic, opt1, opt2} = parse_options(options);

      const suggestion = await compare(topic, opt1, opt2);
-       response.writeHead(200).end(suggestion);
+       response.writeHead(200).end(parse(suggestion));
    } else {
      console.error(`${url} is 404!`);
      response.writeHead(404);
      response.end();
    }
  });

  const port = process.env.PORT || 6789;
  console.log(`Server running on por ${port}`);
  server.listen(port);
})();

```

{% image "./assets/images/gemini-web-dev/render-html.png", "render html" %}

Jauh lebih baik, kan?! Dan aplikasi kita pun selesai.

## Penutup

Tutorial kali ini memperlihatkan cara mengintegrasikan Gemini API kedalam sebuah aplikasi web. Berikut langkah-langkah yang dilakukan:

1. Menyiapkan proyek NodeJS.
2. Membuat server dengan modul `http`.
3. Membuat _route_ untuk menampilkan halaman utama.
4. Mempersiapkan aplikasi di sisi _frontend_.
5. Membuat _route_ baru untuk menangani permintaan dari _frontend_.

Sedangkan untuk integrasi Gemini API, kita melakukan langkah-langkah berikut:

1. Mendapatkan API Key dari Google AI Studio.
2. Instalasi pustaka `@google/generative-ai`.
3. Import fungsi yang dibutuhkan dari pustaka tersebut.
4. Inisiasi dengan GenerativeAI.
5. Pilih model dan berbagai konfigurasi lainnya.
6. Eksekusi fungsi `generateContent` dengan parameter yang sudah disiapkan.

Kode lengkapnya tersedia di [https://github.com/rizafahmi/gemini-for-web-dev](https://github.com/rizafahmi/gemini-for-web-dev).

Sekian tutorial penggunaan Gemini API khususnya untuk web developer. Kira-kira kita bikin apalagi ya? Silakan berikan masukan dan saran di kolom komentar. Terima kasih sudah mampir!

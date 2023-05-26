---
title: 'Web Scraping dengan Node'
permalink: '/web-scraping/'
date: 2023-05-25
tags: tulisan
layout: tulisan
---

<small style="color: rgba(252,252,252,0.5);"><em>Berikut adalah materi tertulis untuk acara workshop di Surabaya yang diselenggarakan Mei 2023.</em></small>

# Prasarat

Untuk mengikuti materi ini, teman-teman membutuhkan beberapa alat berikut:

- [NodeJS versi 18](https://nodejs.org/en) atau yang lebih baru
- Kode editor seperti [VS Code](https://code.visualstudio.com/), [Sublime](https://www.sublimetext.com/) dll
- Web browser seperti [Chrome](https://www.google.com/chrome/index.html), [Firefox](https://www.mozilla.org/en-US/firefox/new/), dll

# Pengantar

Web scraping adalah sebuah teknik untuk ekstraksi data dari sebuah halaman web. Seperti yang kita ketahui bersama halaman web adalah sebuah dokumen yang biasanya digunakan untuk menampikan data dalam bentuk tulisan, gambar dan sebagainya. Data tersebut dapat diambil bagian tertentu dengan teknik web scraping.

Selain menggunakan API seperti REST API yang disediakan, teknik web scraping seringkali digunakan untuk mendapatkan dan menapilkan data dalam bentuk atau format yang berbeda. Layaknya membuat majalah dinding atau mading.

Kesempatan kali ini kita akan belajar cara melakukan web scraping dengan JavaScript dan Node sebagai platform dasarnya. Di akhir sesi diharapkan teman-teman yang mengikuti sesi ini sudah dapat melakukan:

- Mempersiapkan proyek node dan instalasi alat bantu
- Melakukan request/pemanggilan/download halaman web yang ingin diambil datanya
- Melakukan ekstraksi (parsing) halaman HTML
- Menampilkan kembali data dalam format berbeda
- Bonus: Simpan ke database

# Bagian 1: Persiapan Proyek

```bash
  $ mkdir webscraping
  $ cd webscraping
  $ npm init -y
```

## Instalasi alat bantu

Cheerio adalah pustaka yang dapat mempermudah kita melakukan ekstraksi dan manipulasi dokumen HTML, XML dan bahasa sejenis.
Salah satu keunggulan Cheerio dibandingkan pustaka lain adalah API yang sederhana penggunaannya terutama untuk membaca, memanipulasi dan ekstraksi data
dari halaman web.

```bash
	$ npm install cheerio
```

# Bagian 2: Web Scraping Dasar

## `app.js`

```js
import * as cheerio from 'cheerio';

// Sediakan dokumen HTML
const html = '<h2 class="title">Halo Surabaya</h2>';

// Muat(load) dokumen HTML ke Cheerio
const $ = cheerio.load(html);
console.log($);

// Uraikan dokumen HTML dengan cheerio

// Ekstraksi data
```

Coba dijalankan, dan error…

```bash
$ node app.js
(node:55175) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
/Users/riza/playground/webscrape-tutorial/app.js:1
import * as cheerio from 'cheerio';
^^^^^^
SyntaxError: Cannot use import statement outside a module
	at Object.compileFunction (node:vm:352:18)
	at wrapSafe (node:internal/modules/cjs/loader:1033:15)
	at Module._compile (node:internal/modules/cjs/loader:1069:27)
	at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
	at Module.load (node:internal/modules/cjs/loader:981:32)
	at Module._load (node:internal/modules/cjs/loader:827:12)
	at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
	at node:internal/main/run_main_module:17:47
Node.js v18.3.0
```

Node secara default masih menggunakan format `require`. Agar lebih ‘modern’ mari kita tambahkan opsi dengan tipe modul yang berbeda.

## `package.json`

```json
{
	"name": "webscrape-tutorial",
	"version": "0.0.1",
	"description": "",
	"main": "index.js",
	"scripts": {
		"test": "echo \\"Error: no test specified\\" && exit 1"
	},
	"keywords": [],
	"author": "Riza Fahmi <rizafahmi@gmail.com> (<https://rizafahmi.com/>)",
	"license": "MIT",
	"dependencies": {
		"cheerio": "1.0.0-rc.12"
	},
	"type": "module"
}
```

```bash
➜ node app.js
	[Function: initialize] {
		contains: [Function: contains],
		html: [Function: html],
		merge: [Function: merge],
		parseHTML: [Function: parseHTML],
		root: [Function: root],
		text: [Function: text],
		xml: [Function: xml],
		load: [Function: load],
		_root: Document {
			parent: null,
			prev: null,
			next: null,
			startIndex: null,
			endIndex: null,
			children: [ [Element] ],
			type: 'root',
			'x-mode': 'quirks'
		},
		_options: { xml: false, decodeEntities: true },
		fn: Cheerio {}
	}
```

## Memilih elemen

Ketika data sudah dimuat, kita bisa memilih(select), menelusuri(traversing), dan memanipulasi dokumen html.

### `app.js`

```jsx
import * as cheerio from 'cheerio';

// Sediakan dokumen HTML
const html = '<h2 class="title">Halo Surabaya</h2>';

// Muat(load) dokumen HTML ke Cheerio
const $ = cheerio.load(html);

// Uraikan dokumen HTML dengan cheerio
text = $('h2.title').text();
console.log(text);

// Ekstraksi data
```

Mari gunakan halaman html beneran untuk mempelajari teknik scraping dengan lebih baik

## Mengunduh halaman web

Unduh sebuah halaman web untuk kemudian beberapa bagian akan diambil datanya dengan Cheerio.
Untuk mengunduh halaman web, bisa menggunakan `fetch()` yang sudah disediakan oleh NodeJS

### `app.js`

```jsx
import * as cheerio from 'cheerio';

async function getHtml(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.log(error);
    return;
  }
}

const html = await getHtml('https://rizafahmi.com');

const $ = cheerio.load(html);

const text = $('h1').text();
console.log(text);

const footer = $('p');
console.log(footer.attr());
console.log(footer.text());
```

## Mencari & Menelusuri elemen

List artikel

### `app.js`

```diff
import * as cheerio from 'cheerio';

async function getHtml(url) {
	try {
		const response = await fetch(url)
		const html = await response.text();
		return html
	} catch (error) {
		console.log(error)
	}
}

- const html = await getHtml('https://rizafahmi.com');
+ const html = await getHtml('https://rizafahmi.com/articles');

const $ = cheerio.load(html);

- const text = $('h1').text();
- console.log(text);

- const footer = $('p')
- console.log(footer.attr())
- console.log(footer.text())

+ const articles = $('ul').find('li').find('a')

+ for (let i = 0; i < articles.length; i += 1) {
+   console.log(`${i + 1} - ${articles[i].children[0].data}`)
+ }
```

Misalnya kita ingin mencari daftar artikel di `https://rizafahmi.com/2021/09/12/tentang-friction-log/`.
![Screenshot 2023-05-19 at 20.21.09.png](../assets/Screenshot_2023-05-19_at_20.21.09_1684502497511_0.png)

### `app.js`

```js
import * as cheerio from 'cheerio';

async function getHtml(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.log(error);
  }
}

const html = await getHtml(
  'https://rizafahmi.com/2021/09/12/tentang-friction-log/'
);

const $ = cheerio.load(html);

const footer = $('footer').find('a');
console.log(footer.length); // 10
for (let i = 0; i < footer.length; i += 1) {
  console.log(footer[i].children[0].data);
}
```

## Mencari keatas

![Screenshot 2023-05-19 at 20.28.08.png](../assets/Screenshot_2023-05-19_at_20.28.08_1684503005870_0.png)

### `app.js`

```js
import * as cheerio from 'cheerio';

async function getHtml(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.log(error);
  }
}

const html = await getHtml(
  'https://rizafahmi.com/2021/09/12/tentang-friction-log/'
);

const $ = cheerio.load(html);

const header5 = $('h5');
console.log(header5.parent().prop('tagName')); // Footer
console.log(header5.parent().parent().prop('tagName')); // Body
```

## Mencari berikutnya/sebelumnya

### `app.js`

```js
import * as cheerio from 'cheerio';

async function getHtml(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.log(error);
  }
}

const html = await getHtml('https://rizafahmi.com/articles');

const $ = cheerio.load(html);

const first_article = $('li:first');
console.log(first_article.text());

const second_article = first_article.next();
console.log(second_article.text());

const third_article = second_article.next();
console.log(third_article.text());

console.log(third_article.prev().text());
```

# Bagian 3: Client-side Scraping

Mari scrape instagram, dan ambil data jumlah follower

## `app.js`

```js
import * as cheerio from 'cheerio';

async function getHtml(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return html;
  } catch (error) {
    console.log(error);
  }
}

const html = await getHtml('https://instagram.com/rizafahmi');

const $ = cheerio.load(html);
const followers = $('.css-901oao');
console.log(followers.length); // 0
```

Karena dokumen di-render di sisi klien (web browser)
Kita butuh pustaka lain: puppeteer

```shell
$ npm i puppeteer
```

### `app.js`

```js
import puppeteer from 'puppeteer';

async function getHtml(url) {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForNetworkIdle();
    // await page.screenshot({ path: 'screenshot.png' })
    const data = await page.evaluate(function () {
      const followers = document.querySelectorAll('a[role="link"]>span>span')[2]
        .innerText;
      return followers;
    });

    await browser.close();

    return data;
  } catch (error) {
    console.log(error);
  }
}

const followers = await getHtml('https://twitter.com/rizafahmi22');

console.log(`Followers: ${followers}`);
```

# Bagian 4: Simpan ke database

## Backend/webservice

```shell
npm i express
npm i -D nodemon
```

### `server.js`

```js
import express from 'express';

const app = express();

app.get('/ping', function (req, res) {
  res.json({ status: 'OK' });
});

app.get('/followers', function (req, res) {
  res.json({
    status: 'OK',
    followers: [{ media: 'twitter', count: 5629 }],
  });
});

app.listen(3000, function () {
  console.log('Server is listening on port 3000');
});
```

### `package.json`

collapsed:: true

```diff
{
  "name": "webscrape-tutorial",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
+     "dev": "nodemon server.js"
  },
  "keywords": [],
  "author": "Riza Fahmi <rizafahmi@gmail.com> (https://rizafahmi.com/)",
  "license": "MIT",
  "dependencies": {
    "cheerio": "1.0.0-rc.12",
+     "express": "5.0.0-beta.1",
    "puppeteer": "20.2.1"
  },
  "type": "module",
+   "devDependencies": {
+     "nodemon": "2.0.22"
+   }
}

```

### `server.js`

```diff
import express from 'express';
+ import { getHtml } from './app.js';
+ import { getDB, initDB } from './db.js'

const app = express();

app.get('/ping', function(req, res) {
  res.json({ status: 'OK' });
});

app.get('/followers', function(req, res) {
  res.json({
    status: 'OK',
    followers: [
      {media: "twitter", count: 5629}
    ]
  })
});

+ app.get('/sync', async function(req, res) {
+   initDB();
+   try {
+     const followers = await getHtml('https://twitter.com/rizafahmi22');

+     const db = getDB();
+     const sql = `INSERT INTO followers (followers) VALUES (${parseInt(followers.replace(/,/g, ''))});`;
+     db.run(sql);
+     res.json({ status: "ok" });
+   } catch (error) {
+     res.json({ status: error });
+   }
+ })

app.listen(3000, function() {
  console.log('Server is listening on port 3000');
});

```

```shell
npm i sqlite3
```

### `db.js`

```js
import sqlite3 from 'sqlite3';

export function getDB() {
  return new sqlite3.Database('./followers.db');
}

export async function initDB() {
  const db = getDB();
  try {
    const sql = `CREATE TABLE IF NOT EXISTS followers (
			        id INTEGER PRIMARY KEY AUTOINCREMENT,
			        followers INTEGER,
			        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP);
			        `;

    return db.run(sql);
  } catch (error) {
    console.log(error);
    return;
  }
}
```

# Kesimpulan

- Web scraping adalah sebuah teknik untuk ekstraksi data dari sebuah halaman web
- Ada dua metode web scraping yang bisa dilakukan: server-side dan client-side
- Melakukan web scraping dengan JavaScript/Node dapat dilakukan dengan pustaka seperti Cheerio
- Juga bisa menggunakan pustaka seperti Puppeeter apabila web menggunakan metode client-side rendering atau single-page app
- Menggunakan metode kedua dengan Puppeeter lebih berat secara performa karena mengemulasi pengguna dengan web browser

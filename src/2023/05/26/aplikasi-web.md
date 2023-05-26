---
title: 'Membangun Tampilan Web dengan HTML, CSS & JS'
permalink: '/tampilan-web/'
date: 2023-05-26
tags: tulisan
layout: tulisan
---

<small style="color: rgba(252,252,252,0.5);"><em>Berikut adalah materi tertulis untuk acara workshop di Surabaya yang diselenggarakan Mei 2023.</em></small>

# Prasarat

Untuk mengikuti materi ini, teman-teman membutuhkan beberapa alat berikut:

- [NodeJS versi 18](https://nodejs.org/en) atau yang lebih baru
- Kode editor seperti [VS Code](https://code.visualstudio.com/), [Sublime](https://www.sublimetext.com/) dll
- Web browser seperti [Chrome](https://www.google.com/chrome/index.html), [Firefox](https://www.mozilla.org/en-US/firefox/new/), dll

# Persiapan

```shell
cd /Users/riza/playground/webscrape-tutorial
npm run dev
ngrok http 8080
```

Ujicoba dulu...

```shell
curl localhost:8080/followers
```

# Pengantar

Kesempatan kali ini kita akan membangun halaman web dengan HTML, CSS dan JavaScript. Dimuai dari tanpa menggunakan _framework_ hingga bertahap diubah dengan memperkenalkan _framework_. Di akhir sesi diharapkan teman-teman yang mengikuti sesi ini sudah dapat melakukan:

- Mempersiapkan proyek
- Mempersiapkan halaman HTML
- Menambahkan CSS
- Menambahkan beberapa fungsi dengan JavaScript
- Bonus: _Rewrite_ ke _framework_

# Persiapan Proyek

```shell
mkdir webapp
cd webapp
code .
```

## Halaman HTML

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <title>Web App</title>
  </head>

  <body>
    <header>
      <h1>Web Dashboard</h1>
    </header>
    <main>
      <div class="media">
        <div class="media-name">Twitter</div>
        <h2 class="media-followers">5,320</h2>
        <span class="media-label">followers</span>
      </div>
    </main>
    <footer>&copy; 2023 HACKTIV8 🦊</footer>
  </body>
</html>
```

```shell
npx live-server
```

## Menambahkan CSS

### `style.css`

```css
:root {
  --bg_main: #0a1f44;
  --text_light: #fff;
  --text_med: #53627c;
  --text_dark: #1e2432;
  --red: #ff1e42;
  --darkred: #c3112d;
  --orange: #ff8c00;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-weight: normal;
}

body {
  font: 1rem/1.3 'Roboto', sans-serif;
  background: var(--bg_main);
  color: var(--text_dark);
  padding: 50px;
}

header > h1 {
  font-weight: bold;
  font-size: 4rem;
  letter-spacing: 0.02em;
  padding: 0 0 30px 0;
  color: var(--text_light);
}

.media {
  position: relative;
  padding: 40px 10%;
  border-radius: 20px;
  background: var(--text_light);
  color: var(--text_med);
  width: 35%;
}

.media-name {
  font-size: 1.5rem;
}

.media-followers {
  font-size: 2rem;
  font-weight: bold;
}

.media-label {
  color: var(--text_med);
}

footer {
  text-align: center;
  font-size: 1rem;
  color: var(--text_light);
  margin-top: 40px;
}

footer span {
  color: var(--red);
}
```

## Menambahkan JavaScript

### `index.html`

```diff
 <!DOCTYPE html>
 <html lang="en">

 <head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <link rel="stylesheet" href="style.css">
   <title>Web App</title>
 </head>

 <body>
   <header>
     <h1>Web Dashboard</h1>
   </header>
   <main>
     <div class="media">
       <div class="media-name">Twitter</div>
       <h2 class="media-followers">5,320</h2>
       <span class="media-label">followers</span>
     </div>
   </main>
   <footer>&copy; 2023 HACKTIV8 🦊</footer>
+   <script src="app.js"></script>
 </body>

 </html>
```

## `app.js`

```js
async function getData() {
  const response = await fetch('https://blabla.ngrok.io/followers');
  const { followers } = await response.json();
  return followers;
}

async function main() {
  try {
    const followers = await getData();
    render(followers);
  } catch (error) {
    console.log(error);
  }
}

main();

function render(followers) {
  const followersEl = document.querySelector('.media-followers');
  followersEl.textContent = formatNumber(followers[0].count);
}

function formatNumber(num) {
  const formatter = new Intl.NumberFormat('id-ID');
  return formatter.format(num);
}
```

## Backend

```shell
npm init -y
npm install express@5.0.0-beta.1
```

### `package.json`

```json
{
  "name": "webapp-tutorial",
  "version": "0.0.1",
  "description": "",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "Riza Fahmi <rizafahmi@gmail.com> (https://rizafahmi.com/)",
  "license": "MIT",
  "dependencies": {
    "express": "5.0.0-beta.1"
  },
  "type": "module"
}
```

## `server.js`

```js
import express from 'express';
import path from 'path';

const app = express();

app.get('/', function (req, res) {
  res.sendFile(path.resolve('index.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

## Refactor Folder

```shell
.
├── public
│   ├── app.js
│   ├── index.html
│   └── style.css
├── package.json
├── pnpm-lock.yaml
└── server.js

```

### `server.js`

```diff
import express from 'express';
import path from 'path';

const app = express();

+ app.use(express.static('public'));

app.get('/', function (req, res) {
- res.sendFile(path.resolve('index.html'));
+ res.sendFile(path.resolve('public/index.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

## Menambahkan Media Sosial Lainnya

### Statis/Hardcoded/manual: `app.js`

```js
function render(followers) {
  const mainEl = document.querySelector('main');
  const mediaEl = document.createElement('div');
  mediaEl.className = 'media';

  const nameEl = document.createElement('div');
  nameEl.className = 'media-name';
  nameEl.textContent = followers[0].media;
  mediaEl.append(nameEl);

  const followerEl = document.createElement('h2');
  followerEl.className = 'media-followers';
  followerEl.textContent = formatNumber(followers[0].count);
  mediaEl.append(followerEl);

  const labelEl = document.createElement('span');
  labelEl.className = 'media-label';
  labelEl.textContent = 'followers';
  mediaEl.append(labelEl);

  mainEl.append(mediaEl);
}
```

### `index.html`

```diff
 <!DOCTYPE html>
 <html lang="en">

 <head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <link rel="stylesheet" href="style.css">
   <title>Web App</title>
 </head>

 <body>
   <header>
     <h1>Web Dashboard</h1>
   </header>
   <main>
-     <div class="media">
-       <div class="media-name">Twitter</div>
-       <h2 class="media-followers">5,320</h2>
-       <span class="media-label">followers</span>
-     </div>
   </main>
   <footer>&copy; 2023 HACKTIV8 🦊</footer>
 </body>

 </html>
```

## `style.css`

```diff
 :root {
   --bg_main: #0a1f44;
   --text_light: #fff;
   --text_med: #53627c;
   --text_dark: #1e2432;
   --red: #ff1e42;
   --darkred: #c3112d;
   --orange: #ff8c00;
 }

 * {
   margin: 0;
   padding: 0;
   box-sizing: border-box;
   font-weight: normal;
 }

 body {
   font: 1rem/1.3 'Roboto', sans-serif;
   background: var(--bg_main);
   color: var(--text_dark);
   padding: 50px;
 }

 header > h1 {
   font-weight: bold;
   font-size: 4rem;
   letter-spacing: 0.02em;
   padding: 0 0 30px 0;
   color: var(--text_light);
 }

 .media {
   position: relative;
   padding: 40px 10%;
   border-radius: 20px;
   background: var(--text_light);
   color: var(--text_med);
   width: 35%;
 }

 .media-name {
   font-size: 1.5rem;
+   text-transform: capitalize;
 }

 .media-followers {
   font-size: 2rem;
   font-weight: bold;
 }

 .media-label {
   color: var(--text_med);
 }

 footer {
   text-align: center;
   font-size: 1rem;
   color: var(--text_light);
   margin-top: 40px;
 }

 footer span {
   color: var(--red);
 }

```

### Dinamis: `app.js`

```js
function render(followers) {
  const mainEl = document.querySelector('main');

  for (let i = 0; i < followers.length; i += 1) {
    const mediaEl = document.createElement('div');
    mediaEl.className = 'media';

    const nameEl = document.createElement('div');
    nameEl.className = 'media-name';
    nameEl.textContent = followers[i].media;
    mediaEl.append(nameEl);

    const followerEl = document.createElement('h2');
    followerEl.className = 'media-followers';
    followerEl.textContent = formatNumber(followers[i].count);
    mediaEl.append(followerEl);

    const labelEl = document.createElement('span');
    labelEl.className = 'media-label';
    labelEl.textContent = 'followers';
    mediaEl.append(labelEl);

    mainEl.append(mediaEl);
  }
}
```

## `style.css`

```diff
 :root {
   --bg_main: #0a1f44;
   --text_light: #fff;
   --text_med: #53627c;
   --text_dark: #1e2432;
   --red: #ff1e42;
   --darkred: #c3112d;
   --orange: #ff8c00;
 }

 * {
   margin: 0;
   padding: 0;
   box-sizing: border-box;
   font-weight: normal;
 }

 body {
   font: 1rem/1.3 'Roboto', sans-serif;
   background: var(--bg_main);
   color: var(--text_dark);
   padding: 50px;
 }

 header > h1 {
   font-weight: bold;
   font-size: 4rem;
   letter-spacing: 0.02em;
   padding: 0 0 30px 0;
   color: var(--text_light);
 }

+ main {
+   display: flex;
+   flex-wrap: wrap;
+   gap: 24px;
+ }

 .media {
   position: relative;
   padding: 40px 10%;
   border-radius: 20px;
   background: var(--text_light);
   color: var(--text_med);
   width: 35%;
 }

 .media-name {
   font-size: 1.5rem;
   text-transform: capitalize;
 }

 .media-followers {
   font-size: 2rem;
   font-weight: bold;
 }

 .media-label {
   color: var(--text_med);
 }

 footer {
   text-align: center;
   font-size: 1rem;
   color: var(--text_light);
   margin-top: 40px;
 }

 footer span {
   color: var(--red);
 }

```

## Menggunakan Framework

### Rewrite ke Web Components

#### Pengantar

Adalah framework native yang didukung hampir semua browser modern.
Kode dapat lebih modular dan komponen yang dibuat dapat digunakan berkali-kali.
Performa tentu yang paling bagus karena sudah didukung web browser secara native tanpa perlu menambahkan pustaka atau kerangka kerja tambahan lagi.
Terdiri dari empat teknologi utama: ES Module, Custom Elements, Shadow DOM, dan HTML Template.

### Web Components Pertama

#### Custom Components: `footer-component.js`

```js
class FooterComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<footer>&copy; 2023 HACKTIV8 🦊</footer>`;
  }
}
customElements.define('footer-component', FooterComponent);
```

#### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <title>Web App</title>
  </head>

  <body>
    <header>
      <h1>Web Dashboard</h1>
    </header>
    <main>
      <div class="media">
        <div class="media-name">Twitter</div>
        <h2 class="media-followers" id="followers">5,320</h2>
        <span class="media-label">followers</span>
      </div>
    </main>
    <footer-component></footer-component>

    <script src="app.js"></script>
    <script src="footer-component.js"></script>
  </body>
</html>
```

### Demo Web Component

#### ES Module: `index.html`

```diff
 <!DOCTYPE html>
 <html lang="en">

 <head>
     <meta charset="UTF-8">
     <meta http-equiv="X-UA-Compatible" content="IE=edge">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <link rel="stylesheet" href="style.css">
     <title>Web App</title>
 </head>

 <body>
     <header>
         <h1>Web Dashboard</h1>
     </header>
     <div id="root">
+         <followers-count></followers-count>
     </div>

     <footer-component></footer-component>

-     <script src="app.js"></script>
+     <script src="app.js" type="module"></script>
     <script src="footer-component.js" type="module"></script>
 </body>

 </html>
```

#### `followers-count.js`

```js
export class FollowersCount extends HTMLElement {
  constructor() {
    super();
    this.data = [];
  }

  set socials(value) {
    this.data = value;
    this.render();
  }

  render() {
    this.innerHTML = `
				  	  <main>
				  	      ${this.data.map(function (social) {
                    return `
				                  <div class="media">
				                  <div class="media-name">${social.media}</div>
				                  <h2 class="media-followers">${social.count}</h2>
				                  <span class="media-label">followers</span>
				                  </div>
				                `;
                  })}
				  	  </main>
				      `;
  }
}

customElements.define('followers-count', FollowersCount);
```

#### `app.js`

```diff
 import './followers-count.js';

 async function getData() {
   const response = await fetch('http://localhost:8080/followers');
   const { followers } = await response.json();
   return followers;
 }

- function render() {
-   // ...
- }

 function formatNumber(num) {
   const formatter = new Intl.NumberFormat('id-ID');
   return formatter.format(num);
 }

 async function main() {
   const followers = await getData();
+   const followersEl = document.querySelector('followers-count');
+   followersEl.socials = followers;
-	render(render);
 }

 main();
```

## Bonus: Rewrite ke Framework lainnya

- React
- Vue
- Svelte
- Astro
- Qwik
- Lit

# Kesimpulan

- Membangun aplikasi web membutuhkan HTML, CSS dan JavaScript
- HTML dapat digunakan untuk menyusun kerangka aplikasi
- CSS digunakan untuk tampilan visual
- JavaScript digunakan untuk interaktivitas
- Pustaka/framework dibutuhkan ketika aplikasi berkembang menjadi semakin kompleks

const fs = require('fs');

const currentDate = new Date();
const month =
  currentDate.getMonth() < 10
    ? `0${currentDate.getMonth() + 1}`
    : currentDate.getMonth() + 1;
const date =
  currentDate.getDate() < 10
    ? `0${currentDate.getDate()}`
    : currentDate.getDate();

const name = process.argv[2];
const path = `src/pages/${currentDate.getFullYear()}/${month}/${date}/${name}`;


const filepath = `${path}/index.md`;
const content = `---
title: ''
date: ${currentDate.getFullYear()}-${month}-${date}
slug: '${name}'
cover: ''
---

Start your content here...

`;

if(!fs.existsSync(path)) {
  fs.mkdirSync(path, {recursive: true});
}
fs.writeFileSync(filepath, content);
console.log(`File ${filepath} created.`)

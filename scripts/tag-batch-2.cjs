#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Curated tag assignments for posts that were empty / too generic.
// Keep tags lowercase, kebab-case where possible.
const plan = {
  'src/catatan/5-kebiasaan-coding-yang-menjadikan-kamu-super-developer.md': ['catatan','produktivitas','belajar','developer'],
  'src/catatan/Agentic Coding.md': ['catatan','ai','agentic-coding','workflow','produktivitas'],
  'src/catatan/aplikasi-web.md': ['catatan','web','tutorial'],
  'src/catatan/bahasa-fungsional-elixir.md': ['catatan','elixir','functional-programming','paradigma'],
  'src/catatan/digital-garden.md': ['catatan','menulis','produktivitas','tools'],
  'src/catatan/ekosistemjs/en.md': ['catatan','javascript','frontend'],
  'src/catatan/elixir-phoenix-rest-api.md': ['catatan','elixir','phoenix','api','tutorial'],
  'src/catatan/elixir-struktur-data.md': ['catatan','elixir','struktur-data','computer-science'],
  'src/catatan/f8-san-jose-trip-day-0.md': ['catatan','komunitas','konferensi','travel'],
  'src/catatan/f8-silicon-valley-day-2.md': ['catatan','komunitas','konferensi','travel'],
  'src/catatan/f8-silicon-valley-trip-day-1.md': ['catatan','komunitas','konferensi','travel'],
  'src/catatan/f8-silicon-valley-trip-day-3-4.md': ['catatan','komunitas','konferensi','travel'],
  'src/catatan/gemini-3-review.md': ['catatan','ai','gemini','review'],
  'src/catatan/gemini-3.md': ['catatan','ai','gemini'],
  'src/catatan/gemini.md': ['catatan','ai','gemini'],
  'src/catatan/machine-learning-for-web-developers.md': ['catatan','machine-learning','web','javascript'],
  'src/catatan/menemukan-kegunaan-obsidian.md': ['catatan','tools','produktivitas','menulis'],
  'src/catatan/notebooklm.md': ['catatan','ai','tools','notebooklm'],
  'src/catatan/paradigma-pemrograman.md': ['catatan','paradigma','computer-science'],
  'src/catatan/prototipe-dengan-phoenix.md': ['catatan','elixir','phoenix','tutorial','prototyping'],
  'src/catatan/rangkuman-buku-how-to-write-a-book.md': ['catatan','menulis','rangkuman','buku'],
  'src/catatan/til-observer-di-proyek-elixir.md': ['catatan','til','elixir','otp'],
  'src/catatan/update-oktober.md': ['catatan','update','rangkuman'],
  'src/catatan/whisper.cpp.md': ['catatan','ai','audio','tools','whisper'],
};

function getFrontmatterBounds(s){
  if(!s.startsWith('---')) return null;
  const end = s.indexOf('\n---', 3);
  if(end === -1) return null;
  return { fmEnd: end + 4 };
}

function normalizeTag(t){
  return t
    .trim()
    .toLowerCase()
    .replace(/\s+/g,'-');
}

function ensureTagsList(fm, tags){
  const tagsBlock = `\ntags:\n${tags.map(t=>`  - ${t}`).join('\n')}\n`;

  // Case 1: tags: scalar on same line
  fm = fm.replace(/\ntags:\s*([^\n]+)\n/, (_m, scalar) => {
    const existing = scalar.trim();
    // if scalar was something meaningful, keep it too
    const merged = new Set([...tags]);
    if (existing && existing !== '[]') merged.add(normalizeTag(existing.replace(/^['"]|['"]$/g,'')));
    return `\ntags:\n${[...merged].map(t=>`  - ${t}`).join('\n')}\n`;
  });

  // Case 2: tags: block exists
  const reBlock = /\ntags:\n([\s\S]*?)(?=\n\w[\w-]*:|\n---\s*$)/;
  if (reBlock.test(fm)) {
    return fm.replace(reBlock, tagsBlock);
  }

  // Case 3: no tags field at all => insert before final ---
  return fm.replace(/\n---\s*$/, `${tagsBlock}---`);
}

let changed = 0;
for (const [rel, tagsRaw] of Object.entries(plan)) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    console.error('missing', rel);
    continue;
  }
  const tags = [...new Set(tagsRaw.map(normalizeTag))];
  const s = fs.readFileSync(file, 'utf8');
  const b = getFrontmatterBounds(s);
  if (!b) {
    console.error('no frontmatter', rel);
    continue;
  }
  const fm = s.slice(0, b.fmEnd);
  const rest = s.slice(b.fmEnd);
  const newFm = ensureTagsList(fm, tags);
  if (newFm !== fm) {
    fs.writeFileSync(file, newFm + rest, 'utf8');
    console.log('updated', rel, '=>', tags.join(', '));
    changed++;
  } else {
    console.log('nochange', rel);
  }
}
console.log('changed files:', changed);

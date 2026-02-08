#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const targets = [
  'src/catatan/asisten-ngoding.md',
  'src/catatan/asisten-ngoding-2.md',
  'src/catatan/asisten-ngoding-3.md',
  'src/catatan/asisten-ngoding-4.md',
  'src/catatan/asisten-ngoding-5.md',
  'src/catatan/developer-ai-teman-atau-lawan.md',
].map(p => path.join(ROOT, p));

const tagPlan = new Map([
  ['asisten-ngoding.md', ['catatan','ai','agentic-coding','workflow']],
  ['asisten-ngoding-2.md', ['catatan','ai','agentic-coding','spesifikasi']],
  ['asisten-ngoding-3.md', ['catatan','ai','agentic-coding','planning']],
  ['asisten-ngoding-4.md', ['catatan','ai','agentic-coding','desain-ui']],
  ['asisten-ngoding-5.md', ['catatan','ai','agentic-coding','coding']],
  ['developer-ai-teman-atau-lawan.md', ['catatan','ai','opini','developer']],
]);

function getFrontmatterBounds(s){
  if (!s.startsWith('---')) return null;
  const end = s.indexOf('\n---', 3);
  if (end === -1) return null;
  return { fmStart: 0, fmEnd: end + 4 };
}

function replaceTagsBlock(fm, tags){
  // Replace existing tags: block (YAML list form)
  const re = /\ntags:\n([\s\S]*?)(?=\n\w[\w-]*:|\n---\s*$)/;
  if (!re.test(fm)) {
    // Insert before final ---
    return fm.replace(/\n---\s*$/, `\ntags:\n${tags.map(t=>`  - ${t}`).join('\n')}\n---`);
  }
  return fm.replace(re, `\ntags:\n${tags.map(t=>`  - ${t}`).join('\n')}\n`);
}

let changed = 0;
for (const file of targets) {
  const base = path.basename(file);
  const tags = tagPlan.get(base);
  if (!tags) continue;

  const s = fs.readFileSync(file, 'utf8');
  const b = getFrontmatterBounds(s);
  if (!b) throw new Error(`No frontmatter in ${file}`);

  const fm = s.slice(b.fmStart, b.fmEnd);
  const rest = s.slice(b.fmEnd);
  const newFm = replaceTagsBlock(fm, tags);
  if (newFm !== fm) {
    fs.writeFileSync(file, newFm + rest, 'utf8');
    changed++;
    console.log('updated', base, '=>', tags.join(', '));
  } else {
    console.log('nochange', base);
  }
}
console.log('changed files:', changed);

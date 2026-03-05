#!/usr/bin/env node
/**
 * Create a new blog post in src/catatan/ with the catatan template.
 *
 * Usage:
 *   node scripts/new-catatan.mjs              # Creates catatan-YYYY-MM-DD.md
 *   node scripts/new-catatan.mjs "Judul"      # Creates slug from title
 *   node scripts/new-catatan.mjs "Judul" slug # Uses custom slug
 */

import fs from 'node:fs/promises';
import path from 'node:path';

function formatDate (d) {
  return d.toISOString().slice(0, 10);
}

function slugify (str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getFrontmatter (title, date) {
  return `---
title: ${title}
date: ${date}
created: ${date}
modified: ${date}
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: true
---

`;
}

async function main () {
  const today = formatDate(new Date());
  const titleArg = process.argv[2];
  const slugArg = process.argv[3];

  let title;
  let slug;

  if (titleArg) {
    title = titleArg;
    slug = slugArg || slugify(titleArg) || `catatan-${today}`;
  } else {
    title = 'Catatan';
    slug = `catatan-${today}`;
  }

  const dir = path.join(process.cwd(), 'src', 'catatan');
  const filePath = path.join(dir, `${slug}.md`);

  try {
    await fs.access(filePath);
    console.error(`Error: ${filePath} already exists`);
    process.exit(1);
  } catch {
    // File does not exist, OK to create
  }

  const content = getFrontmatter(title, today);
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`Created ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

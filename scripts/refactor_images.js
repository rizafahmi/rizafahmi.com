
import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';

// Recursive function to walk directory
function walk(dir, callback) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      const filepath = path.join(dir, file);
      fs.stat(filepath, (err, stats) => {
        if (err) throw err;
        if (stats.isDirectory()) {
          walk(filepath, callback);
        } else if (stats.isFile() && path.extname(filepath) === '.md') {
          callback(filepath);
        }
      });
    });
  });
}

// Function to replace markdown images with eleventy-img shortcode
function replaceImages(content) {
  const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;

  return content.replace(markdownImageRegex, (match, alt, src) => {
    if (match.startsWith('{%')) return match;

    // Handle title if present
    let url = src;
    let title = '';
    const parts = src.split(/\s+/);
    if (parts.length > 1) {
        url = parts[0];
        // simple title extraction, assuming it's the rest of the string
        // title = parts.slice(1).join(' ').replace(/^"(.*)"$/, '$1'); 
    }

    // Fix path
    if (url.startsWith('/assets/')) {
      url = '.' + url; 
    } else if (url.startsWith('assets/')) {
        url = './' + url;
    }
    
    // Escape quotes in alt text just in case
    const safeAlt = alt.replace(/"/g, '\\"');
    
    return `{% image "${url}", "${safeAlt}" %}`;
  });
}

console.log('Starting refactoring...');

walk(SRC_DIR, (file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading ${file}:`, err);
        return;
      }

      // Check if file has images
      if (!data.match(/!\[(.*?)\]\((.*?)\)/)) {
          return;
      }

      const newContent = replaceImages(data);

      if (data !== newContent) {
        fs.writeFile(file, newContent, 'utf8', (err) => {
          if (err) {
            console.error(`Error writing ${file}:`, err);
          } else {
            console.log(`Updated ${file}`);
          }
        });
      }
    });
});

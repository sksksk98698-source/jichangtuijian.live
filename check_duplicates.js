const fs = require('fs');
const path = require('path');

const titleMap = {};
const descMap = {};
const h1Map = {};

function scan(dir) {
  for (let item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', '.next'].includes(item)) continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      scan(full);
    } else if (item.endsWith('.html') && !full.endsWith(path.join('index', 'index.html'))) {
      // Avoid counting both x.html and x/index.html twice:
      // if x.html exists, ignore x/index.html
      const rel = path.relative('.', full).replace(/\\/g, '/');
      if (rel.endsWith('/index.html') && rel !== 'index.html') {
        const directHtml = rel.slice(0, -11) + '.html';
        if (fs.existsSync(directHtml)) continue;
      }

      const c = fs.readFileSync(full, 'utf8');
      const tm = c.match(/<title[^>]*>([^<]*)<\/title>/i);
      const dm = c.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
      const hm = c.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

      const t = tm ? tm[1].trim() : 'NO_TITLE';
      const d = dm ? dm[1].trim() : 'NO_DESC';
      const h = hm ? hm[1].replace(/<[^>]+>/g, '').trim() : 'NO_H1';

      titleMap[t] = (titleMap[t] || []);
      titleMap[t].push(rel);
      descMap[d] = (descMap[d] || []);
      descMap[d].push(rel);
      h1Map[h] = (h1Map[h] || []);
      h1Map[h].push(rel);
    }
  }
}
scan('.');

const dupTitles = Object.entries(titleMap).filter(([k, v]) => v.length > 1);
const dupDescs = Object.entries(descMap).filter(([k, v]) => v.length > 1);
const dupH1s = Object.entries(h1Map).filter(([k, v]) => v.length > 1);

console.log('Duplicate titles count:', dupTitles.length);
dupTitles.forEach(([k, v]) => console.log('Title: "' + k + '" repeated in ' + v.length + ' pages'));

console.log('\nDuplicate descs count:', dupDescs.length);
dupDescs.forEach(([k, v]) => console.log('Desc repeated in ' + v.length + ' pages: ' + k.slice(0, 50) + '...'));

console.log('\nDuplicate H1s count:', dupH1s.length);
dupH1s.forEach(([k, v]) => console.log('H1: "' + k + '" repeated in ' + v.length + ' pages'));

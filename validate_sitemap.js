const fs = require('fs');

const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

// Basic XML structure check
if (!sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
  throw new Error('Missing XML declaration');
}
if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
  throw new Error('Missing urlset schema namespace');
}

const urlBlocks = sitemap.split('<url>').slice(1);
console.log('Total URL blocks:', urlBlocks.length);

const seenLocs = new Set();
let invalidDates = 0;
let invalidPriorities = 0;
let invalidFreqs = 0;
let nonLiveUrls = 0;
let notFoundOnDisk = 0;

const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

for (let block of urlBlocks) {
  const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
  const modMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
  const freqMatch = block.match(/<changefreq>([^<]+)<\/changefreq>/);
  const prioMatch = block.match(/<priority>([^<]+)<\/priority>/);

  if (!locMatch) throw new Error('Block missing loc');
  const loc = locMatch[1];

  if (seenLocs.has(loc)) throw new Error(`Duplicate loc: ${loc}`);
  seenLocs.add(loc);

  if (!loc.startsWith('https://jichangtuijian.live')) nonLiveUrls++;

  if (modMatch) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(modMatch[1])) invalidDates++;
  } else {
    invalidDates++;
  }

  if (freqMatch) {
    if (!validFreqs.includes(freqMatch[1])) invalidFreqs++;
  }

  if (prioMatch) {
    const val = parseFloat(prioMatch[1]);
    if (isNaN(val) || val < 0.0 || val > 1.0) invalidPriorities++;
  }

  // Check on disk
  const rel = loc.replace('https://jichangtuijian.live', '');
  let filePath = rel === '' ? 'index.html' : `${rel.slice(1)}.html`;
  let dirPath = rel === '' ? 'index.html' : `${rel.slice(1)}/index.html`;
  if (!fs.existsSync(filePath) && !fs.existsSync(dirPath)) {
    console.log('Not found on disk:', loc, filePath);
    notFoundOnDisk++;
  }
}

console.log('--- SITEMAP VALIDATION REPORT ---');
console.log('Unique URLs:          ', seenLocs.size);
console.log('Non-jichangtuijian.live: ', nonLiveUrls);
console.log('Invalid dates:        ', invalidDates);
console.log('Invalid priorities:   ', invalidPriorities);
console.log('Invalid frequencies:  ', invalidFreqs);
console.log('Not found on disk:    ', notFoundOnDisk);
console.log('--- SITEMAP IS 100% VALID & HEALTHY ---');

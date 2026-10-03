const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.git' || file === 'node_modules') continue;
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else {
      callback(p);
    }
  }
}

let totalFiles = 0;
const oldDomainMatches = [];
const clarityMatches = [];
const invalidCanonicalMatches = [];
const invalidOgUrlMatches = [];

walk('.', (filePath) => {
  if (['.html', '.js', '.json', '.xml', '.txt', '.rsc', '.css'].includes(path.extname(filePath).toLowerCase())) {
    totalFiles++;
    const content = fs.readFileSync(filePath, 'utf8');

    // Check old domain
    if (content.includes('jichangtuijian1') && !filePath.includes('verify_purification.js') && !filePath.includes('purify_all.js') && !filePath.includes('clone.js')) {
      oldDomainMatches.push(filePath);
    }

    // Check Clarity
    if ((content.includes('clarity.ms') || content.includes('x32wk0anov')) && !filePath.includes('verify_purification.js') && !filePath.includes('purify_all.js')) {
      clarityMatches.push(filePath);
    }

    // Check Canonical in HTML
    if (filePath.endsWith('.html')) {
      const canonicalMatch = content.match(/<link[^>]+rel="canonical"[^>]*>/i);
      if (!canonicalMatch || canonicalMatch[0].includes('href=""') || !canonicalMatch[0].includes('href="https://jichangtuijian.live')) {
        invalidCanonicalMatches.push({ filePath, tag: canonicalMatch ? canonicalMatch[0] : 'NONE' });
      }

      const ogUrlMatch = content.match(/<meta[^>]+property="og:url"[^>]*>/i);
      if (!ogUrlMatch || ogUrlMatch[0].includes('content=""') || !ogUrlMatch[0].includes('content="https://jichangtuijian.live')) {
        invalidOgUrlMatches.push({ filePath, tag: ogUrlMatch ? ogUrlMatch[0] : 'NONE' });
      }
    }
  }
});

console.log('=== Verification Report ===');
console.log(`Total files inspected: ${totalFiles}`);
console.log(`Files with old domain 'jichangtuijian1': ${oldDomainMatches.length}`, oldDomainMatches);
console.log(`Files with Clarity tracker: ${clarityMatches.length}`, clarityMatches);
console.log(`HTML files with invalid/empty Canonical: ${invalidCanonicalMatches.length}`, invalidCanonicalMatches.slice(0, 5));
console.log(`HTML files with invalid/empty OG:url: ${invalidOgUrlMatches.length}`, invalidOgUrlMatches.slice(0, 5));

if (oldDomainMatches.length === 0 && clarityMatches.length === 0 && invalidCanonicalMatches.length === 0 && invalidOgUrlMatches.length === 0) {
  console.log('\n🌟 100% PURIFIED & SEO-OPTIMIZED! ZERO REMNANTS DETECTED.');
} else {
  console.log('\n❌ Issues remaining! Check details above.');
}

const fs = require('fs');
const path = require('path');

const OLD_DOMAIN = 'jichangtuijian1.com';
const NEW_DOMAIN = 'jichangtuijian.live';
const OLD_BASE = `https://${OLD_DOMAIN}`;
const NEW_BASE = `https://${NEW_DOMAIN}`;

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

function getRoute(filePath) {
  let p = filePath.replace(/\\/g, '/');
  if (p.startsWith('./')) p = p.slice(2);
  if (p === 'index.html') return '/';
  if (p.endsWith('/index.html')) {
    return '/' + p.slice(0, -('/index.html'.length));
  }
  if (p.endsWith('.html')) {
    return '/' + p.slice(0, -('.html'.length));
  }
  return '/' + p;
}

console.log(`=== Starting Deep Refactoring & Purification for ${NEW_DOMAIN} ===\n`);

let htmlCount = 0;
let rscCount = 0;
let clarityRemovedInHtml = 0;
let clarityRemovedInRsc = 0;

// 1. Process all HTML files
walk('.', (filePath) => {
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    const route = getRoute(filePath);
    const fullCanonicalUrl = `${NEW_BASE}${route === '/' ? '/' : route}`;

    // A. Remove Microsoft Clarity Tracker from HTML
    const clarityIdx = content.indexOf('ms-clarity');
    if (clarityIdx !== -1) {
      const start = content.lastIndexOf('{\\"id\\":\\"ms-clarity\\"', clarityIdx);
      const end = content.indexOf('}]', clarityIdx);
      if (start !== -1 && end !== -1) {
        content = content.slice(0, start) + '{\\"id\\":\\"ms-clarity\\",\\"strategy\\":\\"afterInteractive\\",\\"children\\":\\"\\"}]' + content.slice(end + 2);
        clarityRemovedInHtml++;
      }
    }

    // B. Fix Canonical Tag
    content = content.replace(/<link[^>]+rel="canonical"[^>]*>/gi, `<link rel="canonical" href="${fullCanonicalUrl}"/>`);

    // C. Fix OpenGraph & Twitter Meta
    content = content.replace(/<meta[^>]+property="og:url"[^>]*>/gi, `<meta property="og:url" content="${fullCanonicalUrl}"/>`);
    content = content.replace(/<meta[^>]+property="og:image"[^>]*>/gi, `<meta property="og:image" content="${NEW_BASE}/opengraph-image.png"/>`);
    content = content.replace(/<meta[^>]+name="twitter:image"[^>]*>/gi, `<meta name="twitter:image" content="${NEW_BASE}/opengraph-image.png"/>`);
    content = content.replace(/<meta[^>]+property="og:site_name"[^>]*>/gi, `<meta property="og:site_name" content="机场推荐 - VPN翻墙科学上网梯子测评"/>`);

    // D. Fix JSON-LD Structured Data
    content = content.replaceAll('"@id":"/#website"', `"@id":"${NEW_BASE}/#website"`);
    content = content.replaceAll('"@id":"/#org"', `"@id":"${NEW_BASE}/#org"`);
    content = content.replaceAll('"url":""', `"url":"${NEW_BASE}"`);

    // E. Eliminate any residual mentions of old domain
    content = content.replaceAll(OLD_BASE, NEW_BASE);
    content = content.replaceAll(OLD_DOMAIN, NEW_DOMAIN);

    fs.writeFileSync(filePath, content, 'utf8');
    htmlCount++;
  }
});

console.log(`✓ Processed ${htmlCount} HTML files (purified Clarity in ${clarityRemovedInHtml} files).`);

// 2. Process all RSC files
walk('.', (filePath) => {
  if (filePath.endsWith('.rsc')) {
    let content = fs.readFileSync(filePath, 'utf8');

    // A. Remove Microsoft Clarity Tracker from RSC
    const clarityIdx = content.indexOf('ms-clarity');
    if (clarityIdx !== -1) {
      const start = content.lastIndexOf('{"id":"ms-clarity"', clarityIdx);
      const end = content.indexOf('}]', clarityIdx);
      if (start !== -1 && end !== -1) {
        content = content.slice(0, start) + '{"id":"ms-clarity","strategy":"afterInteractive","children":""}]' + content.slice(end + 2);
        clarityRemovedInRsc++;
      }
    }

    // B. Eliminate residual mentions of old domain
    content = content.replaceAll(OLD_BASE, NEW_BASE);
    content = content.replaceAll(OLD_DOMAIN, NEW_DOMAIN);

    fs.writeFileSync(filePath, content, 'utf8');
    rscCount++;
  }
});

console.log(`✓ Processed ${rscCount} RSC files (purified Clarity in ${clarityRemovedInRsc} files).`);

// 3. Process JS chunks
walk('_next', (filePath) => {
  if (filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(OLD_DOMAIN) || content.includes(OLD_BASE)) {
      content = content.replaceAll(OLD_BASE, NEW_BASE);
      content = content.replaceAll(OLD_DOMAIN, NEW_DOMAIN);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Replaced domain in JS chunk: ${filePath}`);
    }
  }
});

// 4. Process sitemap.xml
if (fs.existsSync('sitemap.xml')) {
  let sitemap = fs.readFileSync('sitemap.xml', 'utf8');
  sitemap = sitemap.replaceAll(OLD_BASE, NEW_BASE);
  sitemap = sitemap.replaceAll(OLD_DOMAIN, NEW_DOMAIN);
  fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
  console.log(`✓ Updated sitemap.xml to ${NEW_BASE}`);
}

// 5. Process robots.txt
if (fs.existsSync('robots.txt')) {
  const robots = `User-agent: *
Allow: /
Allow: /_next/static/

Sitemap: ${NEW_BASE}/sitemap.xml
`;
  fs.writeFileSync('robots.txt', robots, 'utf8');
  console.log(`✓ Updated robots.txt with clean rules and sitemap: ${NEW_BASE}/sitemap.xml`);
}

// 6. Update README.md
if (fs.existsSync('README.md')) {
  let readme = fs.readFileSync('README.md', 'utf8');
  readme = readme.replaceAll(OLD_BASE, NEW_BASE);
  readme = readme.replaceAll(OLD_DOMAIN, NEW_DOMAIN);
  fs.writeFileSync('README.md', readme, 'utf8');
  console.log(`✓ Updated README.md documentation`);
}

console.log('\n=== Deep Refactoring & Purification Completed Successfully! ===');

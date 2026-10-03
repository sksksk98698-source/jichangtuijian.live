const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://jichangtuijian.live';
const diskPages = new Map();

function getCleanUrl(relPath) {
  let u = relPath.replace(/\\/g, '/');
  if (u.endsWith('/index.html')) {
    u = u.slice(0, -'/index.html'.length);
  } else if (u.endsWith('.html')) {
    u = u.slice(0, -'.html'.length);
  }
  if (u === 'index') u = '';
  return u === '' ? '/' : `/${u}`;
}

function scan(dir) {
  for (let f of fs.readdirSync(dir)) {
    if (f === '.git' || f === 'node_modules' || f === '_next') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== 'page') scan(full);
    } else if (f.endsWith('.html') && !f.includes('/page/')) {
      const rel = path.relative('.', full);
      const cleanUrl = getCleanUrl(rel);

      if (cleanUrl === '/404' || cleanUrl.includes('/page/')) continue;

      if (!diskPages.has(cleanUrl)) {
        const content = fs.readFileSync(full, 'utf8');

        // Extract lastmod
        let lastmod = null;
        const schemaMod = content.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/);
        if (schemaMod) {
          lastmod = schemaMod[1];
        } else {
          const timeMatches = content.match(/<time dateTime="(\d{4}-\d{2}-\d{2})">/g);
          if (timeMatches && timeMatches.length > 0) {
            const lastTime = timeMatches[timeMatches.length - 1];
            const d = lastTime.match(/\d{4}-\d{2}-\d{2}/);
            if (d) lastmod = d[0];
          }
        }

        // Priority & changefreq
        let priority = '0.7';
        let changefreq = 'weekly';
        let sortOrder = 40;

        if (cleanUrl === '/') {
          priority = '1.0';
          changefreq = 'daily';
          lastmod = '2026-10-03';
          sortOrder = 10;
        } else if ([
          '/pianyijichang', '/iplc', '/gaoduanjichang', '/anliangfufei',
          '/dailiruanjian', '/guowaivpn', '/huiguo', '/paihangbang'
        ].includes(cleanUrl)) {
          priority = '0.9';
          changefreq = 'daily';
          lastmod = '2026-10-03';
          sortOrder = 20;
        } else if ([
          '/xieyi', '/hysteria2', '/vless', '/vless-clash', '/shadowsocks',
          '/trojan', '/reality', '/xieyi-duibi', '/beilv', '/fangpian', '/baxianchao'
        ].includes(cleanUrl)) {
          priority = '0.8';
          changefreq = 'weekly';
          lastmod = lastmod || '2026-10-01';
          sortOrder = 30;
        } else if ([
          '/about', '/methodology', '/disclosure'
        ].includes(cleanUrl)) {
          priority = '0.6';
          changefreq = 'monthly';
          lastmod = '2026-10-03';
          sortOrder = 50;
        } else if ([
          '/privacy', '/terms'
        ].includes(cleanUrl)) {
          priority = '0.4';
          changefreq = 'monthly';
          lastmod = '2026-10-03';
          sortOrder = 60;
        } else {
          // Review article
          priority = '0.7';
          changefreq = 'weekly';
          if (!lastmod) lastmod = '2026-10-01';
          sortOrder = 40;
        }

        diskPages.set(cleanUrl, {
          url: cleanUrl,
          lastmod,
          changefreq,
          priority,
          sortOrder
        });
      }
    }
  }
}

scan('.');

// Sort pages logically
const sortedPages = Array.from(diskPages.values()).sort((a, b) => {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.url.localeCompare(b.url);
});

// Build XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

for (let p of sortedPages) {
  const loc = p.url === '/' ? DOMAIN : `${DOMAIN}${p.url}`;
  xml += '  <url>\n';
  xml += `    <loc>${loc}</loc>\n`;
  xml += `    <lastmod>${p.lastmod}</lastmod>\n`;
  xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
  xml += `    <priority>${p.priority}</priority>\n`;
  xml += '  </url>\n';
}

xml += '</urlset>\n';

fs.writeFileSync('sitemap.xml', xml, 'utf8');
console.log(`Optimized sitemap.xml generated with ${sortedPages.length} canonical URLs!`);

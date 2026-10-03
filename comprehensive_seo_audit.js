const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DOMAIN = 'https://jichangtuijian.live';

// 1. Find all HTML files
function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (let file of list) {
    if (file === 'node_modules' || file === '.git' || file === '.next') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getAllHtmlFiles(ROOT);
console.log(`Found ${htmlFiles.length} HTML files.`);

// Data structures for auditing
const audit = {
  canonicalErrors: [],
  noindexPages: [],
  titles: {},
  descriptions: {},
  h1s: {},
  wordCounts: [],
  thinContent500: [],
  thinContent300: [],
  headingPatterns: {},
  outboundLinks: [],
  untaggedOutboundLinks: [],
  internalLinks: [],
  emptyLinks: [],
  brokenInternalLinks: [],
  schemas: {},
  schemaErrors: [],
  authorCoverage: { withAuthor: 0, withoutAuthor: 0, pages: [] },
  verificationDates: { found: 0, missing: 0 },
  pageDepths: {},
  allInternalRoutes: new Set(),
};

// Map of relative path -> route
function fileToRoute(filePath) {
  let rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -11);
  if (rel.endsWith('.html')) return '/' + rel.slice(0, -5);
  return '/' + rel;
}

// Populate all valid internal routes
const routeToFile = new Map();
for (let f of htmlFiles) {
  const r = fileToRoute(f);
  routeToFile.set(r, f);
  audit.allInternalRoutes.add(r);
}

// Audit each HTML file
for (let filePath of htmlFiles) {
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const route = fileToRoute(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Canonical
  const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                         content.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (canonicalMatch) {
    const canonicalHref = canonicalMatch[1];
    let expected = DOMAIN + (route === '/' ? '/' : route);
    if (canonicalHref !== expected) {
      audit.canonicalErrors.push({ file: relPath, route, canonicalHref, expected });
    }
  } else {
    audit.canonicalErrors.push({ file: relPath, route, canonicalHref: 'NONE', expected: DOMAIN + route });
  }

  // 2. Noindex
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex[^"']*["']/i.test(content)) {
    audit.noindexPages.push({ file: relPath, route });
  }

  // 3. Title
  const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'NO_TITLE';
  audit.titles[title] = (audit.titles[title] || []);
  audit.titles[title].push(relPath);

  // 4. Description
  const descMatch = content.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const desc = descMatch ? descMatch[1].trim() : 'NO_DESC';
  audit.descriptions[desc] = (audit.descriptions[desc] || []);
  audit.descriptions[desc].push(relPath);

  // 5. H1
  const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NO_H1';
  audit.h1s[h1] = (audit.h1s[h1] || []);
  audit.h1s[h1].push(relPath);

  // 6. Word count (extract main / body text)
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let text = '';
  if (bodyMatch) {
    text = bodyMatch[1]
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const charCount = text.replace(/\s/g, '').length;
  audit.wordCounts.push({ file: relPath, route, charCount });
  if (charCount < 300) {
    audit.thinContent300.push({ file: relPath, route, charCount });
  } else if (charCount < 500) {
    audit.thinContent500.push({ file: relPath, route, charCount });
  }

  // 7. Heading patterns (H2 sequence)
  const h2Matches = [...content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  if (h2Matches.length > 0) {
    const patternKey = h2Matches.map(h => h.replace(/^[^\s]+/, '[BRAND]')).slice(0, 4).join(' -> ');
    audit.headingPatterns[patternKey] = (audit.headingPatterns[patternKey] || 0) + 1;
  }

  // 8. Outbound & Internal Links
  const linkMatches = [...content.matchAll(/<a\b([^>]*)href=["']([^"']*)["']([^>]*)>/gi)];
  for (let lm of linkMatches) {
    const attrs = (lm[1] + ' ' + lm[3]);
    const href = lm[2].trim();
    if (!href || href === '#') {
      audit.emptyLinks.push({ file: relPath, href });
      continue;
    }

    if (href.startsWith('http://') || href.startsWith('https://')) {
      const urlObj = new URL(href);
      if (urlObj.hostname !== 'jichangtuijian.live' && urlObj.hostname !== 'localhost') {
        const isCommercial = /aff|ref|code|register|order|cart|buy|sub|shop/i.test(href) ||
                             urlObj.hostname.includes('aff') ||
                             urlObj.hostname.includes('flycat') ||
                             urlObj.hostname.includes('gsyvip') ||
                             urlObj.hostname.includes('xingdaomeng') ||
                             urlObj.hostname.includes('v2yun') ||
                             urlObj.hostname.includes('jlyvip') ||
                             urlObj.hostname.includes('yuzoucloud') ||
                             urlObj.hostname.includes('invisible') ||
                             urlObj.hostname.includes('firefly') ||
                             urlObj.hostname.includes('wescloud') ||
                             urlObj.hostname.includes('protonvpn') ||
                             urlObj.hostname.includes('expressvpn') ||
                             urlObj.hostname.includes('surfshark') ||
                             urlObj.hostname.includes('nordvpn') ||
                             urlObj.hostname.includes('cyberghost') ||
                             urlObj.hostname.includes('cejichang');
        
        const relMatch = attrs.match(/rel=["']([^"']*)["']/i);
        const rel = relMatch ? relMatch[1] : '';
        const hasNofollow = rel.includes('nofollow');
        const hasSponsored = rel.includes('sponsored');

        audit.outboundLinks.push({ file: relPath, href, rel, isCommercial });
        if (isCommercial && (!hasNofollow || !hasSponsored)) {
          audit.untaggedOutboundLinks.push({ file: relPath, href, rel, missing: (!hasNofollow ? 'nofollow ' : '') + (!hasSponsored ? 'sponsored' : '') });
        }
      }
    } else if (href.startsWith('/') || !href.includes(':')) {
      let cleanTarget = href.split('?')[0].split('#')[0];
      if (cleanTarget.endsWith('/') && cleanTarget !== '/') cleanTarget = cleanTarget.slice(0, -1);
      if (!cleanTarget) cleanTarget = '/';
      
      audit.internalLinks.push({ from: route, to: cleanTarget });
      if (!audit.allInternalRoutes.has(cleanTarget) && !cleanTarget.startsWith('/_next/') && !cleanTarget.startsWith('/icon.') && !cleanTarget.startsWith('/favicon.')) {
        audit.brokenInternalLinks.push({ file: relPath, href, cleanTarget });
      }
    }
  }

  // 9. Schema.org JSON-LD
  const jsonLdMatches = [...content.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (let jm of jsonLdMatches) {
    try {
      const data = JSON.parse(jm[1]);
      const processSchema = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        const type = obj['@type'] || (obj['@graph'] ? 'Graph' : 'Unknown');
        audit.schemas[type] = (audit.schemas[type] || 0) + 1;

        if (obj['@type'] === 'BreadcrumbList' && Array.isArray(obj.itemListElement)) {
          for (let item of obj.itemListElement) {
            if (item.item && typeof item.item === 'string' && !item.item.startsWith('https://')) {
              audit.schemaErrors.push({ file: relPath, type: 'BreadcrumbList relative URL', item: item.item });
            }
          }
        }
        if (obj.aggregateRating) {
          audit.schemaErrors.push({ file: relPath, type: 'aggregateRating found', value: obj.aggregateRating });
        }
        if (obj['@graph'] && Array.isArray(obj['@graph'])) {
          obj['@graph'].forEach(processSchema);
        }
      };
      processSchema(data);
    } catch (e) {
      audit.schemaErrors.push({ file: relPath, type: 'JSON-LD parse error', error: e.message });
    }
  }

  // 10. E-E-A-T Author & Verification date
  if (route.includes('/pianyijichang/') || route.includes('/iplc/') || route.includes('/gaoduanjichang/') || route.includes('/anliangfufei/')) {
    if (content.includes('林浩') || content.includes('author') || content.includes('测评员') || content.includes('撰写')) {
      audit.authorCoverage.withAuthor++;
    } else {
      audit.authorCoverage.withoutAuthor++;
      audit.authorCoverage.pages.push(relPath);
    }

    if (/202[0-9]-[0-1][0-9]-[0-3][0-9]/.test(content) || content.includes('核实日期') || content.includes('更新时间') || content.includes('实测')) {
      audit.verificationDates.found++;
    } else {
      audit.verificationDates.missing++;
    }
  }
}

// 11. BFS Graph for Click Depth & Orphan Pages
const adj = new Map();
for (let r of audit.allInternalRoutes) {
  adj.set(r, new Set());
}
for (let link of audit.internalLinks) {
  if (adj.has(link.from) && adj.has(link.to)) {
    adj.get(link.from).add(link.to);
  }
}

const depths = new Map();
const queue = ['/'];
depths.set('/', 0);

while (queue.length > 0) {
  const curr = queue.shift();
  const d = depths.get(curr);
  const neighbors = adj.get(curr) || new Set();
  for (let n of neighbors) {
    if (!depths.has(n)) {
      depths.set(n, d + 1);
      queue.push(n);
    }
  }
}

const orphanPages = [];
const depthDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, '4+': 0 };
for (let r of audit.allInternalRoutes) {
  if (!depths.has(r)) {
    orphanPages.push(r);
  } else {
    const d = depths.get(r);
    if (d <= 3) depthDistribution[d]++;
    else depthDistribution['4+']++;
  }
}

console.log('--- AUDIT COMPLETE ---');
console.log('Canonical errors:', audit.canonicalErrors.length);
console.log('Noindex pages:', audit.noindexPages.length);
console.log('Broken internal links:', audit.brokenInternalLinks.length);
console.log('Untagged outbound commercial links:', audit.untaggedOutboundLinks.length);
console.log('Thin content < 300:', audit.thinContent300.length);
console.log('Thin content < 500:', audit.thinContent500.length);
console.log('Click depth distribution:', depthDistribution);
console.log('Orphan pages:', orphanPages.length);

fs.writeFileSync('audit_results.json', JSON.stringify({
  canonicalErrors: audit.canonicalErrors,
  noindexPages: audit.noindexPages,
  brokenInternalLinks: audit.brokenInternalLinks,
  untaggedOutboundLinks: audit.untaggedOutboundLinks,
  thinContent300: audit.thinContent300,
  thinContent500: audit.thinContent500,
  depthDistribution,
  orphanPages,
  schemas: audit.schemas,
  schemaErrors: audit.schemaErrors,
  authorCoverage: audit.authorCoverage,
  verificationDates: audit.verificationDates,
  wordCounts: {
    min: Math.min(...audit.wordCounts.map(w => w.charCount)),
    max: Math.max(...audit.wordCounts.map(w => w.charCount)),
    avg: Math.round(audit.wordCounts.reduce((a, b) => a + b.charCount, 0) / audit.wordCounts.length),
  },
  titlesCount: Object.keys(audit.titles).length,
  descriptionsCount: Object.keys(audit.descriptions).length,
  h1sCount: Object.keys(audit.h1s).length,
}, null, 2));

console.log('Results written to audit_results.json');

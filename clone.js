const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://jichangtuijian1.com';
const ROOT_DIR = __dirname;
const CONCURRENCY = 8;

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          ...options.headers,
        },
      });
      if (res.ok) return res;
      if (res.status === 404) return null;
      console.warn(`[WARN] HTTP ${res.status} for ${url}, attempt ${i + 1}/${retries}`);
    } catch (err) {
      console.warn(`[ERR] Fetch failed for ${url}: ${err.message}, attempt ${i + 1}/${retries}`);
    }
    await sleep(500 * (i + 1));
  }
  return null;
}

async function runQueue(items, workerFn, concurrency = CONCURRENCY) {
  let index = 0;
  let active = 0;
  let completed = 0;

  return new Promise((resolve) => {
    function next() {
      if (index >= items.length && active === 0) {
        return resolve();
      }
      while (active < concurrency && index < items.length) {
        const item = items[index++];
        active++;
        workerFn(item, index, items.length)
          .catch((err) => console.error(`Error processing item:`, err))
          .finally(() => {
            active--;
            completed++;
            next();
          });
      }
    }
    next();
  });
}

const discoveredAssets = new Set();

function addAsset(rawAssetUrl) {
  if (!rawAssetUrl) return;
  let cleanUrl = rawAssetUrl.replace(/\\/g, '').replace(/["']/g, '').trim();
  if (cleanUrl.startsWith('//')) cleanUrl = 'https:' + cleanUrl;
  
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    if (cleanUrl.startsWith(BASE_URL)) {
      cleanUrl = cleanUrl.slice(BASE_URL.length);
    } else {
      return;
    }
  }

  if (cleanUrl.startsWith('/')) {
    discoveredAssets.add(cleanUrl);
  }
}

async function main() {
  console.log('=== Starting Full Site Clone: https://jichangtuijian1.com ===');

  // 1. Fetch sitemap.xml
  console.log('\n[1/6] Fetching sitemap.xml...');
  const sitemapRes = await fetchWithRetry(`${BASE_URL}/sitemap.xml`);
  let sitemapUrls = [];
  if (sitemapRes) {
    const sitemapXml = await sitemapRes.text();
    fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
    const matches = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
    sitemapUrls = matches;
    console.log(`✓ Parsed sitemap.xml with ${sitemapUrls.length} URLs`);
  } else {
    throw new Error('Failed to fetch sitemap.xml');
  }

  // 2. Fetch robots.txt and icon.svg
  console.log('\n[2/6] Fetching robots.txt & icon.svg...');
  const robotsRes = await fetchWithRetry(`${BASE_URL}/robots.txt`);
  if (robotsRes) {
    const txt = await robotsRes.text();
    fs.writeFileSync(path.join(ROOT_DIR, 'robots.txt'), txt, 'utf8');
    console.log('✓ Saved robots.txt');
  }

  const iconRes = await fetchWithRetry(`${BASE_URL}/icon.svg`);
  if (iconRes) {
    const iconBuf = Buffer.from(await iconRes.arrayBuffer());
    fs.writeFileSync(path.join(ROOT_DIR, 'icon.svg'), iconBuf);
    fs.writeFileSync(path.join(ROOT_DIR, 'favicon.ico'), iconBuf);
    console.log('✓ Saved icon.svg & favicon.ico');
  }

  // 3. Fetch search index API
  console.log('\n[3/6] Fetching /api/search-index...');
  const searchRes = await fetchWithRetry(`${BASE_URL}/api/search-index`);
  if (searchRes) {
    const searchJson = await searchRes.text();
    const apiDir = path.join(ROOT_DIR, 'api');
    if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
    fs.writeFileSync(path.join(apiDir, 'search-index'), searchJson, 'utf8');
    fs.writeFileSync(path.join(apiDir, 'search-index.json'), searchJson, 'utf8');
    console.log('✓ Saved /api/search-index and /api/search-index.json');
  }

  // 4. Generate all page paths
  const pagePaths = new Set();
  for (const fullUrl of sitemapUrls) {
    let p = fullUrl.replace(BASE_URL, '');
    if (!p.startsWith('/')) p = '/' + p;
    pagePaths.add(p);
  }

  // Add all pagination paths
  for (let i = 2; i <= 32; i++) pagePaths.add(`/page/${i}`);
  for (let i = 2; i <= 18; i++) pagePaths.add(`/pianyijichang/page/${i}`);
  for (let i = 2; i <= 8; i++) pagePaths.add(`/iplc/page/${i}`);
  pagePaths.add('/gaoduanjichang/page/2');
  pagePaths.add('/anliangfufei/page/2');
  pagePaths.add('/404');

  const pagePathList = Array.from(pagePaths);
  console.log(`\n[4/6] Downloading ${pagePathList.length} HTML pages and RSC streams...`);

  let pagesCount = 0;

  await runQueue(pagePathList, async (pagePath) => {
    const pageUrl = `${BASE_URL}${pagePath}`;
    
    // Fetch HTML
    const res = await fetchWithRetry(pageUrl);
    if (!res) {
      console.warn(`[WARN] Page not found: ${pagePath}`);
      return;
    }
    let html = await res.text();

    // Extract asset references before modifying
    const nextMatches = Array.from(html.matchAll(/["'](\/_next\/[^"'\s>]+)["']/g)).map(m => m[1]);
    nextMatches.forEach(m => addAsset(m));

    const iconMatches = Array.from(html.matchAll(/["'](\/[^"'\s>]+\.svg[^"'\s>]*)["']/g)).map(m => m[1]);
    iconMatches.forEach(m => addAsset(m));

    // Rewriting:
    // A. Clean domain references
    html = html.replaceAll('https://jichangtuijian1.com/', '/');
    html = html.replaceAll('https://jichangtuijian1.com', '');

    // B. Rewrite query pagination to static path pagination
    html = html.replace(/href="\/\?page=1"/g, 'href="/"');
    html = html.replace(/href="\/\?page=(\d+)"/g, 'href="/page/$1"');
    html = html.replace(/href="\/([a-zA-Z0-9_\-]+)\?page=1"/g, 'href="/$1"');
    html = html.replace(/href="\/([a-zA-Z0-9_\-]+)\?page=(\d+)"/g, 'href="/$1/page/$2"');

    // C. Clean ?dpl= query params from static asset tags in HTML
    html = html.replace(/(\/_next\/static\/[^"'?>]+)\?dpl=[^"'\s>]+/g, '$1');
    html = html.replace(/\/icon\.svg\?[^"'\s>]+/g, '/icon.svg');

    // Save files
    let relPath = pagePath;
    if (relPath.startsWith('/')) relPath = relPath.slice(1);

    let htmlFilePath;
    let fallbackHtmlFilePath = null;
    let rscFilePath;
    let fallbackRscFilePath = null;

    if (!relPath || relPath === '') {
      htmlFilePath = path.join(ROOT_DIR, 'index.html');
      rscFilePath = path.join(ROOT_DIR, 'index.rsc');
    } else if (relPath === '404') {
      htmlFilePath = path.join(ROOT_DIR, '404.html');
      rscFilePath = path.join(ROOT_DIR, '404.rsc');
    } else {
      htmlFilePath = path.join(ROOT_DIR, relPath, 'index.html');
      fallbackHtmlFilePath = path.join(ROOT_DIR, `${relPath}.html`);
      rscFilePath = path.join(ROOT_DIR, relPath, 'index.rsc');
      fallbackRscFilePath = path.join(ROOT_DIR, `${relPath}.rsc`);
    }

    ensureDir(htmlFilePath);
    fs.writeFileSync(htmlFilePath, html, 'utf8');

    if (fallbackHtmlFilePath) {
      ensureDir(fallbackHtmlFilePath);
      fs.writeFileSync(fallbackHtmlFilePath, html, 'utf8');
    }

    // Fetch RSC payload
    const rscRes = await fetchWithRetry(pageUrl, {
      headers: {
        'RSC': '1',
      },
    });
    if (rscRes) {
      let rscText = await rscRes.text();
      // Clean domain references in RSC
      rscText = rscText.replaceAll('https://jichangtuijian1.com/', '/');
      rscText = rscText.replaceAll('https://jichangtuijian1.com', '');
      rscText = rscText.replace(/(\/_next\/static\/[^"'?>]+)\?dpl=[^"'\s>]+/g, '$1');

      ensureDir(rscFilePath);
      fs.writeFileSync(rscFilePath, rscText, 'utf8');
      if (fallbackRscFilePath) {
        ensureDir(fallbackRscFilePath);
        fs.writeFileSync(fallbackRscFilePath, rscText, 'utf8');
      }
    }

    pagesCount++;
    if (pagesCount % 30 === 0 || pagesCount === pagePathList.length) {
      console.log(`[${pagesCount}/${pagePathList.length}] Saved ${pagePath}`);
    }
  }, CONCURRENCY);

  console.log(`✓ All ${pagesCount} HTML and RSC pages downloaded successfully.`);

  // 5. Download all assets recursively
  console.log('\n[5/6] Downloading static assets (CSS, JS, Fonts, Media)...');
  const downloadedAssets = new Set();
  const assetQueue = Array.from(discoveredAssets);

  while (assetQueue.length > 0) {
    const currentBatch = assetQueue.splice(0, assetQueue.length);

    await runQueue(currentBatch, async (rawAssetPath) => {
      const cleanPath = rawAssetPath.split('?')[0];
      if (downloadedAssets.has(cleanPath)) return;
      downloadedAssets.add(cleanPath);

      const assetUrl = `${BASE_URL}${rawAssetPath}`;
      const res = await fetchWithRetry(assetUrl);
      if (!res) {
        console.warn(`[WARN] Asset not found: ${rawAssetPath}`);
        return;
      }

      const diskPath = path.join(ROOT_DIR, cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath);
      ensureDir(diskPath);

      if (cleanPath.endsWith('.css')) {
        let cssText = await res.text();
        // Clean ?dpl= in CSS
        cssText = cssText.replace(/(\?dpl=[^"'\)]+)/g, '');

        // Find url(...) in CSS
        const cssUrls = Array.from(cssText.matchAll(/url\((['"]?)([^'"\)]+)\1\)/gi)).map(m => m[2]);
        for (const u of cssUrls) {
          if (u.startsWith('data:')) continue;
          let resolved = u;
          if (u.startsWith('../')) {
            const cssDir = path.posix.dirname(cleanPath);
            resolved = path.posix.normalize(path.posix.join(cssDir, u));
          } else if (!u.startsWith('/')) {
            const cssDir = path.posix.dirname(cleanPath);
            resolved = path.posix.normalize(path.posix.join(cssDir, u));
          }
          const cleanResolved = resolved.split('?')[0];
          if (!downloadedAssets.has(cleanResolved)) {
            assetQueue.push(resolved);
          }
        }
        fs.writeFileSync(diskPath, cssText, 'utf8');
      } else if (cleanPath.endsWith('.js')) {
        let jsText = await res.text();
        const chunkMatches = Array.from(jsText.matchAll(/static\/chunks\/[a-zA-Z0-9_\-\.]+\.js/g)).map(m => '/' + m[0]);
        for (const c of chunkMatches) {
          const cleanC = c.split('?')[0];
          if (!downloadedAssets.has(cleanC)) {
            assetQueue.push(c);
          }
        }
        fs.writeFileSync(diskPath, jsText, 'utf8');
      } else {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(diskPath, buf);
      }
    }, CONCURRENCY);
  }

  console.log(`✓ All ${downloadedAssets.size} static assets downloaded successfully.`);
  console.log('\n[6/6] Site clone completed successfully!');
}

main().catch((err) => {
  console.error('Fatal clone error:', err);
  process.exit(1);
});

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3008;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.rsc': 'text/x-component; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function serveFile(res, filePath, contentType, statusCode = 200) {
  try {
    const stat = fs.statSync(filePath);
    res.writeHead(statusCode, {
      'Content-Type': contentType || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname);
  const isRsc = req.headers['rsc'] === '1' || (req.headers['accept'] && req.headers['accept'].includes('text/x-component'));

  // 1. Check for ?page= query parameter routing
  const pageParam = urlObj.searchParams.get('page');
  if (pageParam && pageParam !== '1') {
    let pageDir = pathname === '/' ? `/page/${pageParam}` : `${pathname.replace(/\/$/, '')}/page/${pageParam}`;
    const pageHtml = path.join(ROOT, pageDir.slice(1), 'index.html');
    const pageRsc = path.join(ROOT, pageDir.slice(1), 'index.rsc');
    
    if (isRsc && fs.existsSync(pageRsc)) {
      return serveFile(res, pageRsc, MIME_TYPES['.rsc']);
    }
    if (fs.existsSync(pageHtml)) {
      return serveFile(res, pageHtml, MIME_TYPES['.html']);
    }
  }

  // 2. Normalize pathname
  if (pathname.endsWith('/') && pathname !== '/') {
    pathname = pathname.slice(0, -1);
  }

  // 3. Handle /api/search-index
  if (pathname === '/api/search-index' || pathname === '/api/search-index.json') {
    const apiFile = path.join(ROOT, 'api', 'search-index.json');
    if (fs.existsSync(apiFile)) {
      return serveFile(res, apiFile, MIME_TYPES['.json']);
    }
  }

  // Handle /opengraph-image
  if (pathname === '/opengraph-image' || pathname === '/opengraph-image.png') {
    const ogFile = path.join(ROOT, 'opengraph-image.png');
    if (fs.existsSync(ogFile)) {
      return serveFile(res, ogFile, MIME_TYPES['.png']);
    }
  }

  // 4. Resolve file path on disk
  let relPath = pathname === '/' ? '' : pathname.slice(1);
  let diskPath = path.join(ROOT, relPath);

  // If client requests RSC
  if (isRsc) {
    const directRsc = `${diskPath}.rsc`;
    const indexRsc = path.join(diskPath, 'index.rsc');
    const rootRsc = path.join(ROOT, 'index.rsc');

    if (pathname === '/' && fs.existsSync(rootRsc)) {
      return serveFile(res, rootRsc, MIME_TYPES['.rsc']);
    }
    if (fs.existsSync(indexRsc)) {
      return serveFile(res, indexRsc, MIME_TYPES['.rsc']);
    }
    if (fs.existsSync(directRsc)) {
      return serveFile(res, directRsc, MIME_TYPES['.rsc']);
    }
  }

  // If path is directory or root
  if (fs.existsSync(diskPath) && fs.statSync(diskPath).isDirectory()) {
    const indexPath = path.join(diskPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return serveFile(res, indexPath, MIME_TYPES['.html']);
    }
  }

  // If direct file exists (e.g. .css, .js, .woff2, .svg, or exact index.html)
  if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
    const ext = path.extname(diskPath).toLowerCase();
    return serveFile(res, diskPath, MIME_TYPES[ext] || 'application/octet-stream');
  }

  // If clean HTML route (e.g. /pianyijichang -> pianyijichang.html or pianyijichang/index.html)
  const htmlPath = `${diskPath}.html`;
  if (fs.existsSync(htmlPath)) {
    return serveFile(res, htmlPath, MIME_TYPES['.html']);
  }

  const dirIndexPath = path.join(diskPath, 'index.html');
  if (fs.existsSync(dirIndexPath)) {
    return serveFile(res, dirIndexPath, MIME_TYPES['.html']);
  }

  // 5. 404 Fallback
  const fallback404 = path.join(ROOT, '404.html');
  if (fs.existsSync(fallback404)) {
    return serveFile(res, fallback404, MIME_TYPES['.html'], 404);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 本地网站服务器已启动: http://localhost:${PORT}`);
  console.log(`📂 站点根目录: ${ROOT}`);
  console.log(`💡 按 Ctrl+C 可停止服务器`);
  console.log(`==================================================\n`);
});

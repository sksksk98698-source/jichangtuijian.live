const fs = require('fs');
const path = require('path');

function updatePaginationH1(dirPath, pageNum) {
  const htmlFiles = [
    path.join(dirPath, 'index.html'),
    dirPath + '.html'
  ];
  const rscFiles = [
    path.join(dirPath, 'index.rsc'),
    dirPath + '.rsc'
  ];

  const suffixHtml = `<span class="ml-2.5 text-2xl font-normal text-muted tracking-normal">（第 ${pageNum} 页）</span>`;

  for (let f of htmlFiles) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes(`（第 ${pageNum} 页）`)) continue;
    content = content.replace(/(<h1[^>]*>[\s\S]*?)(<\/h1>)/i, `$1${suffixHtml}$2`);
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated H1 in HTML:', f);
  }

  for (let f of rscFiles) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes(`第 ${pageNum} 页`)) continue;
    // In RSC, h1 has children array or string
    // Let's see if we can do a clean replacement if needed
    content = content.replace(/\"children\":\[\"便宜机场推荐\"\]/g, `\"children\":[\"便宜机场推荐（第 ${pageNum} 页）\"]`);
    content = content.replace(/\"children\":\[\"IPLC 专线机场推荐\"\]/g, `\"children\":[\"IPLC 专线机场推荐（第 ${pageNum} 页）\"]`);
    content = content.replace(/\"children\":\[\"高端机场推荐\"\]/g, `\"children\":[\"高端机场推荐（第 ${pageNum} 页）\"]`);
    content = content.replace(/\"children\":\[\"按量付费机场推荐\"\]/g, `\"children\":[\"按量付费机场推荐（第 ${pageNum} 页）\"]`);
    fs.writeFileSync(f, content, 'utf8');
  }
}

// 1. Homepage pagination: page/2 to page/32
for (let p = 2; p <= 35; p++) {
  const dir = path.join('page', String(p));
  if (fs.existsSync(dir)) {
    updatePaginationH1(dir, p);
  }
}

// 2. Category paginations
const categories = ['pianyijichang', 'iplc', 'gaoduanjichang', 'anliangfufei'];
for (let cat of categories) {
  for (let p = 2; p <= 25; p++) {
    const dir = path.join(cat, 'page', String(p));
    if (fs.existsSync(dir)) {
      updatePaginationH1(dir, p);
    }
  }
}

console.log('Pagination H1 de-duplication complete!');

const fs = require('fs');
const path = require('path');

const authorBadge = `<span class="mx-2">·</span><span class="inline-flex items-center gap-1"><span class="font-medium text-foreground">主笔测评：<a href="/about#author" class="text-accent underline hover:no-underline">林浩</a></span><span class="text-xs text-muted">（资深网络工程师）</span></span><span class="mx-2">·</span><span class="text-xs text-muted">多地机房实测</span>`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('主笔测评：<a href="/about#author"')) return 0;

  // Regex to match the date paragraph
  // Pattern 1: <p class="mt-3 text-sm text-muted">首发于 ... · <!-- -->更新于 <time ...>...</time></p>
  // Pattern 2: <p class="mt-3 text-sm text-muted">更新于 <time ...>...</time></p>
  const targetRegex = /(<p class="mt-3 text-sm text-muted">(?:首发于[\s\S]*?<\/time> · <!-- -->)?更新于 <time dateTime="[^"]+">[^<]+<\/time>)(<\/p>)/;

  if (targetRegex.test(content)) {
    content = content.replace(targetRegex, `$1${authorBadge}$2`);
    fs.writeFileSync(filePath, content, 'utf8');
    return 1;
  }
  return 0;
}

let updatedCount = 0;

function scanDir(dir) {
  for (let file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      scanDir(full);
    } else if (file.endsWith('.html')) {
      updatedCount += processFile(full);
    }
  }
}

const targetDirs = ['iplc', 'pianyijichang', 'gaoduanjichang', 'anliangfufei'];
for (let d of targetDirs) {
  if (fs.existsSync(d)) {
    scanDir(d);
  }
}

console.log(`Updated author byline in ${updatedCount} HTML files!`);

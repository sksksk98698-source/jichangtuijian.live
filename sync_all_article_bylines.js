const fs = require('fs');
const path = require('path');

const authorBadgeHtml = `<span class="mx-2">·</span><span class="inline-flex items-center gap-1"><span class="font-medium text-foreground">主笔测评：<a href="/about#author" class="text-accent underline hover:no-underline">林浩</a></span><span class="text-xs text-muted">（资深网络工程师）</span></span><span class="mx-2">·</span><span class="text-xs text-muted">多地机房实测</span>`;

const rscAuthorSuffix = '," · ",["$","span",null,{"className":"inline-flex items-center gap-1","children":[["$","span",null,{"className":"font-medium text-foreground","children":["主笔测评：",["$","a",null,{"href":"/about#author","className":"text-accent underline hover:no-underline","children":"林浩"}]]}],["$","span",null,{"className":"text-xs text-muted","children":"（资深网络工程师）"}]]}]," · ",["$","span",null,{"className":"text-xs text-muted","children":"多地机房实测"}]';

const htmlAuthorSuffix = rscAuthorSuffix.split('"').join('\\"');

const domRegex = /(<p class="mt-3 text-sm text-muted">(?:首发于[\s\S]*?<\/time> · <!-- -->)?更新于 <time dateTime="[^"]+">[^<]+<\/time>)(<\/p>)/;
const htmlScriptRegex = /(,\\"更新于 \\",\[\\"\$\\",\\"time\\",null,\{\\"dateTime\\":\\"\d{4}-\d{2}-\d{2}\\",\\"children\\":\\"\d{4}-\d{2}-\d{2}\\"\}\])/;
const rscRegex = /(,"更新于 ",\["\$","time",null,\{"dateTime":"\d{4}-\d{2}-\d{2}","children":"\d{4}-\d{2}-\d{2}"\}\])/;

const targetDirs = [
  'iplc',
  'pianyijichang',
  'gaoduanjichang',
  'anliangfufei',
  'dailiruanjian',
  'guowaivpn'
];

let htmlCount = 0;
let rscCount = 0;

function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. DOM
  if (domRegex.test(content) && !content.includes('主笔测评：<a href="/about#author"')) {
    content = content.replace(domRegex, `$1${authorBadgeHtml}$2`);
    changed = true;
  }

  // 2. Script
  if (htmlScriptRegex.test(content) && !content.includes('主笔测评：\\",')) {
    content = content.replace(htmlScriptRegex, `$1${htmlAuthorSuffix}`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    htmlCount++;
  }
}

function processRscFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (rscRegex.test(content) && !content.includes('主笔测评：')) {
    content = content.replace(rscRegex, `$1${rscAuthorSuffix}`);
    fs.writeFileSync(filePath, content, 'utf8');
    rscCount++;
  }
}

function walkDir(dir) {
  for (let file of fs.readdirSync(dir)) {
    if (file === 'page') continue; // skip pagination subdirs
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkDir(full);
    } else if (file.endsWith('.html') && file !== 'index.html') {
      processHtmlFile(full);
    } else if (file.endsWith('.rsc') && file !== 'index.rsc') {
      processRscFile(full);
    }
  }
}

for (let d of targetDirs) {
  if (fs.existsSync(d)) {
    walkDir(d);
  }
}

// Also sync root directory htmls if corresponding folder/index.html exists
function syncDirectoryIndexes(dir) {
  for (let file of fs.readdirSync(dir)) {
    if (file === 'page') continue;
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      const parentHtml = `${full}.html`;
      const parentRsc = `${full}.rsc`;
      const childHtml = path.join(full, 'index.html');
      const childRsc = path.join(full, 'index.rsc');

      if (fs.existsSync(parentHtml) && fs.existsSync(childHtml)) {
        fs.copyFileSync(parentHtml, childHtml);
      }
      if (fs.existsSync(parentRsc) && fs.existsSync(childRsc)) {
        fs.copyFileSync(parentRsc, childRsc);
      }
    }
  }
}

for (let d of targetDirs) {
  if (fs.existsSync(d)) {
    syncDirectoryIndexes(d);
  }
}

console.log(`Processed: ${htmlCount} HTML files, ${rscCount} RSC files updated!`);

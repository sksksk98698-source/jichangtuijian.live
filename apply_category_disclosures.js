const fs = require('fs');
const path = require('path');

const disclosureHtml = `<div class="mt-3 flex items-center gap-2 text-xs text-muted"><span class="inline-block w-1.5 h-1.5 rounded-full bg-accent"></span><span>本站包含推广返利链接，不影响客观评测 · </span><a href="/disclosure" class="text-accent underline hover:no-underline">查看商业推广披露 ↗</a></div>`;

const rscNode = ',["$","div",null,{"className":"mt-3 flex items-center gap-2 text-xs text-muted","children":[["$","span",null,{"className":"inline-block w-1.5 h-1.5 rounded-full bg-accent"}],["$","span",null,{"children":"本站包含推广返利链接，不影响客观评测 · "}],["$","a",null,{"href":"/disclosure","className":"text-accent underline hover:no-underline","children":"查看商业推广披露 ↗"}]]}]';

const htmlScriptNode = rscNode.split('"').join('\\"');

const categories = [
  { name: 'pianyijichang', descMatch: '适合学生党与预算有限的用户。' },
  { name: 'iplc', descMatch: '晚高峰不卡顿。' },
  { name: 'gaoduanjichang', descMatch: '对线路质量有极致要求的用户。' },
  { name: 'anliangfufei', descMatch: '预算更可控。' },
  { name: 'dailiruanjian', descMatch: '主流代理软件客户端。' },
  { name: 'guowaivpn', descMatch: '全球老牌商业 VPN 服务商。' },
  { name: 'huiguo', descMatch: '专为海外华人、留学生设计。' },
  { name: 'paihangbang', descMatch: '挑选适合你的翻墙工具。' }
];

for (let cat of categories) {
  // Check the actual description in the HTML file
  const htmlFile = `${cat.name}.html`;
  const rscFile = `${cat.name}.rsc`;
  if (!fs.existsSync(htmlFile)) {
    console.log(`File not found: ${htmlFile}`);
    continue;
  }

  let html = fs.readFileSync(htmlFile, 'utf8');
  let rsc = fs.readFileSync(rscFile, 'utf8');

  // Find the header paragraph in HTML
  // Pattern: <header class="border-b-2 border-foreground pb-6">...<p class="mt-4 text-lg leading-8 text-muted">([^<]+)</p>
  const headerMatch = html.match(/<header class="border-b-2 border-foreground pb-6">[\s\S]*?<p class="mt-4 text-lg leading-8 text-muted">([^<]+)<\/p>/);
  if (!headerMatch) {
    console.log(`Header paragraph not matched in ${htmlFile}`);
    continue;
  }

  const descText = headerMatch[1];
  console.log(`Processing ${cat.name}: "${descText.slice(0, 30)}..."`);

  // 1. Update DOM
  const domTarget = `<p class="mt-4 text-lg leading-8 text-muted">${descText}</p>`;
  if (html.includes(domTarget) && !html.includes('查看商业推广披露')) {
    html = html.replace(domTarget, domTarget + disclosureHtml);
  }

  // 2. Update HTML script
  // Look for descText escaped in script: descText + \"}]
  const scriptFind = `${descText}\\"}]`;
  if (html.includes(scriptFind) && !html.includes('查看商业推广披露 ↗\\"')) {
    html = html.replace(scriptFind, scriptFind + htmlScriptNode);
  }

  fs.writeFileSync(htmlFile, html, 'utf8');
  const indexHtml = path.join(cat.name, 'index.html');
  if (fs.existsSync(indexHtml)) {
    fs.writeFileSync(indexHtml, html, 'utf8');
  }

  // 3. Update RSC
  const rscFind = `${descText}"}]`;
  if (rsc.includes(rscFind) && !rsc.includes('查看商业推广披露')) {
    rsc = rsc.replace(rscFind, rscFind + rscNode);
    fs.writeFileSync(rscFile, rsc, 'utf8');
    const indexRsc = path.join(cat.name, 'index.rsc');
    if (fs.existsSync(indexRsc)) {
      fs.writeFileSync(indexRsc, rsc, 'utf8');
    }
  }

  console.log(`Updated ${cat.name} successfully!`);
}

const fs = require('fs');

let html = fs.readFileSync('gaoduanjichang.html', 'utf8');

// Replace min-w-[34rem] with min-w-[46rem]
html = html.replace(/min-w-\[34rem\]/g, 'min-w-[46rem]');

const oldGuangsu = `<tr><td class="border-b border-rule px-3 py-2.5 align-top font-medium whitespace-nowrap"><a class="text-accent underline decoration-1 underline-offset-2 hover:decoration-2" href="/pianyijichang/guangsuyun">光速云</a><span class="ml-1.5 lab-badge lab-badge-orange text-[10px]">TOP 1 专线旗舰</span></td><td class="border-b border-rule px-3 py-2.5 align-top whitespace-nowrap"><span class="font-medium">¥23/月起</span><span class="block text-xs text-muted">定制独立IP专线搭建¥680/500G</span></td><td class="border-b border-rule px-3 py-2.5 align-top whitespace-nowrap font-medium text-accent">¥0.05</td><td class="border-b border-rule px-3 py-2.5 align-top text-muted">企业级IEPL内网专线 / 2020老牌稳定</td><td class="border-b border-rule px-3 py-2.5 align-top whitespace-nowrap"><a href="https://sahude.gsyvipaff.com/#/?code=keqgvT5Y" target="_blank" rel="nofollow sponsored noopener noreferrer" class="font-medium text-accent hover:underline">官网 (8折码AMM) ↗</a></td></tr>`;

const newGuangsu = `<tr><td class="border-b border-rule px-3 py-2.5 font-medium whitespace-nowrap"><a class="text-accent underline decoration-1 underline-offset-2 hover:decoration-2 font-bold" href="/pianyijichang/guangsuyun">光速云</a><span class="lab-badge lab-badge-orange">TOP 1 专线旗舰</span></td><td class="border-b border-rule px-3 py-2.5 whitespace-nowrap"><span class="font-medium text-foreground block">¥7.5/月起</span><span class="block text-xs text-muted">年付折合 · 月付¥23(148G)</span></td><td class="border-b border-rule px-3 py-2.5 whitespace-nowrap font-medium text-accent">¥0.05</td><td class="border-b border-rule px-3 py-2.5 whitespace-nowrap"><span class="font-medium text-foreground block">企业级IEPL专线</span><span class="text-xs text-muted block">VLESS · 2020老牌稳定</span></td><td class="border-b border-rule px-3 py-2.5 whitespace-nowrap text-center"><a href="https://sahude.gsyvipaff.com/#/?code=keqgvT5Y" target="_blank" rel="nofollow sponsored noopener noreferrer">官网 ↗</a><br><span class="coupon-tag">8折码 AMM</span></td></tr>`;

if (html.includes(oldGuangsu)) {
  html = html.replace(oldGuangsu, newGuangsu);
  fs.writeFileSync('gaoduanjichang.html', html, 'utf8');
  console.log('Successfully updated gaoduanjichang.html');
} else {
  console.log('Old Guangsu pattern not found');
}

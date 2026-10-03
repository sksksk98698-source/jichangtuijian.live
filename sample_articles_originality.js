const fs = require('fs');

const sampleFiles = [
  'iplc/enet.html',
  'iplc/wgetcloud.html',
  'pianyijichang/feiniaoyun.html',
  'pianyijichang/guangsuyun.html',
  'gaoduanjichang/justmysocks.html',
  'anliangfufei/mojie.html',
  'dailiruanjian/clash-kehuduan.html',
  'guowaivpn/expressvpn.html',
  'huiguo/malus.html',
  'xieyi/hysteria2.html'
];

const results = [];

for (let file of sampleFiles) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  
  // Extract paragraphs from article
  const pMatches = [...content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 50 && !t.includes('©') && !t.includes('备用域名') && !t.includes('关于我们'));
  
  const sampleParagraphs = pMatches.slice(0, 4);
  
  results.push({
    file,
    paragraphsCount: pMatches.length,
    sampleParagraphs,
    hasHardData: /¥[0-9]+|[0-9]+G|ms|Mbps|丢包率|折合|端口/i.test(content),
    hasFirstHandTesting: /实测|测速|打不开|退款|跑路|晚高峰|客服/i.test(content),
  });
}

console.log('Sampled 10 articles:');
results.forEach((r, i) => {
  console.log(`\n[${i+1}] ${r.file} (Total P: ${r.paragraphsCount})`);
  console.log('Has hard data:', r.hasHardData, '| Has firsthand testing:', r.hasFirstHandTesting);
  console.log('Sample snippet 1:', r.sampleParagraphs[0]?.slice(0, 100));
});

fs.writeFileSync('originality_samples.json', JSON.stringify(results, null, 2), 'utf8');

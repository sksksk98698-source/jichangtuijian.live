const fs = require('fs');

const targets = [
  'guowaivpn/strongvpn.html',
  'guowaivpn/strongvpn/index.html',
  'guowaivpn/strongvpn.rsc',
  'guowaivpn/strongvpn/index.rsc',
  'iplc/iplcvip.html',
  'iplc/iplcvip/index.html',
  'iplc/iplcvip.rsc',
  'iplc/iplcvip/index.rsc',
  'pianyijichang/bocchi.html',
  'pianyijichang/bocchi/index.html',
  'pianyijichang/bocchi.rsc',
  'pianyijichang/bocchi/index.rsc',
  'iplc/kuromis.html',
  'iplc/kuromis/index.html',
  'iplc/kuromis.rsc',
  'iplc/kuromis/index.rsc'
];

for (let file of targets) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let before = content;
  
  content = content.replace(/rel=["']noopener noreferrer nofollow noopener noreferrer["']/g, 'rel="nofollow sponsored noopener noreferrer"');
  content = content.replace(/rel=["']nofollow noopener noreferrer["']/g, 'rel="nofollow sponsored noopener noreferrer"');
  content = content.replace(/"rel":\s*"nofollow noopener noreferrer"/g, '"rel":"nofollow sponsored noopener noreferrer"');
  content = content.replace(/"rel":\s*"noopener noreferrer nofollow noopener noreferrer"/g, '"rel":"nofollow sponsored noopener noreferrer"');
  
  if (content !== before) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  } else {
    console.log('No change in:', file);
  }
}

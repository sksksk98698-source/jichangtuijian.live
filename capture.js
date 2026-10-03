const cp = require('child_process');
const path = require('path');

const url = process.argv[2] || 'http://localhost:3008/gaoduanjichang';
const outName = process.argv[3] || 'screenshot.png';
const outPath = path.join('C:\\Users\\Pro User\\.gemini\\antigravity\\brain\\b6b94f7e-08fb-4884-84a3-457a3aa5081b', outName);

console.log(`Capturing ${url} to ${outPath}...`);
cp.execFileSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless',
  '--disable-gpu',
  `--screenshot=${outPath}`,
  '--window-size=1280,1400',
  url
]);
console.log('Screenshot captured successfully!');

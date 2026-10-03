const fs = require('fs');
const content = fs.readFileSync('gaoduanjichang.html', 'utf8');
const marker = 'self.__next_f.push([1,"20:';
const idx = content.indexOf(marker);
if (idx !== -1) {
  const endIdx = content.indexOf('])</script>', idx);
  console.log('Script tag starts at:', idx, 'ends at:', endIdx);
  console.log('Last 100 chars of script tag:', content.slice(endIdx - 100, endIdx + 11));
} else {
  console.log('Marker not found');
}

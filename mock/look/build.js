// Mock-up page for the five adopted items:  node mock/look/build.js  ->  mock/look/index.html
// Takes the built Phase 1 page (hosted/v6/index.html, run build6.js first if src/v6 changed) and layers look.css and look.js on top.
const fs = require('fs'), rd = f => fs.readFileSync(f, 'utf8');
const page = rd('hosted/v6/index.html'), css = rd('mock/look/look.css'), js = rd('mock/look/look.js');
if (page.split('</body>').length !== 2) throw new Error('page layout changed');
// the app runs inside one closure, so the layer goes in at its end, where it can reach the drawing functions
const end = page.lastIndexOf('})();');
if (end < 0 || end < page.lastIndexOf('<script>')) throw new Error('app closure not found');
fs.writeFileSync('mock/look/index.html', (page.slice(0, end) + js + '\n' + page.slice(end)).replace('</body>', () => '<style>' + css + '</style></body>'));
console.log('mock/look/index.html written');

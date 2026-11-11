// Next Plate v3:  node build3.js
//   next-plate-v3.html     artifact page (asks through the viewer's own Claude)
//   hosted/v3/index.html   full document as the hosted server serves it
//   hosted/v3/server.ts    one-file Bun server with the v3 page inside it
const fs = require('fs');
const rd = f => fs.readFileSync(f, 'utf8');
const shell = rd('src/v3/shell.html'), data = rd('src/data.js'), prompt = rd('src/prompt.js'), app = rd('src/v3/app.js');
const fill = hosted => shell.replace('/*DATA*/', () => data + '\n' + prompt).replace('/*APP*/', () => (hosted ? 'window.NP_HOSTED=true;window.NP_NOPHOTO=true;\n' : '') + app);
fs.writeFileSync('next-plate-v3.html', fill(false));
const head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0F6460"><style>body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style></head><body>';
const page = head + fill(true) + '</body></html>';
fs.mkdirSync('hosted/v3', { recursive: true });
fs.writeFileSync('hosted/v3/index.html', page);
if (/`|\$\{/.test(page)) throw new Error('page contains a backtick or ${ and cannot sit in String.raw');
const ascii = page.replace(/[^\x00-\x7f]/gu, c => '${String.fromCodePoint(0x' + c.codePointAt(0).toString(16) + ')}');
const server = rd('src/server.ts').replace('/*PAGE*/', () => ascii);
if (/[^\x00-\x7f]/.test(server)) throw new Error('server.ts is not ASCII');
fs.writeFileSync('hosted/v3/server.ts', server);
for (const f of ['next-plate-v3.html', 'hosted/v3/index.html', 'hosted/v3/server.ts']) console.log(f, fs.statSync(f).size, 'bytes');

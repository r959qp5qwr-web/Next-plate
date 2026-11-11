// Assembles both outputs from src/:  node build.js
//   next-plate.html   the artifact page (asks Claude through the viewer's own account)
//   hosted/server.ts  one-file Bun server with the page inside it (asks through your API key)
const fs = require('fs');
const rd = f => fs.readFileSync('src/' + f, 'utf8');
const shell = rd('shell.html'), data = rd('data.js'), prompt = rd('prompt.js'), app = rd('app.js');
const fill = (s, hosted) => s.replace('/*DATA*/', () => data + '\n' + prompt).replace('/*APP*/', () => (hosted ? 'window.NP_HOSTED=true;window.NP_NOPHOTO=true;\n' : '') + app);

fs.writeFileSync('next-plate.html', fill(shell, false));

// the hosted page is a full document (no artifact skeleton wraps it there)
const head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#F3EBDD"><style>body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style></head><body>';
const page = head + fill(shell, true) + '</body></html>';
fs.mkdirSync('hosted', { recursive: true });
fs.writeFileSync('hosted/index.html', page);
if (/`|\$\{/.test(page)) throw new Error('page contains a backtick or ${ and cannot sit in String.raw');
// keep the server file pure ASCII: Bun rewrites non-ASCII inside templates, and String.raw would then serve the escape codes as text
const ascii = page.replace(/[^\x00-\x7f]/gu, c => '${String.fromCodePoint(0x' + c.codePointAt(0).toString(16) + ')}');
const server = rd('server.ts').replace('/*PAGE*/', () => ascii);
if (/[^\x00-\x7f]/.test(server)) throw new Error('server.ts is not ASCII');
fs.writeFileSync('hosted/server.ts', server);
for (const f of ['next-plate.html', 'hosted/index.html', 'hosted/server.ts']) console.log(f, fs.statSync(f).size, 'bytes');

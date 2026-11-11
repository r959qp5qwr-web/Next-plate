// Next Plate v4 (studio + phone):  node build4.js
const fs = require('fs');
const rd = f => fs.readFileSync(f, 'utf8');
const P = n => rd('src/v4/parts/' + n + '.js');
const app = '/* ===== Next Plate v4: Today, Lab, Rescue, Rhythm, Ask ===== */\n(function(){\n"use strict";\nvar NS="http://www.w3.org/2000/svg";\n' +
  ['helpers', 'state', 'quantities', 'nutrition', 'shares', 'boundaries', 'choose', 'shared', 'setup', 'sheet', 'ask', 'voice', 'ui'].map(P).join('\n') + '\n})();\n';
fs.writeFileSync('src/v4/app.built.js', app);
const shell = rd('src/v4/shell.html'), data = rd('src/data.js'), prompt = rd('src/prompt.js');
const fill = hosted => shell.replace('/*DATA*/', () => data + '\n' + prompt).replace('/*APP*/', () => (hosted ? 'window.NP_HOSTED=true;window.NP_NOPHOTO=true;\n' : '') + app);
fs.writeFileSync('next-plate-v4.html', fill(false));
const head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0F6460"><style>body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style></head><body>';
const page = head + fill(true) + '</body></html>';
fs.mkdirSync('hosted/v4', { recursive: true });
fs.writeFileSync('hosted/v4/index.html', page);
if (/`|\$\{/.test(page)) throw new Error('page contains a backtick or ${ and cannot sit in String.raw');
const ascii = page.replace(/[^\x00-\x7f]/gu, c => '${String.fromCodePoint(0x' + c.codePointAt(0).toString(16) + ')}');
const server = rd('src/server.ts').replace('/*PAGE*/', () => ascii);
if (/[^\x00-\x7f]/.test(server)) throw new Error('server.ts is not ASCII');
fs.writeFileSync('hosted/v4/server.ts', server);
for (const f of ['next-plate-v4.html', 'hosted/v4/index.html', 'hosted/v4/server.ts']) console.log(f, fs.statSync(f).size, 'bytes');

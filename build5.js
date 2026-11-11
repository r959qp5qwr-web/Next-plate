// Next Plate v5 (AI-first; spec docs/SPEC-v5.md):  node build5.js
// The look is v4 Raw Linen: its stylesheet and icon set are reused as they are, plus src/v5/extra.css.
const fs = require('fs');
const rd = f => fs.readFileSync(f, 'utf8');
const v4 = rd('src/v4/shell.html').split('\n');
const close = v4.indexOf('</style>'), app = v4.findIndex(l => l.startsWith('<div class="app"'));
if (close < 0 || app < 0) throw new Error('v4 shell layout changed');
const head = v4.slice(0, close).join('\n'), icons = v4.slice(close, app).join('\n');
const core = rd('src/v5/core.js'), js = rd('src/v5/app.js');
const body = rd('src/v5/markup.html').replace('/*CORE*/', () => core).replace('/*APP*/', () => js);
const shell = head + '\n' + rd('src/v5/extra.css') + '\n' + icons + '\n' + body;
const top = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#F2ECE1"><style>body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style></head><body>';
const page = top + shell + '</body></html>';
fs.mkdirSync('hosted/v5', { recursive: true });
fs.writeFileSync('hosted/v5/index.html', page);
fs.copyFileSync('src/v5/server.ts', 'hosted/v5/server.ts');
for (const f of ['hosted/v5/index.html', 'hosted/v5/server.ts']) console.log(f, fs.statSync(f).size, 'bytes');
// Minified copy served to phones from GitHub at PAGE_REF (hosted/v5/index.min.html). Needs esbuild: ESBUILD=<path to node_modules/esbuild>
const esbPath = process.env.ESBUILD;
if (esbPath) {
  const esb = require(esbPath), o = { minify: true, charset: 'ascii', target: 'es2018' };
  const min = page.replace(/<script id="np-core">([\s\S]*?)<\/script>/, (m, c) => '<script id="np-core">' + esb.transformSync(c, { ...o, minifyIdentifiers: false }).code.trim() + '</script>')
    .replace(/<script>([\s\S]*?)<\/script>/, (m, c) => '<script>' + esb.transformSync(c, o).code.trim() + '</script>')
    .replace(/<style>([\s\S]*?)<\/style>/g, (m, c) => '<style>' + esb.transformSync(c, { loader: 'css', minify: true, charset: 'ascii' }).code.trim() + '</style>')
    .replace(/>\s+</g, '><');
  fs.writeFileSync('hosted/v5/index.min.html', min);
  console.log('hosted/v5/index.min.html', min.length, 'bytes');
}

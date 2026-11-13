// Next Plate v6 (context engine; docs/ARCHITECTURE-v6.md):  ESBUILD=<path> node build6.js
// Page = v4 Raw Linen stylesheet and icons + v5/v6 extra CSS + core (v5 core, v6 params, v6 engine) + app (v5 drawing helpers, v6 screens).
const fs = require('fs');
const rd = f => fs.readFileSync(f, 'utf8');
const v4 = rd('src/v4/shell.html').split('\n');
const close = v4.indexOf('</style>'), appAt = v4.findIndex(l => l.startsWith('<div class="app"'));
if (close < 0 || appAt < 0) throw new Error('v4 shell layout changed');
const head = v4.slice(0, close).join('\n'), icons = v4.slice(close, appAt).join('\n');
// One palette: the Raw Linen paper in every scheme. The base sheet still carries the old teal dark-mode colours, which phones in dark mode
// picked up under the Raw Linen layer (illegible dark-on-dark text). They are removed here, and the page declares a light-only scheme.
const headLight = head.replace(/@media \(prefers-color-scheme:dark\)\{:root:not\(\[data-theme="light"\]\)\{[^}]*\}\}/g, '').replace(/:root\[data-theme="dark"\]\{[^}]*\}/g, '');
if (/prefers-color-scheme:dark/.test(headLight)) throw new Error('a dark-mode rule is still in the base sheet');
const core = [rd('src/v5/core.js'), rd('src/v6/params.js'), rd('src/v6/engine.js')].join('\n');
// drawing helpers are taken from the v5 app as they are: everything before its state block, and the helper block after it
const a5 = rd('src/v5/app.js'), s0 = a5.indexOf('/* ---------- state ---------- */'), s1 = a5.indexOf('/* ---------- motion helpers (from v4) ---------- */'), s2 = a5.indexOf('/* ---------- the meal after the person');
if (s0 < 0 || s1 < 0 || s2 < 0) throw new Error('v5 app markers moved');
const js = a5.slice(0, s0) + a5.slice(s1, s2) + rd('src/v6/plate.js') + '\n' + rd('src/v6/app.js');
const body = rd('src/v5/markup.html').replace('/*CORE*/', () => core).replace('/*APP*/', () => js);
const shell = headLight + '\n' + rd('src/v5/extra.css') + '\n' + rd('src/v6/extra.css') + '\n' + rd('src/v6/legible.css') + '\n' + icons + '\n' + body;
const top = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#F2ECE1"><meta name="color-scheme" content="only light"><style>body{margin:0}[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style></head><body>';
const page = top + shell + '</body></html>';
fs.mkdirSync('hosted/v6', { recursive: true });
fs.writeFileSync('hosted/v6/index.html', page);
console.log('hosted/v6/index.html', page.length, 'bytes');
const esbPath = process.env.ESBUILD;
if (esbPath) {
  const esb = require(esbPath), o = { minify: true, charset: 'ascii', target: 'es2018' };
  const minCore = c => esb.transformSync(c, { ...o, minifyIdentifiers: false }).code.trim();
  const min = page.replace(/<script id="np-core">([\s\S]*?)<\/script>/, (m, c) => '<script id="np-core">' + minCore(c) + '</script>')
    .replace(/<script>([\s\S]*?)<\/script>/, (m, c) => '<script>' + esb.transformSync(c, o).code.trim() + '</script>')
    .replace(/<style>([\s\S]*?)<\/style>/g, (m, c) => '<style>' + esb.transformSync(c, { loader: 'css', minify: true, charset: 'ascii' }).code.trim() + '</style>')
    .replace(/>\s+</g, '><');
  fs.writeFileSync('hosted/v6/index.min.html', min);
  console.log('hosted/v6/index.min.html', min.length, 'bytes');
  // The live v5 screens with the newest core: this is what PAGE_REF serves until the owner says "Deploy." for the v6 screens.
  // The server loads hosted/v5/index.min.html, so the engine can be checked against the live Gemini engine without changing what clients see.
  const m5 = rd('hosted/v5/index.min.html').replace(/<script id="np-core">([\s\S]*?)<\/script>/, () => '<script id="np-core">' + minCore(core) + '</script>');
  fs.writeFileSync('hosted/v5/index.min.html', m5);
  console.log('hosted/v5/index.min.html (v5 screens, v6 core)', m5.length, 'bytes');
}

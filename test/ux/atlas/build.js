// Screen book: every captured screen of the app, one page each, in the order a user meets them.
// usage: node test/ux/atlas/build.js [--dir 360-light] [--out docs/ux/screens.pdf]
const fs = require('fs'), path = require('path'), { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../../..'), arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const DIR = arg('dir', '360-light'), OUT = path.resolve(ROOT, arg('out', 'docs/ux/screens.pdf'));
const NAMES = require('./names.js');
(async () => {
  const shots = path.join(ROOT, 'test/ux/out/screens', DIR), files = fs.readdirSync(shots);
  const frames = (n) => files.filter(f => f.startsWith(n + '-') && /^\d+\.png$/.test(f.slice(n.length + 1))).sort((a, b) => parseInt(a.slice(n.length + 1)) - parseInt(b.slice(n.length + 1)));
  const missing = NAMES.filter(s => !frames(s.id).length).map(s => s.id);
  const known = new Set(NAMES.map(s => s.id)), extra = [...new Set(files.map(f => f.replace(/-\d+\.png$/, '')))].filter(n => !known.has(n));
  if (missing.length || extra.length) { console.error('names.js and the screens differ. No screens: ' + missing.join(', ') + '. Not named: ' + extra.join(', ')); process.exit(1); }
  const cache = path.join(require('os').tmpdir(), 'np-atlas-' + DIR); fs.mkdirSync(cache, { recursive: true });
  const img = (f) => { const j = path.join(cache, f.replace(/png$/, 'jpg')); if (!fs.existsSync(j)) require('child_process').execFileSync('convert', [path.join(shots, f), '-resize', '600x', '-quality', '80', j]); return 'file://' + j; };
  let sec = '', idx = '', group = '';
  NAMES.forEach((s, i) => {
    const n = String(i + 1).padStart(2, '0');
    if (s.group !== group) { group = s.group; idx += `<h3>${group}</h3>`; }
    idx += `<div class="ix"><b>${n}</b> ${s.name}</div>`;
    const fr = frames(s.id);
    sec += `<section><header><b>${n}</b><div><h2>${s.name}</h2><p>${s.how}</p><small>${group} · state ${s.id} · ${fr.length} frame${fr.length > 1 ? 's' : ''} (scrolled top to bottom) · ${DIR.replace('-', ' px, ')}</small></div></header><div class="row">${fr.map((f, k) => `<figure><img src="${img(f)}"><figcaption>${k + 1}</figcaption></figure>`).join('')}</div></section>`;
  });
  const html = `<!doctype html><meta charset="utf-8"><style>
  @page{size:420mm 297mm;margin:10mm} body{font:13px/1.45 Georgia,serif;color:#2a211b;margin:0}
  .cover{page-break-after:always} .cover h1{font-size:34px;margin:0 0 6px} .cover p{max-width:900px}
  .cols{columns:3;column-gap:28px} .cols h3{margin:14px 0 4px;font-size:14px;break-after:avoid} .ix{font-size:12.5px;padding:1px 0}
  section{page-break-before:always} header{display:flex;gap:14px;align-items:flex-start;margin-bottom:8px}
  header>b{font-size:30px;line-height:1} h2{margin:0;font-size:20px} header p{margin:2px 0;font-size:14px} small{color:#6b5d50}
  .row{display:flex;flex-wrap:wrap;gap:10px} figure{margin:0;text-align:center} img{width:88mm;border:1px solid #cbbfb0;border-radius:6px} figcaption{font-size:11px;color:#6b5d50}
  </style><div class="cover"><h1>Next Plate: every screen</h1><p>${NAMES.length} screens, in the order a client meets them, from the first load. Each page shows one screen at ${DIR.split('-')[0]} px wide (common Android), ${DIR.split('-')[1]} theme, scrolled top to bottom. Dark theme shows the same paper look. Screens come from the app build ${process.env.BUILD || ''}; plates are from test data.</p><div class="cols">${idx}</div></div>${sec}`;
  const hf = path.join(cache, 'book.html'); fs.writeFileSync(hf, html);
  const b = await chromium.launch(), p = await b.newPage(); await p.goto('file://' + hf, { waitUntil: 'load', timeout: 300000 });
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); await p.pdf({ path: OUT, preferCSSPageSize: true, printBackground: true }); await b.close();
  console.log(OUT, NAMES.length, 'screens', (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB');
})();

// The owner's banned words (rule 13 of the handoff; ux-critic rule 4), swept over every note in the repository and every string a client
// can see in the app. node test/words/check.js -> exit 0 when the only hits are the listed exceptions, 1 otherwise.
// An exception names the file, a piece of the line, and why the word must stay (the rule that lists the words, a quoted record of
// rejected narration, a web address). Anything else is a breach.
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '../..');
const BANNED = ['real', 'quiet', 'quietly', 'simply', 'seamlessly', 'effortlessly', 'exactly', 'just works', 'journey', 'unlock', 'empower', 'smart',
  'magic', 'game-changer', 'revolutionary', 'transform', 'curated', 'tailored', 'personalised', 'holistic', 'wellness journey'];
const RX = new RegExp('(^|[^a-z])(' + BANNED.map(w => w.replace(/[-\s]/g, m => m === '-' ? '-' : '\\s+')).join('|') + ')(?![a-z])', 'ig');
const allow = JSON.parse(fs.readFileSync(path.join(__dirname, 'allow.json'), 'utf8'));
const files = execSync('git ls-files -co --exclude-standard', { cwd: ROOT }).toString().split('\n').filter(f => /\.(md|txt)$/i.test(f) && !/^node_modules\//.test(f));
const APP = ['src/v6/app.js', 'src/v5/app.js', 'src/v6/params.js', 'src/v6/plate.js', 'src/v5/markup.html', 'src/v6/engine.js', 'src/v5/core.js', 'src/v5/server.ts'];
// Code and comments of the current app, its checks, the gate and the current films are notes too: every line is read (Critic round 7).
const CODE = execSync('git ls-files -co --exclude-standard', { cwd: ROOT }).toString().split('\n')
  .filter(f => /\.(js|mjs|ts|py|sh|css|html)$/.test(f) && /^(src\/v5\/|src\/v6\/|build6\.js|test\/|\.claude\/hooks\/|demo\/reel\/[^/]+\.(js|mjs)$|demo\/reel\/film4\/|demo\/reel\/film5\/|eval\/v6\/[^/]+\.js$)/.test(f)
    && !/\/fonts\//.test(f));
let hits = [], used = new Set();
function scan(f, text, onlyStrings) {
  text.split('\n').forEach((line, i) => { const orig = line;
    if (!onlyStrings && /\.(js|mjs|ts|css|html|py)$/.test(f)) line = line.replace(/(?:text-)?transform(?:-origin|-box|-style)?(?=["']?\s*[:=])|\.transform\b|["']transform["']/gi, '');   // the CSS and SVG property, not the word
    const parts = onlyStrings ? (line.match(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|>[^<>{}]+</g) || []).filter(s => !/^["'](translate|rotate|scale|matrix)|:\s*[^;]+;/.test(s)) : [line];
    parts.forEach(s => { let m; RX.lastIndex = 0; while ((m = RX.exec(s))) {
      const a = allow.findIndex(x => x.file === f && orig.includes(x.contains));
      if (a >= 0) used.add(a); else hits.push(`${f}:${i + 1}: "${m[2]}" in: ${orig.trim().slice(0, 140)}`); } });
  });
}
files.forEach(f => { if (fs.existsSync(path.join(ROOT, f))) scan(f, fs.readFileSync(path.join(ROOT, f), 'utf8'), false); });
APP.forEach(f => scan(f, fs.readFileSync(path.join(ROOT, f), 'utf8'), true));
CODE.forEach(f => { if (fs.existsSync(path.join(ROOT, f))) scan(f, fs.readFileSync(path.join(ROOT, f), 'utf8'), false); });
const stale = allow.map((x, i) => i).filter(i => !used.has(i)).map(i => `allow.json entry ${i} (${allow[i].file}) no longer matches anything; remove it`);
hits.concat(stale).forEach(h => console.log('FAIL ' + h));
console.log(hits.length || stale.length ? `${hits.length} banned word(s) outside the exceptions, ${stale.length} stale exception(s)` : `no banned words outside the ${allow.length} listed exceptions (${files.length} notes, ${APP.length} app files read for their strings, ${CODE.length} code files read line by line)`);
process.exit(hits.length || stale.length ? 1 : 0);

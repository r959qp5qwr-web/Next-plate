// Every model name recorded under eval/, cleaned by the OLD showName (ba4d8dc, the build the safety audit and Critic round 40 judged; OLDREF
// sets another, e.g. OLDREF=6b5e18d for the build the final audit and Critic round 38 judged) and by
// the NEW one (hosted/v6/index.html), on the path the name takes: plate items, swaps and one-tap items on the plate path; menu dishes,
// sides and leave entries on the menu path (no typed menu, as for a photo). Every name that changes is written to names-diff.txt as
// old -> new, for reading by hand: a change may only take off a count or a portion.
//   node eval/usefulness/names-diff.js            (writes eval/usefulness/names-diff.txt; exit 0)
const fs = require('fs'), path = require('path'), vm = require('vm'), { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..'), OLDREF = process.env.OLDREF || 'ba4d8dc';
const core = (page) => { const o = '<script id="np-core">', a = page.indexOf(o) + o.length, ctx = vm.createContext({ console }); vm.runInContext(page.slice(a, page.indexOf('</script>', a)), ctx); return ctx; };
const OLD = core(execSync(`git show ${OLDREF}:hosted/v6/index.html`, { cwd: ROOT, maxBuffer: 64 << 20 }).toString()), NEW = core(fs.readFileSync(path.join(ROOT, 'hosted/v6/index.html'), 'utf8'));
const files = execSync('git ls-files eval', { cwd: ROOT }).toString().split('\n').filter(f => /\.json$/.test(f));
const names = { plate: new Set(), menu: new Map() };   // a menu name keeps the typed menu it was read from, when the record holds one
const walk = (o, k, inMenu, typed) => {
  if (typeof o === 'string') {
    if (/^\s*[\[{]/.test(o)) { try { walk(JSON.parse(o), k, inMenu, typed); return; } catch (e) {} }
    if (o.length > 200) return;
    const addM = (t) => { const key = t + '\u0000' + (typed || ''); if (!names.menu.has(key)) names.menu.set(key, [t, typed || '']); };
    if (k === 'food' || k === 'add_item') names.plate.add(o);
    else if (k === 'as_written' || k === 'name' && inMenu) addM(o);
    else if (k === 'with' && inMenu) addM(o.replace(/^\d{1,2}\s+/, ''));   // a side: the engine takes its leading count off first
    return; }
  if (Array.isArray(o)) { o.forEach(x => walk(x, k, inMenu, typed)); return; }
  if (o && typeof o === 'object') { const t = o.ctx && typeof o.ctx.text === 'string' ? o.ctx.text : typeof o.typed === 'string' ? o.typed : typed;
    for (const [kk, v] of Object.entries(o)) walk(v, kk, inMenu || kk === 'dishes' || kk === 'orders' || kk === 'leave', t); }
};
for (const f of files) { try { walk(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))); } catch (e) {} }
const out = [], total = names.plate.size + names.menu.size;
for (const t of [...names.plate].sort()) { const a = OLD.showName(OLD.rawName(t), {}), b = NEW.showName(NEW.rawName(t), {}); if (a !== b) out.push(`plate | ${JSON.stringify(t)} | ${JSON.stringify(a)} -> ${JSON.stringify(b)}`); }
let typedN = 0; for (const [t, typed] of [...names.menu.values()].sort()) { if (typed) typedN++;   // the new engine reads the typed menu for prices; the old one did not
  const a = OLD.showName(OLD.rawName(t), { price: 1 }), b = NEW.showName(NEW.rawName(t), { price: typed || 1 }); if (a !== b) out.push(`menu${typed ? ' (typed)' : ''} | ${JSON.stringify(t)} | ${JSON.stringify(a)} -> ${JSON.stringify(b)}`); }
const head = `# names-diff: ${total} recorded model names (${names.plate.size} plate path; ${names.menu.size} menu path, ${typedN} with their typed menu) from ${files.length} files under eval/; ${out.length} change between ${OLDREF} and this build.\n# Names are counted once each; titles and subtitles are not model names here (the engine writes them from the items).\n# kind | as recorded | old shown -> new shown ("" = not shown)\n`;
fs.writeFileSync(path.join(__dirname, 'names-diff.txt'), head + out.join('\n') + '\n');
console.log(head.trim());

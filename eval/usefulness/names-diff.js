// Every model name recorded under eval/, cleaned by the OLD showName (6b5e18d, the build the final audit and Critic round 38 judged) and by
// the NEW one (hosted/v6/index.html), on the path the name takes: plate items, swaps and one-tap items on the plate path; menu dishes,
// sides and leave entries on the menu path (no typed menu, as for a photo). Every name that changes is written to names-diff.txt as
// old -> new, for reading by hand: a change may only take off a count or a portion.
//   node eval/usefulness/names-diff.js            (writes eval/usefulness/names-diff.txt; exit 0)
const fs = require('fs'), path = require('path'), vm = require('vm'), { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..', '..'), OLDREF = process.env.OLDREF || '6b5e18d';
const core = (page) => { const o = '<script id="np-core">', a = page.indexOf(o) + o.length, ctx = vm.createContext({ console }); vm.runInContext(page.slice(a, page.indexOf('</script>', a)), ctx); return ctx; };
const OLD = core(execSync(`git show ${OLDREF}:hosted/v6/index.html`, { cwd: ROOT, maxBuffer: 64 << 20 }).toString()), NEW = core(fs.readFileSync(path.join(ROOT, 'hosted/v6/index.html'), 'utf8'));
const files = execSync('git ls-files eval', { cwd: ROOT }).toString().split('\n').filter(f => /\.json$/.test(f));
const names = { plate: new Set(), menu: new Set() };
const walk = (o, k, inMenu) => {
  if (typeof o === 'string') {
    if (/^\s*[\[{]/.test(o)) { try { walk(JSON.parse(o), k, inMenu); return; } catch (e) {} }
    if (o.length > 200) return;
    if (k === 'food' || k === 'add_item') names.plate.add(o);
    else if (k === 'as_written') names.menu.add(o);
    else if (k === 'with' && inMenu) names.menu.add(o.replace(/^\d{1,2}\s+/, ''));   // a side: the engine takes its leading count off first
    return; }
  if (Array.isArray(o)) { o.forEach(x => walk(x, k, inMenu)); return; }
  if (o && typeof o === 'object') for (const [kk, v] of Object.entries(o)) walk(v, kk, inMenu || kk === 'dishes' || kk === 'orders' || kk === 'leave');
};
for (const f of files) { try { walk(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))); } catch (e) {} }
const out = [], total = names.plate.size + names.menu.size;
for (const [kind, set, o] of [['plate', names.plate, {}], ['menu', names.menu, { price: 1 }]])
  for (const t of [...set].sort()) { const a = OLD.showName(OLD.rawName(t), o), b = NEW.showName(NEW.rawName(t), o); if (a !== b) out.push(`${kind} | ${JSON.stringify(t)} | ${JSON.stringify(a)} -> ${JSON.stringify(b)}`); }
const head = `# names-diff: ${total} recorded model names (${names.plate.size} plate path, ${names.menu.size} menu path) from ${files.length} files under eval/; ${out.length} change between ${OLDREF} and this build.\n# kind | as recorded | old shown -> new shown ("" = not shown)\n`;
fs.writeFileSync(path.join(__dirname, 'names-diff.txt'), head + out.join('\n') + '\n');
console.log(head.trim());

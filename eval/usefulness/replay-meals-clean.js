// Replay recorded live raw replies through a candidate's np-core with list-derived tags (an honest-tagging proxy).
const fs=require('fs'),vm=require('vm'),path=require('path');
const [,,CAND,REPO,MODE]=process.argv;const PLAIN=MODE==='plain';
const page=fs.readFileSync(path.join(CAND,'hosted/v6/index.min.html'),'utf8');
const a={};vm.createContext(a);vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0],a);
const GR=/\b(rice|roti|rotis|phulka|phulkas|chapati|paratha|millet|millets|jowar|bajra|ragi|oats|dalia|poha|upma|idli|dosa|khichdi|bread|quinoa|wheat|atta|naan|kulcha|thepla|bhakri|barley|maize|makki|chilla)\b/,WH=/\b(roti|rotis|phulka|phulkas|chapati|paratha|bread|wheat|atta|naan|kulcha|thepla|dalia|upma|sooji|rava|pasta)\b/;
const L=a.TAGLISTS?a.TAGLISTS():{};const tagsOf=t=>{t=String(t||'').toLowerCase();const o=a.foodRx?Object.keys(L).filter(k=>a.foodRx(L[k]).test(t)):[];if(GR.test(t)&&!o.includes('grain'))o.push('grain');if(WH.test(t)&&!o.includes('wheat'))o.push('wheat');if(PLAIN&&!o.length)o.push('plain');return o;};
const baseP={goal:'hold',focus:'none',diet:'veg',health:'none',region:'n',leave:[],sex:'f',age:46,cm:158,kg:68,act:'low'};
const baseC={lite:true,meal:'lunch',time:'1:10 pm',mode:'desk',mood:'best',cuisine:'indian',prep:'home',oil:'min',appetite:5};
const scen=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(REPO,'eval/v6/scenarios.json'))).map(s=>[s.id,s]));
const scenM=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(REPO,'eval/v6/scenarios-menu.json'))).map(s=>[s.id,s]));
const files=fs.readdirSync(path.join(REPO,'eval/v6')).filter(f=>/^results-live-r3[37]\.json$/.test(f));
const mfiles=fs.readdirSync(path.join(REPO,'eval/v6')).filter(f=>/^results-menu-live.*\.json$/.test(f));
const tag=m=>{(m.items||[]).forEach(i=>{if(!i.contains)i.contains=tagsOf(i.food);});
 if(m.grain&&m.grain.food){const it=(m.items||[]).find(i=>i.food===m.grain.food);if(it&&!it.contains.includes('grain'))it.contains.push('grain');}
 m.contains=[...new Set((m.items||[]).flatMap(i=>i.contains))];
 ['protein','base'].forEach(k=>((m.swaps||{})[k]||[]).forEach(s=>{if(!s.contains)s.contains=tagsOf(s.food+(k==='base'?' grain':''));}));
 Object.values(m.alchemy||{}).forEach(x=>{if(x&&!x.contains)x.contains=tagsOf((x.title_suffix||x.titleSuffix||'')+' '+(x.note||''));});};
const T={meals:{req:0,raw:0,out:0,zero:0,one:0,reasons:{},prose:{},proseRaw:{},swRaw:0,swOut:0,alRaw:0,alOut:0},menu:{req:0,raw:0,out:0,zero:0,reasons:{},prose:{},proseRaw:{}},errors:[]};
const add=(o,k,n=1)=>o[k]=(o[k]||0)+n;
for(const f of files){const res=JSON.parse(fs.readFileSync(path.join(REPO,'eval/v6',f)));
 for(const x of res){const s=scen[x.id];if(!s||s.kind!=='meals'||!x.reply||!x.reply.raw||x.got!=='ok')continue;
  const raw=JSON.parse(JSON.stringify(x.reply.raw));if(!raw.refer_reason)raw.refer_reason='none';(raw.meals||[]).forEach(tag);
  const p=Object.assign({},baseP,s.p),c=Object.assign({},baseC,s.c);let pl,out;
  try{pl=a.plan('meals',{profile:p,ctx:c,file:s.file||{}});if(pl.error||pl.reply){T.errors.push(f+':'+x.id+':'+(pl.error||'reply'));continue;}out=pl.check(raw);}catch(e){T.errors.push(f+':'+x.id+':'+String(e).slice(0,80));continue;}
  const t=T.meals;t.req++;const nr=(raw.meals||[]).length,no=(out.meals||[]).length;t.raw+=nr;t.out+=no;if(!no)t.zero++;if(no===1)t.one++;
  Object.entries(out.dropped||{}).forEach(([k,v])=>add(t.reasons,k,typeof v==='number'?v:1));
  (raw.meals||[]).forEach(m=>{t.swRaw+=((m.swaps||{}).protein||[]).length+((m.swaps||{}).base||[]).length;t.alRaw+=Object.keys(m.alchemy||{}).length;
   [['for_you',m.for_you],['why',(m.why||[]).length],['taste',(m.taste||[]).length],['subtitle',m.subtitle],['cuisine',m.cuisine]].forEach(([k,v])=>{if(v)add(t.proseRaw,k);});});
  if(raw.read)add(t.proseRaw,'read');if(out.read)add(t.prose,'read');
  (out.meals||[]).forEach(m=>{t.swOut+=(m.swaps.protein||[]).length+(m.swaps.base||[]).length;t.alOut+=Object.keys(m.alchemy||{}).length;
   [['for_you',m.forYou],['why',(m.why||[]).length],['taste',(m.taste||[]).length],['subtitle',m.subtitle],['cuisine',m.cuisine]].forEach(([k,v])=>{if(v)add(t.prose,k);});});
 }}
for(const f of mfiles){const res=JSON.parse(fs.readFileSync(path.join(REPO,'eval/v6',f)));const arr=Array.isArray(res)?res:[res];
 for(const x of arr){const s=scenM[x.id];if(!s||!x.reply||!x.reply.raw||x.got!=='ok')continue;
  const raw=JSON.parse(JSON.stringify(x.reply.raw));if(!raw.refer_reason)raw.refer_reason='none';
  (raw.dishes||[]).forEach(d=>{if(!d.contains)d.contains=tagsOf(d.as_written+' '+(d.grain_made_of||''));if(d.grain_made_of&&!d.contains.includes('grain'))d.contains.push('grain');if(!d.with_contains)d.with_contains=tagsOf(d.with);});
  (raw.leave||[]).forEach(d=>{if(!d.contains)d.contains=tagsOf(d.name||d.as_written);});
  const p=Object.assign({},baseP,s.p),c=Object.assign({},baseC,s.c);let pl,out;
  try{pl=a.plan('menu',Object.assign({profile:p,ctx:c,file:s.file||{}},s.body||{},{menu:s.menu||s.text||''}));if(pl.error||pl.reply){T.errors.push(f+':'+x.id+':'+(pl.error||'reply'));continue;}out=pl.check(raw);}catch(e){T.errors.push(f+':'+x.id+':'+String(e).slice(0,80));continue;}
  const t=T.menu;t.req++;const nr=(raw.dishes||[]).length,no=(out.orders||[]).length;t.raw+=nr;t.out+=no;if(!no)t.zero++;
  Object.entries(out.dropped||{}).forEach(([k,v])=>add(t.reasons,k,typeof v==='number'?v:1));
  ['tip','place'].forEach(k=>{if(raw[k])add(t.proseRaw,k);if(out[k])add(t.prose,k);});
  (raw.dishes||[]).forEach(d=>['ask','portion'].forEach(k=>{if(d[k])add(t.proseRaw,k);}));(out.orders||[]).forEach(d=>['ask','portion'].forEach(k=>{if(d[k])add(t.prose,k);}));
 }}
T.errors=T.errors.slice(0,12).concat(T.errors.length>12?['… '+T.errors.length+' errors']:[]);
console.log(JSON.stringify(T,null,1));

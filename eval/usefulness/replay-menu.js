const fs=require('fs'),vm=require('vm'),path=require('path');const [,,CAND,REPO,MODE]=process.argv;
const page=fs.readFileSync(path.join(CAND,'hosted/v6/index.min.html'),'utf8');const a={};vm.createContext(a);vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0],a);
const L=a.TAGLISTS?a.TAGLISTS():{};const GR=/\b(rice|roti|rotis|naan|kulcha|paratha|dosa|idli|uttapam|pongal|upma|biryani|pulao|noodles|pizza|pasta|bread|sandwich|millet|khichdi|chapati|phulka)\b/,WH=/\b(roti|rotis|naan|kulcha|paratha|pizza|pasta|bread|sandwich|noodles|chapati|phulka|upma)\b/;
const tagsOf=t=>{t=String(t||'').toLowerCase();const o=a.foodRx?Object.keys(L).filter(k=>a.foodRx(L[k]).test(t)):[];if(GR.test(t)&&!o.includes('grain'))o.push('grain');if(WH.test(t)&&!o.includes('wheat'))o.push('wheat');if(MODE==='plain'&&!o.length)o.push('plain');return o;};
const baseP={goal:'hold',focus:'none',diet:'veg',health:'none',region:'n',leave:[],sex:'f',age:46,cm:158,kg:68,act:'low'};
const sc=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(REPO,'eval/v6/scenarios-menu.json'))).map(s=>[s.id,s]));
const base={meal:'dinner',time:'8:30 pm',mode:'desk',appetite:5,lite:true,mood:'best',cuisine:'indian',prep:'order',oil:'min'};
let rows=[],tot={req:0,shown:0,stored:0,reasons:{}};
for(const f of ['results-menu-live-r33.json','results-menu-live-r37.json'])for(const x of JSON.parse(fs.readFileSync(path.join(REPO,'eval/v6',f)))){const s=sc[x.id];if(!s||x.got!=='ok'||!x.reply.raw)continue;
 const raw=JSON.parse(JSON.stringify(x.reply.raw));if(!raw.refer_reason)raw.refer_reason='none';(raw.dishes||[]).forEach(d=>{if(!d.contains)d.contains=tagsOf(d.as_written+' '+(d.grain_made_of||''));if(d.grain_made_of&&!d.contains.includes('grain'))d.contains.push('grain');if(!d.with_contains)d.with_contains=d.with?tagsOf(d.with):[];});(raw.leave||[]).forEach(d=>{if(!d.contains)d.contains=tagsOf(d.name||'');});
 const out=a.plan('menu',{profile:Object.assign({},baseP,s.p),ctx:Object.assign({},base,s.c),file:s.file||{}}).check(raw);tot.req++;tot.shown+=(out.orders||[]).length;tot.stored+=(x.reply.orders||[]).length;Object.entries(out.dropped||{}).forEach(([k,v])=>tot.reasons[k]=(tot.reasons[k]||0)+(typeof v==='number'?v:1));
 rows.push(x.id+' '+(x.reply.orders||[]).length+'->'+(out.orders||[]).length);}
console.log(JSON.stringify(tot));console.log(rows.join(' | '));

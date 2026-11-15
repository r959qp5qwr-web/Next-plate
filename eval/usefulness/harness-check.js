const fs=require('fs'),vm=require('vm'),path=require('path');const [,,CAND,REPO]=process.argv;
const page=fs.readFileSync(path.join(CAND,'hosted/v6/index.min.html'),'utf8');const a={};vm.createContext(a);vm.runInContext(page.split('<script id="np-core">')[1].split('</script>')[0],a);
const baseP={goal:'hold',focus:'none',diet:'veg',health:'none',region:'n',leave:[],sex:'f',age:46,cm:158,kg:68,act:'low'},baseC={lite:true,meal:'lunch',time:'1:10 pm',mode:'desk',mood:'best',cuisine:'indian',prep:'home',oil:'min',appetite:5};
const sc=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(REPO,'eval/v6/scenarios.json'))).map(s=>[s.id,s]));
for(const f of fs.readdirSync(path.join(REPO,'eval/v6')).filter(f=>/^results-live.*\.json$/.test(f)&&!/tune/.test(f))){let st=0,rp=0,n=0,mis=[];
 for(const x of JSON.parse(fs.readFileSync(path.join(REPO,'eval/v6',f)))){const s=sc[x.id];if(!s||s.kind!=='meals'||x.got!=='ok'||!x.reply.raw)continue;n++;const raw=JSON.parse(JSON.stringify(x.reply.raw));if(!raw.refer_reason)raw.refer_reason='none';
  const out=a.plan('meals',{profile:Object.assign({},baseP,s.p),ctx:Object.assign({},baseC,s.c),file:s.file||{}}).check(raw);st+=x.reply.meals.length;rp+=out.meals.length;if(out.meals.length!==x.reply.meals.length)mis.push(x.id+' '+x.reply.meals.length+'->'+out.meals.length+' '+JSON.stringify(out.dropped));}
 console.log(f.padEnd(28),'requests',n,'stored',st,'replayed',rp,mis.slice(0,3).join(' | '));}

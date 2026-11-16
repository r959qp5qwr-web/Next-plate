const fs=require('fs');const [,,BASE,PASS]=process.argv,KEY=process.env.NP_KEY||'';
const miss=JSON.parse(fs.readFileSync(__dirname+'/missed.json','utf8'));
const P={goal:'hold',focus:'none',diet:'veg',health:'none',region:'n',leave:[],sex:'f',age:34,cm:158,kg:64,act:'low'};
const C={lite:true,meal:'lunch',time:'1:10 pm',hour:13.2,dayNo:320,mode:'desk',mood:'best',cuisine:'indian',prep:'home',oil:'min',appetite:5};
(async()=>{const out=[];for(const [g,t] of miss){let st=0,j={};const t0=Date.now();
 try{const r=await fetch(BASE+'/api/meals',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:KEY,profile:P,ctx:Object.assign({},C,{text:t}),file:{}})});st=r.status;j=await r.json();}catch(e){j={code:'fetch '+e};}
 const got=st===200?(j.status||(j.reply?'reply':'?')):'http-'+st+':'+(j.code||'');
 out.push({g,t,got,ms:Date.now()-t0,reply:j});console.log(PASS,got.padEnd(8),g,t);await new Promise(z=>setTimeout(z,300));}
 fs.writeFileSync(__dirname+'/res-'+PASS+'.json',JSON.stringify(out,null,1));})();

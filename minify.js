// node minify.js: builds hosted/server.min.ts, a smaller copy of hosted/server.ts for pasting into Railway
const fs=require('fs'),esb=require('/tmp/sdkchk/node_modules/esbuild');
const page=fs.readFileSync('hosted/index.html','utf8');
const mjs=s=>esb.transformSync(s,{minify:true,charset:'ascii',target:'es2018',supported:{'template-literal':false}}).code.trim();
const mcss=s=>esb.transformSync(s,{loader:'css',minify:true,charset:'ascii'}).code.trim();
let p=page.replace(/<script id="np-core">([\s\S]*?)<\/script>/,(m,c)=>'<script id="np-core">'+esb.transformSync(c,{minify:true,minifyIdentifiers:false,charset:'ascii',target:'es2018',supported:{'template-literal':false}}).code.trim()+'</script>')
 .replace(/<script>([\s\S]*?)<\/script>/,(m,c)=>'<script>'+mjs(c)+'</script>')
 .replace(/<style>([\s\S]*?)<\/style>/g,(m,c)=>'<style>'+mcss(c)+'</style>')
 .replace(/>\s+</g,'><');
if(/`|\$\{/.test(p)) throw new Error('backtick or ${ in minified page');
fs.writeFileSync('hosted/index.min.html',p);
const head=fs.readFileSync('src/server.ts','utf8');
const asc=p.replace(/[^\x00-\x7f]/gu,c=>'${String.fromCodePoint(0x'+c.codePointAt(0).toString(16)+')}');
const src=head.replace('/*PAGE*/',()=>asc).replace(/^\/\*[\s\S]*?\*\/\n/,'/* Next Plate hosted server (Gemini). Readable source: src/server.ts and hosted/README.md */\n');
fs.writeFileSync('hosted/server.min.ts',src);
console.log('page',page.length,'->',p.length,' server',fs.statSync('hosted/server.ts').size,'->',src.length,' ascii',!/[^\x00-\x7f]/.test(src));

// The menu photographed for "Read the menu" in the features film: a plain printed lunch menu made for the film (no restaurant name or branding),
// shot at a slight angle on a table so it reads as a phone photo.   node demo/reel/film5/menu-prop.js  ->  demo/reel/film5/assets/menu-photo.jpg
const { chromium } = require('playwright');
const MENU = [['Starters', [['Paneer Tikka', 280], ['Hara Bhara Kabab', 220], ['Veg Manchurian (dry)', 240], ['Masala Papad', 90]]],
  ['Main course', [['Dal Tadka', 240], ['Dal Makhani', 290], ['Palak Paneer', 300], ['Kadhai Paneer', 320], ['Chole Masala', 260], ['Mix Veg', 240]]],
  ['Rice and breads', [['Jeera Rice', 180], ['Veg Biryani', 280], ['Tandoori Roti', 30], ['Butter Naan', 60], ['Missi Roti', 45]]],
  ['On the side', [['Cucumber Raita', 90], ['Green Salad', 80], ['Sprouts Salad', 120]]],
  ['Sweets', [['Gulab Jamun (2)', 110], ['Rasmalai (2)', 140]]]];
const rows = MENU.map(([h, items]) => `<h3>${h}</h3>` + items.map(([n, p]) => `<p><span>${n}</span><i></i><b>${p}</b></p>`).join('')).join('');
const html = `<html><body style="margin:0;width:1200px;height:1600px;background:radial-gradient(circle at 40% 35%,#8a6a4c,#4c3624);display:grid;place-items:center;overflow:hidden">
<div style="width:760px;padding:56px 64px 60px;background:#FBF7EE;transform:rotate(-1.2deg) perspective(1600px) rotateX(6deg);box-shadow:0 40px 60px -20px rgba(0,0,0,.6);font-family:Georgia,serif;color:#2a2018">
<h1 style="text-align:center;font-size:44px;letter-spacing:.3em;margin:0 0 6px">MENU</h1><div style="text-align:center;font-size:20px;font-style:italic;margin-bottom:24px;color:#6a5a48">Lunch, 12 to 4</div>
<style>h3{font-size:24px;letter-spacing:.14em;text-transform:uppercase;margin:22px 0 8px;border-bottom:1.5px solid #2a2018;padding-bottom:4px}p{display:flex;align-items:baseline;gap:10px;margin:7px 0;font-size:25px}i{flex:1;border-bottom:2px dotted #9a8a76}b{font-weight:400}</style>${rows}</div>
<div style="position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,240,210,.18),rgba(0,0,0,.18))"></div></body></html>`;
(async () => { const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1200, height: 1600 } }); await p.setContent(html);
  await p.screenshot({ path: 'demo/reel/film5/assets/menu-photo.jpg', type: 'jpeg', quality: 82 }); await b.close(); console.log('menu photo written'); })();

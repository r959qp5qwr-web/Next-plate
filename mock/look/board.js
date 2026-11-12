// Before / after boards from the mock-up screens:  node mock/look/board.js
const { chromium } = require('playwright'), fs = require('fs'), D = 'screens/look-mock/';
const img = f => 'data:image/png;base64,' + fs.readFileSync(D + f).toString('base64');
const col = (f, cap) => `<figure><figcaption>${cap}</figcaption><img src="${img(f)}"></figure>`;
const page = cols => `<html><body style="margin:0;background:#E9E1D3;font:600 26px Georgia;color:#1D1A16"><div style="display:flex;gap:28px;padding:28px">${cols}</div>
<style>figure{margin:0}figcaption{margin:0 0 12px 4px}img{width:390px;border-radius:18px;box-shadow:0 10px 30px -12px rgba(60,44,28,.5)}</style></body></html>`;
const boards = {
  'board-1-plate': col('before/2-plate.png', 'Now') + col('after/2-plate.png', 'Mock-up'),
  'board-2-cards': col('before/3-title-cards.png', 'Now') + col('after/3-title-cards.png', 'Mock-up'),
  'board-3-pairs-builder': col('after/4-serve-pairs.png', 'Mock-up: pair it') + col('after/7-builder.png', 'Mock-up: Builder'),
};
(async () => { const b = await chromium.launch(), p = await b.newPage({ deviceScaleFactor: 2, viewport: { width: 900, height: 100 } });
  for (const [n, cols] of Object.entries(boards)) { await p.setContent(page(cols)); await p.waitForTimeout(200); await p.screenshot({ path: D + n + '.png', fullPage: true }); }
  await b.close(); console.log('boards written'); })();

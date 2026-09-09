// MEGA-BATCH RAGETAN ROUND 5/6: verifikasi NYATA checkpoint massive50m
// (round 4/5, 5707 step akumulasi) dan massive100m (round 6, fresh init)
// bisa dipulihkan lewat LLMCheckpoint + generateCached JS murni, PERSIS
// seperti runtime browser akan memakainya - bukan asumsi format cocok.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const BASE = process.argv[2] || 'http://localhost:8099';

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(async () => {
    const { RATEGOAN } = await import('/raget/raget-neural/llm-core.js');
    const out = {};

    const res50 = await fetch('/raget/raget-data/neural/raget-neural-massive50m.safetensors');
    const buf50 = await res50.arrayBuffer();
    RATEGOAN.restoreFromCheckpointSafetensors(buf50);
    out.stats50 = RATEGOAN.getStats();
    const gen50 = await RATEGOAN.generateText('Apa ibu kota Indonesia?', { maxNewTokens: 15, minNewTokens: 4, greedy: false });
    out.gen50 = gen50 && gen50.text;

    const res100 = await fetch('/raget/raget-data/neural/raget-neural-massive100m.safetensors');
    const buf100 = await res100.arrayBuffer();
    RATEGOAN.restoreFromCheckpointSafetensors(buf100);
    out.stats100 = RATEGOAN.getStats();
    const gen100 = await RATEGOAN.generateText('Apa ibu kota Indonesia?', { maxNewTokens: 15, minNewTokens: 4, greedy: false });
    out.gen100 = gen100 && gen100.text;

    return out;
  });

  await browser.close();
  console.log(JSON.stringify({ result, consoleErrors }, null, 2));
  if (consoleErrors.length) { console.error('ADA error console.'); process.exit(1); }
  if (!result.gen50 || !result.gen100) { console.error('GAGAL: salah satu checkpoint tidak menghasilkan teks.'); process.exit(1); }
  console.log('\nLOLOS: massive50m (' + result.stats50.parameterCount + ' param) dan massive100m (' + result.stats100.parameterCount + ' param) keduanya berhasil dimuat + generate via runtime JS murni.');
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });

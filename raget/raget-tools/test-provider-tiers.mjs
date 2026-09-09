// MEGA-BATCH RAGETAN ROUND 6 - FASE 4: verifikasi NYATA (Chromium) provider
// neural 3-tingkat (neural-provider.js + js/state/llm-mode.js) - checkpoint
// 50M dan 100M keduanya bisa dimuat+generate via jalur yang akan dipakai
// app sungguhan (BUKAN skrip Python terpisah).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const BASE = process.argv[2] || 'http://localhost:8099';

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(async () => {
    const { neuralProvider } = await import('/raget/raget-neural/neural-provider.js');
    const { llmMode } = await import('/js/state/llm-mode.js');
    const out = {};

    llmMode.setMode('lokal-ringan');
    const okRingan = await neuralProvider.init();
    out.ringanReady = neuralProvider.ready();
    out.ringanInit = okRingan;
    const statsRingan = await neuralProvider.getStats();
    out.ringanStats = statsRingan;
    const textRingan = await neuralProvider.generate([], 'Halo, apa kabar?');
    out.ringanText = textRingan;

    llmMode.setMode('lokal-berat');
    const textBerat = await neuralProvider.generate([], 'Apa itu Indonesia?');
    out.beratText = textBerat;
    const statsBerat = await neuralProvider.getStats();
    out.beratStats = statsBerat;

    return out;
  });

  await browser.close();
  console.log(JSON.stringify({ result, consoleErrors }, null, 2));
  if (consoleErrors.length) { console.error('ADA error console.'); process.exit(1); }
  if (!result.ringanText || !result.beratText) { console.error('GAGAL: salah satu tingkat tidak menghasilkan teks.'); process.exit(1); }
  console.log('\nLOLOS: tingkat ringan (tier=' + result.ringanStats.tier + ') dan berat (tier=' + result.beratStats.tier + ') keduanya menghasilkan output valid.');
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });

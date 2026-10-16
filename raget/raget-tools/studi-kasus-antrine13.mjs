import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.env.STUDI_BASE || 'http://127.0.0.1:8080';
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../screenshots');
fs.mkdirSync(outDir, { recursive: true });
const findings = [];
function note(ok, name, detail) {
  findings.push({ ok: !!ok, name, detail: String(detail || '') });
  console.log((ok ? 'LULUS' : 'GAGAL') + '  ' + name + ' — ' + detail);
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const errors = [];
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
page.on('pageerror', (err) => errors.push(String(err)));
await page.addInitScript(() => {
  try {
    localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
    localStorage.removeItem('rategoan_weights_1_5b_installed');
  } catch (e) { void e; }
});
await page.route('**/*', (route) => {
  const url = route.request().url();
  if (url.includes('huggingface.co')) return route.abort();
  return route.continue();
});
await page.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#chat-input', { timeout: 15000 });
const place = await page.evaluate(() => {
  const bar = document.getElementById('top-download-bar');
  const card = document.getElementById('weight-card');
  const composer = document.getElementById('composer');
  return {
    bar: !!bar,
    inBar: !!(bar && card && bar.contains(card)),
    inComposer: !!(composer && card && composer.contains(card)),
    pause: !!document.getElementById('btn-weight-pause'),
    cancel: !!document.getElementById('btn-weight-cancel'),
  };
});
note(place.bar && place.inBar && !place.inComposer, 'bar unduhan di header', JSON.stringify(place));
note(place.pause && place.cancel, 'jeda dan batal ada', 'ada');
const sources = await page.evaluate(async () => {
  async function text(file) {
    const res = await fetch(file);
    return res.ok ? await res.text() : '';
  }
  return {
    adapter: await text('/raget/raget-neural/neural-adapter.js'),
    provider: await text('/raget/raget-neural/neural-provider.js'),
    worker: await text('/raget/raget-neural/runtime/raget-worker.js'),
    down: await text('/raget/raget-neural/runtime/model-downloader.js'),
  };
});
note(!/setTimeout\(\(\) => ctrl\.abort\(\)/.test(sources.adapter) && !sources.adapter.includes('INFERENCE_MS'), 'tanpa abort 30 detik', 'adapter');
note(sources.worker.includes('90000') && sources.provider.includes('pendingPrompt'), 'prefill 90 detik dan antrean', 'ada');
note(sources.down.includes('committedVerifiedBytes') && sources.down.includes('wAttempt'), 'byte terverifikasi dan ulang OPFS', 'ada');
note(!sources.provider.includes('function prefetchBest'), 'prefetchBest hilang', 'bersih');
await page.fill('#chat-input', 'hallo');
await page.click('#btn-send');
await page.waitForTimeout(1500);
const chat = await page.evaluate(() => ((document.getElementById('messages') || document.body).innerText || '').replace(/\s+/g, ' '));
note(!chat.includes('dibatalkan'), 'hallo tidak dibatalkan timer', chat.slice(-320));
note(chat.includes('Bobot sedang diunduh'), 'antrean unduhan, bukan sapaan', chat.slice(-320));
note(!/Selamat pagi[,.]?\s+saya/.test(chat), 'tanpa sapaan template', chat.slice(-240));
note(!errors.some((line) => /createSyncAccessHandle is not a function/.test(line)), 'tanpa TypeError OPFS di utas utama', errors.join(' | ') || 'bersih');
await page.screenshot({ path: outDir + '/antrine13-chat.png' });
await browser.close();
const failed = findings.filter((row) => !row.ok);
fs.writeFileSync(outDir + '/antrine13-hasil.json', JSON.stringify({ findings, errors }, null, 2));
if (failed.length) {
  console.log('GAGAL ' + failed.length + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS ' + findings.length + '/' + findings.length);

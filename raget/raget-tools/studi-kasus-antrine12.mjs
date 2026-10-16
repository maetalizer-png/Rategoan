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
const link = await page.evaluate(() => {
  const el = document.getElementById('btn-studio');
  return el ? { target: el.getAttribute('target'), href: el.getAttribute('href') } : {};
});
note(link.target === '_blank' && link.href === 'studio.html', 'studio tidak menutup unduhan', JSON.stringify(link));
const sources = await page.evaluate(async () => {
  async function text(file) {
    const res = await fetch(file);
    return res.ok ? await res.text() : '';
  }
  return {
    provider: await text('/raget/raget-neural/neural-provider.js'),
    cache: await text('/raget/raget-neural/runtime/weight-cache.js'),
    worker: await text('/raget/raget-neural/runtime/raget-worker.js'),
    composer: await text('/js/chat/composer.js'),
    down: await text('/raget/raget-neural/runtime/model-downloader.js'),
  };
});
note(!sources.provider.includes('createSyncAccessHandle') && !sources.provider.includes('clearInstalled'), 'boot tidak mencabut bobot', 'bersih');
note(sources.cache.includes('getFile()') && sources.cache.includes('JSON.parse') && sources.cache.includes('embedding.weight'), 'header dibaca utuh', 'ada');
note(sources.provider.includes('maxLayers: 0') && !sources.provider.includes('maxLayers: 4'), '28 lapisan utuh', '0');
note(sources.provider.includes('Bobot sedang diunduh (') && !/loaded:\s*0/.test(sources.provider), 'tanpa reset 0%', 'ada');
note(sources.composer.includes('Obrolan akan otomatis aktif setelah unduhan selesai 100%.'), 'antrean jujur', 'ada');
note(sources.down.includes('export function maskedBytes'), 'bitmask resume', 'ada');
note(sources.worker.includes('arm()'), 'watchdog mengikut token', 'ada');
await page.fill('#chat-input', 'hallo');
await page.click('#btn-send');
await page.waitForTimeout(1200);
const chat = await page.evaluate(() => ((document.getElementById('messages') || document.body).innerText || '').replace(/\s+/g, ' '));
note(!chat.includes('Menjawab menggunakan partisi terunduh'), 'tidak mengaku menjawab dari partisi', chat.slice(-320));
note(!/Selamat pagi[,.]?\s+saya/.test(chat), 'tanpa sapaan template', chat.slice(-240));
note(!errors.some((line) => /createSyncAccessHandle is not a function/.test(line)), 'tanpa TypeError OPFS di utas utama', errors.join(' | ') || 'bersih');
await page.screenshot({ path: outDir + '/antrine12-chat.png' });
await browser.close();
const failed = findings.filter((row) => !row.ok);
fs.writeFileSync(outDir + '/antrine12-hasil.json', JSON.stringify({ findings, errors }, null, 2));
if (failed.length) {
  console.log('GAGAL ' + failed.length + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS ' + findings.length + '/' + findings.length);

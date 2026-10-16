import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.env.STUDI_BASE || 'http://127.0.0.1:8099';
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
await page.waitForFunction(() => {
  const card = document.getElementById('weight-card');
  const btn = document.getElementById('btn-weight');
  return card && !card.hidden && btn && /997 MB/.test(btn.textContent || '');
}, { timeout: 15000 });
const home = await page.evaluate(() => {
  const btn = document.getElementById('btn-weight');
  const status = document.getElementById('weight-status');
  return {
    button: btn ? btn.textContent : '',
    status: status ? status.textContent : '',
  };
});
note(/997 MB/.test(home.button), 'tombol unduh di beranda', home.button);
note(home.status.includes('Belum Terpasang'), 'status bobot kosong', home.status);
await page.fill('#chat-input', 'Ini yang bales siapa');
await page.click('#btn-send');
await page.waitForTimeout(800);
const chat = await page.evaluate(() => ((document.getElementById('messages') || document.body).innerText || '').replace(/\s+/g, ' '));
note(!chat.includes('Bobot Raget 1.0 belum termuat'), 'tanpa gelembung galat bobot', chat.slice(-240));
note(!chat.includes('Motret Pakai Ponsel'), 'tanpa artikel fotografi', chat.slice(-240));
note(!chat.includes('Mulai dari yang kecil'), 'tanpa sapaan kaleng', chat.slice(-240));
await page.screenshot({ path: outDir + '/antrine9-chat.png' });

await page.click('#btn-menu');
await page.click('#btn-settings');
await page.waitForSelector('.cat-row[data-cat="ai"]', { timeout: 15000 });
await page.click('.cat-row[data-cat="ai"]');
await page.waitForSelector('#btn-unduh-offline', { state: 'visible', timeout: 15000 });
const model = await page.evaluate(() => {
  const hub = document.querySelector('.model-hub');
  const btn = document.getElementById('btn-unduh-offline');
  const status = document.getElementById('model-weight-status');
  return {
    hub: hub ? hub.innerText.replace(/\s+/g, ' ') : '',
    button: btn ? btn.textContent : '',
    status: status ? status.textContent : '',
  };
});
note(model.hub.includes('Raget 1.0') && model.hub.includes('997'), 'model tunggal', model.hub.slice(0, 180));
note(!model.hub.includes('Tukar SDP') && !model.hub.includes('P2P'), 'tanpa mesh', model.hub.slice(0, 180));
note(/Belum Terpasang|Sedang Mengunduh/.test(model.status), 'status penyimpanan', model.status);
note(model.button.includes('Unduh Bobot Offline'), 'tombol aksi tunggal', model.button);
await page.screenshot({ path: outDir + '/antrine9-model.png' });

await page.click('#btn-back, .back-btn, #settings-back').catch(() => {});
const back = page.locator('#btn-settings-back, #settings-back, .settings-back').first();
if (await back.count()) await back.click().catch(() => {});
await page.goto(base + '/index.html#/settings', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.cat-row[data-cat="privasi"]', { timeout: 15000 });
await page.click('.cat-row[data-cat="privasi"]');
await page.waitForSelector('#row-privacy', { timeout: 8000 });
const privacy = await page.evaluate(() => {
  const row = document.getElementById('row-privacy');
  return {
    icon: !!(row && row.querySelector('.side-icon')),
    arrow: !!(row && row.querySelector('.set-arrow')),
  };
});
note(privacy.icon && privacy.arrow, 'ikon privasi dan chevron', JSON.stringify(privacy));

await page.goto(base + '/index.html#/settings', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.cat-row[data-cat="data"]', { timeout: 15000 });
await page.click('.cat-row[data-cat="data"]');
await page.waitForSelector('#row-cache', { timeout: 8000 });
const data = await page.evaluate(() => {
  const cache = document.getElementById('row-cache');
  const clear = document.getElementById('row-clear-cache');
  return {
    cpu: !!(cache && cache.querySelector('.side-icon')),
    trash: !!(clear && clear.querySelector('.side-icon')),
  };
});
note(data.cpu && data.trash, 'ikon cache dan tong sampah', JSON.stringify(data));
await page.screenshot({ path: outDir + '/antrine9-data.png' });
note(errors.length === 0, 'konsol tanpa galat', errors.join(' | ') || 'bersih');
const failed = findings.filter((row) => !row.ok);
console.log((failed.length ? 'GAGAL ' : 'LULUS ') + (findings.length - failed.length) + '/' + findings.length);
await browser.close();
process.exit(failed.length ? 1 : 0);

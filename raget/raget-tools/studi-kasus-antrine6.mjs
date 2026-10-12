import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.env.STUDI_BASE || 'http://127.0.0.1:8080';
const outDir = '/workspace/screenshots';
fs.mkdirSync(outDir, { recursive: true });
const findings = [];
function note(ok, name, detail) {
  findings.push({ ok: !!ok, name, detail: String(detail || '') });
  console.log((ok ? 'LULUS' : 'GAGAL') + '  ' + name + ' — ' + detail);
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const errors = [];
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
page.on('pageerror', (err) => errors.push('chat ' + err));
await page.addInitScript(() => {
  try {
    localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
  } catch (e) { /* iframe */ }
});
await page.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#btn-model', { timeout: 15000 });
await page.click('#btn-model');
await page.waitForSelector('#persona-select', { timeout: 15000 });
const chat = await page.evaluate(() => {
  const select = document.getElementById('persona-select');
  const labels = Array.from(select.options).map((opt) => opt.textContent);
  const status = document.getElementById('model-status');
  return { labels, status: status ? status.textContent : '' };
});
note(chat.labels.indexOf('Umum') >= 0 && chat.labels.indexOf('Koding & Algoritma') >= 0, 'pemilih persona', chat.labels.join(' | '));
note(chat.status === 'Cepat' || chat.status === 'Mendalam', 'status bar', chat.status);
await page.screenshot({ path: outDir + '/antrine6-chat.png' });

const studio = await browser.newPage({ viewport: { width: 1280, height: 800 } });
studio.on('pageerror', (err) => errors.push('studio ' + err));
await studio.addInitScript(() => {
  try {
    localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
  } catch (e) { /* iframe */ }
});
await studio.goto(base + '/studio.html', { waitUntil: 'domcontentloaded' });
await studio.waitForSelector('#studio-app');
await studio.evaluate(() => {
  const app = document.getElementById('studio-app');
  app.classList.remove('is-canvas-hidden');
  app.classList.add('is-split');
  document.querySelectorAll('.tab-panel').forEach((el) => { el.hidden = false; });
});
await studio.waitForSelector('#btn-inspect-dom', { state: 'attached' });
await studio.click('#btn-inspect-dom');
const ui = await studio.evaluate(() => ({
  pressed: document.getElementById('btn-inspect-dom').getAttribute('aria-pressed'),
  inspect: document.body.dataset.inspect,
  full: !!document.getElementById('btn-view-full'),
}));
const served = await studio.evaluate(async () => {
  const app = await (await fetch('/js/studio/studio-app.js')).text();
  const voice = await (await fetch('/js/chat/voice.js')).text();
  return {
    heal: app.includes('Perbaiki Otomatis'),
    mic: voice.includes('getUserMedia({ audio: true })'),
  };
});
note(served.heal, 'tombol perbaiki otomatis di aplikasi', String(served.heal));
note(served.mic, 'mikrofon terikat VAD', String(served.mic));
note(ui.pressed === 'true' && ui.inspect === '1', 'inspeksi visual', ui.inspect);
note(ui.full, 'tombol pratinjau penuh', String(ui.full));
await studio.click('[data-tab="files"]');
await studio.click('#btn-view-full');
const width = await studio.evaluate(() => document.getElementById('studio-preview-frame').style.width);
note(width === '100%', 'lebar penuh', width);
await studio.screenshot({ path: outDir + '/antrine6-studio.png' });

const bad = errors.filter((err) => !/localStorage|SecurityError|AudioContext|NotSupportedError|play\(\)|NotAllowedError/.test(err));
note(bad.length === 0, 'konsol tanpa galat', bad.join(' | ') || 'bersih');
await browser.close();
fs.writeFileSync(outDir + '/antrine6-hasil.json', JSON.stringify({ findings, errors }, null, 2));
const failed = findings.filter((item) => !item.ok);
if (failed.length) {
  console.log('GAGAL ' + (findings.length - failed.length) + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS ' + findings.length + '/' + findings.length);

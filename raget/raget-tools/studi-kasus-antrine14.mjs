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

async function boot(page) {
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
      localStorage.removeItem('rategoan_weights_1_5b_installed');
    } catch (e) { /* bingkai terkunci */ }
  });
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('huggingface.co')) return route.abort();
    return route.continue();
  });
}

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await boot(phone);
await phone.goto(base + '/index.html#/settings/data', { waitUntil: 'domcontentloaded' });
await phone.waitForSelector('#view-settings .settings-header', { timeout: 15000 });
const settings = await phone.evaluate(() => {
  const header = document.querySelector('#view-settings .settings-header');
  const box = header ? header.getBoundingClientRect() : { top: 99, height: 0 };
  const bar = document.getElementById('top-download-bar');
  const barBox = bar ? bar.getBoundingClientRect() : { height: 0, width: 0 };
  const chat = document.getElementById('view-chat');
  return {
    top: Math.round(box.top),
    height: Math.round(box.height),
    chatHidden: !!(chat && chat.hidden),
    barHeight: Math.round(barBox.height),
    inChat: !!(bar && chat && chat.contains(bar)),
  };
});
note(settings.inChat && settings.chatHidden, 'bar di dalam view chat', JSON.stringify(settings));
note(settings.top <= 1 && settings.barHeight === 0, 'pengaturan tidak didorong bar unduhan', 'y=' + settings.top + ' bar=' + settings.barHeight);

await phone.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await phone.waitForSelector('#top-download-bar', { timeout: 15000 });
await phone.evaluate(() => {
  const status = document.getElementById('weight-status');
  const bar = document.getElementById('top-download-bar');
  const card = document.getElementById('weight-card');
  if (status) status.dataset.busy = '1';
  if (bar) bar.hidden = false;
  if (card) card.hidden = false;
});
const pill = await phone.evaluate(() => {
  const card = document.getElementById('weight-card');
  const btn = document.getElementById('btn-weight');
  const box = card ? card.getBoundingClientRect() : { height: 999 };
  const btnStyle = btn ? getComputedStyle(btn).display : '';
  return { height: Math.round(box.height), btn: btnStyle };
});
note(pill.btn === 'none' && pill.height > 0 && pill.height <= 36, 'kapsul unduhan ramping', JSON.stringify(pill));

const desk = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await boot(desk);
await desk.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await desk.waitForSelector('#top-download-bar', { timeout: 15000 });
await desk.evaluate(() => {
  const bar = document.getElementById('top-download-bar');
  const card = document.getElementById('weight-card');
  if (bar) bar.hidden = false;
  if (card) card.hidden = false;
});
const place = await desk.evaluate(() => {
  const bar = document.getElementById('top-download-bar');
  const side = document.getElementById('sidebar');
  const box = bar.getBoundingClientRect();
  const sideBox = side ? side.getBoundingClientRect() : { width: 0, right: 0 };
  return {
    left: Math.round(box.left),
    top: Math.round(box.top),
    width: Math.round(box.width),
    height: Math.round(box.height),
    sideWidth: Math.round(sideBox.width),
    inSide: !!(side && side.contains(bar)),
  };
});
note(!place.inSide && place.left === 403 && place.top === 103 && place.width === 820 && place.height === 50, 'desktop labuh chat 403x103 820x50', JSON.stringify(place));
note(place.width === 820 && place.sideWidth === 260, 'lebar kolom chat 820 sidebar 260', String(place.width) + '/' + place.sideWidth);

const gate = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
gate.on('pageerror', (err) => errors.push(String(err)));
await gate.addInitScript(() => {
  try { localStorage.removeItem('rategoan_auth'); } catch (e) { /* kosong */ }
});
await gate.goto(base + '/index.html#/login', { waitUntil: 'domcontentloaded' });
await gate.waitForTimeout(400);
const login = await gate.evaluate(() => {
  const bar = document.getElementById('top-download-bar');
  const box = bar ? bar.getBoundingClientRect() : { height: 0 };
  return { height: Math.round(box.height), auth: document.body.classList.contains('auth-gate') };
});
note(login.auth && login.height === 0, 'login gate tanpa bar unduhan', JSON.stringify(login));

await desk.screenshot({ path: outDir + '/antrine14-desktop.png' });
await phone.screenshot({ path: outDir + '/antrine14-ponsel.png' });
await browser.close();
const failed = findings.filter((row) => !row.ok);
fs.writeFileSync(outDir + '/antrine14-hasil.json', JSON.stringify({ findings, errors, place: typeof place === 'undefined' ? null : place }, null, 2));
if (failed.length) {
  console.log('GAGAL ' + failed.length + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS ' + findings.length + '/' + findings.length);

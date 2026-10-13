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
    localStorage.setItem('raget_engine_preference', 'cloud');
  } catch (e) { /* bingkai terkunci */ }
});
await page.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#btn-model', { timeout: 15000 });
await page.waitForFunction(() => {
  const card = document.getElementById('weight-card');
  return card && !card.hidden;
}, { timeout: 15000 });
const chat = await page.evaluate(() => {
  const card = document.getElementById('weight-card');
  const row = document.querySelector('.card-row');
  return {
    weightHidden: !card || card.hidden,
    persona: !!document.querySelector('#persona-select, #persona-select-settings'),
    rowSelect: !!(row && row.querySelector('select')),
  };
});
note(!chat.weightHidden, 'banner unduh di beranda', String(chat.weightHidden));
note(!chat.persona && !chat.rowSelect, 'tidak ada pemilih persona', String(chat.persona));
await page.click('#btn-model');
await page.waitForSelector('#model-sheet:not([hidden])');
await page.click('#model-sheet .model-speed');
const sheet = await page.evaluate(() => {
  const text = (document.getElementById('model-sheet') || {}).innerText || '';
  return text.replace(/\s+/g, ' ');
});
note(sheet.includes('Cepat') && sheet.includes('Mendalam'), 'lembar model dua mode', sheet.slice(0, 160));
note(!sheet.includes('Koding & Algoritma'), 'lembar tanpa persona', sheet.slice(0, 160));
await page.screenshot({ path: outDir + '/antrine7-chat.png' });
await page.click('#sheet-backdrop');
await page.click('#btn-menu');
await page.click('#btn-settings');
await page.waitForSelector('#view-settings:not([hidden]) .cat-row[data-cat="ai"]', { timeout: 15000 });
await page.click('.cat-row[data-cat="ai"]');
await page.waitForSelector('#btn-unduh-offline', { state: 'visible', timeout: 15000 });
const mesh = await page.evaluate(() => {
  const hub = document.querySelector('.model-hub');
  return {
    len: 0,
    qr: 0,
    text: hub ? hub.innerText : '',
    persona: !!document.getElementById('persona-select-settings'),
  };
});
note(!mesh.text.includes('Tukar SDP'), 'model tanpa sdp', mesh.text.slice(0, 120));
note(mesh.text.includes('997'), 'model tunggal', mesh.text.slice(0, 120));
note(!mesh.persona, 'pengaturan tanpa persona', String(mesh.persona));

const studio = await browser.newPage({ viewport: { width: 1280, height: 800 } });
studio.on('pageerror', (err) => errors.push('studio ' + err));
await studio.addInitScript(() => {
  try {
    localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
  } catch (e) { /* bingkai terkunci */ }
});
await studio.goto(base + '/studio.html', { waitUntil: 'domcontentloaded' });
await studio.waitForSelector('#studio-app', { timeout: 15000 });
await studio.evaluate(() => {
  const app = document.getElementById('studio-app');
  app.classList.remove('is-canvas-hidden');
  app.classList.add('is-split');
});
await studio.click('[data-tab="logs"]');
await studio.waitForSelector('#tab-logs.active #studio-hud', { timeout: 15000 });
const hud = await studio.evaluate(() => {
  const box = document.getElementById('studio-hud');
  const input = document.getElementById('chat-input');
  const style = box ? getComputedStyle(box) : null;
  const a = box ? box.getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0 };
  const b = input ? input.getBoundingClientRect() : { top: 0, bottom: 0, left: 0, right: 0 };
  const overlap = a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
  return {
    text: box ? box.innerText.replace(/\s+/g, ' ') : '',
    position: style ? style.position : '',
    overlap,
  };
});
note(hud.text.includes('Decode') && hud.text.includes('VRAM'), 'hud di tab log', hud.text);
note(hud.position !== 'fixed' && !hud.overlap, 'hud tidak menutup kotak ketik', hud.position);
await studio.screenshot({ path: outDir + '/antrine7-studio.png' });
note(errors.length === 0, 'konsol tanpa galat', errors.join(' | ') || 'bersih');
const failed = findings.filter((row) => !row.ok);
console.log((failed.length ? 'GAGAL ' : 'LULUS ') + (findings.length - failed.length) + '/' + findings.length);
await browser.close();
if (failed.length) process.exit(1);

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
page.on('pageerror', (err) => errors.push(String(err)));
await page.addInitScript(() => {
  try {
    localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
    localStorage.setItem('raget_engine_preference', 'cloud');
  } catch (e) { /* bingkai terkunci */ }
});
await page.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#btn-model', { timeout: 15000 });
const chat = await page.evaluate(() => {
  const card = document.getElementById('weight-card');
  const row = document.querySelector('.card-row');
  return {
    weightHidden: !card || card.hidden,
    persona: !!document.querySelector('#persona-select, #persona-select-settings'),
    rowSelect: !!(row && row.querySelector('select')),
  };
});
note(chat.weightHidden, 'mode cepat tanpa kartu unduhan', String(chat.weightHidden));
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
await page.waitForSelector('#btn-mesh-sdp', { state: 'visible', timeout: 15000 });
await page.click('#btn-mesh-sdp');
await page.waitForFunction(() => {
  const area = document.getElementById('mesh-sdp-text');
  return area && area.value.length > 20;
}, { timeout: 8000 });
const mesh = await page.evaluate(() => {
  const area = document.getElementById('mesh-sdp-text');
  const canvas = document.getElementById('mesh-sdp-qr');
  return {
    len: area ? area.value.length : 0,
    qr: canvas ? canvas.width : 0,
    persona: !!document.getElementById('persona-select-settings'),
  };
});
note(mesh.len > 20, 'sdp teks', String(mesh.len));
note(mesh.qr > 20, 'sdp qr', String(mesh.qr));
note(!mesh.persona, 'pengaturan tanpa persona', String(mesh.persona));

const studio = await browser.newPage({ viewport: { width: 1280, height: 800 } });
studio.on('pageerror', (err) => errors.push('studio ' + err));
await studio.addInitScript(() => {
  try {
    localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
  } catch (e) { /* bingkai terkunci */ }
});
await studio.goto(base + '/studio.html', { waitUntil: 'domcontentloaded' });
await studio.waitForSelector('#studio-hud', { timeout: 15000 });
const hud = await studio.evaluate(() => {
  const box = document.getElementById('studio-hud');
  const style = box ? getComputedStyle(box) : null;
  return {
    text: box ? box.innerText.replace(/\s+/g, ' ') : '',
    bottom: style ? style.bottom : '',
  };
});
note(hud.text.includes('Decode') && hud.text.includes('VRAM'), 'hud studio', hud.text);
note(hud.bottom === '12px', 'hud pojok bawah', hud.bottom);
await studio.screenshot({ path: outDir + '/antrine7-studio.png' });
note(errors.length === 0, 'konsol tanpa galat', errors.join(' | ') || 'bersih');
const failed = findings.filter((row) => !row.ok);
console.log((failed.length ? 'GAGAL ' : 'LULUS ') + (findings.length - failed.length) + '/' + findings.length);
await browser.close();
if (failed.length) process.exit(1);

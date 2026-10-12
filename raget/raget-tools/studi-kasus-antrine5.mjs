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
  } catch (e) { /* iframe */ }
});
await page.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#btn-model', { timeout: 15000 });
await page.click('#btn-model');
await page.waitForSelector('#model-sheet:not([hidden])');
const model = await page.evaluate(() => {
  const text = document.getElementById('model-sheet').innerText;
  const status = document.getElementById('model-status');
  return {
    text,
    status: status ? status.textContent : '',
    experimental: text.indexOf('Eksperimental') >= 0,
  };
});
note(model.experimental, 'lembar model terbuka', 'eksperimental');
note(!/4 Lapis|28 Lapis|Raget Cepat|Raget Mendalam|1\.5B/.test(model.text), 'label tanpa istilah lapis', model.text.replace(/\s+/g, ' ').slice(0, 180));
note(model.status === 'Cepat' || model.status === 'Mendalam', 'status bar bersih', model.status);
await page.screenshot({ path: outDir + '/antrine5-model.png' });

const studio = await browser.newPage({ viewport: { width: 1366, height: 768 } });
studio.on('pageerror', (err) => errors.push(String(err)));
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
});
await studio.click('[data-tab="files"]');
await studio.waitForSelector('#btn-mode-edit');
await studio.click('#btn-mode-edit');
await studio.fill('#code-manual', 'console.log("antrine");\n');
await studio.keyboard.down('Control');
await studio.keyboard.press('KeyS');
await studio.keyboard.up('Control');
const saved = await studio.evaluate(() => {
  const pre = document.getElementById('code-editor');
  const manual = document.getElementById('code-manual');
  return {
    mode: document.body.dataset.editorMode,
    manual: manual ? manual.value : '',
    hiddenDiff: !!(pre && pre.hidden),
    sandbox: document.getElementById('studio-preview-frame').getAttribute('sandbox') || '',
    pwa: !!document.getElementById('btn-pwa-pack'),
    widthBtn: !!document.getElementById('btn-view-390'),
    slider: !!document.getElementById('commit-slider'),
  };
});
note(saved.mode === 'edit' && saved.manual.indexOf('antrine') >= 0 && saved.hiddenDiff, 'editor sunting tersimpan', saved.mode);
note(saved.sandbox === 'allow-scripts allow-forms' && saved.pwa && saved.widthBtn && saved.slider, 'kontrol studio', saved.sandbox);
await studio.click('#btn-view-390');
const width = await studio.evaluate(() => document.getElementById('studio-preview-frame').style.width);
note(width === '390px', 'pratinjau 390', width);
await studio.click('[data-tab="logs"]');
const heal = await studio.evaluate(() => {
  const box = document.getElementById('console-output');
  const row = document.createElement('div');
  const btn = document.createElement('button');
  btn.className = 'heal-once';
  btn.textContent = 'Perbaiki';
  row.appendChild(btn);
  box.appendChild(row);
  return !!box.querySelector('.heal-once');
});
note(heal, 'tombol perbaiki ada', String(heal));
await studio.screenshot({ path: outDir + '/antrine5-studio.png' });

const bad = errors.filter((err) => !/localStorage|SecurityError|AudioContext|NotSupportedError/.test(err));
note(bad.length === 0, 'konsol tanpa galat', bad.join(' | ') || 'bersih');
await browser.close();
fs.writeFileSync(outDir + '/antrine5-hasil.json', JSON.stringify({ findings, errors }, null, 2));
const failed = findings.filter((item) => !item.ok);
if (failed.length) {
  console.log('GAGAL ' + (findings.length - failed.length) + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS ' + findings.length + '/' + findings.length);

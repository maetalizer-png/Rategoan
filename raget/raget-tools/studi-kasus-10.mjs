import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.env.STUDI_BASE || 'http://127.0.0.1:8080';
const outDir = '/workspace/screenshots';
fs.mkdirSync(outDir, { recursive: true });

const findings = [];
function note(ok, name, detail) {
  findings.push({ ok, name, detail });
  console.log((ok ? 'LULUS' : 'GAGAL') + '  ' + name + ' — ' + detail);
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const warnings = [];
const errors = [];

async function boot(page) {
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    const text = msg.text();
    if (/allow-same-origin/i.test(text)) warnings.push(text);
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('rategoan_theme');
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
    } catch (e) { /* iframe */ }
  });
}

const desktop = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await boot(desktop);
await desktop.goto(base + '/studio.html', { waitUntil: 'networkidle' });
await desktop.waitForSelector('#btn-plus');
const light = await desktop.evaluate(() => ({
  bg: getComputedStyle(document.body).backgroundColor,
  top: getComputedStyle(document.getElementById('topbar')).backgroundColor,
  sandbox: document.getElementById('studio-preview-frame').getAttribute('sandbox'),
}));
note(light.bg === 'rgb(250, 250, 248)' && light.top === 'rgb(255, 255, 255)', 'boot terang', light.bg + ' / ' + light.top);
note(!/allow-same-origin/.test(light.sandbox || ''), 'sandbox tanpa allow-same-origin', light.sandbox || '');

await desktop.click('#btn-plus');
await desktop.waitForSelector('#studio-attach-sheet:not([hidden])');
const pop = await desktop.evaluate(() => {
  const sheet = document.getElementById('studio-attach-sheet').getBoundingClientRect();
  const plus = document.getElementById('btn-plus').getBoundingClientRect();
  const backdrop = getComputedStyle(document.getElementById('sheet-backdrop')).backgroundColor;
  const anim = getComputedStyle(document.getElementById('studio-attach-sheet')).animationDuration;
  return {
    offset: Math.round(plus.top - sheet.bottom),
    backdrop,
    anim,
  };
});
note(pop.offset >= 6 && pop.offset <= 12, 'popover 8px di atas tambah', 'jarak=' + pop.offset);
note(pop.backdrop === 'rgba(0, 0, 0, 0)' || pop.backdrop === 'transparent', 'tanpa backdrop gelap', pop.backdrop);
note(pop.anim === '0.15s' || pop.anim === '150ms', 'animasi 150ms', pop.anim);
await desktop.keyboard.press('Escape');
const closed = await desktop.evaluate(() => document.getElementById('studio-attach-sheet').hidden);
note(closed, 'Escape menutup popover', String(closed));
await desktop.screenshot({ path: outDir + '/kasus10-terang.png' });

await desktop.fill('#chat-input', 'buat halaman daftar belanja dengan tombol tambah');
await desktop.click('#btn-studio-send');
await desktop.waitForFunction(() => /dirakit/i.test(document.body.innerText), null, { timeout: 15000 });
let formSeen = false;
try {
  await desktop.frameLocator('#studio-preview-frame').locator('#form').waitFor({ timeout: 8000 });
  formSeen = true;
} catch (e) { formSeen = false; }
note(formSeen, 'pratinjau MessageChannel', formSeen ? 'formulir' : 'kosong');
await desktop.screenshot({ path: outDir + '/kasus10-kanal.png' });

const chat = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await boot(chat);
await chat.goto(base + '/index.html', { waitUntil: 'networkidle' });
await chat.waitForSelector('#btn-plus', { timeout: 8000 });
await chat.click('#btn-plus');
await chat.waitForSelector('#attach-sheet:not([hidden])');
const chatPop = await chat.evaluate(() => {
  const sheet = document.getElementById('attach-sheet').getBoundingClientRect();
  const plus = document.getElementById('btn-plus').getBoundingClientRect();
  const backdrop = getComputedStyle(document.getElementById('sheet-backdrop')).backgroundColor;
  const pages = ['#view-artifacts .settings-page', '#view-connect .settings-page', '#view-project .settings-page', '#view-collection .settings-page'];
  const widths = pages.map((sel) => {
    const el = document.querySelector(sel);
    if (!el) return sel + ':tiada';
    return getComputedStyle(el).maxWidth;
  });
  const gallery = getComputedStyle(document.querySelector('.artifact-gallery')).gridTemplateColumns;
  const pad = getComputedStyle(document.querySelector('#view-artifacts .settings-page')).padding;
  return {
    offset: Math.round(plus.top - sheet.bottom),
    backdrop,
    widths,
    gallery,
    pad,
  };
});
note(chatPop.offset >= 6 && chatPop.offset <= 12, 'popover obrolan 8px', 'jarak=' + chatPop.offset);
note(chatPop.backdrop === 'rgba(0, 0, 0, 0)' || chatPop.backdrop === 'transparent', 'obrolan tanpa backdrop gelap', chatPop.backdrop);
note(chatPop.widths.every((item) => item === '920px'), 'sasis 920px', chatPop.widths.join(','));
note(/260px/.test(chatPop.gallery), 'galeri artefak minmax 260', chatPop.gallery);
note(chatPop.pad === '32px 40px', 'padding sasis 32 40', chatPop.pad);
await chat.screenshot({ path: outDir + '/kasus10-popover.png' });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
await boot(phone);
await phone.goto(base + '/studio.html', { waitUntil: 'networkidle' });
await phone.click('#btn-plus');
await phone.waitForSelector('#studio-attach-sheet:not([hidden])');
const sheetBox = await phone.locator('#studio-attach-sheet').boundingBox();
note(sheetBox && sheetBox.height <= 320 && sheetBox.height < 500, 'lembar ponsel memeluk isi', 'tinggi=' + Math.round(sheetBox.height));

note(warnings.length === 0, 'tanpa peringatan sandbox Chromium', warnings.length ? warnings[0] : '0');
const real = errors.filter((err) => !/localStorage|SecurityError/.test(err));
note(real.length === 0, 'konsol bersih', real.length ? real.slice(0, 2).join(' | ') : '0 galat halaman');

const failed = findings.filter((row) => !row.ok);
console.log((failed.length ? 'GAGAL ' : 'LULUS ') + (findings.length - failed.length) + '/' + findings.length);
fs.writeFileSync(outDir + '/kasus10-hasil.json', JSON.stringify({ findings, errors: real, warnings }, null, 2));
await browser.close();
if (failed.length) process.exit(1);

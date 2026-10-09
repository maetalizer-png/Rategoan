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
      localStorage.setItem('rategoan_artifacts', JSON.stringify([{
        type: 'document',
        title: 'Catatan uji',
        fileName: 'catatan.txt',
        markdown: 'halo',
        time: Date.now() - 60000,
      }]));
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
await desktop.waitForTimeout(220);
const pop = await desktop.evaluate(() => {
  const sheet = document.getElementById('studio-attach-sheet').getBoundingClientRect();
  const buttons = Array.from(document.querySelectorAll('#studio-attach-sheet button')).filter((el) => !el.closest('[hidden]'));
  const boxes = buttons.map((el) => el.getBoundingClientRect());
  const backdrop = getComputedStyle(document.getElementById('sheet-backdrop')).backgroundColor;
  const anim = getComputedStyle(document.getElementById('studio-attach-sheet')).animationDuration;
  const h = window.innerHeight;
  const w = window.innerWidth;
  const visible = boxes.length > 0 && boxes.every((box) => box.height > 8 && box.top >= 16 && box.bottom <= h - 2 && box.left >= 0 && box.right <= w);
  return { top: Math.round(sheet.top), bottom: Math.round(sheet.bottom), backdrop, anim, visible, n: boxes.length };
});
note(pop.top >= 20 && pop.bottom <= 768 && pop.visible && pop.n > 0 && (pop.anim === '0.15s' || pop.anim === '150ms'), 'popover studio utuh', 'top=' + pop.top + ' opsi=' + pop.n + ' anim=' + pop.anim);
note(pop.backdrop === 'rgba(0, 0, 0, 0)' || pop.backdrop === 'transparent', 'studio tanpa backdrop gelap', pop.backdrop);
await desktop.keyboard.press('Escape');
const closed = await desktop.evaluate(() => document.getElementById('studio-attach-sheet').hidden);
note(closed, 'Escape menutup popover', String(closed));
await desktop.screenshot({ path: outDir + '/kasus11-terang.png' });

await desktop.fill('#chat-input', 'buat halaman daftar belanja dengan tombol tambah');
await desktop.click('#btn-studio-send');
await desktop.waitForFunction(() => /dirakit/i.test(document.body.innerText), null, { timeout: 15000 });
let formSeen = false;
try {
  await desktop.frameLocator('#studio-preview-frame').locator('#form').waitFor({ timeout: 8000 });
  formSeen = true;
} catch (e) { formSeen = false; }
note(formSeen, 'pratinjau MessageChannel', formSeen ? 'formulir' : 'kosong');

const chat = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await boot(chat);
await chat.goto(base + '/index.html', { waitUntil: 'networkidle' });
await chat.waitForSelector('#btn-plus');
await chat.click('#btn-plus');
await chat.waitForSelector('#attach-sheet:not([hidden])');
await chat.waitForTimeout(220);
const emptyPop = await chat.evaluate(() => {
  const sheet = document.getElementById('attach-sheet').getBoundingClientRect();
  const buttons = Array.from(document.querySelectorAll('#attach-sheet button'));
  const boxes = buttons.map((el) => el.getBoundingClientRect());
  const h = window.innerHeight;
  const w = window.innerWidth;
  const visible = boxes.length > 0 && boxes.every((box) => box.height > 8 && box.top >= 16 && box.bottom <= h - 2 && box.left >= 0 && box.right <= w);
  const backdrop = getComputedStyle(document.getElementById('sheet-backdrop')).backgroundColor;
  return { top: Math.round(sheet.top), bottom: Math.round(sheet.bottom), visible, n: boxes.length, backdrop };
});
note(emptyPop.top >= 20 && emptyPop.visible, 'chat kosong popover utuh', 'top=' + emptyPop.top + ' opsi=' + emptyPop.n);
note(emptyPop.backdrop === 'rgba(0, 0, 0, 0)' || emptyPop.backdrop === 'transparent', 'chat kosong tanpa backdrop gelap', emptyPop.backdrop);
await chat.keyboard.press('Escape');
await chat.evaluate(() => {
  const box = document.getElementById('messages');
  const row = document.createElement('div');
  row.className = 'msg user';
  row.textContent = 'Obrolan aktif untuk menempatkan komposer di bawah.';
  box.appendChild(row);
});
await chat.click('#btn-plus');
await chat.waitForSelector('#attach-sheet:not([hidden])');
await chat.waitForTimeout(220);
const active = await chat.evaluate(() => {
  const sheet = document.getElementById('attach-sheet').getBoundingClientRect();
  const plus = document.getElementById('btn-plus').getBoundingClientRect();
  const bar = document.getElementById('topbar').getBoundingClientRect();
  return {
    offset: Math.round(plus.top - sheet.bottom),
    top: Math.round(sheet.top),
    bar: Math.round(bar.bottom),
    above: sheet.bottom <= plus.top + 1,
  };
});
note(active.above && active.offset >= 8 && active.offset <= 12, 'chat aktif 8-10px di atas tambah', 'jarak=' + active.offset);
note(active.top >= active.bar, 'chat aktif tidak menembus topbar', 'top=' + active.top + ' bar=' + active.bar);
await chat.evaluate(() => document.getElementById('sheet-backdrop').click());
const away = await chat.evaluate(() => document.getElementById('attach-sheet').hidden);
note(away, 'klik luar menutup popover', String(away));

await chat.click('#btn-artifact');
await chat.waitForSelector('#view-artifacts:not([hidden]) .artifact-card-page');
const chassis = await chat.evaluate(() => {
  const page = getComputedStyle(document.querySelector('#view-artifacts .settings-page'));
  const gallery = document.querySelector('.artifact-gallery');
  const declared = gallery ? getComputedStyle(gallery).gridTemplateColumns : '';
  let rule = '';
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const item of rules) {
      if (item.selectorText === '.artifact-gallery') rule = item.style.gridTemplateColumns || rule;
    }
  }
  const tracks = declared.split(' ').map((part) => parseFloat(part)).filter((n) => !Number.isNaN(n));
  const preview = document.querySelector('.artifact-preview');
  const previewBox = preview ? preview.getBoundingClientRect() : null;
  const buttons = Array.from(document.querySelectorAll('.artifact-card-page button')).map((el) => el.textContent.trim());
  return {
    width: page.maxWidth,
    pad: page.padding,
    cols: rule || declared,
    tracks,
    preview: previewBox ? Math.round(previewBox.height) : 0,
    buttons,
  };
});
note(chassis.width === '960px' && chassis.pad === '40px 48px 64px', 'sasis 960', chassis.width + ' ' + chassis.pad);
note((/280px/.test(chassis.cols) || (chassis.tracks.length > 0 && chassis.tracks.every((n) => n >= 280))) && chassis.preview === 110 && chassis.buttons.includes('Pratinjau') && chassis.buttons.includes('Unduh'), 'galeri bertingkat', chassis.cols + ' tinggi=' + chassis.preview + ' ' + chassis.buttons.join(','));
await chat.screenshot({ path: outDir + '/kasus11-sasis.png' });

await chat.click('#btn-connect');
await chat.waitForSelector('#view-connect:not([hidden]) .hub-group');
const hub = await chat.evaluate(() => getComputedStyle(document.querySelector('.hub-group')).gridTemplateColumns.split(' ').filter(Boolean).length);
note(hub === 2, 'konektor dua kolom', String(hub));
await chat.screenshot({ path: outDir + '/kasus11-popover.png' });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
await boot(phone);
await phone.goto(base + '/studio.html', { waitUntil: 'networkidle' });
await phone.click('#btn-plus');
await phone.waitForSelector('#studio-attach-sheet:not([hidden])');
const sheetBox = await phone.locator('#studio-attach-sheet').boundingBox();
note(sheetBox && sheetBox.height < 300 && sheetBox.height > 40, 'lembar ponsel memeluk isi', 'tinggi=' + Math.round(sheetBox.height));

note(warnings.length === 0 && errors.filter((err) => !/localStorage|SecurityError/.test(err)).length === 0, 'konsol bersih tanpa peringatan sandbox', 'peringatan=' + warnings.length);
await browser.close();
const failed = findings.filter((item) => !item.ok);
fs.writeFileSync(outDir + '/kasus11-hasil.json', JSON.stringify({ findings, warnings }, null, 2));
if (findings.length !== 16 || failed.length) {
  console.log('GAGAL ' + (findings.length - failed.length) + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS 16/16');

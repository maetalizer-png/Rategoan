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
    if (/allow-same-origin/i.test(msg.text())) warnings.push(msg.text());
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('rategoan_theme');
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
    } catch (e) { /* iframe */ }
  });
}

async function headerBox(page, view) {
  return page.evaluate((name) => {
    const root = document.querySelector(name + ' .settings-header');
    const title = document.querySelector(name + ' .settings-header h1');
    const back = document.querySelector(name + ' .settings-header .back-btn');
    if (!root || !title) return null;
    const box = root.getBoundingClientRect();
    const style = getComputedStyle(root);
    const h1 = getComputedStyle(title);
    const backStyle = back ? getComputedStyle(back) : null;
    return {
      top: Math.round(box.top),
      left: Math.round(box.left),
      width: Math.round(box.width),
      height: Math.round(box.height),
      titleTop: Math.round(title.getBoundingClientRect().top),
      font: h1.fontSize,
      weight: h1.fontWeight,
      blur: style.backdropFilter || style.webkitBackdropFilter || '',
      border: style.borderBottomWidth + ' ' + style.borderBottomStyle,
      bg: style.backgroundColor,
      position: style.position,
      back: backStyle ? Math.round(parseFloat(backStyle.width)) : 0,
      radius: backStyle ? backStyle.borderRadius : '',
    };
  }, view);
}

const desktop = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await boot(desktop);
await desktop.goto(base + '/index.html#/connect', { waitUntil: 'networkidle' });
await desktop.waitForSelector('#view-connect:not([hidden]) h1');
const light = await desktop.evaluate(() => ({
  bg: getComputedStyle(document.body).backgroundColor,
  rows: getComputedStyle(document.body).gridTemplateRows,
  hidden: document.getElementById('topbar').hidden,
  noTop: document.body.classList.contains('no-topbar'),
}));
note(light.bg === 'rgb(250, 250, 248)', 'boot terang', light.bg);
const head = await headerBox(desktop, '#view-connect');
note(head && head.titleTop >= 36 && head.titleTop <= 48, 'desktop judul di 40px', 'y=' + (head && head.titleTop));
note(light.hidden && light.noTop && !/^60px/.test(light.rows), 'desktop tanpa track hantu', light.rows);
note(head && head.position === 'static' && (head.bg === 'rgba(0, 0, 0, 0)' || head.bg === 'transparent'), 'desktop header menyatu', head && (head.position + ' ' + head.bg));
const chassis = await desktop.evaluate(() => {
  const page = getComputedStyle(document.querySelector('#view-connect .settings-page'));
  return page.maxWidth + ' ' + page.padding;
});
note(chassis === '960px 40px 48px 64px', 'sasis 960', chassis);
await desktop.screenshot({ path: outDir + '/kasus12-desktop.png' });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await boot(phone);
await phone.goto(base + '/index.html#/connect', { waitUntil: 'networkidle' });
await phone.waitForSelector('#view-connect:not([hidden]) .settings-header');
const connect = await headerBox(phone, '#view-connect');
note(connect && connect.top <= 1 && connect.height === 60 && connect.font === '17px' && /blur\(14px\)/.test(connect.blur) && connect.border === '1px solid', 'ponsel header kaca 60px', JSON.stringify(connect));
note(connect && connect.back === 36 && (/^50%$/.test(connect.radius) || /^18px/.test(connect.radius)), 'ponsel tombol kembali bulat', connect && (connect.back + ' ' + connect.radius));
note(connect && connect.left === 0 && connect.width === 390, 'ponsel header ujung ke ujung', connect && ('left=' + connect.left + ' lebar=' + connect.width));
const leak = await phone.evaluate(() => {
  const page = document.querySelector('#view-connect .settings-page');
  const filler = document.createElement('p');
  filler.id = 'uji-bocor';
  filler.textContent = 'Alat mandiri perangkat. Dua puluh sembilan alat lokal seharusnya tidak menembus header.';
  filler.style.height = '1200px';
  page.appendChild(filler);
  page.scrollTop = 420;
  const header = document.querySelector('#view-connect .settings-header').getBoundingClientRect();
  const hit = document.elementFromPoint(Math.min(20, window.innerWidth - 2), 8);
  const inside = !!(hit && hit.closest('.settings-header'));
  return { inside, headerTop: Math.round(header.top), tag: hit ? hit.tagName : '' };
});
note(leak.inside && leak.headerTop <= 1, 'ponsel gulir tidak membocorkan teks', leak.tag + ' y=' + leak.headerTop);
await phone.screenshot({ path: outDir + '/kasus12-ponsel.png' });

async function hop(hash, view) {
  await phone.evaluate((next) => { location.hash = next; }, hash);
  await phone.waitForSelector(view + ':not([hidden]) .settings-header h1', { timeout: 8000 });
  return headerBox(phone, view);
}
const settings = await hop('#/settings', '#view-settings');
note(settings && settings.top <= 1 && settings.height === 60, 'ponsel pengaturan', settings && ('y=' + settings.top + ' h=' + settings.height));
const artifacts = await hop('#/artifacts', '#view-artifacts');
note(artifacts && artifacts.top <= 1 && artifacts.height === 60, 'ponsel artefak', artifacts && ('y=' + artifacts.top + ' h=' + artifacts.height));
const collection = await hop('#/collection', '#view-collection');
note(collection && collection.top <= 1 && collection.height === 60, 'ponsel koleksi', collection && ('y=' + collection.top + ' h=' + collection.height));
const project = await hop('#/project', '#view-project');
note(project && project.top <= 1 && project.height === 60, 'ponsel proyek', project && ('y=' + project.top + ' h=' + project.height));

const studio = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await boot(studio);
await studio.goto(base + '/studio.html', { waitUntil: 'networkidle' });
const sandbox = await studio.evaluate(() => ({
  sandbox: document.getElementById('studio-preview-frame').getAttribute('sandbox') || '',
  manual: /Edit Manual|Terapkan Kode/.test(document.body.innerText),
  tabs: ['dokumen', 'sheet'].every((name) => !!document.querySelector('[data-tab="' + name + '"]')),
}));
note(!/allow-same-origin/.test(sandbox.sandbox) && !sandbox.manual && sandbox.tabs, 'studio observasi', sandbox.sandbox);

const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });
await boot(narrow);
await narrow.goto(base + '/studio.html', { waitUntil: 'networkidle' });
await narrow.click('#btn-plus');
await narrow.waitForSelector('#studio-attach-sheet:not([hidden])');
const sheet = await narrow.locator('#studio-attach-sheet').boundingBox();
note(sheet && sheet.height < 300 && sheet.height > 40, 'lembar ponsel studio', 'tinggi=' + Math.round(sheet.height));
note(warnings.length === 0 && errors.filter((err) => !/localStorage|SecurityError/.test(err)).length === 0, 'konsol bersih', 'peringatan=' + warnings.length);
await browser.close();
fs.writeFileSync(outDir + '/kasus12-hasil.json', JSON.stringify({ findings, warnings, errors }, null, 2));
const failed = findings.filter((item) => !item.ok);
if (findings.length !== 16 || failed.length) {
  console.log('GAGAL ' + (findings.length - failed.length) + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS 16/16');

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
note(light.bg === 'rgb(250, 249, 246)', 'boot terang', light.bg);
const head = await desktop.evaluate(() => {
  const title = document.querySelector('#view-connect .settings-header h1');
  const page = getComputedStyle(document.querySelector('#view-connect .settings-page'));
  return {
    titleTop: Math.round(title.getBoundingClientRect().top),
    chassis: page.maxWidth + ' ' + page.padding,
  };
});
note(head.titleTop >= 36 && head.titleTop <= 48, 'desktop judul di 40px', 'y=' + head.titleTop);
note(light.hidden && light.noTop && !/^60px/.test(light.rows), 'desktop tanpa track hantu', light.rows);
note(head.chassis === '960px 40px 48px 64px', 'sasis 960', head.chassis);
await desktop.screenshot({ path: outDir + '/kasus15-desktop.png' });

await desktop.goto(base + '/index.html#/chat', { waitUntil: 'networkidle' });
const before = await desktop.evaluate(() => getComputedStyle(document.getElementById('sidebar')).backgroundColor);
await desktop.click('#btn-model');
await desktop.waitForSelector('#model-sheet:not([hidden])');
const model = await desktop.evaluate((sideBefore) => {
  const backdrop = getComputedStyle(document.getElementById('sheet-backdrop'));
  const side = getComputedStyle(document.getElementById('sidebar')).backgroundColor;
  const alpha = backdrop.backgroundColor;
  const card = getComputedStyle(document.getElementById('composer-card'));
  return {
    alpha,
    side,
    same: side === sideBefore,
    open: document.body.classList.contains('model-open'),
    ns: window.RG === window.Rategoan && !!window.Rategoan && !window['__rategoan' + 'Mesin'] && !window['Raget' + 'Stream'],
    blur: card.backdropFilter || card.webkitBackdropFilter || '',
    card: card.backgroundColor,
  };
}, before);
note(model.open && (model.alpha === 'rgba(0, 0, 0, 0)' || model.alpha === 'transparent') && /blur\(12px\)/.test(model.blur || '') && /0\.85/.test(model.card || ''), 'model backdrop transparan', model.alpha + ' blur=' + model.blur);
note(model.same, 'sidebar tidak meredup sepihak', model.side);
note(model.ns, 'namespace Rategoan', 'RG sama=' + model.ns);
await desktop.screenshot({ path: outDir + '/kasus15-model.png' });

const studio = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await boot(studio);
await studio.goto(base + '/studio.html', { waitUntil: 'networkidle' });
const tabs = await studio.evaluate(() => {
  const app = document.getElementById('studio-app');
  app.classList.remove('is-canvas-hidden');
  app.classList.add('is-split');
  const nav = document.querySelector('.canvas-tabs').getBoundingClientRect();
  const right = document.querySelector('.canvas-head-right').getBoundingClientRect();
  const style = getComputedStyle(document.querySelector('.canvas-tabs'));
  const frame = document.getElementById('studio-preview-frame');
  return {
    gap: Math.round(right.left - nav.right),
    overflow: style.overflowX,
    min: style.minWidth,
    segment: getComputedStyle(document.querySelector('.canvas-tabs')).backgroundColor,
    sandbox: frame.getAttribute('sandbox') || '',
    manual: /Edit Manual|Terapkan Kode/.test(document.body.innerText),
    stream: !!(window.Rategoan && window.Rategoan.stream) && !window['Raget' + 'Stream'],
  };
});
note(tabs.gap >= -1, 'tab kanvas tidak bertumpuk', 'celah=' + tabs.gap);
note(tabs.overflow === 'auto' && tabs.min === '0px' && tabs.segment === 'rgb(241, 245, 249)', 'tab kanvas bisa digulir', tabs.overflow + ' ' + tabs.min + ' ' + tabs.segment);
note(!/allow-same-origin/.test(tabs.sandbox) && !tabs.manual && tabs.stream, 'studio observasi', tabs.sandbox);
await studio.screenshot({ path: outDir + '/kasus15-studio.png' });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await boot(phone);
await phone.goto(base + '/index.html#/settings/data', { waitUntil: 'networkidle' });
await phone.waitForSelector('#storage-info');
const store = await phone.evaluate(() => {
  const value = document.getElementById('storage-info');
  const label = value.parentElement.querySelector('span');
  const a = label.getBoundingClientRect();
  const b = value.getBoundingClientRect();
  const header = document.querySelector('#view-settings .settings-header');
  const box = header.getBoundingClientRect();
  const back = header.querySelector('.back-btn');
  const backStyle = back ? getComputedStyle(back) : null;
  const page = document.querySelector('#view-settings .settings-page');
  const filler = document.createElement('p');
  filler.textContent = 'Alat mandiri perangkat. Teks ini tidak boleh menembus header.';
  filler.style.height = '1200px';
  page.appendChild(filler);
  page.scrollTop = 360;
  const hit = document.elementFromPoint(20, 8);
  return {
    text: value.textContent,
    overlap: b.left < a.right - 1,
    top: Math.round(box.top),
    height: Math.round(box.height),
    width: Math.round(box.width),
    left: Math.round(box.left),
    back: backStyle ? Math.round(parseFloat(backStyle.width)) : 0,
    radius: backStyle ? backStyle.borderRadius : '',
    leak: !!(hit && hit.closest('.settings-header')),
    headerTop: Math.round(header.getBoundingClientRect().top),
  };
});
note(store.top <= 1 && store.height === 60, 'ponsel header kaca 60px', 'y=' + store.top + ' h=' + store.height);
note(store.left === 0 && store.width === 390, 'ponsel header ujung ke ujung', store.left + ' ' + store.width);
note(store.back === 36 && (/^50%$/.test(store.radius) || /^18px/.test(store.radius)), 'ponsel tombol kembali bulat', store.back + ' ' + store.radius);
note(store.leak && store.headerTop <= 1, 'ponsel gulir tidak membocorkan teks', 'header=' + store.headerTop);
note(store.text.indexOf('Penyimpanan:') !== 0 && /MB \/ 50 MB/.test(store.text), 'penyimpanan tanpa kata ganda', store.text);
note(!store.overlap, 'nilai tidak menimpa label', 'tumpang=' + store.overlap);
await phone.screenshot({ path: outDir + '/kasus15-ponsel.png' });

const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });
await boot(narrow);
await narrow.goto(base + '/studio.html', { waitUntil: 'networkidle' });
await narrow.click('#btn-plus');
await narrow.waitForSelector('#studio-attach-sheet:not([hidden])');
const sheet = await narrow.locator('#studio-attach-sheet').boundingBox();
await narrow.keyboard.press('Escape');
const closed = await narrow.evaluate(() => document.getElementById('studio-attach-sheet').hidden);
note(sheet && sheet.height < 300 && sheet.height > 40 && closed, 'lembar ponsel studio', 'tinggi=' + Math.round(sheet.height) + ' tutup=' + closed);
note(warnings.length === 0 && errors.filter((err) => !/localStorage|SecurityError/.test(err)).length === 0, 'konsol bersih', 'peringatan=' + warnings.length);
await browser.close();
fs.writeFileSync(outDir + '/kasus15-hasil.json', JSON.stringify({ findings, warnings, errors }, null, 2));
const failed = findings.filter((item) => !item.ok);
if (findings.length !== 18 || failed.length) {
  console.log('GAGAL ' + (findings.length - failed.length) + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS 18/18');

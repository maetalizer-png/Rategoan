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
const errors = [];

async function boot(page) {
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.addInitScript(() => {
    try {
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
    } catch (e) { /* iframe sandbox tidak punya storage */ }
  });
}

const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await boot(desktop);
await desktop.goto(base + '/index.html#/chat', { waitUntil: 'networkidle' });
await desktop.waitForSelector('.empty-brand', { timeout: 8000 });
const layout = await desktop.evaluate(() => {
  const brand = document.querySelector('.empty-brand').getBoundingClientRect();
  const composer = document.getElementById('composer').getBoundingClientRect();
  const card = document.querySelector('.chat-insp-card').getBoundingClientRect();
  const cards = document.querySelectorAll('.chat-insp-card').length;
  return {
    brand: brand.top,
    composer: composer.top,
    card: card.top,
    cards,
    height: window.innerHeight,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
  };
});
note(layout.cards === 4 && layout.brand < layout.composer && layout.composer < layout.card, 'chat kosong desktop', 'merek ' + Math.round(layout.brand) + ' komposer ' + Math.round(layout.composer) + ' kartu ' + Math.round(layout.card) + ' kartu=' + layout.cards);
note(layout.composer < layout.height * 0.72 && layout.composer > layout.height * 0.22, 'komposer tidak terdampar di dasar', 'y=' + Math.round(layout.composer) + ' dari ' + layout.height);
await desktop.screenshot({ path: outDir + '/kasus-chat-desktop.png' });

const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
await boot(phone);
await phone.goto(base + '/index.html#/chat', { waitUntil: 'networkidle' });
await phone.waitForSelector('#composer', { timeout: 8000 });
const mobile = await phone.evaluate(() => ({
  overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
  composer: !!document.getElementById('composer'),
}));
note(!mobile.overflow && mobile.composer, 'chat ponsel tanpa limpahan', 'overflow=' + mobile.overflow);
await phone.screenshot({ path: outDir + '/kasus-chat-mobile.png' });

const studio = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await boot(studio);
await studio.goto(base + '/studio.html', { waitUntil: 'networkidle' });
await studio.waitForSelector('#btn-plus', { timeout: 8000 });
await studio.click('#btn-plus');
await studio.waitForSelector('#studio-attach-sheet:not([hidden])');
const pop = await studio.evaluate(() => {
  const sheet = document.getElementById('studio-attach-sheet').getBoundingClientRect();
  const composer = document.getElementById('composer').getBoundingClientRect();
  const title = document.querySelector('#studio-attach-sheet .sheet-title').textContent;
  return { sheetTop: sheet.top, sheetBottom: sheet.bottom, composerTop: composer.top, title };
});
note(pop.sheetBottom <= pop.composerTop + 4 && pop.sheetTop > 80, 'popover di atas komposer', 'lembar ' + Math.round(pop.sheetTop) + '-' + Math.round(pop.sheetBottom) + ' komposer ' + Math.round(pop.composerTop));
note(pop.title === 'Lampiran & Konektor', 'judul lampiran tunggal', pop.title);
await studio.click('#btn-studio-connectors');
const hub = await studio.evaluate(() => {
  const panel = document.getElementById('studio-connector-panel');
  const drive = document.querySelector('#btn-studio-gdrive svg');
  const github = document.querySelector('#btn-studio-github svg');
  return { hidden: panel.hidden, drive: !!drive, github: !!github, badge: document.getElementById('status-connectors').textContent };
});
note(!hub.hidden && hub.drive && hub.github, 'konektor punya ikon', 'lencana=' + hub.badge);
await studio.click('#btn-studio-gdrive');
await studio.waitForSelector('#modal-gdrive-picker:not([hidden])');
const modal = await studio.locator('#gdrive-file-list').innerText();
note(/belum terhubung|Memuat|Folder|Google Drive/i.test(modal), 'modal drive terbuka', modal.replace(/\s+/g, ' ').slice(0, 80));
await studio.screenshot({ path: outDir + '/kasus-studio-drive.png' });
await studio.click('#btn-cancel-gdrive');

await studio.fill('#chat-input', 'hvgyfkvhjnn');
await studio.click('#btn-send');
await studio.waitForSelector('.msg.ai');
const gibber = await studio.evaluate(() => ({
  text: document.querySelector('.msg.ai').textContent,
  traces: document.querySelectorAll('.tool-trace-card').length,
  web: /Web app|Ketuk/.test(document.body.innerText),
}));
note(/tidak memuat perintah/.test(gibber.text) && gibber.traces === 0 && !gibber.web, 'nol fabrikasi', gibber.text.slice(0, 72));
await studio.screenshot({ path: outDir + '/kasus-studio-nol-fabrikasi.png' });

await studio.fill('#chat-input', 'Rancang scaffold komponen reaktif');
await studio.click('#btn-send');
await studio.waitForFunction(() => /sudah dirakit/.test(document.body.innerText), null, { timeout: 8000 });
const afterCraft = await studio.evaluate(() => ({
  name: document.getElementById('studio-project-name').textContent,
  crumb: document.getElementById('crumb-project').textContent,
}));
note(afterCraft.name === 'Pratinjau Rekayasa' && afterCraft.crumb.length <= 24 && !/scaffold/i.test(afterCraft.name), 'judul kanvas bukan prompt', afterCraft.name + ' / ' + afterCraft.crumb);
await studio.click('#studio-sheet-close');
await studio.fill('#chat-input', 'ubah warna tombol jadi oranye');
await studio.click('#btn-send');
await studio.waitForFunction(() => /oranye/.test(document.body.innerText), null, { timeout: 8000 });
const closed = await studio.evaluate(() => document.getElementById('studio-app').classList.contains('is-canvas-hidden'));
note(closed, 'kanvas tidak membelah sendiri', 'tersembunyi=' + closed);

await studio.evaluate(() => {
  window.RagetStream.paint([
    'event: token',
    'data: {"text":"fungsi ukur"}',
    '',
    'event: tool',
    'data: {"name":"Read","path":"/js/script.js"}',
    '',
    'event: diff',
    'data: {"patch":"+ export function ukur()"}',
  ].join('\n'));
});
const stream = await studio.evaluate(() => ({
  text: document.querySelector('[data-stream="sse"]').textContent,
  tool: document.querySelector('[data-stream="tool"]').textContent,
  diff: document.querySelector('[data-stream="diff"]').textContent,
}));
note(stream.text === 'fungsi ukur' && /Read/.test(stream.tool) && /ukur/.test(stream.diff), 'aliran SSE tergambar', stream.text);
await studio.screenshot({ path: outDir + '/kasus-studio-sse.png' });

await studio.evaluate(() => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
  window.dispatchEvent(new Event('offline'));
});
const door = await studio.locator('#door-pill').innerText();
note(/Pintu A/.test(door), 'alih pintu saat putus', door);

await studio.click('#btn-clear-history');
await studio.waitForFunction(() => !document.getElementById('studio-app').classList.contains('is-active') && document.getElementById('messages').childElementCount === 0, null, { timeout: 4000 });
const cleared = await studio.evaluate(() => ({
  active: document.getElementById('studio-app').classList.contains('is-active'),
  msgs: document.getElementById('messages').childElementCount,
}));
note(!cleared.active && cleared.msgs === 0, 'hapus riwayat membersihkan obrolan', 'aktif=' + cleared.active + ' pesan=' + cleared.msgs);

note(errors.length === 0, 'konsol tanpa galat', errors.length ? errors.slice(0, 3).join(' | ') : '0');
await browser.close();

const failed = findings.filter((item) => !item.ok);
const report = {
  when: new Date().toISOString(),
  base,
  pass: findings.length - failed.length,
  fail: failed.length,
  findings,
};
fs.writeFileSync('/workspace/rategoan-work/laporan/STUDI-KASUS-ANTARMUKA-5.0.json', JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);

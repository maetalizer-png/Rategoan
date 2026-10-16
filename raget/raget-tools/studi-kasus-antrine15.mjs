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

async function boot(page, auth) {
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.addInitScript((signed) => {
    try {
      if (signed) localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
      else localStorage.removeItem('rategoan_auth');
      localStorage.removeItem('rategoan_weights_1_5b_installed');
    } catch (e) { void e; }
  }, auth);
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.includes('huggingface.co')) return route.abort();
    return route.continue();
  });
}

const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await boot(phone, true);
await phone.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await phone.waitForSelector('#btn-weight', { timeout: 15000 });
await phone.waitForTimeout(400);
const idle = await phone.evaluate(() => {
  const bar = document.getElementById('top-download-bar');
  const card = document.getElementById('weight-card');
  const btn = document.getElementById('btn-weight');
  const line = document.getElementById('weight-bar');
  if (bar) bar.hidden = false;
  if (card) card.hidden = false;
  const cardBox = card.getBoundingClientRect();
  const btnBox = btn.getBoundingClientRect();
  return {
    cardH: Math.round(cardBox.height),
    btn: getComputedStyle(btn).display,
    line: getComputedStyle(line).display,
    overflow: Math.round(btnBox.bottom - cardBox.bottom),
    text: document.getElementById('weight-status').textContent,
  };
});
note(idle.cardH === 44 && idle.btn !== 'none' && idle.line === 'none' && idle.overflow <= 0, 'pill idle 44px tanpa potongan', JSON.stringify(idle));

const busy = await phone.evaluate(() => {
  window.dispatchEvent(new CustomEvent('rategoan:neural-progress', {
    detail: { loaded: 10 * 1024 * 1024, total: 1045697920, speed: 8 * 1024 * 1024, eta: 120, committedVerifiedBytes: 10 * 1024 * 1024 },
  }));
  const pause = document.getElementById('btn-weight-pause');
  const cancel = document.getElementById('btn-weight-cancel');
  const btn = document.getElementById('btn-weight');
  const card = document.getElementById('weight-card');
  return {
    pause: !!(pause && pause.hidden),
    cancel: !!(cancel && cancel.hidden),
    btn: getComputedStyle(btn).display,
    cardH: Math.round(card.getBoundingClientRect().height),
  };
});
note(busy.pause === false && busy.cancel === false && busy.btn === 'none' && busy.cardH > 0 && busy.cardH <= 36, 'jeda dan batal muncul saat unduh otomatis', JSON.stringify(busy));

await phone.click('#btn-weight-cancel');
const restored = await phone.evaluate(() => {
  const status = document.getElementById('weight-status');
  const btn = document.getElementById('btn-weight');
  const pause = document.getElementById('btn-weight-pause');
  const cancel = document.getElementById('btn-weight-cancel');
  return {
    busy: status ? status.dataset.busy || '' : 'missing',
    btn: getComputedStyle(btn).display,
    pause: !!(pause && pause.hidden),
    cancel: !!(cancel && cancel.hidden),
  };
});
note(restored.busy === '' && restored.btn !== 'none' && restored.pause && restored.cancel, 'batal mengembalikan tombol unduh', JSON.stringify(restored));

const order = await phone.evaluate(async () => {
  const storeMod = await import('./js/state/store.js');
  const st = storeMod.store;
  if (!st.state.sessions.length) {
    st.state.sessions.push({ id: 't15', title: 'Chat', messages: [], created: Date.now() });
    st.state.currentId = 't15';
  }
  const s = st.state.sessions.find((row) => row.id === st.state.currentId) || st.state.sessions[0];
  st.state.currentId = s.id;
  s.messages = [
    { role: 'user', text: 'Pesan Pertama', time: 1 },
    { role: 'user', text: 'Pesan Kedua', time: 2 },
  ];
  window.dispatchEvent(new CustomEvent('rategoan:pending-reply', {
    detail: { prompt: 'Pesan Pertama', reply: 'Balasan Pertama', request_id: 'rq-1', message_id: 'msg-1' },
  }));
  window.dispatchEvent(new CustomEvent('rategoan:pending-reply', {
    detail: { prompt: 'Pesan Kedua', reply: 'Balasan Kedua', request_id: 'rq-2', message_id: 'msg-2' },
  }));
  return s.messages.map((row) => row.role + ':' + row.text);
});
note(JSON.stringify(order) === JSON.stringify([
  'user:Pesan Pertama',
  'ai:Balasan Pertama',
  'user:Pesan Kedua',
  'ai:Balasan Kedua',
]), 'urutan FIFO selang-seling', JSON.stringify(order));

const desk = await browser.newPage({ viewport: { width: 1366, height: 768 } });
await boot(desk, true);
await desk.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await desk.waitForSelector('#view-chat', { timeout: 15000 });
const place = await desk.evaluate(() => {
  const host = document.getElementById('messages');
  host.textContent = 'ada pesan';
  const bar = document.getElementById('top-download-bar');
  const card = document.getElementById('weight-card');
  if (bar) bar.hidden = false;
  if (card) card.hidden = false;
  const view = document.getElementById('view-chat');
  const side = document.getElementById('sidebar');
  const box = bar.getBoundingClientRect();
  return {
    pad: getComputedStyle(view).paddingTop,
    left: Math.round(box.left),
    top: Math.round(box.top),
    width: Math.round(box.width),
    height: Math.round(box.height),
    inSide: !!(side && side.contains(bar)),
  };
});
note(place.pad === '0px' && !place.inSide && place.left >= 260 && place.width === 820 && place.height === 50, 'desktop tanpa celah 43px', JSON.stringify(place));

const settings = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await boot(settings, true);
await settings.goto(base + '/index.html#/settings/data', { waitUntil: 'domcontentloaded' });
await settings.waitForSelector('#row-clear-cache', { timeout: 15000 });
await settings.waitForTimeout(300);
const wiped = await settings.evaluate(async () => {
  localStorage.setItem('rategoan_weights_1_5b_installed', 'true');
  localStorage.setItem('rategoan_chunks_mask:rev15', '1,1,1,1');
  localStorage.setItem('rategoan_chunks_hashes:rev15', 'aa,bb');
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle('raget-neural-1.5b.safetensors', { create: true });
  const writer = await handle.createWritable();
  await writer.write('x');
  await writer.close();
  document.getElementById('row-clear-cache').click();
  await new Promise((resolve) => setTimeout(resolve, 250));
  let exists = true;
  try {
    await root.getFileHandle('raget-neural-1.5b.safetensors');
  } catch (e) {
    exists = false;
  }
  let mask = '';
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && (key.indexOf('rategoan_chunks_mask:') === 0 || key.indexOf('rategoan_chunks_hashes:') === 0)) mask += key;
  }
  const label = document.querySelector('.settings-category[data-cat="lainnya"] .set-value');
  const version = !!(label && label.textContent.indexOf('Rategoan version 1.0') >= 0);
  return { exists, mask, version };
});
note(wiped.exists === false && wiped.mask === '' && wiped.version === true, 'hapus cache membersihkan OPFS dan versi tetap 1.0', JSON.stringify(wiped));

await phone.screenshot({ path: outDir + '/antrine15-ponsel.png' });
await desk.screenshot({ path: outDir + '/antrine15-desktop.png' });
await browser.close();
fs.writeFileSync(outDir + '/antrine15-hasil.json', JSON.stringify({ findings, errors }, null, 2));
const failed = findings.filter((row) => !row.ok);
if (failed.length || errors.length) {
  console.log('GAGAL ' + failed.length + '/' + findings.length + ' galat=' + errors.length);
  process.exit(1);
}
console.log('LULUS ' + findings.length + '/' + findings.length);

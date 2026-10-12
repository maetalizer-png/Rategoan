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
await page.waitForSelector('#chat-input', { timeout: 15000 });
await page.fill('#chat-input', 'hallo');
await page.click('#btn-send');
await page.waitForFunction(() => {
  const nodes = document.querySelectorAll('.msg.ai, .bubble.ai, .message.ai, #messages .ai');
  return Array.from(nodes).some((node) => /halo/i.test(node.textContent || ''));
}, { timeout: 12000 }).catch(() => {});
const chat = await page.evaluate(() => {
  const text = (document.getElementById('messages') || document.body).innerText || '';
  return text.replace(/\s+/g, ' ').slice(-400);
});
note(/halo/i.test(chat), 'sapaan hallo', chat);
note(!chat.includes('Bobot Raget 1.0 belum termuat'), 'tanpa pesan bobot', chat);
await page.screenshot({ path: outDir + '/antrine8-chat.png' });

await page.click('#btn-menu');
await page.click('#btn-settings');
await page.waitForSelector('.cat-row[data-cat="ai"]', { timeout: 15000 });
await page.click('.cat-row[data-cat="ai"]');
await page.waitForSelector('#btn-unduh-mendalam', { state: 'visible', timeout: 15000 });
const set = await page.evaluate(() => {
  const hub = document.querySelector('.model-hub');
  const mesh = document.getElementById('mesh-sync-card');
  const btn = document.getElementById('btn-unduh-mendalam');
  return {
    hub: hub ? hub.innerText.replace(/\s+/g, ' ') : '',
    mesh: mesh ? mesh.innerText.replace(/\s+/g, ' ') : '',
    download: btn ? btn.textContent : '',
  };
});
note(set.hub.includes('Cepat') && set.hub.includes('Mendalam'), 'kartu model dua mode', set.hub.slice(0, 180));
note(!set.hub.includes('Tukar SDP'), 'sdp tidak di kartu model', set.hub.slice(0, 180));
note(set.download.includes('Unduh Bobot Mode Mendalam'), 'tombol unduh terbuka', set.download);
note(set.mesh.includes('Tukar SDP'), 'sdp pindah ke kartu mesh', set.mesh.slice(0, 160));
await page.screenshot({ path: outDir + '/antrine8-settings.png' });

const studio = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
studio.on('pageerror', (err) => errors.push('studio ' + err));
await studio.addInitScript(() => {
  try {
    localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
  } catch (e) { /* bingkai terkunci */ }
});
await studio.goto(base + '/studio.html', { waitUntil: 'domcontentloaded' });
await studio.waitForSelector('#chat-input', { timeout: 15000 });
const phone = await studio.evaluate(() => {
  const hud = document.getElementById('studio-hud');
  const input = document.getElementById('chat-input');
  const style = hud ? getComputedStyle(hud) : null;
  const box = input ? input.getBoundingClientRect() : null;
  return {
    display: style ? style.display : '',
    inputH: box ? box.height : 0,
  };
});
note(phone.display === 'none', 'hud hilang di ponsel', phone.display);
note(phone.inputH > 20, 'kotak ketik studio terlihat', String(phone.inputH));
await studio.screenshot({ path: outDir + '/antrine8-studio-phone.png' });

const desk = await browser.newPage({ viewport: { width: 1280, height: 800 } });
desk.on('pageerror', (err) => errors.push('desktop ' + err));
await desk.addInitScript(() => {
  try {
    localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
  } catch (e) { /* bingkai terkunci */ }
});
await desk.goto(base + '/studio.html', { waitUntil: 'domcontentloaded' });
await desk.waitForSelector('#chat-input', { timeout: 15000 });
const idle = await desk.evaluate(() => {
  const hud = document.getElementById('studio-hud');
  const input = document.getElementById('chat-input');
  const style = hud ? getComputedStyle(hud) : null;
  const box = input ? input.getBoundingClientRect() : null;
  const hudBox = hud ? hud.getBoundingClientRect() : null;
  const overlap = box && hudBox && hudBox.width > 0 && hudBox.height > 0
    && hudBox.bottom > box.top && hudBox.top < box.bottom && hudBox.right > box.left && hudBox.left < box.right;
  return { display: style ? style.display : '', overlap: !!overlap };
});
note(idle.display === 'none' && !idle.overlap, 'hud desktop tidak menimpa ketikan', idle.display);
await desk.click('#btn-toggle-canvas');
await desk.waitForSelector('.tab-btn[data-tab="logs"]', { state: 'visible', timeout: 8000 });
await desk.click('.tab-btn[data-tab="logs"]');
await desk.waitForSelector('#tab-logs.active #studio-hud', { timeout: 8000 });
const logs = await desk.evaluate(() => getComputedStyle(document.getElementById('studio-hud')).display);
note(logs === 'flex', 'hud hanya di tab terminal', logs);
await desk.click('.tab-btn[data-tab="preview"]');
await desk.click('#btn-inspect-dom');
const pressed = await desk.getAttribute('#btn-inspect-dom', 'aria-pressed');
note(pressed === 'true', 'inspeksi nyala biru', pressed || '');
await desk.click('.tab-btn[data-tab="files"]');
await desk.click('#btn-mode-edit');
const off = await desk.getAttribute('#btn-inspect-dom', 'aria-pressed');
note(off === 'false', 'inspeksi padam saat sunting', off || '');
await desk.screenshot({ path: outDir + '/antrine8-studio-desktop.png' });

note(errors.length === 0, 'konsol tanpa galat', errors.join(' | ') || 'bersih');
const failed = findings.filter((row) => !row.ok);
console.log((failed.length ? 'GAGAL ' : 'LULUS ') + (findings.length - failed.length) + '/' + findings.length);
await browser.close();
if (failed.length) process.exit(1);

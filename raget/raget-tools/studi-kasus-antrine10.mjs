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
    localStorage.removeItem('rategoan_weights_1_5b_installed');
  } catch (e) { void e; }
});
await page.route('**/*', (route) => {
  const url = route.request().url();
  if (url.includes('huggingface.co')) return route.abort();
  if (url.includes('raget-deterministic')) return route.abort();
  return route.continue();
});
await page.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#chat-input', { timeout: 15000 });
await page.waitForFunction(() => {
  const card = document.getElementById('weight-card');
  const btn = document.getElementById('btn-weight');
  return card && !card.hidden && btn && /997 MB/.test(btn.textContent || '');
}, { timeout: 15000 });
const home = await page.evaluate(() => {
  const btn = document.getElementById('btn-weight');
  const status = document.getElementById('weight-status');
  return { button: btn ? btn.textContent : '', status: status ? status.textContent : '' };
});
note(/997 MB/.test(home.button), 'banner unduh tetap di beranda', home.button);
await page.fill('#chat-input', 'Selamat pagi');
await page.click('#btn-send');
await page.waitForTimeout(900);
const chat = await page.evaluate(() => ((document.getElementById('messages') || document.body).innerText || '').replace(/\s+/g, ' '));
note(!/Selamat pagi[,.]?\s+saya/.test(chat), 'sapaan tidak dijawab template', chat.slice(-280));
note(!chat.includes('Bobot Raget 1.0 belum termuat'), 'tanpa gelembung galat bobot', chat.slice(-240));
note(!errors.some((line) => /raget-deterministic|llm-engine|otak-template/.test(line)), 'tanpa galat modul template', errors.join(' | ') || 'bersih');
await page.screenshot({ path: outDir + '/antrine10-chat.png' });

const sources = await page.evaluate(async () => {
  async function text(path) {
    const res = await fetch(path);
    return res.ok ? await res.text() : '';
  }
  const down = await text('/raget/raget-neural/runtime/model-downloader.js');
  const at = down.indexOf('export async function downloadConcurrentChunks');
  return {
    down: down,
    pipe: at >= 0 ? down.slice(at) : '',
    mesin: await text('/raget/raget-runtime/mesin.js'),
    router: await text('/raget/raget-agents/engine-router.js'),
    loop: await text('/raget/raget-agents/core/agent-loop.js'),
    stream: await text('/raget/raget-agents/core/agent-stream.js'),
    engine: await text('/js/ai/engine.js'),
    worker: await text('/raget/raget-neural/runtime/opfs-writer-worker.js'),
  };
});
note(sources.down.includes('getReader') && sources.down.includes('256 * 1024') && sources.pipe.includes('readResponseBytes'), 'stream 256 KB terhidang', 'grain');
note(!sources.pipe.includes('store.put'), 'pipa tanpa store.put', 'bersih');
note(sources.pipe.includes('[owned.transferBuf]'), 'transfer ArrayBuffer', 'ada');
note(sources.pipe.includes('downloadBackoffMs'), 'backoff ada', 'ada');
note(!sources.mesin.includes('otak-template') && sources.mesin.includes('otak-1.0'), 'mesin hanya otak-1.0', 'ok');
note(!sources.router.includes('raget-deterministic') && !sources.router.includes('deterministicAdapter'), 'router tanpa deterministik', 'ok');
note(!sources.loop.includes('llmEngine') && !sources.stream.includes('llmEngine'), 'agen tanpa llmEngine', 'ok');
note(sources.stream.includes('neuralAdapter.ask'), 'agen masuk neural', 'ok');
note(!sources.engine.includes('llmEngine') && sources.engine.includes('neuralProvider'), 'engine.js neural', 'ok');
note(sources.worker.includes('createSyncAccessHandle') && sources.worker.includes('ArrayBuffer'), 'OPFS worker', 'ok');

await page.click('#btn-menu');
await page.click('#btn-settings');
await page.waitForSelector('.cat-row[data-cat="ai"]', { timeout: 15000 });
await page.click('.cat-row[data-cat="ai"]');
await page.waitForSelector('#btn-unduh-offline', { state: 'visible', timeout: 15000 });
const model = await page.evaluate(() => {
  const hub = document.querySelector('.model-hub');
  return hub ? hub.innerText.replace(/\s+/g, ' ') : '';
});
note(model.includes('Raget 1.0') && !model.includes('Tukar SDP'), 'halaman model tetap satu', model.slice(0, 160));
await page.screenshot({ path: outDir + '/antrine10-model.png' });
await browser.close();
const failed = findings.filter((row) => !row.ok);
fs.writeFileSync(outDir + '/antrine10-hasil.json', JSON.stringify({ findings, errors }, null, 2));
if (failed.length) {
  console.log('GAGAL ' + failed.length + '/' + findings.length);
  process.exit(1);
}
console.log('LULUS ' + findings.length + '/' + findings.length);

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
  } catch (e) { /* bingkai terkunci */ }
});
await page.route('**/*', (route) => {
  const url = route.request().url();
  if (url.includes('huggingface.co')) return route.abort();
  return route.continue();
});
await page.goto(base + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#chat-input', { timeout: 15000 });
const sources = await page.evaluate(async () => {
  async function text(file) {
    const res = await fetch(file);
    return res.ok ? await res.text() : '';
  }
  return {
    down: await text('/raget/raget-neural/runtime/model-downloader.js'),
    worker: await text('/raget/raget-neural/runtime/opfs-writer-worker.js'),
    provider: await text('/raget/raget-neural/neural-provider.js'),
    adapter: await text('/raget/raget-neural/neural-adapter.js'),
    raget: await text('/raget/raget-neural/runtime/raget-worker.js'),
    composer: await text('/js/chat/composer.js'),
    main: await text('/js/main.js'),
  };
});
const pipe = sources.down.slice(sources.down.indexOf('export async function downloadConcurrentChunks'));
note(!sources.composer.includes('Menjawab menggunakan partisi terunduh'), 'kalimat palsu hilang', 'composer');
note(sources.main.includes('bootWeights()') && sources.main.includes('weightsInstalled()'), 'boot saat sudah terpasang', 'main');
note(!/keepalive:\s*true/.test(pipe) && pipe.includes('res.status !== 206'), 'tanpa keepalive dan tolak HTTP 200', 'fetch');
note(pipe.includes("rategoan_chunks_mask:") && pipe.includes("op: 'close'") && pipe.includes('ack.ok !== true'), 'topeng revisi dan tutup OPFS', 'mask');
note(sources.down.includes('OPFS_ACK_MS = 20000') && sources.down.includes('READ_IDLE_MS = 15000'), 'jaga baca dan ack panjang', 'timer');
note(sources.worker.includes('sync.flush()') && sources.worker.includes('sync.close()'), 'writer menutup gagang', 'close');
note(sources.provider.includes('NOT_DOWNLOADED') && sources.provider.includes('safetensorsHeaderOk') && !/setTimeout\(fire,\s*INFERENCE_MS\)/.test(sources.provider), 'status dan header', 'provider');
note(!/setTimeout\(\(\) => ctrl\.abort\(\)/.test(sources.adapter) && !/mode \? null : setTimeout/.test(sources.adapter), 'abort hanya dari pengguna', 'adapter');
note(sources.raget.includes('nalar timeout') && sources.raget.includes('safetensorsHeaderOk') && sources.raget.includes('90000'), 'worker 90 detik', 'worker');
await page.fill('#chat-input', 'hallo');
await page.click('#btn-send');
await page.waitForTimeout(1200);
const chat = await page.evaluate(() => ((document.body && document.body.innerText) || '').replace(/\s+/g, ' '));
note(!chat.includes('Menjawab menggunakan partisi terunduh'), 'hallo tidak mengaku menjawab dari partisi', chat.slice(-320));
note(!/Selamat pagi[,.]?\s+saya/.test(chat), 'tanpa sapaan template', chat.slice(-240));
await page.screenshot({ path: outDir + '/antrine11-chat.png' });
await browser.close();
const failed = findings.filter((row) => !row.ok);
fs.writeFileSync(outDir + '/antrine11-hasil.json', JSON.stringify({ findings, errors }, null, 2));
if (failed.length || errors.length) {
  console.log('GAGAL ' + failed.length + '/' + findings.length + ' galat=' + errors.length);
  if (errors.length) console.log(errors.join('\n'));
  process.exit(1);
}
console.log('LULUS ' + findings.length + '/' + findings.length);

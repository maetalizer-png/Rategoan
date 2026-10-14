import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import { performance } from 'node:perf_hooks';
import { chromium } from 'playwright';
import { gemvFusedInt4 } from '../raget-neural/runtime/int4-session.js';
import { LLMSampler } from '../raget-neural/llm-sampler.js';

const root = new URL('../../', import.meta.url);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
};

function startServer() {
  const srv = http.createServer((req, res) => {
    const clean = (req.url || '/').split('?')[0];
    if (clean === '/api/connectors/web/search') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        query: 'raget',
        results: [
          { title: 'Rategoan Sovereign WebGPU Engine', url: 'https://rategoan.dev/webgpu', snippet: 'Mesin AI lokal 1.5B INT4 di peramban.' },
          { title: 'Arsitektur OPFS Streaming', url: 'https://rategoan.dev/opfs', snippet: 'Unduhan paralel 4-stream bebas fsync per partisi.' },
        ],
      }));
      return;
    }
    const rel = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
    const file = new URL(rel, root);
    if (!existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('404');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(rel)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => srv.listen(0, process.env.STUDI_BIND || '127.0.0.1', () => resolve(srv)));
}

function benchGemvAndSampler() {
  const rows = 1536;
  const cols = 1536;
  const packed = new Uint8Array((rows * cols) / 2);
  for (let i = 0; i < packed.length; i += 1) packed[i] = (i * 31 + 7) & 0xff;
  const blocks = (rows * cols) / 32;
  const scales = new Float32Array(blocks).fill(0.015625);
  const zeros = new Float32Array(blocks).fill(8);
  const x = new Float32Array(cols).fill(0.25);
  const y = new Float32Array(rows);

  const t0Old = performance.now();
  for (let iter = 0; iter < 5; iter += 1) {
    for (let r = 0; r < rows; r += 1) {
      let acc = 0;
      const rBase = r * cols;
      for (let c = 0; c < cols; c += 1) {
        const i = rBase + c;
        const byte = packed[i >> 1] || 0;
        const q = (i & 1) ? ((byte >>> 4) & 15) : (byte & 15);
        const blk = i >> 5;
        acc += (q - (zeros[blk] || 0)) * (scales[blk] || 0) * x[c];
      }
      y[r] = acc;
    }
  }
  const legacyMs = (performance.now() - t0Old) / 5;

  const t0New = performance.now();
  for (let iter = 0; iter < 5; iter += 1) {
    gemvFusedInt4(packed, scales, zeros, rows, cols, x, y, null, null);
  }
  const fastMs = (performance.now() - t0New) / 5;

  const vocabLogits = Array.from({ length: 32000 }, (_, i) => ((i * 17) % 100) * 0.05);
  vocabLogits[4242] = 30.0;
  const t0Sample = performance.now();
  for (let iter = 0; iter < 20; iter += 1) {
    LLMSampler.sampleAdaptive(vocabLogits, { temperature: 0.7, topK: 40, topP: 0.9, repetitionPenalty: 1.12, recentTokenIds: [1, 2, 3] });
  }
  const sampleMs = (performance.now() - t0Sample) / 20;

  return {
    legacyMs: Number(legacyMs.toFixed(2)),
    fastMs: Number(fastMs.toFixed(2)),
    speedup: Number((legacyMs / Math.max(0.01, fastMs)).toFixed(2)),
    sampleAdaptive32kMs: Number(sampleMs.toFixed(2)),
  };
}

const srv = await startServer();
const port = srv.address().port;
const baseUrl = 'http://127.0.0.1:' + port;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

try {
  const gemvBench = benchGemvAndSampler();
  const consoleErrors = [];

  // 1. Mobile 390x844 Full Audit (Thinking Pill UX, Attach Sheet Mode Chips, Connector Card Width, Sidebar & Settings)
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  phone.on('pageerror', (err) => consoleErrors.push(String(err)));
  await phone.addInitScript(() => {
    try {
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'maetalizer@gmail.com', time: Date.now() }));
      localStorage.removeItem('rategoan_weights_1_5b_installed');
    } catch (e) { /* ignore */ }
  });
  await phone.goto(baseUrl + '/index.html#/chat', { waitUntil: 'domcontentloaded' });
  await phone.waitForSelector('#chat-input', { timeout: 15000 });

  // Verify + Attach Sheet & Icon-Only Mode Toggle (NO text in #attach-row, only #btn-quick-web icon in keyboard bar)
  await phone.click('#btn-plus');
  await phone.waitForSelector('#attach-sheet:not([hidden])');
  await phone.click('#sheet-websearch');
  await phone.click('#sheet-research');
  const modeIconAudit = await phone.evaluate(() => {
    const row = document.getElementById('attach-row');
    const quickWeb = document.getElementById('btn-quick-web');
    const chips = Array.from(document.querySelectorAll('#attach-row .mode-chip'));
    return {
      attachRowHidden: !!(row && row.hidden),
      textChipsCount: chips.length,
      quickWebIconVisible: !!(quickWeb && !quickWeb.hidden && quickWeb.classList.contains('on')),
      quickWebText: quickWeb ? quickWeb.textContent.trim() : '',
    };
  });
  await phone.click('#sheet-research');
  await phone.click('#sheet-websearch');
  await phone.click('#attach-close');

  // Verify Thinking Pill UX (Collapsed by default with Brain icon, expands on click, no duplicate orphan dot)
  const thoughtAudit = await phone.evaluate(async () => {
    const { mountThought, buildDynamicThoughts } = await import('/js/ui/thought-card.js');
    const host = document.createElement('div');
    host.className = 'msg ai';
    document.getElementById('messages').appendChild(host);
    const box = mountThought(host, buildDynamicThoughts('hallo', { websearch: false }), 'berjalan');
    const defaultCollapsed = box.open === false;
    const hasBrainIcon = !!box.querySelector('.thought-dot.zen-dot.is-pulsing');
    const summaryText = box.querySelector('.thought-summary-label').textContent;
    box.querySelector('summary').click();
    const expandedAfterClick = box.open === true;
    const stepsCount = box.querySelectorAll('.stepper-node').length;
    const telemetryCount = box.querySelectorAll('.stepper-copy').length;
    const timerText = (box.querySelector('.thought-timer') || {}).textContent || '';
    host.remove();
    return { defaultCollapsed, hasBrainIcon, summaryText, timerText, expandedAfterClick, stepsCount, telemetryCount };
  });

  // Verify Mobile Connector Card Width (Screenshots 6 & 7 fix)
  await phone.goto(baseUrl + '/index.html#/connect', { waitUntil: 'domcontentloaded' });
  await phone.waitForTimeout(250);
  const mobileConnectAudit = await phone.evaluate(() => {
    const bodies = Array.from(document.querySelectorAll('#connect-hub .hub-card-body'));
    const widths = bodies.map((b) => Math.round(b.getBoundingClientRect().width));
    return {
      cardsCount: bodies.length,
      minBodyWidthPx: widths.length ? Math.min(...widths) : 0,
      widths,
    };
  });

  // Verify Settings Sub-Menus (Screenshot 8)
  await phone.goto(baseUrl + '/index.html#/settings', { waitUntil: 'domcontentloaded' });
  await phone.waitForTimeout(200);
  const settingsAudit = await phone.evaluate(() => {
    const cats = Array.from(document.querySelectorAll('.cat-row')).map((r) => r.getAttribute('data-cat'));
    return { categories: cats, count: cats.length };
  });

  // 2. Desktop 1366x768 & Studio Kode Live Verification
  const studioPage = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  studioPage.on('pageerror', (err) => consoleErrors.push(String(err)));
  await studioPage.addInitScript(() => {
    try {
      localStorage.setItem('rategoan_auth', JSON.stringify({ method: 'gmail', id: 'studi@rategoan.local', time: Date.now() }));
    } catch (e) { /* ignore */ }
  });
  await studioPage.goto(baseUrl + '/studio.html', { waitUntil: 'domcontentloaded' });
  await studioPage.waitForSelector('#chat-input', { timeout: 15000 });
  await studioPage.fill('#chat-input', 'buat halaman daftar belanja dengan tombol tambah');
  await studioPage.click('#btn-studio-send');
  await studioPage.waitForTimeout(900);
  await studioPage.fill('#chat-input', 'ganti teks "daftar" menjadi "inventaris"');
  await studioPage.click('#btn-studio-send');
  await studioPage.waitForTimeout(900);

  const studioAudit = await studioPage.evaluate(() => {
    const consoleText = (document.getElementById('console-output') || {}).textContent || '';
    const traces = document.querySelectorAll('.tool-trace-card').length;
    const thoughtsCollapsed = Array.from(document.querySelectorAll('.thought-accordion')).every((el) => el.open === false);
    return {
      traces,
      thoughtsCollapsed,
      hasGrep: consoleText.includes('[Grep]'),
      hasRead: consoleText.includes('[Read]'),
      hasSynthesize: consoleText.includes('[Synthesize]'),
      consoleSnippet: consoleText.slice(0, 260),
    };
  });

  const report = {
    ok: consoleErrors.length === 0
      && thoughtAudit.defaultCollapsed === true
      && thoughtAudit.hasBrainIcon === true
      && thoughtAudit.expandedAfterClick === true
      && modeIconAudit.attachRowHidden === true
      && modeIconAudit.textChipsCount === 0
      && modeIconAudit.quickWebIconVisible === true
      && modeIconAudit.quickWebText === ''
      && mobileConnectAudit.minBodyWidthPx >= 240
      && settingsAudit.count === 6
      && studioAudit.hasGrep
      && studioAudit.hasRead
      && studioAudit.thoughtsCollapsed,
    gemvBench,
    thoughtAudit,
    modeIconAudit,
    mobileConnectAudit,
    settingsAudit,
    studioAudit,
    consoleErrors,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
} finally {
  await browser.close();
  srv.close();
}

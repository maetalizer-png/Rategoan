// Verifikasi konsolidasi Ronde v3 (Fix Chat + Devlog Total + K + Stub):
// 3 assert chat (1.1/1.2/1.3), 6 tool devlog + 2 guard anti-narsis, PDF
// nyata ekstrak teks, nol emoji, nol error konsol.
// Jalankan: node tools/verify-ronde-v3.mjs [base-url]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';

const BASE = process.argv[2] || 'http://localhost:8099';
const NM = process.argv[3] || null; // optional: path to local pdfjs-dist/build dir for real-PDF test

function waitForNewStableReply(page, prevCount) {
  return page.waitForFunction((prev) => {
    const msgs = document.querySelectorAll('.msg.ai');
    if (msgs.length <= prev) return false;
    const last = msgs[msgs.length - 1];
    if (!window.__rgStable) window.__rgStable = new Map();
    const key = msgs.length;
    const text = last.textContent;
    const rec = window.__rgStable.get(key);
    if (!rec) { window.__rgStable.set(key, { text, t: Date.now() }); return false; }
    if (rec.text !== text) { window.__rgStable.set(key, { text, t: Date.now() }); return false; }
    return Date.now() - rec.t > 500;
  }, prevCount, { timeout: 15000, polling: 150 });
}

async function login(page) {
  await page.waitForTimeout(500);
  const loginVisible = await page.locator('#view-login').isVisible().catch(() => false);
  if (loginVisible) {
    await page.fill('#login-email', 'maetalizer@gmail.com');
    await page.click('#login-gmail-submit');
    await page.waitForTimeout(800);
  }
  const onboardVisible = await page.locator('#onboard-overlay').isVisible().catch(() => false);
  if (onboardVisible) { for (let i = 0; i < 3; i++) { await page.click('#onboard-ok'); await page.waitForTimeout(150); } }
}

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  let pass = 0, total = 0;
  const check = (name, cond) => { total++; if (cond) { pass++; console.log('PASS -', name); } else { console.log('FAIL -', name); } };

  // ===== 1. Fix chat (1.1/1.2/1.3) =====
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });

    await page.addInitScript(() => {
      class FakeVV extends EventTarget {
        constructor(realVV) { super(); this._height = realVV ? realVV.height : window.innerHeight; this._offsetTop = 0; }
        get height() { return this._height; }
        get offsetTop() { return this._offsetTop; }
        get width() { return window.innerWidth; }
      }
      const real = window.visualViewport;
      const fake = new FakeVV(real);
      Object.defineProperty(window, 'visualViewport', { value: fake, configurable: true });
      window.__setKeyboard = (open) => {
        fake._height = open ? Math.round((real ? real.height : window.innerHeight) * 0.45) : (real ? real.height : window.innerHeight);
        fake._offsetTop = 0;
        fake.dispatchEvent(new Event('resize'));
      };
    });
    await page.goto(BASE + '/index.html');
    await login(page);

    let prevCount = await page.locator('.msg.ai').count();
    await page.fill('#chat-input', 'Selamat malam');
    await page.click('#btn-send');
    await waitForNewStableReply(page, prevCount);
    await page.waitForTimeout(300);

    const scrollCheck = await page.evaluate(() => ({
      bodyOk: document.body.scrollWidth <= document.body.clientWidth,
      docOk: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    }));
    check('1.1 Nol goyang horizontal (body+doc scrollWidth<=clientWidth)', scrollCheck.bodyOk && scrollCheck.docOk);

    const actionsOverflow = await page.evaluate(() => {
      const el = document.querySelector('.msg-actions');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { right: rect.right, vw: window.innerWidth };
    });
    check('1.1 Baris chip aksi tidak meluap viewport', actionsOverflow && actionsOverflow.right <= actionsOverflow.vw + 1);

    await page.locator('#chat-input').click();
    await page.evaluate(() => window.__setKeyboard(true));
    await page.waitForTimeout(300);
    const composerVisible = await page.evaluate(() => {
      const c = document.getElementById('composer');
      const rect = c.getBoundingClientRect();
      const vv = window.visualViewport;
      return rect.bottom <= vv.offsetTop + vv.height + 2;
    });
    check('1.2 Composer tetap di atas keyboard (simulasi visualViewport)', composerVisible);
    await page.evaluate(() => window.__setKeyboard(false));
    await page.waitForTimeout(300);

    prevCount = await page.locator('.msg.ai').count();
    const samples = [];
    const sampleTask = (async () => {
      for (let i = 0; i < 6; i++) {
        const len = await page.evaluate(() => {
          const msgs = document.querySelectorAll('.msg.ai');
          const last = msgs[msgs.length - 1];
          const body = last ? last.firstElementChild : null;
          return body ? body.textContent.length : -1;
        });
        samples.push(len);
        await page.waitForTimeout(15);
      }
    })();
    await page.fill('#chat-input', 'Halo');
    await page.click('#btn-send');
    await sampleTask;
    await waitForNewStableReply(page, prevCount);
    check('1.3 Balasan pendek beranimasi bertahap', new Set(samples.filter((v) => v >= 0)).size > 1);

    const bodyText = await page.locator('body').innerText();
    check('Nol emoji di teks halaman chat', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(bodyText));
    check('Nol error konsol/halaman (chat)', errors.length === 0);
    await page.close();
  }

  // ===== 2. Devlog tools + guard anti-narsis + laporan otak =====
  {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });
    await page.goto(BASE + '/index.html');
    await login(page);

    async function ask(q) {
      const prevCount = await page.locator('.msg.ai').count();
      await page.fill('#chat-input', q);
      await page.click('#btn-send');
      await waitForNewStableReply(page, prevCount);
      return await page.locator('.msg.ai').last().textContent();
    }

    let reply = await ask('sejarahmu apa');
    check('devlog: "sejarahmu apa"', /ronde|entri|jilid|trisula/i.test(reply));

    reply = await ask('cara kerjamu gimana');
    check('devlog: "cara kerjamu gimana"', /lokal|template|dataries|retrieval/i.test(reply));

    reply = await ask('jilid 13 ngapain');
    check('devlog: "jilid 13 ngapain"', /jilid 13|kualitas.*struktur|retrieval/i.test(reply));

    reply = await ask('bug tersulit apa');
    check('devlog: "bug tersulit apa"', reply.length > 20 && !/maaf, saya belum punya jawaban/i.test(reply));

    reply = await ask('siapa pembuatmu');
    check('devlog: "siapa pembuatmu"', /raget-devlog|ronde|commit/i.test(reply));

    reply = await ask('perkembangan skormu gimana');
    check('devlog: "perkembangan skormu gimana"', /skor|kpi|kualitas|q=/i.test(reply));

    reply = await ask('ceritakan sejarah indonesia');
    check('GUARD: "ceritakan sejarah indonesia" tidak memicu devlog', !/raget-devlog|ronde pengembangan|commit awal/i.test(reply));

    reply = await ask('cara membuat kue coklat');
    check('GUARD: "cara membuat kue coklat" tidak memicu devlog', !/raget-devlog|dataries-bridge|retrieval satu pintu/i.test(reply));

    reply = await ask('laporan otak');
    check('"laporan otak" memuat seksi Memori Pengembangan', /memori pengembangan/i.test(reply));

    check('Nol error konsol/halaman (devlog)', errors.length === 0);
    await page.close();
  }

  // ===== 3. PDF nyata ekstrak teks =====
  if (NM) {
    const pdfMjs = readFileSync(NM + '/pdf.min.mjs', 'utf8');
    const pdfWorkerMjs = readFileSync(NM + '/pdf.worker.min.mjs', 'utf8');
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });
    await page.goto(BASE + '/index.html');
    await login(page);

    const injectResult = await page.evaluate(async ({ mjs, workerMjs }) => {
      const workerUrl = URL.createObjectURL(new Blob([workerMjs], { type: 'text/javascript' }));
      const libUrl = URL.createObjectURL(new Blob([mjs], { type: 'text/javascript' }));
      const mod = await import(libUrl);
      mod.GlobalWorkerOptions.workerSrc = workerUrl;
      window.pdfjsLib = mod;
      return { hasGetDocument: typeof mod.getDocument === 'function' };
    }, { mjs: pdfMjs, workerMjs: pdfWorkerMjs });
    check('PDF: pdf.js asli berhasil dimuat', injectResult.hasGetDocument === true);

    // Minimal handcrafted single-page PDF containing known text.
    const text = '(Rategoan Test PDF Konten) Tj';
    const content = 'BT /F1 24 Tf 50 700 Td ' + text + ' ET';
    const objs = {};
    objs[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    objs[2] = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    objs[3] = '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n';
    objs[4] = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
    objs[5] = '5 0 obj\n<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream\nendobj\n';
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (let i = 1; i <= 5; i++) { offsets[i] = Buffer.byteLength(pdf, 'latin1'); pdf += objs[i]; }
    const xrefStart = Buffer.byteLength(pdf, 'latin1');
    pdf += 'xref\n0 6\n0000000000 65535 f \n';
    for (let i = 1; i <= 5; i++) pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xrefStart + '\n%%EOF';
    const pdfB64 = Buffer.from(pdf, 'latin1').toString('base64');

    const extracted = await page.evaluate(async (b64) => {
      const mod = await import('/vault/pdf/reader.js');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return await mod.pdfReader.parsePDF(bytes.buffer);
    }, pdfB64);
    check('PDF: parsePDF() mengekstrak teks asli dari PDF nyata', extracted.ok === true && extracted.text.includes('Rategoan Test PDF Konten'));
    check('Nol error konsol/halaman (PDF)', errors.length === 0);
    await page.close();
  } else {
    console.log('(lewati blok PDF nyata - jalankan dengan argumen ke-2 berupa path node_modules/pdfjs-dist/build lokal)');
  }

  console.log(`\n${pass}/${total} passed`);
  await browser.close();
  if (pass !== total) process.exitCode = 1;
}
main();

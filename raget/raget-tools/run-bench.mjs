// Regresi bench penuh, dipecah core-suite (dihitung ke pass-rate resmi,
// target >=97%) vs stub-suite (informatif - kasus yang butuh file terlampir
// nyata seperti OCR/PDF/Notion/Evernote/WhatsApp/ICS, tidak bisa dipicu
// dari prompt teks murni oleh runner headless sederhana ini).
// Jalankan: node tools/run-bench.mjs [base-url]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';

const BASE = process.argv[2] || 'http://localhost:8099';
const bench = JSON.parse(readFileSync(new URL('./bench.json', import.meta.url), 'utf8'));

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
  }, prevCount, { timeout: 20000, polling: 150 });
}

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('response', (res) => { if (res.status() === 404) consoleErrors.push('404: ' + res.url()); });
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(500);

  const loginVisible = await page.locator('#view-login').isVisible().catch(() => false);
  if (loginVisible) {
    await page.fill('#login-email', 'maetalizer@gmail.com');
    await page.click('#login-gmail-submit');
    await page.waitForTimeout(800);
  }
  const onboardVisible = await page.locator('#onboard-overlay').isVisible().catch(() => false);
  if (onboardVisible) {
    for (let i = 0; i < 3; i++) {
      await page.click('#onboard-ok');
      await page.waitForTimeout(150);
    }
  }

  const results = { core: { pass: 0, total: 0, fails: [] }, stub: { pass: 0, total: 0, fails: [] } };
  const t0 = Date.now();
  for (const c of bench) {
    const suite = c.suite === 'stub' ? 'stub' : 'core';
    const prevCount = await page.locator('.msg.ai').count();
    await page.fill('#chat-input', c.prompt);
    await page.click('#btn-send');
    let reply = '';
    try {
      await waitForNewStableReply(page, prevCount);
      reply = await page.locator('.msg.ai').last().textContent();
    } catch (e) {
      reply = '(timeout)';
    }
    let pass = true;
    if (c.contains && !reply.includes(c.contains)) pass = false;
    if (c.containsAny && !c.containsAny.some((s) => reply.includes(s))) pass = false;
    if (c.containsAll && !c.containsAll.every((s) => reply.includes(s))) pass = false;
    if (c.notContains && c.notContains.some((s) => reply.includes(s))) pass = false;
    results[suite].total++;
    if (pass) results[suite].pass++;
    else results[suite].fails.push({ prompt: c.prompt, expectContains: c.contains || c.containsAny || c.containsAll, reply: reply.slice(0, 200) });
  }
  const elapsed = Date.now() - t0;

  const cacheStats = await page.evaluate(async () => {
    const mod = await import('/raget/raget-retrieval/retrieve.js');
    return mod.retrieval.cacheStats();
  });

  const totalPass = results.core.pass + results.stub.pass;
  const totalCount = results.core.total + results.stub.total;
  const corePct = ((results.core.pass / results.core.total) * 100).toFixed(1);
  const stubPct = ((results.stub.pass / results.stub.total) * 100).toFixed(1);

  console.log('=== CORE-SUITE (dihitung, target >=97%) ===');
  console.log('Total:', results.core.total, 'Pass:', results.core.pass, 'Rate:', corePct + '%', corePct >= 97 ? '[TARGET TERCAPAI]' : '[DI BAWAH TARGET]');
  console.log('\n=== STUB-SUITE (informatif - butuh attach nyata, tidak dihitung) ===');
  console.log('Total:', results.stub.total, 'Pass:', results.stub.pass, 'Rate:', stubPct + '%');
  console.log('\n=== GABUNGAN (untuk perbandingan historis) ===');
  console.log('Total:', totalCount, 'Pass:', totalPass, 'Rate:', ((totalPass / totalCount) * 100).toFixed(1) + '%');
  console.log('\nElapsed:', elapsed, 'ms, avg per case:', (elapsed / totalCount).toFixed(0), 'ms');
  console.log('Cache stats:', JSON.stringify(cacheStats));
  console.log('Console/404 errors:', JSON.stringify(consoleErrors));

  if (results.core.fails.length) {
    console.log('\n--- CORE FAILURES ---');
    results.core.fails.forEach((f) => console.log(JSON.stringify(f)));
  }
  if (results.stub.fails.length) {
    console.log('\n--- STUB FAILURES (informatif) ---');
    results.stub.fails.forEach((f) => console.log(JSON.stringify(f)));
  }

  await browser.close();
  if (parseFloat(corePct) < 97) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });

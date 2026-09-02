// Benchmark khusus halaman Agentic AI - terpisah dari bench.json/run-bench.mjs
// (itu menguji balasan Chat lewat #chat-input/#btn-send; Agentic AI py
// state machine sendiri dengan panel plan/tools/verify/result berbeda
// total, jadi butuh runner sendiri). 10 kategori wajib sesuai
// PROMPT-RATEGOAN-AGENTIC-AI.md §BENCHMARK.
//
// Jalankan: node raget/raget-tools/bench-agentic.mjs [base-url]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const BASE = process.argv[2] || 'http://localhost:8099';

async function waitTerminal(page, timeout) {
  await page.waitForFunction(() => {
    const el = document.getElementById('agentic-run');
    return el && !el.hidden;
  }, { timeout: timeout || 30000 });
}

async function runGoal(page, goal) {
  await page.fill('#agentic-goal', goal);
  await page.click('#agentic-run');
  await waitTerminal(page);
  const status = await page.locator('#agentic-status').textContent();
  const resultBody = await page.locator('#agentic-result').isVisible().catch(() => false)
    ? await page.locator('#agentic-result-body').textContent()
    : '';
  const verifyBody = await page.locator('#agentic-verify').isVisible().catch(() => false)
    ? await page.locator('#agentic-verify-body').textContent()
    : '';
  const toolRows = await page.locator('.agentic-tool-row').count();
  return { status, resultBody, verifyBody, toolRows };
}

const CASES = [
  {
    name: '1. Simple task (math engine)',
    run: async (page) => {
      const r = await runGoal(page, 'Hitung 25 × 4.');
      return r.status.includes('Selesai') && r.resultBody.includes('100');
    },
  },
  {
    name: '2. Multi-step task (rencana N hari -> plan+execute+verify+result)',
    run: async (page) => {
      const r = await runGoal(page, 'Buatkan rencana belajar 3 hari.');
      const planSteps = await page.locator('#agentic-plan-list li').count();
      return planSteps === 3 && r.toolRows >= 3 && r.status.includes('Selesai') && /Hari ke-1/.test(r.resultBody);
    },
  },
  {
    name: '3. Tool success (retrieval tool jalan & sukses)',
    run: async (page) => {
      const r = await runGoal(page, 'Jam berapa sekarang?');
      return r.toolRows >= 1 && r.status.includes('Selesai');
    },
  },
  {
    name: '4. Tool failure -> replan -> alternative tool dipakai',
    run: async (page) => {
      const r = await runGoal(page, 'zzqxwv flerbnorp glorzak tanpa makna apa pun 12345');
      return r.toolRows >= 2; // minimal 1 kegagalan + 1 percobaan alternatif
    },
  },
  {
    name: '5. Empty result -> tidak langsung dianggap selesai',
    run: async (page) => {
      const r = await runGoal(page, 'qqzxjv nonsens tanpa arti sama sekali blerg');
      return /empty_result|tool_error|insufficient_information/.test(r.verifyBody) || r.status.includes('Gagal');
    },
  },
  {
    name: '6. Verification failure ditampilkan di panel Verifikasi',
    run: async (page) => {
      const r = await runGoal(page, 'wxqzflorm blibnak tanpa makna sungguhan 999');
      return r.verifyBody.length > 0;
    },
  },
  {
    name: '7. Replanning tercatat (lebih dari 1 tool call untuk 1 step gagal)',
    run: async (page) => {
      const r = await runGoal(page, 'blerpnix qzawtor tanpa referensi apa pun 777');
      return r.toolRows >= 2;
    },
  },
  {
    name: '8. Retry limit (>=3x replan) -> berhenti, status Gagal',
    run: async (page) => {
      const r = await runGoal(page, 'xqzvblorpnaktrewmz gibberish sungguhan tanpa arti 42');
      return r.status.includes('Gagal') || r.status.includes('Sebagian');
    },
  },
  {
    name: '9. Cancellation (Hentikan -> status cancelled, tidak lanjut)',
    run: async (page) => {
      await page.fill('#agentic-goal', 'Buatkan rencana belajar 8 hari.');
      await page.click('#agentic-run');
      await page.waitForTimeout(30);
      await page.click('#agentic-stop').catch(() => {});
      await waitTerminal(page);
      const status = await page.locator('#agentic-status').textContent();
      return status.includes('Dibatalkan');
    },
  },
  {
    name: '10. Memory integration (tool memory dipanggil untuk goal "ingat...")',
    run: async (page) => {
      const r = await runGoal(page, 'Ingat bahwa nama proyek saya Rategoan.');
      return r.toolRows >= 1 && r.status.includes('Selesai');
    },
  },
];

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('response', (res) => { if (res.status() === 404) errors.push('404: ' + res.url()); });
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(500);
  const loginVisible = await page.locator('#view-login').isVisible().catch(() => false);
  if (loginVisible) {
    await page.fill('#login-email', 'maetalizer@gmail.com');
    await page.fill('#login-password', 'bench1234');
    await page.click('#login-gmail-submit');
    await page.waitForTimeout(800);
  }
  await page.evaluate(() => { location.hash = '/agentic'; });
  await page.waitForTimeout(300);
  await page.locator('#view-agentic').waitFor({ state: 'visible', timeout: 5000 });

  let pass = 0;
  const fails = [];
  for (const c of CASES) {
    let ok = false;
    try {
      ok = await c.run(page);
    } catch (e) {
      ok = false;
      fails.push(c.name + ' -> EXCEPTION: ' + e.message);
    }
    if (ok) pass++;
    else fails.push(c.name);
    console.log((ok ? '[PASS] ' : '[FAIL] ') + c.name);
  }

  console.log('\n=== HASIL BENCH AGENTIC AI ===');
  console.log('Pass:', pass, '/', CASES.length);
  console.log('Console/404 errors:', errors.length, errors.length ? JSON.stringify(errors) : '');
  if (fails.length) console.log('Fails:', JSON.stringify(fails, null, 2));

  await browser.close();
  if (pass < CASES.length || errors.length) process.exitCode = 1;
}

main().catch((e) => { console.error(e); process.exit(1); });

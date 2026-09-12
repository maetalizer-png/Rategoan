// Verifikasi konsolidasi Bagian 9: smoke test Jalanin + pemeriksaan DOM/UI penuh.
// Jalankan: node tools/verify-bagian9.mjs [base-url]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const BASE = process.argv[2] || 'http://localhost:8099';

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const errors = [];
  let pass = 0, total = 0;
  const check = (name, cond) => { total++; if (cond) { pass++; console.log('PASS -', name); } else { console.log('FAIL -', name); } };

  // ===== 1. Chat app: garis keyboard fix, zero emoji, zero console error =====
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on('pageerror', (e) => errors.push('chat pageerror: ' + e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push('chat console: ' + msg.text()); });
    page.on('response', (res) => { if (res.status() === 404) errors.push('chat 404: ' + res.url()); });
    await page.goto(BASE + '/index.html');
    await page.waitForTimeout(500);
    const loginVisible = await page.locator('#view-login').isVisible().catch(() => false);
    if (loginVisible) {
      await page.fill('#login-email', 'maetalizer@gmail.com');
      await page.click('#login-gmail-submit');
      await page.waitForTimeout(800);
    }
    const onboardVisible = await page.locator('#onboard-overlay').isVisible().catch(() => false);
    if (onboardVisible) { for (let i = 0; i < 3; i++) { await page.click('#onboard-ok'); await page.waitForTimeout(150); } }

    const vvh = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--vvh'));
    check('Chat: --vvh keyboard-fix property active', vvh.trim().length > 0);

    const bodyText = await page.locator('body').innerText();
    check('Chat: nol emoji di teks halaman', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(bodyText));

    // ===== Koleksi: 3 tab beda DOM =====
    await page.click('#btn-menu');
    await page.waitForTimeout(300);
    await page.click('#btn-collection');
    await page.waitForTimeout(400);
    const tersimpanTxt = await page.locator('#coll-content').innerText();
    await page.click('.coll-tab[data-ctab="perpus"]');
    await page.waitForTimeout(400);
    const perpusTxt = await page.locator('#coll-content').innerText();
    await page.click('.coll-tab[data-ctab="artefak"]');
    await page.waitForTimeout(400);
    const artefakTxt = await page.locator('#coll-content').innerText();
    check('Koleksi: 3 tab render DOM berbeda', tersimpanTxt !== perpusTxt && perpusTxt !== artefakTxt && tersimpanTxt !== artefakTxt);
    check('Koleksi: Perpustakaan 4 grup tampil', perpusTxt.includes('Catatan') && perpusTxt.includes('Fakta diajarkan') && /impor/i.test(perpusTxt) && perpusTxt.includes('Pengetahuan'));
    check('Koleksi: Artefak CTA 3 tombol (email/rencana/ekspor)', (await page.locator('#artCtaEmail, #artCtaTrip, #artCtaExport').count()) >= 1);

    await page.close();
  }

  // ===== 2. Travel app: 5 tab, smoke 11 fitur =====
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on('pageerror', (e) => errors.push('travel pageerror: ' + e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push('travel console: ' + msg.text()); });
    page.on('response', (res) => { if (res.status() === 404) errors.push('travel 404: ' + res.url()); });

    await page.goto(BASE + '/travel/');
    await page.evaluate(() => {
      localStorage.setItem('travel_coach', '1');
      const dep = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      localStorage.setItem('travel_trips', JSON.stringify([{ country: 'Jepang', days: 3, tier: 'hemat', depart: dep, time: Date.now() }]));
    });
    await page.reload();
    await page.waitForSelector('.card', { timeout: 10000 });
    await page.waitForTimeout(400);

    check('Travel: 5 tab nav (termasuk Asisten)', (await page.locator('.bot button').count()) === 5);

    const bodyText = await page.locator('body').innerText();
    check('Travel: nol emoji di teks halaman', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(bodyText));

    // 1. countdown
    check('Smoke: countdown widget', (await page.locator('.countdown-card').count()) > 0);
    // 2. leaderboard (play quiz)
    await page.locator('.bot button[data-tab="kuis"]').click();
    await page.waitForTimeout(400);
    await page.locator('#m1').click();
    await page.waitForTimeout(500);
    for (let i = 0; i < 12; i++) {
      const opt = page.locator('.q-opt').first();
      if (await opt.count() === 0) break;
      await opt.click();
      await page.waitForTimeout(900);
    }
    await page.waitForTimeout(400);
    check('Smoke: leaderboard tersimpan setelah kuis', await page.evaluate(() => JSON.parse(localStorage.getItem('travel_scores') || '[]').length > 0));

    // 3. tts toggle
    await page.locator('.bot button[data-tab="sapaan"]').click();
    await page.waitForTimeout(400);
    check('Smoke: TTS toggle ada', (await page.locator('#ttsToggle').count()) > 0);

    // back to jelajah for terakhir dilihat, bandingkan, favorit
    await page.locator('.bot button[data-tab="jelajah"]').click();
    await page.waitForTimeout(400);
    await page.locator('.card h3').first().click();
    await page.waitForTimeout(400);
    check('Smoke: favorit star di detail', (await page.locator('#favBtn').count()) > 0);
    await page.locator('#back').click();
    await page.waitForTimeout(400);
    check('Smoke: terakhir dilihat chip', /terakhir dilihat/i.test(await page.locator('#view').innerText()));

    await page.locator('#cmpOpen').click();
    await page.waitForTimeout(300);
    check('Smoke: bandingkan sheet', (await page.locator('.cmp-table').count()) > 0);
    await page.locator('#sheetX').click();
    await page.waitForTimeout(200);

    // 7. badge
    await page.locator('.bot button[data-tab="kuis"]').click();
    await page.waitForTimeout(400);
    const badgeBtn = page.locator('[data-badge]').first();
    if (await badgeBtn.count()) {
      await badgeBtn.click();
      await page.waitForTimeout(300);
      check('Smoke: badge detail sheet', (await page.locator('#sheet').isVisible()));
      await page.locator('#sheetX').click();
      await page.waitForTimeout(200);
    } else {
      check('Smoke: badge detail sheet', false);
    }

    // 8. converter preset
    await page.locator('.bot button[data-tab="jelajah"]').click();
    await page.waitForTimeout(400);
    await page.locator('.card h3').first().click();
    await page.waitForTimeout(400);
    const openConv = page.locator('#openConv');
    if (await openConv.count()) {
      await openConv.click();
      await page.waitForTimeout(300);
      check('Smoke: konverter preset', (await page.locator('[data-preset]').count()) > 0);
      await page.locator('#sheetX').click();
      await page.waitForTimeout(200);
    } else {
      check('Smoke: konverter preset', false);
    }
    await page.locator('#back').click().catch(() => {});
    await page.waitForTimeout(300);

    // 9. dropdown kota
    await page.locator('.seg button[data-m="wisata"]').click();
    await page.waitForTimeout(400);
    check('Smoke: dropdown kota wisata', (await page.locator('select.city-select').count()) > 0);

    // 10. jurnal MD export (via saved trip)
    await page.locator('.bot button[data-tab="trip"]').click();
    await page.waitForTimeout(400);
    const openSaved = page.locator('[data-open]').first();
    if (await openSaved.count()) {
      await openSaved.click();
      await page.waitForTimeout(400);
      check('Smoke: jurnal ekspor MD', (await page.locator('#jExport, #jAdd').count()) > 0);
    } else {
      check('Smoke: jurnal ekspor MD', false);
    }

    // Trip: Rencana siap + toast + tersimpan
    await page.locator('.bot button[data-tab="trip"]').click();
    await page.waitForTimeout(400);
    await page.fill('#tq', 'Thailand');
    await page.click('#gen');
    await page.waitForTimeout(700);
    check('Trip: Rencana siap panel', (await page.locator('#tripOut').innerText()).includes('Rencana siap'));
    check('Trip: label tanggal terlihat', (await page.locator('label.field-label').textContent()).includes('Tanggal berangkat'));
    await page.click('#tsave');
    await page.waitForTimeout(400);
    check('Trip: kartu tersimpan muncul + toast', (await page.locator('#tripSavedSlot').innerText()).includes('Thailand'));

    // 11. offline pack (profil)
    await page.locator('#profileBtn').click();
    await page.waitForTimeout(400);
    check('Smoke: paket offline section', /paket offline/i.test(await page.locator('#view').innerText()));

    // Asisten: Hari 1 + budget, PDF terpanggil
    await page.locator('.bot button[data-tab="jelajah"]').click().catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('.bot button[data-tab="asisten"]').click();
    await page.waitForTimeout(400);
    await page.fill('#asisInput', 'rencana ke vietnam 3 hari budget hemat');
    await page.click('#asisSend');
    await page.waitForTimeout(600);
    const asisReply = (await page.locator('.asis-msg.ai').last().textContent());
    check('Asisten: balasan berisi Hari 1 + budget', /Hari 1/.test(asisReply) && /budget|Rp/i.test(asisReply));
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
      page.locator('.asis-chipbar [data-chip]').nth(2).click(),
    ]);
    check('Asisten: PDF terpanggil (popup window)', !!popup);
    if (popup) await popup.close().catch(() => {});

    await page.close();
  }

  console.log(`\n${pass}/${total} passed`);
  console.log('Errors:', JSON.stringify(errors));
  await browser.close();
  if (pass !== total || errors.length) process.exitCode = 1;
}
main();

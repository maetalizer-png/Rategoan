// Skrip pengukuran baku Kekayaan (K) & Variasi struktur (V) untuk Raget.
// Komposisi TETAP: 60 factoid/extras + 20 pertanyaan terbuka + 20 smalltalk = 100 kueri.
// Dijalankan di sesi bersih (localStorage kosong) agar hasil antar ronde bisa dibandingkan apel-ke-apel.
// Pakai ulang skrip ini di setiap ronde; hasil dicatat ke tools/kv-baseline.json (kunci "raget_measure").
//
// Cara pakai: node tools/measure-kv.mjs [base-url] [label]
//   base-url default: http://localhost:8099
//   label    default: tanggal hari ini (dipakai sebagai catatan riwayat baseline)

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:8099';
const LABEL = process.argv[3] || new Date().toISOString().slice(0, 10);
const BASELINE_FILE = join(__dirname, 'kv-baseline.json');

const FACTOID_EXTRAS_60 = [
  'ibukota jepang', 'ibukota thailand', 'ibukota vietnam', 'ibukota mesir', 'ibukota brasil',
  'populasi jepang', 'populasi jerman', 'populasi india', 'mata uang jepang', 'mata uang inggris',
  'luas jepang', 'luas rusia', 'bahasa di jepang', 'bahasa di brasil',
  'sistem pemerintahan jepang', 'kapan indonesia merdeka',
  'negara dengan populasi terbesar', 'negara dengan luas terluas',
  'total populasi asean', 'total luas eropa',
  'negara apa yang ibukotanya tokyo', 'negara dengan mata uang yen',
  '5 km ke mil', '10 kg ke lb', '100 celcius ke fahrenheit',
  '100 dolar ke rupiah', '50 euro ke rupiah',
  'besok tanggal berapa', 'minggu depan tanggal berapa',
  'makanan khas jepang', 'makanan khas thailand', 'makanan khas korea',
  'minuman khas turki', 'minuman khas meksiko',
  'etika di jepang', 'tabu di india', 'sopan santun di korea selatan',
  'wisata di jepang', 'wisata di thailand', 'wisata terkenal di prancis',
  'hewan khas indonesia', 'budaya khas jepang', 'tari khas indonesia',
  'sejarah tembok besar china', 'sejarah kerajaan sriwijaya',
  'siapa penemu bola lampu', 'siapa penemu telepon', 'siapa pemimpin terkenal dalam sejarah dunia',
  'apa itu fotosintesis', 'apa itu gravitasi',
  'ekonomi jepang', 'letak geografis jepang', 'jepang terletak di mana',
  'sapaan dalam bahasa jepang', 'terima kasih dalam bahasa jepang',
  'penutur bahasa mandarin', 'kota terbesar di jepang',
  'kode telepon indonesia', 'jumlah provinsi indonesia',
  'siapa penjelajah terkenal yang menemukan jalur laut ke asia',
];

// Kueri "terbuka" dirancang khusus agar TIDAK tertangkap oleh detectTool/factoid/extras
// (yang punya jawaban deterministik), sehingga benar-benar sampai ke jalur fallback
// LLM+planner tempat metrik V (Variasi struktur, dari keragaman detectAnswerType) dihitung.
// Sebaran: 4 definisi, 4 daftar, 4 prosedur, 4 perbandingan, 2 matematika, 2 terbuka.
const TERBUKA_20 = [
  'apa itu machine learning',
  'apa itu blockchain terdesentralisasi',
  'apa itu filsafat stoikisme',
  'apa itu ekonomi sirkular',
  'sebutkan beberapa cara mengurangi stres harian',
  'sebutkan hal-hal yang bikin produktif di pagi hari',
  'sebutkan kebiasaan baik sebelum tidur',
  'sebutkan alasan orang suka traveling',
  'kalau mau cepat hafal pelajaran, cara efektifnya gimana',
  'supaya tidur lebih nyenyak, cara yang bisa dicoba apa saja',
  'biar rapat lebih efisien, cara mengaturnya gimana',
  'kalau ingin belajar konsisten, cara membiasakannya bagaimana',
  'kalau dipikir-pikir mana yang lebih unggul, teh atau kopi, coba bandingkan',
  'menurutmu mana yang lebih baik antara kerja kantor dan remote, bandingkan keduanya',
  'soal buku fisik dan e-book, mana yang lebih nyaman, tolong bandingkan',
  'antara kucing dan anjing sebagai peliharaan, yuk bandingkan plus minusnya',
  'berapa lama sebaiknya durasi olahraga harian',
  'berapa banyak air putih yang ideal diminum setiap hari',
  'menurutmu apa yang bikin seseorang bahagia dalam hidup',
  'gimana pendapatmu soal kerja sambil kuliah',
];

const SMALLTALK_20 = [
  'Halo, kamu siapa?', 'Selamat pagi', 'Selamat malam', 'Terima kasih ya',
  'Kamu capek gak sih ngobrol terus?', 'Apa kabar?', 'Lagi ngapain?',
  'Boleh kenalan?', 'Menurutmu belajar coding itu susah gak?', 'Kamu suka apa?',
  'Aku lagi capek banget hari ini', 'Aku lagi seneng banget nih', 'Aku sedih hari ini',
  'Sampai jumpa lagi', 'Bagus jawabanmu tadi', 'Makasih banyak ya',
  'Kamu robot atau manusia?', 'Kerja bagus!', 'Hai, apa kabar hari ini?', 'Malam, lagi sibuk apa?',
];

const ALL_QUERIES = [...FACTOID_EXTRAS_60, ...TERBUKA_20, ...SMALLTALK_20];

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

function parseLaporan(text) {
  const num = (re) => {
    const m = text.match(re);
    return m ? parseFloat(m[1]) : null;
  };
  return {
    quality: num(/Skor Kualitas:\s*(\d+)/),
    A: num(/Akurasi \(A\):\s*(\d+)/),
    K: num(/Kekayaan \(K\):\s*(\d+)/),
    U: num(/Keunikan \(U\):\s*(\d+)/),
    D: num(/Diversitas \(D\):\s*(\d+)/),
    V: num(/Variasi struktur \(V\):\s*(\d+)/),
    n_K: num(/Kekayaan \(K\):\s*\d+%\s*\(n=(\d+)\)/),
    n_V: num(/Variasi struktur \(V\):\s*\d+%\s*\(n=(\d+)\)/),
  };
}

async function main() {
  if (ALL_QUERIES.length !== 100) {
    throw new Error('Komposisi kueri harus tepat 100, saat ini: ' + ALL_QUERIES.length);
  }
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(500);
  const loginVisible = await page.locator('#view-login').isVisible().catch(() => false);
  if (loginVisible) {
    await page.fill('#login-email', 'measure@raget.local');
    await page.click('#login-gmail-submit');
    await page.waitForTimeout(800);
  }
  const onboardVisible = await page.locator('#onboard-overlay').isVisible().catch(() => false);
  if (onboardVisible) {
    for (let i = 0; i < 3; i++) { await page.click('#onboard-ok'); await page.waitForTimeout(150); }
  }

  const t0 = Date.now();
  for (const q of ALL_QUERIES) {
    const prevCount = await page.locator('.msg.ai').count();
    await page.fill('#chat-input', q);
    await page.click('#btn-send');
    try { await waitForNewStableReply(page, prevCount); } catch (e) {}
  }
  const elapsed = Date.now() - t0;

  const prevCount = await page.locator('.msg.ai').count();
  await page.fill('#chat-input', 'laporan otak');
  await page.click('#btn-send');
  await waitForNewStableReply(page, prevCount);
  const laporan = await page.locator('.msg.ai').last().textContent();

  const metrics = parseLaporan(laporan);
  const result = {
    label: LABEL,
    timestamp: new Date().toISOString(),
    queryCount: ALL_QUERIES.length,
    composition: { factoidExtras: FACTOID_EXTRAS_60.length, terbuka: TERBUKA_20.length, smalltalk: SMALLTALK_20.length },
    elapsedMs: elapsed,
    metrics,
  };

  console.log('=== raget_measure: hasil pengukuran K/V baku ===');
  console.log(JSON.stringify(result, null, 2));

  let history = [];
  if (existsSync(BASELINE_FILE)) {
    try { history = JSON.parse(readFileSync(BASELINE_FILE, 'utf8')); } catch (e) { history = []; }
  }
  history.push(result);
  writeFileSync(BASELINE_FILE, JSON.stringify(history, null, 2) + '\n');
  console.log('\nBaseline dicatat ke ' + BASELINE_FILE + ' (total riwayat: ' + history.length + ')');

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

import { bilingual } from './bilingual.js';
import { datariesBridge } from './dataries-bridge.js';

// ---------- INTERNATIONAL DAYS DATABASE ----------
// Domain migrasi skema data standar Ronde vNext Fase B (lihat roadmap §3,
// dan tokoh-store.js/kuliner-store.js untuk 2 domain sebelumnya): 158 entri
// kini murni JSON di raget-data/hari-internasional/hari-internasional.json
// (skema {id, kategori, wilayah, nama, tags, teks, meta}), wilayah sengaja
// null (observansi global, bukan spesifik geografis). Riwayat migrasi ada
// di raget-tools/migrate-hari-domain.mjs.
//
// CATATAN PENTING: percobaan pertama migrasi ini memakai TOP-LEVEL AWAIT
// (bukan loader async seperti tokoh/kuliner) supaya findByDate/tryHariByDate/
// tryHariByName tetap sinkron. Itu SALAH dan menyebabkan bug nyata: main.js
// meng-import agent.js di baris teratas, dan top-level await di modul ini
// menunda evaluasi seluruh rantai import termasuk main.js sendiri cukup
// lama sehingga event 'DOMContentLoaded' terlanjur terpicu SEBELUM listener
// utama main.js sempat terpasang - composer.bind() dkk tidak pernah
// berjalan, tombol kirim jadi diam total tanpa error apa pun di konsol.
// Ditemukan lewat pengujian langsung (respons via chat gagal total padahal
// pemanggilan agent.respond() langsung dari console tetap berhasil), bukan
// tebakan. Diperbaiki dengan pola loader tipis standar (cache + fetch lazy)
// yang sama seperti tokoh-store.js/kuliner-store.js, dan tryHariByDate/
// tryHariByName jadi async - dua baris pemanggilnya di agent.js diberi
// `await` inline di dalam rantai OR yang sudah ada (JS mengizinkan `await`
// di tengah ekspresi `||`, short-circuit tetap berlaku benar).
//
// CATATAN JUJUR yang tetap dipertahankan: target jangka panjang 200; 158
// entri (79%) yang ada terverifikasi tanggalnya tanpa menebak - 105 dari
// Ronde v5, +41 dari Ronde v6 B5, +12 dari Ronde v7 B2.

const MONTH_ID = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];

let hariCache = null;

async function loadHari() {
  if (hariCache) return hariCache;
  try {
    const res = await fetch(new URL('../raget-data/hari-internasional/hari-internasional.json', import.meta.url));
    const raw = res.ok ? await res.json() : [];
    hariCache = raw.map((e) => ({ date: e.meta.date, name: e.nama }));
  } catch (e) {
    hariCache = [];
  }
  return hariCache;
}

async function findByDate(dd, mm) {
  const key = String(dd).padStart(2, '0') + '-' + String(mm).padStart(2, '0');
  const days = await loadHari();
  return days.filter((d) => d.date === key);
}

async function tryHariByDate(text) {
  const t = text.toLowerCase();
  let m = t.match(/hari\s+(?:internasional\s+)?apa\s+(?:tanggal\s+)?(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i);
  if (!m) m = t.match(/(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(?:itu\s+)?hari\s+apa/i);
  if (!m) return null;
  const dd = parseInt(m[1], 10);
  const monthIdx = MONTH_ID.indexOf(m[2].toLowerCase());
  if (!dd || monthIdx < 0) return null;
  const found = await findByDate(dd, monthIdx + 1);
  const tanggalStr = dd + ' ' + MONTH_ID[monthIdx];
  if (!found.length) return 'Belum ada hari internasional khusus yang tercatat untuk tanggal ' + tanggalStr + ' di basis data ini.';
  return 'Hari internasional tanggal ' + tanggalStr + ':\n' + found.map((d) => '• ' + d.name).join('\n');
}

async function tryHariByName(text) {
  const t = text.toLowerCase();
  const m = t.match(/apa\s+itu\s+(hari\s+[a-z\s]+?)(?:\?|$)|kapan\s+(hari\s+[a-z\s]+?)(?:\?|$)/i);
  if (!m) return null;
  const query = (m[1] || m[2] || '').trim();
  if (!query) return null;
  const days = await loadHari();
  const found = days.find((d) => d.name.toLowerCase().includes(query) || query.includes(d.name.toLowerCase().replace(/^hari\s+/, 'hari ')));
  if (!found) return null;
  const [dd, mm] = found.date.split('-').map((n) => parseInt(n, 10));
  return found.name + ' diperingati setiap tanggal ' + dd + ' ' + MONTH_ID[mm - 1] + '.';
}

// ---------- 5-LANGUAGE DETECTION (ID/EN/AR/ZH/JA) ----------

function detectLanguage5(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  if (/[぀-ヿ]/.test(t)) return 'ja';
  if (/[一-鿿]/.test(t)) return 'zh';
  if (/[؀-ۿ]/.test(t)) return 'ar';
  return bilingual.detectLang(t);
}

const LANG_LABEL = { id: 'Indonesia', en: 'Inggris', ar: 'Arab', zh: 'Mandarin/China', ja: 'Jepang' };

function tryDetectLanguage(text) {
  const m = text.match(/^(?:bahasa\s+apa\s+ini|ini\s+bahasa\s+apa)\s*[:\-]?\s*(.+)$/i);
  if (!m) return null;
  const sample = m[1].trim().replace(/^["']|["']$/g, '');
  if (!sample) return null;
  const lang = detectLanguage5(sample);
  if (!lang) return 'Saya belum bisa memastikan bahasa dari teks itu.';
  return '"' + sample + '" kemungkinan besar berbahasa ' + LANG_LABEL[lang] + '.';
}

const NUMBERS_1_10 = {
  ar: ['wahid', 'ithnan', 'thalatha', 'arba’a', 'khamsa', 'sitta', 'sab’a', 'thamaniya', 'tis’a', '‘ashara'],
  zh: ['yī', 'èr', 'sān', 'sì', 'wǔ', 'liù', 'qī', 'bā', 'jiǔ', 'shí'],
  ja: ['ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyū', 'jū'],
};

function tryCountNumbers(text) {
  const t = text.toLowerCase();
  const m = t.match(/hitung\s+(?:1\s*(?:sampai|s\/d|-)\s*10|angka)\s+dalam\s+bahasa\s+(arab|mandarin|china|jepang)/i);
  if (!m) return null;
  const key = m[1] === 'china' ? 'mandarin' : m[1];
  const langCode = key === 'arab' ? 'ar' : key === 'mandarin' ? 'zh' : 'ja';
  const list = NUMBERS_1_10[langCode];
  return 'Angka 1-10 dalam bahasa ' + LANG_LABEL[langCode] + ': ' + list.map((w, i) => i + 1 + '=' + w).join(', ') + '.';
}

// ---------- "KONTEKS DI JELAJAH DUNIA" AUTO-MODE ----------
// Ronde v6 B5: diperluas dari 53 ke 121 kota (53 negara), meliputi seluruh negara
// yang punya data etika di raget-dataries/etika/*.js (data etika TIDAK dibuat baru,
// hanya dijangkau lebih luas). Negara Tiongkok memakai nama 'Tiongkok' (bukan 'China')
// supaya cocok dengan metadata.country di data etika - sebelumnya memakai 'China' yang
// menyebabkan lookup etika untuk kota-kota China selalu gagal (bug, sudah diperbaiki).

const CITY_COUNTRY = {
  tokyo: 'Jepang', osaka: 'Jepang', kyoto: 'Jepang',
  beijing: 'Tiongkok', shanghai: 'Tiongkok', 'hong kong': 'Tiongkok',
  seoul: 'Korea Selatan', busan: 'Korea Selatan',
  bangkok: 'Thailand', 'chiang mai': 'Thailand',
  singapura: 'Singapura', singapore: 'Singapura',
  'kuala lumpur': 'Malaysia', penang: 'Malaysia',
  jakarta: 'Indonesia', bali: 'Indonesia', bandung: 'Indonesia', yogyakarta: 'Indonesia', surabaya: 'Indonesia',
  manila: 'Filipina', cebu: 'Filipina',
  hanoi: 'Vietnam', 'ho chi minh': 'Vietnam',
  paris: 'Prancis', lyon: 'Prancis',
  london: 'Inggris', manchester: 'Inggris',
  berlin: 'Jerman', munich: 'Jerman',
  roma: 'Italia', milan: 'Italia',
  madrid: 'Spanyol', barcelona: 'Spanyol',
  amsterdam: 'Belanda',
  moskow: 'Rusia', moscow: 'Rusia',
  kairo: 'Mesir', cairo: 'Mesir',
  dubai: 'Uni Emirat Arab', 'abu dhabi': 'Uni Emirat Arab',
  istanbul: 'Turki', ankara: 'Turki',
  'new york': 'Amerika Serikat', 'los angeles': 'Amerika Serikat', chicago: 'Amerika Serikat',
  toronto: 'Kanada', vancouver: 'Kanada',
  meksiko: 'Meksiko', 'mexico city': 'Meksiko',
  'sao paulo': 'Brasil', 'rio de janeiro': 'Brasil',
  sydney: 'Australia', melbourne: 'Australia',
  nagoya: 'Jepang', fukuoka: 'Jepang', sapporo: 'Jepang',
  chengdu: 'Tiongkok', shenzhen: 'Tiongkok',
  incheon: 'Korea Selatan',
  medan: 'Indonesia', semarang: 'Indonesia',
  miami: 'Amerika Serikat', houston: 'Amerika Serikat', 'san francisco': 'Amerika Serikat',
  edinburgh: 'Inggris',
  nice: 'Prancis', marseille: 'Prancis',
  frankfurt: 'Jerman', hamburg: 'Jerman',
  venesia: 'Italia', napoli: 'Italia',
  sevilla: 'Spanyol',
  'saint petersburg': 'Rusia',
  izmir: 'Turki',
  sharjah: 'Uni Emirat Arab',
  montreal: 'Kanada',
  cancun: 'Meksiko', guadalajara: 'Meksiko',
  brasilia: 'Brasil', salvador: 'Brasil',
  perth: 'Australia', brisbane: 'Australia',
  davao: 'Filipina',
  'da nang': 'Vietnam',
  phuket: 'Thailand',
  'cape town': 'Afrika Selatan', johannesburg: 'Afrika Selatan',
  algiers: 'Aljazair',
  riyadh: 'Arab Saudi', jeddah: 'Arab Saudi', mekkah: 'Arab Saudi',
  'buenos aires': 'Argentina',
  santiago: 'Chili',
  'addis ababa': 'Etiopia',
  suva: 'Fiji',
  accra: 'Ghana',
  mumbai: 'India', delhi: 'India', bangalore: 'India',
  nairobi: 'Kenya',
  majuro: 'Kepulauan Marshall',
  honiara: 'Kepulauan Solomon',
  bogota: 'Kolombia',
  havana: 'Kuba',
  'kuwait city': 'Kuwait',
  beirut: 'Lebanon',
  marrakech: 'Maroko', casablanca: 'Maroko',
  lagos: 'Nigeria', abuja: 'Nigeria',
  muscat: 'Oman',
  'port moresby': 'Papua New Guinea',
  lima: 'Peru',
  doha: 'Qatar',
  apia: 'Samoa',
  stockholm: 'Swedia',
  'dar es salaam': 'Tanzania',
  nukualofa: 'Tonga',
  tunis: 'Tunisia',
  'port vila': 'Vanuatu',
  amman: 'Yordania',
};

async function tryAutoLocationContext(text) {
  const t = text.toLowerCase();
  const m = t.match(/\b(?:aku|saya)\s+(?:lagi|sedang)\s+di\s+([a-z\s]{2,25}?)(?:\s+nih|\s+sekarang|[.!?]|$)/i);
  if (!m) return null;
  const cityRaw = m[1].trim();
  const country = CITY_COUNTRY[cityRaw];
  if (!country) return null;
  const intro = 'Terdeteksi kamu lagi di ' + capitalize(cityRaw) + ' (' + country + ') — konteks Jelajah Dunia otomatis beralih ke ' + country + '.\n\n';
  const etika = await datariesBridge.extras('etika di ' + country);
  if (etika) return intro + etika;
  return intro + 'Belum ada data etika/budaya spesifik untuk ' + country + ' di basis data ini.';
}

function capitalize(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------- COMBINED ----------

async function tryWorldContext(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const auto = await tryAutoLocationContext(t);
  if (auto) return auto;
  return tryHariByDate(t) || tryHariByName(t) || tryDetectLanguage(t) || tryCountNumbers(t) || null;
}

export const worldContext = Object.freeze({
  tryHariByDate,
  tryHariByName,
  detectLanguage5,
  tryDetectLanguage,
  tryCountNumbers,
  tryAutoLocationContext,
  tryWorldContext,
});

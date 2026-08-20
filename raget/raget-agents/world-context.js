import { bilingual } from './bilingual.js';
import { datariesBridge } from './dataries-bridge.js';

// ---------- INTERNATIONAL DAYS DATABASE ----------
// Hari-hari peringatan internasional yang mapan (mayoritas ditetapkan PBB/UNESCO/WHO).
// Format tanggal: "DD-MM". CATATAN JUJUR: target jangka panjang adalah 200; yang benar-benar
// bisa diverifikasi tanggalnya dengan yakin (tanpa menebak) sejauh ini adalah 158 (79%) -
// 105 dari Ronde v5, +41 dari Ronde v6 B5, +12 dari Ronde v7 B2. Beberapa sumber pencarian
// yang dicoba tiap ronde memberi tanggal yang saling bertentangan/tergeser untuk sejumlah
// hari peringatan lain - entri tersebut SENGAJA tidak dimasukkan daripada menebak dan
// berisiko salah tanggal.

const MONTH_ID = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];

const INTERNATIONAL_DAYS = [
  { date: '04-01', name: 'Hari Braille Sedunia' },
  { date: '24-01', name: 'Hari Pendidikan Internasional' },
  { date: '27-01', name: 'Hari Peringatan Holocaust Internasional' },
  { date: '30-01', name: 'Hari Tanpa Kekerasan dan Perdamaian Sedunia' },
  { date: '02-02', name: 'Hari Lahan Basah Sedunia' },
  { date: '04-02', name: 'Hari Kanker Sedunia' },
  { date: '04-02', name: 'Hari Persaudaraan Manusia Internasional' },
  { date: '06-02', name: 'Hari Nol Toleransi terhadap Female Genital Mutilation Internasional' },
  { date: '10-02', name: 'Hari Kacang-kacangan Sedunia' },
  { date: '11-02', name: 'Hari Perempuan dan Anak Perempuan di Bidang Sains Internasional' },
  { date: '13-02', name: 'Hari Radio Sedunia' },
  { date: '20-02', name: 'Hari Keadilan Sosial Sedunia' },
  { date: '21-02', name: 'Hari Bahasa Ibu Internasional' },
  { date: '01-03', name: 'Hari Nol Diskriminasi' },
  { date: '03-03', name: 'Hari Satwa Liar Sedunia' },
  { date: '04-03', name: 'Hari Rekayasa Sedunia untuk Pembangunan Berkelanjutan' },
  { date: '08-03', name: 'Hari Perempuan Internasional' },
  { date: '14-03', name: 'Hari Matematika Internasional' },
  { date: '15-03', name: 'Hari Hak Konsumen Sedunia' },
  { date: '20-03', name: 'Hari Kebahagiaan Internasional' },
  { date: '21-03', name: 'Hari Hutan Internasional' },
  { date: '21-03', name: 'Hari Penghapusan Diskriminasi Rasial Internasional' },
  { date: '21-03', name: 'Hari Puisi Sedunia' },
  { date: '21-03', name: 'Hari Down Syndrome Sedunia' },
  { date: '22-03', name: 'Hari Air Sedunia' },
  { date: '23-03', name: 'Hari Meteorologi Sedunia' },
  { date: '24-03', name: 'Hari Tuberkulosis Sedunia' },
  { date: '25-03', name: 'Hari Peringatan Korban Perbudakan' },
  { date: '02-04', name: 'Hari Peduli Autisme Sedunia' },
  { date: '04-04', name: 'Hari Kesadaran Ranjau Internasional' },
  { date: '06-04', name: 'Hari Olahraga untuk Pembangunan dan Perdamaian Internasional' },
  { date: '07-04', name: 'Hari Kesehatan Sedunia' },
  { date: '08-04', name: 'Hari Roma Internasional' },
  { date: '12-04', name: 'Hari Penerbangan Luar Angkasa Manusia Internasional' },
  { date: '18-04', name: 'Hari Warisan Sedunia' },
  { date: '21-04', name: 'Hari Kreativitas dan Inovasi Sedunia' },
  { date: '22-04', name: 'Hari Bumi' },
  { date: '23-04', name: 'Hari Buku dan Hak Cipta Sedunia' },
  { date: '25-04', name: 'Hari Malaria Sedunia' },
  { date: '26-04', name: 'Hari Kekayaan Intelektual Sedunia' },
  { date: '28-04', name: 'Hari Keselamatan dan Kesehatan Kerja Sedunia' },
  { date: '29-04', name: 'Hari Peringatan Korban Perang Kimia' },
  { date: '30-04', name: 'Hari Tari Internasional' },
  { date: '01-05', name: 'Hari Buruh Internasional' },
  { date: '02-05', name: 'Hari Tuna Sedunia' },
  { date: '03-05', name: 'Hari Kebebasan Pers Sedunia' },
  { date: '05-05', name: 'Hari Bidan Internasional' },
  { date: '08-05', name: 'Hari Palang Merah dan Bulan Sabit Merah Sedunia' },
  { date: '12-05', name: 'Hari Perawat Internasional' },
  { date: '15-05', name: 'Hari Keluarga Internasional' },
  { date: '17-05', name: 'Hari Telekomunikasi dan Masyarakat Informasi Sedunia' },
  { date: '18-05', name: 'Hari Museum Internasional' },
  { date: '20-05', name: 'Hari Lebah Sedunia' },
  { date: '21-05', name: 'Hari Keanekaragaman Budaya untuk Dialog dan Pembangunan' },
  { date: '22-05', name: 'Hari Keanekaragaman Hayati Internasional' },
  { date: '25-05', name: 'Hari Afrika' },
  { date: '29-05', name: 'Hari Penjaga Perdamaian PBB Internasional' },
  { date: '31-05', name: 'Hari Tanpa Tembakau Sedunia' },
  { date: '01-06', name: 'Hari Orang Tua Sedunia' },
  { date: '03-06', name: 'Hari Sepeda Sedunia' },
  { date: '04-06', name: 'Hari Anak-Anak Korban Agresi Internasional' },
  { date: '05-06', name: 'Hari Lingkungan Hidup Sedunia' },
  { date: '07-06', name: 'Hari Keamanan Pangan Sedunia' },
  { date: '08-06', name: 'Hari Laut Sedunia' },
  { date: '12-06', name: 'Hari Menentang Pekerja Anak Sedunia' },
  { date: '14-06', name: 'Hari Donor Darah Sedunia' },
  { date: '15-06', name: 'Hari Kesadaran Kekerasan pada Lansia Sedunia' },
  { date: '16-06', name: 'Hari Anak Afrika' },
  { date: '17-06', name: 'Hari Memerangi Desertifikasi dan Kekeringan Sedunia' },
  { date: '18-06', name: 'Hari Melawan Ujaran Kebencian Internasional' },
  { date: '18-06', name: 'Hari Gastronomi Berkelanjutan Sedunia' },
  { date: '19-06', name: 'Hari Penghapusan Kekerasan Seksual dalam Konflik Internasional' },
  { date: '20-06', name: 'Hari Pengungsi Sedunia' },
  { date: '21-06', name: 'Hari Musik Sedunia' },
  { date: '21-06', name: 'Hari Yoga Internasional' },
  { date: '23-06', name: 'Hari Pelayanan Publik Internasional' },
  { date: '25-06', name: 'Hari Pelaut Sedunia' },
  { date: '26-06', name: 'Hari Anti Penyalahgunaan dan Peredaran Gelap Narkoba Internasional' },
  { date: '26-06', name: 'Hari Dukungan bagi Korban Penyiksaan Internasional' },
  { date: '29-06', name: 'Hari Tropis Internasional' },
  { date: '30-06', name: 'Hari Asteroid Sedunia' },
  { date: '11-07', name: 'Hari Populasi Sedunia' },
  { date: '15-07', name: 'Hari Keterampilan Pemuda Sedunia' },
  { date: '17-07', name: 'Hari Keadilan Internasional Sedunia' },
  { date: '18-07', name: 'Hari Nelson Mandela Internasional' },
  { date: '20-07', name: 'Hari Catur Sedunia' },
  { date: '26-07', name: 'Hari Konservasi Ekosistem Mangrove Sedunia' },
  { date: '28-07', name: 'Hari Hepatitis Sedunia' },
  { date: '30-07', name: 'Hari Persahabatan Internasional' },
  { date: '30-07', name: 'Hari Anti Perdagangan Manusia Sedunia' },
  { date: '09-08', name: 'Hari Masyarakat Adat Sedunia' },
  { date: '12-08', name: 'Hari Pemuda Internasional' },
  { date: '19-08', name: 'Hari Kemanusiaan Sedunia' },
  { date: '20-08', name: 'Hari Nyamuk Sedunia' },
  { date: '22-08', name: 'Hari Peringatan Korban Kekerasan Berbasis Agama atau Keyakinan Internasional' },
  { date: '23-08', name: 'Hari Peringatan Perdagangan Budak dan Penghapusannya' },
  { date: '29-08', name: 'Hari Menentang Uji Coba Nuklir Internasional' },
  { date: '30-08', name: 'Hari Korban Penghilangan Paksa Internasional' },
  { date: '31-08', name: 'Hari Orang Keturunan Afrika Internasional' },
  { date: '05-09', name: 'Hari Amal Internasional' },
  { date: '07-09', name: 'Hari Udara Bersih untuk Langit Biru Internasional' },
  { date: '08-09', name: 'Hari Literasi Internasional' },
  { date: '10-09', name: 'Hari Pencegahan Bunuh Diri Sedunia' },
  { date: '12-09', name: 'Hari Kerja Sama Selatan-Selatan PBB' },
  { date: '15-09', name: 'Hari Demokrasi Internasional' },
  { date: '16-09', name: 'Hari Perlindungan Lapisan Ozon Internasional' },
  { date: '20-09', name: 'Hari Olahraga Universitas Internasional' },
  { date: '21-09', name: 'Hari Perdamaian Sedunia' },
  { date: '23-09', name: 'Hari Bahasa Isyarat Internasional' },
  { date: '26-09', name: 'Hari Penghapusan Total Senjata Nuklir Internasional' },
  { date: '27-09', name: 'Hari Pariwisata Sedunia' },
  { date: '28-09', name: 'Hari Akses Informasi Universal' },
  { date: '29-09', name: 'Hari Kesadaran Kerugian dan Limbah Pangan Sedunia' },
  { date: '30-09', name: 'Hari Penerjemahan Sedunia' },
  { date: '01-10', name: 'Hari Lanjut Usia Internasional' },
  { date: '02-10', name: 'Hari Anti Kekerasan Internasional' },
  { date: '04-10', name: 'Hari Hewan Sedunia' },
  { date: '05-10', name: 'Hari Guru Sedunia' },
  { date: '09-10', name: 'Hari Pos Sedunia' },
  { date: '10-10', name: 'Hari Kesehatan Mental Sedunia' },
  { date: '11-10', name: 'Hari Anak Perempuan Internasional' },
  { date: '13-10', name: 'Hari Pengurangan Risiko Bencana Internasional' },
  { date: '15-10', name: 'Hari Wanita Pedesaan Internasional' },
  { date: '15-10', name: 'Hari Cuci Tangan Sedunia' },
  { date: '16-10', name: 'Hari Pangan Sedunia' },
  { date: '17-10', name: 'Hari Penghapusan Kemiskinan Internasional' },
  { date: '20-10', name: 'Hari Statistik Sedunia' },
  { date: '24-10', name: 'Hari PBB' },
  { date: '24-10', name: 'Hari Informasi Pembangunan Sedunia' },
  { date: '27-10', name: 'Hari Warisan Audiovisual Sedunia' },
  { date: '31-10', name: 'Hari Kota Sedunia' },
  { date: '02-11', name: 'Hari Mengakhiri Impunitas atas Kejahatan terhadap Jurnalis Internasional' },
  { date: '03-11', name: 'Hari Cagar Biosfer Internasional' },
  { date: '05-11', name: 'Hari Kesadaran Tsunami Sedunia' },
  { date: '06-11', name: 'Hari Pencegahan Eksploitasi Lingkungan dalam Perang dan Konflik Bersenjata Internasional' },
  { date: '10-11', name: 'Hari Sains untuk Perdamaian dan Pembangunan Sedunia' },
  { date: '13-11', name: 'Hari Kebaikan Sedunia' },
  { date: '14-11', name: 'Hari Diabetes Sedunia' },
  { date: '16-11', name: 'Hari Toleransi Internasional' },
  { date: '17-11', name: 'Hari Mahasiswa Internasional' },
  { date: '19-11', name: 'Hari Toilet Sedunia' },
  { date: '20-11', name: 'Hari Anak Sedunia' },
  { date: '20-11', name: 'Hari Industrialisasi Afrika' },
  { date: '21-11', name: 'Hari Televisi Sedunia' },
  { date: '25-11', name: 'Hari Penghapusan Kekerasan terhadap Perempuan Internasional' },
  { date: '29-11', name: 'Hari Solidaritas dengan Rakyat Palestina Internasional' },
  { date: '01-12', name: 'Hari AIDS Sedunia' },
  { date: '02-12', name: 'Hari Penghapusan Perbudakan Internasional' },
  { date: '03-12', name: 'Hari Penyandang Disabilitas Internasional' },
  { date: '05-12', name: 'Hari Relawan Internasional' },
  { date: '07-12', name: 'Hari Penerbangan Sipil Internasional' },
  { date: '09-12', name: 'Hari Anti Korupsi Sedunia' },
  { date: '10-12', name: 'Hari Hak Asasi Manusia' },
  { date: '11-12', name: 'Hari Gunung Internasional' },
  { date: '12-12', name: 'Hari Cakupan Kesehatan Semesta Internasional' },
  { date: '18-12', name: 'Hari Migran Internasional' },
  { date: '20-12', name: 'Hari Solidaritas Manusia Internasional' },
  { date: '27-12', name: 'Hari Kesiapsiagaan Epidemi Internasional' },
];

function findByDate(dd, mm) {
  const key = String(dd).padStart(2, '0') + '-' + String(mm).padStart(2, '0');
  return INTERNATIONAL_DAYS.filter((d) => d.date === key);
}

function tryHariByDate(text) {
  const t = text.toLowerCase();
  let m = t.match(/hari\s+(?:internasional\s+)?apa\s+(?:tanggal\s+)?(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i);
  if (!m) m = t.match(/(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(?:itu\s+)?hari\s+apa/i);
  if (!m) return null;
  const dd = parseInt(m[1], 10);
  const monthIdx = MONTH_ID.indexOf(m[2].toLowerCase());
  if (!dd || monthIdx < 0) return null;
  const found = findByDate(dd, monthIdx + 1);
  const tanggalStr = dd + ' ' + MONTH_ID[monthIdx];
  if (!found.length) return 'Belum ada hari internasional khusus yang tercatat untuk tanggal ' + tanggalStr + ' di basis data ini.';
  return 'Hari internasional tanggal ' + tanggalStr + ':\n' + found.map((d) => '• ' + d.name).join('\n');
}

function tryHariByName(text) {
  const t = text.toLowerCase();
  const m = t.match(/apa\s+itu\s+(hari\s+[a-z\s]+?)(?:\?|$)|kapan\s+(hari\s+[a-z\s]+?)(?:\?|$)/i);
  if (!m) return null;
  const query = (m[1] || m[2] || '').trim();
  if (!query) return null;
  const found = INTERNATIONAL_DAYS.find((d) => d.name.toLowerCase().includes(query) || query.includes(d.name.toLowerCase().replace(/^hari\s+/, 'hari ')));
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
  INTERNATIONAL_DAYS,
});

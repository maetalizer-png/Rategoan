import { hashText, pickVariant, detectTone, normalizeSlang } from '../../utils/text.js';
import { fuzzySmalltalk } from './fuzzy-smalltalk.js';

const FALLBACK_TEXT = 'Maaf, saya belum yakin. Coba sebut lebih jelas: sekolah, layanan, rumah, atau kabar hari ini?';
const GENERIC_PREFIX = 'Saya catat:';

const TIME_GREETING_RE =
  /^(selamat|met)?\s*(pagi|siang|sore|malam)\b|^good\s*(morning|afternoon|evening|night)\b/i;
const PLAIN_GREETING_RE =
  /^(halo+|hallo+|helo+|hello+|hai+|hey+|hi+|hei+|yo+|ping)\b|^assalamu.?alaikum\b|^permisi\b|^pagi\b|^siang\b|^sore\b|^malam\b/i;
const QUESTION_WORDS = [
  'apa',
  'siapa',
  'kapan',
  'dimana',
  'di mana',
  'mengapa',
  'kenapa',
  'bagaimana',
  'berapa',
  'gimana',
];

const SMALLTALK_TRIGGERS = {
  izin: /\bizin\s+(tidak\s+masuk|kelas|kerja)|minta\s+izin\b/i,
  tugas: /\b(tugas|deadline|makalah|presentasi|pekerjaan\s+rumah|pr\s+menumpuk)\b/i,
  layanan: /\b(layanan|loket|antr[ie]|berkas|ktp|kk\b|pengaduan|komplain|dukcapil|calo|\bsim\b|perpanjang\s+sim)\b/i,
  rumah: /\b(kompor|gas\s+bocor|sampah|air\s+mati|listrik\s+padam|listrik\s+mati|cucian|piring\s+kotor|rumah\s+berantakan)\b/i,
  sekolah: /\b(sekolah|kelas|ulangan|pr\b|pelajaran|mapel|guru|wali\s*kelas|osis)\b/i,
  siapa: /siapa\s+(kamu|anda|lu|elo)\b|kamu\s+siapa|kenalan\s+dong/i,
  kabar: /\bkabar\s*(kamu|anda|lu|elu|mu)?\b|\b(apa|gimana|bagaimana)\s+kabar\b|how\s+are\s+you/i,
  terima_kasih: /terima\s*kasih|makasih|thanks|thank\s*you|trims\b/i,
  jumpa: /sampai\s+jumpa|dad+ah|^bye\b|selamat\s+tinggal|see\s+you/i,
  kemampuan: /kamu\s+bisa\s+apa|kemampuan(mu|kamu)?\b|apa\s+yang\s+bisa\s+kamu\s+lakukan|\b(bisa|punya|sanggup)\s+(ber)?(pikir|fikir)\b|\bpunya\s+(otak|akal|kesadaran|perasaan)\b|\b(bisa|sanggup)\s+(memberi(kan)?|melakukan)\s+(pelayanan|layanan)\b/i,
  bantu: /\b(tolong|bisa)\s+(bantu|bantuan)\b|\bbantu(in|kan)?\s+(saya|aku)\b|\bbutuh\s+bantuan\b|\bbantuan\s+(dong|ya)\b/i,
  maaf: /^(maaf|sorry)\b|\bmaaf(kan)?\s+(ya|dong)/i,
  lagi_apa: /\b(lagi\s+apa|ngapain\s+(kamu|sekarang)|kamu\s+lagi\s+(apa|ngapain))\b/i,
  capek: /\b(capek|lelah|ngantuk\s+berat|kehabisan\s+tenaga)\b/i,
  bosen: /\b(bosen|bosan|gabut|jenuh)\b/i,
  pasar: /\b(pasar|tawar|warung|dagang)\b/i,
  transport: /\b(angkot|ojek|kereta|macet|parkir|helm|mudik|delay|telat\s+(kereta|bus|angkot))\b/i,
  sehat: /\b(demam|pusing|obat|klinik|sakit|anak\s+demam)\b/i,
  uang: /\b(utang|pinjam|tagihan|listrik|belanja|diskon)\b/i,
  tetangga: /\b(tetangga|kerja\s*bakti|gang|iuran\s*rt)\b/i,
  kerja: /\b(kantor|rapat|lembur|wfh|atasan|gaji\s+telat|gaji\s+belum)\b/i,
};

const SMALLTALK_FALLBACK = {
  siapa: ['Saya {name}, asisten lokal Rategoan. Semua obrolan tersimpan di perangkatmu.'],
  kabar: ['Saya baik, terima kasih sudah nanya! Kamu sendiri gimana kabarnya?'],
  terima_kasih: ['Sama-sama. Kalau masih ada yang kurang jelas, tanya lagi saja.'],
  jumpa: ['Sampai jumpa. Saya di sini kalau kamu butuh lagi.'],
  kemampuan: ['Saya bisa ngobrol, bantu layanan, hitung, ringkas, dan jawab dari data terstruktur di perangkatmu.'],
  bantu: ['Siap, saya bantu. Ceritakan singkat keperluannya.'],
  maaf: ['Tidak apa-apa. Lanjut saja, saya masih di sini.'],
  lagi_apa: ['Saya di sini, siap ngobrol atau bantu urusan. Kamu sendiri lagi ngapain?'],
  sekolah: ['Silakan. PR, ulangan, atau izin kelas — pecah dulu jadi satu langkah.'],
  tugas: ['Sebut jenis tugas dan tenggatnya. Nanti kita pecah langkahnya.'],
  layanan: ['Sampaikan jenis layanan dan kendalanya. Antre wajar, bayar hanya di kanal resmi.'],
  capek: ['Istirahat sebentar itu sah. Lanjut kalau sudah siap.'],
  bosen: ['Ganti tugas kecil sepuluh menit, atau istirahat. Bosen itu sinyal ganti ritme.'],
  izin: ['Kabari pihak yang berwenang lebih dulu, alasan singkat, jangan di hari H tanpa kabar.'],
  pasar: ['Tawar sopan. Kalau harga sudah pas, tidak usah dipaksa.'],
  transport: ['Cek kendaraan dan tujuan. Jangan lawan arus. Helm atau sabuk dipakai.'],
  sehat: ['Keluhan ringan: istirahat dan minum air. Yang memberat ke faskes. Saya bukan dokter.'],
  uang: ['Catat pengeluaran. Jangan transfer karena diskon mendesak ke rekening tidak jelas.'],
  tetangga: ['Sampaikan pelan dulu. Jangan langsung marah di grup RT.'],
  kerja: ['Kabari atasan jika terlambat. Rapat: poin singkat, HP senyap.'],
  rumah: ['Kalau bau gas: jangan nyalakan api, buka jendela, keluar dulu.'],
};

const SAPAAN_FALLBACK_TEXT = 'Halo! Ada yang bisa saya bantu?';

let sapaanCache = null;

function addSmalltalk(idx, key, templates, formal) {
  if (!key) return;
  const cur = idx.smalltalk[key] || { templates: [], templatesFormal: null };
  const extra = (templates || []).filter(Boolean);
  cur.templates = (cur.templates || []).concat(extra);
  if (formal && formal.length) cur.templatesFormal = (cur.templatesFormal || []).concat(formal);
  idx.smalltalk[key] = cur;
}

const JENIS_TO_KEY = {
  sekolah: 'sekolah',
  layanan: 'layanan',
  harian: 'kabar',
  kerja: 'kerja',
  kesehatan: 'sehat',
  keluarga: 'kabar',
  makan: 'kabar',
  cuaca: 'kabar',
  digital: 'kemampuan',
  tugas: 'tugas',
  tutup: 'jumpa',
  perjalanan: 'transport',
  transport: 'transport',
  kebiasaan: 'kabar',
  sopan: 'bantu',
  formal: 'bantu',
  informal: 'lagi_apa',
  jenaka: 'siapa',
  rindu: 'jumpa',
  transportasi: 'transport',
  rumah: 'rumah',
  lingkungan: 'tetangga',
};

// jenis values whose text belongs in the plain-greeting pool rather than a
// smalltalk trigger bucket (used for short greetings like "hai"/"hei" with
// no dedicated bucket of their own).
const JENIS_TO_PLAIN = new Set(['hai', 'hei', 'datang']);

function indexSapaan(raw) {
  const idx = { time: {}, plain: [], smalltalk: {}, followup: { greeting: [], smalltalk: [] } };
  for (const e of Array.isArray(raw) ? raw : []) {
    const m = e && e.meta ? e.meta : {};
    // variants adalah TAMBAHAN cara bilang yang sama, bukan pengganti teks
    // utama -- kalau cuma dipilih salah satu, teks utama yang biasanya lebih
    // lengkap/matang jadi tidak pernah kepilih sama sekali.
    const teksList = (e && e.teks ? [e.teks] : []).concat(m.variants && m.variants.length ? m.variants : []);
    const vals = teksList.length ? teksList : [e.teks];
    if (m.jenis === 'waktu' && m.periode) idx.time[m.periode] = (idx.time[m.periode] || []).concat(vals);
    else if (m.jenis === 'plain') idx.plain = (idx.plain || []).concat(vals);
    else if (m.jenis === 'lanjut') idx.followup.smalltalk = (idx.followup.smalltalk || []).concat(vals);
    else if (JENIS_TO_PLAIN.has(m.jenis)) idx.plain = (idx.plain || []).concat(vals);
    else if (m.jenis === 'smalltalk' && m.key) addSmalltalk(idx, m.key, teksList, m.variantsFormal || null);
    else if (JENIS_TO_KEY[m.jenis]) addSmalltalk(idx, m.key || JENIS_TO_KEY[m.jenis], teksList, m.variantsFormal || null);
    else if (m.jenis === 'followup') {
      idx.followup.greeting = (idx.followup.greeting || []).concat(m.greeting || []);
      idx.followup.smalltalk = (idx.followup.smalltalk || []).concat(m.smalltalk || []);
    }
  }
  return idx;
}

function ensureSapaan() {
  if (!sapaanCache) sapaanCache = indexSapaan([]);
  return sapaanCache;
}

// Paths are relative to raget-data/json/sapaan/, one entry per file living in
// the thematic subfolders (sapaan.json itself stays at the top level and is
// fetched directly in loadSapaan). Every file here MUST actually classify
// into a real SMALLTALK_TRIGGERS bucket via JENIS_TO_KEY/JENIS_TO_PLAIN --
// verify live after touching this list, do not just drop a filename in.
const SAPAAN_EXTRA_FILES = [
  // waktu
  'waktu/sapaan-waktu.json',
  'waktu/greetings.json',
  // kerja & layanan
  'kerja-layanan/sapaan-sekolah.json',
  'kerja-layanan/sapaan-layanan.json',
  'kerja-layanan/sapaan-kerja.json',
  'kerja-layanan/sapaan-produksi-ready.json',
  'kerja-layanan/sapaan-wawasan-luas.json',
  'kerja-layanan/layanan-antrian-sopan.json',
  'kerja-layanan/layanan-kantor-bank.json',
  'kerja-layanan/layanan-pasar-warung-desa.json',
  'kerja-layanan/layanan-publik.json',
  'kerja-layanan/layanan-sekolah-klinik-toko.json',
  'kerja-layanan/sekolah-harian.json',
  'kerja-layanan/sekolah-izin-sakit.json',
  'kerja-layanan/sekolah-orangtua.json',
  'kerja-layanan/sekolah-pr-ulangan.json',
  'kerja-layanan/kerja-harian.json',
  'kerja-layanan/kerja-kantor-harian.json',
  'kerja-layanan/kerja-wfh-rekan.json',
  // harian & rumah
  'harian-rumah/sapaan-harian-sektor.json',
  'harian-rumah/sapaan-harian-luas.json',
  'harian-rumah/sapaan-keluarga.json',
  'harian-rumah/sapaan-makan.json',
  'harian-rumah/sapaan-kebiasaan.json',
  'harian-rumah/rumah-tangga-harian.json',
  'harian-rumah/rumah-tangga-listrik-air.json',
  'harian-rumah/rumah-tangga-uang-dapur.json',
  'harian-rumah/obrolan-harian-sektor.json',
  'harian-rumah/obrolan-lingkungan-sehari.json',
  // transportasi & perjalanan
  'transportasi-perjalanan/sapaan-perjalanan.json',
  'transportasi-perjalanan/sapaan-transportasi.json',
  'transportasi-perjalanan/transportasi-harian.json',
  'transportasi-perjalanan/transportasi-keluarga.json',
  // kesehatan & cuaca
  'kesehatan-cuaca/sapaan-kesehatan.json',
  'kesehatan-cuaca/sapaan-cuaca.json',
  'kesehatan-cuaca/kesehatan-harian-ringan.json',
  'kesehatan-cuaca/kesehatan-harian.json',
  'kesehatan-cuaca/kesehatan-keluarga.json',
  // sosial
  'sosial/sapaan-digital.json',
  'sosial/sapaan-penutup.json',
  'sosial/sapaan-sopan.json',
  'sosial/sapaan-umum.json',
  'sosial/sapaan-obrolan-lanjut.json',
  'sosial/interaktif.json',
  'sosial/lingkungan-rt.json',
  'sosial/obrolan-ringan-smalltalk.json',
  // obrolan baru (new everyday-conversation content)
  'obrolan-baru/sapaan-obrolan-harian.json',
  'obrolan-baru/sapaan-kerja-tugas-tambahan.json',
  'obrolan-baru/sapaan-rumah-sosial-tambahan.json',
  'obrolan-baru/sapaan-transport-sehat-tambahan.json',
];

async function loadSapaan() {
  if (sapaanCache) return sapaanCache;
  try {
    const base = new URL('../raget-data/json/sapaan/', import.meta.url);
    const mainRes = await fetch(new URL('sapaan.json', base));
    const raw = mainRes.ok ? await mainRes.json() : [];
    const extraLists = await Promise.all(
      SAPAAN_EXTRA_FILES.map(async (name) => {
        try {
          const r = await fetch(new URL(name, base));
          if (!r.ok) return [];
          const data = await r.json();
          return Array.isArray(data) ? data : [];
        } catch (err) {
          return [];
        }
      })
    );
    sapaanCache = indexSapaan(raw.concat(...extraLists));
  } catch (e) {
    sapaanCache = indexSapaan([]);
  }
  return sapaanCache;
}

function useSapaan(raw) {
  sapaanCache = indexSapaan(raw);
  initialized = true;
  return sapaanCache;
}

const EN_PERIOD_MAP = { morning: 'pagi', afternoon: 'siang', evening: 'sore', night: 'malam' };

function remainderAfter(re, text) {
  const m = String(text || '').match(re);
  if (!m) return String(text || '').trim();
  return String(text || '')
    .slice(m[0].length)
    .replace(/^[\s,!.?~\-]+/, '')
    .trim();
}

function isBareGreeting(text, re) {
  const rest = remainderAfter(re, text);
  if (!rest) return true;
  return /^(semua|kawan|teman|bro|sis|gan|kak|min|admin|raget|juga|ya|dong|nih|deh)?[\s!.]*$/i.test(rest);
}

function mirrorTemplates(statedPeriod, devicePeriod) {
  return [
    'Selamat ' + statedPeriod + ' juga! (Di sini masih ' + devicePeriod + ', tapi tetap semangat ya)',
    statedPeriod.charAt(0).toUpperCase() + statedPeriod.slice(1) + ' juga! (Waktu di perangkatku sih masih ' + devicePeriod + ')',
  ];
}

function withName(template, name) {
  return template.split('{name}').join(name || 'Raget');
}

function maybeFollowUp(reply, pool) {
  if (!pool || !pool.length) return reply;
  if (reply.length > 60) return reply;
  const h = hashText(reply);
  if (h % 100 >= 30) return reply;
  return reply + ' ' + pool[h % pool.length];
}

function timeOfDay(date) {
  const h = (date || new Date()).getHours();
  if (h >= 4 && h < 10) return 'pagi';
  if (h >= 10 && h < 15) return 'siang';
  if (h >= 15 && h < 18) return 'sore';
  return 'malam';
}

function isQuestion(text) {
  const t = text.trim().toLowerCase();
  if (t.endsWith('?')) return true;
  return QUESTION_WORDS.some((w) => t.startsWith(w + ' ') || t.includes(' ' + w + ' '));
}

function lastTopic(context) {
  const list = Array.isArray(context) ? context : [];
  const priorUsers = list.filter((m) => m.role === 'user');
  if (priorUsers.length < 2) return null;
  return priorUsers[priorUsers.length - 2].text.slice(0, 60);
}

function replyForSmalltalkKey(key, text, options) {
  const entry = sapaanCache.smalltalk[key];
  const tone = detectTone(text);
  const pool =
    (tone === 'formal' && entry && entry.templatesFormal ? entry.templatesFormal : null) ||
    (entry && entry.templates) ||
    SMALLTALK_FALLBACK[key] ||
    [SAPAAN_FALLBACK_TEXT];
  const picked = pickVariant('small_' + key + '_' + tone, pool, text) || pool[0];
  const reply = withName(picked, options.personaName);
  const follow = sapaanCache.followup ? sapaanCache.followup.smalltalk : [];
  return maybeFollowUp(reply, follow);
}

function matchSmalltalk(text, options) {
  ensureSapaan();
  const key = Object.keys(SMALLTALK_TRIGGERS).find((k) => SMALLTALK_TRIGGERS[k].test(text));
  if (!key) return null;
  return replyForSmalltalkKey(key, text, options);
}

// FR-1.1-1.3: fuzzy fallback for smalltalk routing - tried ONLY once every exact
// SMALLTALK_TRIGGERS regex (matchSmalltalk above) has already failed on both the raw
// and slang-normalized text. See fuzzy-smalltalk.js for the Jaro-Winkler match +
// curated-phrase-bucket implementation and why the threshold is conservative.
function matchSmalltalkFuzzy(text, options) {
  ensureSapaan();
  const key = fuzzySmalltalk.matchFuzzySmalltalk(text);
  if (!key) return null;
  return replyForSmalltalkKey(key, text, options);
}

function extractStatedPeriod(text) {
  const m = text.match(TIME_GREETING_RE);
  if (!m) return null;
  if (m[2]) return m[2].toLowerCase();
  if (m[3]) return EN_PERIOD_MAP[m[3].toLowerCase()] || null;
  return null;
}

function replyTimeGreeting(now, options, text) {
  ensureSapaan();
  const devicePeriod = timeOfDay(now);
  const statedPeriod = text ? extractStatedPeriod(text) : null;

  if (statedPeriod && statedPeriod !== devicePeriod) {
    const templates = mirrorTemplates(statedPeriod, devicePeriod);
    const reply = withName(
      pickVariant('greet_mirror_' + statedPeriod, templates, statedPeriod + devicePeriod),
      options.personaName
    );
    return maybeFollowUp(reply, sapaanCache.followup.greeting);
  }

  const templates = (sapaanCache.time && sapaanCache.time[devicePeriod]) || [];
  const picked = pickVariant('greet_time_' + devicePeriod, templates, devicePeriod) || SAPAAN_FALLBACK_TEXT;
  const reply = withName(picked, options.personaName);
  return maybeFollowUp(reply, sapaanCache.followup.greeting);
}

function replyPlainGreeting(text, options) {
  ensureSapaan();
  const picked = pickVariant('greet_plain', sapaanCache.plain, text) || SAPAAN_FALLBACK_TEXT;
  const reply = withName(picked, options.personaName);
  return maybeFollowUp(reply, sapaanCache.followup.greeting);
}

function replyQuestion(prompt) {
  const echo = prompt.replace(/\?+$/, '').trim();
  const low = echo.toLowerCase();
  if (/\b(pendapat|opini|menurut)\b/.test(low) && !/\b(tentang|soal|mengenai)\b/.test(low)) {
    return pickVariant(
      'q_opini',
      [
        'Aku bisa bantu menimbang sudut pandang, tapi butuh topiknya dulu. Mau bahas apa — kerja, produk, keputusan, atau yang lain?',
        'Pendapat yang pas biasanya tergantung konteks. Ceritakan situasinya sebentar, nanti aku bantu uraikan opsi dan pertimbangannya.',
      ],
      prompt
    );
  }
  if (/\b(bagaimana|gimana)\b/.test(low) && low.split(/\s+/).length <= 5) {
    return pickVariant(
      'q_singkat',
      [
        'Bisa diperjelas sedikit? Misalnya situasi, tujuan, atau pilihan yang lagi kamu hadapi.',
        'Aku siap bantu. Tambahkan konteks singkat biar jawabannya tidak mengambang.',
      ],
      prompt
    );
  }
  const templates = ['Belum punya jawaban untuk "' + echo + '".'];
  return pickVariant('question', templates, prompt);
}

function replySummarize(prompt) {
  const src = prompt.replace(/^ringkas(kan)?\s*:?\s*/i, '').trim() || prompt;
  const sentences = src.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) return 'Ringkasan: ' + src;
  const head = sentences[0];
  const tail = sentences[sentences.length - 1];
  return 'Ringkasan: ' + head + (tail !== head ? ' ... ' + tail : '');
}

function replyContentIdeas(prompt) {
  const topic =
    prompt
      .replace(/^(kasih|beri|berikan)\s+/i, '')
      .replace(/ide\s+konten\s*(tentang|soal|untuk)?\s*/i, '')
      .trim() || 'topik ini';
  return [
    '1. Bagikan tips praktis seputar ' + topic + ' dalam format singkat.',
    '2. Buat cerita atau pengalaman pribadi yang berhubungan dengan ' + topic + '.',
    '3. Rangkum kesalahan umum seputar ' + topic + ' beserta solusinya.',
  ].join('\n');
}

function replyExplain(prompt) {
  const topic =
    prompt
      .replace(/^jelaskan\s*/i, '')
      .replace(/^apa\s+itu\s*/i, '')
      .replace(/^tentang\s*/i, '')
      .trim() || 'hal ini';
  const label = topic.charAt(0).toUpperCase() + topic.slice(1);
  return (
    label +
    ' secara sederhana adalah konsep yang berkaitan dengan "' +
    topic +
    '". Contohnya, dalam percakapan sehari-hari, "' +
    topic +
    '" biasanya muncul saat membahas topik yang relevan dengannya.'
  );
}

function replyGeneric(prompt, context) {
  const topic = lastTopic(context);
  const templates =
    topic && topic !== prompt
      ? [
          'Masih nyambung dengan "' +
            topic +
            '" ya. Kalau "' +
            prompt +
            '" itu kelanjutan, kasih satu detail supaya saya bisa jawab lebih pas.',
          'Oke, "' + prompt + '". Ini lanjut dari topik sebelumnya atau topik baru?',
        ]
      : ['Belum punya jawaban untuk itu.'];
  return pickVariant('generic', templates, prompt);
}

function craft(prompt, context, options) {
  const text = String(prompt || '').trim();
  if (!text) return FALLBACK_TEXT;
  const opts = options || {};
  ensureSapaan();

  if (/^ringkas(kan)?\b/i.test(text) && !/percakapan|chat\b/i.test(text)) return replySummarize(text);
  if (/ide konten/i.test(text)) return replyContentIdeas(text);
  if (/^jelaskan\b/i.test(text)) return replyExplain(text);

  const smalltalkEarly = matchSmalltalk(text, opts) || matchSmalltalk(normalizeSlang(text), opts);
  if (smalltalkEarly && !isBareGreeting(text, PLAIN_GREETING_RE) && !isBareGreeting(text, TIME_GREETING_RE)) {
    return smalltalkEarly;
  }

  if (TIME_GREETING_RE.test(text) && isBareGreeting(text, TIME_GREETING_RE)) {
    return replyTimeGreeting(opts.now, opts, text);
  }
  if (PLAIN_GREETING_RE.test(text) && isBareGreeting(text, PLAIN_GREETING_RE)) {
    return replyPlainGreeting(text, opts);
  }

  const smalltalk = matchSmalltalk(text, opts) || matchSmalltalk(normalizeSlang(text), opts);
  if (smalltalk) return smalltalk;

  // FR-1.1-1.3: exact rule match (above) found nothing - try a conservative fuzzy
  // match against curated smalltalk example phrases before giving up to the generic
  // continuation/clarification prompt below. Kept strictly after the exact-match
  // attempts and before replyQuestion/replyGeneric so a real factual question (which
  // reaches this point only if every earlier engine in agent.js#respondCore already
  // failed on it) is never hijacked by a coincidental smalltalk-phrase similarity.
  const smalltalkFuzzy = matchSmalltalkFuzzy(text, opts) || matchSmalltalkFuzzy(normalizeSlang(text), opts);
  if (smalltalkFuzzy) return smalltalkFuzzy;

  if (isQuestion(text)) return replyQuestion(text);
  return replyGeneric(text, context);
}

let initialized = false;

async function init() {
  await loadSapaan();
  initialized = true;
  return true;
}

async function generate(context, prompt, options) {
  try {
    if (!initialized) await init();
    const history = Array.isArray(context) ? context.slice(-10) : [];
    return craft(prompt, history, options);
  } catch (e) {
    return FALLBACK_TEXT;
  }
}

function isFallback(text) {
  return text === FALLBACK_TEXT;
}

function isWeak(text) {
  return text === FALLBACK_TEXT || String(text || '').startsWith(GENERIC_PREFIX);
}

// FR-5.1: mirrors craft()'s early branches that produce real content (ringkas/ide
// konten/jelaskan/smalltalk exact+fuzzy/bare greeting). If none of those match, craft()
// necessarily falls through to replyQuestion()/replyGeneric() - a clarification
// prompt, not a real answer - which is exactly the "truly nothing matched" signal
// agent.js needs to decide whether to log the query as unmatched.
function isRealAnswer(text) {
  const t = String(text || '').trim();
  if (!t) return false;
  if (/^ringkas(kan)?\b/i.test(t) && !/percakapan|chat\b/i.test(t)) return true;
  if (/ide konten/i.test(t)) return true;
  if (/^jelaskan\b/i.test(t)) return true;
  if (isSmalltalkText(t)) return true;
  if (TIME_GREETING_RE.test(t) && isBareGreeting(t, TIME_GREETING_RE)) return true;
  if (PLAIN_GREETING_RE.test(t) && isBareGreeting(t, PLAIN_GREETING_RE)) return true;
  return false;
}

function isSmalltalkText(text) {
  const t = String(text || '');
  if (!t.trim()) return false;
  const slang = normalizeSlang(t);
  if (Object.keys(SMALLTALK_TRIGGERS).some((k) => SMALLTALK_TRIGGERS[k].test(t) || SMALLTALK_TRIGGERS[k].test(slang))) {
    return true;
  }
  // Also count a fuzzy-matched smalltalk phrase (FR-1.1-1.3) as smalltalk, so
  // agent.js's post-processing (the "(Catatan terkait: ...)" note, unmatched-query
  // logging) treats it the same as an exact trigger match, not as unanswered.
  return !!(fuzzySmalltalk.matchFuzzySmalltalk(t) || fuzzySmalltalk.matchFuzzySmalltalk(slang));
}


const DAILY_TALK_KEYS = {
  izin: true,
  tugas: true,
  layanan: true,
  rumah: true,
  sekolah: true,
  transport: true,
  sehat: true,
  kerja: true,
};

const FACTISH_DAILY_SKIP_RE = /\b(ibu\s*kota|ibukota|fotosintesis|einstein)\b/i;

function tryDailyTalk(text, options) {
  const raw = String(text || '').trim();
  if (!raw || FACTISH_DAILY_SKIP_RE.test(raw)) return null;
  const slang = normalizeSlang(raw);
  const key = Object.keys(SMALLTALK_TRIGGERS).find(
    (k) => DAILY_TALK_KEYS[k] && (SMALLTALK_TRIGGERS[k].test(raw) || SMALLTALK_TRIGGERS[k].test(slang))
  );
  if (!key) return null;
  ensureSapaan();
  return replyForSmalltalkKey(key, raw, options || {});
}


function tryGreeting(text, options) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const opts = options || {};
  if (TIME_GREETING_RE.test(raw) && isBareGreeting(raw, TIME_GREETING_RE)) {
    ensureSapaan();
    return replyTimeGreeting(opts.now, opts, raw);
  }
  if (PLAIN_GREETING_RE.test(raw) && isBareGreeting(raw, PLAIN_GREETING_RE)) {
    ensureSapaan();
    return replyPlainGreeting(raw, opts);
  }
  return null;
}


const INTERJECTION_RE = /^(woy+|wei+|we+h+|heh+|huh+|oke+|ok\b|okay|iya+|yup+|yoi+|sip+|siap)[\s!.]*$/i;

function tryInterjection(text) {
  const raw = String(text || '').trim();
  if (!raw || !INTERJECTION_RE.test(raw)) return null;
  if (/^(woy+|wei+|we+h+|heh+|huh+)/i.test(raw)) return 'Ya, saya dengar.';
  return 'Oke.';
}

export const llmEngine = Object.freeze({
  init,
  generate,
  craft,
  tryGreeting,
  tryInterjection,
  tryDailyTalk,
  useSapaan,
  isFallback,
  isWeak,
  isSmalltalkText,
  isRealAnswer,
  // Diekspor supaya raget-tools/validate-entry.mjs (PRD-RAGET-TEMPLATE.md
  // Fase 2.3) bisa memakai tabel klasifikasi sapaan YANG SAMA PERSIS dengan
  // runtime, bukan duplikat regex yang bisa melenceng dari aslinya.
  SMALLTALK_TRIGGERS,
  JENIS_TO_KEY,
  get ready() {
    return initialized;
  },
});

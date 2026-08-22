import { pituturState } from '../core/pitutur-state.js';
import { pituturSumber } from '../sumber/pitutur-dataries.js';
import { terjemahkan, LOCALE } from '../pitutur-i18n.js';
import { kanalAsync } from '../sumber/pitutur-channels.js';
import { pituturDokumen } from '../sumber/pitutur-dokumen.js';
import { batchChunk, progresChunk } from './pitutur-chunk.js';
import { retrieve, ringkasChunks, buatFaq } from './pitutur-retrieve.js';

function nowSalam() {
  const h = new Date().getHours();
  if (h >= 4 && h < 10) return 'Selamat pagi';
  if (h >= 10 && h < 15) return 'Selamat siang';
  if (h >= 15 && h < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function formatTanggal(lang) {
  const locale = (LOCALE && LOCALE[lang]) || 'id-ID';
  return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const TITIK = String.fromCharCode(1);

function pecah(t) {
  const aman = String(t || '').replace(/([0-9])[.]([0-9][0-9][0-9])/g, '$1' + TITIK + '$2');
  return (aman.match(/[^.!?]+[.!?]*/g) || [aman]).map(function (s) {
    return s.split(TITIK).join('.').trim();
  }).filter(Boolean);
}

function naturalisasiLisan(teks) {
  let s = String(teks || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  s = s.replace(/^([^\-–—]{2,48})\s*[-–—]\s+/, function (_, nama) { return 'Tentang ' + nama.trim() + '. '; });
  const peta = [
    [/\bIbu kota\s*:\s*/gi, 'Ibu kotanya '],
    [/\bPusat pemerintahan\s*:\s*/gi, 'Pusat pemerintahannya di '],
    [/\bPopulasi\s*:\s*/gi, 'Populasinya sekitar '],
    [/\bMata uang\s*:\s*/gi, 'Mata uangnya '],
    [/\bBahasa\s*:\s*/gi, 'Bahasanya '],
    [/\bSistem pemerintahan\s*:\s*/gi, 'Sistem pemerintahannya '],
    [/\bAnggota\s*:\s*/gi, 'Negara ini anggota '],
    [/\bIbu Kota\s*:\s*/gi, 'Ibu kotanya '],
    [/\bCapital\s*:\s*/gi, 'Ibu kotanya '],
    [/\bPopulation\s*:\s*/gi, 'Populasinya sekitar '],
    [/\bCurrency\s*:\s*/gi, 'Mata uangnya '],
    [/\bLanguage\s*:\s*/gi, 'Bahasanya '],
    [/\bGovernment\s*:\s*/gi, 'Pemerintahannya ']
  ];
  peta.forEach(function (pair) {
    s = s.replace(pair[0], pair[1]);
  });
  s = s.replace(/\s+:\s*/g, ' ');
  s = s.replace(/\bBahasanya Bahasa\b/gi, 'Bahasanya');
  s = s.replace(/\bPopulasinya sekitar\s+(\d{1,2})(?!\d)(?!\s*(juta|ribu|miliar|%))/gi, 'Populasinya tercatat sekitar $1 juta');
  s = s.replace(/\s{2,}/g, ' ').trim();
  if (s && !/[.!?]$/.test(s)) s += '.';
  return s;
}

function pecahUntukSiaran(teks) {
  const natural = naturalisasiLisan(teks);
  const mentah = pecah(natural).map(function (s) {
    return s.replace(/^[,;:\s]+/, '').trim();
  }).filter(function (s) {
    return s.length > 12;
  });
  if (!mentah.length) return natural ? [natural] : [];

  const out = [];
  let buf = '';
  const target = 160;
  const max = 240;
  mentah.forEach(function (s) {
    if (!buf) {
      buf = s;
      return;
    }
    if ((buf + ' ' + s).length <= target || buf.length < 50) {
      buf = buf + ' ' + s;
      return;
    }
    if ((buf + ' ' + s).length <= max && s.length < 40) {
      buf = buf + ' ' + s;
      return;
    }
    out.push(buf);
    buf = s;
  });
  if (buf) {
    if (buf.length < 40 && out.length) {
      out[out.length - 1] = out[out.length - 1] + ' ' + buf;
    } else {
      out.push(buf);
    }
  }
  return out;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pilih(arr, topik, channel, urutan) {
  const state = pituturState.state;
  const seed = (state.episode + hashStr((topik || '') + '|' + (channel || '') + '|' + arr.length + '|' + (urutan || 0))) >>> 0;
  const rand = mulberry32(seed);
  return arr[Math.floor(rand() * arr.length)];
}

function buatPemilih(arr) {
  const sisa = arr.slice();
  let putaran = 0;
  return function (topik, channel) {
    if (!sisa.length) {
      arr.forEach(function (x) { sisa.push(x); });
      putaran += 1;
    }
    const state = pituturState.state;
    const seed = (state.episode + putaran + hashStr((topik || '') + '|' + (channel || '') + '|' + sisa.length)) >>> 0;
    const rand = mulberry32(seed);
    const idx = Math.floor(rand() * sisa.length);
    return sisa.splice(idx, 1)[0];
  };
}

const PEMBUKA_KANAL = {
  pagi: [
    'Mari kita mulai dengan satu fakta yang layak diingat hari ini.',
    'Satu materi singkat sebelum hari berjalan lebih jauh.',
    'Kita buka siaran dengan hal yang sederhana, tapi tajam.'
  ],
  tokoh: [
    'Hari ini ada nama yang layak kita dengarkan ulang.',
    'Sebuah kisah tokoh — bukan untuk dikagumi saja, tapi dipetik.',
    'Kita singgah sebentar pada seseorang yang meninggalkan jejak.'
  ],
  koleksi: [
    'Saatnya meninjau ulang yang sudah kamu simpan.',
    'Koleksi bukan arsip mati — mari hidupkan lagi.'
  ],
  default: [
    'Mari kita bahas satu materi singkat.',
    'Satu topik, cukup dalam untuk menempel.',
    'Kita fokus pada satu hal, bukan semuanya.'
  ]
};

const TUTUP_KANAL = {
  pagi: [
    'Bawa satu fakta itu ke langkah berikutnya.',
    'Cukup satu yang menempel. Sisanya bisa nanti.',
    'Siaran selesai. Yang penting ikut dalam keputusan hari ini.'
  ],
  tokoh: [
    'Jangan hanya ingat namanya. Ingat pilihannya.',
    'Tokoh itu cermin. Ambil satu sikap, bukan seluruh biografi.',
    'Tutup di sini. Satu pelajaran cukup untuk dilatih.'
  ],
  wisata: [
    'Kalau suatu hari sampai ke sana, kamu sudah punya peta kecil di kepala.',
    'Tempat itu menunggu. Untuk sekarang, simpan satu gambarnya.',
    'Cukup bayangkan dulu. Nanti kakimu yang menyusul.'
  ],
  default: [
    'Ambil satu poin. Coba hari ini, jangan besok.',
    'Tidak perlu hafal semua. Pilih satu, kerjakan sampai terasa.',
    'Siaran ini cukup jika satu ide ikut pulang bersamamu.',
    'Tutup dengan tindakan kecil. Itu yang membuat materi hidup.'
  ]
};

function pembukaKanal(channel, lang) {
  const salam = nowSalam() + '.';
  const key = channel && PEMBUKA_KANAL[channel] ? channel : 'default';
  const bank = PEMBUKA_KANAL[key] || PEMBUKA_KANAL.default;
  return salam + ' ' + pilih(bank, 'buka', channel);
}

function tutupKanal(channel, topik) {
  const key = channel && TUTUP_KANAL[channel] ? channel : 'default';
  const bank = TUTUP_KANAL[key] || TUTUP_KANAL.default;
  return pilih(bank, topik, channel);
}


const ANGGUK = [
  'Hmm, bagian ini layak dicatat.',
  'Oke, aku ikut alurnya dulu.',
  'Ini baru. Tunggu, aku cerna sebentar.',
  'Masuk akal, tapi aku ingin dengar lanjutannya.',
  'Baik, satu poin lagi dari kamu.',
  'Pelan-pelan. Aku catat yang penting saja.',
  'Oh, begitu. Lanjut, Warta.'
];

const JEMBATAN_WARTA = [
  'Satu hal lagi yang sering terlewat.',
  'Kalau kita geser sedikit ke sisi lain,',
  'Masih ada potongan yang menentukan.',
  'Sekarang yang biasanya orang lewatkan:',
  'Tambahan singkat, tapi penting:',
  'Dan ini yang membuatnya beda:'
];

const TANYA_DALAM = [
  'Kalau ini dipraktikkan hari ini, langkah pertamanya apa?',
  'Bagian mana yang paling sering dilupakan orang?',
  'Apakah ini masih relevan di situasi kita sekarang?',
  'Ada risiko nyata kalau poin ini diabaikan?',
  'Bisa kamu sederhanakan dalam satu kalimat?',
  'Siapa yang paling butuh mendengar ini duluan?'
];

const TANYA_RINGKAS = [
  'Intinya apa, Warta?',
  'Satu hal yang wajib dibawa pulang?',
  'Kenapa ini penting buat pendengar?',
  'Contoh sederhananya seperti apa?'
];

const JAWAB_WARTA = [
  'Ambil satu fakta yang baru saja disebut. Itu cukup untuk sesi ini.',
  'Yang menempel biasanya yang diulang dengan sadar, bukan yang paling panjang.',
  'Simpan dulu intinya. Detail bisa dibuka di siaran berikutnya.',
  'Satu ide cukup. Kerjakan sampai terasa.'
];

const KISAH_MAKNA = [
  'Bayangkan menanam. Hasilnya tidak datang sehari, tapi jejaknya pasti kelihatan.',
  'Banyak orang sudah tahu, tapi jarang mengulang. Padahal mengulang itu jembatannya.',
  'Ceritanya sederhana: sedikit demi sedikit, lama-lama jadi biasa.',
  'Didengar sekali, mudah hilang. Dipraktikkan, jadi milikmu sendiri.',
  'Seperti belajar jalur pulang: yang sering dilalui, tidak perlu peta lagi.'
];

const TUTUP_DIALOG = [
  'Ambil satu poin. Coba hari ini, jangan besok.',
  'Tidak perlu hafal semua. Pilih satu, kerjakan sampai terasa.',
  'Siaran ini cukup jika satu ide ikut pulang bersamamu.',
  'Tutup dengan tindakan kecil. Itu yang membuat materi hidup.'
];

const STOP_KATA = {
  yang:1, dan:1, atau:1, dengan:1, dari:1, untuk:1, pada:1, ini:1, itu:1, ada:1,
  adalah:1, akan:1, sudah:1, tidak:1, juga:1, sebagai:1, kepada:1, oleh:1, di:1,
  ke:1, dalam:1, karena:1, jika:1, saat:1, para:1, lebih:1, sangat:1, mereka:1,
  kita:1, kamu:1, saya:1, anda:1, dia:1, bisa:1, dapat:1, harus:1, tentang:1,
  berikut:1, yaitu:1, serta:1, masih:1, hanya:1, telah:1, bagi:1, atas:1,
  sekitar:1, memakai:1, digunakan:1, terdiri:1, menjadi:1, memiliki:1,
  negara:1, bagian:1, wilayah:1, sistem:1, rumah:1, anggota:1, destinasi:1,
  terbesar:1, terkecil:1, banyak:1, seluruh:1, berbagai:1, sendiri:1, segera:1,
  pindah:1, dunia:1, utama:1, resmi:1, federal:1, lanjut:1, berikutnya:1,
  sumber:1, daya:1, alam:1, kaya:1,
  tenggara:1, selatan:1, utara:1, timur:1, barat:1, asia:1, eropa:1, afrika:1,
  inggris:1, mandarin:1, melayu:1, tamil:1, bahasa:1, bahasanya:1,
  pemerintahan:1, parlementer:1, presidensial:1, republik:1, federasi:1,
  kota:1, global:1, terkenal:1, pusat:1, paling:1, kompetitif:1,
  the:1, and:1, for:1, with:1, from:1, that:1, this:1, are:1, was:1, of:1
};

function kataKunci(teks, n) {
  let s = String(teks || '').toLowerCase();
  s = s.replace(/^tentang\s+[^.]+\./i, ' ');
  s = s.replace(/\b(ibu kotanya|populasinya|mata uangnya|bahasanya|sistem pemerintahannya|pusat pemerintahannya)\b/gi, ' ');
  const raw = s.replace(/[^a-zA-Z\u00C0-\u024f0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const skor = {};
  raw.forEach(function (w) {
    if (w.length < 5) return;
    if (STOP_KATA[w]) return;
    if (/^[0-9]+$/.test(w)) return;
    if (/^(ter|se|me|di|ke|ber|pe|per|peng|pen)/.test(w) && w.length < 9) return;
    let sc = w.length;
    if (/(keuangan|perdagangan|teknologi|inovasi|pariwisata|ekonomi|kepulauan|pelabuhan|industri)/.test(w)) sc += 8;
    if (w.length >= 8) sc += 3;
    skor[w] = (skor[w] || 0) + sc;
  });
  return Object.keys(skor).sort(function (a, b) {
    return skor[b] - skor[a];
  }).slice(0, n || 2);
}

const BANK_TANYA = [
  'Kalau pendengar hanya ingat satu hal dari bagian ini, sebaiknya apa?',
  'Apa yang membuat poin ini beda dari yang biasa didengar?',
  'Fakta mana yang paling mengejutkan di bagian ini?',
  'Kalau dipotong jadi satu kalimat, intinya apa?',
  'Ada yang kurang lengkap dari penjelasan tadi?',
  'Kenapa ini penting buat pendengar hari ini?',
  'Mana yang lebih menempel: angkanya atau ceritanya?',
  'Intinya apa, Warta?',
  'Satu hal yang wajib dibawa pulang?',
  'Contoh sederhananya seperti apa?'
];

function tanyaDariTeks(teks, topik, channel, urutan) {
  return pilih(BANK_TANYA, topik, channel, urutan || 0);
}

function buatPenanya() {
  const dipakai = {};
  return function (teks, topik, channel) {
    let tanya = '';
    for (let n = 0; n < 8; n++) {
      tanya = tanyaDariTeks(teks, topik, channel, n);
      if (!dipakai[tanya]) break;
    }
    dipakai[tanya] = 1;
    return tanya;
  };
}

function reaksiSetelahFakta(teks, topik, channel) {
  return pilih([
    'Oke, aku ikut alurnya.',
    'Hmm, poin ini layak dicatat.',
    'Baik. Lanjut, jangan loncat dulu.',
    'Menarik. Aku simpan dulu.',
    'Pelan-pelan. Satu ide dulu.'
  ], topik, channel);
}

function ringkasFakta(teks) {
  let s = String(teks || '').replace(/\s+/g, ' ').trim();
  s = s.replace(/^tentang\s+[^.]+\.\s*/i, '');
  s = s.replace(/^(yang berikutnya[^:]*:|poin berikutnya:|tambahan singkat[^:]*:|dan ini yang membuatnya beda:|kalau kita geser[^,]+,|masih ada potongan yang menentukan\.)\s*/i, '');
  const DOT = String.fromCharCode(1);
  const aman = s
    .replace(/([0-9])\.([0-9])/g, '$1' + DOT + '$2');
  const m = aman.match(/[^.!?]+[.!?]?/);
  let r = (m ? m[0] : aman).split(DOT).join('.').trim();
  if (r.length > 160) {
    const potong = r.slice(0, 160);
    const sp = potong.lastIndexOf(' ');
    r = (sp > 90 ? potong.slice(0, sp) : potong).trim();
    if (!/[.!?]$/.test(r)) r += '.';
  }
  if (r && !/[.!?]$/.test(r)) r += '.';
  return r;
}

function klausaUtama(teks) {
  let s = ringkasFakta(teks);
  if (!s) return '';
  const potong = s.split(/,|;| — | – /);
  if (potong.length > 1) {
    const kandidat = potong.map(function (p) { return p.trim(); }).filter(function (p) {
      return p.length >= 24 && p.length <= 110;
    });
    if (kandidat.length) s = kandidat[0] + (/\.$/.test(kandidat[0]) ? '' : '.');
  }
  return s;
}

function jawabDariTeks(teks, topik, channel, urutan) {
  const fakta = klausaUtama(teks);
  const opsi = [];
  if (fakta && fakta.length > 18) {
    opsi.push('Yang menonjol: ' + fakta);
    opsi.push('Pegangan singkatnya: ' + fakta);
    opsi.push('Intinya: ' + fakta);
    opsi.push('Simpan ini: ' + fakta);
  }
  if (!opsi.length) {
    return pilih(JAWAB_WARTA, topik, channel, urutan);
  }
  return pilih(opsi, topik, channel, urutan);
}

function sambungJembatan(jemb, kalimat) {
  const j = String(jemb || '').trim();
  let k = String(kalimat || '').trim();
  if (!j) return k;
  if (!k) return j;
  if (/[,:]$/.test(j)) {
    k = k.charAt(0).toLowerCase() + k.slice(1);
    return j + ' ' + k;
  }
  if (!/[.!?]$/.test(j)) {
    return j + '. ' + k;
  }
  return j + ' ' + k;
}

function buatPenjawab() {
  const dipakai = {};
  return function (teks, topik, channel) {
    let jawaban = '';
    for (let n = 0; n < 6; n++) {
      jawaban = jawabDariTeks(teks, topik, channel, n);
      if (!dipakai[jawaban]) break;
    }
    dipakai[jawaban] = 1;
    return jawaban;
  };
}

function kisahDariTeks(teks, topik, channel) {
  const keys = kataKunci(teks, 1);
  if (keys[0]) {
    return pilih([
      'Kalau ' + keys[0] + ' dijadikan titik berangkat, cerita tempat ini lebih mudah nempel.',
      'Bayangkan menjelaskan ' + keys[0] + ' ke teman dalam satu kalimat. Itu latihan terbaik.',
      'Orang jarang lupa tempat yang punya ciri khas. ' + keys[0] + ' bisa jadi ciri itu.'
    ], topik, channel);
  }
  return pilih(KISAH_MAKNA, topik, channel);
}

function modeAktif(state) {
  return state.mode === 'solo' ? 'monolog' : (state.mode || 'monolog');
}

function buatRujukan(entry) {
  if (!entry) return null;
  const m = entry.metadata || {};
  return {
    grup: entry._grup || '',
    nama: m.name || entry.title || '',
    kategori: m.category || ''
  };
}

function kunciKoleksi(item) {
  if (item.id) return String(item.id);
  return 'k' + hashStr(String(item.title || item.text || '').slice(0, 80));
}

function judulBersih(nama) {
  return String(nama || 'dokumen').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}

function buildKoleksi(push, state, mode, lines) {
  if (!state.sources.koleksi) {
    push('Warta', 'Sumber Koleksi dimatikan. Nyalakan kembali untuk review audio simpananmu.', 'inform');
    return;
  }
  let items = [];
  try { items = JSON.parse(localStorage.getItem('raget_koleksi_items') || '[]'); } catch (e) { items = []; }
  if (!items.length) {
    push('Warta', 'Koleksimu masih kosong. Simpan jawaban penting di Rategoan, lalu kembali ke sini.', 'inform');
    push('Warta', 'Pitutur akan membacakan ulang simpananmu sebagai review audio.', 'inform');
    return;
  }
  const now = Date.now();
  const sorted = items.slice().sort(function (a, b) {
    const ka = kunciKoleksi(a);
    const kb = kunciKoleksi(b);
    const sa = state.koleksiLast[ka] === undefined ? Infinity : now - state.koleksiLast[ka];
    const sb = state.koleksiLast[kb] === undefined ? Infinity : now - state.koleksiLast[kb];
    return sb - sa;
  });
  const item = sorted[0];
  const kunci = kunciKoleksi(item);
  lines._koleksiKunci = kunci;
  const teks = item.text || item.title || 'Simpanan tanpa teks';
  const inti = 'Intinya: ' + (item.title || teks).slice(0, 120);

  push('Warta', nowSalam() + '. Saatnya review koleksi.', 'inform');
  if (mode === 'monolog') {
    push('Warta', teks, 'inform');
    push('Warta', inti, 'tegas');
    push('Warta', pilih(TUTUP_DIALOG, 'koleksi', 'koleksi'), 'inform');
    return;
  }
  push('Warta', 'Dengarkan baik-baik simpanan ini.', 'inform');
  push('Warta', teks, 'inform');
  push('Tanya', pilih(ANGGUK, 'koleksi', 'koleksi'), 'backchannel');
  push('Tanya', 'Coba jawab dalam hati. Apa intinya?', 'tanya');
  push('Warta', inti, 'tegas');
  if (mode === 'diskusi') {
    push('Kisah', pilih(KISAH_MAKNA, 'koleksi', 'koleksi'), 'kisah');
  }
  push('Tanya', pilih(TANYA_RINGKAS, 'koleksi', 'koleksi'), 'tanya');
  push('Warta', pilih(JAWAB_WARTA, 'koleksi', 'koleksi'), 'tegas');
}

async function buildDokumen(push, state, mode, docId, lines) {
  const doc = await pituturDokumen.ambil(docId);
  if (!doc) {
    push('Warta', 'Dokumen ini sudah tidak tersedia, mungkin sudah dihapus.', 'inform');
    return;
  }
  const chunks = await pituturDokumen.ambilChunks(docId);
  if (!chunks.length) {
    push('Warta', 'Dokumen "' + doc.name + '" tidak memiliki teks yang bisa dibacakan.', 'inform');
    return;
  }

  const judul = judulBersih(doc.name);
  const docMode = state.docMode || 'baca';
  const topic = (typeof state._topicHint === 'string' ? state._topicHint : '').trim();

  if (docMode === 'ringkas') {
    const fokus = topic ? retrieve(chunks, topic, 10) : chunks.slice(0, 10);
    const kalimat = ringkasChunks(fokus, mode === 'monolog' ? 8 : 6);
    push('Warta', nowSalam() + '. Ini audio overview singkat dari materi ' + judul + '.', 'inform');
    if (topic) {
      push('Warta', 'Fokus topik: ' + topic + '.', 'inform');
    }
    if (mode !== 'monolog') {
      push('Tanya', 'Siap. Buang yang ramai, sisakan yang menempel.', 'tanya');
    }
    kalimat.forEach(function (s, i) {
      push('Warta', s, 'inform');
      if (mode === 'dialog' && i < kalimat.length - 1 && i % 2 === 1) {
        push('Tanya', pilih(ANGGUK, judul, 'dokumen'), 'backchannel');
      }
      if (mode === 'diskusi' && i > 0 && i % 2 === 0) {
        push('Kisah', pilih(KISAH_MAKNA, judul, 'dokumen'), 'kisah');
      }
    });
    push('Warta', tutupKanal('default', judul), 'tegas');
    if (mode !== 'monolog') {
      push('Tanya', 'Mau baca penuh, atau cukup ringkasan ini?', 'tanya');
    }
    return;
  }

  if (docMode === 'faq') {
    const fokus = topic ? retrieve(chunks, topic, 12) : chunks.slice(0, 12);
    const faqs = buatFaq(fokus, 3);
    push('Warta', nowSalam() + '. Kita uji pemahaman dari materi ' + judul + '.', 'inform');
    if (mode !== 'monolog') {
      push('Tanya', 'Aku yang menguji. Warta menjawab hanya dari materi ini.', 'tanya');
    }
    faqs.forEach(function (item, i) {
      if (mode === 'monolog') {
        push('Warta', 'Pertanyaan ' + (i + 1) + '. ' + item.q, 'tanya');
        push('Warta', item.a, 'inform');
      } else {
        push('Tanya', item.q, 'tanya');
        push('Warta', item.a, 'inform');
        if (mode === 'diskusi' && i === 1) {
          push('Kisah', pilih(KISAH_MAKNA, judul, 'dokumen'), 'kisah');
        }
      }
    });
    push('Warta', tutupKanal('default', judul), 'tegas');
    return;
  }

  const batch = mode === 'monolog' ? 5 : (mode === 'dialog' ? 4 : 3);
  let potong;
  let pos = (state.docPos && state.docPos[docId]) || 0;
  let posBaru;
  let progres;
  let sisa;
  let selesai;

  if (topic) {
    potong = retrieve(chunks, topic, batch);
    posBaru = pos;
    progres = progresChunk(pos, chunks.length);
    sisa = Math.max(0, chunks.length - pos);
    selesai = false;
    push('Warta', nowSalam() + '. Materi ' + judul + ' — fokus topik "' + topic + '".', 'inform');
    push('Warta', 'Mengambil ' + potong.length + ' bagian paling relevan.', 'inform');
  } else {
    if (pos >= chunks.length) pos = 0;
    potong = batchChunk(chunks, pos, batch);
    posBaru = (pos + potong.length) % chunks.length;
    progres = progresChunk(pos, chunks.length);
    sisa = chunks.length - pos - potong.length;
    selesai = posBaru === 0 || potong.length >= chunks.length;
    push('Warta', nowSalam() + '. Kita membuka materi ' + judul + '.', 'inform');
    if (pos > 0) {
      push('Warta', 'Bagian ' + (pos + 1) + ' dari ' + chunks.length + ' · progres ' + progres + ' persen. Sisa ' + Math.max(0, sisa) + ' bagian.', 'inform');
    } else {
      push('Warta', 'Total ' + chunks.length + ' bagian · ' + doc.words + ' kata. Memulai bagian 1.', 'inform');
    }
  }

  const jawabDoc = buatPenjawab();

  if (mode !== 'monolog') {
    push('Tanya', 'Siap. Tolong yang penting saja, Warta.', 'tanya');
  }

  potong.forEach(function (ch, i) {
    const isiLisan = naturalisasiLisan(ch.text);
    if (i > 0 && i % 3 === 0) {
      push('Warta', sambungJembatan(pilih(JEMBATAN_WARTA, judul, 'dokumen', i), isiLisan), 'inform');
    } else {
      push('Warta', isiLisan, 'inform');
    }
    if (mode === 'dialog' && i < potong.length - 1) {
      if (i === 0) {
        push('Tanya', reaksiSetelahFakta(ch.text, judul, 'dokumen'), 'backchannel');
      } else if (i === 1) {
        push('Tanya', tanyaDariTeks(ch.text, judul, 'dokumen'), 'tanya');
        push('Warta', jawabDoc(ch.text, judul, 'dokumen'), 'tegas');
      } else {
        push('Tanya', reaksiSetelahFakta(ch.text, judul, 'dokumen'), 'backchannel');
      }
    }
    if (mode === 'diskusi' && i < potong.length - 1) {
      if (i === 0) {
        push('Tanya', tanyaDariTeks(ch.text, judul, 'dokumen'), 'tanya');
        push('Warta', jawabDoc(ch.text, judul, 'dokumen'), 'tegas');
      } else if (i === 1) {
        push('Kisah', kisahDariTeks(ch.text, judul, 'dokumen'), 'kisah');
      } else {
        push('Tanya', reaksiSetelahFakta(ch.text, judul, 'dokumen'), 'backchannel');
      }
    }
  });

  if (topic) {
    push('Warta', 'Itu bagian yang paling dekat dengan topikmu.', 'inform');
    if (mode !== 'monolog') {
      push('Tanya', 'Mau perdalam topik lain, atau lanjut baca berurutan?', 'tanya');
    }
    return;
  }

  if (selesai) {
    push('Warta', 'Materi ' + judul + ' selesai untuk siklus ini.', 'tegas');
    if (mode === 'dialog') {
      push('Tanya', 'Satu hal yang paling menempel buatmu?', 'tanya');
      push('Warta', jawabDoc(potong[potong.length - 1] ? potong[potong.length - 1].text : judul, judul, 'dokumen'), 'tegas');
    } else if (mode === 'diskusi') {
      push('Kisah', pilih(KISAH_MAKNA, judul, 'dokumen'), 'kisah');
      push('Tanya', 'Kita ulang dari awal, atau pindah materi?', 'tanya');
      push('Warta', 'Keduanya boleh. Yang penting satu ide ikut dipraktikkan.', 'tegas');
    } else {
      push('Warta', 'Siaran berikutnya akan mengulang dari awal bila materi ini dipilih lagi.', 'inform');
    }
  } else {
    push('Warta', 'Sampai di sini dulu. Sisa materi siap di siaran berikutnya.', 'inform');
    if (mode !== 'monolog') {
      push('Tanya', 'Istirahat sebentar. Nanti kita lanjut.', 'backchannel');
    }
  }
  lines._dokumenPos = { docId: docId, pos: posBaru };
}

function ambilFrasa(entry) {
  const m = entry.metadata || {};
  const nama = m.name || entry.title || 'Frasa hari ini';
  const bagian = String(entry.text || '').split(' - ');
  const makna = (bagian[1] || bagian[0] || entry.text || '').split(/[.!?]/)[0].trim();
  return { nama: nama, makna: makna };
}

function buildLingo(push, state, mode, topik) {
  push('Warta', 'Kelas frasa singkat.', 'inform');
  return pituturSumber.query(['lingo', 'sapaan'], topik, 1).then(function (hasil) {
    const entry = hasil[0];
    if (!entry) {
      push('Warta', 'Pustaka lingo belum terhubung di halaman ini.', 'inform');
      return;
    }
    const f = ambilFrasa(entry);
    push('Warta', 'Frasa hari ini: ' + f.nama + '.', 'inform', entry);
    push('Warta', 'Artinya: ' + f.makna + '.', 'inform');
    if (mode !== 'monolog') {
      push('Tanya', 'Coba ulangi pelan-pelan.', 'tanya');
    }
    push('Kisah', 'Ulangi: ' + f.nama + '.', 'kisah');
    push('Warta', 'Bagus. Sedikit demi sedikit lama menjadi bukit.', 'tegas');
  });
}

function alurDialogFakta(push, mode, sents, isi, topic, channel) {
  const batas = Math.min(sents.length, mode === 'diskusi' ? 5 : 4);
  const jembatan = buatPemilih(JEMBATAN_WARTA);
  const jawab = buatPenjawab();
  const tanya = buatPenanya();

  push('Warta', sents[0], 'inform', isi);

  if (mode === 'dialog' || mode === 'diskusi') {
    push('Tanya', tanya(sents[0], topic, channel), 'tanya');
    push('Warta', jawab(sents[0], topic, channel), 'tegas');
  }

  for (let i = 1; i < batas; i++) {
    const cur = sents[i];
    const gabung = sambungJembatan(jembatan(topic, channel), cur);
    push('Warta', gabung, 'inform', isi);

    if (mode === 'dialog') {
      if (i === 1) {
        push('Tanya', reaksiSetelahFakta(cur, topic, channel), 'backchannel');
      } else if (i === batas - 1) {
        push('Tanya', tanya(cur, topic, channel), 'tanya');
        push('Warta', jawab(cur, topic, channel), 'tegas');
      }
      continue;
    }

    if (mode === 'diskusi') {
      if (i === 1) {
        push('Kisah', kisahDariTeks(cur, topic, channel), 'kisah');
      } else if (i === 2) {
        push('Tanya', tanya(cur, topic, channel), 'tanya');
        push('Warta', jawab(cur, topic, channel), 'tegas');
      }
      continue;
    }
  }

  if (sents.length > batas) {
    push('Warta', sambungJembatan(jembatan(topic, channel), sents.slice(batas).join(' ')), 'inform', isi);
  }

  if (mode === 'dialog' || mode === 'diskusi') {
    const inti = sents[0] || sents[sents.length - 1];
    push('Tanya', 'Kalau hanya satu yang dibawa pulang dari siaran ini, apa?', 'tanya');
    push('Warta', jawab(inti, topic, channel), 'tegas');
  }
  if (mode === 'diskusi') {
    push('Kisah', kisahDariTeks(sents[0], topic, channel), 'kisah');
  }
  push('Warta', tutupKanal(channel, topic), 'inform');
}

function alurDialogTokoh(push, mode, sents, isi, topic, channel) {
  const pembuka = sents[0] || isi.text;
  push('Warta', pembuka, 'inform', isi);
  push('Tanya', reaksiSetelahFakta(pembuka, topic, channel), 'backchannel');
  if (sents.length > 1) {
    push('Warta', sents.slice(1, 3).join(' '), 'inform', isi);
  }
  push('Tanya', 'Kisah yang kuat. Tapi zaman sudah beda — pelajarannya masih relevan?', 'ragu');
  push('Warta', 'Justru itu ujiannya. Prinsipnya bertahan, caranya yang berubah.', 'tegas');
  if (sents.length > 3) {
    push('Warta', pilih(JEMBATAN_WARTA, topic, channel), 'inform');
    push('Warta', sents.slice(3).join(' '), 'inform', isi);
  }
  if (mode === 'diskusi') {
    push('Kisah', kisahDariTeks(pembuka, topic, channel), 'kisah');
    push('Tanya', tanyaDariTeks(pembuka, topic, channel), 'tanya');
    push('Warta', jawabDariTeks(pembuka, topic, channel), 'tegas');
  }
  push('Warta', tutupKanal(channel, topic), 'inform');
}

export async function buildScript(topic) {
  pituturState.state._topicHint = topic || '';
  await pituturSumber.muat();
  const state = pituturState.state;
  const lang = state.lang || 'id';
  const mode = modeAktif(state);
  const ch = await kanalAsync(state.channel);
  const lines = [];

  const push = function (s, t, intent, entry) {
    let teks = String(t || '').trim();
    if (!teks) return;
    let lineLang = lang;
    if (lang && lang !== 'id') {
      const tr = terjemahkan(teks, lang);
      const hybridPatah = /\b(Country an |largest kedua|and pertanian)\b/i.test(tr);
      if (tr && tr !== teks && !hybridPatah) {
        teks = tr;
        lineLang = lang;
      } else if (tr && tr !== teks && hybridPatah) {
        lineLang = 'id';
      } else {
        lineLang = 'id';
      }
    }
    if (lineLang === 'id') teks = naturalisasiLisan(teks);
    lines.push({
      speaker: s,
      text: teks,
      intent: intent || 'inform',
      sumber: buatRujukan(entry),
      lang: lineLang,
      fallback: lineLang === 'id' && lang !== 'id'
    });
  };

  const ada = pituturSumber.jumlah() > 0;
  const useData = state.sources.dataries && ada;

  if (ch.strategi === 'koleksi') {
    buildKoleksi(push, state, mode, lines);
    return lines;
  }

  if (ch.strategi === 'dokumen') {
    if (!ch.docId) {
      push('Warta', 'Pilih materi dulu di panel Sumber, lalu Susun Naskah lagi.', 'inform');
      return lines;
    }
    await buildDokumen(push, state, mode, ch.docId, lines);
    return lines;
  }

  if (state.sources.dokumen && String(state.channel || '').indexOf('doc:') !== 0) {
    const docs = await pituturDokumen.daftar();
    if (docs.length && !state.sources.dataries && !state.sources.koleksi) {
      push('Warta', 'Ada materi tersimpan. Pilih salah satu di daftar Materi, lalu Susun Naskah.', 'inform');
      return lines;
    }
  }

  if (ch.strategi === 'lingo') {
    if (!useData) {
      push('Warta', 'Pustaka dataries belum terhubung di halaman ini.', 'inform');
      return lines;
    }
    await buildLingo(push, state, mode, topic);
    return lines;
  }

  const fakta = useData ? (await pituturSumber.query(ch.grup.length ? ch.grup : null, topic, 1))[0] : null;
  const isi = fakta;
  push('Warta', pembukaKanal(state.channel, lang), 'inform');

  const terakhir = state.history[state.history.length - 1];
  if (terakhir && terakhir.topik && terakhir.topik !== 'siaran umum' && (Date.now() - terakhir.date) < 72 * 3600000) {
    push('Warta', 'Kemarin kita sempat menyinggung ' + terakhir.topik + '. Hari ini kita lanjut.', 'inform');
  }

  if (state.channel === 'pagi' && state.sources.devlog && useData) {
    const c = (await pituturSumber.catatan(topic))[1];
    if (c) {
      push('Warta', 'Dari catatan pengembangan.', 'inform', { _grup: 'devlog', metadata: { name: 'catatan pengembangan' } });
      push('Warta', c.text, 'inform', c);
      if (mode !== 'monolog') {
        push('Tanya', pilih(ANGGUK, topic, state.channel), 'backchannel');
      }
    }
  }

  if (!isi) {
    push('Warta', 'Pustaka dataries belum terhubung di halaman ini.', 'inform');
    return lines;
  }

  const sents = pecahUntukSiaran(isi.text);

  if (mode === 'monolog') {
    const unit = sents.length ? sents : [naturalisasiLisan(isi.text)];
    const ambil = Math.min(unit.length, 3);
    for (let i = 0; i < ambil; i++) {
      push('Warta', unit[i], 'inform', isi);
    }
    if (unit.length > ambil) {
      push('Warta', unit.slice(ambil).join(' '), 'inform', isi);
    }
    push('Warta', tutupKanal(state.channel, topic), 'inform');
    return lines;
  }

  if (ch.strategi === 'tokoh') {
    alurDialogTokoh(push, mode, sents, isi, topic, state.channel);
    return lines;
  }

  if (sents.length <= 2) {
    push('Warta', isi.text, 'inform', isi);
    push('Tanya', pilih(TANYA_DALAM, topic, state.channel), 'tanya');
    push('Warta', jawabDariTeks(isi.text, topic, state.channel), 'tegas');
    if (mode === 'diskusi') {
      push('Kisah', pilih(KISAH_MAKNA, topic, state.channel), 'kisah');
    }
    push('Warta', tutupKanal(state.channel, topic), 'inform');
    return lines;
  }

  alurDialogFakta(push, mode, sents, isi, topic, state.channel);
  return lines;
}

export function selaUntuk(speaker, topik) {
  const t = topik ? ' soal ' + topik : '';
  if (speaker === 'Tanya') {
    return { speaker: 'Tanya', text: 'Sebentar, boleh aku sela' + t + '? Apakah itu masih berlaku hari ini?', intent: 'tanya' };
  }
  if (speaker === 'Kisah') {
    return { speaker: 'Kisah', text: 'Izinkan aku menyela' + t + '. Ini mengingatkanku pada sebuah kisah.', intent: 'kisah' };
  }
  return { speaker: 'Warta', text: 'Selaan cepat' + t + ': data ini dari pustaka lokal Rategoan.', intent: 'inform' };
}

import { memoryIndex } from '../raget-memory/memory-index.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { formatter } from './formatter.js';
import { exportFormats } from '../export/formats.js';
import { exportShare } from '../export/share.js';
import { remindersStore } from '../reminders/reminders-store.js';
import { calendarStore } from '../calendar/calendar-store.js';
import { pdfStore } from '../pdf/pdf-store.js';
import { notionStore } from '../notion/notion-store.js';
import { evernoteStore } from '../evernote/evernote-store.js';
import { whatsappStore } from '../whatsapp/whatsapp-store.js';
import { meaningfulWords, pickVariant, hashText } from '../utils/text.js';
import { retrieval } from '../raget-retrieval/retrieve.js';
import { quality } from './quality.js';
import { dailyBriefing } from './daily-briefing.js';

const SAFE_EXPR = /^[0-9+\-*/%().\s]+$/;
const NUMBER_RE = /^[0-9.]+$/;
const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };

function extractiveSummary(text) {
  const sentences = String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!sentences.length) return { points: [], gist: '' };
  const freq = {};
  const sentWords = sentences.map((s) => {
    const words = meaningfulWords(s);
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
    return words;
  });
  const scored = sentences.map((s, i) => ({
    sentence: s,
    index: i,
    score: sentWords[i].reduce((acc, w) => acc + freq[w], 0),
  }));
  const count = Math.min(sentences.length, Math.max(3, Math.min(5, Math.ceil(sentences.length / 2))));
  const top = scored.slice().sort((a, b) => b.score - a.score).slice(0, count);
  const points = top.slice().sort((a, b) => a.index - b.index).map((s) => s.sentence);
  const gist = scored.slice().sort((a, b) => b.score - a.score)[0].sentence;
  return { points, gist };
}

function bodyOrSentences(item) {
  if (item.body) {
    const lines = item.body
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('-'))
      .map((l) => l.replace(/^-\s*/, ''));
    if (lines.length) return lines;
  }
  return extractiveSummary(item.text || '').points;
}

function tokenize(expr) {
  const tokens = [];
  const re = /([0-9]*\.?[0-9]+|[+\-*/%()])/g;
  let match;
  let cursor = 0;
  while ((match = re.exec(expr)) !== null) {
    const gap = expr.slice(cursor, match.index);
    if (gap.trim() !== '') return null;
    tokens.push(match[1]);
    cursor = match.index + match[1].length;
  }
  if (expr.slice(cursor).trim() !== '') return null;
  return tokens;
}

function toRPN(tokens) {
  const output = [];
  const ops = [];
  let prevToken = null;
  tokens.forEach((token) => {
    if (NUMBER_RE.test(token)) {
      output.push(token);
    } else if (token === '(') {
      ops.push(token);
    } else if (token === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') output.push(ops.pop());
      ops.pop();
    } else {
      if (token === '-' && (prevToken === null || prevToken === '(' || PRECEDENCE[prevToken])) {
        output.push('0');
      }
      while (ops.length && PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[token]) {
        output.push(ops.pop());
      }
      ops.push(token);
    }
    prevToken = token;
  });
  while (ops.length) output.push(ops.pop());
  return output;
}

function evalRPN(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (NUMBER_RE.test(token)) {
      stack.push(parseFloat(token));
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) return null;
    if (token === '+') stack.push(a + b);
    else if (token === '-') stack.push(a - b);
    else if (token === '*') stack.push(a * b);
    else if (token === '/') stack.push(b === 0 ? NaN : a / b);
    else if (token === '%') stack.push(b === 0 ? NaN : a % b);
  }
  return stack.length === 1 ? stack[0] : null;
}

function safeEval(expr) {
  const tokens = tokenize(expr);
  if (!tokens || !tokens.length) return null;
  const rpn = toRPN(tokens);
  const result = evalRPN(rpn);
  return typeof result === 'number' && isFinite(result) ? result : null;
}

function trimNum(n) {
  return Math.round(n * 1e6) / 1e6;
}

function ringkas(text) {
  const src = String(text || '')
    .replace(/^ringkas(kan)?\s*:?\s*/i, '')
    .trim();
  if (!src) return 'Tidak ada teks untuk diringkas.';
  const { points, gist } = extractiveSummary(src);
  if (!points.length) return 'Ringkasan: ' + src;
  return formatter.blocks([formatter.h('Ringkasan', 3), formatter.bullets(points), 'Intinya: ' + gist]);
}

function ringkasPercakapan(messages) {
  const recent = (Array.isArray(messages) ? messages : []).slice(-10).filter((m) => m.role === 'user');
  if (!recent.length) return 'Belum ada percakapan untuk diringkas.';
  const joined = recent.map((m) => m.text).join('. ');
  const { points, gist } = extractiveSummary(joined);
  if (!points.length) return 'Belum ada percakapan untuk diringkas.';
  return formatter.blocks([formatter.h('Ringkasan Percakapan', 3), formatter.bullets(points), 'Intinya: ' + gist]);
}

async function jelaskan(topic) {
  const t = String(topic || '').trim();
  if (!t) return 'Mau saya jelaskan apa?';
  const found = await memoryIndex.findTopic(t);
  const label = (found && found.title) || t.charAt(0).toUpperCase() + t.slice(1);
  const definisi = found
    ? found.text
    : label + ' secara sederhana adalah konsep yang berkaitan dengan "' + t + '", biasa muncul saat membahas topik yang relevan dengannya.';
  const points = found
    ? bodyOrSentences(found)
    : [
        'Pahami dulu konteks dasar dari ' + t + '.',
        'Perhatikan bagaimana ' + t + ' biasa dipakai sehari-hari.',
        'Cari contoh nyata supaya lebih mudah diingat.',
      ];
  const contoh = found
    ? 'Contoh sehari-hari: ' + label + ' sering muncul dalam percakapan atau aktivitas rutin terkait topik ini.'
    : 'Contoh sederhana: "' + t + '" biasanya muncul saat orang membahas topik terkait dalam obrolan santai.';
  return formatter.blocks([
    formatter.h(label, 3),
    definisi,
    formatter.blocks([formatter.h('Poin penting', 3), formatter.bullets(points.slice(0, 4))]),
    formatter.blocks([formatter.h('Contoh', 3), contoh]),
  ]);
}

const CARA_VARIANTS = [
  (t) => [
    'Pahami dulu tujuan dan dasar-dasar dari ' + t + '.',
    'Kumpulkan sumber belajar atau referensi terpercaya soal ' + t + '.',
    'Mulai praktik ' + t + ' dari hal paling sederhana.',
    'Evaluasi progres secara berkala supaya tahu bagian mana yang perlu diperbaiki.',
    'Konsisten mengulang sampai terbiasa dengan ' + t + '.',
  ],
  (t) => [
    'Tentukan target yang jelas untuk ' + t + '.',
    'Susun rencana kecil yang realistis untuk mencapainya.',
    'Cari orang atau komunitas yang juga menekuni ' + t + ' untuk saling belajar.',
    'Catat kemajuan supaya termotivasi melanjutkan ' + t + '.',
    'Sesuaikan strategi bila cara yang dipakai belum efektif.',
  ],
];

function cara(topic) {
  const t = String(topic || '').trim() || 'hal ini';
  const h = hashText(t);
  const variant = CARA_VARIANTS[h % CARA_VARIANTS.length](t);
  const count = 3 + (h % Math.max(1, variant.length - 2));
  return formatter.blocks([formatter.h('Langkah', 3), formatter.numbered(variant.slice(0, count))]);
}

const IDE_POOL = [
  (t) => 'Bagikan tips praktis seputar ' + t + ' dalam format singkat.',
  (t) => 'Buat cerita atau pengalaman pribadi yang berhubungan dengan ' + t + '.',
  (t) => 'Rangkum kesalahan umum seputar ' + t + ' beserta solusinya.',
  (t) => 'Buat perbandingan sebelum-sesudah menerapkan ' + t + '.',
  (t) => 'Wawancara singkat (tanya-jawab) seputar pengalaman orang lain dengan ' + t + '.',
  (t) => 'Buat daftar alat atau sumber daya yang membantu soal ' + t + '.',
];

function ide(topic) {
  const t = String(topic || '').trim() || 'topik ini';
  const h = hashText(t);
  const count = 3 + (h % 3);
  const start = h % IDE_POOL.length;
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(IDE_POOL[(start + i) % IDE_POOL.length](t));
  }
  return formatter.blocks([formatter.h('Ide Konten', 3), formatter.numbered(items)]);
}

const MANFAAT_POOL = [
  (t) => 'Membantu meningkatkan kualitas hidup yang berkaitan dengan ' + t + '.',
  (t) => 'Bisa jadi kebiasaan positif dengan dampak baik dalam jangka panjang untuk ' + t + '.',
  (t) => 'Memberi manfaat nyata bila dilakukan secara konsisten terkait ' + t + '.',
  (t) => 'Membantu menjaga keseimbangan fisik maupun mental sehubungan dengan ' + t + '.',
  (t) => 'Menambah pengalaman dan wawasan baru seputar ' + t + '.',
  (t) => 'Bisa mempererat hubungan sosial kalau dilakukan bersama orang lain, tergantung konteks ' + t + '.',
];

function manfaat(topic) {
  const t = String(topic || '').trim() || 'hal ini';
  const h = hashText(t);
  const count = 3 + (h % 3);
  const start = h % MANFAAT_POOL.length;
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(MANFAAT_POOL[(start + i) % MANFAAT_POOL.length](t));
  }
  return formatter.blocks([formatter.h('Manfaat ' + t.charAt(0).toUpperCase() + t.slice(1), 3), formatter.bullets(items)]);
}

function buildGenericBulletTool(title, pool) {
  return function (topic) {
    const t = String(topic || '').trim() || 'hal ini';
    const h = hashText(t);
    const count = 3 + (h % 3);
    const start = h % pool.length;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(pool[(start + i) % pool.length](t));
    }
    return formatter.blocks([formatter.h(title + ' ' + t.charAt(0).toUpperCase() + t.slice(1), 3), formatter.bullets(items)]);
  };
}

const FUNGSI_POOL = [
  (t) => 'Berperan penting dalam menjalankan proses yang berkaitan dengan ' + t + '.',
  (t) => 'Membantu memenuhi kebutuhan tertentu terkait ' + t + '.',
  (t) => 'Mendukung kelancaran aktivitas yang berhubungan dengan ' + t + '.',
  (t) => 'Menjadi bagian penting dalam sistem atau proses seputar ' + t + '.',
  (t) => 'Membantu mencapai hasil yang diharapkan sehubungan dengan ' + t + '.',
];

const TUJUAN_POOL = [
  (t) => 'Mencapai hasil yang lebih baik terkait ' + t + '.',
  (t) => 'Memenuhi kebutuhan atau target tertentu seputar ' + t + '.',
  (t) => 'Memberi manfaat jangka panjang sehubungan dengan ' + t + '.',
  (t) => 'Menyelesaikan masalah yang berkaitan dengan ' + t + '.',
  (t) => 'Meningkatkan kualitas atau efisiensi terkait ' + t + '.',
];

const PENYEBAB_POOL = [
  (t) => 'Bisa dipicu oleh faktor internal maupun eksternal terkait ' + t + '.',
  (t) => 'Sering berkaitan dengan kondisi atau kebiasaan tertentu seputar ' + t + '.',
  (t) => 'Bisa muncul akibat perubahan lingkungan atau situasi terkait ' + t + '.',
  (t) => 'Kadang dipengaruhi oleh kombinasi beberapa hal yang berkaitan dengan ' + t + '.',
  (t) => 'Bisa jadi akibat dari proses yang berlangsung sehubungan dengan ' + t + '.',
];

const fungsi = buildGenericBulletTool('Fungsi', FUNGSI_POOL);
const tujuan = buildGenericBulletTool('Tujuan', TUJUAN_POOL);
const penyebab = buildGenericBulletTool('Penyebab', PENYEBAB_POOL);

function genericComparisonPoints(t) {
  return ['Punya kelebihan tersendiri tergantung kebutuhan.', 'Bisa dipertimbangkan sesuai konteks penggunaan ' + t + '.'];
}

async function bandingkan(a, b) {
  const topicA = String(a || '').trim() || 'A';
  const topicB = String(b || '').trim() || 'B';
  const foundA = await memoryIndex.findTopic(topicA);
  const foundB = await memoryIndex.findTopic(topicB);
  const pointsA = (foundA ? bodyOrSentences(foundA) : genericComparisonPoints(topicA)).slice(0, 3);
  const pointsB = (foundB ? bodyOrSentences(foundB) : genericComparisonPoints(topicB)).slice(0, 3);
  return formatter.blocks([
    formatter.blocks([formatter.h(topicA, 3), formatter.bullets(pointsA)]),
    formatter.blocks([formatter.h(topicB, 3), formatter.bullets(pointsB)]),
    'Intinya: baik ' + topicA + ' maupun ' + topicB + ' punya kelebihan masing-masing, tergantung kebutuhan dan situasimu.',
  ]);
}

async function kelebihanKekurangan(topic) {
  const t = String(topic || '').trim() || 'hal ini';
  const found = await memoryIndex.findTopic(t);
  const points = found ? bodyOrSentences(found) : [];
  const half = Math.ceil(points.length / 2);
  const kelebihan = points.length
    ? points.slice(0, half)
    : ['Bisa memberi manfaat tertentu tergantung cara penggunaannya.', 'Umumnya mudah diakses atau diterapkan.'];
  const kekurangan = points.length
    ? points.slice(half)
    : ['Perlu penyesuaian tergantung kebutuhan masing-masing orang.', 'Ada baiknya dipertimbangkan matang-matang sebelum diterapkan.'];
  return formatter.blocks([
    formatter.blocks([formatter.h('Kelebihan', 3), formatter.bullets(kelebihan)]),
    formatter.blocks([formatter.h('Kekurangan', 3), formatter.bullets(kekurangan)]),
    'Intinya: pertimbangkan ' + t + ' sesuai kebutuhan dan situasimu sendiri.',
  ]);
}

const HITUNG_TEMPLATES = [
  (expr, result) => expr + ' = ' + result,
  (expr, result) => 'Hasil dari ' + expr + ' adalah ' + result + '.',
  (expr, result) => expr + ', hasilnya ' + result + '.',
];

function hitung(text) {
  const src = String(text || '').trim();
  const percentMatch = src.match(/(-?[0-9.]+)\s*%\s*dari\s*(-?[0-9.]+)/i);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const base = parseFloat(percentMatch[2]);
    const expr = pct + '% dari ' + base;
    const result = trimNum((pct / 100) * base);
    return pickVariant('hitung', HITUNG_TEMPLATES, expr)(expr, result);
  }
  const cleaned = src.replace(/^(hitung|berapa)\s*/i, '').trim();
  if (!cleaned || !SAFE_EXPR.test(cleaned)) return 'Ekspresi tidak valid. Gunakan angka dan operator +, -, *, /, % saja.';
  const result = safeEval(cleaned);
  if (result == null) return 'Tidak bisa menghitung ekspresi itu.';
  return pickVariant('hitung', HITUNG_TEMPLATES, cleaned)(cleaned, trimNum(result));
}

function waktu(text) {
  const t = String(text || '').toLowerCase();
  const now = new Date();
  if (/jam\s+berapa/.test(t)) {
    return 'Sekarang jam ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '.';
  }
  if (/hari\s+apa/.test(t)) {
    return 'Hari ini ' + now.toLocaleDateString('id-ID', { weekday: 'long' }) + '.';
  }
  if (/tanggal\s+berapa/.test(t)) {
    return 'Hari ini tanggal ' + now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
  }
  return (
    now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    ', pukul ' +
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}

async function cari(query) {
  const q = String(query || '').trim();
  if (!q) return 'Mau cari info tentang apa?';
  const results = await memoryIndex.search(q, 3);
  if (!results.length) return 'Saya belum punya catatan soal "' + q + '". Coba ceritakan, nanti saya ingat.';
  return 'Yang saya tahu soal "' + q + '": ' + results.map((r) => r.text).join(' | ');
}

async function cariSemua(query) {
  const q = String(query || '').trim();
  if (!q) return 'Mau cari apa di semua sumber?';
  const words = meaningfulWords(q.toLowerCase());
  const groups = [];

  const noteResults = await ragetDb.search(q, 5);
  if (noteResults.length) groups.push({ source: 'Riwayat Chat', items: noteResults.map((n) => n.question + ' — ' + n.answer.slice(0, 80)) });

  const knowledgeResults = await memoryIndex.search(q, 5);
  if (knowledgeResults.length) groups.push({ source: 'Pengetahuan', items: knowledgeResults.map((r) => r.text.slice(0, 100)) });

  const reminderResults = remindersStore.allActive().filter((r) => words.some((w) => r.action.toLowerCase().includes(w)));
  if (reminderResults.length) groups.push({ source: 'Pengingat', items: reminderResults.map((r) => r.action + ' (' + new Date(r.timestamp).toLocaleString('id-ID') + ')') });

  const calendarResults = calendarStore.eventsBetween(0, Date.now() + 365 * 24 * 60 * 60 * 1000).filter((e) => words.some((w) => (e.summary || '').toLowerCase().includes(w)));
  if (calendarResults.length) groups.push({ source: 'Kalender', items: calendarResults.map((e) => e.summary + ' (' + new Date(e.start).toLocaleString('id-ID') + ')') });

  const pdfResults = await pdfStore.search(q, 5);
  if (pdfResults.length) groups.push({ source: 'PDF', items: pdfResults.map((r) => (r.title || 'PDF') + ' — ' + r.text.slice(0, 80)) });

  const notionResults = await notionStore.search(q, 5);
  if (notionResults.length) groups.push({ source: 'Notion', items: notionResults.map((r) => (r.title || 'Notion') + ' — ' + r.text.slice(0, 80)) });

  const evernoteResults = await evernoteStore.search(q, 5);
  if (evernoteResults.length) groups.push({ source: 'Evernote', items: evernoteResults.map((r) => (r.title || 'Evernote') + ' — ' + r.text.slice(0, 80)) });

  const whatsappResults = await whatsappStore.search(q, 5);
  if (whatsappResults.length) groups.push({ source: 'WhatsApp', items: whatsappResults.map((r) => r.text.slice(0, 80)) });

  if (!groups.length) return 'Tidak ditemukan apa pun terkait "' + q + '" di semua sumber (riwayat, pengetahuan, pengingat, kalender, PDF, Notion, Evernote, WhatsApp).';

  const parts = [formatter.h('Hasil pencarian: "' + q + '"', 3)];
  groups.slice(0, 10).forEach((g) => {
    parts.push(formatter.bold(g.source));
    parts.push(formatter.bullets(g.items.slice(0, 3)));
  });
  return formatter.blocks(parts);
}

function ingat(text) {
  const fact = String(text || '')
    .replace(/^ingat\s*(bahwa)?\s*/i, '')
    .trim();
  if (!fact) return 'Mau saya ingat apa?';
  memoryLong.rememberNote(fact);
  return 'Baik, saya ingat: "' + fact + '".';
}

function lupakan(text) {
  const fact = String(text || '')
    .replace(/^lupakan\s*/i, '')
    .trim();
  if (!fact) return 'Mau saya lupakan yang mana?';
  return memoryLong.forgetNote(fact) ? 'Sudah saya lupakan soal "' + fact + '".' : 'Saya tidak menemukan catatan soal "' + fact + '".';
}

function textOverlapRatio(a, b) {
  const wa = new Set(meaningfulWords(String(a || '').toLowerCase()));
  const wb = new Set(meaningfulWords(String(b || '').toLowerCase()));
  if (!wa.size || !wb.size) return 0;
  let common = 0;
  wa.forEach((w) => { if (wb.has(w)) common++; });
  return common / Math.min(wa.size, wb.size);
}

async function laporanOtak() {
  const notes = await ragetDb.allNotes();
  if (!notes.length) return 'Belum ada percakapan tercatat untuk dianalisis.';

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const notesWeek = notes.filter((n) => n.time >= weekAgo);

  const byIntent = new Map();
  notes.forEach((n) => {
    const key = n.intent || 'generic';
    if (!byIntent.has(key)) byIntent.set(key, { total: 0, rated: 0, positive: 0 });
    const s = byIntent.get(key);
    s.total++;
    if (n.feedback != null) {
      s.rated++;
      if (n.feedback) s.positive++;
    }
  });
  const confidencePerIntent = Array.from(byIntent.entries())
    .map(([intent, s]) => ({ intent, total: s.total, akurasi: s.rated ? Math.round((s.positive / s.rated) * 100) : null }))
    .filter((x) => x.akurasi != null)
    .sort((a, b) => a.akurasi - b.akurasi);

  const autoFewshotCandidates = notes.filter((n) => n.feedback === true).slice(-5);

  const seenTexts = [];
  const gapCounts = new Map();
  notes.forEach((n) => {
    if (n.intent !== 'chat_terbuka' && n.intent !== 'generic') return;
    const key = meaningfulWords(n.question.toLowerCase()).slice(0, 3).join(' ');
    if (!key) return;
    gapCounts.set(key, (gapCounts.get(key) || 0) + 1);
  });
  const gapWishlist = Array.from(gapCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([topic]) => topic);

  const dedupPairs = [];
  for (let i = 0; i < notes.length && dedupPairs.length < 5; i++) {
    for (let j = i + 1; j < notes.length && dedupPairs.length < 5; j++) {
      if (textOverlapRatio(notes[i].question, notes[j].question) > 0.8) {
        dedupPairs.push(notes[i].question + ' ~ ' + notes[j].question);
      }
    }
  }

  const qualityResult = await quality.evaluate();

  const parts = [
    formatter.h('Laporan Otak Raget', 3),
    'Total percakapan tercatat: ' + notes.length + ' (' + notesWeek.length + ' minggu ini).',
    formatter.bold('Skor Kualitas: ' + qualityResult.score + '/100'),
    formatter.bullets([
      'Akurasi (A): ' + qualityResult.breakdown.A + '% (n=' + qualityResult.n.A + ')',
      'Kekayaan (K): ' + qualityResult.breakdown.K + '% (n=' + qualityResult.n.K + ')',
      'Keunikan (U): ' + qualityResult.breakdown.U + '% (n=' + qualityResult.n.U + ')',
      'Diversitas (D): ' + qualityResult.breakdown.D + '% (n=' + qualityResult.n.D + ')',
      'Variasi struktur (V): ' + qualityResult.breakdown.V + '% (n=' + qualityResult.n.V + ')',
    ]),
  ];

  if (confidencePerIntent.length) {
    parts.push(formatter.h('Intent Terlemah (akurasi per folder/intent)', 3));
    parts.push(formatter.bullets(confidencePerIntent.slice(0, 5).map((x) => x.intent + ': ' + x.akurasi + '% (' + x.total + ' kasus)')));
  }

  if (gapWishlist.length) {
    parts.push(formatter.h('Gap Wishlist (topik sering ditanya tanpa data)', 3));
    parts.push(formatter.bullets(gapWishlist));
  }

  if (dedupPairs.length) {
    parts.push(formatter.h('Kandidat Dedup/Merge', 3));
    parts.push(formatter.bullets(dedupPairs));
  }

  if (autoFewshotCandidates.length) {
    parts.push(formatter.h('Kandidat Auto-Fewshot (rating positif)', 3));
    parts.push(formatter.bullets(autoFewshotCandidates.map((n) => n.question)));
  }

  parts.push(formatter.h('Rekomendasi', 3));
  const rekomendasi = [];
  if (confidencePerIntent.length) rekomendasi.push('Prioritaskan penambahan data untuk intent dengan akurasi terendah.');
  if (gapWishlist.length) rekomendasi.push('Tambahkan data dataries untuk topik di gap wishlist.');
  if (!rekomendasi.length) rekomendasi.push('Belum ada rekomendasi mendesak, data dan akurasi masih sehat.');
  parts.push(formatter.bullets(rekomendasi));

  return formatter.blocks(parts);
}

function exportChat(session, format) {
  const s = session || { title: 'Chat', messages: [] };
  const stamp = new Date().toISOString().slice(0, 10);
  const base = 'raget-chat-' + stamp;
  if (format === 'markdown' || format === 'md') {
    exportShare.downloadBlob(exportFormats.toMarkdown(s), 'text/markdown', base + '.md');
    return 'Chat diunduh sebagai Markdown (' + base + '.md).';
  }
  if (format === 'json') {
    exportShare.downloadBlob(exportFormats.toJSON(s), 'application/json', base + '.json');
    return 'Chat diunduh sebagai JSON (' + base + '.json).';
  }
  if (format === 'pdf') {
    const opened = exportShare.openPrintable(exportFormats.toPrintableHTML(s));
    return opened
      ? 'Tab baru dibuka berisi chat siap cetak. Tekan Ctrl+P / Cmd+P lalu pilih "Simpan sebagai PDF".'
      : 'Popup diblokir browser. Coba izinkan popup lalu ulangi.';
  }
  exportShare.downloadBlob(exportFormats.toTXT(s), 'text/plain', base + '.txt');
  return 'Chat diunduh sebagai TXT (' + base + '.txt).';
}

function shareToWhatsApp(session) {
  const s = session || { title: 'Chat', messages: [] };
  const text = exportFormats.toTXT(s).slice(0, 4000);
  exportShare.whatsappShareText(text);
  return 'Membuka WhatsApp dengan isi percakapan siap dibagikan.';
}

async function ringkasHari() {
  const events = dailyBriefing.eventsToday();
  const reminders = dailyBriefing.remindersToday();
  const notes = (await ragetDb.allNotes()).slice(-3);
  const items = [];
  events.forEach((e) => items.push('Acara: ' + e.summary));
  reminders.forEach((r) => items.push('Pengingat: ' + r.action));
  notes.forEach((n) => items.push('Catatan: ' + n.question));
  if (!items.length) items.push('Belum ada acara, pengingat, atau catatan untuk hari ini.');
  return formatter.formatByType('daftar', { title: 'Ringkasan Hari Ini', items });
}

async function eksporLog() {
  const notes = await ragetDb.allNotes();
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'raget-log-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  return 'Log percakapan (' + notes.length + ' entri) sudah diunduh.';
}

function buildCatatanContent(format) {
  const notes = memoryLong.allNotes();
  const learned = memoryLong.allLearned();
  const facts = memoryLong.allFacts();
  const stamp = new Date().toLocaleString('id-ID');
  if (format === 'markdown') {
    const lines = ['# Catatan Saya', '', '_Diekspor ' + stamp + '_', ''];
    lines.push('## Fakta', '');
    Object.keys(facts).forEach((k) => lines.push('- **' + k + '**: ' + JSON.stringify(facts[k])));
    lines.push('', '## Hal yang Dipelajari', '');
    learned.forEach((f) => lines.push('- ' + f.subject + ': ' + f.value));
    lines.push('', '## Catatan', '');
    notes.forEach((n) => lines.push('- ' + n.text));
    return lines.join('\n');
  }
  const lines = ['Catatan Saya', 'Diekspor ' + stamp, ''];
  lines.push('=== Fakta ===');
  Object.keys(facts).forEach((k) => lines.push(k + ': ' + JSON.stringify(facts[k])));
  lines.push('', '=== Hal yang Dipelajari ===');
  learned.forEach((f) => lines.push(f.subject + ': ' + f.value));
  lines.push('', '=== Catatan ===');
  notes.forEach((n) => lines.push('- ' + n.text));
  return lines.join('\n');
}

function eksporCatatan(format) {
  const fmt = format === 'markdown' ? 'markdown' : 'txt';
  const content = buildCatatanContent(fmt);
  const stamp = new Date().toISOString().slice(0, 10);
  if (fmt === 'markdown') {
    exportShare.downloadBlob(content, 'text/markdown', 'raget-catatan-' + stamp + '.md');
    return 'Catatan saya diunduh sebagai Markdown (raget-catatan-' + stamp + '.md).';
  }
  exportShare.downloadBlob(content, 'text/plain', 'raget-catatan-' + stamp + '.txt');
  return 'Catatan saya diunduh sebagai TXT (raget-catatan-' + stamp + '.txt).';
}

export const agentTools = Object.freeze({
  ringkas,
  ringkasPercakapan,
  hitung,
  waktu,
  cari,
  ingat,
  lupakan,
  eksporLog,
  jelaskan,
  cara,
  ide,
  manfaat,
  fungsi,
  tujuan,
  penyebab,
  bandingkan,
  kelebihanKekurangan,
  laporanOtak,
  exportChat,
  shareToWhatsApp,
  cariSemua,
  ringkasHari,
  eksporCatatan,
});

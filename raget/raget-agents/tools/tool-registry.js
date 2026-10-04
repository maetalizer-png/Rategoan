import { memoryIndex } from '../../raget-memory/memory-index.js';
import { formatter } from '../formatter.js';
import {pickVariant, hashText} from '../../../shared/text.js';
import { mathEngine } from '../math-engine.js';
import { bodyOrSentences } from './tool-executor.js';

export async function jelaskan(topic) {
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

export const CARA_VARIANTS = [
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

export async function cara(topic) {
  const t = String(topic || '').trim() || 'hal ini';
  const found = await memoryIndex.findTopic(t);
  if (found) {
    const label = found.title || t.charAt(0).toUpperCase() + t.slice(1);
    return formatter.blocks([formatter.h(label, 3), found.text, formatter.blocks([formatter.h('Langkah', 3), formatter.numbered(bodyOrSentences(found).slice(0, 4))])]);
  }
  const h = hashText(t);
  const variant = CARA_VARIANTS[h % CARA_VARIANTS.length](t);
  const count = 3 + (h % Math.max(1, variant.length - 2));
  return formatter.blocks([formatter.h('Langkah', 3), formatter.numbered(variant.slice(0, count))]);
}

export const IDE_POOL = [
  (t) => 'Bagikan tips praktis seputar ' + t + ' dalam format singkat.',
  (t) => 'Buat cerita atau pengalaman pribadi yang berhubungan dengan ' + t + '.',
  (t) => 'Rangkum kesalahan umum seputar ' + t + ' beserta solusinya.',
  (t) => 'Buat perbandingan sebelum-sesudah menerapkan ' + t + '.',
  (t) => 'Wawancara singkat (tanya-jawab) seputar pengalaman orang lain dengan ' + t + '.',
  (t) => 'Buat daftar alat atau sumber daya yang membantu soal ' + t + '.',
];

export function ide(topic) {
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

export const MANFAAT_POOL = [
  (t) => 'Membantu meningkatkan kualitas hidup yang berkaitan dengan ' + t + '.',
  (t) => 'Bisa jadi kebiasaan positif dengan dampak baik dalam jangka panjang untuk ' + t + '.',
  (t) => 'Memberi manfaat nyata bila dilakukan secara konsisten terkait ' + t + '.',
  (t) => 'Membantu menjaga keseimbangan fisik maupun mental sehubungan dengan ' + t + '.',
  (t) => 'Menambah pengalaman dan wawasan baru seputar ' + t + '.',
  (t) => 'Bisa mempererat hubungan sosial kalau dilakukan bersama orang lain, tergantung konteks ' + t + '.',
];

export function manfaat(topic) {
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

export function buildGenericBulletTool(title, pool) {
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

export const FUNGSI_POOL = [
  (t) => 'Berperan penting dalam menjalankan proses yang berkaitan dengan ' + t + '.',
  (t) => 'Membantu memenuhi kebutuhan tertentu terkait ' + t + '.',
  (t) => 'Mendukung kelancaran aktivitas yang berhubungan dengan ' + t + '.',
  (t) => 'Menjadi bagian penting dalam sistem atau proses seputar ' + t + '.',
  (t) => 'Membantu mencapai hasil yang diharapkan sehubungan dengan ' + t + '.',
];

export const TUJUAN_POOL = [
  (t) => 'Mencapai hasil yang lebih baik terkait ' + t + '.',
  (t) => 'Memenuhi kebutuhan atau target tertentu seputar ' + t + '.',
  (t) => 'Memberi manfaat jangka panjang sehubungan dengan ' + t + '.',
  (t) => 'Menyelesaikan masalah yang berkaitan dengan ' + t + '.',
  (t) => 'Meningkatkan kualitas atau efisiensi terkait ' + t + '.',
];

export const PENYEBAB_POOL = [
  (t) => 'Bisa dipicu oleh faktor internal maupun eksternal terkait ' + t + '.',
  (t) => 'Sering berkaitan dengan kondisi atau kebiasaan tertentu seputar ' + t + '.',
  (t) => 'Bisa muncul akibat perubahan lingkungan atau situasi terkait ' + t + '.',
  (t) => 'Kadang dipengaruhi oleh kombinasi beberapa hal yang berkaitan dengan ' + t + '.',
  (t) => 'Bisa jadi akibat dari proses yang berlangsung sehubungan dengan ' + t + '.',
];

export const fungsi = buildGenericBulletTool('Fungsi', FUNGSI_POOL);
export const tujuan = buildGenericBulletTool('Tujuan', TUJUAN_POOL);
export const penyebab = buildGenericBulletTool('Penyebab', PENYEBAB_POOL);

export function genericComparisonPoints(t) {
  return ['Punya kelebihan tersendiri tergantung kebutuhan.', 'Bisa dipertimbangkan sesuai konteks penggunaan ' + t + '.'];
}

export async function bandingkan(a, b) {
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

export async function kelebihanKekurangan(topic) {
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

export const HITUNG_TEMPLATES = [
  (expr, result) => expr + ' = ' + result,
  (expr, result) => 'Hasil dari ' + expr + ' adalah ' + result + '.',
  (expr, result) => expr + ', hasilnya ' + result + '.',
];

export function wantsSteps(text) {
  return /\blangkah\b|\bcara\s*(hitung|kerja)nya\b|step\s*by\s*step|show\s*steps?/i.test(text);
}

export function hitung(text) {
  const src = String(text || '').trim();
  const showSteps = wantsSteps(src);

  const wordProblem = mathEngine.tryWordProblem(src);
  if (wordProblem) {
    return showSteps
      ? formatter.blocks([formatter.bullets(wordProblem.steps), 'Hasil akhir: ' + wordProblem.display + '.'])
      : wordProblem.display + '.';
  }

  const currency = mathEngine.tryConvertCurrency(src);
  if (currency) {
    const base = 'Sekitar ' + currency.value + ' ' + currency.to + ' (kurs statis, bukan kurs real-time).';
    return base;
  }
  const unit = mathEngine.tryConvertUnit(src);
  if (unit) {
    return 'Hasilnya sekitar ' + unit.value + ' ' + unit.unit + '.';
  }

  const pct = mathEngine.parsePercentOf(src);
  if (pct) {
    return showSteps
      ? formatter.blocks([pct.steps[0], 'Hasil: ' + pct.value + '.'])
      : pickVariant('hitung', HITUNG_TEMPLATES, pct.pct + '% dari ' + pct.base)(pct.pct + '% dari ' + pct.base, pct.value);
  }

  const cleaned = src
    .replace(/\b(langkah|cara\s*(hitung|kerja)nya|step\s*by\s*step|show\s*steps?)\b/gi, ' ')
    .replace(/^(hitung|berapa|calculate|what\s+is|compute)\s*/i, '')
    .replace(/\?+$/, '')
    .trim();
  const evalRes = mathEngine.evaluate(cleaned, { steps: showSteps });
  if (!evalRes.ok) return 'Ekspresi tidak valid. Gunakan angka dan operator +, -, ×, ÷, ^, % saja.';
  if (showSteps && evalRes.steps.length) {
    return formatter.blocks([formatter.bullets(evalRes.steps), 'Hasil akhir: ' + evalRes.value + '.']);
  }
  return pickVariant('hitung', HITUNG_TEMPLATES, cleaned)(cleaned, evalRes.value);
}

export function waktu(text) {
  const t = String(text || '').toLowerCase();
  const now = new Date();
  let dayOffset = 0;
  let label = 'Hari ini';
  if (/\bkemarin\s+lusa\b|\b2\s+hari\s+(yang\s+)?lalu\b/.test(t)) {
    dayOffset = -2;
    label = 'Kemarin lusa';
  } else if (/\bkemarin\b/.test(t)) {
    dayOffset = -1;
    label = 'Kemarin';
  } else if (/\blusa\b/.test(t)) {
    dayOffset = 2;
    label = 'Lusa';
  } else if (/\bbesok\b/.test(t)) {
    dayOffset = 1;
    label = 'Besok';
  }
  const target = new Date(now);
  target.setDate(target.getDate() + dayOffset);
  if (/jam\s+berapa/.test(t)) {
    return 'Sekarang jam ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '.';
  }
  if (/hari\s+apa/.test(t)) {
    return label + ' ' + target.toLocaleDateString('id-ID', { weekday: 'long' }) + '.';
  }
  if (/tanggal\s+berapa/.test(t)) {
    return label + ' tanggal ' + target.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
  }
  return (
    now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    ', pukul ' +
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}

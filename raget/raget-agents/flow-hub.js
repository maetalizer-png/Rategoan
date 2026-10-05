import { queryTree, buildResearch } from './deep-research.js';

function cleanLeak(text) {
  return String(text || '')
    .replace(/\s*target=_blank\b/gi, '')
    .replace(/\s*rel="noopener noreferrer"/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(text) {
  return cleanLeak(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !/^yang biasa dibahas/i.test(s) && !/^hasil pencarian web/i.test(s) && !/^rencana riset/i.test(s) && !/^proses berpikir/i.test(s));
}

function threePoints(text) {
  const list = sentences(text).slice(0, 3);
  if (!list.length) return cleanLeak(text).slice(0, 180);
  return list.map((s, i) => i + 1 + '. ' + s).join('\n');
}

function queries(topic) {
  const t = String(topic || '').replace(/^googling\s+/i, '').replace(/^riset\s+(mendalam\s+)?/i, '').trim();
  if (!t) return [];
  return [t, t + ' pengertian', t + ' Indonesia', t + ' data', t + ' kritik'].slice(0, 5);
}

function wantsCollection(text) {
  const t = String(text || '').toLowerCase();
  return /\b(dari koleksi|di koleksi|yang saya simpan|tanya koleksi|apa yang saya simpan)\b/.test(t);
}

function wantsThink(text) {
  return /\b(pikirkan|berpikir keras|mode berpikir|pikir dulu)\b/i.test(text || '');
}

function wantsResearch(text) {
  return /\b(riset mendalam|teliti sumber|investigasi|^riset\b|\briset\s+)/i.test(text || '');
}

function wantsLesson(text) {
  return /\b(belajar terpandu|ajarin langkah|langkah demi langkah)\b/i.test(text || '');
}

function domainOf(text) {
  const t = String(text || '').toLowerCase();
  if (/\b(hitung|berapa|persamaan|turunan|integral|persen|angka)\b/.test(t)) return 'matematika';
  if (/\b(banding\w*|versus|vs|kelebihan|kekurangan|dibanding\w*)\b/.test(t)) return 'perbandingan';
  if (/\b(kode|bug|javascript|python|algoritma|fungsi|error|skrip)\b/.test(t)) return 'koding';
  return 'konsep';
}

function focusOf(text) {
  const words = String(text || '').split(/\s+/).filter((word) => word.length > 3).slice(0, 5);
  return words.join(', ') || String(text || 'pertanyaan').slice(0, 80);
}

function generateCoT(query, domain) {
  const q = String(query || '').replace(/\b(pikirkan|berpikir keras|mode berpikir|pikir dulu)\b/gi, '').trim() || 'pertanyaan';
  const kind = domain || domainOf(q);
  const focus = focusOf(q);
  if (kind === 'matematika') {
    return [
      'Proses berpikir',
      '1. Besaran yang disebut: ' + focus + '.',
      '2. Rumus dipilih dari besaran itu, lalu satuan dicek sebelum dihitung.',
      '3. Hitung langkah demi langkah hanya dengan angka yang ada di pertanyaan.',
      '4. Cek batas hasil: nol, negatif, dan satuan tidak boleh tertukar.',
    ].join('\n');
  }
  if (kind === 'perbandingan') {
    return [
      'Proses berpikir',
      '1. Dua sisi yang dibandingkan diambil dari: ' + focus + '.',
      '2. Parameter yang sama dipakai untuk keduanya, bukan daftar pujian terpisah.',
      '3. Kelebihan dan kekurangan ditulis berdampingan.',
      '4. Kesimpulan menyebut kapan sisi yang satu lebih cocok daripada yang lain.',
    ].join('\n');
  }
  if (kind === 'koding') {
    return [
      'Proses berpikir',
      '1. Masukan dan keluaran yang diminta: ' + focus + '.',
      '2. Algoritma disusun dari kasus normal, lalu kasus kosong dan kasus salah.',
      '3. Kompleksitas disebut hanya jika jumlah data di pertanyaan mempengaruhinya.',
      '4. Galat yang mungkin: masukan kosong, tipe salah, dan batas angka.',
    ].join('\n');
  }
  return [
    'Proses berpikir',
    '1. Istilah inti dari pertanyaan: ' + focus + '.',
    '2. Definisi dibatasi dulu supaya jawaban tidak melebar.',
    '3. Premis yang dipakai harus muncul di pertanyaan atau di fakta yang sudah ada.',
    '4. Jawaban disusun dari definisi itu, lalu contoh yang masih tentang "' + q.slice(0, 80) + '".',
  ].join('\n');
}

function thinkBlock(topic) {
  return generateCoT(topic, domainOf(topic));
}

function researchPlan(topic) {
  const t = String(topic || '').replace(/^riset\s+(mendalam\s+)?/i, '').trim() || 'topik';
  const branches = queryTree(t);
  return [
    'Pohon kueri',
    ...branches.map((line, index) => (index + 1) + '. ' + line),
    'Berkas riset',
    'Abstrak, tabel pembanding, analisis, dan daftar sumber. Tandai klaim yang belum punya sumber.',
  ].join('\n');
}

function lesson(text, title) {
  const bits = sentences(text).slice(0, 4);
  if (!bits.length) return 'Belum ada bahan. Tanya dulu atau nyalakan web, baru tap Belajar.';
  const lines = ['Belajar terpandu' + (title ? ' — ' + title : ''), ''];
  bits.forEach((s, i) => {
    lines.push('Langkah ' + (i + 1));
    lines.push(s);
    lines.push('');
  });
  lines.push('Ulangi langkah yang belum hafal. Tanya bagian yang masih gelap.');
  return lines.join('\n');
}

export const flowHub = Object.freeze({
  cleanLeak,
  threePoints,
  queries,
  wantsCollection,
  wantsThink,
  wantsResearch,
  wantsLesson,
  thinkBlock,
  researchPlan,
  lesson,
  buildResearch,
});

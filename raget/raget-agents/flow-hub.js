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

function thinkBlock(topic) {
  const t = String(topic || '').replace(/\b(pikirkan|berpikir keras|mode berpikir|pikir dulu)\b/gi, '').trim();
  return [
    'Proses berpikir',
    '1. Baca pertanyaan: ' + (t || 'pertanyaan pengguna'),
    '2. Ambil fakta yang sudah ada di Raget.',
    '3. Susun jawaban berurutan.',
    '4. Baru buka web jika saklar riset/web nyala.',
  ].join('\n');
}

function researchPlan(topic) {
  const t = String(topic || '').replace(/^riset\s+(mendalam\s+)?/i, '').trim() || 'topik';
  const qs = queries(t);
  return [
    'Langkah riset: ' + t,
    '1. Cari halaman utama.',
    '2. Ambil 1–2 sumber terkait: ' + qs.slice(1, 3).join(' · '),
    '3. Gabungkan jadi satu jawaban.',
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
});

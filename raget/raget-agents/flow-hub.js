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
    .filter((s) => s.length > 20 && !/^yang biasa dibahas/i.test(s) && !/^hasil pencarian web/i.test(s));
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
  return /\b(pikirkan|berpikir keras|mode berpikir)\b/i.test(text || '');
}

function wantsResearch(text) {
  return /\b(riset mendalam|teliti sumber|investigasi)\b/i.test(text || '');
}

function thinkBlock(topic) {
  const t = String(topic || '').replace(/\b(pikirkan|berpikir keras|mode berpikir)\b/gi, '').trim();
  return [
    'Proses berpikir',
    '1. Topik: ' + (t || 'pertanyaan pengguna'),
    '2. Cek fakta lokal dulu, baru web jika perlu.',
    '3. Jangan campur sapaan dengan ensiklopedia.',
    '4. Sitasi hanya jika ada sumber web.',
  ].join('\n');
}

function researchPlan(topic) {
  const t = String(topic || '').replace(/^riset\s+(mendalam\s+)?/i, '').trim() || 'topik';
  const q = queries(t);
  return [
    'Rencana riset: ' + t,
    '1. Tentukan pertanyaan inti.',
    '2. Cari: ' + q.join(' · '),
    '3. Bandingkan sumber, buang nav/iklan.',
    '4. Susun temuan + kesimpulan.',
    '',
    'Nyalakan Pencarian Web lalu kirim topiknya agar langkah 2 jalan di mesin yang sama.',
  ].join('\n');
}

export const flowHub = Object.freeze({
  cleanLeak,
  threePoints,
  queries,
  wantsCollection,
  wantsThink,
  wantsResearch,
  thinkBlock,
  researchPlan,
});

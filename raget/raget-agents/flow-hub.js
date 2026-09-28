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
  const t = String(topic || '').replace(/^googling\s+/i, '').trim();
  if (!t) return [];
  return [t, t + ' pengertian', t + ' Indonesia'].slice(0, 3);
}

function wantsCollection(text) {
  const t = String(text || '').toLowerCase();
  return /\b(dari koleksi|di koleksi|yang saya simpan|tanya koleksi|apa yang saya simpan)\b/.test(t);
}

export const flowHub = Object.freeze({
  cleanLeak,
  threePoints,
  queries,
  wantsCollection,
});

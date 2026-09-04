const STOP = {
  yang: 1, dan: 1, atau: 1, dengan: 1, dari: 1, untuk: 1, pada: 1, ini: 1, itu: 1,
  ada: 1, adalah: 1, akan: 1, sudah: 1, tidak: 1, juga: 1, sebagai: 1, kepada: 1,
  oleh: 1, di: 1, ke: 1, dalam: 1, karena: 1, jika: 1, saat: 1, para: 1, lebih: 1,
  sangat: 1, the: 1, and: 1, for: 1, with: 1, from: 1, that: 1, this: 1, are: 1,
  was: 1, of: 1, to: 1, in: 1, is: 1, it: 1, on: 1, as: 1, at: 1, by: 1, an: 1,
  be: 1, or: 1, not: 1, but: 1, can: 1, has: 1, have: 1, had: 1, bisa: 1,
  dapat: 1, harus: 1, kita: 1, kamu: 1, mereka: 1, saya: 1, anda: 1, dia: 1
};

function tokenisasi(teks) {
  return String(teks || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s]/g, ' ')
    .split(/\s+/)
    .filter(function (w) { return w.length > 2 && !STOP[w]; });
}

function tfMap(tokens) {
  const m = {};
  tokens.forEach(function (t) { m[t] = (m[t] || 0) + 1; });
  return m;
}

function skorBm25(queryTokens, docTokens, avgDl, N, df) {
  const k1 = 1.4;
  const b = 0.75;
  const tf = tfMap(docTokens);
  const dl = docTokens.length || 1;
  let score = 0;
  const seen = {};
  queryTokens.forEach(function (q) {
    if (seen[q]) return;
    seen[q] = 1;
    const f = tf[q] || 0;
    if (!f) return;
    const n = df[q] || 1;
    const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
    const denom = f + k1 * (1 - b + b * (dl / (avgDl || 1)));
    score += idf * ((f * (k1 + 1)) / denom);
  });
  return score;
}

export function retrieve(chunks, query, k) {
  const list = chunks || [];
  if (!list.length) return [];
  const topK = Math.max(1, k || 6);
  const qTokens = tokenisasi(query);
  if (!qTokens.length) {
    return list.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }).slice(0, topK);
  }

  const docs = list.map(function (c) {
    return { chunk: c, tokens: tokenisasi(c.text) };
  });
  const N = docs.length;
  let totalLen = 0;
  const df = {};
  docs.forEach(function (d) {
    totalLen += d.tokens.length;
    const uniq = {};
    d.tokens.forEach(function (t) {
      if (uniq[t]) return;
      uniq[t] = 1;
      df[t] = (df[t] || 0) + 1;
    });
  });
  const avgDl = totalLen / N;

  const scored = docs.map(function (d) {
    return {
      chunk: d.chunk,
      score: skorBm25(qTokens, d.tokens, avgDl, N, df)
    };
  });
  scored.sort(function (a, b) { return b.score - a.score; });

  const hits = scored.filter(function (s) { return s.score > 0; }).slice(0, topK);
  if (hits.length) return hits.map(function (s) { return s.chunk; });

  return list.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }).slice(0, topK);
}

export function retrieveSequential(chunks, start, count) {
  const sorted = (chunks || []).slice().sort(function (a, b) {
    return (a.order || 0) - (b.order || 0);
  });
  const from = Math.max(0, start || 0);
  const n = Math.max(1, count || 6);
  return sorted.slice(from, from + n);
}

export function ringkasChunks(chunks, maxKalimat) {
  const limit = maxKalimat || 6;
  const texts = (chunks || []).map(function (c) { return String(c.text || '').trim(); }).filter(Boolean);
  if (!texts.length) return [];
  const gabung = texts.join(' ');
  const aman = gabung.replace(/([0-9])[.]([0-9]{3})/g, '$1\u0001$2');
  const sents = (aman.match(/[^.!?]+[.!?]*/g) || [gabung])
    .map(function (s) { return s.split('\u0001').join('.').trim(); })
    .filter(function (s) { return s.length > 20; });
  if (sents.length <= limit) return sents;
  const step = Math.max(1, Math.floor(sents.length / limit));
  const out = [];
  for (let i = 0; i < sents.length && out.length < limit; i += step) {
    out.push(sents[i]);
  }
  if (out[out.length - 1] !== sents[sents.length - 1]) {
    out[out.length - 1] = sents[sents.length - 1];
  }
  return out;
}

export function buatFaq(chunks, n) {
  const limit = n || 3;
  const sents = ringkasChunks(chunks, 12);
  const templates = [
    function (s) {
      const keys = tokenisasi(s).filter(function (w) { return w.length >= 4; })
        .sort(function (a, b) { return b.length - a.length; });
      if (keys.length) return 'Apa poin penting tentang ' + keys[0] + '?';
      return 'Apa poin utama materi ini?';
    },
    function () { return 'Mengapa materi ini relevan untuk dipraktikkan?'; },
    function () { return 'Satu langkah konkret apa yang bisa dilakukan setelah ini?'; },
    function () { return 'Bagaimana menjelaskan inti ini dalam satu kalimat?'; }
  ];
  const faqs = [];
  for (let i = 0; i < limit; i++) {
    const s = sents[i] || sents[0] || '';
    const q = templates[i % templates.length](s);
    const a = s || 'Fokus pada satu ide utama dan praktikkan.';
    faqs.push({ q: q, a: a });
  }
  return faqs;
}

export const retriever = {
  retrieve: retrieve,
  retrieveSequential: retrieveSequential,
  ringkasChunks: ringkasChunks,
  buatFaq: buatFaq
};

const TARGET_CHARS = 280;
const MAX_CHARS = 420;
const MIN_CHARS = 60;

function pecahKalimat(teks) {
  const t = String(teks || '').replace(/\s+/g, ' ').trim();
  if (!t) return [];
  const aman = t.replace(/([0-9])[.]([0-9]{3})/g, '$1\u0001$2');
  return (aman.match(/[^.!?]+[.!?]*/g) || [aman])
    .map(function (s) { return s.split('\u0001').join('.').trim(); })
    .filter(function (s) { return s.length > 2; });
}

function pecahParagraf(teks) {
  const raw = String(teks || '').replace(/\r\n/g, '\n').trim();
  if (!raw) return [];
  const parts = raw.split(/\n{2,}/).map(function (p) { return p.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
  if (parts.length > 1) return parts;
  return [raw.replace(/\s+/g, ' ').trim()];
}

function gabung(kalimatList, target, max) {
  const out = [];
  let buf = '';
  for (let i = 0; i < kalimatList.length; i++) {
    const s = kalimatList[i];
    if (!buf) {
      buf = s;
      continue;
    }
    if ((buf + ' ' + s).length <= target) {
      buf = buf + ' ' + s;
      continue;
    }
    if ((buf + ' ' + s).length <= max && i === kalimatList.length - 1) {
      buf = buf + ' ' + s;
      continue;
    }
    out.push(buf);
    buf = s;
  }
  if (buf) out.push(buf);
  return out;
}

function rapikanSisa(chunks) {
  if (chunks.length < 2) return chunks;
  const last = chunks[chunks.length - 1];
  if (last.length >= MIN_CHARS) return chunks;
  const prev = chunks[chunks.length - 2];
  if ((prev + ' ' + last).length <= MAX_CHARS * 1.25) {
    chunks[chunks.length - 2] = prev + ' ' + last;
    chunks.pop();
  }
  return chunks;
}

export function buatChunk(teks, opsi) {
  const target = (opsi && opsi.target) || TARGET_CHARS;
  const max = (opsi && opsi.max) || MAX_CHARS;
  const paragraf = pecahParagraf(teks);
  let potongan = [];

  paragraf.forEach(function (p) {
    if (p.length <= max) {
      potongan.push(p);
      return;
    }
    const kalimat = pecahKalimat(p);
    if (kalimat.length <= 1) {
      const hard = p.match(new RegExp('.{1,' + target + '}(\\s|$)', 'g')) || [p];
      hard.forEach(function (h) {
        const t = h.trim();
        if (t) potongan.push(t);
      });
      return;
    }
    potongan = potongan.concat(gabung(kalimat, target, max));
  });

  potongan = rapikanSisa(potongan.filter(Boolean));

  return potongan.map(function (text, order) {
    const words = text.split(/\s+/).filter(Boolean).length;
    return {
      id: 'c' + order,
      order: order,
      text: text,
      words: words
    };
  });
}

export function batchChunk(chunks, start, count) {
  if (!chunks || !chunks.length) return [];
  const from = Math.max(0, start || 0);
  const n = Math.max(1, count || 6);
  return chunks.slice(from, from + n);
}

export function progresChunk(pos, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((pos / total) * 100));
}

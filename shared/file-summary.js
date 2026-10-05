function splitSentences(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

export function summarizeFileText(text, filename) {
  const clean = String(text || '').trim();
  const name = filename || 'file ini';
  if (!clean) {
    return 'Sudah saya coba baca "' + name + '", tapi isinya kosong atau tidak berupa teks yang bisa diambil (kemungkinan hasil scan/gambar tanpa lapisan teks).';
  }
  const sentences = splitSentences(clean);
  const preview = sentences.slice(0, 5).join(' ');
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  return 'Isi "' + name + '" (' + wordCount.toLocaleString('id-ID') + ' kata):\n\n' +
    preview + (sentences.length > 5 ? ' [...]' : '') +
    '\n\nMau saya jelaskan bagian tertentu, atau ringkas lebih pendek lagi?';
}

export function answerFromFile(text, query, filename) {
  const clean = String(text || '').trim();
  const name = filename || 'file ini';
  const q = String(query || '').toLowerCase().replace(/[?.!,]/g, ' ').trim();
  if (!clean) {
    return summarizeFileText(clean, name);
  }
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return summarizeFileText(clean, name);
  const sentences = splitSentences(clean);
  const scored = sentences.map((s) => {
    const low = s.toLowerCase();
    let n = 0;
    words.forEach((w) => {
      if (low.includes(w)) n += 1;
    });
    return { s, n };
  }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  if (!scored.length) {
    return 'Di "' + name + '" tidak ketemu bagian yang nyambung dengan "' + query + '". Coba kata kunci lain, atau minta "ringkas file ini".';
  }
  const pick = scored.slice(0, 3).map((x) => {
    const at = clean.indexOf(x.s);
    const page = at < 0 ? 0 : Math.floor(at / 1800) + 1;
    return page > 1 || clean.length > 1800 ? x.s + ' (hlm. ' + page + ')' : x.s;
  });
  return 'Dari "' + name + '":\n\n' + pick.join(' ');
}

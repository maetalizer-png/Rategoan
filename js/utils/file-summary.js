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

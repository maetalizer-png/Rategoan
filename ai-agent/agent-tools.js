const SAFE_EXPR = /^[0-9+\-*/().\s]+$/;

function ringkas(text) {
  const src = String(text || '').trim();
  if (!src) return 'Tidak ada teks untuk diringkas.';
  const sentences = src.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) return 'Ringkasan: ' + src;
  const head = sentences[0];
  const tail = sentences[sentences.length - 1];
  return 'Ringkasan: ' + head + (tail !== head ? ' ... ' + tail : '');
}

function hitung(expr) {
  const src = String(expr || '').trim();
  if (!src || !SAFE_EXPR.test(src)) return 'Ekspresi tidak valid. Gunakan angka dan operator +, -, *, / saja.';
  try {
    const result = Function('"use strict"; return (' + src + ')')();
    if (typeof result !== 'number' || !isFinite(result)) return 'Hasil tidak valid.';
    return src.trim() + ' = ' + result;
  } catch (e) {
    return 'Tidak bisa menghitung ekspresi itu.';
  }
}

function tanggal() {
  const now = new Date();
  return (
    now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    ', ' +
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}

export const agentTools = Object.freeze({
  ringkas,
  hitung,
  tanggal,
});

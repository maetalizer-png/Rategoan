function focus(query) {
  return String(query || '').replace(/\s+/g, ' ').trim().split(' ').slice(0, 10).join(' ');
}

export function planSubgoals(query) {
  const topic = focus(query);
  const q = String(query || '');
  const steps = [];
  if (/\b(cari|telusuri|inflasi|berita|terbaru|web|riset)\b/i.test(q)) {
    steps.push({ kind: 'EMIT_EXPLORE', text: 'Menelusuri sumber untuk ' + topic });
  }
  if (/\b(rangkum|analisis|analisa|naskah|draf|bandingkan)\b/i.test(q)) {
    steps.push({ kind: 'EMIT_THOUGHT', text: 'Menyusun analisis: ' + topic });
  }
  if (/\b(slide|presentasi|pptx)\b/i.test(q)) {
    steps.push({ kind: 'EMIT_ACTION', text: 'Menyusun berkas slide untuk ' + topic });
  }
  if (/\b(excel|xlsx|rekap|anggaran|pembukuan|kas)\b/i.test(q)) {
    steps.push({ kind: 'EMIT_ACTION', text: 'Menyusun lembar hitung untuk ' + topic });
  }
  if (/\b(struk|nota|kuitansi|invoice)\b/i.test(q)) {
    steps.push({ kind: 'EMIT_ACTION', text: 'Membaca rincian dari ' + topic });
  }
  if (steps.length < 2 && /\b(lalu|kemudian|setelah itu)\b/i.test(q) && topic) {
    const parts = q.split(/\b(?:lalu|kemudian|setelah itu)\b/i).map((part) => focus(part)).filter(Boolean);
    parts.slice(0, 3).forEach((part) => steps.push({ kind: 'EMIT_THOUGHT', text: 'Tahap: ' + part }));
  }
  return steps;
}

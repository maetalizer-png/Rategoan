self.onmessage = (event) => {
  const data = event.data || {};
  if (data.type === 'abort') return;
  const text = String(data.text || '').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean);
  const steps = [
    { kind: 'EMIT_THOUGHT', text: 'Dekonstruksi semantik & ruang masalah: ' + (words.slice(0, 12).join(' ') || 'instruksi') },
    { kind: 'EMIT_EXPLORE', text: 'Memetakan ' + words.length + ' token konteks & batasan implisit di utas latar.' },
  ];
  if (data.think) {
    steps.push({ kind: 'EMIT_COMMAND', text: 'Penalaran Mode Tinggi: formulasi hipotesis & evaluasi multi-perspektif.' });
    steps.push({ kind: 'EMIT_EXPLORE', text: 'Propagasi tensor 28 lapis penuh Raget 1.0 (GQA 16:4 · Top-K/Top-P adaptif).' });
  }
  if (data.research) steps.push({ kind: 'EMIT_EXPLORE', text: 'Riset mendalam: korelasi silang multi-sumber & validasi fakta.' });
  if (data.files) steps.push({ kind: 'EMIT_ACTION', text: 'Ekstraksi struktural & verifikasi lampiran: ' + data.files });
  steps.push({ kind: 'EMIT_STATUS', text: 'Sintesis penalaran komprehensif siap dieksekusi.', progress: 1 });
  let index = 0;
  const delayMs = data.think ? 240 : 140;
  const tick = () => {
    if (index >= steps.length) {
      self.postMessage({ kind: 'FINAL_RESPONSE', words: words.length });
      return;
    }
    self.postMessage(steps[index]);
    index += 1;
    setTimeout(tick, delayMs);
  };
  tick();
};

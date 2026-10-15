self.onmessage = (event) => {
  const data = event.data || {};
  if (data.type === 'abort') return;
  const text = String(data.text || '').replace(/\s+/g, ' ').trim();
  const isGenericAttach = !text || /^baca dan ringkas lampiran ini$/i.test(text);
  const shortFocus = isGenericAttach
    ? (data.files ? String(data.files) : 'lampiran')
    : (text.length > 42 ? text.slice(0, 42) + '…' : text);

  const steps = [];
  if (data.files) {
    steps.push({ kind: 'EMIT_ACTION', text: 'Memindai berkas lampiran: ' + data.files });
    steps.push({ kind: 'EMIT_EXPLORE', text: 'Mengekstrak isi & metadata dari ' + data.files });
  } else {
    steps.push({ kind: 'EMIT_THOUGHT', text: 'Menganalisis permintaan: "' + shortFocus + '"' });
  }
  if (data.research) {
    steps.push({ kind: 'EMIT_EXPLORE', text: 'Menelusuri multi-sumber web & memvalidasi rujukan untuk ' + shortFocus });
  }
  if (data.think) {
    steps.push({ kind: 'EMIT_COMMAND', text: 'Menjalankan penalaran mendalam Raget 1.0 (28 lapis transformer)' });
  }
  steps.push({ kind: 'EMIT_STATUS', text: 'Menyusun jawaban untuk ' + shortFocus, progress: 1 });

  let index = 0;
  const delayMs = data.think ? 90 : 50;
  const tick = () => {
    if (index >= steps.length) {
      self.postMessage({ kind: 'FINAL_RESPONSE', words: text.split(' ').filter(Boolean).length });
      return;
    }
    self.postMessage(steps[index]);
    index += 1;
    setTimeout(tick, delayMs);
  };
  tick();
};

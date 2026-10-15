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
    steps.push({ kind: 'EMIT_ACTION', text: 'Membuka & membaca berkas: ' + data.files });
    steps.push({ kind: 'EMIT_EXPLORE', text: 'Membedah isi & mengekstrak bagian penting dari ' + data.files });
  } else {
    steps.push({ kind: 'EMIT_THOUGHT', text: 'Membedah permintaan: "' + shortFocus + '"' });
  }
  if (data.research) {
    steps.push({ kind: 'EMIT_EXPLORE', text: 'Menelusuri sumber web & membandingkan temuan untuk "' + shortFocus + '"' });
  }
  if (data.think) {
    steps.push({ kind: 'EMIT_COMMAND', text: 'Menyusun alur pembahasan & memeriksa kelengkapan jawaban' });
  }
  steps.push({ kind: 'EMIT_STATUS', text: 'Menyusun hasil akhir untuk "' + shortFocus + '"', progress: 1 });

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

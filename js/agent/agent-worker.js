self.onmessage = (event) => {
  const data = event.data || {};
  if (data.type === 'abort') return;
  const text = String(data.text || '').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean);
  const steps = [
    { kind: 'EMIT_THOUGHT', text: 'Membaca permintaan: ' + (words.slice(0, 12).join(' ') || 'kosong') },
    { kind: 'EMIT_EXPLORE', text: 'Memindai ' + words.length + ' kata di utas latar.' },
  ];
  if (data.think) steps.push({ kind: 'EMIT_COMMAND', text: 'Mode berpikir keras: susun langkah sebelum menjawab.' });
  if (data.research) steps.push({ kind: 'EMIT_EXPLORE', text: 'Riset mendalam: siapkan beberapa kueri.' });
  if (data.files) steps.push({ kind: 'EMIT_ACTION', text: 'Berkas terlampir: ' + data.files });
  steps.push({ kind: 'EMIT_STATUS', text: 'Rencana siap.', progress: 1 });
  let index = 0;
  const tick = () => {
    if (index >= steps.length) {
      self.postMessage({ kind: 'FINAL_RESPONSE', words: words.length });
      return;
    }
    self.postMessage(steps[index]);
    index += 1;
    setTimeout(tick, 160);
  };
  tick();
};

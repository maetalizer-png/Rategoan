// Observer - membedakan status hasil satu tool call. Hasil kosong/invalid
// TIDAK PERNAH dianggap sukses (spec §OBSERVER).
const INSUFFICIENT_RE = /tidak\s+(tahu|yakin)|belum\s+punya\s+(jawaban|informasi)|maaf,?\s+saya\s+(tidak|belum)|ekspresi\s+tidak\s+valid/i;

function observe(step, callResult) {
  if (!callResult) return { stepId: step.id, status: 'tool_error', detail: 'tidak ada respons dari tool' };
  if (!callResult.ok) {
    const status = /timeout/i.test(callResult.error || '') ? 'timeout' : 'tool_error';
    return { stepId: step.id, status, detail: callResult.error || 'gagal tanpa keterangan' };
  }
  const out = callResult.output;
  const text = out && typeof out.text === 'string' ? out.text.trim() : '';
  if (!text) return { stepId: step.id, status: 'empty_result', detail: '' };
  if (INSUFFICIENT_RE.test(text)) return { stepId: step.id, status: 'insufficient_information', detail: text };
  return { stepId: step.id, status: 'success', detail: text };
}

export const agenticObserver = Object.freeze({ observe });

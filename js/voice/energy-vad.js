export function rmsEnergy(samples) {
  const src = samples || [];
  if (!src.length) return 0;
  let sum = 0;
  for (let i = 0; i < src.length; i += 1) sum += src[i] * src[i];
  return Math.sqrt(sum / src.length);
}

export function voiceActive(samples, threshold) {
  const gate = threshold == null ? 0.02 : Number(threshold);
  return rmsEnergy(samples) >= gate;
}

export const VAD_WORKLET_SOURCE = ''
  + 'class EnergyVad extends AudioWorkletProcessor {'
  + 'process(inputs) {'
  + 'const ch = inputs[0] && inputs[0][0];'
  + 'if (!ch || !ch.length) return true;'
  + 'let sum = 0;'
  + 'for (let i = 0; i < ch.length; i += 1) sum += ch[i] * ch[i];'
  + 'const rms = Math.sqrt(sum / ch.length);'
  + 'if (rms >= 0.02) this.port.postMessage({ rms: rms, voice: true });'
  + 'return true;'
  + '}'
  + '}'
  + 'registerProcessor("energy-vad", EnergyVad);';

export async function mountEnergyVad(audioContext) {
  if (!audioContext || !audioContext.audioWorklet || typeof audioContext.audioWorklet.addModule !== 'function') {
    return { ok: false, reason: 'worklet' };
  }
  const blob = new Blob([VAD_WORKLET_SOURCE], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  try {
    await audioContext.audioWorklet.addModule(url);
    const Node = globalThis.AudioWorkletNode;
    if (typeof Node !== 'function') return { ok: false, reason: 'worklet' };
    const node = new Node(audioContext, 'energy-vad');
    return { ok: true, node, reason: '' };
  } catch (error) {
    return { ok: false, reason: error && error.message ? String(error.message) : 'worklet' };
  } finally {
    URL.revokeObjectURL(url);
  }
}

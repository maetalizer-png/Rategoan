export const VOICE_CACHE = 'rategoan-voice-cache';
export const VOICE_WATCH_MS = 150;

export function melBins(frame, bins) {
  const width = bins || 80;
  const src = frame || new Float32Array(0);
  const out = new Float32Array(width);
  if (!src.length) return out;
  const span = src.length / width;
  for (let i = 0; i < width; i += 1) {
    const start = Math.floor(i * span);
    const end = Math.max(start + 1, Math.min(src.length, Math.floor((i + 1) * span)));
    let acc = 0;
    for (let j = start; j < end; j += 1) acc += src[j] * src[j];
    out[i] = Math.log1p(acc / (end - start));
  }
  return out;
}

export function bargeIn(energy, threshold) {
  return Number(energy) > (threshold == null ? 0.02 : threshold);
}

export function voiceRoute(hasWebgpu) {
  return {
    engine: hasWebgpu ? 'whisper-webgpu' : 'web-speech',
    weights: false,
    cache: VOICE_CACHE,
    experimental: true,
    fallback: 'web-speech',
  };
}

export function createVoicePipeline() {
  let live = false;
  return {
    budgetMs: 300,
    engines: {
      stt: 'whisper-webgpu',
      tts: 'kokoro-wasm',
      weights: false,
      external: false,
      socket: 'Maetalizer19/rategoan-neural',
      cache: VOICE_CACHE,
      experimental: true,
      fallback: 'web-speech',
    },
    start() { live = true; return performance.now(); },
    barge() { live = false; },
    step() {
      const t0 = performance.now();
      const ms = performance.now() - t0;
      if (!live) return { barged: true, ms, budget: 300 };
      return { barged: false, ms, budget: 300 };
    },
  };
}
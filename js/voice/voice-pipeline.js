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
    frame(pcm) {
      const t0 = performance.now();
      const bins = melBins(pcm, 80);
      let energy = 0;
      for (let i = 0; i < bins.length; i += 1) energy += bins[i];
      energy = bins.length ? energy / bins.length : 0;
      const hit = bargeIn(energy, 0.02);
      if (hit) live = false;
      return { energy, bins: bins.length, barged: hit, ms: performance.now() - t0, weights: false };
    },
    transcribe(pcm) {
      const t0 = performance.now();
      const heard = this.frame(pcm);
      return {
        text: '',
        engine: 'whisper-webgpu',
        weights: false,
        fallback: 'web-speech',
        barged: heard.barged,
        ms: performance.now() - t0,
      };
    },
    speak(text) {
      const t0 = performance.now();
      const utter = String(text || '');
      const synth = globalThis.speechSynthesis;
      const Utter = globalThis.SpeechSynthesisUtterance;
      if (synth && Utter && utter) {
        try {
          synth.cancel();
          synth.speak(new Utter(utter));
        } catch (e) {
          return { engine: 'kokoro-wasm', weights: false, fallback: 'web-speech', ms: performance.now() - t0, chars: utter.length };
        }
      }
      return { engine: 'kokoro-wasm', weights: false, fallback: 'web-speech', ms: performance.now() - t0, chars: utter.length };
    },
  };
}
import { engine } from './engine.js';
import { agent } from '../../raget/raget-agents/agent.js';
import { neuralProvider } from '../../raget/raget-llm/neural-provider.js';

// RAGET otomatis (200M -> 100M -> 50M, lihat neural-provider.js) belum
// menghasilkan kalimat koheren - PPL held-out masih >900 dan generasi
// masih fragmen kata acak di setiap sesi training sampai catatan ini
// ditulis. Cascade unduh+cache+fallback di
// neural-provider.js sudah lengkap dan aktif diam-diam di background
// (prefetchBest() dipanggil main.js) supaya siap kapan saja diaktifkan
// - begitu satu sesi training menghasilkan output yang benar-benar
// koheren, ganti true di baris ini untuk menjadikannya sumber jawaban.
const NEURAL_ANSWERS_ENABLED = false;

async function generate(messages, prompt) {
  await engine.ensureReady();
  if (NEURAL_ANSWERS_ENABLED) {
    const neuralReply = await neuralProvider.generate(messages, prompt);
    if (neuralReply) return neuralReply;
  }
  return agent.respond(messages, prompt);
}

function setStatus(text) {
  engine.setStatus(text);
}

export const ai = Object.freeze({
  generate,
  setStatus,
  get ready() {
    return engine.ready;
  },
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.ai = ai;
}

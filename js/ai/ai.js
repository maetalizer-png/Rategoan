import { engine } from './engine.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';

// RAGET otomatis (200M -> 100M -> 50M, lihat raget-neural/neural-provider.js)
// AKTIF sejak status() di raget-neural/neural-adapter.js diubah jadi
// ready:true - keputusan produk untuk menampilkan hasil generasinya apa
// adanya, meski PPL held-out masih >900 dan output belum koheren
// gramatikal di sesi training terakhir. Pengguna memilih Raget Neural
// secara eksplisit lewat panel Model; default aplikasi tetap Template.
// NEURAL_ANSWERS_ENABLED di bawah adalah flag historis dari sebelum ada
// router+adapter - sumber kebenaran yang BENAR-BENAR dibaca sekarang
// adalah status() di neural-adapter.js (dibaca raget-agents/engine-router.js).
const NEURAL_ANSWERS_ENABLED = true;

async function generate(messages, prompt) {
  await engine.ensureReady();
  const result = await engineRouter.ask(prompt, {
    messages,
    // informasional saja - lihat komentar di atas soal siapa yang benar-benar mengontrol
    neuralAnswersEnabledFlag: NEURAL_ANSWERS_ENABLED,
  });
  return result.reply;
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

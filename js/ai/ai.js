import { engine } from './engine.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';

// RAGET otomatis (200M -> 100M -> 50M, lihat raget-neural/neural-provider.js)
// belum menghasilkan kalimat koheren - PPL held-out masih >900 dan generasi
// masih fragmen kata acak di setiap sesi training sampai catatan ini ditulis.
// NEURAL_ANSWERS_ENABLED di bawah adalah kill-switch manual historis dari
// sebelum ada router+adapter; sumber kebenaran yang BENAR-BENAR dibaca
// sekarang adalah status() di raget-neural/neural-adapter.js (dibaca
// raget-agents/engine-router.js) - selama itu ready:false, router TIDAK
// PERNAH memanggil Neural apa pun nilai flag ini. Jangan nyalakan flag ini
// sampai satu sesi training menghasilkan output yang benar-benar koheren
// DAN status() neural-adapter.js ikut diubah jadi ready:true.
const NEURAL_ANSWERS_ENABLED = false;

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

// Adapter 2/3 - Neural. Bungkus neural-provider.js (cascade unduh+cache
// 200M -> 100M -> 50M) yang SUDAH ADA dan SUDAH dilatih nyata di GPU gratis
// Colab berkali-kali, tapi outputnya tetap tidak koheren secara gramatikal
// (PPL held-out masih >900 di sesi training terakhir - lihat
// raget-devlog/neural/training-report-*.json).
//
// status() SENGAJA HARUS SELALU ready:false, TIDAK PERNAH true di sini -
// ini bukan pengecekan runtime (mis. "apakah checkpoint sudah termuat"),
// tapi kunci produk yang disengaja. Jangan ubah jadi true; jangan nyalakan
// NEURAL_ANSWERS_ENABLED di js/ai/ai.js. Lihat docs/ARSITEKTUR.md bagian
// "Cara melanjutkan tiap lapis" untuk syarat sebelum ini boleh diaktifkan.
import { neuralProvider } from './neural-provider.js';

async function init() {
  // Sengaja tidak memicu unduhan checkpoint apa pun dari sini - lihat
  // status(): selama itu ready:false, router tidak akan pernah memanggil
  // ask(), jadi init() di sini murni pemenuhan bentuk kontrak.
  return false;
}

async function ask(prompt, context) {
  const messages = (context && context.messages) || [];
  const reply = await neuralProvider.generate(messages, prompt);
  if (!reply) {
    throw new Error(
      'Raget Neural: generateLocal()/generateServer() tidak menghasilkan teks (checkpoint belum termuat atau gagal dimuat).'
    );
  }
  return reply;
}

function status() {
  return {
    ready: false,
    reason:
      'Sudah dilatih nyata tapi output belum koheren gramatikal — lihat raget-devlog/neural/training-report-*.json. Dikunci non-aktif sengaja (NEURAL_ANSWERS_ENABLED di js/ai/ai.js), bukan bug.',
  };
}

export const neuralAdapter = Object.freeze({
  id: 'neural',
  label: 'Raget Neural',
  init,
  ask,
  status,
});

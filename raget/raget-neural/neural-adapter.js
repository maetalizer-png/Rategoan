// Adapter 2/2 - Neural. Bungkus neural-provider.js (cascade unduh+cache
// 200M -> 100M -> 50M) yang SUDAH ADA dan SUDAH dilatih nyata di GPU gratis
// Colab berkali-kali. Outputnya masih BELUM koheren secara gramatikal
// (PPL held-out masih >900 di sesi training terakhir - lihat
// raget-devlog/neural/training-report-*.json), tapi status() SENGAJA
// ready:true - keputusan produk untuk menampilkan hasil nyata apa
// adanya (termasuk kalau masih acak) daripada mengunci lapis ini jadi
// pajangan mati. Pengguna memilih otak ini secara eksplisit lewat panel
// Model (#model-sheet); default aplikasi tetap Raget Template.
import { neuralProvider } from './neural-provider.js';

async function init() {
  // Tidak ada resource yang perlu disiapkan di sini - generate() di
  // neural-provider.js lazy-load checkpoint (cascade 200M->100M->50M)
  // sendiri per-panggilan. init() ada supaya bentuknya konsisten dengan
  // kontrak adapter.
  return true;
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
    ready: true,
    reason:
      'Aktif — sudah dilatih nyata di GPU Colab, tapi output belum koheren gramatikal (lihat raget-devlog/neural/training-report-*.json). Ditampilkan apa adanya kalau pengguna memilih Raget Neural di panel Model, bukan disembunyikan.',
  };
}

export const neuralAdapter = Object.freeze({
  id: 'neural',
  label: 'Raget Neural',
  init,
  ask,
  status,
});

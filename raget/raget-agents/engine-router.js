// SATU KONTRAK, DUA OTAK RATEGOAN + SATU STUB TIDAK DIKEJAR (lihat
// docs/ARSITEKTUR.md untuk peta lengkap):
//
//   [ UI chat ]              <- gak pernah berubah
//         |
//   [ router ini ]           <- satu tempat aturan: siapa jawab dulu, fallback ke mana
//    +- rule-based (adapter)   -> data inti: harga, stok, FAQ -> instan & pasti benar
//    +- neural (adapter)       -> otak RATEGOAN sendiri, dilatih dari nol, ringan
//    +- LLM lokal (adapter)    -> STUB, sengaja TIDAK DIKEJAR - lihat catatan di bawah
//
// Fokus pengembangan Rategoan adalah otak MILIK SENDIRI: Template
// (rule-based, jalan hari ini) dan Neural (transformer JS dilatih dari
// nol, dikunci sampai koheren). Menyematkan model pihak ketiga (LLM Lokal
// via WebGPU/WebLLM) BUKAN arah yang dikejar - keputusan produk eksplisit,
// diperkuat bukti kegagalan hardware nyata dari eksperimen terpisah
// gawean-app (VK_ERROR_DEVICE_LOST, limit GPU buffer 512MB, model kecil
// pun gagal). Adapter llm-lokal dibiarkan sebagai stub kontrak jujur yang
// SELALU melempar/status ready:false - bukan lapis yang direncanakan aktif.
//
// Urutan prioritas: preferensi pengguna (Template/Neural, dipilih di
// #model-sheet, disimpan js/state/engine-preference.js) menentukan urutan
// Template<->Neural. llm-lokal selalu dicoba PALING TERAKHIR (bukan
// pertama) persis karena bukan arah yang dikejar - kalaupun suatu saat
// diisi, dia tidak boleh mendahului dua otak milik sendiri. Tiap adapter
// dicek status().ready dulu sebelum ask() dipanggil; kalau tidak ready
// ATAU ask() melempar Error, router jatuh ke adapter berikutnya -
// pengguna tidak pernah melihat error mentah selama Template (baseline)
// tetap ready.
//
// Hari ini praktiknya SELALU jatuh ke Template (neural belum ready, dan
// llm-lokal memang tidak dikejar) - itu benar dan diharapkan, bukan bug.
// Menghidupkan Neural nanti = ubah status() adapter itu jadi ready:true,
// BUKAN membongkar router atau kode otak lain.
import { llmLokalAdapter } from '../raget-llm-lokal/llm-lokal-adapter.js';
import { neuralAdapter } from '../raget-neural/neural-adapter.js';
import { templateAdapter } from '../raget-template/template-adapter.js';
import { enginePreference } from '../../js/state/engine-preference.js';

const ADAPTERS_BY_ID = Object.freeze({
  'llm-lokal': llmLokalAdapter,
  neural: neuralAdapter,
  template: templateAdapter,
});

function orderedAdapters() {
  const pref = enginePreference.get(); // 'template' (default) | 'neural'
  const first =
    pref === 'neural'
      ? [ADAPTERS_BY_ID.neural, ADAPTERS_BY_ID.template]
      : [ADAPTERS_BY_ID.template, ADAPTERS_BY_ID.neural];
  // llm-lokal selalu terakhir dan sengaja tidak dikejar - lihat komentar atas.
  return [...first, ADAPTERS_BY_ID['llm-lokal']];
}

async function ask(prompt, context) {
  const tried = [];
  for (const adapter of orderedAdapters()) {
    let st;
    try {
      st = adapter.status();
    } catch (e) {
      st = { ready: false, reason: 'status() melempar error: ' + (e && e.message) };
    }
    if (!st || !st.ready) {
      tried.push({ id: adapter.id, ready: false, reason: st && st.reason });
      continue;
    }
    try {
      const reply = await adapter.ask(prompt, context);
      if (reply) return { reply, engine: adapter.id, tried };
      tried.push({ id: adapter.id, ready: true, error: 'ask() mengembalikan kosong' });
    } catch (e) {
      tried.push({ id: adapter.id, ready: true, error: e && e.message });
    }
  }
  throw new Error(
    'Semua adapter otak AI gagal termasuk Raget Template - seharusnya tidak pernah terjadi. Riwayat percobaan: ' +
      JSON.stringify(tried)
  );
}

function statusAll() {
  return orderedAdapters().map((a) => {
    let st;
    try {
      st = a.status();
    } catch (e) {
      st = { ready: false, reason: 'status() melempar error: ' + (e && e.message) };
    }
    return Object.assign({ id: a.id, label: a.label }, st);
  });
}

export const engineRouter = Object.freeze({
  ask,
  statusAll,
  adapters: ADAPTERS_BY_ID,
});

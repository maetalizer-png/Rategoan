// SATU KONTRAK, TIGA OTAK HIDUP BERSAMA (lihat docs/ARSITEKTUR.md untuk
// peta lengkap):
//
//   [ UI chat ]              <- gak pernah berubah
//         |
//   [ router ini ]           <- satu tempat aturan: siapa jawab dulu, fallback ke mana
//    +- LLM lokal (adapter)    -> jawaban dalam & kreatif (kalau perangkat sanggup)
//    +- neural (adapter)       -> pola menengah, ringan, hasil latihan lama gak buang
//    +- rule-based (adapter)   -> data inti: harga, stok, FAQ -> instan & pasti benar
//
// Urutan prioritas DASAR (persis seperti diminta): llm-lokal -> neural ->
// template. Preferensi pengguna (Template/Neural, dipilih di #model-sheet,
// disimpan js/state/engine-preference.js) menukar posisi RELATIF
// neural<->template saja - llm-lokal tetap selalu dicoba pertama karena
// belum ada UI untuk memilihnya. Tiap adapter dicek status().ready dulu
// sebelum ask() dipanggil; kalau tidak ready ATAU ask() melempar Error,
// router jatuh ke adapter berikutnya - pengguna tidak pernah melihat error
// mentah selama Template (baseline) tetap ready.
//
// Hari ini praktiknya SELALU jatuh ke Template (llm-lokal dan neural belum
// ready) - itu benar dan diharapkan, bukan bug. Menghidupkan satu lapis
// nanti = ubah status() adapter itu jadi ready:true, BUKAN membongkar
// router atau kode otak lain.
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
  const rest =
    pref === 'neural'
      ? [ADAPTERS_BY_ID.neural, ADAPTERS_BY_ID.template]
      : [ADAPTERS_BY_ID.template, ADAPTERS_BY_ID.neural];
  return [ADAPTERS_BY_ID['llm-lokal'], ...rest];
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

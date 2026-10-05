// SATU KONTRAK, DUA OTAK RATEGOAN (lihat docs/ARSITEKTUR.md untuk peta
// lengkap):
//
//   [ UI chat ]              <- gak pernah berubah
//         |
//   [ router ini ]           <- satu tempat aturan: siapa jawab dulu, fallback ke mana
//    +- rule-based (adapter)   -> data inti: harga, stok, FAQ -> instan & pasti benar
//    +- neural (adapter)       -> otak RATEGOAN sendiri, dilatih dari nol, AKTIF
//
// Cuma dua otak, keduanya MILIK RATEGOAN SENDIRI - tidak ada model
// pihak ketiga yang disematkan. Preferensi pengguna (dipilih di
// #model-sheet, disimpan js/state/engine-preference.js) menentukan
// siapa dicoba duluan: Template atau Neural. Tiap adapter dicek
// status().ready dulu sebelum ask() dipanggil; kalau tidak ready ATAU
// ask() melempar Error, router jatuh ke adapter berikutnya - pengguna
// tidak pernah melihat error mentah selama Template (baseline) tetap
// ready.
//
// Neural AKTIF (status().ready: true) meski outputnya belum koheren
// secara gramatikal - pilihan produk yang sengaja: biar kelihatan
// jalan/berkembang, bukan dikunci jadi pajangan mati. Pengguna yang
// memilih "Raget Neural" di panel Model betul-betul melihat hasil
// generasinya apa adanya, termasuk kalau masih acak.
import { neuralAdapter } from '../raget-neural/neural-adapter.js';
import { templateAdapter } from '../raget-template/template-adapter.js';
import { enginePreference } from '../../js/state/engine-preference.js';
import { engineContract } from './engine-contract.js';

function registerAdapter(adapter) {
  if (!engineContract.isValidAdapter(adapter)) {
    const id = adapter && adapter.id ? adapter.id : '?';
    throw new Error('Adapter cacat kontrak: ' + id + '. Wajib ada id, label, init(), ask(), status().');
  }
  return adapter;
}

const ADAPTERS_BY_ID = Object.freeze({
  neural: registerAdapter(neuralAdapter),
  template: registerAdapter(templateAdapter),
});

function isFastQuery(prompt) {
  const t = String(prompt || '').trim();
  if (!t) return true;
  if (t.length < 80 && /^(halo|hai|hei|selamat\s+(pagi|siang|sore|malam)|terima kasih|makasih)\b/i.test(t)) return true;
  if (/^(hitung|berapa)\b/i.test(t) && t.length < 160) return true;
  if (/^[\d\s+\-*/().,=]+$/.test(t)) return true;
  return false;
}

function orderedAdapters(prompt) {
  const pref = enginePreference.get();
  if (pref === 'neural') return [ADAPTERS_BY_ID.neural, ADAPTERS_BY_ID.template];
  if (pref === 'template') return [ADAPTERS_BY_ID.template, ADAPTERS_BY_ID.neural];
  return isFastQuery(prompt)
    ? [ADAPTERS_BY_ID.template, ADAPTERS_BY_ID.neural]
    : [ADAPTERS_BY_ID.neural, ADAPTERS_BY_ID.template];
}

async function ask(prompt, context) {
  const tried = [];
  for (const adapter of orderedAdapters(prompt)) {
    if (!engineContract.isValidAdapter(adapter)) {
      tried.push({ id: (adapter && adapter.id) || '?', ready: false, reason: 'gagal isValidAdapter()' });
      continue;
    }
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
    'Semua adapter otak AI gagal termasuk Raget 1.0 Kilat - seharusnya tidak pernah terjadi. Riwayat percobaan: ' +
      JSON.stringify(tried)
  );
}

function statusAll() {
  return [ADAPTERS_BY_ID.template, ADAPTERS_BY_ID.neural].map((a) => {
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

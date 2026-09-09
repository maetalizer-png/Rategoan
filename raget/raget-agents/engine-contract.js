// Kontrak "SATU KONTRAK, TIGA OTAK HIDUP BERSAMA" (lihat docs/ARSITEKTUR.md).
// Setiap otak AI - rule-based/template yang sudah jalan, neural yang sudah
// dilatih tapi dikunci nonaktif, LLM lokal yang belum diimplementasikan, dan
// otak baru apa pun di masa depan - HARUS diekspos lewat bentuk objek yang
// SAMA PERSIS, supaya raget-agents/engine-router.js bisa mencoba salah satu
// tanpa tahu apa pun soal isinya, dan supaya menghidupkan/mematikan satu
// lapis cukup mengubah ADAPTERS di router, bukan membongkar kode otak itu
// sendiri:
//
//   {
//     id: string,        // slug stabil dipakai router & preferensi UI ('template' | 'neural' | 'llm-lokal')
//     label: string,      // nama tampil manusia ('Raget Template')
//     async init(),        // siapkan resource (mis. load checkpoint) - idempotent, aman dipanggil berkali-kali
//     async ask(prompt, context), // context = { messages, ... }; LEMPAR Error kalau gagal - JANGAN diam-diam
//                                 // mengembalikan null/teks kosong, supaya router tahu harus fallback
//     status(),            // SYNC (bukan async), minimal { ready: boolean, reason: string }
//   }
//
// Contoh minimal:
//
//   export const contohAdapter = Object.freeze({
//     id: 'contoh',
//     label: 'Contoh Adapter',
//     async init() { return true; },
//     async ask(prompt, context) { return 'balasan untuk: ' + prompt; },
//     status() { return { ready: true, reason: 'selalu siap' }; },
//   });

const REQUIRED_KEYS = ['id', 'label', 'init', 'ask', 'status'];

function isValidAdapter(adapter) {
  if (!adapter || typeof adapter !== 'object') return false;
  if (!REQUIRED_KEYS.every((k) => k in adapter)) return false;
  if (typeof adapter.id !== 'string' || !adapter.id) return false;
  if (typeof adapter.label !== 'string' || !adapter.label) return false;
  if (typeof adapter.init !== 'function') return false;
  if (typeof adapter.ask !== 'function') return false;
  if (typeof adapter.status !== 'function') return false;
  return true;
}

export const engineContract = Object.freeze({
  REQUIRED_KEYS,
  isValidAdapter,
});

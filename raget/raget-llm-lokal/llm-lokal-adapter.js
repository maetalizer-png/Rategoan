// Adapter 3/3 - LLM Lokal. Folder ini SENGAJA bernama raget-llm-lokal/ -
// beda dari raget-llm/ lama (dihapus, lihat docs/ARSITEKTUR.md) - supaya
// tidak rancu dengan mesin template/neural yang sudah pernah ada di sana.
//
// Ini STUB KONTRAK JUJUR, BUKAN percobaan integrasi WebGPU/WebLLM
// sungguhan: sandbox pengembangan ini memblokir semua CDN yang dibutuhkan
// (esm.run, cdn.jsdelivr.net, unpkg, huggingface.co - semua 403), dan
// eksperimen terpisah gawean-app sudah membuktikan jalur ini beresiko
// tinggi di hardware Android nyata (VK_ERROR_DEVICE_LOST, limit GPU buffer
// cuma 512MB, model 360M pun bisa gagal). init() dan ask() di bawah
// melempar error dengan jelas kalau dipanggil - TIDAK berpura-pura ada
// implementasi. Lihat docs/ARSITEKTUR.md bagian "LLM Lokal" sebelum
// membangun lapis ini sungguhan.
async function init() {
  throw new Error(
    'Raget LLM Lokal belum diimplementasikan - lihat docs/ARSITEKTUR.md bagian "LLM Lokal" sebelum membangun.'
  );
}

async function ask() {
  throw new Error(
    'Raget LLM Lokal belum diimplementasikan - status().ready selalu false, seharusnya router tidak pernah memanggil ask() ini.'
  );
}

function status() {
  return {
    ready: false,
    reason:
      'Belum diimplementasi. Lihat docs/ARSITEKTUR.md bagian "LLM Lokal" untuk kebutuhan riil sebelum membangun: dukungan WebGPU, ukuran unduhan model, batas VRAM perangkat — sudah ada bukti kegagalan hardware nyata di eksperimen gawean-app (VK_ERROR_DEVICE_LOST pada limit GPU 512MB).',
  };
}

export const llmLokalAdapter = Object.freeze({
  id: 'llm-lokal',
  label: 'Raget LLM Lokal',
  init,
  ask,
  status,
});

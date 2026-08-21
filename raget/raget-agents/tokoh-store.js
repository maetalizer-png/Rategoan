// Loader tipis untuk data TOKOH (nama ID+EN, lahir/wafat+negara, bidang, 3
// pencapaian, 1 kutipan, 1 trivia, relasi). Domain PERCONTOHAN migrasi skema
// data standar Ronde vNext Fase B (lihat roadmap §3): data 236 entri kini
// murni JSON di raget-data/tokoh/tokoh.json (skema {id, kategori, wilayah,
// nama, tags, teks, meta}) - file ini HANYA berisi logika query (find/
// compose/try*), nol data literal, sesuai kontrak "JSON untuk data, JS
// hanya untuk logika". Riwayat migrasi ada di raget-tools/migrate-tokoh-
// domain.mjs.
//
// CATATAN JUJUR yang tetap dipertahankan dari versi lama: target jangka
// panjang 400 entri; 236 entri (59%) yang ada terverifikasi dan bertahap
// tanpa fabrikasi - 45 dari Ronde v5, +100 dari Ronde v6 Bagian 4, +91 dari
// Ronde v7 Bagian 1. Nama-nama beririsan dengan entri ringkas di
// dataries/tokoh/*.js (dijangkau lewat trySiapaTokoh() di bridge-extras.js)
// atau tokoh terkenal berfakta mapan - bukan duplikasi, tapi PENDALAMAN.

let tokohCache = null;

async function loadTokoh() {
  if (tokohCache) return tokohCache;
  try {
    const res = await fetch(new URL('../raget-data/tokoh/tokoh.json', import.meta.url));
    const raw = res.ok ? await res.json() : [];
    tokohCache = raw.map((e) => ({
      nama: e.nama,
      namaEn: e.meta.namaEn,
      lahir: e.meta.lahir,
      wafat: e.meta.wafat,
      bidang: e.meta.bidang,
      pencapaian: e.meta.pencapaian,
      kutipan: e.meta.kutipan,
      trivia: e.meta.trivia,
      relasi: e.meta.relasi,
    }));
  } catch (e) {
    tokohCache = [];
  }
  return tokohCache;
}

function norm(s) {
  return String(s || '').toLowerCase().trim();
}

async function findTokoh(query) {
  const q = norm(query);
  if (!q) return null;
  const tokoh = await loadTokoh();
  let found = tokoh.find((t) => norm(t.nama) === q || norm(t.namaEn) === q);
  if (found) return found;
  found = tokoh.find((t) => q.includes(norm(t.nama)) || norm(t.nama).includes(q) || q.includes(norm(t.namaEn)));
  return found || null;
}

function fmtTahun(t) {
  if (t == null) return 'sekarang (masih hidup)';
  return t < 0 ? Math.abs(t) + ' SM' : String(t);
}

function composeTokoh(t) {
  const wafatStr = t.wafat == null ? 'Masih hidup hingga sekarang.' : 'Wafat tahun ' + fmtTahun(t.wafat) + '.';
  return (
    `${t.nama} (${t.bidang}) — lahir tahun ${fmtTahun(t.lahir.tahun)} di ${t.lahir.negara}. ${wafatStr}\n\n` +
    'Pencapaian utama:\n' + t.pencapaian.map((p) => '• ' + p).join('\n') + '\n\n' +
    'Kutipan: "' + t.kutipan + '"\n\n' +
    'Trivia: ' + t.trivia
  );
}

async function tryProfil(text) {
  const m = text.match(/^(siapa\s+itu|siapa|ceritakan\s+tentang|biografi(\s+dari)?)\s+(.+?)\??$/i);
  if (!m) return null;
  const t = await findTokoh(m[3]);
  if (!t) return null;
  return composeTokoh(t);
}

async function tryPencapaian(text) {
  const m = text.match(
    /^apa\s+(saja\s+)?pencapaian\s+(.+?)\??$|^prestasi\s+(.+?)\s+apa\s+saja\??$|^pencapaian\s+(.+?)\??$|^prestasi\s+(.+?)\??$/i
  );
  if (!m) return null;
  const name = m[2] || m[3] || m[4] || m[5];
  const t = await findTokoh(name);
  if (!t) return null;
  return t.nama + ' — pencapaian utama:\n' + t.pencapaian.map((p) => '• ' + p).join('\n');
}

async function tryKutipan(text) {
  const m = text.match(/^kutipan\s+(terkenal\s+)?(dari\s+)?(.+?)\??$|^quote\s+dari\s+(.+?)\??$/i);
  if (!m) return null;
  const name = m[3] || m[4];
  const t = await findTokoh(name);
  if (!t) return null;
  return t.nama + ' pernah berkata: "' + t.kutipan + '"';
}

async function tryTrivia(text) {
  const m = text.match(/^(fakta\s+unik|trivia)\s+(tentang\s+|dari\s+)?(.+?)\??$/i);
  if (!m) return null;
  const t = await findTokoh(m[3]);
  if (!t) return null;
  return 'Fakta unik tentang ' + t.nama + ': ' + t.trivia;
}

async function tryRelasi(text) {
  const m = text.match(/^siapa\s+yang\s+berhubungan\s+dengan\s+(.+?)\??$|^hubungan\s+(.+?)\s+dengan\s+siapa\??$/i);
  if (!m) return null;
  const name = m[1] || m[2];
  const t = await findTokoh(name);
  if (!t || !t.relasi.length) return null;
  return t.nama + ' berhubungan dengan: ' + t.relasi.map((r) => r.nama + ' (' + r.jenis + ')').join(', ') + '.';
}

async function tryTokoh(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return (
    (await tryPencapaian(t)) ||
    (await tryKutipan(t)) ||
    (await tryTrivia(t)) ||
    (await tryRelasi(t)) ||
    (await tryProfil(t)) ||
    null
  );
}

export const tokohStore = Object.freeze({
  findTokoh,
  composeTokoh,
  tryProfil,
  tryPencapaian,
  tryKutipan,
  tryTrivia,
  tryRelasi,
  tryTokoh,
});

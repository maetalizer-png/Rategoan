// PRD-RAGET-TEMPLATE.md Fase 2.3 - asisten validasi entri data baru. Mengecek
// entri raget-data/json/<domain>/*.json terhadap skema seragam
// {id, kategori, wilayah, nama, tags, teks, meta} (docs/DATA-STRUCTURE.md),
// DAN untuk domain sapaan/ khusus: membandingkan bucket smalltalk yang
// SEHARUSNYA dipicu teksnya (lewat SMALLTALK_TRIGGERS/JENIS_TO_KEY - tabel
// YANG SAMA PERSIS dipakai runtime llm-engine.js, diimpor langsung supaya
// tidak dobel logika) dengan meta.key/meta.jenis yang tertulis di file -
// inilah yang menutup gap nyata: preseden bug retag "Gaji belum" (entri soal
// kerja/uang sempat tertulis meta.key:"tetangga") baru ketahuan lewat
// spot-check manual, bukan otomatis. Alat ini TIDAK mengubah file apa pun -
// cuma melaporkan, keputusan retag tetap manual.
//
// Cara pakai:
//   node raget/raget-tools/validate-entry.mjs <file.json> [file2.json ...]
//   node raget/raget-tools/validate-entry.mjs raget/raget-data/json/sapaan/**/*.json
// Exit code: 0 kalau tidak ada ERROR skema (mismatch bucket cuma WARNING,
// bukan exit-fail, karena deteksi berbasis regex tidak selalu presisi -
// tetap butuh keputusan manusia).

import { readFileSync } from 'fs';
import { globSync } from 'fs';
import { llmEngine } from '../raget-template/llm-engine.js';

const REQUIRED_FIELDS = ['id', 'kategori', 'wilayah', 'nama', 'tags', 'teks', 'meta'];

function validateSchema(entry, index, filePath) {
  const errors = [];
  const prefix = `${filePath}[${index}]`;
  REQUIRED_FIELDS.forEach((f) => {
    if (!(f in entry)) errors.push(`${prefix}: field wajib "${f}" tidak ada`);
  });
  if ('id' in entry && (typeof entry.id !== 'string' || !entry.id.trim())) {
    errors.push(`${prefix}: "id" harus string non-kosong`);
  }
  if ('teks' in entry && (typeof entry.teks !== 'string' || !entry.teks.trim())) {
    errors.push(`${prefix}: "teks" harus string non-kosong`);
  }
  if ('tags' in entry && !Array.isArray(entry.tags)) {
    errors.push(`${prefix}: "tags" harus array`);
  }
  if ('meta' in entry && (typeof entry.meta !== 'object' || entry.meta === null || Array.isArray(entry.meta))) {
    errors.push(`${prefix}: "meta" harus object`);
  }
  return errors;
}

// PENTING: `entry.teks` di domain sapaan adalah TEKS BALASAN Rategoan
// (dipakai sebagai templates di indexSapaan()), BUKAN kalimat yang diucapkan
// pengguna - jadi tidak bisa dites langsung ke SMALLTALK_TRIGGERS (regex itu
// dirancang untuk mencocokkan INPUT pengguna, bukan balasan). Balasan sopan
// wajar memuat kata seperti "terima kasih" walau bucket-nya bukan
// terima_kasih, jadi tes teks-vs-trigger menghasilkan banyak false-positive.
//
// Sinyal yang lebih jujur: `entry.tags` menggambarkan TOPIK entrinya secara
// eksplisit (ditulis manusia saat entri dibuat). Beberapa nama tag memang
// SAMA PERSIS dengan nama key SMALLTALK_TRIGGERS (kerja, uang, rumah,
// tetangga, sekolah, dst) - inilah pola nyata dari bug "Gaji belum" (tags
// ["kerja","uang"], salah ditulis key:"tetangga"): kalau salah satu tag
// entri PERSIS sama dengan nama key valid TAPI beda dari key yang tertulis,
// itu sinyal topik-vs-bucket tidak sinkron yang layak dicek manusia.
function checkSapaanBucket(entry, index, filePath) {
  if (!entry.meta || !Array.isArray(entry.tags)) return [];
  const declaredKey = entry.meta.key || (entry.meta.jenis && llmEngine.JENIS_TO_KEY[entry.meta.jenis]) || null;
  if (!declaredKey) return [];
  const validKeys = new Set(Object.keys(llmEngine.SMALLTALK_TRIGGERS));
  // entri boleh punya BEBERAPA tag topik sekaligus (mis. ["kerja","uang"])
  // dan bucket-nya cukup salah SATU dari tag itu - bukan bug. Yang jadi
  // sinyal nyata (pola "Gaji belum" -> "tetangga"): entri punya tag topik
  // yang dikenal (match nama key valid) TAPI declaredKey TIDAK ADA sama
  // sekali di antara tag-tag itu - berarti bucket tidak nyambung ke topik
  // manapun yang tertulis sendiri di entrinya.
  const topicTags = entry.tags.filter((t) => validKeys.has(t));
  if (topicTags.length > 0 && !topicTags.includes(declaredKey)) {
    return [
      `${filePath}[${index}] "${entry.nama || entry.id}": tags topik [${topicTags.join(', ')}] tidak ada yang cocok dengan bucket tertulis "${declaredKey}" - cek manual: "${entry.teks.slice(0, 80)}"`,
    ];
  }
  return [];
}

function main() {
  const patterns = process.argv.slice(2);
  if (!patterns.length) {
    console.error('Pakai: node raget/raget-tools/validate-entry.mjs <file.json> [...]');
    process.exit(1);
  }
  const files = patterns.flatMap((p) => (p.includes('*') ? globSync(p) : [p]));
  if (!files.length) {
    console.error('Tidak ada file cocok dengan pola:', patterns.join(' '));
    process.exit(1);
  }

  let totalEntries = 0;
  let schemaErrors = [];
  let bucketWarnings = [];
  const seenIds = new Set();
  const dupeIds = [];

  files.forEach((filePath) => {
    let data;
    try {
      data = JSON.parse(readFileSync(filePath, 'utf8'));
    } catch (e) {
      schemaErrors.push(`${filePath}: gagal parse JSON - ${e.message}`);
      return;
    }
    if (!Array.isArray(data)) {
      schemaErrors.push(`${filePath}: isi file harus array entri`);
      return;
    }
    const isSapaan = filePath.includes('/sapaan/');
    data.forEach((entry, i) => {
      totalEntries++;
      schemaErrors.push(...validateSchema(entry, i, filePath));
      if (entry.id) {
        if (seenIds.has(entry.id)) dupeIds.push(`${filePath}[${i}]: id "${entry.id}" duplikat`);
        seenIds.add(entry.id);
      }
      if (isSapaan) bucketWarnings.push(...checkSapaanBucket(entry, i, filePath));
    });
  });

  console.log('=== validate-entry: hasil ===');
  console.log(`File dicek: ${files.length} | Entri dicek: ${totalEntries}`);
  console.log(`\nERROR skema (${schemaErrors.length + dupeIds.length}):`);
  [...schemaErrors, ...dupeIds].forEach((e) => console.log('  ✗', e));
  console.log(`\nWARNING bucket sapaan (${bucketWarnings.length}) - butuh review manual, bukan otomatis diperbaiki:`);
  bucketWarnings.forEach((w) => console.log('  ⚠', w));

  const hasErrors = schemaErrors.length + dupeIds.length > 0;
  console.log(hasErrors ? '\nHASIL: ADA ERROR SKEMA' : '\nHASIL: SKEMA OK' + (bucketWarnings.length ? ' (ada warning bucket, cek manual)' : ''));
  process.exit(hasErrors ? 1 : 0);
}

main();

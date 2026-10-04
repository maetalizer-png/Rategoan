// PRD-RAGET-TEMPLATE.md Fase 2.3 + Fase 4.3 - asisten validasi entri data
// baru. Fase 2.3 (2026-09-09): mengecek entri raget-data/json/sapaan/*.json
// terhadap skema seragam {id, kategori, wilayah, nama, tags, teks, meta}
// (docs/DATA-STRUCTURE.md), DAN membandingkan bucket smalltalk yang
// SEHARUSNYA dipicu teksnya (lewat SMALLTALK_TRIGGERS/JENIS_TO_KEY - tabel
// YANG SAMA PERSIS dipakai runtime llm-engine.js, diimpor langsung supaya
// tidak dobel logika) dengan meta.key/meta.jenis yang tertulis di file -
// menutup gap nyata: preseden bug retag "Gaji belum" (entri soal kerja/uang
// sempat tertulis meta.key:"tetangga") baru ketahuan lewat spot-check
// manual, bukan otomatis.
//
// Fase 4.3: skema seragam SEKARANG dicek di SEMUA 21 domain
// raget-data/json/*/*.json (bukan cuma sapaan) - PRD Fase 2.3 baru menutup
// satu domain, gap ini yang menutupnya untuk sisanya. SATU pengecualian
// terdokumentasi: raget-data/json/pengetahuan/*.json PUNYA SKEMA BERBEDA
// by design (docs/DATA-STRUCTURE.md §"raget-data/json/pengetahuan/") -
// {q,a} / {subject,answer} / {title,text}, dipakai memoryIndex.search()
// sebagai fallback TF-IDF, BUKAN skema {id,kategori,...} dataries. Domain
// ini dapat validator TERPISAH yang lebih longgar (cuma cek ada teks
// non-kosong), bukan dipaksa ke skema yang memang bukan untuknya.
//
// Alat ini TIDAK mengubah file apa pun - cuma melaporkan, keputusan
// retag/perbaikan tetap manual.
//
// Cara pakai:
//   node raget/raget-tools/validate-entry.mjs <file.json> [file2.json ...]
//   node raget/raget-tools/validate-entry.mjs raget/raget-data/json/sapaan/**/*.json
//   node raget/raget-tools/validate-entry.mjs --all-domains   (semua 21 domain dataries, exclude pengetahuan/)
// Exit code: 0 kalau tidak ada ERROR skema (mismatch bucket cuma WARNING,
// bukan exit-fail, karena deteksi berbasis regex tidak selalu presisi -
// tetap butuh keputusan manusia).

import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { llmEngine } from '../raget-template/llm-engine.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = join(__dirname, '../raget-data/json');

const REQUIRED_FIELDS = ['id', 'kategori', 'wilayah', 'nama', 'tags', 'teks', 'meta'];
const PENGETAHUAN_TEXT_FIELDS = ['text', 'answer', 'a'];

function isPengetahuan(filePath) {
  return filePath.includes('/pengetahuan/');
}

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

// docs/DATA-STRUCTURE.md: pengetahuan/ entri berbentuk {q,a} ATAU
// {subject,answer} ATAU {title,text} - tiga bentuk sah, bukan satu skema
// tetap. Validasi longgar: entri wajib punya salah satu field teks
// (text/answer/a) berisi string non-kosong - itu satu-satunya jaminan
// yang dipakai memoryIndex.search() (retrieval TF-IDF atas field itu).
function validatePengetahuan(entry, index, filePath) {
  const prefix = `${filePath}[${index}]`;
  const hasText = PENGETAHUAN_TEXT_FIELDS.some((f) => typeof entry[f] === 'string' && entry[f].trim());
  if (!hasText) {
    return [`${prefix}: tidak ada field teks non-kosong (butuh salah satu: ${PENGETAHUAN_TEXT_FIELDS.join('/')})`];
  }
  return [];
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

function listJson(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listJson(full, out);
    else if (name.endsWith('.json')) out.push(full);
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const allDomains = args.includes('--all-domains');
  const patterns = allDomains ? [join(DATA_ROOT, '**/*.json')] : args;
  if (!patterns.length) {
    console.error('Pakai: node raget/raget-tools/validate-entry.mjs <file.json> [...] | --all-domains');
    process.exit(1);
  }
  let files = patterns.flatMap((p) => (p.includes('*') ? listJson(DATA_ROOT) : [p]));
  if (allDomains) files = files.filter((f) => !isPengetahuan(f));
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
    const pengetahuan = isPengetahuan(filePath);
    data.forEach((entry, i) => {
      totalEntries++;
      if (pengetahuan) {
        schemaErrors.push(...validatePengetahuan(entry, i, filePath));
        return;
      }
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

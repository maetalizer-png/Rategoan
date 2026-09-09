// PRD/PRD-RELEASE.md §5b - rumus rekonsiliasi token korpus. Menutup bug
// nyata yang ditemukan 2026-09-09: korpus-manifest-total.json#ringkasanTotal
// (angka "satu-satunya total yang valid", hand-typed) sempat tidak sinkron
// dengan korpus-manifest-total.json#kanonik.entries (sumber asli per-rak
// K1/K2/K3, tiap entri sudah dated dan diverifikasi SHA256 sendiri) -
// selisih 71.812.546 token karena ringkasanTotal luput dihitung ulang
// setelah batch K2/K3 2026-09-02. Skrip ini mekanis, bukan opini: kalau
// dijalankan rutin (disarankan: tiap kali entries berubah), drift seperti
// itu ketahuan SEBELUM dipakai untuk audit-corpus-tokens.mjs / roadmap
// PRD-RAGET-NEURAL.md, bukan ketahuan bertahun-tahun kemudian.
//
// RUMUS (satu-satunya sumber kebenaran untuk total token kanonik):
//   totalTokenBPEResmiKanonik = SUM( kanonik.entries[i].totalTokenBPEResmi )
//   ringkasanTotal.totalTokenKanonikTerverifikasi = totalTokenBPEResmiKanonik (WAJIB SAMA)
//   tokenKanonikPerintahClaude = totalTokenBPEResmiKanonik (WAJIB SAMA)
//   kekuranganTokenKanonik = targetGerbang - totalTokenBPEResmiKanonik
//
// Cara pakai: node raget/raget-tools/check-korpus-manifest-sync.mjs
// Exit code: 0 = sinkron. 1 = ADA DRIFT, tampilkan angka mana yang salah.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, '../raget-data/jsonl/external/korpus-manifest-total.json');

function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const entries = manifest.kanonik.entries;
  const computedTotal = entries.reduce((sum, e) => sum + e.totalTokenBPEResmi, 0);
  const computedDocs = entries.reduce((sum, e) => sum + e.totalDokumen, 0);

  const checks = [
    { label: 'kanonik.totalTokenBPEResmiKanonik', actual: manifest.kanonik.totalTokenBPEResmiKanonik, expected: computedTotal },
    { label: 'kanonik.totalDokumenKanonik', actual: manifest.kanonik.totalDokumenKanonik, expected: computedDocs },
    { label: 'ringkasanTotal.totalTokenKanonikTerverifikasi', actual: manifest.ringkasanTotal.totalTokenKanonikTerverifikasi, expected: computedTotal },
    { label: 'tokenKanonikPerintahClaude', actual: manifest.tokenKanonikPerintahClaude, expected: computedTotal },
    { label: 'kekuranganTokenKanonik', actual: manifest.kekuranganTokenKanonik, expected: manifest.targetGerbang - computedTotal },
  ];

  const mismatches = checks.filter((c) => c.actual !== c.expected);

  console.log('=== check-korpus-manifest-sync ===');
  console.log('Token dihitung ulang dari kanonik.entries:', computedTotal.toLocaleString('id-ID'));
  console.log('Dokumen dihitung ulang dari kanonik.entries:', computedDocs.toLocaleString('id-ID'));
  console.log('');

  checks.forEach((c) => {
    const ok = c.actual === c.expected;
    console.log(`  ${ok ? '✓' : '✗ DRIFT'} ${c.label}: tertulis ${c.actual.toLocaleString('id-ID')}${ok ? '' : ' (SEHARUSNYA ' + c.expected.toLocaleString('id-ID') + ')'}`);
  });

  if (mismatches.length > 0) {
    console.error(`\nHASIL: ${mismatches.length} FIELD TIDAK SINKRON dengan kanonik.entries - perbaiki manual sebelum dipakai audit/roadmap.`);
    process.exit(1);
  }
  console.log('\nHASIL: SEMUA SINKRON.');
}

main();

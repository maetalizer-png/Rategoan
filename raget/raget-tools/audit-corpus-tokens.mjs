// PRD-RAGET-NEURAL.md Fase A.1 - audit token count nyata korpus vs target
// rasio scaling (~20 token per parameter, aturan umum dari literatur scaling
// law) untuk tiap preset yang ADA (llm-config.js) dan tiap target MASA DEPAN
// (500M/1B/4B/10B/20B/40B) yang diminta roadmap. Sumber angka token: SATU-
// SATUNYA rak resmi K1/K2/K3 di korpus-manifest-total.json#kanonik
// (totalTokenBPEResmiKanonik) - dihitung dengan tokenizer BPE proyek asli
// (vocab 30.368), bukan perkiraan kata.
//
// Cara pakai: node raget/raget-tools/audit-corpus-tokens.mjs
// Keluaran: cetak ke console DAN tulis raget-devlog/neural/corpus-token-audit.md

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { LLMConfig } from '../raget-neural/llm-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, '../raget-data/jsonl/external/korpus-manifest-total.json');
const OUT_FILE = join(__dirname, '../raget-devlog/neural/corpus-token-audit.md');

const CHINCHILLA_RATIO = 20; // ~20 token per parameter untuk training optimal

// Param "nameplate" per preset (embedding dihitung 2x - konvensi laporan
// training, sama seperti tabel di PRD-RAGET-NEURAL.md §1) - dihitung dari
// rumus yang sama dipakai docs/ARSITEKTUR.md §6, bukan angka baru.
function nameplateParams(preset) {
  const { vocabSize, dModel, nLayers, dFF } = preset;
  const matrixParams = 2 * vocabSize * dModel + nLayers * (4 * dModel * dModel + 2 * dModel * dFF);
  const vectorParams = nLayers * (dFF + 5 * dModel) + 2 * dModel;
  return matrixParams + vectorParams;
}

const FUTURE_TARGETS = [
  { label: '500M (Fase A jembatan)', params: 500_000_000 },
  { label: '1B (Fase A target)', params: 1_000_000_000 },
  { label: '4B (Fase B)', params: 4_000_000_000 },
  { label: '10B (Fase C)', params: 10_000_000_000 },
  { label: '20B (Fase C)', params: 20_000_000_000 },
  { label: '40B (Fase C)', params: 40_000_000_000 },
];

function fmtInt(n) {
  return Math.round(n).toLocaleString('id-ID');
}

function main() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const tokenTotal = manifest.kanonik.totalTokenBPEResmiKanonik;
  const docTotal = manifest.kanonik.totalDokumenKanonik;

  const existingRows = Object.entries(LLMConfig.PRESETS)
    .filter(([name]) => name.startsWith('massive') || name === 'tiny')
    .map(([name, preset]) => {
      const params = nameplateParams(preset);
      const idealTokens = params * CHINCHILLA_RATIO;
      const pct = (tokenTotal / idealTokens) * 100;
      return { name, params, idealTokens, pct, kind: 'ada' };
    });

  const futureRows = FUTURE_TARGETS.map((t) => {
    const idealTokens = t.params * CHINCHILLA_RATIO;
    const pct = (tokenTotal / idealTokens) * 100;
    const growthNeeded = idealTokens / tokenTotal;
    return { name: t.label, params: t.params, idealTokens, pct, growthNeeded, kind: 'future' };
  });

  const lines = [];
  lines.push('# Audit Token Korpus vs Target Skala Model');
  lines.push('');
  lines.push('Dihasilkan otomatis oleh `raget-tools/audit-corpus-tokens.mjs` - PRD-RAGET-NEURAL.md Fase A.1.');
  lines.push('');
  lines.push(`Korpus kanonik saat ini (K1+K2+K3, \`korpus-manifest-total.json\`): **${fmtInt(tokenTotal)} token BPE** (tokenizer resmi vocab 30.368), dari **${fmtInt(docTotal)} dokumen**.`);
  lines.push('');
  lines.push(`Target rasio Chinchilla-style: **${CHINCHILLA_RATIO} token per parameter** untuk training mendekati optimal.`);
  lines.push('');
  lines.push('## Preset yang SUDAH ADA - seberapa cukup datanya');
  lines.push('');
  lines.push('| Preset | Param (nameplate) | Token ideal (20:1) | Token tersedia | % tercukupi |');
  lines.push('|---|---:|---:|---:|---:|');
  existingRows.forEach((r) => {
    lines.push(`| ${r.name} | ${fmtInt(r.params)} | ${fmtInt(r.idealTokens)} | ${fmtInt(tokenTotal)} | ${r.pct.toFixed(1)}% |`);
  });
  lines.push('');
  lines.push('**Temuan kunci**: preset yang lebih besar tercukupi data-nya jauh LEBIH SEDIKIT secara proporsional -');
  lines.push('ini penjelasan kuantitatif kenapa massive200m held-out PPL-nya lebih buruk dari massive50m');
  lines.push('(lihat docs/ARSITEKTUR.md §"Kenapa Neural AKTIF tapi belum koheren") - bukan cuma dugaan kualitatif lagi.');
  lines.push('');
  lines.push('## Target masa depan roadmap - seberapa jauh korpus harus tumbuh');
  lines.push('');
  lines.push('| Target | Token ideal (20:1) | % tercukupi hari ini | Korpus harus tumbuh berapa kali |');
  lines.push('|---|---:|---:|---:|');
  futureRows.forEach((r) => {
    lines.push(`| ${r.name} | ${fmtInt(r.idealTokens)} | ${r.pct.toFixed(2)}% | ${r.growthNeeded.toFixed(1)}x |`);
  });
  lines.push('');
  lines.push('## Kesimpulan untuk PRD-RAGET-NEURAL.md Fase A');
  lines.push('');
  lines.push('Korpus (bukan compute) adalah penghambat DOMINAN untuk scaling ke atas 500M - bahkan target');
  lines.push('500M paling dekat pun butuh korpus tumbuh signifikan dari kondisi hari ini. Growth plan korpus');
  lines.push('HARUS jadi prasyarat nyata sebelum melatih preset >200M lagi, bukan cuma catatan di PRD.');
  lines.push('');

  writeFileSync(OUT_FILE, lines.join('\n'));

  console.log('=== audit-corpus-tokens: hasil ===');
  console.log(`Token kanonik tersedia: ${fmtInt(tokenTotal)} (dari ${fmtInt(docTotal)} dokumen)`);
  console.log('\nPreset yang sudah ada:');
  existingRows.forEach((r) => console.log(`  ${r.name.padEnd(14)} param=${fmtInt(r.params).padStart(15)} ideal=${fmtInt(r.idealTokens).padStart(17)} tercukupi=${r.pct.toFixed(1)}%`));
  console.log('\nTarget masa depan:');
  futureRows.forEach((r) => console.log(`  ${r.name.padEnd(28)} ideal=${fmtInt(r.idealTokens).padStart(18)} tercukupi=${r.pct.toFixed(2).padStart(6)}% perlu tumbuh ${r.growthNeeded.toFixed(1)}x`));
  console.log('\nDitulis ke:', OUT_FILE);
}

main();

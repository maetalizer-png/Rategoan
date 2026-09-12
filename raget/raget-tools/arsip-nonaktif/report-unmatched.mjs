// PRD/PRD-RAGET-TEMPLATE.md Fase 1.1 - menutup gap nyata: raget-db.js sudah
// mencatat setiap pertanyaan yang gagal dijawab (logUnmatched(), dipanggil dari
// agent.js#respondCore hanya saat SEMUA mesin gagal - lihat FR-5.1) tapi sampai
// sekarang tidak ada apa pun yang membaca log itu untuk mengarahkan penulisan
// data baru. export-unmatched-queries.mjs sudah bisa MENGEKSPOR entri mentah;
// skrip ini MENGOLAHNYA jadi laporan prioritas: kata kunci apa yang paling
// sering muncul di pertanyaan gagal, dan pertanyaan mana yang paling sering
// diulang tapi tetap gagal - itulah daftar topik yang paling layak ditulis
// datanya lebih dulu (bukan tebakan bebas, lihat §4 PRD-RAGET-TEMPLATE.md).
//
// Sama seperti export-unmatched-queries.mjs, data unmatched hidup di IndexedDB
// browser (app ini local-first, tidak ada backend) - jadi skrip ini membaca
// lewat Playwright yang membuka app dan mengimpor raget-db.js miliknya sendiri
// (bukan indexedDB.open() mandiri, supaya tidak balapan skema dengan
// idb-gateway.js). Ikuti aturan --profile-dir yang sama: default = sesi
// ephemeral kosong (cocok untuk sanity-check skrip ini sendiri sehabis
// men-drive app lewat Playwright di sesi yang sama), --profile-dir <path> =
// profil Chromium/Chrome nyata developer yang sudah terpakai app ini
// sehari-hari.
//
// Cara pakai:
//   node raget/raget-tools/report-unmatched.mjs [base-url] [--top N] [--profile-dir <path>]
//   base-url default: http://localhost:8099
//   --top    default: 15 (jumlah baris top kata kunci / top pertanyaan berulang)
//
// Keluaran: cetak ke console DAN tulis raget/raget-tools/unmatched-report.md

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { feedbackReport } from '../raget-agents/feedback-report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawArgs = process.argv.slice(2);
const profileFlagIdx = rawArgs.indexOf('--profile-dir');
const PROFILE_DIR = profileFlagIdx >= 0 ? rawArgs[profileFlagIdx + 1] : null;
const topFlagIdx = rawArgs.indexOf('--top');
const TOP_N = topFlagIdx >= 0 ? parseInt(rawArgs[topFlagIdx + 1], 10) || 15 : 15;
const positional = rawArgs.filter((a, i) => {
  if (a === '--profile-dir' || i === profileFlagIdx + 1) return false;
  if (a === '--top' || i === topFlagIdx + 1) return false;
  return true;
});
const BASE = positional[0] || 'http://localhost:8099';
const OUT_FILE = join(__dirname, 'unmatched-report.md');

async function openPage() {
  if (PROFILE_DIR) {
    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
      executablePath: '/opt/pw-browsers/chromium',
      headless: true,
    });
    const page = context.pages()[0] || (await context.newPage());
    return { page, close: () => context.close() };
  }
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await browser.newPage();
  return { page, close: () => browser.close() };
}

function renderMarkdown(report, base) {
  const lines = [];
  lines.push('# Laporan Pertanyaan Gagal (unmatched) - Raget Template');
  lines.push('');
  lines.push('Dihasilkan otomatis oleh `raget-tools/report-unmatched.mjs` dari log');
  lines.push('`ragetDb.allUnmatched()` (sumber: ' + base + '). Dipakai untuk memprioritaskan');
  lines.push('penulisan data baru di `raget-data/json/` - lihat PRD-RAGET-TEMPLATE.md §4.');
  lines.push('');
  lines.push('- Total entri unmatched: **' + report.total + '**');
  lines.push('- Pertanyaan unik (setelah normalisasi): **' + report.distinctQueries + '**');
  if (report.range) {
    lines.push('- Rentang waktu: ' + report.range.from + ' s/d ' + report.range.to);
  }
  lines.push('');
  lines.push('## Kata kunci paling sering muncul di pertanyaan gagal');
  lines.push('');
  if (report.topKeywords.length === 0) {
    lines.push('_(tidak ada data - belum ada pertanyaan gagal tercatat)_');
  } else {
    lines.push('| # | Kata kunci | Frekuensi |');
    lines.push('|---:|---|---:|');
    report.topKeywords.forEach(([kw, count], i) => lines.push(`| ${i + 1} | ${kw} | ${count} |`));
  }
  lines.push('');
  lines.push('## Pertanyaan yang paling sering diulang tapi tetap gagal');
  lines.push('');
  if (report.topQueries.length === 0) {
    lines.push('_(tidak ada data)_');
  } else {
    lines.push('| # | Pertanyaan | Frekuensi |');
    lines.push('|---:|---|---:|');
    report.topQueries.forEach(([q, count], i) => lines.push(`| ${i + 1} | ${q.replace(/\|/g, '\\|')} | ${count} |`));
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const { page, close } = await openPage();
  await page.goto(BASE + '/index.html');
  await page.waitForTimeout(300);

  const entries = await page.evaluate(async () => {
    try {
      const { ragetDb } = await import('/raget/raget-database/raget-db.js');
      return await ragetDb.allUnmatched();
    } catch (e) {
      return [];
    }
  });

  await close();

  const report = feedbackReport.buildUnmatchedReport(entries, TOP_N);
  const markdown = renderMarkdown(report, BASE);
  writeFileSync(OUT_FILE, markdown);

  console.log('=== report-unmatched: laporan prioritas data ===');
  console.log('Total unmatched:', report.total, '| unik:', report.distinctQueries);
  console.log('\nTop kata kunci:');
  report.topKeywords.forEach(([kw, count], i) => console.log(`  ${i + 1}. ${kw} (${count})`));
  console.log('\nTop pertanyaan berulang:');
  report.topQueries.forEach(([q, count], i) => console.log(`  ${i + 1}. "${q}" (${count})`));
  console.log('\nDitulis ke:', OUT_FILE);
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});

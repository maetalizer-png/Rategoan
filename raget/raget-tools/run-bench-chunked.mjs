// MEGA-BATCH RAGETAN ROUND 6: orkestrasi run-bench.mjs per-CHUNK - proses
// Chromium headless tunggal di sandbox ini SELALU tertutup paksa pada
// elapsed ~1396-1397 detik PERSIS (diverifikasi lewat 5 percobaan
// independen, lihat catatan di run-bench.mjs) - batas level
// infrastruktur/sandbox, BUKAN bug di app atau di run-bench.mjs sendiri.
// Skrip ini menjalankan run-bench.mjs berkali-kali (proses baru tiap
// chunk - me-reset hitungan waktu tsb) memakai --start/--end/--json-out,
// lalu menggabungkan hasil jadi satu angka pass-rate resmi.
//
// Jalankan: node raget-tools/run-bench-chunked.mjs [base-url] [chunk-size]
import { spawnSync } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://localhost:8099';
const CHUNK_SIZE = parseInt(process.argv[3] || '300', 10);
const bench = JSON.parse(readFileSync(path.join(__dirname, 'bench.json'), 'utf8'));
const totalCases = bench.length;

const aggregate = { core: { pass: 0, total: 0, fails: [] }, stub: { pass: 0, total: 0, fails: [] } };
let totalElapsed = 0;
const allConsoleErrors = [];
const chunkSummaries = [];

for (let start = 0; start < totalCases; start += CHUNK_SIZE) {
  const end = Math.min(start + CHUNK_SIZE, totalCases);
  const outFile = path.join('/tmp', 'bench-chunk-' + start + '-' + end + '.json');
  if (existsSync(outFile)) unlinkSync(outFile);
  console.log('--- Chunk', start, '-', end, '(' + (end - start) + ' kasus) ---');
  const res = spawnSync('node', [
    path.join(__dirname, 'run-bench.mjs'), BASE,
    '--start=' + start, '--end=' + end, '--json-out=' + outFile,
  ], { stdio: 'inherit', timeout: 20 * 60 * 1000 });
  if (!existsSync(outFile)) {
    console.error('!!! Chunk', start, '-', end, 'GAGAL total (proses mati sebelum sempat menulis hasil) - exit code', res.status);
    chunkSummaries.push({ start, end, ok: false, status: res.status });
    continue;
  }
  const chunkData = JSON.parse(readFileSync(outFile, 'utf8'));
  aggregate.core.pass += chunkData.results.core.pass;
  aggregate.core.total += chunkData.results.core.total;
  aggregate.core.fails.push(...chunkData.results.core.fails);
  aggregate.stub.pass += chunkData.results.stub.pass;
  aggregate.stub.total += chunkData.results.stub.total;
  aggregate.stub.fails.push(...chunkData.results.stub.fails);
  totalElapsed += chunkData.elapsed;
  allConsoleErrors.push(...chunkData.consoleErrors);
  chunkSummaries.push({ start, end, ok: true, corePass: chunkData.results.core.pass, coreTotal: chunkData.results.core.total });
}

const corePct = aggregate.core.total ? ((aggregate.core.pass / aggregate.core.total) * 100).toFixed(2) : 'N/A';
const stubPct = aggregate.stub.total ? ((aggregate.stub.pass / aggregate.stub.total) * 100).toFixed(2) : 'N/A';
const totalPass = aggregate.core.pass + aggregate.stub.pass;
const totalCount = aggregate.core.total + aggregate.stub.total;

console.log('\n\n========== HASIL GABUNGAN (semua chunk) ==========');
console.log('Chunk summary:', JSON.stringify(chunkSummaries));
console.log('=== CORE-SUITE (dihitung, target >=97%) ===');
console.log('Total:', aggregate.core.total, 'Pass:', aggregate.core.pass, 'Rate:', corePct + '%', parseFloat(corePct) >= 97 ? '[TARGET TERCAPAI]' : '[DI BAWAH TARGET]');
console.log('=== STUB-SUITE (informatif) ===');
console.log('Total:', aggregate.stub.total, 'Pass:', aggregate.stub.pass, 'Rate:', stubPct + '%');
console.log('=== GABUNGAN ===');
console.log('Total:', totalCount, 'Pass:', totalPass, 'Rate:', ((totalPass / totalCount) * 100).toFixed(2) + '%');
console.log('Total elapsed (jumlah semua chunk):', totalElapsed, 'ms');
console.log('Console/404 errors (gabungan):', allConsoleErrors.length);

if (aggregate.core.fails.length) {
  console.log('\n--- CORE FAILURES (gabungan) ---');
  aggregate.core.fails.forEach((f) => console.log(JSON.stringify(f)));
}

if (parseFloat(corePct) < 97 || chunkSummaries.some((c) => !c.ok)) process.exitCode = 1;

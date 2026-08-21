// Gerbang lint/build minimal (Fase A vNext) - dua lapis:
//   1. node --check di SETIAP file .js/.mjs (syntax gate tercepat, 0 dependency,
//      menangkap error yang lolos deteksi editor tapi gagal total di runtime).
//   2. eslint . lewat eslint.config.mjs di root (menangkap variabel tak
//      terdefinisi, import/export salah, dead code jelas - bukan gaya penulisan).
//
// Dipakai sebelum bench (lihat README.md / docs), bukan pengganti bench -
// bench menguji ISI jawaban, lint/syntax-check menguji apakah kodenya
// valid dan bisa dimuat sama sekali.
//
// Pakai: node raget/raget-tools/lint-check.mjs

import { execFileSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const IGNORE_DIRS = new Set(['node_modules', '.git', 'kesempatan-os-']);

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (/\.(js|mjs)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function checkSyntax(files) {
  const failures = [];
  for (const f of files) {
    try {
      execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    } catch (e) {
      failures.push({ file: path.relative(ROOT, f), error: e.stderr ? e.stderr.toString().trim() : String(e) });
    }
  }
  return failures;
}

function runEslint() {
  let out;
  let raw = '';
  try {
    out = execFileSync('eslint', ['.', '--format', 'json'], { cwd: ROOT, stdio: 'pipe', maxBuffer: 32 * 1024 * 1024 }).toString();
  } catch (e) {
    out = e.stdout ? e.stdout.toString() : '';
    raw = e.stderr ? e.stderr.toString() : String(e);
  }
  let results = [];
  try {
    results = JSON.parse(out || '[]');
  } catch (_) {
    return { errorCount: -1, warningCount: 0, results: [], raw: raw || out };
  }
  const errorCount = results.reduce((s, r) => s + r.errorCount, 0);
  const warningCount = results.reduce((s, r) => s + r.warningCount, 0);
  return { errorCount, warningCount, results };
}

function main() {
  console.log('=== raget_lint_check: gerbang lint/build minimal ===\n');

  const files = walk(ROOT, []);
  console.log('Syntax check (node --check):', files.length, 'file .js/.mjs');
  const syntaxFailures = checkSyntax(files);

  if (syntaxFailures.length) {
    console.log('\n--- SYNTAX ERROR (' + syntaxFailures.length + ') ---');
    syntaxFailures.forEach((f) => console.log(f.file + ':\n  ' + f.error.split('\n').slice(0, 3).join('\n  ')));
  } else {
    console.log('Syntax check: 0 error.\n');
  }

  console.log('ESLint (eslint.config.mjs, aturan correctness-only):');
  const lint = runEslint();
  if (lint.errorCount === -1) {
    console.log('GAGAL menjalankan eslint - pastikan binary "eslint" tersedia di PATH.');
    console.log(lint.raw || '');
  } else {
    console.log('  Error:', lint.errorCount, '| Warning:', lint.warningCount, '(warning tidak menggagalkan gerbang)');
    if (lint.errorCount > 0) {
      lint.results
        .filter((r) => r.errorCount > 0)
        .forEach((r) => {
          console.log('\n' + path.relative(ROOT, r.filePath) + ':');
          r.messages
            .filter((m) => m.severity === 2)
            .forEach((m) => console.log('  ' + m.line + ':' + m.column + '  ' + m.message + '  [' + m.ruleId + ']'));
        });
    }
  }

  const failed = syntaxFailures.length > 0 || lint.errorCount > 0 || lint.errorCount === -1;
  console.log('\n=== HASIL: ' + (failed ? 'GAGAL - perbaiki sebelum lanjut ke bench' : 'LOLOS') + ' ===');
  process.exit(failed ? 1 : 0);
}

main();

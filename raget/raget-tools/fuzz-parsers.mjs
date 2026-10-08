import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { whatsappImporter } from '../../vault/whatsapp/importer.js';
import { icsParser } from '../../vault/calendar/ics-parser.js';
import { parseArithmeticAST } from '../../js/connectors/local-tools.js';
import { parseUnifiedDiff } from '../../js/studio/diff-parser.js';

function hostile(bytes) {
  return '[01/01/2026 12:00] ' + 'A'.repeat(bytes);
}

test('parser WhatsApp menolak baris 1MB tanpa titik dua di bawah 200ms', () => {
  const start = performance.now();
  const res = whatsappImporter.importWhatsApp(hostile(1024 * 1024));
  const duration = performance.now() - start;
  assert.ok(duration < 200, 'terlalu lambat ' + duration.toFixed(1));
  assert.equal(res.ok, false);
});

test('parser WhatsApp menolak baris 5MB tanpa lonjakan waktu', () => {
  const start = performance.now();
  const res = whatsappImporter.importWhatsApp(hostile(5 * 1024 * 1024));
  const duration = performance.now() - start;
  assert.ok(duration < 200, 'terlalu lambat ' + duration.toFixed(1));
  assert.equal(res.ok, false);
});

test('parser ICS melewati baris panjang tanpa titik dua', () => {
  const line = 'BEGIN:VCALENDAR\n' + 'A'.repeat(1024 * 1024) + '\nEND:VCALENDAR\n';
  const start = performance.now();
  const events = icsParser.parseICS(line);
  const duration = performance.now() - start;
  assert.ok(duration < 200, 'terlalu lambat ' + duration.toFixed(1));
  assert.equal(events.length, 0);
});

test('parser WhatsApp dan ICS menolak muatan 10MB tanpa backtracking', () => {
  const waStart = performance.now();
  const wa = whatsappImporter.importWhatsApp(hostile(10 * 1024 * 1024));
  const waMs = performance.now() - waStart;
  const icsStart = performance.now();
  const ics = icsParser.parseICS('BEGIN:VCALENDAR\n' + 'B'.repeat(10 * 1024 * 1024) + '\nEND:VCALENDAR\n');
  const icsMs = performance.now() - icsStart;
  assert.ok(waMs < 200, 'WhatsApp terlalu lambat ' + waMs.toFixed(1));
  assert.ok(icsMs < 200, 'ICS terlalu lambat ' + icsMs.toFixed(1));
  assert.equal(wa.ok, false);
  assert.equal(ics.length, 0);
  const bigExpr = '1+'.repeat(5 * 1024 * 1024) + '1';
  const astStart = performance.now();
  assert.throws(() => parseArithmeticAST(bigExpr), /terlalu panjang|tidak aman|Galat/);
  const astMs = performance.now() - astStart;
  assert.ok(astMs < 50, 'AST terlalu lambat ' + astMs.toFixed(1));
  const bigDiff = '@@ -1,1 +1,1 @@\n+' + 'x'.repeat(10 * 1024 * 1024);
  const diffStart = performance.now();
  assert.throws(() => parseUnifiedDiff(bigDiff), /terlalu besar|tidak sah/);
  const diffMs = performance.now() - diffStart;
  assert.ok(diffMs < 50, 'Diff terlalu lambat ' + diffMs.toFixed(1));
});

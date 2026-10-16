
import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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

function validatePengetahuan(entry, index, filePath) {
  const prefix = `${filePath}[${index}]`;
  const hasText = PENGETAHUAN_TEXT_FIELDS.some((f) => typeof entry[f] === 'string' && entry[f].trim());
  if (!hasText) {
    return [`${prefix}: tidak ada field teks non-kosong (butuh salah satu: ${PENGETAHUAN_TEXT_FIELDS.join('/')})`];
  }
  return [];
}

function checkSapaanBucket() {
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

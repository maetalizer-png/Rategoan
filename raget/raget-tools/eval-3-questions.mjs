// Ronde D - eval wajib akhir tiap sesi: 3 pertanyaan tetap, generasi lewat
// mesin JS produksi yang SAMA dipakai browser (RATEGOAN di
// raget-neural/llm-core.js, bukan sampler Python terpisah), supaya
// hasilnya benar-benar mencerminkan apa yang akan didapat pengguna kalau
// NEURAL_ANSWERS_ENABLED dinyalakan.
//
// Pakai: node raget/raget-tools/eval-3-questions.mjs [checkpoint-path] [out-json]
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RATEGOAN } from '../raget-neural/llm-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CHECKPOINT_FILE = process.argv[2] || path.join(ROOT, 'raget', 'raget-data', 'neural', 'raget-neural-massive200m.safetensors');
const OUT_FILE = process.argv[3] || null;

const QUESTIONS = [
  { id: 'q1', prompt: 'Apa ibu kota Indonesia?', expectContains: 'Jakarta' },
  { id: 'q2', prompt: 'Siapa presiden pertama Indonesia?', expectContains: 'Soekarno' },
  { id: 'q3', prompt: 'Berapa 2 + 2?', expectContains: '4' },
];

async function main() {
  console.log('Memuat checkpoint:', path.relative(ROOT, CHECKPOINT_FILE));
  const bytes = readFileSync(CHECKPOINT_FILE);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  RATEGOAN.restoreFromCheckpointSafetensors(buffer);
  console.log('Stats:', JSON.stringify(RATEGOAN.getStats()));

  const results = [];
  for (const q of QUESTIONS) {
    const out = await RATEGOAN.generateText(q.prompt, { maxNewTokens: 50, greedy: true });
    const text = (out.text || '').trim();
    const containsExpected = text.toLowerCase().includes(q.expectContains.toLowerCase());
    console.log('\n"' + q.prompt + '" ->');
    console.log('  ' + text);
    console.log('  containsExpected("' + q.expectContains + '"):', containsExpected, '| tokensGenerated:', out.tokensGenerated, '| stoppedAtEos:', out.stoppedAtEos);
    results.push({
      id: q.id,
      prompt: q.prompt,
      expectContains: q.expectContains,
      text,
      containsExpected,
      tokensGenerated: out.tokensGenerated,
      stoppedAtEos: out.stoppedAtEos,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    checkpoint: path.relative(ROOT, CHECKPOINT_FILE),
    // "kalimat utuh & benar" wajib dinilai manusia/Claude dari teks -
    // containsExpected cuma sinyal kasar (kata kunci ada), BUKAN pengganti
    // penilaian koherensi kalimat. Jangan simpulkan "lolos" hanya dari flag ini.
    note: 'containsExpected = sinyal kasar kata kunci saja, bukan penilaian koherensi kalimat.',
    results,
  };
  console.log('\n' + JSON.stringify(report, null, 2));
  if (OUT_FILE) writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });

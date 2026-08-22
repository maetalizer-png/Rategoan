// vNext Fase C (revisi v1.1, §4 roadmap): render korpus dialog/fakta MILIK
// SENDIRI Rategoan - bukan dari raget-dataries/ (itu lapisan metadata
// terstruktur untuk RETRIEVAL, bukan teks siap-latih), tapi dari
// raget-devlog/json/{persona,fewshot} + raget-data/json/knowledge/* +
// raget-data/json/*/*.json (domain yang sudah dimigrasi ke skema tunggal
// Fase B) + raget-data/json/sapaan/ (sapaan/smalltalk, dimigrasi lewat
// migrate-sapaan-domain.mjs).
//
// Output: raget/raget-data/jsonl/raget_own_corpus.jsonl - satu record JSON
// per baris, field `type` menandai bentuknya:
//   - "dialog"   {type,source,prompt,completion}  - prompt+balasan asli
//   - "fact"     {type,source,text}                - kalimat faktual berdiri sendiri
//   - "identity" {type,source,text}                - deskripsi identitas/gaya Raget
//
// KEPUTUSAN FILTER YANG DISENGAJA (didokumentasikan, bukan celah yang
// terlewat):
//   1. raget-tools/bench.json TIDAK dirender jadi dialog. File itu cuma
//      berisi {prompt, expect-label} untuk uji klasifikasi rule engine -
//      tidak ada teks balasan di dalamnya. Merender label jadi balasan
//      buatan berarti MENGARANG data latih (melanggar prinsip kejujuran
//      proyek), dan menjalankan live engine untuk memanen balasan asli
//      berisiko tercemar state percakapan (mood/context continuity module
//      yang memang didesain stateful) sehingga hasilnya tidak murni lagi
//      mewakili prompt tunggal. bench.json tetap dipakai HANYA sebagai alat
//      uji (run-bench.mjs), bukan sumber korpus.
//   2. raget-devlog/json/metadata/answer-rules.json TIDAK dirender. Isinya
//      instruksi gaya-jawab (meta-aturan), bukan sesuatu yang pernah
//      benar-benar diucapkan Raget ke pengguna - memasukkannya berisiko
//      instruksi format ikut "bocor" jadi gaya bicara kalau nanti dipakai
//      untuk training.
//   3. factoid.json ({subject,aliases,answer}) direndar jadi dialog dengan
//      PERTANYAAN YANG DISINTESIS dari template "Apa itu <subject>?" -
//      jawabannya asli dari data, cuma bentuk pertanyaannya templated. Ini
//      teknik umum & jujur untuk mengubah factoid jadi pasangan QA, beda
//      dengan mengarang jawaban.
//   4. Field meta.trivia/meta.kutipan/meta.pencapaian/meta.bahanUtama pada
//      domain raget-data/json/* (tokoh/kuliner) ikut dirender sebagai
//      kalimat fact tambahan - semua bersumber dari field data yang sudah
//      ada, bukan konten baru, cuma diformat jadi kalimat.
//
// Prinsip: "aditif, tidak merombak" - skrip ini HANYA membaca file JSON
// yang sudah ada, tidak mengubah satu pun sumber data. Jangan mulai
// training di sini - skrip ini cuma menghasilkan raget_own_corpus.jsonl,
// build-neural-checkpoint.mjs (langkah training terpisah) belum diubah
// untuk memakai output ini.
//
// Pakai: node raget/raget-tools/dataries-ke-korpus.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DEVLOG_JSON_DIR = path.join(ROOT, 'raget', 'raget-devlog', 'json');
const DATA_JSON_DIR = path.join(ROOT, 'raget', 'raget-data', 'json');
const KNOWLEDGE_DIR = path.join(DATA_JSON_DIR, 'knowledge');
const DATA_DIR = DATA_JSON_DIR;
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'jsonl');
const OUT_FILE = path.join(OUT_DIR, 'raget_own_corpus.jsonl');

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function pushDialog(records, source, prompt, completion) {
  const p = String(prompt || '').trim();
  const c = String(completion || '').trim();
  if (!p || !c) return;
  records.push({ type: 'dialog', source, prompt: p, completion: c });
}

function pushFact(records, source, text) {
  const t = String(text || '').trim();
  if (!t) return;
  records.push({ type: 'fact', source, text: t });
}

function pushIdentity(records, source, text) {
  const t = String(text || '').trim();
  if (!t) return;
  records.push({ type: 'identity', source, text: t });
}

// ---------- 1) persona.json - identitas Raget, bukan dialog ----------
function renderPersona(records) {
  const p = readJson(path.join(DEVLOG_JSON_DIR, 'persona.json'));
  if (p.gayaBicara) pushIdentity(records, 'persona', 'Gaya bicara ' + (p.name || 'Raget') + ': ' + p.gayaBicara);
  for (const rule of p.aturan || []) pushIdentity(records, 'persona', rule);
  for (const rule of p.batasan || []) pushIdentity(records, 'persona', rule);
}

// ---------- 2) fewshot.json - dialog contoh asli ----------
function renderFewshot(records) {
  const list = readJson(path.join(DEVLOG_JSON_DIR, 'fewshot.json'));
  for (const item of list) pushDialog(records, 'fewshot', item.q, item.a);
}

// ---------- 3) knowledge/*.json - dua bentuk: {q,a} atau {subject,answer} atau {title,text} ----------
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const PERSON_SUBJECT_RE = /^(pendiri|presiden|wakil presiden|penemu|bapak|ibu|tokoh|pelukis|penulis|ilmuwan)\b/i;

function renderKnowledge(records) {
  for (const f of readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.json'))) {
    const data = readJson(path.join(KNOWLEDGE_DIR, f));
    if (!Array.isArray(data)) continue;
    const source = 'knowledge/' + f;
    for (const item of data) {
      if (item.q && item.a) {
        pushDialog(records, source, item.q, item.a);
      } else if (item.subject && item.answer) {
        // factoid {subject,aliases,answer} - pertanyaan disintesis dari
        // subject, jawaban APA ADANYA dari data (lihat keputusan filter #3).
        // "Siapa" dipakai kalau subjeknya jelas merujuk orang (pendiri,
        // presiden, penemu, dst), "Apa itu" untuk subjek lainnya.
        const isPerson = PERSON_SUBJECT_RE.test(item.subject);
        pushDialog(records, source, (isPerson ? 'Siapa ' : 'Apa itu ') + item.subject + '?', item.answer);
        pushFact(records, source, capitalize(item.subject) + ': ' + item.answer);
      } else if (item.title && item.text) {
        pushFact(records, source, item.title + ' — ' + item.text);
      } else if (item.text) {
        pushFact(records, source, item.text);
      }
    }
  }
}

// ---------- 4) raget-data/json/*/*.json - domain skema tunggal Fase B ----------
function renderUnifiedDomain(records) {
  for (const domain of readdirSync(DATA_DIR, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    if (domain.name === 'knowledge') continue; // sudah dirender terpisah lewat renderKnowledge() - bentuknya {q,a}/{subject,answer}, bukan skema unified
    const domainDir = path.join(DATA_DIR, domain.name);
    for (const f of readdirSync(domainDir).filter((f) => f.endsWith('.json'))) {
      const data = readJson(path.join(domainDir, f));
      if (!Array.isArray(data)) continue;
      const source = domain.name + '/' + f;

      if (domain.name === 'sapaan') {
        renderSapaanEntries(records, source, data);
        continue;
      }

      for (const entry of data) {
        if (entry.teks) pushFact(records, source, entry.teks);
        const meta = entry.meta || {};
        if (meta.kutipan) pushFact(records, source, (entry.nama || '') + ' pernah berkata: "' + meta.kutipan + '"');
        if (meta.trivia) pushFact(records, source, 'Trivia soal ' + (entry.nama || 'ini') + ': ' + meta.trivia);
        for (const pencapaian of meta.pencapaian || []) {
          pushFact(records, source, (entry.nama || 'Tokoh ini') + ' dikenal karena: ' + pencapaian);
        }
        const bahan = (meta.bahanUtama || []).filter((b) => b && b !== '-');
        if (bahan.length) {
          pushFact(records, source, (entry.nama || 'Hidangan ini') + ' memakai bahan utama: ' + bahan.join(', ') + '.');
        }
        for (const rel of meta.relasi || []) {
          if (rel.nama && rel.jenis) pushFact(records, source, (entry.nama || '') + ' punya relasi dengan ' + rel.nama + ' sebagai ' + rel.jenis + '.');
        }
      }
    }
  }
}

// ---------- 5) sapaan.json - dialog sapaan/smalltalk (§4 prasyarat terpenuhi) ----------
function renderSapaanEntries(records, source, data) {
  for (const entry of data) {
    const m = entry.meta || {};
    if (m.jenis === 'waktu') {
      const promptSample = 'Selamat ' + m.periode;
      for (const v of m.variants || [entry.teks]) pushDialog(records, source, promptSample, v.split('{name}').join('Raget'));
    } else if (m.jenis === 'plain') {
      for (const v of m.variants || [entry.teks]) pushDialog(records, source, 'Halo', v.split('{name}').join('Raget'));
    } else if (m.jenis === 'smalltalk') {
      const promptSample = SMALLTALK_PROMPT_SAMPLE[m.key] || entry.nama;
      for (const v of m.variants || [entry.teks]) pushDialog(records, source, promptSample, v.split('{name}').join('Raget'));
      for (const v of m.variantsFormal || []) pushDialog(records, source, promptSample, v.split('{name}').join('Raget'));
    }
    // entry followup dilewati - itu potongan kalimat sambungan, bukan balasan utuh berdiri sendiri.
  }
}

const SMALLTALK_PROMPT_SAMPLE = {
  siapa: 'Siapa kamu?',
  kabar: 'Apa kabar?',
  terima_kasih: 'Terima kasih ya',
  jumpa: 'Sampai jumpa',
  kemampuan: 'Kamu bisa apa?',
};

// ---------- estimasi token kasar (~4 karakter/token, aturan umum Bahasa Indonesia+Inggris campuran) ----------
function estimateTokens(records) {
  let chars = 0;
  for (const r of records) {
    if (r.type === 'dialog') chars += r.prompt.length + r.completion.length;
    else chars += r.text.length;
  }
  return { chars, estTokens: Math.round(chars / 4) };
}

function main() {
  const records = [];
  renderPersona(records);
  renderFewshot(records);
  renderKnowledge(records);
  renderUnifiedDomain(records);

  const byType = records.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  const bySource = records.reduce((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + 1;
    return acc;
  }, {});
  const { chars, estTokens } = estimateTokens(records);

  mkdirSync(OUT_DIR, { recursive: true });
  const lines = records.map((r) => JSON.stringify(r)).join('\n') + '\n';
  writeFileSync(OUT_FILE, lines, 'utf8');

  console.log('=== raget_own_corpus.jsonl ===');
  console.log('Ditulis:', path.relative(ROOT, OUT_FILE));
  console.log('Total baris:', records.length);
  console.log('Per tipe:', JSON.stringify(byType, null, 2));
  console.log('Per sumber:');
  for (const [src, n] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) console.log('  ' + src + ': ' + n);
  console.log('Total karakter:', chars);
  console.log('Estimasi token (kasar, ~4 char/token):', estTokens);
  console.log('\nCatatan: raget-tools/bench.json dan raget-devlog/json/metadata/answer-rules.json SENGAJA dilewati - lihat komentar header skrip ini untuk alasannya.');
}

main();

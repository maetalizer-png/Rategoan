#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const origFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (url, opts) => {
  const href = String(url);
  if (href.startsWith('file:')) {
    const buf = await readFile(new URL(href));
    return new Response(buf, { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return origFetch(url, opts);
};

const { llmEngine } = await import('../raget-template/llm-engine.js');
const { socialEngine } = await import('../raget-agents/social-engine.js');
const { planner } = await import('../raget-agents/planner.js');
const { mathEngine } = await import('../raget-agents/math-engine.js');
const { stemEngine } = await import('../raget-agents/stem-engine.js');
const { toolsKode } = await import('../raget-agents/tools-kode.js');
const { turnPipeline } = await import('../raget-agents/turn-pipeline.js');
const { tokohStore } = await import('../raget-agents/tokoh-store.js');
const { syntaxValidator } = await import('../raget-agents/syntax-validator.js');

const BAD = /Yang saya tahu|ukuran teks|WhatsApp keluarga|\(sumber:\s*faq\)/i;
const rows = [];

function rec(id, prompt, out, pass) {
  const text = String(out || '');
  rows.push({
    id,
    prompt,
    output: text.slice(0, 220),
    pass: !!(pass && !BAD.test(text)),
  });
}

const g1 = llmEngine.tryGreeting('Selamat malam', { personaName: 'Raget' });
rec('5.1a', 'Selamat malam', g1, !!(g1 && /malam/i.test(g1)));

const g2 = llmEngine.tryDailyTalk('Bagaimana kabar anda', { personaName: 'Raget' }) || socialEngine.trySocial('Bagaimana kabar anda');
rec('5.1b', 'Bagaimana kabar anda', g2, !!(g2 && /kabar|baik/i.test(g2)));

const g3 = socialEngine.trySocial('Apakah bisa membantu saya') || llmEngine.tryDailyTalk('Apakah bisa membantu saya', { personaName: 'Raget' });
rec('5.1c', 'Apakah bisa membantu saya', g3, !!(g3 && /bantu/i.test(g3)));

const g4 = llmEngine.tryGreeting('Halo', { personaName: 'Raget' });
rec('5.1d', 'Halo', g4, !!(g4 && /halo|bantu/i.test(g4)));

rec('5.1-chitchat', 'Selamat malam', String(planner.isSocialChitChat('Selamat malam')), planner.isSocialChitChat('Selamat malam') === true);
rec('5.1-fallback', 'Selamat malam', 'planFallback-null', planner.planFallback('Selamat malam', [{ type: 'faq', text: 'ukuran teks WhatsApp keluarga', score: 0.9 }]) == null);

const fis = stemEngine.tryScienceField('Apa itu ilmu fisika');
rec('5.2a', 'Apa itu ilmu fisika', fis, !!(fis && /materi|energi/i.test(fis) && !/^[-•]/.test(String(fis).trim())));

const tok = await tokohStore.tryTokoh('Siapa Yohanes Surya');
rec('5.2b', 'Siapa Yohanes Surya', tok, !!(tok && /Yohanes Surya/i.test(tok) && /fisika/i.test(tok)));

const hitung = mathEngine.evaluate('12*8');
rec('5.2c', 'hitung 12*8', JSON.stringify(hitung), !!(hitung && hitung.ok && hitung.value === 96));

const kode = await toolsKode.compose('Apa itu function di JavaScript');
rec('5.4a', 'Apa itu function di JavaScript', kode && kode.text, !!(kode && kode.text && /function/i.test(kode.text) && syntaxValidator.validateFence(kode.text).ok));

const kode2 = await toolsKode.compose('Perbaiki: consle.log("a")');
rec('5.4b', 'Perbaiki: consle.log("a")', kode2 && kode2.text, !!(kode2 && kode2.text && /console\.log/.test(kode2.text)));

const kode3 = await toolsKode.compose('Tulis fungsi jumlah(a,b) di Python');
rec('5.4c', 'Tulis fungsi jumlah(a,b) di Python', kode3 && kode3.text, !!(kode3 && kode3.text && /def jumlah/.test(kode3.text)));

const web = turnPipeline.inspect('googling berita terkini', { websearch: true, messages: [] });
rec('5.3a', 'googling …', JSON.stringify(web), web.route === 'web');

const slide = turnPipeline.inspect('buatkan slide ppt', { messages: [] });
rec('5.3b', 'buatkan slide ppt', JSON.stringify(slide), slide.route === 'slide');

const nPass = rows.filter((r) => r.pass).length;
const report = { pass: nPass, total: rows.length, ok: rows.every((r) => r.pass), rows };
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(2);

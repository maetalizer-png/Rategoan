import { memoryLong } from '../raget-memory/memory-long.js';
import { collectionStore } from '../raget-memory/collection-store.js';
import { scorer } from './scorer.js';
import { hashText } from '../../utils/text.js';
import { agentTools } from './agent-tools.js';

const COLLECTION_REF_THRESHOLD = 0.35;

const KOLEKSI_KINDS = new Set(['cari', 'ingat', 'lupakan', 'cari_koleksi', 'cari_semua']);

function handles(kind) {
  return KOLEKSI_KINDS.has(kind);
}

async function run(kind, prompt) {
  if (kind === 'cari') {
    const q = prompt
      .replace(/apa\s+yang\s+kamu\s+tahu\s+tentang\s*/i, '')
      .replace(/^ingat\s+(apa\s+)?(yang\s+saya\s+(catat|pernah\s+(bilang|cerita)|simpan)|soal|tentang)\s*/i, '');
    return agentTools.cari(q);
  }
  if (kind === 'ingat') return agentTools.ingat(prompt);
  if (kind === 'lupakan') return agentTools.lupakan(prompt);
  if (kind === 'cari_koleksi') {
    const q = prompt.replace(/apa\s+yang\s+saya\s+simpan\s+tentang/i, '').replace(/apa\s+saja\s+yang\s+(saya\s+)?simpan\s+(di\s+)?koleksi/i, '').trim();
    return await agentTools.cariKoleksi(q);
  }
  if (kind === 'cari_semua') {
    const q = prompt.replace(/cari\s+/i, '').replace(/di\s+semua\s*(sumber)?/i, '').replace(/apa\s+yang\s+saya\s+punya\s+tentang/i, '').trim();
    return await agentTools.cariSemua(q);
  }
  return null;
}

async function personalize(reply, text) {
  const isGreetingLike = /^(halo|hai|hi|hey|selamat|met|good|assalamu)/i.test(text.trim());
  const nama = memoryLong.recall('nama');
  if (isGreetingLike && nama && !reply.includes(nama)) {
    reply = reply.replace(/([!,])/, ', ' + nama + '$1');
  }
  if (!isGreetingLike && hashText(reply + text) % 100 < 15) {
    const suka = memoryLong.recall('suka');
    const pekerjaan = memoryLong.recall('pekerjaan');
    if (suka && suka.length) {
      reply += ' (Ngomong-ngomong, kudengar kamu suka ' + suka[suka.length - 1] + ' ya?)';
    } else if (pekerjaan) {
      reply += ' (Btw, gimana kabar kerjaan sebagai ' + pekerjaan + '?)';
    } else {
      const items = await collectionStore.allItems();
      if (items.length) {
        const textTokens = scorer.tokenize(text);
        const itemTokens = items.map((it) => scorer.tokenize(it.text));
        const scores = scorer.scoreIntent(textTokens, itemTokens);
        let bestIdx = -1, bestScore = COLLECTION_REF_THRESHOLD;
        scores.forEach((s, i) => { if (s >= bestScore) { bestScore = s; bestIdx = i; } });
        if (bestIdx >= 0) {
          reply += ' (Ini mirip dengan yang pernah kamu simpan dari koleksi kamu: "' + items[bestIdx].text.slice(0, 60) + (items[bestIdx].text.length > 60 ? '…' : '') + '")';
        }
      }
    }
  }
  return reply;
}

export const toolsKoleksi = Object.freeze({
  personalize,
  handles,
  run,
});

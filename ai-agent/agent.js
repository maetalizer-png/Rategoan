import { llmEngine } from '../rategoan-llm/llm-engine.js';
import { memoryShort } from '../raget-memory/memory-short.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { memoryIndex } from '../raget-memory/memory-index.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { agentTools } from './agent-tools.js';

const DEFAULT_PERSONA = { name: 'Raget', style: 'ramah, hangat, sedikit humor, tetap jujur dan singkat', rules: [] };

const RATING_GOOD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(bagus|keren|mantap|oke|tepat)|^bagus\b|^mantap\b/i;
const RATING_BAD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(jelek|salah|kurang\s*tepat|ngawur)|^salah\b|^jelek\b/i;

let personaCache = null;
let fewshotCache = null;

async function loadPersona() {
  if (personaCache) return personaCache;
  try {
    const res = await fetch(new URL('../dataset/persona.json', import.meta.url));
    personaCache = res.ok ? await res.json() : null;
  } catch (e) {
    personaCache = null;
  }
  return personaCache || DEFAULT_PERSONA;
}

async function loadFewshot() {
  if (fewshotCache) return fewshotCache;
  try {
    const res = await fetch(new URL('../dataset/fewshot.json', import.meta.url));
    const data = res.ok ? await res.json() : [];
    fewshotCache = Array.isArray(data) ? data : [];
  } catch (e) {
    fewshotCache = [];
  }
  return fewshotCache;
}

function matchFewshot(examples, text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  let best = null;
  let bestScore = 0;
  examples.forEach((ex) => {
    const hay = String(ex.q || '').toLowerCase();
    const score = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  });
  return bestScore > 0 ? best : null;
}

function detectRating(text) {
  const t = text.trim();
  if (RATING_GOOD_RE.test(t)) return true;
  if (RATING_BAD_RE.test(t)) return false;
  return null;
}

function looksLikeMath(t) {
  const stripped = t.replace(/^(hitung|berapa)\s*/i, '').trim();
  return stripped.length > 0 && /[0-9]/.test(stripped) && /^[0-9()\s+\-*/.]+$/.test(stripped);
}

function detectTool(prompt) {
  const t = String(prompt || '').trim().toLowerCase();
  if (/^(ringkas(kan)?|rangkum(kan)?)\s+(percakapan|chat)\b/.test(t)) return 'ringkas_percakapan';
  if (/^ringkas(kan)?\b|^rangkum(kan)?\b/.test(t)) return 'ringkas';
  if (/ekspor\s+log|export\s+log|unduh\s+log/.test(t)) return 'ekspor';
  if (/^ingat\s+(bahwa\s+)?/.test(t)) return 'ingat';
  if (/^lupakan\b/.test(t)) return 'lupakan';
  if (/\bjam\s+berapa\b|\btanggal\s+berapa\b|\bhari\s+apa\b/.test(t)) return 'waktu';
  if (/apa\s+yang\s+kamu\s+tahu\s+tentang\b/.test(t)) return 'cari';
  if (/^hitung\b/.test(t) || /%\s*dari\b/.test(t) || looksLikeMath(t)) return 'hitung';
  if (/^bandingkan\s+/.test(t)) return 'bandingkan';
  if (/^(kelebihan|kekurangan)\s*(dan|\/|serta)?\s*(kelebihan|kekurangan)?\s+/.test(t)) return 'kelebihan_kekurangan';
  if (/^(cara|langkah)\s+/.test(t)) return 'cara';
  if (/^(kasih|beri|berikan|boleh|minta)?\s*ide\b/.test(t)) return 'ide';
  if (/^jelaskan\s+/.test(t)) return 'jelaskan';
  return null;
}

async function runTool(kind, prompt, messages) {
  if (kind === 'ringkas') return agentTools.ringkas(prompt.replace(/^(ringkas(kan)?|rangkum(kan)?)\s*:?\s*/i, ''));
  if (kind === 'ringkas_percakapan') return agentTools.ringkasPercakapan(messages);
  if (kind === 'hitung') return agentTools.hitung(prompt);
  if (kind === 'waktu') return agentTools.waktu(prompt);
  if (kind === 'cari') return agentTools.cari(prompt.replace(/apa\s+yang\s+kamu\s+tahu\s+tentang\s*/i, ''));
  if (kind === 'ingat') return agentTools.ingat(prompt);
  if (kind === 'lupakan') return agentTools.lupakan(prompt);
  if (kind === 'ekspor') return agentTools.eksporLog();
  if (kind === 'jelaskan') {
    const topic = prompt
      .replace(/^jelaskan\s*/i, '')
      .replace(/^apa\s+itu\s*/i, '')
      .replace(/^tentang\s*/i, '')
      .trim();
    return agentTools.jelaskan(topic);
  }
  if (kind === 'cara') {
    const topic = prompt.replace(/^(cara|langkah)\s*(untuk|buat|biar)?\s*/i, '').trim();
    return agentTools.cara(topic);
  }
  if (kind === 'ide') {
    const topic = prompt
      .replace(/^(kasih|beri|berikan|boleh|minta)\s+/i, '')
      .replace(/ide\s+(konten\s+)?(tentang|soal|untuk)?\s*/i, '')
      .trim();
    return agentTools.ide(topic);
  }
  if (kind === 'bandingkan') {
    const m = prompt.match(/^bandingkan\s+(.+?)\s+(dan|dengan|vs\.?|atau)\s+(.+)$/i);
    return m ? agentTools.bandingkan(m[1].trim(), m[3].trim()) : null;
  }
  if (kind === 'kelebihan_kekurangan') {
    const topic = prompt
      .replace(/^(kelebihan|kekurangan)\s*(dan|\/|serta)?\s*(kelebihan|kekurangan)?\s*/i, '')
      .trim();
    return agentTools.kelebihanKekurangan(topic);
  }
  return null;
}

function recallFromMemory(text) {
  const t = text.toLowerCase();
  if (/siapa nama saya|nama saya siapa/.test(t)) {
    const nama = memoryLong.recall('nama');
    return nama ? 'Nama kamu ' + nama + ', setahu saya dari percakapan sebelumnya.' : null;
  }
  if (/apa yang saya suka|saya suka apa/.test(t)) {
    const suka = memoryLong.recall('suka');
    return suka && suka.length ? 'Setahu saya kamu suka ' + suka.join(', ') + '.' : null;
  }
  if (/kerja\s+sebagai\s+apa\s+saya|saya\s+kerja\s+sebagai\s+apa/.test(t)) {
    const pekerjaan = memoryLong.recall('pekerjaan');
    return pekerjaan ? 'Setahu saya kamu kerja sebagai ' + pekerjaan + '.' : null;
  }
  if (/saya\s+tinggal\s+dimana|dimana\s+saya\s+tinggal/.test(t)) {
    const kota = memoryLong.recall('kota');
    return kota ? 'Setahu saya kamu tinggal di ' + kota + '.' : null;
  }
  return null;
}

function acknowledgeFact(text) {
  const nameMatch = text.match(/(?:nama\s+saya|panggil\s+saya)\s+([a-zA-Z]{2,20})/i);
  if (nameMatch) return 'Baik, ' + nameMatch[1] + '! Senang kenal denganmu. Ada yang bisa saya bantu?';
  const jobMatch = text.match(/saya\s+kerja\s+sebagai\s+([a-zA-Z0-9\s]{2,40})/i);
  if (jobMatch) return 'Oh, kerja sebagai ' + jobMatch[1].trim() + ' ya, keren! Ada yang bisa saya bantu?';
  const cityMatch = text.match(/saya\s+tinggal\s+di\s+([a-zA-Z\s]{2,40})/i);
  if (cityMatch) return 'Noted, kamu tinggal di ' + cityMatch[1].trim() + '. Ada yang bisa saya bantu?';
  const likeMatch = text.match(/saya\s+suka\s+([a-zA-Z0-9\s]{2,40})/i);
  if (likeMatch) return 'Asyik, dicatat ya kamu suka ' + likeMatch[1].trim() + '. Ada yang bisa saya bantu?';
  return null;
}

function personalize(reply, text) {
  const isGreetingLike = /^(halo|hai|hi|hey|selamat|met|good|assalamu)/i.test(text.trim());
  const nama = memoryLong.recall('nama');
  if (isGreetingLike && nama && !reply.includes(nama)) {
    reply = reply.replace(/([!,])/, ', ' + nama + '$1');
  }
  if (!isGreetingLike && Math.random() < 0.15) {
    const suka = memoryLong.recall('suka');
    const pekerjaan = memoryLong.recall('pekerjaan');
    if (suka && suka.length) {
      reply += ' (Ngomong-ngomong, kudengar kamu suka ' + suka[suka.length - 1] + ' ya?)';
    } else if (pekerjaan) {
      reply += ' (Btw, gimana kabar kerjaan sebagai ' + pekerjaan + '?)';
    }
  }
  return reply;
}

function postProcess(text) {
  const cleaned = String(text || '').trim();
  return cleaned || 'Maaf, saya belum punya jawaban untuk itu. Bisa dijelaskan lebih lanjut?';
}

async function respond(messages, prompt) {
  const text = String(prompt || '').trim();
  if (!text) return postProcess('');

  const rating = detectRating(text);
  if (rating !== null) {
    ragetDb.rateLast(rating);
    const reply = rating
      ? 'Terima kasih atas masukannya, senang bisa membantu!'
      : 'Maaf jawaban sebelumnya kurang pas. Bisa dijelaskan lebih lanjut apa yang salah supaya saya bisa perbaiki?';
    ragetDb.addNote(text, reply, null, 'feedback');
    return postProcess(reply);
  }

  memoryLong.learnFromText(text);

  const toolKind = detectTool(text);
  if (toolKind) {
    const toolReply = await runTool(toolKind, text, messages);
    if (toolReply) {
      ragetDb.addNote(text, toolReply, null, toolKind);
      return postProcess(toolReply);
    }
  }

  const recalled = recallFromMemory(text);
  if (recalled) {
    ragetDb.addNote(text, recalled, null, 'recall');
    return postProcess(recalled);
  }

  const acknowledged = acknowledgeFact(text);
  if (acknowledged) {
    ragetDb.addNote(text, acknowledged, null, 'personalize');
    return postProcess(acknowledged);
  }

  const persona = await loadPersona();
  const shortContext = memoryShort.recent(messages, 10);
  let raw = await llmEngine.generate(shortContext, text, { personaName: persona.name });

  if (llmEngine.isWeak(raw)) {
    const fewshot = await loadFewshot();
    const example = matchFewshot(fewshot, text);
    if (example && example.a) raw = example.a;
  }

  let reply = postProcess(raw);
  reply = personalize(reply, text);

  const relevant = await memoryIndex.search(text, 2);
  if (relevant.length) {
    reply += '\n\n(Catatan terkait: ' + relevant[0].text.slice(0, 120) + ')';
  }

  ragetDb.addNote(text, reply, null, 'chat');
  return reply;
}

export const agent = Object.freeze({
  respond,
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.agent = agent;
}

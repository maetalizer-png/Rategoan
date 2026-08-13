import { llmEngine } from '../rategoan-llm/llm-engine.js';
import { memoryShort } from '../raget-memory/memory-short.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { memoryIndex } from '../raget-memory/memory-index.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { agentTools } from './agent-tools.js';

const DEFAULT_PERSONA = { name: 'Raget', style: 'ramah dan ringkas', rules: [] };

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

function detectTool(prompt) {
  const t = String(prompt || '').trim().toLowerCase();
  if (/^ringkas(kan)?\b/.test(t)) return 'ringkas';
  if (/^hitung\b/.test(t) || /^[0-9()\s+\-*/.]+$/.test(t)) return 'hitung';
  if (/\btanggal\b|\bjam berapa\b|\bhari ini\b/.test(t)) return 'tanggal';
  return null;
}

function runTool(kind, prompt) {
  if (kind === 'ringkas') return agentTools.ringkas(prompt.replace(/^ringkas(kan)?\s*:?\s*/i, ''));
  if (kind === 'hitung') return agentTools.hitung(prompt.replace(/^hitung\s*/i, ''));
  if (kind === 'tanggal') return agentTools.tanggal();
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
  return null;
}

function postProcess(text) {
  const cleaned = String(text || '').trim();
  return cleaned || 'Maaf, saya belum punya jawaban untuk itu. Bisa dijelaskan lebih lanjut?';
}

async function respond(messages, prompt) {
  const text = String(prompt || '').trim();
  if (!text) return postProcess('');

  memoryLong.learnFromText(text);

  const toolKind = detectTool(text);
  if (toolKind) {
    const toolReply = runTool(toolKind, text);
    if (toolReply) {
      ragetDb.addNote(text, toolReply, null);
      return postProcess(toolReply);
    }
  }

  const recalled = recallFromMemory(text);
  if (recalled) {
    ragetDb.addNote(text, recalled, null);
    return postProcess(recalled);
  }

  const persona = await loadPersona();
  const shortContext = memoryShort.recent(messages, 10);
  let raw = await llmEngine.generate(shortContext, text, { personaName: persona.name });

  if (llmEngine.isFallback(raw)) {
    const fewshot = await loadFewshot();
    const example = matchFewshot(fewshot, text);
    if (example && example.a) raw = example.a;
  }

  let reply = postProcess(raw);

  const relevant = await memoryIndex.search(text, 2);
  if (relevant.length) {
    reply += '\n\n(Catatan terkait: ' + relevant[0].text.slice(0, 120) + ')';
  }

  ragetDb.addNote(text, reply, null);
  return reply;
}

export const agent = Object.freeze({
  respond,
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.agent = agent;
}

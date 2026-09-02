// Planner Agentic AI - memecah goal jadi steps{id, description, tool, input}.
// Nama file sengaja BUKAN "planner.js" supaya tidak tabrakan dengan
// raget-agents/planner.js (itu untuk fallback jawaban satu-giliran, beda
// tujuan sama sekali - lihat PROMPT-RATEGOAN-AGENTIC-AI.md §STRUKTUR FILE).
import { toolsMath } from '../raget-agents/tools-math.js';
import { TASK_TYPES } from './task-model.js';

const MEMORY_WORD_RE = /\bingat(lah)?\b|\bcatat(kan)?\s+(bahwa|kalau)\b|simpan\s+sebagai\s+catatan/i;
const CONNECTOR_SPLIT_RE = /\s*(?:,|;|\bdan\b|\blalu\b|\bkemudian\b)\s*/i;

function pickToolFor(text) {
  if (toolsMath.isMathQuestion(text.toLowerCase())) return 'math';
  if (MEMORY_WORD_RE.test(text)) return 'memory';
  if (/\bjam\s+berapa\b|\btanggal\s+berapa\b|\bhari\s+apa\b|\bhari\s+ini\b/i.test(text)) return 'datetime';
  return 'knowledge';
}

function stepOf(id, description, toolOverride) {
  const tool = toolOverride || pickToolFor(description);
  const input = tool === 'memory'
    ? { action: /ingat|catat|simpan/i.test(description) && !/apa\s+yang/i.test(description) ? 'write' : 'read', value: description }
    : { query: description };
  return { id, description: description.trim(), tool, input, status: 'pending' };
}

function extractDayCount(goal, maxSteps) {
  const m = goal.match(/(\d+)\s*(hari|langkah|step)/i);
  const n = m ? parseInt(m[1], 10) : 7;
  return Math.max(1, Math.min(n, maxSteps));
}

// "Rencana N hari" tidak bisa dijawab lewat lookup faktual (knowledge/
// retrieval) - topiknya generik dan tidak ada di korpus. Planner sendiri
// yang menyusun kerangka harian secara deterministik lokal (tool "compose",
// bukan LLM eksternal, bukan hasil dikarang per topik - murni template
// tahapan belajar generik), sesuai kapasitas nyata Rategoan (rule-based +
// template, NEURAL_ANSWERS_ENABLED masih false - lihat js/ai/ai.js).
function extractTopic(goal) {
  return goal
    .replace(/\b(susun|buatkan|buat)\s+/gi, '')
    .replace(/\brencana\b/gi, '')
    .replace(/\d+\s*hari/gi, '')
    .replace(/[.?!]+$/, '')
    .trim() || 'topik ini';
}

function buildPlan(goal, taskType, budget) {
  const t = String(goal || '').trim();
  const maxSteps = budget.maxSteps;

  if (taskType === TASK_TYPES.SIMPLE) {
    return [stepOf('step1', t, 'math')];
  }

  if (taskType === TASK_TYPES.RETRIEVAL) {
    return [stepOf('step1', t)];
  }

  if (/\b(rencana|jadwal|itinerary)\b/i.test(t) && /\bhari\b/i.test(t)) {
    const days = extractDayCount(t, maxSteps);
    const topic = extractTopic(t);
    return Array.from({ length: days }, (_, i) => ({
      id: 'step' + (i + 1),
      description: 'Susun agenda hari ke-' + (i + 1) + ' untuk ' + topic,
      tool: 'compose',
      input: { topic, index: i + 1, total: days },
      status: 'pending',
    }));
  }

  const parts = t.split(CONNECTOR_SPLIT_RE).map((p) => p.trim()).filter(Boolean);
  const clauses = parts.length > 1 ? parts : [t];
  return clauses.slice(0, maxSteps).map((p, i) => stepOf('step' + (i + 1), p));
}

export const agenticPlanner = Object.freeze({
  buildPlan,
  pickToolFor,
});

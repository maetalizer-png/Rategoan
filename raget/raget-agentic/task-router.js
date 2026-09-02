// Klasifikasi task SIMPLE / RETRIEVAL / MULTI-STEP - dipakai agentic-core
// untuk memutuskan apakah goal butuh agent loop penuh atau cukup satu tool
// call langsung (spec: "Simple task tidak perlu agent loop berlebihan").
import { toolsMath } from '../raget-agents/tools-math.js';
import { TASK_TYPES } from './task-model.js';

const MULTISTEP_PLAN_RE = /\b(rencana|jadwal|itinerary)\b/i;
const MULTISTEP_UNIT_RE = /\d+\s*(hari|minggu|bulan|langkah|step)\b/i;
const MULTISTEP_STEPWISE_RE = /langkah\s*demi\s*langkah|step\s*by\s*step/i;
const MULTISTEP_BUILD_RE = /\b(susun|buatkan|buat)\s+rencana\b/i;
const CONNECTOR_SPLIT_RE = /\s+(?:dan|lalu|kemudian)\s+/i;

function isMultiStepGoal(text) {
  if (MULTISTEP_STEPWISE_RE.test(text)) return true;
  if (MULTISTEP_BUILD_RE.test(text)) return true;
  if (MULTISTEP_PLAN_RE.test(text) && MULTISTEP_UNIT_RE.test(text)) return true;
  const parts = text.split(CONNECTOR_SPLIT_RE).map((p) => p.trim()).filter(Boolean);
  return parts.length > 2;
}

function classifyTask(goal) {
  const t = String(goal || '').trim();
  if (!t) return TASK_TYPES.RETRIEVAL;
  if (/^hitung\b/i.test(t) || toolsMath.isMathQuestion(t.toLowerCase())) return TASK_TYPES.SIMPLE;
  if (isMultiStepGoal(t)) return TASK_TYPES.MULTI_STEP;
  return TASK_TYPES.RETRIEVAL;
}

export const taskRouter = Object.freeze({
  classifyTask,
  isMultiStepGoal,
});

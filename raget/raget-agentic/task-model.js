// Model Task terstruktur untuk Agentic AI - state eksplisit (bukan rangkaian
// boolean) sesuai PROMPT-RATEGOAN-AGENTIC-AI.md.
export const STATES = Object.freeze({
  IDLE: 'idle',
  UNDERSTANDING: 'understanding',
  PLANNING: 'planning',
  EXECUTING: 'executing',
  OBSERVING: 'observing',
  VERIFYING: 'verifying',
  REPLANNING: 'replanning',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
});

export const TASK_TYPES = Object.freeze({
  SIMPLE: 'SIMPLE',
  RETRIEVAL: 'RETRIEVAL',
  MULTI_STEP: 'MULTI-STEP',
});

export const BUDGET = Object.freeze({
  maxRetries: 3,
  maxSteps: 8,
  maxToolCalls: 16,
  timeoutMs: 45000,
});

function makeId() {
  return 'agt' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function createTask(goal) {
  const now = Date.now();
  return {
    id: makeId(),
    goal: String(goal || '').trim(),
    taskType: null,
    status: STATES.IDLE,
    steps: [],
    currentStep: 0,
    observations: [],
    toolCalls: [],
    retries: 0,
    result: null,
    verification: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function isValidTask(t) {
  return (
    !!t &&
    typeof t.id === 'string' &&
    typeof t.goal === 'string' &&
    typeof t.status === 'string' &&
    Array.isArray(t.steps) &&
    Array.isArray(t.observations) &&
    Array.isArray(t.toolCalls)
  );
}

export function touch(task, patch) {
  Object.assign(task, patch, { updatedAt: Date.now() });
  return task;
}

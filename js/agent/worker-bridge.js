const DB = 'rategoan_db';
const STORE = 'agent_runs';

function saveRun(record) {
  return new Promise((resolve) => {
    if (!indexedDB) { resolve(); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onerror = () => resolve();
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    };
  });
}

function fallbackSteps(detail) {
  return [
    { kind: 'EMIT_THOUGHT', text: 'Peramban tidak membuka worker. Lanjut di utas utama.' },
    { kind: 'EMIT_STATUS', text: detail.think ? 'Berpikir di utas utama.' : 'Siap menjawab.', progress: 1 },
  ];
}

export function runAgentPlan(detail) {
  const started = Date.now();
  const steps = [];
  return new Promise((resolve) => {
    let worker = null;
    let timer = null;
    const finish = (status) => {
      if (timer) clearTimeout(timer);
      if (worker) {
        worker.terminate();
        worker = null;
      }
      const record = {
        id: started + '-' + Math.random().toString(36).slice(2, 8),
        sessionId: detail.sessionId || '',
        text: String(detail.text || '').slice(0, 500),
        status,
        steps,
        started,
        finished: Date.now(),
      };
      saveRun(record).then(() => resolve({ status, steps, ms: Date.now() - started }));
    };
    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => finish('kedaluwarsa'), 45000);
    };
    try {
      worker = new Worker(new URL('./agent-worker.js', import.meta.url));
    } catch (e) {
      worker = null;
    }
    if (!worker) {
      fallbackSteps(detail).forEach((step) => steps.push(step));
      if (detail.onStep) detail.onStep(steps.slice());
      setTimeout(() => finish('fallback'), 0);
      return;
    }
    worker.onmessage = (event) => {
      arm();
      const msg = event.data || {};
      if (msg.kind === 'FINAL_RESPONSE') {
        finish('selesai');
        return;
      }
      steps.push(msg);
      if (detail.onStep) detail.onStep(steps.slice());
    };
    worker.onerror = () => finish('galat');
    arm();
    worker.postMessage({
      text: detail.text || '',
      think: !!detail.think,
      research: !!detail.research,
      files: detail.files || '',
    });
  });
}

export function stopAgent(holder) {
  if (holder && holder.worker) {
    holder.worker.terminate();
    holder.worker = null;
  }
}

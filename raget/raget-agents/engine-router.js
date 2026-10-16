import { neuralAdapter } from '../raget-neural/neural-adapter.js';
import { engineContract } from './engine-contract.js';

function registerAdapter(adapter) {
  if (!engineContract.isValidAdapter(adapter)) {
    const id = adapter && adapter.id ? adapter.id : '?';
    throw new Error('Adapter cacat kontrak: ' + id + '. Wajib ada id, label, init(), ask(), status().');
  }
  return adapter;
}

const ADAPTERS_BY_ID = Object.freeze({
  neural: registerAdapter(neuralAdapter),
});

function routePlan() {
  return { engine: 'neural', fast: false, weights: false, download: false };
}

function orderedAdapters() {
  return [ADAPTERS_BY_ID.neural];
}

async function ask(prompt, context) {
  const tried = [];
  for (const adapter of orderedAdapters(prompt)) {
    if (!engineContract.isValidAdapter(adapter)) {
      tried.push({ id: (adapter && adapter.id) || '?', ready: false, reason: 'gagal isValidAdapter()' });
      continue;
    }
    let st;
    try {
      st = adapter.status();
    } catch (e) {
      st = { ready: false, reason: 'status() melempar error: ' + (e && e.message) };
    }
    if (!st || !st.ready) {
      tried.push({ id: adapter.id, ready: false, reason: st && st.reason });
      continue;
    }
    try {
      const reply = await adapter.ask(prompt, context);
      if (reply) return { reply, engine: adapter.id, tried };
      if (adapter.id === 'neural') return { reply: null, engine: adapter.id, tried };
      tried.push({ id: adapter.id, ready: true, error: 'ask() mengembalikan kosong' });
    } catch (e) {
      tried.push({ id: adapter.id, ready: true, error: e && e.message });
    }
  }
  throw new Error(
    'Semua adapter otak AI gagal termasuk Raget 1.0 Kilat - seharusnya tidak pernah terjadi. Riwayat percobaan: ' +
      JSON.stringify(tried)
  );
}

function statusAll() {
  return [ADAPTERS_BY_ID.neural].map((a) => {
    let st;
    try {
      st = a.status();
    } catch (e) {
      st = { ready: false, reason: 'status() melempar error: ' + (e && e.message) };
    }
    return Object.assign({ id: a.id, label: a.label }, st);
  });
}

export const engineRouter = Object.freeze({
  ask,
  statusAll,
  routePlan,
  adapters: ADAPTERS_BY_ID,
});

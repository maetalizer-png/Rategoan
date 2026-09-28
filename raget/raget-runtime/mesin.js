const SERVER_KEY = 'rategoan_server_base';

function serverBase() {
  try { return String(localStorage.getItem(SERVER_KEY) || '').replace(/\/+$/, ''); } catch (e) { return ''; }
}

function setServerBase(url) {
  localStorage.setItem(SERVER_KEY, String(url || '').trim());
}

async function serverCall(path, body) {
  const base = serverBase();
  if (!base) return { ok: false, needsServer: true, reason: 'Server sendiri belum dipasang.' };
  try {
    const res = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) return { ok: false, needsServer: true, reason: 'HTTP ' + res.status };
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, needsServer: true, reason: e && e.message ? e.message : 'gagal' };
  }
}

function compose(parts) {
  const list = (parts || []).filter((p) => p && String(p.text || '').trim());
  if (!list.length) return '';
  return list.map((p) => {
    const head = p.title ? p.title + '\n' : '';
    return head + String(p.text).trim();
  }).join('\n\n');
}

const JOB_KEY = 'rategoan_outbox';
function jobs() {
  try { return JSON.parse(localStorage.getItem(JOB_KEY) || '[]'); } catch (e) { return []; }
}
function queueJob(kind, payload, when) {
  const item = { id: 'j' + Date.now().toString(36), kind, payload, when: when || Date.now(), sent: false };
  const list = jobs();
  list.push(item);
  localStorage.setItem(JOB_KEY, JSON.stringify(list.slice(-50)));
  return item;
}
async function flushJobs() {
  const list = jobs();
  const left = [];
  for (const j of list) {
    if (j.sent) continue;
    const r = await serverCall('/v1/outbox', j);
    if (r.ok) j.sent = true;
    else left.push(j);
  }
  localStorage.setItem(JOB_KEY, JSON.stringify(left));
  return { sent: list.length - left.length, waiting: left.length, needsServer: !serverBase() };
}

const MACHINES = [
  { id: 'otak-template', host: 'client', ready: true, note: 'Raget Template' },
  { id: 'otak-1.0', host: 'client', ready: true, note: 'Raget 1.0 checkpoint' },
  { id: 'perencana', host: 'client', ready: true, note: 'flow-hub + turn-pipeline' },
  { id: 'bahan', host: 'client', ready: true, note: 'file, wiki, koleksi, chat' },
  { id: 'perangkai', host: 'client', ready: true, note: 'compose lokal; multi-sumber penuh belakangan' },
  { id: 'kanvas', host: 'client', ready: true, note: 'slide + artefak' },
  { id: 'ingat', host: 'client', ready: true, note: 'memory-long + proyek' },
  { id: 'belajar', host: 'client', ready: true, note: 'lesson dari bahan' },
  { id: 'jadwal', host: 'client', ready: true, note: 'antrian lokal; kirim lewat server' },
  { id: 'konektor', host: 'server', ready: false, note: 'Drive/WA setelah server sendiri' },
  { id: 'kode', host: 'client', ready: false, note: 'studio belakangan' },
];

export const mesin = Object.freeze({
  list: () => MACHINES.map((m) => ({ ...m, server: !!serverBase() })),
  serverBase,
  setServerBase,
  serverCall,
  compose,
  queueJob,
  flushJobs,
  jobs,
});

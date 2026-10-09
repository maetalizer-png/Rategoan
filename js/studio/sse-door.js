import { sha256Sync } from './vfs-git.js';

export function parseSseBlock(block) {
  const lines = String(block || '').split('\n');
  let event = 'message';
  const data = [];
  lines.forEach((line) => {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trim());
  });
  let payload = data.join('\n');
  try { payload = JSON.parse(payload); } catch (e) { /* teks biasa tetap sah */ }
  return { event, payload };
}

export function chooseDoor(online, prefer) {
  if (online === false) return 'local';
  if (prefer === 'local') return 'local';
  return 'center';
}

export function routeDoor(online) {
  return chooseDoor(online === true, online === true ? 'center' : 'local');
}

export function failoverStream(state, event) {
  const phase = (state && state.phase) || 'DOOR_B_STREAMING';
  const seq = (state && state.seq) || 0;
  const door = (state && state.door) || 'center';
  if (event === 'NETWORK_FAILURE' && phase === 'DOOR_B_STREAMING') {
    return { phase: 'RESUME_CURSOR', seq, door: 'local' };
  }
  if ((event === 'resume' || event === 'RESUME_CURSOR') && phase === 'RESUME_CURSOR') {
    return { phase: 'DOOR_A_LOCAL_WEBGPU', seq, door: 'local' };
  }
  if (event === 'verify' && phase === 'DOOR_A_LOCAL_WEBGPU') {
    return { phase: 'VERIFY', seq, door: 'local' };
  }
  if (event === 'commit' && phase === 'VERIFY') {
    return { phase: 'ATOMIC_COMMIT', seq, door: 'local' };
  }
  return { phase, seq, door };
}

export function resumeCursor(prior) {
  const seen = (prior && prior.seen) || [];
  let seq = 0;
  seen.forEach((key) => {
    const part = String(key).split(':').pop();
    const n = Number(part);
    if (n > seq) seq = n;
  });
  return seq;
}

export function reduceStream(raw, prior) {
  const seen = new Set((prior && prior.seen) || []);
  const state = {
    text: '',
    tools: [],
    diffs: [],
    door: (prior && prior.door) || 'center',
    runId: (prior && prior.runId) || '',
    seen: [],
  };
  String(raw || '').split(/\n\n+/).forEach((block) => {
    if (!block.trim()) return;
    const msg = parseSseBlock(block);
    const payload = msg.payload && typeof msg.payload === 'object' ? msg.payload : {};
    if (payload.run_id) state.runId = String(payload.run_id);
    if (payload.idempotency_key) {
      const mark = 'idem:' + payload.idempotency_key;
      if (seen.has(mark)) return;
      seen.add(mark);
    }
    if (payload.seq != null) {
      const key = (state.runId || '') + ':' + msg.event + ':' + payload.seq;
      if (seen.has(key)) return;
      seen.add(key);
    }
    if (msg.event === 'token') state.text += payload.text || '';
    else if (msg.event === 'tool') state.tools.push(payload);
    else if (msg.event === 'diff') state.diffs.push(payload);
    else if (msg.event === 'door') state.door = payload.door || state.door;
  });
  state.seen = Array.from(seen);
  return state;
}

export function stampToolCall(name, args) {
  const body = Object.assign({}, args || {});
  delete body.nonce;
  delete body.idempotency_key;
  const key = sha256Sync(String(name || '') + '\n' + JSON.stringify(body));
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  body.idempotency_key = key;
  body.nonce = Array.from(bytes, (n) => n.toString(16).padStart(2, '0')).join('');
  return body;
}


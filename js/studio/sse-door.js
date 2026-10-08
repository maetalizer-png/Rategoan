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


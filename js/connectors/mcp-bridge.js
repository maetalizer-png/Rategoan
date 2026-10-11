export function handshakeMcp(secret, offered, url) {
  const token = String(secret || '');
  const got = String(offered || '');
  const host = String(url || '');
  if (!token || token !== got) return { ok: false, reason: 'token' };
  if (!/^wss?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(host)) return { ok: false, reason: 'host' };
  return { ok: true, transport: 'websocket', url: host };
}

export function planHeartbeat(secret, offered, url) {
  const gate = handshakeMcp(secret, offered, url);
  if (!gate.ok) return gate;
  return { ok: true, intervalMs: 15000, reconnect: true, url: gate.url };
}

export function createMcpClient(url, secret) {
  const gate = handshakeMcp(secret, secret, url);
  const card = {
    ok: gate.ok,
    reason: gate.reason,
    transport: 'websocket',
    protocol: 'json-rpc-2.0',
    url: gate.url || '',
  };
  if (!gate.ok) return card;
  let socket = null;
  let seq = 0;
  const waiters = new Map();
  function take(raw) {
    let msg = null;
    try { msg = JSON.parse(String(raw || '')); } catch (e) { msg = null; }
    if (!msg || msg.jsonrpc !== '2.0' || !waiters.has(msg.id)) return;
    const slot = waiters.get(msg.id);
    waiters.delete(msg.id);
    if (msg.error) slot.reject(new Error(msg.error.message || 'rpc'));
    else slot.resolve(msg.result);
  }
  card.connect = function connect(SocketImpl) {
    const WS = SocketImpl || globalThis.WebSocket;
    if (typeof WS !== 'function') return Promise.reject(new Error('websocket'));
    socket = new WS(gate.url);
    if (typeof socket.addEventListener === 'function') {
      socket.addEventListener('message', (ev) => take(ev && ev.data));
    } else {
      socket.onmessage = (ev) => take(ev && ev.data);
    }
    return new Promise((resolve, reject) => {
      const open = () => resolve({ ok: true, protocol: 'json-rpc-2.0' });
      const fail = () => reject(new Error('websocket'));
      if (typeof socket.addEventListener === 'function') {
        socket.addEventListener('open', open);
        socket.addEventListener('error', fail);
      } else {
        socket.onopen = open;
        socket.onerror = fail;
      }
    });
  };
  card.request = function request(method, params) {
    if (!socket || socket.readyState !== 1) return Promise.reject(new Error('websocket'));
    const id = seq + 1;
    seq = id;
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id,
      method: String(method || ''),
      params: params || {},
    });
    return new Promise((resolve, reject) => {
      waiters.set(id, { resolve, reject });
      socket.send(body);
    });
  };
  return card;
}
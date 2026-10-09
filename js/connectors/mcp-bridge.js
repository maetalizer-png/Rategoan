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
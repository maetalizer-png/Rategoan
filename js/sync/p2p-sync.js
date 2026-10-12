import { getWebCrypto } from '../crypto/get-web-crypto.js';

const mesh = { peers: 0, saved: 0 };

export function meshSnapshot() {
  return {
    status: mesh.peers > 0 ? 'aktif' : 'mencari',
    peers: mesh.peers,
    saved: mesh.saved,
  };
}

export function noteMeshPeer() {
  mesh.peers += 1;
  return meshSnapshot();
}

export function noteMeshSaved(bytes) {
  mesh.saved += Math.max(0, Number(bytes) || 0);
  return meshSnapshot();
}

export function relayChunk(channel, index, bytes) {
  const payload = {
    kind: 'model-chunk',
    index: Math.max(0, Math.floor(Number(index) || 0)),
    bytes: bytes ? bytes.byteLength || bytes.length || 0 : 0,
  };
  if (channel && typeof channel.send === 'function' && channel.readyState === 'open') {
    channel.send(JSON.stringify(payload));
    noteMeshSaved(payload.bytes);
    return { ok: true, local: false, index: payload.index, bytes: payload.bytes };
  }
  return { ok: false, local: true, index: payload.index, bytes: payload.bytes };
}

export function meshOffer(id) {
  return {
    id: String(id || 'peer'),
    transport: 'webrtc-datachannel',
    signaling: 'serverless',
    passkey: true,
    qr: true,
  };
}

export async function createSyncKey() {
  const box = await getWebCrypto();
  return box.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function sealProject(key, project) {
  const box = await getWebCrypto();
  const iv = box.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(project || {}));
  const data = new Uint8Array(await box.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  return { iv, data };
}

export async function openProject(key, pack) {
  const box = await getWebCrypto();
  const plain = await box.subtle.decrypt({ name: 'AES-GCM', iv: pack.iv }, key, pack.data);
  return JSON.parse(new TextDecoder().decode(plain));
}

export function createPeerLink(id) {
  const card = meshOffer(id);
  return {
    id: card.id,
    transport: card.transport,
    signaling: card.signaling,
    encryption: 'AES-GCM',
    async open(rtcConfig) {
      const RTC = globalThis.RTCPeerConnection;
      if (typeof RTC !== 'function') return { ok: false, reason: 'webrtc', encryption: 'AES-GCM' };
      const pc = new RTC(rtcConfig || { iceServers: [] });
      const channel = pc.createDataChannel('rategoan-project');
      const desc = await pc.createOffer();
      await pc.setLocalDescription(desc);
      return {
        ok: true,
        encryption: 'AES-GCM',
        channel,
        local: pc.localDescription,
        pc,
      };
    },
    seal(key, project) {
      return sealProject(key, project);
    },
  };
}
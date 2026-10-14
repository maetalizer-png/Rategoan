import { getWebCrypto } from '../crypto/get-web-crypto.js';
import { encode as encodeQr } from './qr-encoder.js';

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

const MESH_NAME = 'rategoan-mesh-sync';
const MESH_BUFFER_CAP = 2;
const meshIndex = new Set();
const meshBytes = new Map();
let meshBus = null;

function setBoundedMesh(key, payload) {
  if (!payload) return;
  if (meshBytes.has(key)) meshBytes.delete(key);
  meshBytes.set(key, payload);
  while (meshBytes.size > MESH_BUFFER_CAP) {
    const oldest = meshBytes.keys().next().value;
    meshBytes.delete(oldest);
  }
}

export function meshBufferCount() {
  return meshBytes.size;
}

export function openMeshBus() {
  if (meshBus) return meshBus;
  if (typeof BroadcastChannel !== 'function') return null;
  meshBus = new BroadcastChannel(MESH_NAME);
  meshBus.onmessage = (event) => {
    const msg = event.data || {};
    if (msg.kind !== 'model-chunk') return;
    meshIndex.add(msg.index);
    setBoundedMesh(msg.index, msg.payload);
    noteMeshSaved(msg.bytes);
  };
  return meshBus;
}

export function publishMeshChunk(index, bytes) {
  const key = Math.max(0, Math.floor(Number(index) || 0));
  const len = bytes ? (bytes.byteLength || bytes.length || 0) : 0;
  meshIndex.add(key);
  setBoundedMesh(key, bytes);
  const channel = openMeshBus();
  if (channel) channel.postMessage({ kind: 'model-chunk', index: key, bytes: len, payload: bytes || null });
  noteMeshSaved(len);
  return { ok: true, local: true, index: key, bytes: len, channel: MESH_NAME };
}

export function closeMeshBus() {
  if (!meshBus) return;
  meshBus.close();
  meshBus = null;
}

export function meshHasChunk(index) {
  return meshIndex.has(Math.max(0, Math.floor(Number(index) || 0)));
}

export function takeMeshChunk(index) {
  const key = Math.max(0, Math.floor(Number(index) || 0));
  const hit = meshBytes.get(key) || null;
  if (hit) meshBytes.delete(key);
  return hit;
}

export function encodeSdp(desc) {
  const body = JSON.stringify({ type: desc && desc.type, sdp: desc && desc.sdp });
  return btoa(unescape(encodeURIComponent(body)));
}

export function decodeSdp(text) {
  const body = decodeURIComponent(escape(atob(String(text || '').replace(/\s+/g, ''))));
  const obj = JSON.parse(body);
  if (!obj || (obj.type !== 'offer' && obj.type !== 'answer') || typeof obj.sdp !== 'string') {
    throw new Error('sdp');
  }
  return obj;
}

export function sdpQr(text) {
  const payload = String(text || '').slice(0, 1800);
  return encodeQr(payload, { border: 1 }).data;
}

export function paintSdpQr(canvas, text) {
  if (!canvas || typeof canvas.getContext !== 'function') return false;
  const modules = sdpQr(text);
  const n = modules.length;
  const scale = 3;
  canvas.width = n * scale;
  canvas.height = n * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111111';
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      if (modules[y][x]) ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return true;
}

export function mountMeshPanel(parent) {
  if (!parent || typeof document === 'undefined' || document.getElementById('btn-mesh-sdp')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'btn-mesh-sdp';
  btn.className = 'mesh-sync-btn';
  btn.textContent = 'Tukar SDP';
  const box = document.createElement('div');
  box.id = 'mesh-sdp-box';
  box.hidden = true;
  const canvas = document.createElement('canvas');
  canvas.id = 'mesh-sdp-qr';
  const area = document.createElement('textarea');
  area.id = 'mesh-sdp-text';
  area.rows = 4;
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.id = 'btn-mesh-copy';
  copy.textContent = 'Salin teks';
  const apply = document.createElement('button');
  apply.type = 'button';
  apply.id = 'btn-mesh-apply';
  apply.textContent = 'Impor SDP';
  box.append(canvas, area, copy, apply);
  btn.addEventListener('click', async () => {
    box.hidden = false;
    const opened = await createPeerLink('perangkat').open({ iceServers: [] });
    if (!opened || !opened.ok || !opened.local) {
      area.value = '';
      return;
    }
    const packed = encodeSdp(opened.local);
    area.value = packed;
    try { paintSdpQr(canvas, packed); } catch (e) { /* teks tetap sumber impor */ }
    copy.onclick = () => {
      const clip = navigator.clipboard;
      if (clip && clip.writeText) clip.writeText(packed).catch(() => area.select());
      else area.select();
    };
  });
  apply.addEventListener('click', () => {
    try {
      const desc = decodeSdp(area.value);
      box.dataset.sdpType = desc.type;
    } catch (e) {
      box.dataset.sdpType = '';
    }
  });
  parent.append(btn, box);
}
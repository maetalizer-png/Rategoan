import { sha256Sync } from '../js/studio/vfs-git.js';

function utf8(value) {
  return new TextEncoder().encode(String(value));
}

function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i += 1) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function u16(n) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function u32(n) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}

function concat(parts) {
  const len = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function asBytes(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return utf8(data == null ? '' : String(data));
}

export function buildZip(files) {
  const list = Array.isArray(files) ? files : [];
  const locals = [];
  const centrals = [];
  let offset = 0;
  list.forEach((file) => {
    const name = utf8(String(file.name || 'berkas.txt').replace(/\\/g, '/'));
    const data = asBytes(file.data);
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ]);
    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  });
  const centralDir = concat(centrals.length ? centrals : [new Uint8Array(0)]);
  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(list.length),
    u16(list.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  return concat([concat(locals.length ? locals : [new Uint8Array(0)]), centralDir, end]);
}

function readU16(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(offset, true);
}

function readU32(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}

export function listZipEntries(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const entries = [];
  let offset = 0;
  while (offset + 30 <= bytes.length) {
    if (readU32(bytes, offset) !== 0x04034b50) break;
    const method = readU16(bytes, offset + 8);
    const compSize = readU32(bytes, offset + 18);
    const nameLen = readU16(bytes, offset + 26);
    const extraLen = readU16(bytes, offset + 28);
    const nameStart = offset + 30;
    const name = new TextDecoder().decode(bytes.subarray(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    entries.push({ name, method, compSize, dataStart });
    offset = dataStart + compSize;
  }
  return entries;
}

export async function readZipText(buffer, wanted) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const entries = listZipEntries(bytes);
  const target = String(wanted || '');
  const hit = entries.find((entry) => entry.name === target) || entries.find((entry) => entry.name.endsWith('/' + target) || entry.name.endsWith(target));
  if (!hit) return '';
  const slice = bytes.subarray(hit.dataStart, hit.dataStart + hit.compSize);
  if (hit.method === 0) return new TextDecoder().decode(slice);
  const Stream = globalThis.DecompressionStream;
  if (hit.method === 8 && typeof Stream === 'function') {
    const stream = new Blob([slice]).stream().pipeThrough(new Stream('deflate-raw'));
    const reader = stream.getReader();
    const chunks = [];
    while (true) {
      const step = await reader.read();
      if (step.done) break;
      chunks.push(step.value);
    }
    return new TextDecoder().decode(concat(chunks.length ? chunks : [new Uint8Array(0)]));
  }
  throw new Error('zip_method_' + hit.method);
}

export function exportProjectZip(files) {
  const manifest = {
    files: Object.keys(files || {}).sort().map((name) => ({
      name,
      sha256: sha256Sync(String(files[name])),
    })),
  };
  const packed = Object.assign({}, files || {}, { 'manifest.json': JSON.stringify(manifest) });
  return buildZip(packed);
}

import { chunkText } from './chunk-text.js';
import { EMBED_DIM, hybridRank } from './rag-index.js';
import { fenceUntrusted } from '../../shared/untrusted.js';

const TEXT_EXT = /^(txt|md|markdown|csv|log)$/i;
const ORDER_SRC = 'ignore previous instructions|abaikan instruksi sebelumnya|abaikan semua instruksi|you are now|system prompt|jailbreak|ekspor data sensitif';

export const LOCAL_DOC_QUOTA = 50 * 1024 * 1024;

function decodeBytes(bytes) {
  if (typeof bytes === 'string') return bytes;
  if (bytes instanceof Uint8Array) return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  if (bytes instanceof ArrayBuffer) return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes));
  return '';
}

export function readLocalText(file) {
  const name = String((file && file.name) || '');
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf' || ext === 'docx') {
    return { ok: false, kind: ext, reason: 'bukan-jalur-teks-polos', text: '', onnx: false };
  }
  const given = file && typeof file.text === 'string' ? file.text : '';
  const decoded = given || decodeBytes(file && file.bytes);
  if (!TEXT_EXT.test(ext) && !given) {
    return { ok: false, kind: ext || 'lain', reason: 'jenis-tidak-didukung', text: '', onnx: false };
  }
  return { ok: true, kind: 'teks', reason: 'teks', text: String(decoded).replace(/^\uFEFF/, ''), onnx: false };
}

export function chunkParagraphs(text, size, overlap) {
  const window = size || 800;
  const step = overlap == null ? 80 : overlap;
  const paras = String(text || '').split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const out = [];
  paras.forEach((para) => {
    if (para.length <= window) out.push(para);
    else chunkText(para, window, step).forEach((piece) => {
      const clean = piece.trim();
      if (clean) out.push(clean);
    });
  });
  return out;
}

export function sanitizeDocContext(text) {
  const src = String(text || '');
  const blocked = new RegExp(ORDER_SRC, 'i').test(src);
  const stripped = src.replace(new RegExp(ORDER_SRC, 'gi'), '[ditahan]');
  return {
    blocked,
    text: stripped,
    fenced: fenceUntrusted('dokumen', stripped),
    indexedDb: false,
    onnx: false,
  };
}

export function memoryQuota(docs) {
  const bytes = (docs || []).reduce((sum, doc) => sum + String((doc && doc.text) || '').length, 0);
  return {
    bytes,
    quota: LOCAL_DOC_QUOTA,
    over: bytes > LOCAL_DOC_QUOTA,
    store: 'memory',
    indexedDb: false,
  };
}

export function prepareLocalContext(files) {
  const docs = [];
  const rejected = [];
  (files || []).forEach((file, index) => {
    const read = readLocalText(file);
    if (!read.ok) {
      rejected.push({ name: file && file.name, reason: read.reason });
      return;
    }
    const safe = sanitizeDocContext(read.text);
    chunkParagraphs(safe.text).forEach((part, partIndex) => {
      docs.push({
        id: String(index) + ':' + partIndex,
        name: (file && file.name) || 'dokumen',
        text: part,
        blocked: safe.blocked,
      });
    });
  });
  return {
    docs,
    rejected,
    quota: memoryQuota(docs),
    onnx: false,
    indexedDb: false,
    fixture: true,
  };
}

export function searchLocalMemory(query, docs) {
  const hits = hybridRank(query, docs || []).slice(0, 5);
  return {
    fixture: true,
    indexedDb: false,
    onnx: false,
    dim: EMBED_DIM,
    hits,
  };
}

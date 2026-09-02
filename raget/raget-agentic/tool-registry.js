// Tool Registry eksplisit untuk Agentic AI - membungkus kapabilitas Rategoan
// yang SUDAH ADA (math-engine, retrieval, dataries, memory, koleksi).
// Tidak ada fake tool/hasil hardcode: setiap execute() memanggil modul
// existing yang sama dipakai Chat biasa. Agent tidak boleh menjalankan tool
// yang tidak terdaftar di sini, dan input/output selalu divalidasi.
import { toolsMath } from '../raget-agents/tools-math.js';
import { agentTools } from '../raget-agents/agent-tools.js';
import { memoryIndex } from '../raget-memory/memory-index.js';
import { datariesBridge } from '../raget-agents/dataries-bridge.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { collectionStore } from '../raget-memory/collection-store.js';

function validateSchema(schema, value) {
  const errors = [];
  if (!schema || !schema.properties) return { ok: true, errors };
  const val = value && typeof value === 'object' ? value : {};
  Object.keys(schema.properties).forEach((key) => {
    const def = schema.properties[key];
    const has = val[key] !== undefined && val[key] !== null;
    if (def.required && !has) {
      errors.push('field wajib hilang: ' + key);
      return;
    }
    if (has && def.type === 'string' && typeof val[key] !== 'string') errors.push(key + ' harus string');
    if (has && def.type === 'number' && typeof val[key] !== 'number') errors.push(key + ' harus number');
  });
  return { ok: errors.length === 0, errors };
}

const TOOLS = new Map();

function register(tool) {
  if (!tool || !tool.name || typeof tool.execute !== 'function') {
    throw new Error('tool tidak valid: butuh name + execute()');
  }
  TOOLS.set(tool.name, tool);
}

function get(name) {
  return TOOLS.get(name) || null;
}

function list() {
  return Array.from(TOOLS.values()).map((t) => ({
    name: t.name,
    description: t.description,
    riskLevel: t.riskLevel,
    requiresConfirmation: t.requiresConfirmation,
  }));
}

async function execute(name, input) {
  const tool = get(name);
  if (!tool) return { ok: false, error: 'tool_not_registered', output: null };

  const inCheck = validateSchema(tool.inputSchema, input);
  if (!inCheck.ok) return { ok: false, error: 'invalid_input: ' + inCheck.errors.join(', '), output: null };

  try {
    const output = await tool.execute(input);
    const outCheck = validateSchema(tool.outputSchema, output);
    if (!outCheck.ok) return { ok: false, error: 'invalid_output: ' + outCheck.errors.join(', '), output };
    return { ok: true, error: null, output };
  } catch (e) {
    return { ok: false, error: 'tool_error: ' + (e && e.message ? e.message : String(e)), output: null };
  }
}

register({
  name: 'math',
  description: 'Menghitung ekspresi matematika/soal cerita angka lewat math-engine existing.',
  riskLevel: 'low',
  requiresConfirmation: false,
  inputSchema: { properties: { query: { type: 'string', required: true } } },
  outputSchema: { properties: { text: { type: 'string', required: true } } },
  async execute(input) {
    const text = toolsMath.tryMath(input.query) || agentTools.hitung(input.query);
    return { text: String(text || '') };
  },
});

register({
  name: 'retrieval',
  description: 'Mencari catatan/fakta/FAQ relevan di indeks memori lokal (RAG lokal).',
  riskLevel: 'low',
  requiresConfirmation: false,
  inputSchema: { properties: { query: { type: 'string', required: true } } },
  outputSchema: { properties: { text: { type: 'string', required: true } } },
  async execute(input) {
    const found = await memoryIndex.search(input.query, 3);
    const text = found.map((r) => r.text).join(' | ');
    return { text };
  },
});

register({
  name: 'knowledge',
  description: 'Mencari jawaban faktual dari basis pengetahuan lokal (dataries) - bukan LLM eksternal.',
  riskLevel: 'low',
  requiresConfirmation: false,
  inputSchema: { properties: { query: { type: 'string', required: true } } },
  outputSchema: { properties: { text: { type: 'string', required: true } } },
  async execute(input) {
    const factoid = await datariesBridge.factoid(input.query, {});
    if (factoid) return { text: factoid };
    const extras = await datariesBridge.extras(input.query);
    return { text: String(extras || '') };
  },
});

register({
  name: 'memory',
  description: 'Membaca/menulis memori jangka panjang pengguna (fakta pribadi, catatan) - tidak otomatis menyimpan seluruh chat.',
  riskLevel: 'medium',
  requiresConfirmation: false,
  inputSchema: {
    properties: {
      action: { type: 'string', required: true },
      key: { type: 'string' },
      value: { type: 'string' },
    },
  },
  outputSchema: { properties: { text: { type: 'string', required: true } } },
  async execute(input) {
    if (input.action === 'write') {
      memoryLong.rememberNote(String(input.value || input.key || ''));
      return { text: 'Dicatat ke memori: ' + String(input.value || input.key || '') };
    }
    const facts = memoryLong.allFacts();
    const keys = Object.keys(facts);
    const text = keys.length ? keys.map((k) => k + ': ' + facts[k]).join(', ') : 'Belum ada fakta tersimpan.';
    return { text };
  },
});

const PLAN_FOCUS = [
  'Kenali dasar & kumpulkan sumber belajar',
  'Pelajari materi inti & buat ringkasan',
  'Latihan soal/praktik langsung',
  'Uji pemahaman lewat kuis singkat ke diri sendiri',
  'Terapkan lewat studi kasus/kontekstual',
  'Telaah ulang bagian yang masih sulit',
  'Evaluasi menyeluruh & susun rencana lanjutan',
];

register({
  name: 'compose',
  description: 'Menyusun teks kerangka terstruktur (mis. agenda harian) lewat template deterministik lokal - bukan LLM eksternal, tidak mengarang fakta.',
  riskLevel: 'low',
  requiresConfirmation: false,
  inputSchema: {
    properties: {
      topic: { type: 'string', required: true },
      index: { type: 'number', required: true },
      total: { type: 'number', required: true },
    },
  },
  outputSchema: { properties: { text: { type: 'string', required: true } } },
  async execute(input) {
    const focus = PLAN_FOCUS[(input.index - 1) % PLAN_FOCUS.length];
    return { text: 'Hari ke-' + input.index + '/' + input.total + ' (' + input.topic + '): ' + focus + '.' };
  },
});

register({
  name: 'datetime',
  description: 'Memberi tanggal/waktu lokal saat ini (murni lokal, tanpa jaringan).',
  riskLevel: 'low',
  requiresConfirmation: false,
  inputSchema: { properties: {} },
  outputSchema: { properties: { text: { type: 'string', required: true } } },
  async execute() {
    const now = new Date();
    return { text: now.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) };
  },
});

register({
  name: 'notes',
  description: 'Menyimpan hasil task sebagai artefak di Koleksi lokal (IndexedDB existing).',
  riskLevel: 'low',
  requiresConfirmation: false,
  inputSchema: { properties: { text: { type: 'string', required: true } } },
  outputSchema: { properties: { text: { type: 'string', required: true } } },
  async execute(input) {
    const item = await collectionStore.addItem({ kind: 'artifact', artifactType: 'agentic', text: input.text, role: 'ai', tag: 'agentic' });
    return { text: 'Tersimpan di Koleksi (' + item.id + ').' };
  },
});

export const toolRegistry = Object.freeze({
  register,
  get,
  list,
  execute,
  validateSchema,
});

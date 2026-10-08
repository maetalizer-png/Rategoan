import { indexDocs, listDocs, searchDocs } from '../../raget/raget-vault/local-rag.js';
import { remindersStore } from '../../vault/reminders/reminders-store.js';
import { icsParser } from '../../vault/calendar/ics-parser.js';
import { buildChartSvg } from '../../shared/charts-local.js';
import { buildDiagramSvg } from '../../shared/diagrams-local.js';
import { buildDocxBytes } from '../../shared/docx-local.js';
import { buildPptxBytes, downloadBytes } from '../../shared/pptx-local.js';
import { ocrReader } from '../../vault/ocr/reader.js';
import { skill } from '../state/skill.js';

const UNITS = {
  km_m: 1000, m_km: 0.001, kg_g: 1000, g_kg: 0.001,
  c_f: null, f_c: null,
};

function tokenize(expr) {
  const tokens = [];
  const regex = /\s*([0-9]+(?:\.[0-9]+)?|\*\*|[+\-*/()])\s*/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    if (match[1]) tokens.push(match[1]);
  }
  return tokens;
}

export function parseArithmeticAST(expr) {
  const source = String(expr || '').replace(/\s+/g, '');
  if (source.length > 10000) throw new Error('Ekspresi terlalu panjang');
  const tokens = tokenize(source);
  if (tokens.join('') !== source) throw new Error('Ekspresi tidak aman');
  let pos = 0;
  function parsePrimary() {
    const token = tokens[pos++];
    if (token === '(') {
      const val = parseExpr();
      if (tokens[pos++] !== ')') throw new Error('Kurung tidak seimbang');
      return val;
    }
    const num = Number(token);
    if (!Number.isFinite(num)) throw new Error('Bukan angka valid: ' + token);
    return num;
  }
  function parsePower() {
    let left = parsePrimary();
    while (tokens[pos] === '**') {
      pos += 1;
      left = Math.pow(left, parsePower());
    }
    return left;
  }
  function parseMulDiv() {
    let left = parsePower();
    while (tokens[pos] === '*' || tokens[pos] === '/') {
      const op = tokens[pos++];
      const right = parsePower();
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }
  function parseExpr() {
    let left = parseMulDiv();
    while (tokens[pos] === '+' || tokens[pos] === '-') {
      const op = tokens[pos++];
      const right = parseMulDiv();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }
  const result = parseExpr();
  if (pos !== tokens.length) throw new Error('Galat sintaksis matematika');
  if (!Number.isFinite(result)) throw new Error('Bukan angka');
  return result;
}

function calc(expr) {
  const raw = String(expr || '').replace(/\s+/g, '').replace(/\^/g, '**');
  return parseArithmeticAST(raw);
}

function stats(values) {
  const nums = (values || []).map(Number).filter((n) => Number.isFinite(n));
  if (!nums.length) return { count: 0 };
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const sorted = nums.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return { count: nums.length, sum, mean, median, min: sorted[0], max: sorted[sorted.length - 1] };
}

const RATES = { USD: 1, IDR: 15500, EUR: 0.92, JPY: 149, SGD: 1.29 };

async function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return { spoken: false };
  const utter = new SpeechSynthesisUtterance(String(text || '').slice(0, 4000));
  utter.lang = 'id-ID';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
  return { spoken: true, chars: utter.text.length };
}

const TOOLS = {
  async vault_index_document(p) {
    const text = String(p.text || p.raw_content || '');
    const id = String(p.id || ('doc-' + Date.now().toString(36)));
    const n = await indexDocs([{ id, text, kind: p.kind || 'vault' }]);
    return { indexed: n, id };
  },
  async vault_semantic_search(p) {
    const docs = await listDocs();
    const hits = searchDocs(docs, String(p.query || p.q || ''), Number(p.limit) || 5);
    return { hits: hits.map((hit) => ({ id: hit.id, score: hit.score, text: String(hit.text || '').slice(0, 280) })) };
  },
  async vault_summarize_doc(p) {
    const text = String(p.text || '');
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3);
    return { summary: sentences.join(' ') || text.slice(0, 400) };
  },
  async vault_qna_document(p) {
    const docs = p.text ? [{ id: 'q', text: p.text }] : await listDocs();
    const hits = searchDocs(docs, String(p.question || p.query || ''), 1);
    return { answer: hits[0] ? String(hits[0].text).slice(0, 500) : 'Tidak ada cuplikan yang cocok.' };
  },
  async vault_compare_docs(p) {
    const left = String(p.left || '');
    const right = String(p.right || '');
    return { leftChars: left.length, rightChars: right.length, same: left.trim() === right.trim() };
  },
  async vault_export_knowledge() {
    const docs = await listDocs();
    return { count: docs.length, docs: docs.slice(0, 20).map((doc) => ({ id: doc.id, text: String(doc.text || '').slice(0, 200) })) };
  },
  async vision_extract_text(p) {
    if (p.text) return { text: String(p.text) };
    if (!p.file) return { text: '', note: 'Kirim berkas gambar atau teks hasil pindaian.' };
    const result = await ocrReader.recognize(p.file);
    return { text: result.text || '', message: result.message || '' };
  },
  async vision_parse_table(p) {
    const lines = String(p.text || '').split(/\n/).filter(Boolean);
    const rows = lines.map((line) => line.split(/\t|,/).map((cell) => cell.trim()));
    return { rows, markdown: rows.map((row) => '| ' + row.join(' | ') + ' |').join('\n') };
  },
  async vision_color_palette(p) {
    const colors = Array.isArray(p.colors) ? p.colors : ['#1a4b8c', '#e8e6e1', '#0b0c0e'];
    return { colors };
  },
  async vision_qr_barcode(p) {
    return { value: String(p.value || p.text || ''), note: 'Nilai dikembalikan apa adanya. Pembaca kamera memakai OCR lokal.' };
  },
  async audio_speech_to_text(p) {
    return { text: String(p.text || ''), note: 'Transkrip diambil dari pengenal suara peramban.' };
  },
  async audio_text_to_speech(p) {
    return speak(p.text || '');
  },
  async audio_generate_overview(p) {
    const script = 'Ringkasan. ' + String(p.text || '').slice(0, 800);
    await speak(script);
    return { script };
  },
  async audio_voice_notes(p) {
    const item = remindersStore.add({ text: String(p.text || 'Memo suara'), action: 'memo', timestamp: Date.now() });
    return { id: item.id, text: item.text };
  },
  async math_calculate_expression(p) {
    return { value: calc(p.expression || p.expr || '0') };
  },
  async math_statistics_summary(p) {
    return stats(p.values || []);
  },
  async math_currency_converter(p) {
    const amount = Number(p.amount) || 0;
    const from = String(p.from || 'USD').toUpperCase();
    const to = String(p.to || 'IDR').toUpperCase();
    if (!RATES[from] || !RATES[to]) throw new Error('Mata uang tidak ada di tabel lokal');
    const usd = amount / RATES[from];
    return { amount, from, to, value: Math.round(usd * RATES[to] * 100) / 100, note: 'Kurs tetap di perangkat, bukan harga pasar.' };
  },
  async math_date_calculator(p) {
    const start = new Date(p.start || Date.now());
    const end = new Date(p.end || Date.now());
    const days = Math.round((end - start) / 86400000);
    let work = 0;
    const cursor = new Date(start);
    while (cursor < end) {
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) work += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    return { days, workdays: work };
  },
  async math_unit_conversion(p) {
    const value = Number(p.value) || 0;
    const key = String(p.from || '') + '_' + String(p.to || '');
    if (key === 'c_f') return { value: value * 9 / 5 + 32, unit: 'F' };
    if (key === 'f_c') return { value: (value - 32) * 5 / 9, unit: 'C' };
    if (UNITS[key] == null) throw new Error('Konversi tidak dikenal');
    return { value: value * UNITS[key], unit: p.to };
  },
  async canvas_render_chart(p) {
    const svg = buildChartSvg({ type: p.type || 'bar', title: p.title || 'Grafik', labels: p.labels || [], datasets: [{ data: p.values || [] }] });
    return { svg };
  },
  async canvas_generate_diagram(p) {
    const steps = p.steps || String(p.text || '').split(/\n/).filter(Boolean);
    const nodes = steps.map((label, index) => ({ id: 'n' + index, label }));
    const edges = nodes.slice(1).map((node, index) => ({ from: 'n' + index, to: node.id }));
    const svg = buildDiagramSvg({ nodes, edges });
    return { svg };
  },
  async canvas_export_presentation(p) {
    const bytes = buildPptxBytes([{ kind: 'content', title: p.title || 'Slide', bullets: String(p.text || '').split(/\n/).filter(Boolean).slice(0, 6) }]);
    const fileName = (p.fileName || 'presentasi') + '.pptx';
    downloadBytes(bytes, fileName);
    return { fileName };
  },
  async canvas_export_document(p) {
    const bytes = buildDocxBytes(String(p.text || ''));
    const fileName = (p.fileName || 'dokumen') + '.docx';
    downloadBytes(bytes, fileName);
    return { fileName };
  },
  async canvas_export_data(p) {
    const rows = p.rows || [];
    const csv = rows.map((row) => (Array.isArray(row) ? row : [row]).join(',')).join('\n');
    return { csv };
  },
  async agenda_add_task(p) {
    const item = remindersStore.add({
      text: String(p.text || 'Tugas'),
      action: String(p.text || 'Tugas'),
      timestamp: p.when ? new Date(p.when).getTime() : Date.now() + 3600000,
    });
    return { id: item.id, text: item.text };
  },
  async agenda_list_upcoming() {
    return { items: remindersStore.allActive().slice(0, 20).map((item) => ({ id: item.id, text: item.text, timestamp: item.timestamp })) };
  },
  async agenda_parse_ics(p) {
    return { events: icsParser.parseICS(String(p.text || '')) };
  },
  async agenda_export_calendar() {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0'];
    remindersStore.allActive().forEach((item) => {
      const stamp = new Date(item.timestamp || Date.now()).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      lines.push('BEGIN:VEVENT', 'DTSTART:' + stamp, 'SUMMARY:' + String(item.text || '').replace(/\n/g, ' '), 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return { ics: lines.join('\n') };
  },
  async agenda_daily_briefing() {
    const items = remindersStore.allActive().slice(0, 5);
    const lines = items.length ? items.map((item) => '- ' + item.text) : ['Tidak ada agenda terbuka.'];
    return { briefing: lines.join('\n') };
  },
};

export const LOCAL_SERVICES = {
  local_document_vault: 'vault_',
  local_vision_ocr: 'vision_',
  local_voice_audio: 'audio_',
  local_math_compute: 'math_',
  local_artifact_canvas: 'canvas_',
  local_agenda_routine: 'agenda_',
};

export function toolContract() {
  return Object.keys(TOOLS).map((name) => ({
    name,
    description: name.replace(/_/g, ' '),
    parameters: ['payload'],
    execute: (payload) => TOOLS[name](payload || {}),
  }));
}

export function isLocalTool(name) {
  return Object.prototype.hasOwnProperty.call(TOOLS, name);
}

export function toolsForService(serviceId) {
  const prefix = LOCAL_SERVICES[serviceId];
  if (!prefix) return [];
  return Object.keys(TOOLS).filter((name) => name.indexOf(prefix) === 0);
}

export async function runLocalTool(name, parameters) {
  const fn = TOOLS[name];
  if (!fn) return { ok: false, error: 'alat_tidak_dikenal' };
  if (!skill.allows(name)) return { ok: false, error: 'di luar keahlian aktif' };
  try {
    const data = await fn(parameters || {});
    return { ok: true, data };
  } catch (e) {
    console.warn('[Rategoan Fallback] Konektor:', e);
    return { ok: false, error: e && e.message ? e.message : 'gagal' };
  }
}

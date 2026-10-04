import { markdown } from '../../shared/markdown.js';
import { buildDocxBytes } from '../../shared/docx-local.js';
import { buildZip } from '../../shared/zip-local.js';
import { exportSlides } from '../../shared/slides-export.js';
import { artifact } from './artifact.js';
import { mountToolCalls } from '../connectors/tool-card.js';

function artRe() { return /<artifact\b([^>]*)>([\s\S]*?)<\/artifact>/gi; }
function traceRe() { return /<trace\b([^>]*)>([\s\S]*?)<\/trace>/gi; }
function toolRe() { return /<tool_call>([\s\S]*?)<\/tool_call>/gi; }

function attrs(raw) {
  const out = {};
  String(raw || '').replace(/([A-Za-z_]+)\s*=\s*"([^"]*)"/g, (_, key, value) => {
    out[key] = value;
    return '';
  });
  return out;
}

export function splitRich(text) {
  const source = String(text || '');
  const artifacts = [];
  const traces = [];
  const tools = [];
  source.replace(artRe(), (all, rawAttrs, body) => {
    const meta = attrs(rawAttrs);
    artifacts.push({
      type: meta.type || 'document',
      title: meta.title || 'Berkas',
      filename: meta.filename || meta.fileName || 'berkas.txt',
      body: body || '',
    });
    return '';
  });
  source.replace(traceRe(), (all, rawAttrs, body) => {
    const meta = attrs(rawAttrs);
    traces.push({ title: meta.title || 'Jejak', body: body || '' });
    return '';
  });
  source.replace(toolRe(), (all, body) => {
    try {
      const parsed = JSON.parse(body);
      if (parsed && parsed.name) tools.push({ name: String(parsed.name), parameters: parsed.parameters || {} });
    } catch (e) { console.warn('[Rategoan Fallback] artifact-card:', e); }
    return '';
  });
  const clean = source
    .replace(artRe(), '')
    .replace(traceRe(), '')
    .replace(toolRe(), '')
    .trim();
  return { text: clean, artifacts, traces, tools };
}

export function isRich(text) {
  return /<artifact\b|<trace\b|<tool_call>/i.test(String(text || ''));
}

export function stripForSpeech(text) {
  return String(text || '')
    .replace(artRe(), ' ')
    .replace(traceRe(), ' ')
    .replace(toolRe(), ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sizeLabel(bytes) {
  const n = bytes instanceof Uint8Array ? bytes.length : new Blob([String(bytes || '')]).size;
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

function downloadBytes(name, bytes, mime) {
  const blob = new Blob([bytes], { type: mime || 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function downloadText(name, text, mime) {
  downloadBytes(name, text, mime || 'text/plain;charset=utf-8');
}

function outlineFrom(body, title) {
  const lines = String(body || '').split('\n').map((line) => line.replace(/^#+\s*/, '').trim()).filter(Boolean);
  return [{ kind: 'body', title: lines[0] || title || 'Slide', bullets: lines.slice(1, 6) }];
}

function rowsFrom(body) {
  const lines = String(body || '').split('\n').filter((line) => line.trim());
  if (!lines.length) return [['Kolom'], ['']];
  return lines.map((line) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((cell) => cell.replace(/^"|"$/g, '').trim()));
}

function preview(item) {
  const type = item.type;
  if (type === 'slide') {
    artifact.open(outlineFrom(item.body, item.title), item.title, item.filename || 'slide.pptx');
    return;
  }
  if (type === 'code' || type === 'html') {
    artifact.open({ type: 'code', code: item.body, lang: type === 'html' ? 'html' : 'js', title: item.title, fileName: item.filename }, item.title);
    return;
  }
  if (type === 'table') {
    artifact.open({ type: 'table', rows: rowsFrom(item.body), title: item.title, fileName: item.filename || 'tabel.csv' }, item.title);
    return;
  }
  if (type === 'zip') {
    artifact.open({ type: 'zip', markdown: item.body, title: item.title, fileName: item.filename || 'paket.zip' }, item.title);
    return;
  }
  artifact.open({ type: 'document', markdown: item.body, title: item.title, fileName: item.filename }, item.title);
}

function download(item) {
  const name = item.filename || 'berkas.txt';
  if (item.type === 'slide' || /\.pptx$/i.test(name)) {
    exportSlides(outlineFrom(item.body, item.title), name.replace(/\.pptx$/i, '') + '.pptx');
    return;
  }
  if (item.type === 'docx' || /\.docx$/i.test(name) || (item.type === 'document' && /\.docx$/i.test(name))) {
    downloadBytes(name.replace(/\.md$/i, '.docx'), buildDocxBytes(item.body), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    return;
  }
  if (item.type === 'zip' || /\.zip$/i.test(name)) {
    let files = [{ name: 'catatan.txt', data: item.body }];
    try {
      const parsed = JSON.parse(item.body);
      if (Array.isArray(parsed) && parsed.length) files = parsed;
    } catch (e) { console.warn('[Rategoan Fallback] artifact-card:', e); }
    downloadBytes(name, buildZip(files), 'application/zip');
    return;
  }
  if (item.type === 'table' || /\.csv$/i.test(name)) {
    downloadText(name, item.body, 'text/csv;charset=utf-8');
    return;
  }
  downloadText(name, item.body, 'text/plain;charset=utf-8');
}

function mountCard(container, item) {
  const card = document.createElement('div');
  card.className = 'artifact-card';
  const head = document.createElement('div');
  head.className = 'artifact-card-head';
  const name = document.createElement('strong');
  name.textContent = item.filename || item.title;
  const meta = document.createElement('span');
  meta.textContent = (item.type || 'berkas') + ' · ' + sizeLabel(item.body);
  head.appendChild(name);
  head.appendChild(meta);
  const actions = document.createElement('div');
  actions.className = 'artifact-card-actions';
  const view = document.createElement('button');
  view.type = 'button';
  view.textContent = 'Pratinjau';
  view.onclick = () => preview(item);
  const save = document.createElement('button');
  save.type = 'button';
  save.textContent = 'Unduh berkas';
  save.onclick = () => download(item);
  actions.appendChild(view);
  actions.appendChild(save);
  card.appendChild(head);
  card.appendChild(actions);
  container.appendChild(card);
}

function mountTrace(container, trace) {
  const box = document.createElement('details');
  box.className = 'think-trace';
  box.open = false;
  const summary = document.createElement('summary');
  summary.textContent = trace.title || 'Proses berpikir';
  const pre = document.createElement('pre');
  pre.textContent = String(trace.body || '').trim();
  box.appendChild(summary);
  box.appendChild(pre);
  container.appendChild(box);
}

export function mountRich(container, text) {
  const parts = splitRich(text);
  if (parts.traces.length) parts.traces.forEach((trace) => mountTrace(container, trace));
  if (parts.text) {
    const prose = document.createElement('div');
    prose.innerHTML = markdown.render(parts.text);
    markdown.decorate(prose);
    container.appendChild(prose);
  }
  parts.artifacts.forEach((item) => mountCard(container, item));
  mountToolCalls(container, parts.tools);
}

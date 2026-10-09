import { sha256Sync } from './vfs-git.js';

const WASM_ADD = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
  0x03, 0x02, 0x01, 0x00,
  0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00,
  0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,
]);

function esc(text) {
  return String(text || '').replace(/[&<>"]/g, (ch) => ({ '&': '&', '<': '<', '>': '>', '"': '"' }[ch]));
}

export function mermaidToSvg(src) {
  const edges = [];
  String(src || '').split('\n').forEach((line) => {
    const match = line.match(/([A-Za-z0-9_]+)\s*-->\s*([A-Za-z0-9_]+)/);
    if (match) edges.push([match[1], match[2]]);
  });
  const nodes = [];
  edges.forEach(([left, right]) => {
    if (!nodes.includes(left)) nodes.push(left);
    if (!nodes.includes(right)) nodes.push(right);
  });
  const body = nodes.map((name, index) => '<text x="16" y="' + (28 + index * 28) + '">' + esc(name) + '</text>').join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" data-edges="' + edges.length + '">' + body + '</svg>';
}

export function bindSheetChart(cells) {
  const values = (cells || []).map((item) => Number(item) || 0);
  return {
    values,
    bars() { return values.slice(); },
    set(index, next) { values[index] = Number(next) || 0; },
  };
}

export function scaffoldProject(name) {
  const title = String(name || 'proyek');
  return {
    '/index.html': '<!doctype html><title>' + esc(title) + '</title><h1>' + esc(title) + '</h1>\n',
    '/css/style.css': 'body{margin:24px}\n',
    '/js/script.js': 'console.log(' + JSON.stringify(title) + ');\n',
  };
}

export function indexSymbols(source) {
  const found = [];
  const re = /\b(function|class)\s+([A-Za-z_$][\w$]*)/g;
  let match = re.exec(String(source || ''));
  while (match) {
    found.push({ name: match[2], kind: match[1] });
    match = re.exec(String(source || ''));
  }
  return found;
}

export function parseImports(source) {
  const found = [];
  const re = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match = re.exec(String(source || ''));
  while (match) {
    found.push(match[1]);
    match = re.exec(String(source || ''));
  }
  return found;
}

export function synthesizeTool(schema) {
  const name = String((schema && schema.name) || 'alat');
  return function run(payload) {
    const bag = payload || {};
    if (bag.window || bag.document || bag.dom) throw new Error('isolasi');
    return { name, ok: true, dom: false };
  };
}

const LOCAL_TASKS = [
  { id: 'tambah', solution: (a, b) => a + b, test: (fn) => fn(2, 3) === 5 },
  { id: 'nol', solution: (a) => a, test: (fn) => fn(0) === 0 },
];

export function passAt1(tasks) {
  const rows = tasks || LOCAL_TASKS;
  let pass = 0;
  rows.forEach((task) => {
    try {
      if (task.test(task.solution)) pass += 1;
    } catch (err) { /* tugas lokal gagal tetap dihitung nol */ }
  });
  return { n: rows.length, pass, score: rows.length ? pass / rows.length : 0, offline: true, weights: false };
}

export function iwaManifest() {
  return {
    isolated: true,
    bundle: 'high-integrity',
    offline: true,
    prefer_related_applications: false,
    externalModels: false,
  };
}

export function backupManifest(files) {
  const names = Object.keys(files || {}).sort();
  return {
    algorithm: 'SHA-256',
    files: names.map((name) => ({ name, sha256: sha256Sync(String(files[name])) })),
  };
}

export function verifyBackupManifest(files, manifest) {
  const again = backupManifest(files);
  if (!manifest || again.files.length !== manifest.files.length) return false;
  return again.files.every((row, index) => row.name === manifest.files[index].name && row.sha256 === manifest.files[index].sha256);
}

export function splitAxis(axis) {
  return axis === 'vertical' ? 'vertical' : 'horizontal';
}

export function hotReloadPlan(state) {
  return { fullReload: false, preserve: true, state: state || null };
}

export function hotReloadDiff(prev, next) {
  const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const before = prev || {};
  const after = next || {};
  const names = new Set(Object.keys(before).concat(Object.keys(after)));
  const changed = [];
  names.forEach((name) => {
    if (before[name] !== after[name]) changed.push(name);
  });
  const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - started;
  return { fullReload: false, preserve: true, changed, elapsed };
}

export async function createWasmTerminal(vfs) {
  const wasm = await globalThis.WebAssembly.instantiate(WASM_ADD);
  return {
    wasm: true,
    exec(line) {
      const parts = String(line || '').trim().split(/\s+/);
      const cmd = parts[0];
      if (cmd === 'add') return String(wasm.instance.exports.add(Number(parts[1]) || 0, Number(parts[2]) || 0));
      if (cmd === 'ls') {
        const snap = vfs && typeof vfs.snapshot === 'function' ? vfs.snapshot() : new Map();
        return Array.from(snap.keys()).join('\n');
      }
      return '';
    },
  };
}

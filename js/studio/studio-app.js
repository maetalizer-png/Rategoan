import { idbGateway } from '../../raget/raget-database/idb-gateway.js';
import { connectorState } from '../connectors/connector-state.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';
import { zipStore, healScript, mountPreview, acceptStudioMessage } from './sandbox-runner.js';
import { craftInstruction, wantsPublish, publishOnly, wantsPull, pushGithub, pullGithub, commitNote, diffLines } from './studio-agent.js';
import { mountThought } from '../ui/thought-card.js';
import { listZipEntries, readZipText } from '../../shared/zip-local.js';
import { createVfs } from './vfs.js';
import { folderBridge } from '../project/folder-bridge.js';

const vfs = createVfs({
  '/index.html': '<!doctype html><html><head><meta charset="utf-8"></head><body><h1>Studio Kode</h1></body></html>\n',
  '/css/style.css': 'body{background:#05080c;color:#f2f5f7;font-family:sans-serif;margin:24px}\n',
  '/js/script.js': 'console.log("siap");\n',
  '/main.py': 'print("halo")\n',
});
let viewPath = '/js/script.js';
let lastBefore = vfs.flat();
let busy = false;
let projectId = '';
let touched = false;

function $(id) { return document.getElementById(id); }

function projectKey() {
  if (projectId) return projectId;
  projectId = sessionStorage.getItem('rategoan_studio_project') || ('studio-' + Date.now().toString(36));
  sessionStorage.setItem('rategoan_studio_project', projectId);
  return projectId;
}

function showTab(name) {
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === 'tab-' + name));
}

function openSheet() {
  const canvas = $('studio-canvas-pane');
  if (canvas) canvas.classList.add('is-sheet-open');
  showTab('preview');
}

function appendConsole(line) {
  const box = $('console-output');
  if (!box) return;
  const row = document.createElement('div');
  row.textContent = line;
  box.appendChild(row);
}

function paintDiff(path) {
  const pre = $('code-editor');
  if (!pre) return;
  const key = path === '/css/style.css' ? 'style.css'
    : path === '/js/script.js' ? 'script.js'
      : path === '/index.html' ? 'index.html'
        : path === '/main.py' ? 'main.py' : '';
  const before = key ? (lastBefore[key] || '') : '';
  const after = vfs.read(path);
  pre.textContent = '';
  diffLines(before, after).forEach((line) => {
    const row = document.createElement('div');
    row.className = 'diff-line ' + line.kind;
    const mark = line.kind === 'add' ? '+ ' : (line.kind === 'del' ? '- ' : '  ');
    row.textContent = mark + line.text;
    pre.appendChild(row);
  });
}

function paintTree() {
  const box = $('vfs-tree');
  if (!box) return;
  box.textContent = '';
  vfs.list().forEach((path) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = path;
    if (path === viewPath) btn.classList.add('on');
    btn.onclick = () => { viewPath = path; paintTree(); paintDiff(path); showTab('files'); };
    box.appendChild(btn);
  });
  paintDiff(viewPath);
}

function downloadZip() {
  const bytes = zipStore(vfs.bundle());
  const blob = new Blob([bytes], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'studio-rategoan.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

async function githubCreds() {
  const legacyToken = localStorage.getItem('rategoan_github_token') || '';
  const legacyRepo = localStorage.getItem('rategoan_github_repo') || '';
  if (legacyToken && !connectorState.token('github')) {
    connectorState.markConnected('github', { access_token: legacyToken, account: '', expiresIn: 60 * 60 * 24 * 30 });
    localStorage.removeItem('rategoan_github_token');
  }
  const state = connectorState.read();
  const svc = state.services.github || {};
  if (legacyRepo && !svc.repo) {
    svc.repo = legacyRepo;
    connectorState.write(state);
    localStorage.removeItem('rategoan_github_repo');
  }
  return { token: connectorState.token('github'), repo: (state.services.github && state.services.github.repo) || '' };
}

function paintHistory(rows) {
  const box = $('studio-history');
  if (!box) return;
  box.textContent = '';
  (rows || []).forEach((row) => {
    if (!row || row.type && row.type !== 'studio') return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = row.title || 'Sesi';
    btn.onclick = () => {
      touched = true;
      if (Array.isArray(row.files)) vfs.load(row.files);
      else if (row.files) Object.keys(row.files).forEach((path) => vfs.write(path, row.files[path]));
      $('studio-app').classList.add('is-active');
      $('studio-project-name').textContent = row.title || 'Proyek';
      lastBefore = vfs.flat();
      paintTree();
      mountPreview($('studio-preview-frame'), vfs.flat());
    };
    box.appendChild(btn);
  });
}

async function rememberSession(title) {
  const row = {
    id: Date.now().toString(36),
    type: 'studio',
    projectId: projectKey(),
    title: String(title || 'Sesi').slice(0, 80),
    time: Date.now(),
    files: vfs.snapshot(),
  };
  let rows = [];
  try { rows = await idbGateway.getList('studio-sessions'); } catch (e) { rows = []; }
  rows = [row].concat(rows || []).filter((item) => !item || !item.type || item.type === 'studio').slice(0, 12);
  try { await idbGateway.setList('studio-sessions', rows); } catch (e) { console.warn('[Rategoan Fallback] studio-sessions:', e); }
  try { await idbGateway.setList('studio-vfs', vfs.snapshot()); } catch (e) { console.warn('[Rategoan Fallback] studio-vfs:', e); }
  paintHistory(rows);
}

function beat(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function say(log, text) {
  const line = document.createElement('div');
  line.className = 'studio-msg';
  line.textContent = text;
  log.appendChild(line);
}

async function finish(slot, thoughts, started, note) {
  slot.dataset.thoughtStart = String(started);
  slot.innerHTML = '';
  mountThought(slot, thoughts, 'selesai');
  const line = document.createElement('div');
  line.className = 'studio-msg';
  line.textContent = note;
  const actions = document.createElement('div');
  actions.className = 'studio-action-chips';
  const preview = document.createElement('button');
  preview.type = 'button';
  preview.className = 'chip-btn';
  preview.textContent = 'Buka Pratinjau Hidup';
  preview.onclick = openSheet;
  const zip = document.createElement('button');
  zip.type = 'button';
  zip.className = 'chip-btn';
  zip.textContent = 'Unduh ZIP';
  zip.onclick = downloadZip;
  actions.appendChild(preview);
  actions.appendChild(zip);
  slot.appendChild(line);
  slot.appendChild(actions);
  appendConsole('Selesai dalam ' + (Date.now() - started) + ' ms.');
}

async function applyCraft(text) {
  if (busy) return;
  busy = true;
  touched = true;
  const started = Date.now();
  $('studio-app').classList.add('is-active');
  const log = $('studio-messages');
  const user = document.createElement('div');
  user.className = 'studio-msg user';
  user.textContent = text;
  log.appendChild(user);
  const slot = document.createElement('div');
  log.appendChild(slot);
  const thoughts = [];
  const step = async (label) => {
    thoughts.push({ text: label, kind: label });
    slot.innerHTML = '';
    mountThought(slot, thoughts, 'berjalan');
    await beat(60);
  };
  const box = $('console-output');
  if (box) box.textContent = '';
  try {
    const creds = await githubCreds();
    if (wantsPull(text)) {
      await step('Baca berkas');
      const pulled = await pullGithub(creds.token, creds.repo);
      if (!pulled.ok) {
        say(log, 'Repositori belum bisa dimuat. Tautkan token GitHub di Konektor.');
        return;
      }
      Object.keys(pulled.files).forEach((path) => vfs.write(path, pulled.files[path]));
      await finish(slot, thoughts, started, 'Berkas repositori sudah masuk ke jendela pemantauan.');
      paintTree();
      mountPreview($('studio-preview-frame'), vfs.flat());
      showTab('preview');
      return;
    }
    const before = vfs.flat();
    lastBefore = Object.assign({}, before);
    let plan;
    if (publishOnly(text)) {
      plan = { files: before, lang: 'web', steps: ['Baca berkas'], reply: 'Berkas proyek siap diterbitkan.' };
    } else {
      plan = craftInstruction(text, before);
    }
    for (let i = 0; i < plan.steps.length; i += 1) await step(plan.steps[i]);
    Object.keys(plan.files).forEach((path) => vfs.write(path, plan.files[path]));
    if (plan.lang !== 'python') {
      let healed = vfs.read('/js/script.js');
      for (let i = 0; healed && i < 3; i += 1) {
        const res = await jsSandbox.run(healed);
        if (res.ok) {
          appendConsole('Uji sandbox lulus.');
          break;
        }
        if (/document is not defined|window is not defined/i.test(res.error || '')) {
          appendConsole('Uji DOM diserahkan ke Pratinjau Hidup.');
          break;
        }
        const next = healScript(healed, { msg: res.error || '' });
        if (!next || next === healed || i === 2) {
          appendConsole('Percobaan perbaikan berhenti di langkah ' + (i + 1) + '. Kendali dikembalikan.');
          break;
        }
        healed = next;
        await step('Perbaikan mandiri ' + (i + 1));
      }
      vfs.write('/js/script.js', healed);
      mountPreview($('studio-preview-frame'), vfs.flat());
      showTab('preview');
    } else {
      appendConsole('Skrip Python tersimpan di main.py.');
      viewPath = '/main.py';
      showTab('files');
    }
    let note = plan.reply;
    if (wantsPublish(text)) {
      await step('Kemas');
      const pushed = creds.token ? await pushGithub(creds.token, creds.repo, vfs.bundle(), commitNote(text)) : { ok: false, reason: 'token' };
      if (!pushed.ok) {
        downloadZip();
        note += ' Aplikasi sudah selesai dan saya kemas dalam berkas ZIP studio-rategoan.zip. Untuk push otomatis ke repositori di masa depan, tautkan token GitHub Anda sekali saja di Pengaturan.';
      } else {
        await step('Push');
        note += ' Perubahan sudah dikirim ke GitHub' + (pushed.sha ? ' (' + pushed.sha.slice(0, 7) + ').' : '.');
      }
    }
    await finish(slot, thoughts, started, note);
    const changed = ['/css/style.css', '/js/script.js', '/index.html', '/main.py'].find((path) => {
      const key = path === '/css/style.css' ? 'style.css' : path === '/js/script.js' ? 'script.js' : path === '/index.html' ? 'index.html' : 'main.py';
      return diffLines(lastBefore[key] || '', vfs.read(path)).some((line) => line.kind !== 'same');
    });
    if (changed) viewPath = changed;
    paintTree();
    $('studio-project-name').textContent = text.slice(0, 42);
    await rememberSession(text);
  } finally {
    busy = false;
    log.scrollTop = log.scrollHeight;
  }
}

function bind() {
  if (!localStorage.getItem('rategoan_auth')) {
    location.replace('index.html#/login');
    return;
  }
  projectKey();
  document.querySelectorAll('[data-studio-ask]').forEach((btn) => {
    btn.onclick = () => applyCraft(btn.getAttribute('data-studio-ask') || '');
  });
  $('studio-send-btn').onclick = () => {
    const box = $('studio-input');
    const text = box.value.trim();
    if (!text) return;
    box.value = '';
    applyCraft(text);
  };
  $('studio-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      $('studio-send-btn').click();
    }
  });
  $('btn-studio-export').onclick = downloadZip;
  $('btn-studio-push').onclick = () => applyCraft('Terbitkan ke GitHub');
  $('studio-sheet-close').onclick = () => $('studio-canvas-pane').classList.remove('is-sheet-open');
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.onclick = () => showTab(btn.dataset.tab);
  });
  $('studio-voice-btn').onclick = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'id-ID';
    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const said = last && last[0] ? last[0].transcript : '';
      if (said) $('studio-input').value = ($('studio-input').value ? $('studio-input').value + ' ' : '') + said;
    };
    try { rec.start(); } catch (e) { console.warn('[Rategoan Fallback] dikte:', e); }
  };
  $('btn-studio-folder').onclick = async () => {
    const imported = await folderBridge.importTexts();
    if (!imported || imported.unsupported) {
      $('studio-open-zip').click();
      return;
    }
    imported.files.forEach((file) => vfs.write(file.name, file.text));
    if (!imported.files.length) return;
    touched = true;
    $('studio-app').classList.add('is-active');
    paintTree();
    mountPreview($('studio-preview-frame'), vfs.flat());
  };
  $('studio-open-zip').onchange = async () => {
    const file = $('studio-open-zip').files && $('studio-open-zip').files[0];
    $('studio-open-zip').value = '';
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const entries = listZipEntries(bytes).filter((entry) => entry.name && !entry.name.endsWith('/'));
    for (let i = 0; i < entries.length; i += 1) {
      const text = await readZipText(bytes, entries[i].name);
      vfs.write(entries[i].name, text);
    }
    touched = true;
    $('studio-app').classList.add('is-active');
    paintTree();
    mountPreview($('studio-preview-frame'), vfs.flat());
  };
  window.addEventListener('message', (event) => {
    const frame = $('studio-preview-frame');
    if (!frame) return;
    const fromSandbox = acceptStudioMessage(event, 'null', frame.contentWindow);
    const fromSame = acceptStudioMessage(event, location.origin, frame.contentWindow);
    if (!fromSandbox && !fromSame) return;
    const data = event.data || {};
    if (data.type === 'studio:error') appendConsole('Galat: ' + ((data.error && data.error.msg) || 'pratinjau'));
    if (data.type === 'studio:log') appendConsole((data.level || 'log') + ': ' + (data.text || ''));
  });
  const seedRaw = sessionStorage.getItem('rategoan_studio_seed');
  if (seedRaw) {
    sessionStorage.removeItem('rategoan_studio_seed');
    try {
      const seed = JSON.parse(seedRaw);
      if (seed.lang === 'python' || seed.lang === 'py') vfs.write('/main.py', seed.code || '');
      else vfs.write('/js/script.js', seed.code || '');
      touched = true;
      $('studio-app').classList.add('is-active');
    } catch (e) { console.warn('[Rategoan Fallback] seed:', e); }
  }
  idbGateway.getList('studio-vfs').then((rows) => {
    if (touched) return;
    if (rows && rows.length) vfs.load(rows);
    paintTree();
  }).catch(() => paintTree());
  idbGateway.getList('studio-sessions').then(paintHistory).catch(() => {});
  showTab('preview');
}

bind();

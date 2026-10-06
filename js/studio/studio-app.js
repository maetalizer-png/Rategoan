import { idbGateway } from '../../raget/raget-database/idb-gateway.js';
import { connectorState } from '../connectors/connector-state.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';
import { zipStore, healScript, mountPreview, acceptStudioMessage } from './sandbox-runner.js';
import { craftInstruction, wantsPublish, publishOnly, wantsPull, pushGithub, pullGithub, commitNote } from './studio-agent.js';
import { mountThought } from '../ui/thought-card.js';
import { listZipEntries, readZipText } from '../../shared/zip-local.js';

const WEB = {
  'index.html': '<!doctype html><html><head></head><body><h1>Halo</h1></body></html>\n',
  'style.css': 'body { font-family: sans-serif; margin: 24px; }\n',
  'script.js': 'console.log("siap");\n',
};
let pythonCode = 'print("halo")\n';
let viewFile = 'script.js';
let busy = false;

function $(id) { return document.getElementById(id); }

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '\u0026amp;')
    .replace(/</g, '\u0026lt;')
    .replace(/>/g, '\u0026gt;');
}

function filesNow() {
  return Object.assign({ 'main.py': pythonCode }, WEB);
}

function paintFile() {
  const pre = $('studio-code-view');
  if (!pre) return;
  const text = viewFile === 'main.py' ? pythonCode : (WEB[viewFile] || '');
  pre.innerHTML = escapeHtml(text || '');
}

function paintFiles() {
  const box = $('studio-files');
  if (!box) return;
  box.innerHTML = '';
  Object.keys(filesNow()).forEach((path) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = path;
    if (path === viewFile) btn.className = 'on';
    btn.onclick = () => { viewFile = path; paintFiles(); paintFile(); showPane('diff'); };
    box.appendChild(btn);
  });
  paintFile();
}

function showPane(name) {
  const frame = $('studio-preview-frame');
  const diff = $('studio-diff-pane');
  const cons = $('studio-console');
  if (frame) frame.hidden = name !== 'preview';
  if (diff) diff.hidden = name !== 'diff';
  if (cons) cons.hidden = name !== 'console';
  document.querySelectorAll('#studio-tabs button').forEach((btn) => btn.classList.toggle('on', btn.dataset.pane === name));
}

function openSheet() {
  const canvas = $('studio-canvas');
  if (canvas) canvas.classList.add('is-sheet-open');
  showPane('preview');
}

function downloadZip() {
  const bytes = zipStore(filesNow());
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

async function rememberSession(title) {
  const row = { id: Date.now().toString(36), title: String(title || 'Sesi').slice(0, 80), time: Date.now(), files: filesNow() };
  let rows = [];
  try { rows = await idbGateway.getList('studio-sessions'); } catch (e) { rows = []; }
  rows = [row].concat(rows || []).slice(0, 12);
  try { await idbGateway.setList('studio-sessions', rows); } catch (e) { console.warn('[Rategoan Fallback] studio-sessions:', e); }
  try {
    await idbGateway.setList('studio-vfs', Object.keys(filesNow()).map((path) => ({ path, content: filesNow()[path] })));
  } catch (e) { console.warn('[Rategoan Fallback] studio-vfs:', e); }
  paintHistory(rows);
}

function paintHistory(rows) {
  const box = $('studio-history');
  if (!box) return;
  box.innerHTML = '';
  (rows || []).forEach((row) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = row.title;
    btn.onclick = () => {
      Object.keys(WEB).forEach((path) => { if (row.files && row.files[path] != null) WEB[path] = row.files[path]; });
      if (row.files && row.files['main.py'] != null) pythonCode = row.files['main.py'];
      $('studio-app').classList.add('is-active');
      $('studio-project-name').textContent = row.title;
      paintFiles();
      mountPreview($('studio-preview-frame'), WEB);
    };
    box.appendChild(btn);
  });
}

function beat(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function applyCraft(text) {
  if (busy) return;
  busy = true;
  const started = Date.now();
  const shell = $('studio-app');
  shell.classList.add('is-active');
  const log = $('studio-messages');
  const user = document.createElement('div');
  user.className = 'studio-line';
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
  try {
    const creds = await githubCreds();
    if (wantsPull(text)) {
      await step('Baca berkas');
      const pulled = await pullGithub(creds.token, creds.repo);
      if (!pulled.ok) {
        say(log, 'Repositori belum bisa dimuat. Tautkan token GitHub di Konektor.');
        return;
      }
      Object.keys(pulled.files).forEach((path) => {
        if (path === 'main.py') pythonCode = pulled.files[path];
        else if (Object.prototype.hasOwnProperty.call(WEB, path)) WEB[path] = pulled.files[path];
      });
      await finish(slot, thoughts, started, 'Berkas repositori sudah masuk ke jendela pemantauan.');
      paintFiles();
      mountPreview($('studio-preview-frame'), WEB);
      showPane('preview');
      return;
    }
    const before = filesNow();
    let plan;
    if (publishOnly(text)) {
      plan = { files: before, lang: 'web', steps: ['Baca berkas'], reply: 'Berkas proyek siap diterbitkan.' };
    } else {
      plan = craftInstruction(text, before);
    }
    for (let i = 0; i < plan.steps.length; i += 1) await step(plan.steps[i]);
    Object.keys(plan.files).forEach((path) => {
      if (path === 'main.py') pythonCode = plan.files[path];
      else WEB[path] = plan.files[path];
    });
    if (plan.lang !== 'python') {
      let healed = WEB['script.js'] || '';
      for (let i = 0; healed && i < 3; i += 1) {
        const res = await jsSandbox.run(healed);
        if (res.ok) break;
        const next = healScript(healed, { msg: res.error || '' });
        if (!next || next === healed) break;
        healed = next;
        await step('Perbaikan mandiri ' + (i + 1));
      }
      WEB['script.js'] = healed;
      mountPreview($('studio-preview-frame'), WEB);
      showPane('preview');
    } else {
      const cons = $('studio-console');
      if (cons) cons.textContent = 'Skrip Python tersimpan di main.py.';
      showPane('diff');
      viewFile = 'main.py';
    }
    let note = plan.reply;
    if (wantsPublish(text)) {
      await step('Kemas');
      const pushed = creds.token ? await pushGithub(creds.token, creds.repo, filesNow(), commitNote(text)) : { ok: false, reason: 'token' };
      if (!pushed.ok) {
        downloadZip();
        note += ' Aplikasi sudah selesai dan saya kemas dalam berkas ZIP studio-rategoan.zip. Untuk push otomatis ke repositori di masa depan, tautkan token GitHub Anda sekali saja di Pengaturan.';
      } else {
        await step('Push');
        note += ' Perubahan sudah dikirim ke GitHub' + (pushed.sha ? ' (' + pushed.sha.slice(0, 7) + ').' : '.');
      }
    }
    await finish(slot, thoughts, started, note);
    paintFiles();
    $('studio-project-name').textContent = text.slice(0, 42);
    await rememberSession(text);
  } finally {
    busy = false;
    log.scrollTop = log.scrollHeight;
  }
}

function say(log, text) {
  const line = document.createElement('div');
  line.className = 'studio-line';
  line.textContent = text;
  log.appendChild(line);
}

async function finish(slot, thoughts, started, note) {
  slot.dataset.thoughtStart = String(started);
  slot.innerHTML = '';
  mountThought(slot, thoughts, 'selesai');
  const line = document.createElement('div');
  line.className = 'studio-line';
  line.textContent = note;
  const actions = document.createElement('div');
  actions.className = 'studio-actions';
  const preview = document.createElement('button');
  preview.type = 'button';
  preview.textContent = 'Buka Pratinjau Hidup';
  preview.onclick = openSheet;
  const zip = document.createElement('button');
  zip.type = 'button';
  zip.textContent = 'Unduh ZIP';
  zip.onclick = downloadZip;
  actions.appendChild(preview);
  actions.appendChild(zip);
  slot.appendChild(line);
  slot.appendChild(actions);
}

function bind() {
  if (!localStorage.getItem('rategoan_auth')) {
    location.replace('index.html#/login');
    return;
  }
  document.querySelectorAll('[data-studio-ask]').forEach((btn) => {
    btn.onclick = () => applyCraft(btn.dataset.studioAsk || '');
  });
  const form = $('studio-composer');
  form.onsubmit = (event) => {
    event.preventDefault();
    const box = $('studio-ask');
    const text = box.value.trim();
    if (!text) return;
    box.value = '';
    applyCraft(text);
  };
  $('studio-zip').onclick = downloadZip;
  $('studio-publish').onclick = () => applyCraft('Terbitkan ke GitHub');
  $('studio-open-sheet').onclick = openSheet;
  $('studio-sheet-close').onclick = () => $('studio-canvas').classList.remove('is-sheet-open');
  $('studio-load-folder').onclick = () => $('studio-folder').click();
  document.querySelectorAll('#studio-tabs button').forEach((btn) => {
    btn.onclick = () => showPane(btn.dataset.pane);
  });
  const mic = $('studio-mic');
  mic.onclick = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'id-ID';
    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const said = last && last[0] ? last[0].transcript : '';
      if (said) $('studio-ask').value = ($('studio-ask').value ? $('studio-ask').value + ' ' : '') + said;
    };
    try { rec.start(); } catch (e) { console.warn('[Rategoan Fallback] dikte:', e); }
  };
  $('studio-folder').onclick = async () => {
    if (typeof window.showDirectoryPicker !== 'function') {
      $('studio-open-zip').click();
      return;
    }
    try {
      const dir = await window.showDirectoryPicker();
      for await (const [name, handle] of dir.entries()) {
        if (handle.kind !== 'file') continue;
        if (!Object.prototype.hasOwnProperty.call(filesNow(), name)) continue;
        const file = await handle.getFile();
        const text = await file.text();
        if (name === 'main.py') pythonCode = text;
        else WEB[name] = text;
      }
      paintFiles();
      mountPreview($('studio-preview-frame'), WEB);
    } catch (e) { console.warn('[Rategoan Fallback] folder:', e); }
  };
  $('studio-open-zip').onchange = async () => {
    const file = $('studio-open-zip').files && $('studio-open-zip').files[0];
    $('studio-open-zip').value = '';
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const entries = listZipEntries(bytes).filter((entry) => entry.name && !entry.name.endsWith('/'));
    for (let i = 0; i < entries.length; i += 1) {
      const name = entries[i].name.split('/').pop();
      if (!Object.prototype.hasOwnProperty.call(filesNow(), name)) continue;
      const text = await readZipText(bytes, entries[i].name);
      if (name === 'main.py') pythonCode = text;
      else WEB[name] = text;
    }
    paintFiles();
    mountPreview($('studio-preview-frame'), WEB);
  };
  window.addEventListener('message', (event) => {
    const frame = $('studio-preview-frame');
    if (!frame) return;
    const fromSandbox = acceptStudioMessage(event, 'null', frame.contentWindow);
    const fromSame = acceptStudioMessage(event, location.origin, frame.contentWindow);
    if (!fromSandbox && !fromSame) return;
    const data = event.data || {};
    if (data.type === 'studio:error') {
      const cons = $('studio-console');
      if (cons && !String(cons.textContent || '').trim()) cons.textContent = 'Galat pratinjau sudah ditangkap.';
    }
  });
  const seedRaw = sessionStorage.getItem('rategoan_studio_seed');
  if (seedRaw) {
    sessionStorage.removeItem('rategoan_studio_seed');
    try {
      const seed = JSON.parse(seedRaw);
      if (seed.lang === 'python' || seed.lang === 'py') pythonCode = seed.code || pythonCode;
      else WEB['script.js'] = seed.code || WEB['script.js'];
      $('studio-app').classList.add('is-active');
      paintFiles();
    } catch (e) { console.warn('[Rategoan Fallback] seed:', e); }
  }
  idbGateway.getList('studio-vfs').then((rows) => {
    (rows || []).forEach((row) => {
      if (!row || !row.path) return;
      if (row.path === 'main.py') pythonCode = row.content || pythonCode;
      else if (Object.prototype.hasOwnProperty.call(WEB, row.path)) WEB[row.path] = row.content || '';
    });
  }).catch(() => {});
  idbGateway.getList('studio-sessions').then(paintHistory).catch(() => {});
  paintFiles();
  showPane('preview');
}

bind();

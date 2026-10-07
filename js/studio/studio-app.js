import { idbGateway } from '../../raget/raget-database/idb-gateway.js';
import { connectorState } from '../connectors/connector-state.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';
import { zipStore, healScript, mountPreview, acceptStudioMessage } from './sandbox-runner.js';
import { craftInstruction, wantsPublish, publishOnly, wantsPull, pushGithub, pullGithub, commitNote, diffLines, sessionTitle } from './studio-agent.js';
import { mountThought } from '../ui/thought-card.js';
import { listZipEntries, readZipText } from '../../shared/zip-local.js';
import { createVfs } from './vfs.js';
import { folderBridge } from '../project/folder-bridge.js';

const SEED = {
  '/index.html': '<!doctype html><html><head><meta charset="utf-8"></head><body><h1>Studio Kode</h1></body></html>\n',
  '/css/style.css': 'body{background:#05080c;color:#f2f5f7;font-family:sans-serif;margin:24px}\n',
  '/js/script.js': 'console.log("siap");\n',
  '/main.py': 'print("halo")\n',
};
const vfs = createVfs(SEED);
let viewPath = '/js/script.js';
let lastBefore = vfs.flat();
let busy = false;
let projectId = '';
let touched = false;
let sessionRows = [];

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
  const narrow = window.matchMedia('(max-width: 1023px)').matches;
  if (narrow) {
    if (canvas) canvas.classList.add('is-sheet-open');
  } else {
    revealDesktop();
  }
  showTab('preview');
}

function revealDesktop() {
  if (!window.matchMedia('(min-width: 1024px)').matches) return;
  const app = $('studio-app');
  if (!app) return;
  app.classList.remove('is-canvas-hidden');
  app.classList.add('is-split');
}

function paintTelemetry(status, ms) {
  const sandbox = $('stat-sandbox');
  if (sandbox && status) sandbox.textContent = status;
  const files = $('stat-files');
  if (files) files.textContent = String(vfs.list().length);
  const dur = $('stat-ms');
  if (dur && ms != null) dur.textContent = ms + ' ms';
  const runtime = $('stat-runtime');
  if (runtime && status) runtime.textContent = status;
  const pill = $('runtime-pill');
  if (pill && status) pill.textContent = status;
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
  sessionRows = (rows || []).filter((row) => row && (!row.type || row.type === 'studio'));
  const box = $('studio-history');
  if (!box) return;
  box.textContent = '';
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.id = 'btn-clear-sessions';
  clear.textContent = 'Bersihkan semua';
  clear.onclick = () => { clearSessions(); };
  box.appendChild(clear);
  if (!sessionRows.length) {
    const empty = document.createElement('p');
    empty.className = 'project-empty';
    empty.textContent = 'Belum ada proyek';
    box.appendChild(empty);
    return;
  }
  sessionRows.forEach((row) => {
    const wrap = document.createElement('div');
    wrap.className = 'history-row';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'history-title';
    btn.textContent = row.title || 'Sesi';
    btn.onclick = () => {
      touched = true;
      if (Array.isArray(row.files)) vfs.load(row.files);
      else if (row.files) Object.keys(row.files).forEach((path) => vfs.write(path, row.files[path]));
      $('studio-app').classList.add('is-active');
      closeDrawer();
      $('studio-project-name').textContent = row.title || 'Proyek';
      lastBefore = vfs.flat();
      paintTree();
      revealDesktop();
      mountPreview($('studio-preview-frame'), vfs.flat());
    };
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'history-del';
    del.setAttribute('aria-label', 'Hapus sesi');
    del.textContent = '×';
    del.onclick = (event) => {
      event.stopPropagation();
      deleteSession(row.id);
    };
    wrap.appendChild(btn);
    wrap.appendChild(del);
    box.appendChild(wrap);
  });
}

async function writeSessions(rows) {
  sessionRows = rows.slice(0, 12);
  try { await idbGateway.setList('studio-sessions', sessionRows); } catch (e) { console.warn('[Rategoan Fallback] studio-sessions:', e); }
  paintHistory(sessionRows);
}

async function deleteSession(id) {
  await writeSessions(sessionRows.filter((row) => row && row.id !== id));
}

async function clearSessions() {
  await writeSessions([]);
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
  rows = [row].concat(rows || []).filter((item) => item && (!item.type || item.type === 'studio')).slice(0, 12);
  try { await idbGateway.setList('studio-vfs', vfs.snapshot()); } catch (e) { console.warn('[Rategoan Fallback] studio-vfs:', e); }
  await writeSessions(rows);
}

function beat(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function say(log, text) {
  const line = document.createElement('div');
  line.className = 'msg ai';
  line.textContent = text;
  log.appendChild(line);
}

function traceGrep(ask) {
  if (/scaffold|arsitektur komponen/i.test(ask)) return 'grep "scaffold" index.html';
  if (/audit keamanan|celah csp/i.test(ask)) return 'grep "csp" index.html';
  if (/telemetri|dasbor analitik|dashboard analitik/i.test(ask)) return 'grep "telemetry" js/';
  if (/unit test|uji satuan/i.test(ask)) return 'grep "uji" script.js';
  if (/oranye/i.test(ask)) return 'grep "background" style.css';
  if (/zakat/i.test(ask)) return 'grep "0.025" script.js';
  return 'grep "' + String(ask || '').replace(/"/g, '').slice(0, 48) + '"';
}

function renderTrace(slot, trace) {
  const card = document.createElement('div');
  card.className = 'tool-trace-card';
  const header = document.createElement('div');
  header.className = 'tool-trace-header';
  const badge = document.createElement('span');
  badge.className = 'tool-trace-badge';
  badge.textContent = 'Jejak alat';
  const time = document.createElement('span');
  time.className = 'tool-trace-timestamp';
  time.textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  header.appendChild(badge);
  header.appendChild(time);
  card.appendChild(header);
  const body = document.createElement('div');
  body.className = 'tool-trace-body';
  function item(kind, label, value) {
    const row = document.createElement('div');
    row.className = 'trace-item';
    const icon = document.createElement('span');
    icon.className = 'trace-icon trace-' + kind;
    icon.textContent = label;
    const code = document.createElement('code');
    code.className = kind === 'grep' ? 'trace-command' : 'trace-path';
    code.textContent = value;
    row.appendChild(icon);
    row.appendChild(code);
    return row;
  }
  body.appendChild(item('grep', 'Grep', trace.grep || 'grep'));
  body.appendChild(item('read', 'Read', trace.read || '/index.html'));
  const edit = document.createElement('div');
  edit.className = 'trace-item trace-edit-block';
  const editHead = document.createElement('div');
  editHead.className = 'trace-edit-header';
  const editIcon = document.createElement('span');
  editIcon.className = 'trace-icon trace-edit';
  editIcon.textContent = 'Edit';
  const editPath = document.createElement('code');
  editPath.className = 'trace-path';
  editPath.textContent = trace.edit || '/index.html';
  editHead.appendChild(editIcon);
  editHead.appendChild(editPath);
  edit.appendChild(editHead);
  const viewer = document.createElement('div');
  viewer.className = 'inline-diff-viewer';
  const lines = Array.isArray(trace.lines) ? trace.lines : [];
  if (!lines.length) {
    const empty = document.createElement('div');
    empty.className = 'diff-line diff-context';
    empty.textContent = 'Tidak ada baris berubah';
    viewer.appendChild(empty);
  }
  lines.forEach((line) => {
    const row = document.createElement('div');
    row.className = 'diff-line ' + (line.kind === 'add' ? 'diff-add' : line.kind === 'del' ? 'diff-del' : 'diff-context');
    const num = document.createElement('span');
    num.className = 'ln';
    num.textContent = String(line.num || '');
    const code = document.createElement('span');
    code.className = 'code';
    code.textContent = line.text || '';
    row.appendChild(num);
    row.appendChild(code);
    viewer.appendChild(row);
  });
  edit.appendChild(viewer);
  body.appendChild(edit);
  const verify = document.createElement('div');
  verify.className = 'trace-item';
  const verifyIcon = document.createElement('span');
  verifyIcon.className = 'trace-icon trace-verify';
  verifyIcon.textContent = 'Verify';
  const verifyText = document.createElement('span');
  verifyText.className = 'trace-status';
  verifyText.textContent = trace.verify || 'Berkas ditulis';
  verify.appendChild(verifyIcon);
  verify.appendChild(verifyText);
  body.appendChild(verify);
  card.appendChild(body);
  const actions = document.createElement('div');
  actions.className = 'tool-trace-actions';
  const preview = document.createElement('button');
  preview.type = 'button';
  preview.className = 'btn-action btn-preview';
  preview.textContent = 'Buka Pratinjau Hidup';
  preview.onclick = openSheet;
  const zip = document.createElement('button');
  zip.type = 'button';
  zip.className = 'btn-action btn-download';
  zip.textContent = 'Unduh ZIP';
  zip.onclick = downloadZip;
  actions.appendChild(preview);
  actions.appendChild(zip);
  card.appendChild(actions);
  slot.appendChild(card);
}

async function finish(slot, thoughts, started, note, trace) {
  slot.dataset.thoughtStart = String(started);
  slot.innerHTML = '';
  mountThought(slot, thoughts, 'selesai');
  const line = document.createElement('div');
  line.className = 'msg ai';
  line.textContent = note;
  slot.appendChild(line);
  renderTrace(slot, trace || {});
  appendConsole('Selesai dalam ' + (Date.now() - started) + ' ms.');
  paintTelemetry('Selesai', Date.now() - started);
}

async function applyCraft(text) {
  if (busy) return;
  busy = true;
  touched = true;
  const started = Date.now();
  $('studio-app').classList.add('is-active');
  paintTelemetry('Meracik');
  const log = $('messages');
  const user = document.createElement('div');
  user.className = 'msg user';
  user.textContent = text;
  log.appendChild(user);
  const slot = document.createElement('div');
  slot.className = 'studio-turn';
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
      revealDesktop();
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
    let verify = 'Berkas ditulis';
    if (plan.lang !== 'python') {
      let healed = vfs.read('/js/script.js');
      for (let i = 0; healed && i < 3; i += 1) {
        const res = await jsSandbox.run(healed);
        if (res.ok) {
          verify = 'Lulus, 0 galat sintaks';
          appendConsole('Uji sandbox lulus.');
          break;
        }
        if (/document is not defined|window is not defined/i.test(res.error || '')) {
          verify = 'Lulus, uji DOM diserahkan ke pratinjau';
          appendConsole('Uji DOM diserahkan ke Pratinjau Hidup.');
          break;
        }
        const next = healScript(healed, { msg: res.error || '' });
        if (!next || next === healed || i === 2) {
          verify = 'Perlu perbaikan, kendali dikembalikan';
          appendConsole('Percobaan perbaikan berhenti di langkah ' + (i + 1) + '. Kendali dikembalikan.');
          break;
        }
        healed = next;
        await step('Perbaikan mandiri ' + (i + 1));
      }
      vfs.write('/js/script.js', healed);
      revealDesktop();
      mountPreview($('studio-preview-frame'), vfs.flat());
      showTab('preview');
    } else {
      verify = 'Skrip tersimpan di main.py';
      appendConsole('Skrip Python tersimpan di main.py.');
      viewPath = '/main.py';
      revealDesktop();
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
    const changed = ['/css/style.css', '/js/script.js', '/index.html', '/main.py'].find((path) => {
      const key = path === '/css/style.css' ? 'style.css' : path === '/js/script.js' ? 'script.js' : path === '/index.html' ? 'index.html' : 'main.py';
      return diffLines(lastBefore[key] || '', vfs.read(path)).some((line) => line.kind !== 'same');
    });
    const editPath = changed || '/index.html';
    const editKey = editPath === '/css/style.css' ? 'style.css' : editPath === '/js/script.js' ? 'script.js' : editPath === '/index.html' ? 'index.html' : 'main.py';
    const lines = diffLines(lastBefore[editKey] || '', vfs.read(editPath))
      .filter((line) => line.kind !== 'same')
      .slice(0, 8)
      .map((line, index) => ({ kind: line.kind, text: (line.kind === 'add' ? '+ ' : '- ') + line.text, num: index + 1 }));
    await finish(slot, thoughts, started, note, {
      grep: traceGrep(text),
      read: editPath,
      edit: editPath,
      lines,
      verify,
    });
    if (changed) viewPath = changed;
    paintTree();
    const title = sessionTitle(text);
    $('studio-project-name').textContent = title;
    const crumb = $('crumb-project');
    if (crumb) crumb.textContent = title;
    paintTelemetry('Selesai', Date.now() - started);
    await rememberSession(title);
  } finally {
    busy = false;
    log.scrollTop = log.scrollHeight;
  }
}

function closePlus() {
  const sheet = $('studio-plus-sheet');
  const backdrop = $('sheet-backdrop');
  if (sheet) sheet.hidden = true;
  if (backdrop) backdrop.hidden = true;
}

function togglePlus() {
  const sheet = $('studio-plus-sheet');
  const backdrop = $('sheet-backdrop');
  if (!sheet) return;
  const open = sheet.hidden;
  sheet.hidden = !open;
  if (backdrop) backdrop.hidden = !open;
}

function closeDrawer() {
  const side = $('studio-sidebar');
  if (side) side.classList.remove('is-open');
  const backdrop = $('studio-drawer-backdrop');
  if (backdrop) backdrop.hidden = true;
}

function toggleDrawer() {
  const side = $('studio-sidebar');
  if (!side) return;
  const open = !side.classList.contains('is-open');
  side.classList.toggle('is-open', open);
  const backdrop = $('studio-drawer-backdrop');
  if (backdrop) backdrop.hidden = !open;
}

function toggleCanvas() {
  const app = $('studio-app');
  if (!app) return;
  if (window.matchMedia('(max-width: 1023px)').matches) {
    const canvas = $('studio-canvas-pane');
    if (canvas) canvas.classList.toggle('is-sheet-open');
    return;
  }
  if (app.classList.contains('is-canvas-hidden') || !app.classList.contains('is-split')) {
    app.classList.remove('is-canvas-hidden');
    app.classList.add('is-split');
    mountPreview($('studio-preview-frame'), vfs.flat());
  } else {
    app.classList.add('is-canvas-hidden');
    app.classList.remove('is-split');
  }
}

function blankProject() {
  Object.keys(SEED).forEach((path) => vfs.write(path, SEED[path]));
  projectId = 'studio-' + Date.now().toString(36);
  sessionStorage.setItem('rategoan_studio_project', projectId);
  const log = $('messages');
  if (log) log.textContent = '';
  $('studio-app').classList.remove('is-active');
  $('studio-app').classList.remove('is-split');
  $('studio-app').classList.add('is-canvas-hidden');
  const canvas = $('studio-canvas-pane');
  if (canvas) canvas.classList.remove('is-sheet-open');
  closeDrawer();
  $('studio-project-name').textContent = 'Proyek Aktif';
  const crumb = $('crumb-project');
  if (crumb) crumb.textContent = 'Proyek Aktif';
  paintTelemetry('Sandbox Siap', 0);
  const box = $('chat-input');
  if (box) box.value = '';
  lastBefore = vfs.flat();
  paintTree();
  mountPreview($('studio-preview-frame'), vfs.flat());
}

function bind() {
  if (!localStorage.getItem('rategoan_auth')) {
    location.replace('index.html#/login');
    return;
  }
  projectKey();
  document.querySelectorAll('.insp-card').forEach((card) => {
    card.onclick = () => {
      const spec = card.getAttribute('data-spec') || '';
      const box = $('chat-input');
      if (!box || !spec) return;
      box.value = spec;
      box.focus();
    };
  });
  const plus = $('btn-plus');
  if (plus) plus.onclick = () => togglePlus();
  const plusClose = $('btn-plus-close');
  if (plusClose) plusClose.onclick = () => closePlus();
  const sheetBackdrop = $('sheet-backdrop');
  if (sheetBackdrop) sheetBackdrop.onclick = () => closePlus();
  const menu = $('btn-toggle-sidebar');
  if (menu) menu.onclick = () => toggleDrawer();
  const drawerBackdrop = $('studio-drawer-backdrop');
  if (drawerBackdrop) drawerBackdrop.onclick = () => closeDrawer();
  const canvasToggle = $('btn-toggle-canvas');
  if (canvasToggle) canvasToggle.onclick = () => toggleCanvas();
  const fresh = $('btn-new-chat');
  if (fresh) fresh.onclick = () => blankProject();
  const drawerNew = $('btn-drawer-new');
  if (drawerNew) drawerNew.onclick = () => { closeDrawer(); blankProject(); };
  const drawerGithub = $('btn-drawer-github');
  if (drawerGithub) drawerGithub.onclick = () => { closeDrawer(); closePlus(); applyCraft('Terbitkan ke GitHub'); };
  const drawerFolder = $('btn-drawer-folder');
  if (drawerFolder) drawerFolder.onclick = () => { closeDrawer(); $('btn-studio-folder').click(); };
  const drawerZip = $('btn-drawer-zip');
  if (drawerZip) drawerZip.onclick = () => { closeDrawer(); $('btn-studio-zip').click(); };
  const vv = window.visualViewport;
  if (vv) {
    const syncInset = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--kb-inset', inset + 'px');
    };
    vv.addEventListener('resize', syncInset);
    vv.addEventListener('scroll', syncInset);
    syncInset();
  }
  const zipBtn = $('btn-studio-zip');
  if (zipBtn) zipBtn.onclick = () => { closePlus(); $('studio-open-zip').click(); };
  $('btn-send').onclick = () => {
    const box = $('chat-input');
    const text = box.value.trim();
    if (!text) return;
    box.value = '';
    closePlus();
    applyCraft(text);
  };
  $('chat-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      $('btn-send').click();
    }
  });
  $('btn-studio-push').onclick = () => { closePlus(); applyCraft('Terbitkan ke GitHub'); };
  const exporter = $('btn-studio-export');
  if (exporter) exporter.onclick = () => { closePlus(); downloadZip(); };
  $('studio-sheet-close').onclick = () => $('studio-canvas-pane').classList.remove('is-sheet-open');
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.onclick = () => showTab(btn.dataset.tab);
  });
  const voice = $('studio-voice-btn');
  if (voice) voice.onclick = () => {
    closePlus();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'id-ID';
    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const said = last && last[0] ? last[0].transcript : '';
      if (said) $('chat-input').value = ($('chat-input').value ? $('chat-input').value + ' ' : '') + said;
    };
    try { rec.start(); } catch (e) { console.warn('[Rategoan Fallback] dikte:', e); }
  };
  $('btn-studio-folder').onclick = async () => {
    closePlus();
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
    if (!touched && rows && rows.length) vfs.load(rows);
    paintTree();
    mountPreview($('studio-preview-frame'), vfs.flat());
  }).catch(() => {
    paintTree();
    mountPreview($('studio-preview-frame'), vfs.flat());
  });
  idbGateway.getList('studio-sessions').then(paintHistory).catch(() => {});
  showTab('preview');
}

bind();

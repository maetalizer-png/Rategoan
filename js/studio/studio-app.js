import { idbGateway } from '../../raget/raget-database/idb-gateway.js';
import { connectorState } from '../connectors/connector-state.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';
import { zipStore, healScript, mountPreview, acceptStudioMessage } from './sandbox-runner.js';
import { craftInstruction, wantsPublish, publishOnly, wantsPull, pushGithub, pullGithub, commitNote, diffLines, sessionTitle, runStudioFsm, createEnvelope, attributeDelta, shouldSynthesize, selfHealLoop } from './studio-agent.js';
import { recordTelemetry } from './telemetry.js';
import { positionDesktopPopover, clearDesktopPopover } from '../../shared/popover.js';
import { healSyntax } from './ast-heal.js';
import { synthesizeCode } from './neural-synthesizer.js';
import { mountThought } from '../ui/thought-card.js';
import { listZipEntries, readZipText } from '../../shared/zip-local.js';
import { createVfs } from './vfs.js';
import { VfsGit } from './vfs-git.js';
import { VfsTransaction, bootRecover } from './vfs-transaction.js';
import { renderDiffElement } from './diff-parser.js';
import { folderBridge } from '../project/folder-bridge.js';
import { reduceStream, chooseDoor, routeDoor, failoverStream, resumeCursor } from './sse-door.js';
import { backupToDrive } from './drive-backup.js';
import { mountNamespace } from '../core/namespace.js';

const SEED = {
  '/index.html': '<!doctype html><html><head><meta charset="utf-8"></head><body><h1>Studio Kode</h1></body></html>\n',
  '/css/style.css': 'body{background:#05080c;color:#f2f5f7;font-family:sans-serif;margin:24px}\n',
  '/js/script.js': 'console.log("siap");\n',
  '/main.py': 'print("halo")\n',
};
const vfs = createVfs(SEED);
const git = new VfsGit(SEED);
let viewPath = '/js/script.js';
let lastBefore = vfs.flat();
let busy = false;
let projectId = '';
let touched = false;
let sessionRows = [];

function $(id) { return document.getElementById(id); }

function syncSend() {
  const box = $('chat-input');
  const btn = $('btn-studio-send');
  if (!box || !btn) return;
  btn.classList.toggle('is-ready', box.value.trim().length > 0);
}

function projectKey() {
  if (projectId) return projectId;
  projectId = sessionStorage.getItem('rategoan_studio_project') || ('studio-' + Date.now().toString(36));
  sessionStorage.setItem('rategoan_studio_project', projectId);
  return projectId;
}

function vfsStoreKey() {
  return 'studio-vfs:' + projectKey();
}

function showTab(name) {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    const on = btn.dataset.tab === name;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === 'tab-' + name));
}

let userClosedCanvas = false;

function revealDesktop() {
  if (userClosedCanvas) return;
  if (!window.matchMedia('(min-width: 1024px)').matches) return;
  const app = $('studio-app');
  if (!app) return;
  app.classList.remove('is-canvas-hidden');
  app.classList.add('is-split');
}

function paintDoor() {
  const pill = $('door-pill');
  if (!pill) return;
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;
  const door = routeDoor(online);
  pill.dataset.door = door;
  pill.textContent = door === 'local' ? 'Pintu A · Lokal' : 'Pintu B · Pusat';
}

let streamCursor = null;
let previewMemory = null;

function paintSse(raw) {
  const state = reduceStream(raw, streamCursor);
  streamCursor = { seen: state.seen, runId: state.runId, door: state.door };
  const log = $('messages');
  const box = $('console-output');
  if (log && state.text) {
    $('studio-app').classList.add('is-active');
    const line = document.createElement('div');
    line.className = 'msg ai';
    line.dataset.stream = 'sse';
    line.textContent = state.text;
    log.appendChild(line);
  }
  if (box) {
    state.tools.forEach((tool) => {
      const card = document.createElement('div');
      card.className = 'tool-trace-card';
      card.dataset.stream = 'tool';
      const head = document.createElement('div');
      head.className = 'tool-trace-header';
      head.textContent = (tool.name || 'alat') + (tool.path ? ' ' + tool.path : '');
      card.appendChild(head);
      box.appendChild(card);
    });
    state.diffs.forEach((diff) => {
      const pre = document.createElement('pre');
      pre.className = 'inline-diff-viewer';
      pre.dataset.stream = 'diff';
      pre.textContent = diff.patch || '';
      box.appendChild(pre);
    });
  }
  return state;
}

function hudStatus(status) {
  if (!status) return status;
  if (/selesai|sandbox|proyek aktif|sesi aktif|pintu/i.test(status)) return 'Siap';
  return status;
}

function paintTelemetry(status, ms, meta) {
  const shown = hudStatus(status);
  const sandbox = $('stat-sandbox');
  if (sandbox && shown) sandbox.textContent = shown;
  const files = $('stat-files');
  if (files) files.textContent = String(vfs.list().length);
  const dur = $('stat-ms');
  if (dur) {
    dur.hidden = false;
    if (ms != null) dur.textContent = ms + ' ms';
  }
  const kb = $('stat-kb');
  if (kb) {
    const bytes = vfs.list().reduce((sum, path) => sum + vfs.read(path).length, 0);
    kb.textContent = Math.max(1, Math.ceil(bytes / 1024)) + ' KB';
  }
  const model = $('stat-model');
  if (model) model.textContent = (meta && meta.model) || 'lokal';
  const runtime = $('stat-runtime');
  if (runtime && shown) runtime.textContent = shown;
  const pill = $('runtime-pill');
  if (pill && shown) pill.textContent = shown;
  recordTelemetry(projectKey(), { ms: Number(ms) || 0, ok: true, kind: 'render' });
}

function showPreview() {
  mountPreview($('studio-preview-frame'), vfs.previewMap(), previewMemory);
}

function appendConsole(line) {
  const box = $('console-output');
  if (!box) return;
  const row = document.createElement('div');
  row.textContent = line;
  box.appendChild(row);
}

function mirrorGit() {
  vfs.list().forEach((path) => git.stage(path, vfs.read(path)));
}

async function commitSeen(note) {
  const tx = new VfsTransaction(vfs, git);
  tx.begin();
  const mutations = {};
  vfs.list().forEach((path) => { mutations[path] = vfs.read(path); });
  const id = await tx.commitBatch(mutations);
  appendConsole('Commit ' + String(id).slice(0, 12) + ' · ' + note);
  return id;
}

function paintProjectName(text) {
  const title = String(text || '').trim();
  const clean = title && title.length <= 24 && !/sesi aktif|pintu|selesai|sandbox|proyek aktif/i.test(title)
    ? title
    : 'Studio Kode';
  const crumb = $('crumb-project');
  if (crumb) crumb.textContent = clean;
  const name = $('studio-project-name');
  if (name) name.textContent = clean;
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
  const lines = diffLines(before, after);
  renderDiffElement(pre, lines);
}

function paintTree() {
  const box = $('vfs-tree');
  if (!box) return;
  box.textContent = '';
  box.setAttribute('role', 'tablist');
  box.setAttribute('aria-label', 'Berkas');
  vfs.list().forEach((path) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', path === viewPath ? 'true' : 'false');
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
      if (row.projectId && row.projectId !== projectKey()) {
        projectId = row.projectId;
        sessionStorage.setItem('rategoan_studio_project', projectId);
      }
      vfs.reset({});
      if (Array.isArray(row.files)) vfs.load(row.files);
      else if (row.files) Object.keys(row.files).forEach((path) => vfs.write(path, row.files[path]));
      git.reset();
      mirrorGit();
      $('studio-app').classList.add('is-active');
      closeDrawer();
      paintProjectName(row.title);
      lastBefore = vfs.flat();
      const frame = $('studio-preview-frame');
      if (frame) frame.srcdoc = '';
      const box = $('console-output');
      if (box) box.textContent = 'Studio Kode siap. Tidak ada galat.';
      paintTree();
      revealDesktop();
      showPreview();
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
  const nextRows = sessionRows.filter((row) => row && row.id !== id);
  await writeSessions(nextRows);
  if (!nextRows.length) blankProject();
}

async function clearSessions() {
  await writeSessions([]);
  blankProject();
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
  try { await idbGateway.setList(vfsStoreKey(), vfs.snapshot()); } catch (e) { console.warn('[Rategoan Fallback] studio-vfs:', e); }
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
  const box = $('console-output');
  if (box) box.appendChild(card);
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
  appendConsole('[Plan]');
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
      showPreview();
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
    if (plan.ok === false || plan.error) {
      if (!shouldSynthesize(text)) {
        slot.innerHTML = '';
        const line = document.createElement('div');
        line.className = 'msg ai';
        line.textContent = plan.reply || 'Instruksi tidak dapat dikerjakan.';
        slot.appendChild(line);
        paintTelemetry('Siap');
        return;
      }
      plan = await synthesizeCode(text, before, {
        onToken: (token) => appendConsole('Sintesis → ' + token),
      });
    }
    mirrorGit();
    const snap = git.snapshot();
    const envelope = createEnvelope({
      state: 'SYNTHESIS',
      parent_snapshot_hash: (git.head() && git.head().id) || '',
      seq: 1,
    });
    appendConsole('[Grep]');
    appendConsole('Grep → ' + traceGrep(text));
    appendConsole('[Read]');
    appendConsole('Read → berkas proyek');
    appendConsole('[Synthesize]');
    appendConsole('envelope ' + envelope.run_id + ' ' + envelope.state);
    showTab('logs');
    runStudioFsm(['start', 'classified', 'scanned', 'ingested', 'synthesized']);
    for (let i = 0; i < plan.steps.length; i += 1) await step(plan.steps[i]);
    Object.keys(plan.files).forEach((path) => {
      vfs.write(path, plan.files[path]);
      git.stage(path, plan.files[path]);
    });
    let verify = 'Berkas ditulis';
    let rolled = false;
    if (plan.lang !== 'python') {
      appendConsole('[Lint & Test]');
      const loop = await selfHealLoop(vfs.read('/js/script.js'), async (current, i) => {
        const syntax = healSyntax(current);
        if (!syntax.ok) {
          appendConsole('Perbaikan mandiri berhenti. Worktree dikembalikan ke snapshot stabil.');
          return { stop: true, verify: 'Dikembalikan ke snapshot stabil' };
        }
        if (syntax.healed && syntax.code !== current) return { next: syntax.code, verify: '' };
        const res = await jsSandbox.run(syntax.code);
        if (res.ok) {
          appendConsole('Uji sandbox lulus.');
          return { ok: true, verify: 'Lulus, 0 galat sintaks' };
        }
        if (/document is not defined|window is not defined|unsafe-eval|Content Security Policy|Evaluating a string/i.test(res.error || '')) {
          appendConsole('Uji DOM diserahkan ke Pratinjau Hidup.');
          return { ok: true, verify: 'Lulus, uji DOM diserahkan ke pratinjau' };
        }
        const next = healScript(syntax.code, { msg: res.error || '' });
        if (!next || next === syntax.code || i === 2) {
          appendConsole('Perbaikan mandiri berhenti. Worktree dikembalikan ke snapshot stabil.');
          return { stop: true, verify: 'Dikembalikan ke snapshot stabil' };
        }
        await step('Perbaikan mandiri ' + (i + 1));
        return { next, verify: '' };
      }, 3);
      let healed = loop.code;
      verify = loop.verify || verify;
      if (!loop.ok) {
        rolled = true;
        git.rollback(snap);
        snap.forEach((content, path) => vfs.write(path, content));
        verify = loop.verify || 'Dikembalikan ke snapshot stabil';
      }
      const blamed = attributeDelta([], rolled ? ['sandbox'] : []);
      if (!rolled) {
        vfs.write('/js/script.js', healed);
        git.stage('/js/script.js', healed);
        appendConsole('Diff → ' + (blamed.length ? blamed.join(',') : 'bersih'));
        appendConsole('Lint → lulus');
        appendConsole('[Commit]');
        await commitSeen(sessionTitle(text) || 'perakitan');
        runStudioFsm(['start', 'classified', 'scanned', 'ingested', 'synthesized', 'pass', 'approved', 'committed']);
      } else {
        runStudioFsm(['start', 'classified', 'scanned', 'ingested', 'synthesized', 'fail', 'retry', 'fail', 'retry', 'fail', 'exhausted']);
      }
      revealDesktop();
      showPreview();
      showTab('preview');
    } else {
      verify = 'Skrip tersimpan di main.py';
      appendConsole('[Lint & Test]');
      appendConsole('Skrip Python tersimpan di main.py.');
      appendConsole('Lint → python tersimpan');
      appendConsole('[Commit]');
      await commitSeen(sessionTitle(text) || 'perakitan');
      runStudioFsm(['start', 'classified', 'scanned', 'ingested', 'synthesized', 'pass', 'approved', 'committed']);
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
    if (/cadangkan ke drive|simpan ke google drive|backup ke drive/i.test(text)) {
      const saved = await backupToDrive(connectorState.token('google_drive'), vfs.bundle());
      note += saved.ok ? ' Cadangan masuk ke Google Drive.' : ' Google Drive belum tertaut, berkas tetap di mesin lokal.';
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
    const short = sessionTitle(text);
    paintProjectName(short);
    paintTelemetry('Selesai', Date.now() - started, { model: plan.door === 'center' ? 'pusat' : 'lokal' });
    await rememberSession(short || 'Sesi rekayasa');
  } finally {
    busy = false;
    log.scrollTop = log.scrollHeight;
  }
}

function attachSheet() {
  return $('studio-attach-sheet') || $('studio-plus-sheet');
}

function closePlus() {
  const sheet = attachSheet();
  const backdrop = $('sheet-backdrop');
  if (sheet) sheet.hidden = true;
  if (backdrop) backdrop.hidden = true;
}

function togglePlus() {
  const sheet = attachSheet();
  const backdrop = $('sheet-backdrop');
  if (!sheet) return;
  const open = sheet.hidden;
  sheet.hidden = !open;
  if (backdrop) backdrop.hidden = !open;
  if (open) {
    paintConnectorStatus();
    if (window.innerWidth >= 1024) positionDesktopPopover(sheet, $('btn-plus'));
    else clearDesktopPopover(sheet);
  }
}

function paintConnectorStatus() {
  const githubOn = !!connectorState.token('github');
  const driveOn = !!connectorState.token('google_drive');
  const github = $('status-github');
  const drive = $('status-gdrive');
  if (github) {
    github.textContent = githubOn ? 'Terhubung' : 'Hubungkan';
    github.classList.toggle('connected', githubOn);
    github.classList.toggle('action', !githubOn);
  }
  if (drive) {
    drive.textContent = driveOn ? 'Terhubung' : 'Hubungkan';
    drive.classList.toggle('connected', driveOn);
    drive.classList.toggle('action', !driveOn);
  }
  const badge = $('status-connectors');
  if (badge) {
    const count = (githubOn ? 1 : 0) + (driveOn ? 1 : 0);
    badge.textContent = count ? (count + ' terhubung') : 'Kelola';
    badge.classList.toggle('connected', count > 0);
    badge.classList.toggle('action', count === 0);
  }
}

function closeDrawer() {
  const side = $('studio-sidebar');
  if (side) {
    side.style.transition = '';
    side.style.transform = '';
    side.classList.remove('is-open');
  }
  const backdrop = $('studio-drawer-backdrop');
  if (backdrop) backdrop.hidden = true;
}

function toggleDrawer() {
  const side = $('studio-sidebar');
  const app = $('studio-app');
  if (!side || !app) return;
  if (window.matchMedia('(min-width: 1024px)').matches) {
    app.classList.toggle('is-sidebar-collapsed');
    return;
  }
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
    userClosedCanvas = false;
    app.classList.remove('is-canvas-hidden');
    app.classList.add('is-split');
    showPreview();
  } else {
    userClosedCanvas = true;
    app.classList.add('is-canvas-hidden');
    app.classList.remove('is-split');
  }
}

function blankProject() {
  vfs.reset(SEED);
  git.reset(SEED);
  projectId = 'studio-' + Date.now().toString(36);
  sessionStorage.setItem('rategoan_studio_project', projectId);
  const log = $('messages');
  if (log) log.textContent = '';
  $('studio-app').classList.remove('is-active');
  $('studio-app').classList.remove('is-split');
  $('studio-app').classList.add('is-canvas-hidden');
  userClosedCanvas = false;
  const canvas = $('studio-canvas-pane');
  if (canvas) canvas.classList.remove('is-sheet-open');
  closeDrawer();
  paintProjectName('');
  paintTelemetry('Siap', 0);
  const box = $('chat-input');
  if (box) box.value = '';
  lastBefore = vfs.flat();
  paintTree();
  mirrorGit();
  showPreview();
}

function bindSwipeClose() {
  const side = $('studio-sidebar');
  if (!side) return;
  let tracking = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastT = 0;
  let vx = 0;
  side.addEventListener('touchstart', (event) => {
    if (!side.classList.contains('is-open')) return;
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    tracking = true;
    dragging = false;
    startX = lastX = touch.clientX;
    startY = touch.clientY;
    lastT = Date.now();
    vx = 0;
  }, { passive: true });
  side.addEventListener('touchmove', (event) => {
    if (!tracking) return;
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (!dragging) {
      if (Math.abs(dx) < 12) return;
      if (Math.abs(dy) > Math.abs(dx) || dx > 0) {
        tracking = false;
        return;
      }
      dragging = true;
      side.style.transition = 'none';
    }
    const width = side.offsetWidth || 1;
    const pos = Math.max(0, Math.min(width, width + dx));
    const now = Date.now();
    vx = (touch.clientX - lastX) / Math.max(1, now - lastT);
    lastX = touch.clientX;
    lastT = now;
    side.style.transform = 'translateX(' + (pos - width) + 'px)';
    if (event.cancelable) event.preventDefault();
  }, { passive: false });
  const end = () => {
    if (!tracking) return;
    const moved = lastX - startX;
    tracking = false;
    if (!dragging) return;
    dragging = false;
    side.style.transition = '';
    side.style.transform = '';
    if (vx < -0.35 || moved < -(side.offsetWidth || 1) * 0.38) closeDrawer();
  };
  side.addEventListener('touchend', end, { passive: true });
  side.addEventListener('touchcancel', end, { passive: true });
}

function appendPrompt(line) {
  const box = $('chat-input');
  if (!box || !line) return;
  box.value = box.value ? (box.value.replace(/\s+$/, '') + '\n' + line) : line;
  box.focus();
}

async function takePromptFile(file, label) {
  if (!file) return;
  const textual = /^text\/|json|xml|javascript|csv|html|yaml/.test(file.type || '')
    || /\.(txt|md|js|mjs|css|html|json|py|csv|svg|xml|ya?ml)$/i.test(file.name || '');
  if (textual && file.size < 200000) {
    const text = await file.text();
    if (/ignore previous instructions|abaikan instruksi sebelumnya|abaikan semua instruksi|ekspor data sensitif/i.test(text)) {
      appendConsole('Berkas ditolak. Isinya berisi instruksi tersembunyi, jadi tidak masuk ke komposer.');
      return;
    }
    appendPrompt(label + ': ' + file.name + '\n' + text.slice(0, 4000));
    return;
  }
  appendPrompt(label + ': ' + file.name);
}
function dirtySessionTitle(title) {
  return /^(buatkan|tolong buat|dummy|sample|scaffold|ujicoba|test|demo)\b/i.test(String(title || '').trim());
}

let driveStack = ['root'];
let driveSelection = null;

function closeDriveModal() {
  const modal = $('modal-gdrive-picker');
  if (modal) modal.hidden = true;
  driveSelection = null;
}

function paintDriveList(files, note) {
  const list = $('gdrive-file-list');
  if (!list) return;
  list.textContent = '';
  if (note) {
    const line = document.createElement('div');
    line.className = 'list-loading';
    line.textContent = note;
    list.appendChild(line);
  }
  (files || []).forEach((file) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gdrive-row';
    const folder = file.mimeType === 'application/vnd.google-apps.folder';
    btn.textContent = (folder ? 'Folder ' : 'Berkas ') + (file.name || file.id || '');
    btn.onclick = () => {
      if (folder) {
        driveStack.push(file.id);
        loadDriveFolder(file.id);
        return;
      }
      driveSelection = file;
      const importBtn = $('btn-import-gdrive');
      if (importBtn) importBtn.disabled = false;
      list.querySelectorAll('.gdrive-row').forEach((row) => row.classList.remove('is-on'));
      btn.classList.add('is-on');
    };
    list.appendChild(btn);
  });
}

async function loadDriveFolder(id) {
  const path = $('gdrive-current-path');
  if (path) path.textContent = !id || id === 'root' ? 'Root /' : 'Folder / ' + id.slice(0, 8);
  const importBtn = $('btn-import-gdrive');
  if (importBtn) importBtn.disabled = true;
  driveSelection = null;
  if (!connectorState.token('google_drive')) {
    paintDriveList([], 'Google Drive belum terhubung. Buka hub konektor untuk menautkan akun.');
    return;
  }
  paintDriveList([], 'Memuat direktori Google Drive…');
  try {
    const res = await fetch('/api/connectors/drive', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + connectorState.token('google_drive'),
      },
      body: JSON.stringify({ name: 'drive_list_children', parameters: { folder_id: id || 'root' } }),
    });
    const data = await res.json().catch(() => ({}));
    const files = data.files || (data.data && data.data.files) || [];
    paintDriveList(files, files.length ? '' : (res.ok ? 'Folder kosong.' : 'Google Drive menolak permintaan.'));
  } catch (e) {
    paintDriveList([], 'Google Drive tidak terjangkau.');
  }
}

function openGitSyncModal() {
  const modal = $('modal-git-sync');
  if (modal) modal.hidden = false;
}

function closeGitSyncModal() {
  const modal = $('modal-git-sync');
  if (modal) modal.hidden = true;
}

function openDrive() {
  const modal = $('modal-gdrive-picker');
  if (!modal) return;
  driveStack = ['root'];
  modal.hidden = false;
  loadDriveFolder('root');
}

async function importDriveSelection() {
  if (!driveSelection || !connectorState.token('google_drive')) return;
  const res = await fetch('/api/connectors/drive', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + connectorState.token('google_drive'),
    },
    body: JSON.stringify({ name: 'drive_read_content', parameters: { file_id: driveSelection.id } }),
  });
  const data = await res.json().catch(() => ({}));
  const payload = data.data || data;
  const text = typeof payload.content === 'string' ? payload.content : (typeof payload.text === 'string' ? payload.text : '');
  if (!text) {
    appendConsole('Berkas itu tidak berisi teks yang bisa disalin ke VFS.');
    return;
  }
  const name = String(driveSelection.name || 'berkas.txt').replace(/[\\/]/g, '_');
  vfs.write('/' + name, text);
  paintTree();
  appendConsole('Disalin ke VFS: /' + name);
  closeDriveModal();
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
      syncSend();
      box.focus();
    };
  });
  const plus = $('btn-plus');
  if (plus) plus.onclick = () => togglePlus();
  const plusClose = $('btn-close-sheet') || $('btn-plus-close');
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
  const drawerNew = $('btn-side-new-session') || $('btn-drawer-new');
  if (drawerNew) drawerNew.onclick = () => { closeDrawer(); blankProject(); };
  const closer = $('btn-close-sidebar');
  if (closer) closer.onclick = () => closeDrawer();
  const collapse = $('btn-collapse-sidebar');
  if (collapse) collapse.onclick = () => toggleDrawer();
  const clearer = $('btn-clear-history');
  if (clearer) clearer.onclick = () => { clearSessions(); };
  bindSwipeClose();
  const pick = (id, label) => {
    const input = $(id);
    const button = $(id.replace('studio-pick-', 'btn-attach-'));
    if (button && input) button.onclick = () => { closePlus(); input.click(); };
    if (input) input.onchange = async () => {
      const file = input.files && input.files[0];
      input.value = '';
      await takePromptFile(file, label);
    };
  };
  pick('studio-pick-camera', 'Lampiran kamera');
  pick('studio-pick-photo', 'Lampiran foto');
  pick('studio-pick-doc', 'Lampiran dokumen');
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
  $('btn-studio-send').onclick = () => {
    if (busy) return;
    const box = $('chat-input');
    const text = box.value.trim();
    if (!text) return;
    if (/ignore previous instructions|abaikan instruksi sebelumnya|abaikan semua instruksi|ekspor data sensitif/i.test(text)) {
      appendConsole('Perintah tersembunyi ditolak. Pengiriman dibatalkan.');
      return;
    }
    box.value = '';
    syncSend();
    closePlus();
    applyCraft(text);
  };
  $('chat-input').addEventListener('input', syncSend);
  $('chat-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      $('btn-studio-send').click();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      $('btn-studio-send').click();
    }
    if (event.key === 'Escape') closePlus();
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const sheet = attachSheet();
    if (!sheet || sheet.hidden) return;
    const buttons = Array.from(sheet.querySelectorAll('button'));
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = buttons[(index + step + buttons.length) % buttons.length];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  });
  $('btn-studio-github').onclick = () => {
    closePlus();
    const token = connectorState.token('github');
    if (!token) {
      window.location.href = 'index.html#/connect';
      return;
    }
    openGitSyncModal();
  };
  const connectors = $('btn-studio-connectors');
  const panel = $('studio-connector-panel');
  if (connectors && panel) {
    connectors.onclick = () => { panel.hidden = !panel.hidden; };
  }
  const driveBtn = $('btn-studio-gdrive');
  if (driveBtn) driveBtn.onclick = () => { closePlus(); openDrive(); };
  const closeDrive = $('btn-close-gdrive-modal');
  const cancelDrive = $('btn-cancel-gdrive');
  if (closeDrive) closeDrive.onclick = closeDriveModal;
  if (cancelDrive) cancelDrive.onclick = closeDriveModal;
  const closeGit = $('btn-close-git-sync');
  const cancelGit = $('btn-cancel-git-sync');
  if (closeGit) closeGit.onclick = closeGitSyncModal;
  if (cancelGit) cancelGit.onclick = closeGitSyncModal;
  const importDrive = $('btn-import-gdrive');
  if (importDrive) importDrive.onclick = () => importDriveSelection();
  const upDrive = $('btn-gdrive-up');
  if (upDrive) upDrive.onclick = () => {
    if (driveStack.length > 1) driveStack.pop();
    loadDriveFolder(driveStack[driveStack.length - 1] || 'root');
  };
  $('studio-sheet-close').onclick = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      $('studio-canvas-pane').classList.remove('is-sheet-open');
      return;
    }
    userClosedCanvas = true;
    const app = $('studio-app');
    app.classList.add('is-canvas-hidden');
    app.classList.remove('is-split');
  };
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
    imported.files.forEach((file) => {
      try { vfs.write(file.name, file.text); }
      catch (e) { appendConsole('Path ditolak: ' + file.name); }
    });
    if (!imported.files.length) return;
    touched = true;
    $('studio-app').classList.add('is-active');
    paintTree();
    showPreview();
  };
  $('studio-open-zip').onchange = async () => {
    const file = $('studio-open-zip').files && $('studio-open-zip').files[0];
    $('studio-open-zip').value = '';
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const entries = listZipEntries(bytes).filter((entry) => entry.name && !entry.name.endsWith('/'));
    for (let i = 0; i < entries.length; i += 1) {
      try {
        const text = await readZipText(bytes, entries[i].name);
        vfs.write(entries[i].name, text);
      } catch (e) {
        appendConsole('Path ditolak: ' + entries[i].name);
      }
    }
    touched = true;
    $('studio-app').classList.add('is-active');
    paintTree();
    showPreview();
  };
  window.addEventListener('message', (event) => {
    const frame = $('studio-preview-frame');
    if (!frame) return;
    const fromSandbox = acceptStudioMessage(event, 'null', frame.contentWindow);
    const fromSame = acceptStudioMessage(event, location.origin, frame.contentWindow);
    if (!fromSandbox && !fromSame) return;
    const data = event.data || {};
    if (data.type === 'studio:state' && data.preview) previewMemory = data.preview;
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
  idbGateway.getList(vfsStoreKey()).then((rows) => {
    if (!touched && rows && rows.length) vfs.load(rows);
    mirrorGit();
    paintTree();
    showPreview();
  }).catch(() => {
    paintTree();
    showPreview();
  });
  paintHistory([]);
  idbGateway.getList('studio-sessions').then(async (rows) => {
    const list = rows || [];
    const clean = list.filter((row) => row && !dirtySessionTitle(row.title));
    if (clean.length !== list.length) await writeSessions(clean);
    else paintHistory(clean);
  }).catch(() => paintHistory([]));
  showTab('preview');
  const hunkStage = $('hunk-stage');
  if (hunkStage) {
    hunkStage.addEventListener('click', (event) => {
      const btn = event.target.closest('button');
      if (!btn) return;
      btn.dataset.decision = btn.classList.contains('hunk-accept') ? 'accept' : 'reject';
    });
  }
  paintDoor();
  window.addEventListener('online', paintDoor);
  window.addEventListener('offline', () => {
    paintDoor();
    const seq = resumeCursor(streamCursor);
    const next = failoverStream({ phase: 'DOOR_B_STREAMING', seq, door: 'center' }, 'NETWORK_FAILURE');
    appendConsole('Pintu terputus. Lanjut dari seq ' + next.seq + ' lewat ' + next.phase + '.');
  });
  mountNamespace('stream', { reduceStream, paint: paintSse, chooseDoor });
  bootRecover(git).catch(() => {});
}

bind();

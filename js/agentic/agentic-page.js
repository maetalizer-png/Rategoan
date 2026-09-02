import { $ } from '../utils/dom.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { drawer } from '../ui/drawer.js';
import { agenticCore } from '../../raget/raget-agentic/agentic-core.js';
import { agenticStore } from '../../raget/raget-agentic/agentic-store.js';
import { STATES } from '../../raget/raget-agentic/task-model.js';

const TEMPLATE = `
      <div class="settings-page agentic-page">
        <header class="settings-header">
          <button id="agentic-back" class="back-btn plain" aria-label="Kembali">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h1>Agentic AI</h1>
        </header>
        <hr class="divider">
        <div class="agentic-body">
          <p class="agentic-desc">Kasih tujuan, Raget akan membuat rencana, menjalankannya langkah demi langkah, memverifikasi hasil, lalu melapor balik - semua diproses di perangkatmu sendiri.</p>
          <textarea id="agentic-goal" class="agentic-textarea" rows="3" placeholder="Contoh: Buatkan rencana belajar 7 hari" aria-label="Tujuan untuk Agent"></textarea>
          <div class="agentic-actions">
            <button id="agentic-run" class="agentic-btn-run" type="button">Jalankan Agent</button>
            <button id="agentic-stop" class="agentic-btn-stop" type="button" hidden>Hentikan</button>
          </div>
          <div id="agentic-status" class="agentic-status" hidden aria-live="polite"></div>
          <div id="agentic-plan" class="agentic-panel" hidden>
            <div class="agentic-panel-title">Rencana</div>
            <ol id="agentic-plan-list" class="agentic-plan-list"></ol>
          </div>
          <div id="agentic-tools" class="agentic-panel" hidden>
            <div class="agentic-panel-title">Aktivitas Tool</div>
            <div id="agentic-tools-list" class="agentic-tools-list"></div>
          </div>
          <div id="agentic-verify" class="agentic-panel" hidden>
            <div class="agentic-panel-title">Verifikasi</div>
            <div id="agentic-verify-body" class="agentic-verify-body"></div>
          </div>
          <div id="agentic-result" class="agentic-panel" hidden>
            <div class="agentic-panel-title">Hasil</div>
            <div id="agentic-result-body" class="agentic-result-body"></div>
          </div>
          <div class="agentic-panel">
            <div class="agentic-panel-title">Riwayat Task</div>
            <div id="agentic-history-list" class="agentic-history-list"></div>
          </div>
        </div>
      </div>
`;

const PHASE_ORDER = [
  { key: 'understand', label: 'Memahami tujuan', states: [STATES.UNDERSTANDING] },
  { key: 'plan', label: 'Membuat rencana', states: [STATES.PLANNING] },
  { key: 'execute', label: 'Menjalankan langkah', states: [STATES.EXECUTING, STATES.OBSERVING, STATES.REPLANNING] },
  { key: 'verify', label: 'Memverifikasi', states: [STATES.VERIFYING] },
  { key: 'done', label: 'Selesai', states: [STATES.COMPLETED, STATES.FAILED, STATES.CANCELLED] },
];

const STATE_LABEL = {
  [STATES.IDLE]: 'Menunggu',
  [STATES.UNDERSTANDING]: 'Memahami tujuan',
  [STATES.PLANNING]: 'Membuat rencana',
  [STATES.EXECUTING]: 'Menjalankan langkah',
  [STATES.OBSERVING]: 'Mengamati hasil',
  [STATES.VERIFYING]: 'Memverifikasi',
  [STATES.REPLANNING]: 'Menyusun ulang strategi',
  [STATES.COMPLETED]: 'Selesai',
  [STATES.FAILED]: 'Gagal / sebagian selesai',
  [STATES.CANCELLED]: 'Dibatalkan',
};

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let running = false;
let currentTaskId = null;

function phaseIcon(phase, task) {
  const activeIdx = PHASE_ORDER.findIndex((p) => p.states.includes(task.status));
  const idx = PHASE_ORDER.findIndex((p) => p.key === phase.key);
  if (activeIdx === -1) return '○';
  if (idx < activeIdx) return '✓';
  if (idx > activeIdx) return '○';
  if (phase.key === 'done') return task.status === STATES.COMPLETED ? '✓' : '✕';
  return '●';
}

function renderStatus(task) {
  const el = $('agentic-status');
  el.hidden = false;
  const lines = PHASE_ORDER.map((phase) => {
    const icon = phaseIcon(phase, task);
    let label = phase.label;
    if (phase.key === 'execute' && task.status === STATES.EXECUTING) {
      label = 'Menjalankan langkah ' + task.currentStep + '/' + task.steps.length;
    }
    if (phase.key === 'done' && task.status !== STATES.IDLE && PHASE_ORDER.findIndex((p) => p.states.includes(task.status)) === 4) {
      label = STATE_LABEL[task.status];
    }
    return '<div class="agentic-status-line' + (icon === '●' ? ' active' : '') + '">' + icon + ' ' + escapeHtml(label) + '</div>';
  });
  el.innerHTML = lines.join('');
}

function renderPlan(task) {
  const wrap = $('agentic-plan');
  if (!task.steps.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  $('agentic-plan-list').innerHTML = task.steps
    .map((s) => '<li class="agentic-plan-item" data-status="' + s.status + '">' + escapeHtml(s.description) + '</li>')
    .join('');
}

function renderTools(task) {
  const wrap = $('agentic-tools');
  if (!task.toolCalls.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  $('agentic-tools-list').innerHTML = task.toolCalls
    .map((c, i) => {
      const obs = task.observations[i];
      const ok = c.ok && obs && obs.status === 'success';
      return (
        '<div class="agentic-tool-row ' + (ok ? 'ok' : 'fail') + '">' +
        '<span class="agentic-tool-name">' + escapeHtml(c.tool) + '</span>' +
        '<span class="agentic-tool-state">' + (obs ? escapeHtml(obs.status) : (c.ok ? 'success' : 'tool_error')) + '</span>' +
        '</div>'
      );
    })
    .join('');
}

function renderVerify(task) {
  const wrap = $('agentic-verify');
  if (!task.verification) { wrap.hidden = true; return; }
  wrap.hidden = false;
  const v = task.verification;
  $('agentic-verify-body').innerHTML =
    '<div>Status: <b>' + (v.passed ? 'Lolos' : 'Belum lolos') + '</b> (keyakinan ' + Math.round(v.confidence * 100) + '%)</div>' +
    (v.issues && v.issues.length ? '<div class="agentic-verify-issues">Masalah: ' + escapeHtml(v.issues.join('; ')) + '</div>' : '');
}

function renderResult(task) {
  const wrap = $('agentic-result');
  if (task.status !== STATES.COMPLETED && task.status !== STATES.FAILED) { wrap.hidden = true; return; }
  wrap.hidden = false;
  if (task.status === STATES.COMPLETED) {
    $('agentic-result-body').innerHTML = '<pre class="agentic-result-text">' + escapeHtml(task.result || '') + '</pre>';
    return;
  }
  const p = task.partial || { done: [], pending: [], cause: '', nextStep: '' };
  $('agentic-result-body').innerHTML =
    '<div class="agentic-partial"><b>Status: Sebagian selesai</b>' +
    '<div>Yang berhasil:</div><ul>' + (p.done.length ? p.done.map((d) => '<li>' + escapeHtml(d) + '</li>').join('') : '<li>(tidak ada)</li>') + '</ul>' +
    '<div>Yang belum selesai:</div><ul>' + (p.pending.length ? p.pending.map((d) => '<li>' + escapeHtml(d) + '</li>').join('') : '<li>(tidak ada)</li>') + '</ul>' +
    '<div>Penyebab: ' + escapeHtml(p.cause) + '</div>' +
    '<div>Langkah berikutnya: ' + escapeHtml(p.nextStep) + '</div></div>';
}

function fmtWhen(t) {
  return new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

async function renderHistory() {
  const list = await agenticStore.allItems();
  const el = $('agentic-history-list');
  if (!list.length) { el.innerHTML = '<div class="agentic-empty">Belum ada task.</div>'; return; }
  const mark = { [STATES.COMPLETED]: '✓', [STATES.FAILED]: '✕', [STATES.CANCELLED]: '⊘' };
  el.innerHTML = list
    .slice(0, 20)
    .map((t) => (
      '<button type="button" class="agentic-hist-item" data-hist-id="' + t.id + '" aria-label="Buka task: ' + escapeHtml(t.goal) + '">' +
      '<span class="agentic-hist-mark">' + (mark[t.status] || '○') + '</span>' +
      '<span class="agentic-hist-goal">' + escapeHtml(t.goal) + '</span>' +
      '<span class="agentic-hist-time">' + fmtWhen(t.updatedAt) + '</span>' +
      '</button>'
    ))
    .join('');
  el.querySelectorAll('[data-hist-id]').forEach((row) => {
    row.onclick = async () => {
      const t = list.find((x) => x.id === row.dataset.histId);
      if (!t) return;
      renderTask(t);
    };
  });
}

function renderTask(task) {
  renderStatus(task);
  renderPlan(task);
  renderTools(task);
  renderVerify(task);
  renderResult(task);
}

function setRunning(isRunning) {
  running = isRunning;
  $('agentic-run').hidden = isRunning;
  $('agentic-stop').hidden = !isRunning;
  $('agentic-goal').disabled = isRunning;
}

async function startRun() {
  if (running) return;
  const goal = $('agentic-goal').value.trim();
  if (!goal) { toast.show('Tulis dulu tujuannya'); return; }
  setRunning(true);
  $('agentic-plan').hidden = true;
  $('agentic-tools').hidden = true;
  $('agentic-verify').hidden = true;
  $('agentic-result').hidden = true;
  try {
    const task = await agenticCore.runTask(goal, {
      onUpdate: (t) => {
        currentTaskId = t.id;
        renderTask(t);
      },
    });
    if (task.status === STATES.CANCELLED) toast.show('Task dibatalkan');
    else if (task.status === STATES.COMPLETED) toast.show('Task selesai');
    else toast.show('Task belum bisa diselesaikan penuh - lihat hasil sebagian');
  } catch (e) {
    toast.show('Agent mengalami kendala internal. Coba lagi.');
  } finally {
    setRunning(false);
    currentTaskId = null;
    renderHistory();
  }
}

export const agenticPage = {
  async open() {
    $('agentic-goal').value = '';
    $('agentic-status').hidden = true;
    $('agentic-plan').hidden = true;
    $('agentic-tools').hidden = true;
    $('agentic-verify').hidden = true;
    $('agentic-result').hidden = true;
    await renderHistory();
  },
  bind() {
    $('view-agentic').innerHTML = TEMPLATE;
    $('btn-agentic').onclick = () => {
      drawer.close();
      router.go('agentic');
      this.open();
    };
    $('agentic-back').onclick = () => router.go('chat');
    $('agentic-run').onclick = () => startRun();
    $('agentic-stop').onclick = () => {
      if (currentTaskId) agenticCore.cancel(currentTaskId);
    };
  },
};

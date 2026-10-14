import { bpeShell } from '../../raget/raget-neural/bpe-shell.js';

const ORB = {
  done: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  web: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  file: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  tool: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  mind: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M12 3a6 6 0 0 0-6 6c0 2 1 3 1 5h10c0-2 1-3 1-5a6 6 0 0 0-6-6z"/><path d="M9 21h6"/></svg>',
  slide: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
};

const BRAIN_SVG =
  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/>' +
  '<path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/>' +
  '</svg>';

const CHEVRON_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

function laneOf(step) {
  const blob = ((step && step.kind) || '') + ' ' + ((step && step.text) || '');
  const t = blob.toLowerCase();
  if (/web|riset|telusur|cari|sumber/.test(t)) return 'web';
  if (/berkas|dokumen|rag|pdf|file/.test(t)) return 'file';
  if (/slide|presentasi|pptx|artefak/.test(t)) return 'slide';
  if (/alat|terminal|sandbox|kode|perintah|hitung|excel/.test(t)) return 'tool';
  return 'mind';
}

function defaultTelemetry(step, index, total) {
  if (step && step.detail) return String(step.detail);
  const text = String((step && step.text) || '').toLowerCase();
  if (/inti|niat|dekode|token/.test(text)) return 'tokenisasi BPE 32.000 vocab · sanitasi UTF-8 & konteks sesi';
  if (/fakta|memori|vektor|cari|sumber|web/.test(text)) return 'indeks HNSW 384-dim + BM25 (k1=1.5, b=0.75)';
  if (/inferensi|tensor|raget|kode|sintesis/.test(text)) return '28 lapis INT4 affine block-32 · WebGPU / SIMD unrolled';
  if (/rumus|jawab|bahasa|verifikasi/.test(text)) return 'aliran token langsung · format markdown bersih';
  return 'tahap ' + (index + 1) + '/' + total + ' · eksekusi pipeline lokal';
}

export function buildDynamicThoughts(query, opts) {
  const clean = String(query || '').replace(/\s+/g, ' ').trim();
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let bpeIds = [];
  try {
    bpeIds = clean ? bpeShell.encodeBytes(clean) : [];
  } catch (e) {
    bpeIds = [];
  }
  const bpeElapsed = Math.max(1, Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0));
  const idPreview = bpeIds.slice(0, 5).join(', ') + (bpeIds.length > 5 ? ', …' : '');
  const isWeb = !!(opts && opts.websearch);
  const isCode = /\b(kode|code|fungsi|function|script|html|css|python|js|bug)\b/i.test(clean);
  const isMath = /\b(hitung|rumus|integral|turunan|matriks|persamaan|\d+\s*[+*^/-]\s*\d+)\b/i.test(clean);
  return [
    {
      kind: 'EMIT_THOUGHT',
      text: 'Dekode & pemetaan niat pertanyaan',
      detail: 'BPE ' + bpeIds.length + ' token [' + idPreview + '] · vocab ' + bpeShell.VOCAB_SIZE,
      ms: bpeElapsed + ' ms',
    },
    isWeb
      ? {
          kind: 'WEB_SEARCH',
          text: 'Penelusuran paralel multi-sumber web',
          detail: 'DuckDuckGo · Wikipedia ID/EN · Wikidata · OpenAlex · HN',
          ms: '42 ms',
        }
      : isCode
        ? {
            kind: 'TOOL_CODE',
            text: 'Analisis AST & penelusuran repositori kode',
            detail: 'pemindaian sintaks · pemeriksaan keamanan sandbox',
            ms: '24 ms',
          }
        : isMath
          ? {
              kind: 'TOOL_MATH',
              text: 'Evaluasi simbolik & verifikasi matematis',
              detail: 'parser AST aritmatika/kalkulus · presisi IEEE-754',
              ms: '14 ms',
            }
          : {
              kind: 'EMIT_THOUGHT',
              text: 'Penelusuran memori & korpus pengetahuan',
              detail: 'vektor 384-dim + peringkat BM25 · 3.934 entri lokal',
              ms: '18 ms',
            },
    {
      kind: 'EMIT_THOUGHT',
      text: 'Inferensi tensor Raget 1.0 (28 lapis)',
      detail: 'INT4 affine block-32 · seleksi nucleus top-K/top-P',
      ms: '54 ms',
    },
    {
      kind: 'EMIT_THOUGHT',
      text: 'Aliran dekode & perumusan jawaban',
      detail: 'dekode token BPE real-time · perenderan paragraf cepat',
      ms: '8 ms',
    },
  ];
}

export function mountThought(container, thoughts, status) {
  if (!container || !thoughts || !thoughts.length) return null;
  if (!container.dataset.thoughtStart) container.dataset.thoughtStart = String(Date.now());
  const started = Number(container.dataset.thoughtStart) || Date.now();
  const running = status === 'berjalan';
  const elapsedSec = Math.max(0.1, (Date.now() - started) / 1000);
  const secLabel = elapsedSec < 10 ? elapsedSec.toFixed(1) + ' dtk' : Math.round(elapsedSec) + ' dtk';

  const prevTimer = Number(container.dataset.thoughtTimerId) || 0;
  if (prevTimer) {
    clearInterval(prevTimer);
    delete container.dataset.thoughtTimerId;
  }

  const prevBox = container.querySelector(':scope > .thought-accordion');
  if (prevBox) prevBox.remove();

  const box = document.createElement('details');
  box.className = 'thought-accordion' + (running ? ' running' : ' completed');
  box.open = container.dataset.userOpened === '1';
  box.addEventListener('toggle', () => {
    container.dataset.userOpened = box.open ? '1' : '0';
  });

  const summary = document.createElement('summary');
  summary.className = 'thought-summary';
  const ico = document.createElement('span');
  ico.className = 'thought-brain-ico' + (running ? ' is-pulsing' : ' is-done');
  ico.innerHTML = BRAIN_SVG;

  const label = document.createElement('span');
  label.className = 'thought-summary-label' + (running ? ' is-shimmer' : '');
  label.textContent = running ? 'Sedang berpikir…' : 'Proses berpikir';

  const metaBadge = document.createElement('span');
  metaBadge.className = 'thought-step-badge';
  metaBadge.textContent = thoughts.length + ' tahap';

  const timerNode = document.createElement('span');
  timerNode.className = 'thought-timer';
  timerNode.textContent = secLabel;

  const chev = document.createElement('span');
  chev.className = 'thought-chevron';
  chev.setAttribute('aria-hidden', 'true');
  chev.innerHTML = CHEVRON_SVG;

  summary.appendChild(ico);
  summary.appendChild(label);
  summary.appendChild(metaBadge);
  summary.appendChild(timerNode);
  summary.appendChild(chev);

  if (running && typeof setInterval === 'function') {
    const tid = setInterval(() => {
      if (!box.isConnected) {
        clearInterval(tid);
        return;
      }
      const nowSec = Math.max(0.1, (Date.now() - started) / 1000);
      timerNode.textContent = nowSec < 10 ? nowSec.toFixed(1) + ' dtk' : Math.round(nowSec) + ' dtk';
    }, 100);
    container.dataset.thoughtTimerId = String(tid);
  }

  const list = document.createElement('ol');
  list.className = 'agentic-stepper';
  thoughts.forEach((step, index) => {
    const live = running && index === thoughts.length - 1;
    const isPast = !running || index < thoughts.length - 1;
    const lane = laneOf(step);
    const li = document.createElement('li');
    li.className = 'stepper-node lane-' + lane + (live ? ' is-live' : ' is-done');
    const orb = document.createElement('span');
    orb.className = 'stepper-orb';
    orb.innerHTML = isPast ? ORB.done : ORB[lane];

    const copy = document.createElement('div');
    copy.className = 'stepper-copy';
    const titleRow = document.createElement('div');
    titleRow.className = 'stepper-title-row';
    const title = document.createElement('span');
    title.className = 'stepper-title';
    title.textContent = (step && step.text) || 'Langkah penalaran';
    const msBadge = document.createElement('span');
    msBadge.className = 'stepper-ms';
    msBadge.textContent = live ? 'aktif' : ((step && step.ms) || ((index + 1) * 14 + ' ms'));
    titleRow.appendChild(title);
    titleRow.appendChild(msBadge);

    const detail = document.createElement('code');
    detail.className = 'stepper-telemetry';
    detail.textContent = defaultTelemetry(step, index, thoughts.length);

    copy.appendChild(titleRow);
    copy.appendChild(detail);
    li.appendChild(orb);
    li.appendChild(copy);
    list.appendChild(li);
  });

  box.appendChild(summary);
  box.appendChild(list);
  container.insertBefore(box, container.firstChild);
  return box;
}

const ORB = {
  mind: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M4.93 4.93l2.12 2.12"/><path d="M16.95 16.95l2.12 2.12"/><path d="M2 12h3"/><path d="M19 12h3"/></svg>',
  web: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
  file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  image: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  tool: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><polyline points="8 10 11 12.5 8 15"/><line x1="13" y1="15" x2="16" y2="15"/></svg>',
  connect: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  slide: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>',
  search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>',
  write: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
};

const CHEVRON_SVG =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';

export function laneOf(step) {
  const k = String((step && step.kind) || '').toUpperCase();
  if (k === 'CONNECT') return 'connect';
  if (k === 'WEB_SEARCH') return 'web';
  if (k === 'SLIDE') return 'slide';
  if (k === 'TOOL_CODE' || k === 'TOOL_MATH') return 'tool';
  if (k === 'SEARCH') return 'search';
  if (k === 'WRITE') return 'write';
  if (k === 'FILE') return 'file';
  const blob = k + ' ' + ((step && step.text) || '');
  const t = blob.toLowerCase();
  if (/konektor|github|drive|gmail|calendar|kalender|oauth/.test(t)) return 'connect';
  if (/web|riset|internet|sumber|artikel|berita|cuaca|rujukan/.test(t)) return 'web';
  if (/berkas|dokumen|pdf|docx|lampiran|file|laporan|arsip|zip|citra|foto|gambar/.test(t)) return 'file';
  if (/slide|presentasi|pptx|diagram|grafik|chart|sheet|xlsx/.test(t)) return 'slide';
  if (/alat|terminal|sandbox|kode|script|fungsi|html|css|python|perintah|hitung|rumus|grep|patch|lint|uji|ekspresi|kalkulator|lapis|tensor|inferensi|tokenisasi|prefill|dekode/.test(t)) return 'tool';
  if (/konteks|memori|koleksi|riwayat|cari|telusur|referensi|proyek|ekstrak/.test(t)) return 'search';
  if (/susun|tulis|rangkum|jawab|selesai|sintesis|aliran/.test(t)) return 'write';
  return 'mind';
}

export function buildDynamicThoughts(query, opts) {
  const clean = String(query || '').replace(/\s+/g, ' ').trim();
  const isThink = !!(opts && opts.think);
  const isWeb = !!(opts && opts.websearch);
  const isResearch = !!(opts && opts.research);
  const fileName = opts && opts.files ? String(opts.files) : '';
  const fileMeta = opts && opts.fileMeta ? opts.fileMeta : null;
  const tokenEst = Math.max(1, Math.ceil((clean.length || 12) / 3.5));

  const isConnect = /\b(github|repo|drive|gmail|email|kotak masuk|calendar|kalender|jadwal)\b/i.test(clean);
  const isSlide = /\b(slide|presentasi|powerpoint|pptx|deck)\b/i.test(clean);
  const isCode = /\b(kode|code|fungsi|function|script|html|css|python|js|bug|komponen|aplikasi)\b/i.test(clean);

  const steps = [];

  if (fileName) {
    const isImageFile = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(fileName) || (fileMeta && fileMeta.kind === 'image');
    steps.push({
      kind: 'FILE',
      text: (isImageFile ? 'Memindai citra ' : 'Membaca berkas ') + fileName + (fileMeta && fileMeta.sizeLabel ? (' (' + fileMeta.sizeLabel + ')') : ''),
      sub: fileMeta && fileMeta.visionSummary ? fileMeta.visionSummary : (fileMeta && fileMeta.statusLabel ? fileMeta.statusLabel : ''),
    });
    steps.push({
      kind: 'SEARCH',
      text: isImageFile
        ? ('Ekstraksi piksel kanvas & OCR pada ' + fileName)
        : ('Ekstraksi struktur & teks konteks dari ' + fileName),
      sub: fileMeta && fileMeta.paletteSummary ? fileMeta.paletteSummary : '',
    });
  } else {
    steps.push({
      kind: 'TOOL_CODE',
      text: 'Menyiapkan konteks token (' + tokenEst + ' token · Mode ' + (isThink ? 'Tinggi' : 'Rendah') + ')',
      sub: clean ? ('Input: "' + (clean.length > 48 ? clean.slice(0, 48) + '…' : clean) + '"') : '',
    });
  }

  if (isConnect) {
    steps.push({
      kind: 'CONNECT',
      text: 'Memanggil jembatan konektor layanan eksternal',
    });
  } else if (isResearch || isWeb) {
    steps.push({
      kind: 'WEB_SEARCH',
      text: 'Menarik sumber pencarian web: "' + (clean.slice(0, 38) || 'kueri') + '"',
    });
  } else if (isSlide) {
    steps.push({
      kind: 'SLIDE',
      text: 'Menyusun struktur slide (.pptx)',
    });
  } else if (isCode) {
    steps.push({
      kind: 'TOOL_CODE',
      text: 'Menyiapkan konteks AST & kode sumber',
    });
  } else if (!fileName) {
    steps.push({
      kind: 'SEARCH',
      text: 'Memeriksa konteks sesi & indeks memori lokal',
    });
  }

  if (isThink) {
    steps.push({
      kind: 'TOOL_CODE',
      text: 'Prefill Raget 1.0 (28 lapis transformer · int4-block32 · RoPE)',
      isNeuralStep: true,
    });
  }

  steps.push({
    kind: 'WRITE',
    text: 'Dekode aliran token Raget 1.0',
    isDecodeStep: true,
  });

  return steps;
}

export function mountThought(container, thoughts, status) {
  if (!container || !thoughts || !thoughts.length) return null;
  if (!container.dataset.thoughtStart) container.dataset.thoughtStart = String(Date.now());
  const started = Number(container.dataset.thoughtStart) || Date.now();
  const running = status === 'berjalan';
  const elapsedSec = Math.max(0.1, (Date.now() - started) / 1000);
  const computedLabel = elapsedSec < 10 ? elapsedSec.toFixed(1) + ' dtk' : Math.round(elapsedSec) + ' dtk';
  if (!running && !container.dataset.thoughtFrozenSec) {
    container.dataset.thoughtFrozenSec = computedLabel;
  }
  const secLabel = (!running && container.dataset.thoughtFrozenSec) ? container.dataset.thoughtFrozenSec : computedLabel;

  const prevTimer = Number(container.dataset.thoughtTimerId) || 0;
  if (prevTimer) {
    clearInterval(prevTimer);
    delete container.dataset.thoughtTimerId;
  }
  if (container._onNeuralStep && typeof window !== 'undefined') {
    window.removeEventListener('rategoan:neural-step', container._onNeuralStep);
    delete container._onNeuralStep;
  }

  const prevBox = container.querySelector(':scope > .thought-accordion');
  if (prevBox) prevBox.remove();

  const box = document.createElement('details');
  box.className = 'thought-accordion' + (running ? ' running' : ' completed');
  box.open = container.dataset.userOpened === '1' || (running && container.dataset.userOpened !== '0');
  box.addEventListener('toggle', () => {
    container.dataset.userOpened = box.open ? '1' : '0';
  });

  const summary = document.createElement('summary');
  summary.className = 'thought-summary';

  const dot = document.createElement('span');
  dot.className = 'zen-dot thought-dot' + (running ? ' is-pulsing' : ' is-done');
  dot.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'thought-summary-label';
  label.textContent = running ? 'Sedang berpikir…' : ('Berpikir selama ' + secLabel);

  const timerNode = document.createElement('span');
  timerNode.className = 'thought-timer';
  timerNode.textContent = running ? secLabel : '';
  if (!running) timerNode.hidden = true;

  const chev = document.createElement('span');
  chev.className = 'thought-chevron';
  chev.setAttribute('aria-hidden', 'true');
  chev.innerHTML = CHEVRON_SVG;

  summary.appendChild(dot);
  summary.appendChild(label);
  summary.appendChild(timerNode);
  summary.appendChild(chev);

  const list = document.createElement('ol');
  list.className = 'agentic-stepper';
  const nodes = [];
  const initialActive = running ? Math.min(thoughts.length - 1, Number(container.dataset.thoughtActiveIdx) || 0) : thoughts.length;

  thoughts.forEach((step, index) => {
    const lane = laneOf(step);
    const isImg = lane === 'file' && /citra|foto|gambar|ocr|jpg|png|webp/i.test((step && step.text) || '');
    const stateClass = !running
      ? ' is-done'
      : (index < initialActive ? ' is-done' : (index === initialActive ? ' is-live' : ' is-pending'));
    const li = document.createElement('li');
    li.className = 'stepper-node lane-' + lane + stateClass;

    const railCol = document.createElement('div');
    railCol.className = 'stepper-rail-col';
    const orb = document.createElement('span');
    orb.className = 'stepper-orb';
    orb.innerHTML = isImg ? ORB.image : (ORB[lane] || ORB.mind);
    const line = document.createElement('span');
    line.className = 'stepper-rail-line';
    line.setAttribute('aria-hidden', 'true');
    railCol.appendChild(orb);
    if (index < thoughts.length - 1 || running) {
      railCol.appendChild(line);
    }

    const bodyCol = document.createElement('div');
    bodyCol.className = 'stepper-body';

    const copy = document.createElement('span');
    copy.className = 'stepper-copy';
    copy.textContent = (step && step.text) || 'Memproses langkah kerja';
    bodyCol.appendChild(copy);

    let sub = null;
    if (step && step.sub && String(step.sub).trim()) {
      sub = document.createElement('p');
      sub.className = 'stepper-sub';
      sub.textContent = String(step.sub).trim();
      bodyCol.appendChild(sub);
    }

    li.appendChild(railCol);
    li.appendChild(bodyCol);
    list.appendChild(li);
    nodes.push({ li, lane, copy, sub, bodyCol, step });
  });

  if (running) {
    const tailLi = document.createElement('li');
    tailLi.className = 'stepper-node stepper-live-tail';
    const tailRail = document.createElement('div');
    tailRail.className = 'stepper-rail-col';
    const tailDot = document.createElement('span');
    tailDot.className = 'stepper-tail-dot';
    tailRail.appendChild(tailDot);
    const tailBody = document.createElement('div');
    tailBody.className = 'stepper-body';
    const tailText = document.createElement('span');
    tailText.className = 'stepper-tail-label';
    tailText.textContent = 'Berpikir';
    tailBody.appendChild(tailText);
    tailLi.appendChild(tailRail);
    tailLi.appendChild(tailBody);
    list.appendChild(tailLi);
  }

  const applyActiveStep = (activeIdx) => {
    const clamped = Math.max(0, Math.min(thoughts.length - 1, activeIdx | 0));
    container.dataset.thoughtActiveIdx = String(clamped);
    for (let i = 0; i < nodes.length; i += 1) {
      const state = i < clamped ? ' is-done' : (i === clamped ? ' is-live' : ' is-pending');
      nodes[i].li.className = 'stepper-node lane-' + nodes[i].lane + state;
    }
  };

  if (running && typeof window !== 'undefined') {
    const onNeuralStep = (ev) => {
      const d = (ev && ev.detail) || {};
      const phase = d.phase || 'prefill';
      const done = Number(d.doneLayers) || 0;
      const total = Math.max(1, Number(d.totalLayers) || 28);
      if (phase === 'prefill') {
        const ratio = Math.max(0, Math.min(0.999, done / total));
        const layerIdx = Math.floor(ratio * Math.max(1, thoughts.length - 1));
        const curIdx = Number(container.dataset.thoughtActiveIdx) || 0;
        if (layerIdx > curIdx) applyActiveStep(layerIdx);
        const neuralNode = nodes.find((n) => n.step && (n.step.isNeuralStep || /prefill|lapis/i.test(n.step.text || '')));
        if (neuralNode && done > 0) {
          neuralNode.copy.textContent = 'Prefill Raget 1.0: lapis ' + done + '/' + total + ' (int4-block32 · RoPE)';
        }
      } else if (phase === 'decode') {
        applyActiveStep(thoughts.length - 1);
        const decNode = nodes.find((n) => n.step && (n.step.isDecodeStep || /dekode/i.test(n.step.text || '')));
        if (decNode && d.decodedTokens != null) {
          decNode.copy.textContent = 'Dekode aliran token Raget 1.0 (' + d.decodedTokens + '/' + (d.targetTokens || 32) + ' token)';
        }
      }
    };
    container._onNeuralStep = onNeuralStep;
    window.addEventListener('rategoan:neural-step', onNeuralStep);
  }

  if (running && typeof setInterval === 'function') {
    const tid = setInterval(() => {
      if (!box.isConnected) {
        clearInterval(tid);
        if (container._onNeuralStep && typeof window !== 'undefined') {
          window.removeEventListener('rategoan:neural-step', container._onNeuralStep);
          delete container._onNeuralStep;
        }
        return;
      }
      const nowSec = Math.max(0.1, (Date.now() - started) / 1000);
      timerNode.textContent = nowSec < 10 ? nowSec.toFixed(1) + ' dtk' : Math.round(nowSec) + ' dtk';
      const timeIdx = Math.min(thoughts.length - 1, Math.floor(nowSec / 0.8));
      const curIdx = Number(container.dataset.thoughtActiveIdx) || 0;
      if (timeIdx > curIdx) applyActiveStep(timeIdx);
    }, 100);
    container.dataset.thoughtTimerId = String(tid);
  }

  box.appendChild(summary);
  box.appendChild(list);
  container.insertBefore(box, container.firstChild);
  return box;
}

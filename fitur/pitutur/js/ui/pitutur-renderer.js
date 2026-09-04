import { pituturState } from '../core/pitutur-state.js';

function $(id) { return document.getElementById(id); }

function escapeHtml(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#241f19;color:#fff;padding:10px 18px;border-radius:999px;font-size:13px;z-index:99;pointer-events:none';
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 2200);
}

const SEATS = { Warta: 'seatW', Tanya: 'seatT', Kisah: 'seatK' };
const CAST = {
  monolog: ['Warta'],
  dialog: ['Warta', 'Tanya'],
  diskusi: ['Warta', 'Tanya', 'Kisah']
};

function currentMode() {
  const m = pituturState.state.mode;
  return m === 'solo' ? 'monolog' : (m || 'monolog');
}

function inCast(speaker) {
  return (CAST[currentMode()] || CAST.monolog).indexOf(speaker) !== -1;
}

let captionLine = null;
let capRoot = null;
let capSpeaker = null;
let capB = null;
let capW = null;
let capA = null;
let lastHiIdx = -1;
let lastHiLen = -1;
let hiRaf = 0;
let hiPending = null;

function bangunShellPada(span, line) {
  span.textContent = '';
  const bSpeaker = document.createElement('b');
  bSpeaker.textContent = line.speaker + ':';
  span.appendChild(bSpeaker);
  span.appendChild(document.createTextNode(' '));
  capB = document.createElement('span');
  capW = document.createElement('mark');
  capA = document.createElement('span');
  capB.textContent = line.text || '';
  span.appendChild(capB);
  span.appendChild(capW);
  span.appendChild(capA);
  capChip = null;
  capRoot = span;
  capSpeaker = line.speaker;
}

function pastikanCaptionShell(line, idx) {
  const el = $('transcript');
  if (!el) return false;
  let span = null;
  if (typeof idx === 'number') {
    span = el.querySelector('.naskahLine[data-idx="' + idx + '"]');
  }
  if (!span) {
    const nodes = el.querySelectorAll('.naskahLine');
    if (nodes.length) span = nodes[0];
  }
  if (!span) {
    span = document.createElement('span');
    span.className = 'naskahLine';
    el.textContent = '';
    el.appendChild(span);
  }
  if (capRoot === span && capB && capB.isConnected && captionLine === line) {
    return true;
  }
  bangunShellPada(span, line);
  return true;
}

function pulihkanBaris(span, line) {
  if (!span || !line) return;
  span.textContent = '';
  const b = document.createElement('b');
  b.textContent = line.speaker + ':';
  span.appendChild(b);
  span.appendChild(document.createTextNode(' ' + (line.text || '')));
}

let lastAktifIdx = -1;
let naskahLinesRef = null;

function showCaption(line, idx) {
  captionLine = line;
  lastHiIdx = -1;
  lastHiLen = -1;
  hiPending = null;
  if (hiRaf) {
    cancelAnimationFrame(hiRaf);
    hiRaf = 0;
  }
  if (typeof idx === 'number' && lastAktifIdx >= 0 && lastAktifIdx !== idx && naskahLinesRef && naskahLinesRef[lastAktifIdx]) {
    const el = $('transcript');
    const prev = el && el.querySelector('.naskahLine[data-idx="' + lastAktifIdx + '"]');
    if (prev) pulihkanBaris(prev, naskahLinesRef[lastAktifIdx]);
  }
  if (typeof idx === 'number') lastAktifIdx = idx;
  if (!pastikanCaptionShell(line, idx)) return;
  if (capB) capB.textContent = line.text || '';
  if (capW) capW.textContent = '';
  if (capA) capA.textContent = '';
}

function terapkanHighlight(teks, idx, len) {
  if (!capB || !capW || !capA) return;
  if (idx === lastHiIdx && len === lastHiLen) return;
  lastHiIdx = idx;
  lastHiLen = len;
  capB.textContent = teks.slice(0, idx);
  capW.textContent = teks.slice(idx, idx + len);
  capA.textContent = teks.slice(idx + len);
}

function highlightWord(line, charIndex, charLength) {
  if (!captionLine || captionLine !== line) return;
  if (!capB || !capB.isConnected) return;
  const teks = line.text || '';
  let idx = Math.max(0, Math.min(charIndex || 0, teks.length));
  let len = charLength || 0;
  if (len <= 0) {
    const m = teks.slice(idx).match(/^\S+/);
    len = m ? m[0].length : 0;
  }
  if (len <= 0) return;
  if (idx + len > teks.length) len = teks.length - idx;
  if (lastHiIdx >= 0 && idx + 2 < lastHiIdx) return;
  if (idx === lastHiIdx && len === lastHiLen) return;
  hiPending = { teks: teks, idx: idx, len: len };
  if (hiRaf) return;
  hiRaf = requestAnimationFrame(function () {
    hiRaf = 0;
    if (!hiPending) return;
    const p = hiPending;
    hiPending = null;
    if (!captionLine || captionLine !== line) return;
    terapkanHighlight(p.teks, p.idx, p.len);
  });
}

function setActive(speaker) {
  Object.keys(SEATS).forEach(function (k) {
    const node = $(SEATS[k]);
    if (!node) return;
    const next = 'ring' + (k === speaker ? ' active' : (inCast(k) ? '' : ' standby'));
    if (node.className !== next) node.className = next;
  });
}

function clearSeats() {
  Object.keys(SEATS).forEach(function (k) {
    const node = $(SEATS[k]);
    if (!node) return;
    const next = 'ring' + (inCast(k) ? '' : ' standby');
    if (node.className !== next) node.className = next;
  });
}

function setAir(on) {
  const dot = $('airDot');
  const lab = $('airLabel');
  if (dot) {
    const onCls = dot.classList.contains('on');
    if (on !== onCls) dot.classList.toggle('on', on);
  }
  if (lab) {
    const onCls = lab.classList.contains('on');
    if (on !== onCls) lab.classList.toggle('on', on);
    const teks = on ? 'MENGUDARA' : 'SIAP';
    if (lab.textContent !== teks) lab.textContent = teks;
  }
}

const waveEl = $('wave');
let waveTimer = null;

function waveInit() {
  if (!waveEl || waveEl.childNodes.length) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 16; i++) {
    frag.appendChild(document.createElement('i'));
  }
  waveEl.appendChild(frag);
}

function waveOn(on) {
  if (!waveEl) return;
  if (on) {
    waveEl.classList.add('on');
    if (!waveTimer) {
      waveTimer = setInterval(function () {
        const kids = waveEl.children;
        for (let i = 0; i < kids.length; i++) {
          kids[i].style.transform = 'scaleY(' + (0.3 + Math.random() * 0.7) + ')';
        }
      }, 120);
    }
  } else {
    waveEl.classList.remove('on');
    if (waveTimer) {
      clearInterval(waveTimer);
      waveTimer = null;
    }
  }
}

function updateEpInfo(words) {
  const el = $('epInfo');
  if (!el) return;
  const state = pituturState.state;
  const mins = Math.max(1, Math.round(words / (138 * state.rate)));
  el.textContent = 'Siaran #' + (state.episode + 1) + ' · ' + words + ' kata · ±' + mins + ' mnt';
}

function updateControls(playing) {
  const play = $('btnPlay');
  const stopRow = $('stopRow');
  const stop = $('btnStop');
  const pause = $('btnPause');
  if (play) {
    play.hidden = !!playing;
    play.style.display = playing ? 'none' : '';
  }
  if (stopRow) {
    stopRow.style.display = playing ? 'flex' : 'none';
  }
  if (stop) stop.hidden = false;
  if (pause) pause.hidden = false;
}

function setPaused(paused) {
  const btn = $('btnPause');
  if (btn) btn.textContent = paused ? 'Lanjut' : 'Jeda';
  if (waveEl) waveEl.classList.toggle('paused', !!paused);
}

let naskahSeek = null;
let naskahBound = false;

function onNaskahClick(e) {
  if (!naskahSeek) return;
  const span = e.target.closest('.naskahLine');
  if (!span) return;
  const idx = parseInt(span.getAttribute('data-idx'), 10);
  if (!isNaN(idx)) naskahSeek(idx);
}

function setNaskahAktif(idx) {
  const el = $('transcript');
  if (!el) return;
  const nodes = el.querySelectorAll('.naskahLine');
  for (let i = 0; i < nodes.length; i++) {
    const on = i === idx;
    if (on) nodes[i].classList.add('on');
    else nodes[i].classList.remove('on');
  }
  const aktif = el.querySelector('.naskahLine.on');
  if (aktif && typeof aktif.scrollIntoView === 'function') {
    try { aktif.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
  }
}

function renderNaskah(lines, onSeek) {
  const el = $('transcript');
  if (!el) return;
  captionLine = null;
  capB = capW = capA = null;
  lastHiIdx = lastHiLen = -1;
  lastAktifIdx = -1;
  naskahLinesRef = lines || null;
  naskahSeek = onSeek || null;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const span = document.createElement('span');
    span.className = 'naskahLine';
    span.setAttribute('data-idx', String(i));
    const b = document.createElement('b');
    b.textContent = l.speaker + ':';
    span.appendChild(b);
    span.appendChild(document.createTextNode(' ' + (l.text || '')));
    frag.appendChild(span);
    if (i < lines.length - 1) {
      frag.appendChild(document.createElement('br'));
      frag.appendChild(document.createElement('br'));
    }
  }
  el.textContent = '';
  el.appendChild(frag);
  if (!naskahBound) {
    el.addEventListener('click', onNaskahClick);
    naskahBound = true;
  }
}

function renderHistory(onLoad) {
  const state = pituturState.state;
  const count = $('histCount');
  if (count) {
    count.textContent = state.history.length ? state.history.length + ' siaran' : '';
  }
  const list = $('histList');
  if (!list) return;
  if (!state.history.length) {
    list.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Belum ada riwayat siaran.';
    list.appendChild(empty);
    return;
  }
  const frag = document.createDocumentFragment();
  for (let i = state.history.length - 1; i >= 0; i--) {
    const h = state.history[i];
    const btn = document.createElement('button');
    btn.setAttribute('data-hist', String(i));
    const tanggal = new Date(h.date).toLocaleDateString('id-ID');
    btn.textContent = 'Siaran #' + h.n + ' · ' + h.channel + ' · ' + h.words + ' kata ';
    const sp = document.createElement('span');
    sp.textContent = tanggal;
    btn.appendChild(sp);
    frag.appendChild(btn);
  }
  list.textContent = '';
  list.appendChild(frag);
  list.onclick = function (e) {
    const btn = e.target.closest('[data-hist]');
    if (!btn) return;
    const idx = parseInt(btn.getAttribute('data-hist'), 10);
    const h = state.history[idx];
    if (h && onLoad) onLoad(h);
  };
}

function showStats(s) {
  const el = $('statsRow');
  if (!el) return;
  el.textContent = s.plays + ' siaran · ' + s.minutes + ' mnt · streak ' + s.streak + ' hari';
}

export const pituturRenderer = {
  $: $,
  toast: toast,
  escapeHtml: escapeHtml,
  escapeAttr: escapeAttr,
  showCaption: showCaption,
  highlightWord: highlightWord,
  setActive: setActive,
  clearSeats: clearSeats,
  setAir: setAir,
  waveInit: waveInit,
  waveOn: waveOn,
  updateEpInfo: updateEpInfo,
  updateControls: updateControls,
  setPaused: setPaused,
  renderNaskah: renderNaskah,
  setNaskahAktif: setNaskahAktif,
  renderHistory: renderHistory,
  showStats: showStats
};

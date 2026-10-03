import { $ } from '../../shared/dom.js';
import { exportSlides, rememberSlide, rememberArtifact } from '../../shared/slides-export.js';
import { toast } from '../core/toast.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';
import { buildDocxBytes } from '../../shared/docx-local.js';
import { buildZip } from '../../shared/zip-local.js';
import { buildChartSvg } from '../../shared/charts-local.js';
import { buildDiagramSvg } from '../../shared/diagrams-local.js';
import { printReport } from '../../shared/report-export.js';

let current = { type: 'slide', title: 'Slide', fileName: 'slide.pptx', outline: [], code: '', lang: 'js', markdown: '' };

function extFor(type, lang) {
  if (type === 'slide') return '.pptx';
  if (type === 'code') return lang === 'py' || lang === 'python' ? '.py' : lang === 'html' ? '.html' : lang === 'css' ? '.css' : '.js';
  return '.md';
}

function downloadText(name, text) {
  downloadBytes(name, text, 'text/plain;charset=utf-8');
}

function downloadBytes(name, bytes, mime) {
  const blob = new Blob([bytes], { type: mime || 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function readOutline() {
  const stage = $('artifact-stage');
  if (!stage) return [];
  return Array.from(stage.querySelectorAll('.art-slide')).map((el) => {
    const titleEl = el.querySelector('h3');
    const items = Array.from(el.querySelectorAll('[data-bullet]')).map((b) => b.textContent.trim()).filter(Boolean);
    return { kind: el.dataset.kind || 'body', title: titleEl ? titleEl.textContent.trim() : '', bullets: items };
  });
}

function renderSlide(outline, title) {
  const stage = $('artifact-stage');
  const head = $('artifact-title');
  if (!stage) return;
  if (head) head.textContent = title || 'Slide';
  stage.innerHTML = '';
  const deck = document.createElement('div');
  deck.className = 'slide-carousel';
  const slides = outline || [];
  let index = 0;
  const frame = document.createElement('div');
  frame.className = 'slide-frame';
  const paint = () => {
    frame.innerHTML = '';
    const s = slides[index] || { title: '', bullets: [] };
    const card = document.createElement('article');
    card.className = 'art-slide on';
    card.dataset.kind = s.kind || 'body';
    const h = document.createElement('h3');
    h.contentEditable = 'true';
    h.textContent = (index + 1) + '. ' + (s.title || '');
    card.appendChild(h);
    const ul = document.createElement('ul');
    (s.bullets || []).forEach((b) => {
      const li = document.createElement('li');
      li.dataset.bullet = '1';
      li.contentEditable = 'true';
      li.textContent = b;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    frame.appendChild(card);
    count.textContent = 'Slide ' + (slides.length ? index + 1 : 0) + ' / ' + slides.length;
  };
  const bar = document.createElement('div');
  bar.className = 'slide-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = '<';
  const count = document.createElement('span');
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = '>';
  prev.onclick = () => { if (!slides.length) return; index = (index - 1 + slides.length) % slides.length; paint(); };
  next.onclick = () => { if (!slides.length) return; index = (index + 1) % slides.length; paint(); };
  bar.appendChild(prev);
  bar.appendChild(count);
  bar.appendChild(next);
  deck.appendChild(frame);
  deck.appendChild(bar);
  stage.appendChild(deck);
  slides.forEach((s, i) => {
    const hidden = document.createElement('article');
    hidden.className = 'art-slide';
    hidden.dataset.kind = s.kind || 'body';
    hidden.hidden = true;
    const h = document.createElement('h3');
    h.textContent = (i + 1) + '. ' + (s.title || '');
    hidden.appendChild(h);
    const ul = document.createElement('ul');
    (s.bullets || []).forEach((b) => {
      const li = document.createElement('li');
      li.dataset.bullet = '1';
      li.textContent = b;
      ul.appendChild(li);
    });
    hidden.appendChild(ul);
    stage.appendChild(hidden);
  });
  paint();
}

function renderCode(code, title) {
  const stage = $('artifact-stage');
  const head = $('artifact-title');
  if (head) head.textContent = title || 'Kode';
  if (!stage) return;
  stage.innerHTML = '';
  const pre = document.createElement('pre');
  pre.className = 'md-pre art-code';
  const el = document.createElement('code');
  el.className = 'md-code';
  el.contentEditable = 'true';
  el.textContent = code || '';
  pre.appendChild(el);
  stage.appendChild(pre);
  const out = document.createElement('pre');
  out.id = 'artifact-console';
  out.className = 'art-console';
  out.hidden = true;
  stage.appendChild(out);
}


function renderTable(rows, title) {
  const stage = $('artifact-stage');
  const head = $('artifact-title');
  if (head) head.textContent = title || 'Tabel';
  if (!stage) return;
  stage.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'art-table';
  (rows || []).forEach((row, ri) => {
    const tr = document.createElement('tr');
    (row || []).forEach((cell) => {
      const el = document.createElement(ri === 0 ? 'th' : 'td');
      el.contentEditable = 'true';
      el.textContent = cell;
      tr.appendChild(el);
    });
    table.appendChild(tr);
  });
  stage.appendChild(table);
}

function readTable() {
  return Array.from(document.querySelectorAll('#artifact-stage .art-table tr')).map((tr) =>
    Array.from(tr.children).map((td) => td.textContent.trim())
  );
}

function renderDocument(markdown, title) {
  const stage = $('artifact-stage');
  const head = $('artifact-title');
  if (head) head.textContent = title || 'Dokumen';
  if (!stage) return;
  stage.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'art-doc';
  box.contentEditable = 'true';
  box.textContent = markdown || '';
  stage.appendChild(box);
}

function setChrome(type) {
  const exp = $('artifact-export');
  const run = $('artifact-run');
  const name = current.fileName || '';
  let label = 'Unduh MD';
  if (type === 'slide') label = 'Unduh PPTX';
  else if (type === 'table') label = 'Unduh CSV';
  else if (type === 'zip') label = 'Unduh ZIP';
  else if (type === 'code') label = 'Unduh file';
  else if ((type === 'document' || type === 'docx') && /\.docx$/i.test(name)) label = 'Unduh DOCX';
  if (exp) exp.textContent = label;
  if (run) run.hidden = type !== 'code';
}

function normalize(first, title, fileName) {
  if (Array.isArray(first)) {
    return { type: 'slide', outline: first, title: title || 'Slide', fileName: fileName || 'slide.pptx', code: '', lang: 'js', markdown: '' };
  }
  const t = first && first.type ? first.type : 'slide';
  return {
    type: t,
    outline: first.outline || [],
    title: first.title || title || (t === 'code' ? 'Kode' : t === 'document' ? 'Dokumen' : 'Slide'),
    fileName: first.fileName || fileName || ('berkas' + extFor(t, first.lang)),
    code: first.code || '',
    lang: first.lang || 'js',
    markdown: first.markdown || first.text || '',
    rows: first.rows || [],
    files: first.files || [],
  };
}

function renderCurrent() {
  setChrome(current.type);
  if (current.type === 'code') renderCode(current.code, current.title);
  else if (current.type === 'document' || current.type === 'docx') renderDocument(current.markdown, current.title);
  else if (current.type === 'zip') renderDocument(current.markdown, current.title);
  else if (current.type === 'table') renderTable(current.rows, current.title);
  else if (current.type === 'chart') renderChart(current);
  else if (current.type === 'diagram') renderDiagram(current);
  else renderSlide(current.outline, current.title);
}

function renderDiagram(item) {
  const stage = $('artifact-stage');
  const head = $('artifact-title');
  if (head) head.textContent = item.title || 'Diagram';
  if (!stage) return;
  stage.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'diagram-view';
  let scale = 1;
  const board = document.createElement('div');
  board.innerHTML = item.markdown || buildDiagramSvg(item.spec || {});
  const paint = () => { board.style.transform = 'scale(' + scale + ')'; };
  const bar = document.createElement('div');
  bar.className = 'slide-nav';
  const zoomOut = document.createElement('button');
  zoomOut.type = 'button';
  zoomOut.textContent = '−';
  const zoomIn = document.createElement('button');
  zoomIn.type = 'button';
  zoomIn.textContent = '+';
  zoomOut.onclick = () => { scale = Math.max(0.5, scale - 0.15); paint(); };
  zoomIn.onclick = () => { scale = Math.min(2.5, scale + 0.15); paint(); };
  bar.appendChild(zoomOut);
  bar.appendChild(zoomIn);
  wrap.appendChild(bar);
  wrap.appendChild(board);
  stage.appendChild(wrap);
  paint();
}

function renderChart(item) {
  const stage = $('artifact-stage');
  const head = $('artifact-title');
  if (head) head.textContent = item.title || 'Grafik';
  if (!stage) return;
  stage.innerHTML = item.markdown || buildChartSvg({ type: 'bar', title: item.title, labels: [], datasets: [{ data: [] }] });
}

function paintVersions() {
  const head = $('artifact-head');
  if (!head) return;
  let pick = $('artifact-version');
  if (!pick) {
    pick = document.createElement('select');
    pick.id = 'artifact-version';
    head.insertBefore(pick, head.querySelector('#artifact-run') || head.lastChild);
  }
  pick.innerHTML = '';
  const list = current.versions || [];
  if (!list.length) {
    pick.hidden = true;
    return;
  }
  pick.hidden = false;
  list.forEach((item, index) => {
    const opt = document.createElement('option');
    opt.value = String(index);
    opt.textContent = 'v' + (index + 1);
    pick.appendChild(opt);
  });
  const now = document.createElement('option');
  now.value = 'now';
  now.textContent = 'v' + (list.length + 1);
  now.selected = true;
  pick.appendChild(now);
  pick.onchange = () => {
    if (pick.value === 'now') return;
    const chosen = list[Number(pick.value)];
    if (!chosen) return;
    current = Object.assign({}, chosen, { versions: list });
    renderCurrent();
  };
}

export const artifact = {
  open(first, title, fileName) {
    const panel = $('artifact-panel');
    const app = $('app');
    if (!panel) return;
    const next = normalize(first, title, fileName);
    if (current && current.fileName === next.fileName && current.type === next.type) {
      const snap = Object.assign({}, current);
      delete snap.versions;
      next.versions = (current.versions || []).concat([snap]).slice(-8);
    }
    current = next;
    if (current.type === 'slide') rememberSlide(current.outline, current.fileName);
    else rememberArtifact(current);
    renderCurrent();
    paintVersions();
    panel.classList.add('open');
    if (app) app.classList.add('split');
    panel.hidden = false;
  },
  close() {
    const panel = $('artifact-panel');
    const app = $('app');
    if (panel) {
      panel.classList.remove('open');
      panel.hidden = true;
    }
    if (app) app.classList.remove('split');
  },
  exportNow() {
    if (current.type === 'diagram') {
      downloadText(current.fileName || 'diagram.svg', current.markdown || '');
      return;
    }
    if (current.type === 'report') {
      printReport({ title: current.title, body: current.markdown || '' });
      return;
    }
    if (current.type === 'chart') {
      const svg = current.markdown || '';
      downloadText(current.fileName || 'grafik.svg', svg);
      return;
    }
    if (current.type === 'table') {
      const rows = readTable();
      const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
      downloadText(current.fileName || 'tabel.csv', csv);
      return;
    }
    if (current.type === 'code') {
      const codeEl = document.querySelector('#artifact-stage code');
      const code = codeEl ? codeEl.textContent : current.code;
      downloadText(current.fileName || ('cuplikan' + extFor('code', current.lang)), code || '');
      return;
    }
    if (current.type === 'document' || current.type === 'docx' || current.type === 'zip') {
      const box = document.querySelector('#artifact-stage .art-doc');
      const md = box ? box.textContent : current.markdown;
      const name = current.fileName || (current.type === 'zip' ? 'paket.zip' : 'dokumen.md');
      if (current.type === 'zip' || /\.zip$/i.test(name)) {
        const files = Array.isArray(current.files) && current.files.length ? current.files : [{ name: 'catatan.txt', data: md || '' }];
        downloadBytes(name, buildZip(files), 'application/zip');
        return;
      }
      if (current.type === 'docx' || /\.docx$/i.test(name)) {
        downloadBytes(name, buildDocxBytes(md || ''), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        return;
      }
      downloadText(name, md || '');
      return;
    }
    const outline = readOutline();
    if (!outline.length) {
      toast.show('Tidak ada slide');
      return;
    }
    const name = (($('artifact-title') || {}).textContent || 'slide').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.pptx';
    rememberSlide(outline, name);
    exportSlides(outline, name);
  },
  async runNow() {
    if (current.type !== 'code') return;
    if (current.lang && current.lang !== 'js' && current.lang !== 'javascript') {
      toast.show('Jalankan hanya untuk JavaScript');
      return;
    }
    const codeEl = document.querySelector('#artifact-stage code');
    const code = codeEl ? codeEl.textContent : current.code;
    const out = $('artifact-console');
    const res = await jsSandbox.run(code);
    if (out) {
      out.hidden = false;
      out.textContent = res.ok
        ? ((res.logs || []).join('\n') + (res.value ? '\n→ ' + res.value : '')).trim() || 'Selesai.'
        : ('Gagal: ' + (res.error || 'error'));
    }
    toast.show(res.ok ? 'Kode dijalankan' : 'Kode gagal');
  },
  bind() {
    const close = $('artifact-close');
    const exp = $('artifact-export');
    const run = $('artifact-run');
    if (close) close.onclick = () => this.close();
    if (exp) exp.onclick = () => this.exportNow();
    if (run) run.onclick = () => this.runNow();
  },
};

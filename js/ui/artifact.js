import { $ } from '../utils/dom.js';
import { exportSlides, rememberSlide, rememberArtifact } from '../utils/slides-export.js';
import { toast } from '../core/toast.js';
import { jsSandbox } from '../../vault/code/js-sandbox.js';

let current = { type: 'slide', title: 'Slide', fileName: 'slide.pptx', outline: [], code: '', lang: 'js', markdown: '' };

function extFor(type, lang) {
  if (type === 'slide') return '.pptx';
  if (type === 'code') return lang === 'py' || lang === 'python' ? '.py' : lang === 'html' ? '.html' : lang === 'css' ? '.css' : '.js';
  return '.md';
}

function downloadText(name, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
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
  (outline || []).forEach((s, i) => {
    const card = document.createElement('article');
    card.className = 'art-slide';
    card.dataset.kind = s.kind || 'body';
    const h = document.createElement('h3');
    h.contentEditable = 'true';
    h.textContent = (i + 1) + '. ' + (s.title || '');
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
    stage.appendChild(card);
  });
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
  if (exp) exp.textContent = type === 'slide' ? 'Unduh PPTX' : type === 'code' ? 'Unduh file' : type === 'table' ? 'Unduh CSV' : 'Unduh MD';
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
  };
}

function renderCurrent() {
  setChrome(current.type);
  if (current.type === 'code') renderCode(current.code, current.title);
  else if (current.type === 'document') renderDocument(current.markdown, current.title);
  else if (current.type === 'table') renderTable(current.rows, current.title);
  else renderSlide(current.outline, current.title);
}

export const artifact = {
  open(first, title, fileName) {
    const panel = $('artifact-panel');
    const app = $('app');
    if (!panel) return;
    current = normalize(first, title, fileName);
    if (current.type === 'slide') rememberSlide(current.outline, current.fileName);
    else rememberArtifact(current);
    renderCurrent();
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
    if (current.type === 'document') {
      const box = document.querySelector('#artifact-stage .art-doc');
      const md = box ? box.textContent : current.markdown;
      downloadText(current.fileName || 'dokumen.md', md || '');
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

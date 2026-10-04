import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { artifact } from '../ui/artifact.js';
import { allArtifacts } from '../../shared/slides-export.js';
import { drawer } from '../ui/drawer.js';

let filter = 'semua';

function kindOf(item) {
  const type = item.type || 'slide';
  if (type === 'slide' || item.outline) return 'slide';
  if (type === 'document' || type === 'report') return 'document';
  if (type === 'code') return 'code';
  if (type === 'chart' || type === 'diagram') return 'chart';
  if (type === 'table') return 'table';
  return type;
}

function extOf(item) {
  const name = String(item.fileName || '');
  const match = name.match(/\.([a-z0-9]+)$/i);
  if (match) return match[1].toUpperCase();
  const kind = kindOf(item);
  if (kind === 'slide') return 'PPTX';
  if (kind === 'code') return 'CODE';
  if (kind === 'document') return 'DOCX';
  if (kind === 'chart') return 'SVG';
  if (kind === 'table') return 'CSV';
  return 'FILE';
}

function relTime(time) {
  if (!time) return '';
  const delta = Date.now() - time;
  if (delta < 60000) return 'Baru saja';
  if (delta < 3600000) return Math.floor(delta / 60000) + ' mnt lalu';
  return new Date(time).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function paint() {
  const ul = $('artifact-page-list');
  const filters = $('artifact-filters');
  if (!ul) return;
  const list = allArtifacts();
  const tabs = [
    ['semua', 'Semua'],
    ['slide', 'Presentasi'],
    ['document', 'Dokumen'],
    ['code', 'Kode'],
    ['chart', 'Grafik'],
    ['table', 'Tabel'],
  ];
  if (filters) {
    filters.innerHTML = '';
    tabs.forEach(([key, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.className = filter === key ? 'on' : '';
      btn.onclick = () => { filter = key; paint(); };
      filters.appendChild(btn);
    });
  }
  ul.innerHTML = '';
  const shown = list.filter((item) => filter === 'semua' || kindOf(item) === filter);
  if (!shown.length) {
    const li = document.createElement('li');
    li.className = 'coll-empty-card';
    li.innerHTML = '<strong>Belum ada artefak</strong><p>Minta slide, dokumen, atau kode di obrolan, atau simpan cuplikan dari Studio kode.</p>';
    ul.appendChild(li);
    return;
  }
  shown.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'artifact-card-page';
    const title = document.createElement('strong');
    title.textContent = item.title || item.fileName || 'Berkas';
    const meta = document.createElement('span');
    meta.className = 'artifact-meta';
    meta.textContent = [extOf(item), relTime(item.time)].filter(Boolean).join(' · ');
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = 'Pratinjau';
    open.onclick = () => {
      const body = String(item.markdown || item.code || '');
      const frame = $('artifact-inline');
      if (frame && /<\s*(svg|html|div|p|table)\b/i.test(body)) {
        frame.hidden = false;
        frame.srcdoc = body;
        return;
      }
      if (item.type === 'code' || item.type === 'document' || item.type === 'table' || item.type === 'chart' || item.type === 'diagram' || item.type === 'report') artifact.open(item);
      else artifact.open(item.outline, item.title, item.fileName);
      router.go('chat');
    };
    const save = document.createElement('button');
    save.type = 'button';
    save.textContent = 'Unduh';
    save.onclick = () => open.click();
    li.appendChild(meta);
    li.appendChild(title);
    li.appendChild(open);
    li.appendChild(save);
    ul.appendChild(li);
  });
}

export const artifactsPage = {
  paint,
  bind() {
    const back = $('artifact-page-back');
    if (back) back.onclick = () => router.go('chat');
    const side = $('btn-artifact');
    if (side) side.onclick = () => {
      drawer.close();
      this.open();
    };
    window.addEventListener('hashchange', () => {
      if ((location.hash || '').indexOf('artifacts') >= 0) paint();
    });
  },
  open() {
    paint();
    router.go('artifacts');
  },
};

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
    li.textContent = 'Belum ada artefak di saringan ini.';
    ul.appendChild(li);
    return;
  }
  shown.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'artifact-card-page';
    const title = document.createElement('strong');
    title.textContent = item.title || item.fileName || 'Berkas';
    const badge = document.createElement('span');
    badge.textContent = kindOf(item);
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
    li.appendChild(badge);
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

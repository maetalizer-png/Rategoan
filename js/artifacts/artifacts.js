import { $ } from '../utils/dom.js';
import { router } from '../core/router.js';
import { artifact } from '../ui/artifact.js';
import { allArtifacts } from '../utils/slides-export.js';
import { drawer } from '../ui/drawer.js';

function paint() {
  const ul = $('artifact-page-list');
  if (!ul) return;
  ul.innerHTML = '';
  const list = allArtifacts();
  if (!list.length) {
    const li = document.createElement('li');
    li.textContent = 'Belum ada artefak. Buat slide, dokumen, kode, atau tabel.';
    ul.appendChild(li);
    return;
  }
  list.forEach((a) => {
    const li = document.createElement('li');
    li.className = 'project-row';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'project-open';
    btn.textContent = (a.type || 'slide') + ' · ' + (a.title || a.fileName || 'Berkas');
    btn.onclick = () => {
      if (a.type === 'code' || a.type === 'document' || a.type === 'table') artifact.open(a);
      else artifact.open(a.outline, a.title, a.fileName);
      router.go('chat');
    };
    li.appendChild(btn);
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

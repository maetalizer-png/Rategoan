import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { workspace } from '../state/workspace.js';
import { store } from '../state/store.js';
import { toast } from '../core/toast.js';

function paint() {
  const ul = $('project-list');
  const curLabel = $('project-current');
  if (curLabel) {
    const cur = workspace.current();
    curLabel.textContent = cur ? ('Aktif: ' + cur.name) : 'Belum ada proyek aktif';
    let prompt = $('project-prompt');
    if (!prompt && curLabel.parentNode) {
      prompt = document.createElement('textarea');
      prompt.id = 'project-prompt';
      prompt.rows = 4;
      prompt.placeholder = 'Instruksi khusus proyek ini';
      curLabel.parentNode.appendChild(prompt);
      prompt.onchange = () => {
        const active = workspace.current();
        if (!active) return;
        workspace.update(active.id, { systemPrompt: prompt.value });
        toast.show('Instruksi proyek disimpan');
      };
    }
    if (prompt) prompt.value = cur && cur.systemPrompt ? cur.systemPrompt : '';
  }
  if (!ul) return;
  ul.innerHTML = '';
  const list = workspace.list();
  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'project-empty';
    li.textContent = 'Belum ada proyek. Isi nama di atas lalu buat.';
    ul.appendChild(li);
    return;
  }
  list.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'project-row' + (workspace.currentId() === p.id ? ' on' : '');
    const name = document.createElement('button');
    name.type = 'button';
    name.className = 'project-open';
    name.textContent = p.name + (workspace.currentId() === p.id ? ' · aktif' : '');
    name.onclick = () => {
      workspace.setCurrent(p.id);
      const st = store.get();
      const s = st.sessions.find((x) => x.id === st.currentId);
      if (s) {
        s.projectId = p.id;
        s.project = { goal: p.name, started: Date.now() };
        store.save();
      }
      toast.show('Proyek: ' + p.name);
      paint();
      router.go('chat');
    };
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'project-del';
    del.textContent = 'Hapus';
    del.onclick = (e) => {
      e.stopPropagation();
      workspace.remove(p.id);
      paint();
    };
    li.appendChild(name);
    li.appendChild(del);
    ul.appendChild(li);
  });
}

export const projectPage = {
  paint,
  bind() {
    const back = $('project-back');
    if (back) back.onclick = () => router.go('chat');
    const make = $('project-create');
    if (make) make.onclick = () => {
      const name = (($('project-name') || {}).value || '').trim();
      if (!name) return;
      const found = workspace.findByName(name) || workspace.create(name);
      workspace.setCurrent(found.id);
      const st = store.get();
      const s = st.sessions.find((x) => x.id === st.currentId);
      if (s) {
        s.projectId = found.id;
        s.project = { goal: found.name, started: Date.now() };
        store.save();
      }
      if ($('project-name')) $('project-name').value = '';
      toast.show('Proyek: ' + found.name);
      paint();
    };
    window.addEventListener('hashchange', () => {
      if ((location.hash || '').indexOf('project') >= 0) paint();
    });
  },
  open() {
    paint();
    router.go('project');
  },
};

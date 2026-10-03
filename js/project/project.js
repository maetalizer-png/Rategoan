import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { workspace } from '../state/workspace.js';
import { store } from '../state/store.js';
import { toast } from '../core/toast.js';

const TEMPLATES = {
  'Riset akademik': 'Tulis dengan kutipan, bandingkan sumber, dan pisahkan fakta dari tafsiran.',
  'Pengembangan web': 'Jawab dengan kode yang bisa dijalankan dan sebut berkas yang diubah.',
  'Naskah': 'Gunakan bahasa hangat, paragraf pendek, dan judul yang jelas.',
  'Dokumen bisnis': 'Susun ringkas, ada angka, risiko, dan langkah berikutnya.',
};

function remember(project) {
  workspace.setCurrent(project.id);
  const st = store.get();
  const session = (st.sessions || []).find((item) => item.id === st.currentId);
  if (session) {
    session.projectId = project.id;
    session.project = { goal: project.name, started: Date.now() };
    store.save();
  }
}

function activate(project) {
  remember(project);
  toast.show('Proyek: ' + project.name);
  paint();
  router.go('chat');
}

function cardList(ul) {
  if (!ul) return;
  ul.innerHTML = '';
  const list = workspace.list();
  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'project-empty';
    li.textContent = 'Belum ada proyek. Pilih template atau isi nama.';
    ul.appendChild(li);
    return;
  }
  list.forEach((project) => {
    const li = document.createElement('li');
    li.className = 'project-card' + (workspace.currentId() === project.id ? ' on' : '');
    const name = document.createElement('button');
    name.type = 'button';
    name.className = 'project-open';
    name.textContent = project.name + (workspace.currentId() === project.id ? ' · aktif' : '');
    name.onclick = () => activate(project);
    const meta = document.createElement('p');
    const files = (project.pinnedFiles || []).length;
    meta.textContent = (project.systemPrompt || 'Belum ada instruksi').slice(0, 90) + (files ? ' · ' + files + ' berkas' : '');
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'project-del';
    del.textContent = 'Hapus';
    del.onclick = (event) => {
      event.stopPropagation();
      workspace.remove(project.id);
      paint();
    };
    li.appendChild(name);
    li.appendChild(meta);
    li.appendChild(del);
    ul.appendChild(li);
  });
}

function paint() {
  const curLabel = $('project-current');
  const cur = workspace.current();
  if (curLabel) curLabel.textContent = cur ? ('Aktif: ' + cur.name) : 'Belum ada proyek aktif';
  let prompt = $('project-prompt');
  if (!prompt && curLabel && curLabel.parentNode) {
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
  cardList($('project-list'));
  cardList($('project-list-sheet'));
}

function createNamed(name) {
  const clean = String(name || '').trim();
  if (!clean) return;
  const found = workspace.findByName(clean) || workspace.create(clean);
  remember(found);
  toast.show('Proyek: ' + found.name);
  paint();
}

export const projectPage = {
  paint,
  bind() {
    const back = $('project-back');
    if (back) back.onclick = () => router.go('chat');
    const make = $('project-create');
    if (make) make.onclick = () => {
      createNamed(($('project-name') || {}).value);
      if ($('project-name')) $('project-name').value = '';
    };
    const makeSheet = $('project-create-sheet');
    if (makeSheet) makeSheet.onclick = () => {
      createNamed(($('project-name-sheet') || {}).value);
      if ($('project-name-sheet')) $('project-name-sheet').value = '';
    };
    document.querySelectorAll('[data-template]').forEach((btn) => {
      btn.onclick = () => {
        const name = btn.getAttribute('data-template');
        const found = workspace.findByName(name) || workspace.create(name);
        workspace.update(found.id, { systemPrompt: TEMPLATES[name] || '' });
        activate(found);
      };
    });
    window.addEventListener('hashchange', () => {
      if ((location.hash || '').indexOf('project') >= 0) paint();
    });
  },
  open() {
    paint();
    router.go('project');
  },
};

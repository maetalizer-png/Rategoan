import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { workspace } from '../state/workspace.js';
import { folderBridge } from './folder-bridge.js';
import { store } from '../state/store.js';
import { toast } from '../core/toast.js';
import { extractPdfText } from '../../shared/pdf-extract.js';
import { readZipText } from '../../shared/zip-local.js';

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

function showProjectBar(project) {
  const bar = document.getElementById('thread-bar');
  if (!bar) return;
  if (!project) {
    bar.hidden = true;
    bar.textContent = '';
    return;
  }
  bar.hidden = false;
  bar.textContent = 'Proyek aktif: ' + project.name;
}

function activate(project) {
  remember(project);
  showProjectBar(project);
  toast.show('Proyek: ' + project.name);
  paint();
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
      if (!window.confirm('Hapus proyek "' + project.name + '" dari perangkat ini?')) return;
      workspace.remove(project.id);
      paint();
    };
    li.appendChild(name);
    li.appendChild(meta);
    li.appendChild(del);
    ul.appendChild(li);
  });
}

function renderPinned(project) {
  const ul = $('project-file-list');
  if (!ul) return;
  ul.innerHTML = '';
  const files = (project && project.pinnedFiles) || [];
  if (!files.length) {
    const li = document.createElement('li');
    li.className = 'project-file-empty';
    li.textContent = 'Belum ada berkas tersemat.';
    ul.appendChild(li);
    return;
  }
  files.forEach((file, index) => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    const kb = file.size ? ' · ' + Math.max(1, Math.round(file.size / 1024)) + ' KB' : '';
    name.textContent = (file.name || 'berkas') + kb;
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Hapus';
    del.onclick = () => {
      const next = files.filter((_, i) => i !== index);
      workspace.update(project.id, { pinnedFiles: next });
      paint();
    };
    li.appendChild(name);
    li.appendChild(del);
    ul.appendChild(li);
  });
}

function readFileText(file) {
  const name = file.name || '';
  if (/\.pdf$/i.test(name)) {
    return file.arrayBuffer().then((buf) => extractPdfText(buf).then((text) => String(text || '').slice(0, 8000))).catch((e) => {
      console.warn('[Rategoan Fallback] Proyek:', e);
      return '';
    });
  }
  if (/\.docx$/i.test(name)) {
    return file.arrayBuffer().then((buf) => readZipText(buf, 'word/document.xml').then((xml) => String(xml || '')
      .replace(/<w:p\b[^>]*>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, 8000))).catch((e) => {
      console.warn('[Rategoan Fallback] Proyek:', e);
      return '';
    });
  }
  return new Promise((resolve) => {
    if (file.type && file.type.indexOf('text') < 0 && !/\.(txt|md|csv|json)$/i.test(name)) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').slice(0, 8000));
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

function paint() {
  const curLabel = $('project-current');
  const cur = workspace.current();
  const list = workspace.list();
  const emptyView = $('project-empty-state');
  const hero = $('project-hero');
  const activeView = $('project-active-panel');
  const toggle = $('project-new-toggle');
  const createBox = $('project-create-box');
  showProjectBar(cur);
  if (!list.length) {
    if (curLabel) curLabel.textContent = 'Kelola ruang kerja terisolasi dengan instruksi mandiri.';
    if (hero) hero.hidden = false;
    if (emptyView) emptyView.hidden = false;
    if (activeView) activeView.hidden = true;
    if (toggle) toggle.hidden = true;
    if (createBox) createBox.hidden = false;
    const ul = $('project-list-sheet');
    if (ul) ul.innerHTML = '';
    return;
  }
  if (emptyView) emptyView.hidden = true;
  if (createBox && !createBox.dataset.open) createBox.hidden = true;
  if (hero) hero.hidden = !createBox || createBox.hidden;
  if (activeView) activeView.hidden = !cur;
  if (toggle) toggle.hidden = false;
  if (createBox && !createBox.dataset.open) createBox.hidden = true;
  if (curLabel) curLabel.textContent = cur ? ('Proyek aktif: ' + cur.name) : 'Pilih proyek untuk mengaktifkan.';
  const prompt = $('project-prompt');
  if (prompt && document.activeElement !== prompt) prompt.value = cur && cur.systemPrompt ? cur.systemPrompt : '';
  renderPinned(cur);
  cardList($('project-list-sheet'));
}

function createNamed(name) {
  const clean = String(name || '').trim();
  if (!clean) return;
  const found = workspace.findByName(clean) || workspace.create(clean);
  if (TEMPLATES[clean] && !found.systemPrompt) workspace.update(found.id, { systemPrompt: TEMPLATES[clean] });
  remember(found);
  const box = $('project-create-box');
  if (box) box.dataset.open = '';
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
        const input = $('project-name-sheet');
        if (input) {
          input.value = name;
          input.focus();
        }
        const box = $('project-create-box');
        if (box) {
          box.hidden = false;
          box.dataset.open = '1';
        }
      };
    });
    const prompt = $('project-prompt');
    if (prompt) prompt.onchange = () => {
      const active = workspace.current();
      if (!active) return;
      workspace.update(active.id, { systemPrompt: prompt.value });
      toast.show('Instruksi proyek disimpan');
    };
    const pin = $('project-pin-btn');
    const picker = $('project-file-pick');
    const toggle = $('project-new-toggle');
    const createBox = $('project-create-box');
    const openChat = $('project-open-chat');
    if (toggle && createBox) toggle.onclick = () => {
      createBox.hidden = !createBox.hidden;
      createBox.dataset.open = createBox.hidden ? '' : '1';
    };
    if (openChat) openChat.onclick = () => router.go('chat');
    const folderBtn = $('project-folder-btn');
    if (folderBtn) folderBtn.onclick = () => folderBridge.pick().then(() => paint());
    const folderSave = $('project-folder-save');
    if (folderSave) folderSave.onclick = () => folderBridge.saveNote();
    if (pin && picker) pin.onclick = () => picker.click();
    if (picker) picker.onchange = async () => {
      const active = workspace.current();
      if (!active) {
        toast.show('Buat proyek dulu');
        picker.value = '';
        return;
      }
      const incoming = [];
      const chosen = Array.from(picker.files || []);
      for (let i = 0; i < chosen.length; i += 1) {
        const file = chosen[i];
        incoming.push({
          name: file.name,
          size: file.size,
          textContent: await readFileText(file),
        });
      }
      workspace.update(active.id, { pinnedFiles: (active.pinnedFiles || []).concat(incoming).slice(0, 12) });
      picker.value = '';
      toast.show(incoming.length + ' berkas disematkan');
      paint();
    };
    window.addEventListener('hashchange', () => {
      if ((location.hash || '').indexOf('project') >= 0) paint();
    });
    window.addEventListener('rategoan:project-refresh', () => paint());
  },
  open() {
    paint();
    router.go('project');
  },
};

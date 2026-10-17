import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { workspace } from '../state/workspace.js';
import { folderBridge } from './folder-bridge.js';
import { store } from '../state/store.js';
import { toast } from '../core/toast.js';
import { extractPdfText } from '../../shared/pdf-extract.js';
import { listZipEntries, readZipText } from '../../shared/zip-local.js';
import { hasXmlEntityBomb, isSafeZipEntryPath, MAX_ATTACH_BYTES, MAX_ATTACH_TEXT_CHARS } from '../sheets/attach.js';

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
  if (!file || Number(file.size) > MAX_ATTACH_BYTES) return Promise.resolve('');
  const name = file.name || '';
  if (/\.pdf$/i.test(name)) {
    return file.arrayBuffer().then((buf) => extractPdfText(buf)).then((txt) => String(txt || '').slice(0, MAX_ATTACH_TEXT_CHARS)).catch(() => '');
  }
  if (/\.docx$/i.test(name)) {
    return file.arrayBuffer().then(async (buf) => {
      const xml = await readZipText(buf, 'word/document.xml');
      if (!xml || hasXmlEntityBomb(xml)) return '';
      return xml.replace(/<w:p\b[^>]*>/g, '\n').replace(/<[^>]+>/g, '').trim().slice(0, MAX_ATTACH_TEXT_CHARS);
    }).catch(() => '');
  }
  if (/\.zip$/i.test(name)) {
    return file.arrayBuffer().then((buf) => {
      const bytes = new Uint8Array(buf);
      const entries = listZipEntries(bytes)
        .map((e) => (typeof e === 'string' ? e : e.name))
        .filter((n) => isSafeZipEntryPath(n) && !n.endsWith('/'));
      return ('Arsip ZIP (' + entries.length + ' berkas): ' + entries.slice(0, 30).join(', ')).slice(0, MAX_ATTACH_TEXT_CHARS);
    }).catch(() => '');
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || '');
      if (/\.xml$|\.svg$|\.enex$/i.test(name) && hasXmlEntityBomb(raw)) {
        resolve('');
        return;
      }
      resolve(raw.slice(0, MAX_ATTACH_TEXT_CHARS));
    };
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

function paint() {
  const ul = $('project-page-list');
  const prompt = $('project-prompt');
  const active = workspace.current();
  const panel = $('project-active-panel');
  const createCard = $('project-create-box');
  const toggle = $('project-new-toggle');
  const activeName = $('project-active-name');
  cardList(ul);
  if (panel) panel.hidden = !active;
  if (activeName) activeName.textContent = active ? active.name : '';
  if (createCard && toggle) {
    const open = !active || createCard.dataset.open === '1';
    createCard.hidden = !open;
    toggle.hidden = open;
  }
  if (prompt) {
    prompt.disabled = !active;
    prompt.value = (active && active.systemPrompt) || '';
    prompt.placeholder = active
      ? 'Instruksi khusus untuk proyek ' + active.name
      : 'Pilih atau buat proyek dulu';
  }
  renderPinned(active);
  const folderLabel = $('project-folder-label');
  if (folderLabel) {
    folderLabel.textContent = folderBridge.name
      ? 'Folder lokal: ' + folderBridge.name + ' (' + folderBridge.files.length + ' berkas)'
      : 'Belum ada folder lokal';
  }
}

export const projectPage = {
  paint,
  bind() {
    const back = $('project-back');
    if (back) back.onclick = () => router.go('chat');
    const create = $('project-create-page');
    const input = $('project-name-page');
    if (create && input) {
      create.onclick = () => {
        const name = input.value.trim();
        if (!name) return;
        const p = workspace.findByName(name) || workspace.create(name);
        input.value = '';
        const box = $('project-create-box');
        if (box) box.dataset.open = '';
        activate(p);
      };
    }
    const tpl = $('project-templates');
    if (tpl) {
      tpl.innerHTML = '';
      Object.keys(TEMPLATES).forEach((name) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = name;
        b.onclick = () => {
          const p = workspace.findByName(name) || workspace.create(name);
          workspace.update(p.id, { systemPrompt: TEMPLATES[name] });
          activate(p);
        };
        tpl.appendChild(b);
      });
    }
    document.querySelectorAll('[data-project-tpl]').forEach((btn) => {
      btn.onclick = () => {
        const name = btn.getAttribute('data-project-tpl') || '';
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
    window.addEventListener('rategoan:route', (ev) => {
      if (ev && ev.detail && ev.detail.view === 'project') paint();
    });
    window.addEventListener('rategoan:project-refresh', () => paint());
    paint();
  },
  open() {
    paint();
    router.go('project');
  },
};

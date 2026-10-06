import { toast } from '../core/toast.js';
import { workspace } from '../state/workspace.js';

const handles = new Map();
let directory = null;

function isText(name) {
  return /\.(txt|md|json|csv|js|mjs|py|html|css|sql)$/i.test(name);
}

async function rememberDir(dir) {
  if (typeof indexedDB === 'undefined') return;
  await new Promise((resolve, reject) => {
    const req = indexedDB.open('raget_folder', 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('handles')) req.result.createObjectStore('handles');
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const tx = req.result.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(dir, 'dir');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  });
}

export const folderBridge = {
  async pick() {
    if (typeof window.showDirectoryPicker !== 'function') {
      toast.show('Peramban ini tidak membuka folder lokal');
      return;
    }
    let dir;
    try {
      dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    } catch (e) {
      console.warn('[Rategoan Fallback] Folder:', e);
      return;
    }
    handles.clear();
    directory = dir;
    try { await rememberDir(dir); } catch (e) { console.warn('[Rategoan Fallback] Folder:', e); }
    const names = [];
    try {
      for await (const [name, handle] of dir.entries()) {
        if (handle.kind !== 'file') continue;
        names.push(name);
        handles.set(name, handle);
        if (names.length >= 20) break;
      }
    } catch (e) {
      console.warn('[Rategoan Fallback] Folder:', e);
    }
    const list = document.getElementById('project-folder-list');
    if (list) {
      list.innerHTML = '';
      names.forEach((name) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = name;
        btn.onclick = () => this.pin(name);
        li.appendChild(btn);
        list.appendChild(li);
      });
    }
    toast.show(names.length ? names.length + ' berkas di folder lokal' : 'Folder kosong');
  },
  async pin(name) {
    const handle = handles.get(name);
    const active = workspace.current();
    if (!handle || !active) {
      toast.show('Pilih proyek dulu');
      return;
    }
    try {
      const file = await handle.getFile();
      let textContent = '';
      if (isText(name) && file.size < 200000) textContent = await file.text();
      const pinned = (active.pinnedFiles || []).filter((item) => item.name !== name);
      pinned.push({ name, size: file.size, textContent: textContent.slice(0, 8000) });
      workspace.update(active.id, { pinnedFiles: pinned });
      toast.show('Tersemat: ' + name);
      window.dispatchEvent(new CustomEvent('rategoan:project-refresh'));
    } catch (e) {
      console.warn('[Rategoan Fallback] Folder:', e);
      toast.show('Berkas tidak terbaca');
    }
  },
  async saveNote() {
    const active = workspace.current();
    if (!directory) {
      toast.show('Hubungkan folder dulu');
      return;
    }
    if (!window.confirm('Tulis catatan proyek ke berkas rategoan-catatan.md di folder lokal?')) return;
    try {
      const handle = await directory.getFileHandle('rategoan-catatan.md', { create: true });
      const writable = await handle.createWritable();
      await writable.write(String((active && active.systemPrompt) || ''));
      await writable.close();
      toast.show('Tersimpan di folder lokal');
    } catch (e) {
      console.warn('[Rategoan Fallback] Folder:', e);
      toast.show('Gagal menulis berkas');
    }
  },
};

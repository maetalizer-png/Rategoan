import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { store } from '../state/store.js';
import { workspace } from '../state/workspace.js';
import { chat } from '../chat/chat.js';
import { drawer } from './drawer.js';

function score(hay, needle) {
  const h = hay.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return 1;
  if (h.indexOf(n) >= 0) return 2;
  let i = 0;
  for (let c = 0; c < h.length && i < n.length; c += 1) if (h[c] === n[i]) i += 1;
  return i === n.length ? 1 : 0;
}

function commands() {
  const list = [
    { label: 'Buka Studio kode', run: () => router.go('studio') },
    { label: 'Buka Konektor', run: () => router.go('connect') },
    { label: 'Buka Pengaturan', run: () => router.go('settings') },
    { label: 'Buka Koleksi', run: () => router.go('collection') },
    { label: 'Buka Riwayat', run: () => router.go('chat') },
    { label: 'Buat Proyek Baru', run: () => router.go('project') },
    { label: 'Ganti ke Mode Penalaran Berpikir Keras', run: () => document.dispatchEvent(new CustomEvent('rategoan:command', { detail: 'think' })) },
    { label: 'Ganti Model ke Raget Neural', run: () => document.dispatchEvent(new CustomEvent('rategoan:command', { detail: 'neural' })) },
    { label: 'Buat Dokumen Word Baru', run: () => document.dispatchEvent(new CustomEvent('rategoan:command', { detail: 'docx' })) },
    { label: 'Buat Presentasi Baru', run: () => document.dispatchEvent(new CustomEvent('rategoan:command', { detail: 'slide' })) },
  ];
  workspace.list().forEach((project) => {
    list.push({
      label: 'Beralih ke Proyek: ' + project.name,
      run: () => {
        workspace.setCurrent(project.id);
        router.go('chat');
      },
    });
  });
  const sessions = (store.get().sessions || []).slice(-40);
  sessions.forEach((session) => {
    const title = (session.messages && session.messages[0] && session.messages[0].text) || 'Obrolan';
    list.push({
      label: 'Riwayat: ' + String(title).slice(0, 80),
      run: () => {
        store.set({ currentId: session.id });
        chat.renderMessages();
        router.go('chat');
      },
    });
  });
  return list;
}

export function mountCommandPalette() {
  const root = document.createElement('div');
  root.id = 'command-palette';
  root.hidden = true;
  root.innerHTML = '<div class="cmd-backdrop"></div><div class="cmd-panel" role="dialog" aria-label="Perintah"><input class="cmd-input" placeholder="Ketik perintah atau cari apa saja..." /><ul class="cmd-list"></ul></div>';
  document.body.appendChild(root);
  const input = root.querySelector('.cmd-input');
  const list = root.querySelector('.cmd-list');
  let items = [];
  let active = 0;
  const close = () => { root.hidden = true; };
  const paint = () => {
    const q = input.value;
    items = commands().map((item) => ({ item, rank: score(item.label, q) })).filter((row) => row.rank > 0).sort((a, b) => b.rank - a.rank).slice(0, 12);
    if (active >= items.length) active = 0;
    list.innerHTML = '';
    items.forEach((row, index) => {
      const li = document.createElement('li');
      li.textContent = row.item.label;
      if (index === active) li.className = 'on';
      li.onmousedown = (event) => {
        event.preventDefault();
        close();
        drawer.close();
        row.item.run();
      };
      list.appendChild(li);
    });
  };
  const open = () => {
    root.hidden = false;
    input.value = '';
    active = 0;
    paint();
    input.focus();
  };
  root.querySelector('.cmd-backdrop').onclick = close;
  input.oninput = () => { active = 0; paint(); };
  input.onkeydown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); active = Math.min(items.length - 1, active + 1); paint(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); active = Math.max(0, active - 1); paint(); }
    else if (event.key === 'Enter' && items[active]) { event.preventDefault(); const run = items[active].item.run; close(); drawer.close(); run(); }
    else if (event.key === 'Escape') close();
  };
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (root.hidden) open();
      else close();
    }
  });
  let touches = [];
  document.addEventListener('touchstart', (event) => { touches = Array.from(event.touches).map((t) => t.clientY); }, { passive: true });
  document.addEventListener('touchend', (event) => {
    if (touches.length < 2) return;
    const end = Array.from(event.changedTouches).map((t) => t.clientY);
    if (end.length && touches.every((y, i) => (end[i] || y) - y > 48)) open();
  }, { passive: true });
  return { open, close };
}

import { $ } from '../core/utils.js';
import { store } from '../core/store.js';
import { chat } from '../chat/chat.js';
import { drawer } from '../ui/drawer.js';

export const history = Object.freeze({
  init() {
    this.render();
    const search = $('history-search');
    if (search) search.addEventListener('input', () => this.filter(search.value));
  },
  render() {
    const list = $('history-list');
    const empty = $('history-empty');
    if (!list) return;
    list.innerHTML = '';
    const sessions = store.state.sessions || [];
    if (!sessions.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    let lastDate = null;
    sessions.forEach((s, i) => {
      const d = new Date(s.time).toLocaleDateString('id-ID');
      if (d !== lastDate) {
        const grp = document.createElement('li');
        grp.className = 'hist-group';
        grp.textContent = d;
        list.appendChild(grp);
        lastDate = d;
      }
      const li = document.createElement('li');
      li.className = 'hist-item' + (s.pinned ? ' pinned' : '');
      li.dataset.idx = i;
      li.innerHTML = '<span class="hist-title">' + (s.title || 'Chat baru') + '</span><span class="hist-meta">' + s.messages.length + ' pesan</span>';
      li.onclick = () => this.load(i);
      list.appendChild(li);
    });
  },
  filter(q) {
    const items = document.querySelectorAll('.hist-item');
    q = (q || '').toLowerCase();
    items.forEach(li => {
      const title = li.querySelector('.hist-title').textContent.toLowerCase();
      li.hidden = !title.includes(q);
    });
  },
  load(idx) {
    const sessions = store.state.sessions;
    if (!sessions[idx]) return;
    store.state.currentId = idx;
    chat.state.messages = sessions[idx].messages || [];
    chat.render();
    if (drawer.close) drawer.close();
    if (window.RG.router) window.RG.router.go('chat');
  },
  save(title) {
    const sessions = store.state.sessions;
    const current = sessions[store.state.currentId];
    if (current) {
      current.messages = chat.getMessages();
      if (title) current.title = title;
      current.time = Date.now();
    } else {
      sessions.unshift({
        title: title || 'Chat baru',
        messages: chat.getMessages(),
        time: Date.now(),
        pinned: false,
      });
      store.state.currentId = 0;
    }
    store.save();
    this.render();
  },
});

window.RG = window.RG || {};
window.RG.history = history;
